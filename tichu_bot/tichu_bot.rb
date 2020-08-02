# this is a client that connects to the websocket endpoint and plays randomly,
# to facilitate testing

require 'json'
require 'websocket-eventmachine-client'
require 'active_support'
require 'active_support/core_ext'
require 'amazing_print'

URL = "ws://localhost:4567/connect?game_id=test&player_id=test"

def send_command(websocket, command, opts = {})
  h = { 'command' => command }.merge(opts)
  puts "sending ===>"
  ap h
  websocket.send(h.to_json)
end

EM.run do
  ws = WebSocket::EventMachine::Client.connect(uri: URL)
  condition = nil

  ws.onopen do
    puts "Connected"
  end

  ws.onclose do |code, reason|
    puts "Disconnected code=#{code} reason=#{reason}"
    exit
  end

  ws.onerror do |error|
    puts "Error: #{error}"
    exit
  end

  ws.onmessage do |msg, _type|
    data = JSON.parse(msg)

    if condition.is_a?(Proc)
      if condition.call(data) || data['state'] == 'over'
        condition = nil
      elsif data['error'].blank?
        puts "..."
        next
      end
    end

    puts "<=== received game state"
    ap data

    exit if data['error'].present?

    case data['state']
    when 'ready'
      if data['dealer'] == 0
        send_command(ws, 'deal')
        condition = ->(data) { data['state'] != 'ready' }
      end
    when 'passing'
      if data['players'][0]['hand_size'] == 8
        send_command(ws, 'back6')
        condition = ->(data) { data['players'][0]['hand_size'] == 14 }
      elsif !data['players'][0]['passed_cards']
        send_command(ws, 'pass_cards', cards: data['players'][0]['hand'][0..2])
        condition = ->(data) { !data['players'][0].key?('passed_cards') }
      end
    when 'playing'
      if data['turn'] == 0
        plays = data['players'][0]['possible_plays'].keys
        play = plays.sample
        wish_rank = play.include?('1') ? '7' : nil
        send_command(ws, 'play', cards: play, wish_rank: wish_rank)
        # don't hang if I dog it to myself
        condition = ->(data) { data['turn'] != 0 } unless play == '0' && data['players'][3]['hand_size'] == 0
      end
      if data['turn'] == nil && data['trick_winner'] == 0
        send_command(ws, 'claim', to_player: data['dragon_trick'] ? 1 : 0)
        condition = ->(data) { data['turn'] != nil }
      end
    when 'over'
      ws.close
    end
  end
end
