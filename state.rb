require 'securerandom'
require 'json'

class State
  # state is one of: :joining, :passing, :playing, :over
  attr_reader :id, :state, :players, :wish_rank, :turn, :scores, :end_score

  def initialize(end_score: 1000)
    @state = :joining
    @id = self.class.new_id
    @scores = [0, 0]
    @players = []
    @end_score = end_score
    @conns = {}
  end

  def add_player!(player)
    raise "game is full" if players.size == 4
    @players << player

    if players.size == 4
      init_round
    end

    send_global_update
  end

  def connect!(websocket, player_id = nil)
    @conns[websocket] = player_id
  end

  def disconnect!(websocket)
    @conns.delete(websocket)
  end

  def message(data, websocket, player_id)
    player_index = players.find_index { |player| player.id == player_id }
    return unless player_index # observers are read-only

    player = players[player_index]
    unless player
      STDERR.puts "bad player_id #{player_id} in message for game #{id}"
      return
    end

    json = JSON.parse(data)
    command = json['command']
    begin
      case state
      when :joining
        wat!(command, websocket)
      when :passing
        case command
        when 'back6'
          player.uncover_last_6!
          send_global_update
        when 'pass_cards'
          player.pass_cards!(json['pass'])
          send_global_update
        when 'grand_tichu'
          player.call_grand_tichu!
          send_global_update
        when 'tichu'
          player.call_tichu!
          send_global_update
        else
          wat!(command, websocket)
        end
      when :playing
        case command
        when 'tichu'
          player.call_tichu!
          send_global_update
        when 'play'
          make_play!(player_index, json['play'])
          send_global_update
        else
          wat!(command, websocket)
        end
      when :over
        wat!(command, websocket)
      end
    rescue => e
      websocket.send({error: e.message}.to_json)
    end

  end

  def wat!(command, websocket)
    websocket.send({error: "invalid command #{command} in state #{state}"}.to_json)
  end

  def make_play!(player_index, play)

  end

  def send_global_update
    @conns.each do |ws, player_id|
      ws.send to_h(for_player: player_id).to_json
    end
  end

  def init_round
    raise "not enough players" unless players.size == 4
    Deck.deal!(@players)
    @state = :passing
    @wish_rank = nil
    @turn = nil
  end

  def to_h(for_player: nil)
    h = {
      id: id,
      scores: scores,
      end_score: end_score,
      state: state,
      wish_rank: wish_rank,
      turn: turn ? players[turn].id : nil
    }
    h[:players] = if for_player
      # every player sees herself in the first slot
      rotate_players(for_player).map { |player| player.to_h(complete: player.id == for_player) },
    else
      # an observer sees things from the perspective of the player to start the game
      players.map { |player| player.to_h(complete: false) }
    end
    h
  end

  def rotate_players(for_player)
    ix = players.find_index { |p| p.id == for_player }
    raise "bad player id #{for_player}" unless ix
    players.rotate(ix)
  end

  def self.new_id
    # omit letters/numbers that are visually or aurally confusable
    %w(A C E F G H J K L M N P Q R T U W X Y Z 2 3 4 6 7 8 9).sample(5).join
  end
end