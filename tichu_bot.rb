# this is a client that connects to the websocket endpoint and plays randomly,
# to facilitate testing

require 'json'
require 'websocket-eventmachine-client'
require 'active_support'
require 'active_support/core_ext'
require 'ap'

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
  end

  ws.onerror do |error|
    puts "Error: #{error}"
  end

  ws.onmessage do |msg, _type|
    data = JSON.parse(msg)

    if condition.is_a?(Proc)
      if condition.call(data)
        condition = nil
      else
        puts "..."
        next
      end
    end

    puts "<=== received game state"
    ap data

    break if data['error'].present?

    case data['state']
    when 'passing'
      if data['players'][0]['hand_size'] == 8
        send_command(ws, 'back6')
        condition = ->(data) { data['players'][0]['hand_size'] == 14 }
      elsif !data['players'][0]['passed_cards']
        send_command(ws, 'pass_cards', cards: data['players'][0]['hand'][0..2])
        condition = ->(data) { data['players'][0]['passed_cards'] == true }
      end
    when 'playing'
      if data['turn'] == 0
        plays = data['players'][0]['possible_plays']
        ap plays

      end
    when 'over'
      ws.close
    end
  end
end