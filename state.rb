require 'securerandom'
require 'json'
require_relative 'play'

class State
  # state is one of: :joining, :passing, :playing, :over
  attr_reader :id, :state, :players, :plays, :tricks, :wish_rank, :turn, :scores, :out_order, :end_score

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

    begin
      json = JSON.parse(data)
      command = json['command']

      case state
      when :joining
        wat!(command, websocket)
      when :passing
        case command
        when 'back6'
          player.uncover_last_6!
          send_global_update
        when 'pass_cards'
          player.pass_cards!(json['pass_cards'])
          perform_passes! if players.all?(&:passed_cards?)
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

  def perform_passes!
    players.each_with_index do |player, i|
      player.cards_to_pass.each_with_index do |card, j|
        players[(i + j + 1) % 4].accept_card(card, from_player: player.id)
      end
    end

    start_round!
  end

  def start_round!
    @state = :playing
    @turn = players.find_index { |player| player.cards.find(&:sparrow?) }
    start_turn!
  end

  def start_turn!
    players.each_with_index do |player, index|
      possible_plays = if @turn == index
        Play.enumerate(player.hand, plays.last, wish_rank)
      else
        Play.enumerate_bombs(player.hand, plays.last)
      end
      player.set_possible_plays!(possible_plays)
    end
  end

  def make_play!(player_index, play)
    cards = Card.deserialize(play)
    play = players[player_index].find_play(cards)
    raise "invalid play" unless play
    players[player_index].make_play!(play)
    if players[player_index].hand.empty?
      @out_order << player_index
    end
    @plays << play.tag(player_index)
    if play.cards.include?(&:sparrow?)
      # TODO handle the wish. do we want to prompt the user or do we just require the wish to be sent with the play?
    end
    next_trick if play.is_a?(Dog)
    next_turn!(player_index, play.is_a?(Dog) ? 2 : 1)
  end

  def next_trick
    @tricks << plays
    @plays = []
  end

  def next_turn!(player_index, offset = 1)
    if round_over?
      finish_round!
    else
      if plays.last.is_a?(Pass)
        trick_winner_index = find_trick_winner
        if trick_winner_index
          # TODO need to figure out a way to put a couple seconds' delay here to give time for bombs
          # TODO TODO it's worse than that; if the winning trick has the dragon, we have to prompt that player
          players[trick_winner_index].take_trick!(plays)
          @turn = trick_winner_index
          skip_finished_players
          return
        end
      end

      @turn = (player_index + offset) % 4
      skip_finished_players
    end
  end

  def find_trick_winner
    # I am having trouble wrapping my brain around this, because some players may be out and may have gone out
    # before or during the last trick. This is "if the last N plays were passes, the trick winner is the player
    # who played the last non-Pass play". but what is N?


  end

  def skip_finished_players
    sanity_count = 0
    while players[@turn].hand.empty?
      @turn = (@turn + 1) % 4
      sanity_count += 1
      raise "all players are out; how did that happen?" if sanity_count == 4
    end
  end

  def round_over?
    out_order.size == 3 || one_two_finish?
  end

  def one_two_finish?
    out_order == [0, 2] || out_order == [2, 0] || out_order == [1, 3] || out_order == [3, 1]
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
    @plays = []
    @tricks = []
    @out_order = []
    @turn = nil
  end

  def finish_round!
    update_scores!
    if scores[0] != scores[1] && (scores[0] >= end_score || scores[1] >= end_score)
      @state = :over
    else
      init_round
    end
  end

  def update_scores!
    score_tichus!
    if one_two_finish?
      scores[out_order[0] % 2] += 200
    else
      # lol I haven't implemented trick-taking yet :P
    end
  end

  def score_tichus!
    players.each_with_index do |player, index|
      scores[index % 2] += player.tichu * ((index == out_order[0]) ? 1 : -1)
    end
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