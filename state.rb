require 'securerandom'
require 'json'
require_relative 'play'
require_relative 'deck'
require_relative 'card'
require_relative 'error'

class State
  # state is one of: :joining, :passing, :playing, :over
  attr_reader :id, :state, :players, :plays, :tricks, :wish_rank, :turn,
              :scores, :out_order, :end_score, :trick_winner, :dragon_trick

  def initialize(end_score: 1000)
    @state = :joining
    @id = self.class.new_id
    @scores = [0, 0]
    @players = []
    @end_score = end_score
    @conns = {}
  end

  def add_player!(player)
    raise TichuError, "game is full" if players.size == 4
    @players << player

    if players.size == 4
      init_round
    end

    send_global_update
  end

  def connect!(websocket, player_id = nil)
    @conns[websocket] = player_id
    websocket.send to_h(for_player: player_id).to_json
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
          player.pass_cards!(json['cards'])
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
        when 'claim_trick'
          claim_trick!(player_index, json['to_player'])
        when 'play'
          make_play!(player_index, json['cards'], json['wished_rank'])
          send_global_update
        else
          wat!(command, websocket)
        end
      when :over
        wat!(command, websocket)
      end
    rescue TichuError => e
      send_update(websocket, e.message)
    rescue => e
      STDERR.puts e.inspect
      STDERR.puts e.backtrace
      send_global_update("something bad happened :(")
    end
  end

  def wat!(command, websocket)
    send_update(websocket, "invalid command #{command} in state #{state}")
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
    @turn = players.find_index { |player| player.hand.find(&:sparrow?) }
    start_turn!
  end

  def start_turn!
    last_frd_play = plays.reverse_each.find { |play| !play.is_a?(Pass) }
    loop do
      if last_frd_play&.player_index == @turn
        # if a player is in the position of playing over her own play, then she's winning the trick...
        # now we wait for her to claim the trick, or for someone to bomb it
        @trick_winner = @turn
        @dragon_trick = last_frd_play.cards.any?(&:dragon?)
        @turn = :limbo
      else
        # if the player has gone out, proceed to the next player
        break if players[@turn].hand.any?
        @turn = (@turn + 1) % 4
      end
    end

    players.each_with_index do |player, index|
      possible_plays = if @turn == index
        Play.enumerate(player.hand, plays.last, wish_rank)
      else
        Play.enumerate_bombs(player.hand, plays.last)
      end
      player.set_possible_plays!(possible_plays)
    end
  end

  def make_play!(player_index, play, wished_rank)
    cards = Card.deserialize(play)
    play = players[player_index].find_play(cards)
    raise TichuError, "invalid play" unless play
    players[player_index].make_play!(play)
    if players[player_index].hand.empty?
      @out_order << player_index
    end
    @plays << play.tag(player_index)

    if play.cards.any?(&:sparrow?) && wished_rank && !wished_rank.empty?
      chosen_rank = Card.rank_from_string(wished_rank)
      raise TichuError, "invalid wished_rank #{wished_rank}" if !chosen_rank || chosen_rank < 2 || chosen_rank > Card::ACE
      @wish_rank = chosen_rank
    elsif wish_rank
      @wish_rank = nil if play.fulfills_wish?(@wish_rank)
    end

    next_trick if play.is_a?(Dog)
    next_turn!(player_index, play.is_a?(Dog) ? 2 : 1)
  end

  def claim_trick!(claiming_player_index, give_to_player_index = 0)
    raise TichuError, "you didn't win the trick" if claiming_player_index != trick_winner
    if dragon_trick
      raise TichuError, "you have to give away the trick" unless [1, 3].include?(give_to_player_index)
    else
      raise TichuError, "you can't give away the trick" unless give_to_player_index == 0
    end
    players[(claiming_player_index + give_to_player_index) % 4].take_trick!(plays)
    next_trick
    @turn = claiming_player_index
    start_turn!
  end

  def next_trick
    @tricks << plays
    @plays = []
    @trick_winner = nil
    @dragon_trick = false
  end

  def next_turn!(player_index, offset = 1)
    if round_over?
      finish_round!
    else
      @turn = (player_index + offset) % 4
      start_turn!
    end
  end
  def round_over?
    out_order.size == 3 || one_two_finish?
  end

  def one_two_finish?
    out_order == [0, 2] || out_order == [2, 0] || out_order == [1, 3] || out_order == [3, 1]
  end

  def send_global_update(error = nil)
    @conns.each do |ws, player_id|
      h = to_h(for_player: player_id)
      h.merge!(error: error) if error
      ws.send h.to_json
    end
  end

  def send_update(websocket, error = nil)
    h = to_h(for_player: @conns[websocket])
    h.merge!(error: error) if error
    websocket.send h.to_json
  end

  def init_round
    raise TichuError, "not enough players" unless players.size == 4
    Deck.deal!(@players)
    @state = :passing
    @wish_rank = nil
    @plays = []
    @tricks = []
    @out_order = []
    @trick_winner = nil
    @dragon_trick = false
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
      loser_index = [0, 1, 2, 3] - out_order
      raise "there can be only one loser" unless loser_index.size == 1

      old_total = scores[0] + scores[1]
      players.each_index do |i|
        trick_points = players[i].tricks.map(&:points).inject(:+)
        if i == loser_index
          # tricks go to whoever went out first
          scores[out_order[0] % 2] += trick_points

          # the hand goes to the opponents
          scores[(i + 1) % 2] += players[i].hand.map(&:points).inject(:+)
        else
          raise "a non-losing player's hand should be empty at this point" unless players[i].hand.empty?
          scores[i % 2] += trick_points
        end
      end
      new_total = scores[0] + scores[1]
      raise "apparently I can't count" unless new_total == old_total + 100
    end
  end

  def score_tichus!
    players.each_with_index do |player, index|
      scores[index % 2] += player.tichu * ((index == out_order[0]) ? 1 : -1)
    end
  end

  def to_h(for_player: nil)
    {
      id: id,
      scores: rotate_scores(for_player),
      players: rotate_players(for_player).map { |player| player.to_h(complete: player.id == for_player) },
      end_score: end_score,
      state: state,
      wish_rank: Card.rank_string(wish_rank),
      turn: turn.is_a?(Numeric) ? players[turn].id : nil,
      trick_winner: trick_winner ? players[trick_winner].id : nil,
      dragon_trick: dragon_trick
    }
  end

  def rotate_players(for_player)
    players.rotate(player_index(for_player))
  end

  def rotate_scores(for_player)
    scores.rotate(player_index(for_player) % 2)
  end

  def player_index(for_player)
    players.find_index { |p| p.id == for_player } || 0
  end

  def self.new_id
    # omit letters/numbers that are visually or aurally confusable
    %w(A C E F G H J K L M N P Q R T U W X Y Z 2 3 4 6 7 8 9).sample(5).join
  end
end
