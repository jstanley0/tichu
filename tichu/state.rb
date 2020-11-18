require 'securerandom'
require 'json'
require_relative 'play'
require_relative 'deck'
require_relative 'card'
require_relative 'error'

class State
  # state is one of: :joining, :ready, :passing, :playing, :over
  attr_reader :id, :state, :players, :plays, :wish_rank, :turn, :scores,
              :out_order, :end_score, :trick_winner, :dragon_trick, :log

  def initialize(end_score: 1000, id: nil)
    @state = :joining
    @id = id || self.class.new_id
    @scores = [0, 0]
    @players = []
    @end_score = end_score
    @conns = {}
    @log = []
  end

  def add_player!(player)
    raise TichuError, "game is full" if players.size == 4
    @players << player
    add_action(player, "joined")

    if players.size == 4
      rotate_teams!(rand(3))
      @state = :ready
    end
  end

  PlayerInfo = Struct.new(:player_id, :next_message)
  LogEntry = Struct.new(:text, :cards, :player_id, :actor_id)

  def connect!(websocket, player_id = nil)
    info = PlayerInfo.new(player_id, 0)
    @conns[websocket] = info
    websocket.send to_h(player_info: info).to_json
  end

  def disconnect!(websocket)
    player_id = @conns[websocket].player_id
    @conns.delete(websocket)
    send_global_update if player_id.present?
  end

  def any_connections?
    @conns.any?
  end

  def message(data, websocket, player_id)
    return if data == 'ping' # KeepAlive

    player_id ||= @conns[websocket]&.player_id
    player_index = players.find_index { |player| player.id == player_id }
    return observer_message(data, websocket) unless player_index

    player = players[player_index]
    unless player
      STDERR.puts "bad player_id #{player_id} in message for game #{id}"
      return
    end

    begin
      json = JSON.parse(data)
      command = json['command']

      case state
      when :ready
        # the VIP chooses teams and starts the round
        if command == 'rotate_teams' && player_index == 0
          rotate_teams!
          send_global_update
        elsif command == 'deal' && player_index == 0
          init_round
          send_global_update
        else
          wat!(command, websocket)
        end
      when :passing
        case command
        when 'back6'
          player.uncover_last_6!
          #add_action(player, "took remaining cards")
          send_global_update
        when 'pass_cards'
          player.pass_cards!(json['cards'])
          #add_action(player, "passed cards")
          perform_passes! if players.all?(&:passed_cards?)
          send_global_update
        when 'grand_tichu'
          player.call_grand_tichu!
          add_action(player, "called Grand Tichu! 💥")
          send_global_update
        when 'tichu'
          player.call_tichu!
          add_action(player, "called Tichu! 🎉")
          send_global_update
        else
          wat!(command, websocket)
        end
      when :playing
        case command
        when 'tichu'
          player.call_tichu!
          add_action(player, "called Tichu! 🎉")
          send_global_update
        when 'claim'
          claim_trick!(player_index, json['to_player'])
          send_global_update
        when 'play'
          make_play!(player_index, json['cards'], json['wish_rank'])
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

  def observer_message(data, websocket)
    begin
      json = JSON.parse(data)
      command = json['command']
      if command == 'join' && state != :over
        if game_full?
          send_update(websocket, "game is full")
        elsif json['name'].blank?
          send_update(websocket, "must provide name when joining")
        else
          join_game!(json['name'], websocket)
        end
      else
        wat!(command, websocket)
      end
    rescue => e
      STDERR.puts e.inspect
      STDERR.puts e.backtrace
      send_global_update("something bad happened :(")
    end
  end

  def wat!(command, websocket)
    send_update(websocket, "invalid command #{command} in state #{state}")
  end

  def connected_player_ids
    @conns.values.map { |pi| pi.player_id }.compact.uniq
  end

  def game_full?
    connected_player_ids.size == 4
  end

  def join_game!(name, websocket)
    if players.size < 4
      # new player
      player = Player.new(name)
      @conns[websocket] = PlayerInfo.new(player.id, @log.size)
      add_player!(player)
      send_global_update(new_player_id: player.id)
    else
      # replace a player who left the game
      conn_ids = connected_player_ids
      players.each do |player|
        unless conn_ids.include?(player.id)
          old_name = player.name
          player.rename!(name)
          @conns[websocket] = PlayerInfo.new(player.id, @log.size)
          add_action(player, "stepped in for " + old_name)
          send_global_update(new_player_id: player.id)
          return
        end
      end
      send_update(websocket, "somebody apparently beat you to the punch, sry")
    end
  end

  def rotate_teams!(amount = -1)
    @index = nil
    @players = [players[0]] + players[1..3].rotate(amount)
  end

  def perform_passes!
    players.each_with_index do |player, i|
      player.cards_to_pass.each_with_index do |card, j|
        players[(i + j + 1) % 4].accept_card(card, from_player: player.id)
      end
      add_status("You passed", recipient_id: player.id, cards: Card.serialize(player.cards_to_pass, sorted: false))
      player.done_passing_cards!
    end

    players.each_with_index do |player, i|
      passed_cards = player.hand[-3..-1].rotate(i)
      add_status("You received", recipient_id: player.id, cards: Card.serialize(passed_cards, sorted: false))
    end

    start_round!
  end

  def start_round!
    @state = :playing
    @turn = players.find_index { |player| player.hand.find(&:sparrow?) }
    players.each do |player|
      if player.id == players[@turn].id
        add_status("You have the sparrow", recipient_id: player.id)
      else
        add_action(players[@turn], "has the sparrow", recipient_id: player.id)
      end
    end
    start_turn!
  end

  def start_turn!
    last_frd_play = plays.last
    loop do
      if last_frd_play&.player_index == @turn
        # if a player is in the position of playing over her own play, then she's winning the trick...
        # now we wait for her to claim the trick, or for someone to bomb it
        @trick_winner = @turn
        add_action(players[@turn], "is winning the trick")
        @dragon_trick = last_frd_play.cards.any?(&:dragon?)
        @turn = :limbo
        break
      else
        # if the player has gone out, proceed to the next player
        break if players[@turn].hand.any?
        @turn = (@turn + 1) % 4
      end
    end

    players.each_with_index do |player, index|
      possible_plays = if @turn == index
        Play.enumerate(player.hand, plays.last, wish_rank)
      elsif plays.last
        Bomb.enumerate(player.hand, plays.last)
      else
        []
      end
      player.set_possible_plays!(possible_plays)
    end
  end

  def make_play!(player_index, play, wished_rank)
    cards = Card.deserialize(play)
    play = players[player_index].find_play(cards)
    raise TichuError, "invalid play" unless play
    raise TichuError, "Slow down, cowboy! Your partner just played a bomb!" if simulbombing_partner?(player_index, play)
    players[player_index].make_play!(play)
    if play.is_a?(Pass)
      add_action(players[player_index], "passed")
    else
      add_action(players[player_index], plays.none? ? 'led' : (play.is_a?(Bomb) ? 'bombed 💣' : 'played'), cards: play.to_s(sorted: false))
      @plays << play.tag(player_index)
    end
    if players[player_index].hand.empty?
      add_action(players[player_index], "has gone out")
      set_tichu_statuses!(player_index) if @out_order.empty?
      @out_order << player_index
    end

    if play.cards.any?(&:sparrow?) && wished_rank && !wished_rank.empty?
      chosen_rank = Card.rank_from_string(wished_rank)
      raise TichuError, "invalid wished_rank #{wished_rank}" if !chosen_rank || chosen_rank < 2 || chosen_rank > Card::ACE
      @wish_rank = chosen_rank
      add_action(players[player_index], "wishes for #{wished_rank}")
    elsif wish_rank
      if play.fulfills_wish?(@wish_rank)
        add_action(players[player_index], "fulfilled the wish for #{Card.rank_string(wish_rank)}")
        @wish_rank = nil
      end
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
    recipient_index = (claiming_player_index + give_to_player_index) % 4
    players[recipient_index].take_trick!(plays)
    trick_msg = (recipient_index == claiming_player_index) ? "took the trick" : "gave the trick to #{players[recipient_index].name}"
    add_action(players[claiming_player_index], trick_msg)
    next_trick
    @turn = claiming_player_index
    start_turn!
  end

  def clear_trick_winner
    @trick_winner = nil
    @dragon_trick = false
  end

  def next_trick
    clear_trick_winner
    @plays = []
  end

  def next_turn!(player_index, offset = 1)
    if round_over?
      # handle awarding the last trick after the third player goes out, if there is one (if they went out on a dog, there isn't)
      if plays.any? && out_order.size == 3 && out_order[-1] == player_index
        trick_taker = if plays.last.cards.any?(&:dragon?)
          ([0, 1, 2, 3] - out_order)[0] # give the trick to the player who didn't go out
        else
          player_index
        end
        players[trick_taker].take_trick!(plays)
      end
      finish_round!
    else
      @turn = (player_index + offset) % 4
      clear_trick_winner # do this here in addition to next_trick so bombing a winning trick clears this state
      start_turn!
    end
  end

  def round_over?
    out_order.size == 3 || one_two_finish?
  end

  def one_two_finish?
    out_order == [0, 2] || out_order == [2, 0] || out_order == [1, 3] || out_order == [3, 1]
  end

  def simulbombing_partner?(player_index, play)
    return false unless play.is_a?(Bomb)
    last_play = @plays&.last
    last_play.is_a?(Bomb) && last_play.player_index == (player_index + 2) % 4 && Time.now - last_play.ts < 3
  end

  def send_global_update(error = nil, new_player_id: nil)
    @conns.each do |ws, info|
      h = to_h(player_info: info, include_player_id: new_player_id == info.player_id)
      h.merge!(error: error) if error
      ws.send h.to_json
    end
  end

  def send_update(websocket, error = nil)
    h = to_h(player_info: @conns[websocket])
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
    add_status "Starting round!"
  end

  def finish_round!
    old_scores = scores.dup
    update_scores!
    add_status "Round complete! #{team_name(0)}: #{scores[0] - old_scores[0]}  ---  #{team_name(1)}: #{scores[1] - old_scores[1]}"
    players.each do |player|
      add_status "#{player.name}'s unplayed cards were", cards: Card.serialize(player.hand, sorted: true) unless player.hand.empty?
    end

    if scores[0] != scores[1] && (scores[0] >= end_score || scores[1] >= end_score)
      @state = :over
      add_status "Game over! #{team_name(scores[0] > scores[1] ? 0 : 1)} win! Final score: #{scores.max} to #{scores.min}"
    else
      init_round
    end
  end

  SUCCESS_MESSAGES = ['successfully completed a %s', 'somehow pulled that one off', 'bagged a %s', "showed everyone how it's done"].freeze
  FAILURE_MESSAGES = ['failed to complete the %s', 'totally botched that %s', 'FAIL', 'pulled a Clay', ':sadtrombone:'].freeze
  def tichu_message(success, grand)
    (success ? SUCCESS_MESSAGES : FAILURE_MESSAGES).sample % (grand ? 'Grand Tichu' : 'Tichu')
  end

  def set_tichu_statuses!(winning_player_index)
    players.each_with_index do |player, index|
      if player.tichu > 0
        success = (index == winning_player_index)
        add_action(player, tichu_message(success, player.tichu == 200))
        player.set_tichu_status(success)
      end
    end
  end

  def update_scores!
    score_tichus!
    if one_two_finish?
      scores[out_order[0] % 2] += 200
    else
      loser_index = [0, 1, 2, 3] - out_order
      raise "there can be only one loser" unless loser_index.size == 1
      loser_index = loser_index[0]

      old_total = scores[0] + scores[1]
      players.each_index do |i|
        trick_points = players[i].points
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

  def to_h(player_info: nil, include_player_id: false)
    {
      id: id,
      scores: rotate_scores(player_info.player_id),
      players: rotate_players(player_info.player_id).map { |player| player.to_h(complete: player.id == player_info.player_id, connected: connected_player_ids.include?(player.id)) },
      end_score: end_score,
      state: state,
      wish_rank: Card.rank_string(wish_rank),
      turn: turn.is_a?(Numeric) ? rotate_index(turn, player_info.player_id) : nil,
      trick_winner: trick_winner ? rotate_index(trick_winner, player_info.player_id) : nil,
      dragon_trick: dragon_trick,
      log: pending_messages(player_info),
      last_play: last_play(player_info.player_id),
      can_join: player_info.player_id.nil? && !game_full?
    }.tap do |h|
      h[:player_id] = player_info.player_id if include_player_id
      h[:dealer] = rotate_index(0, player_info.player_id) if state == :ready
    end
  end

  def add_status(message, cards: nil, recipient_id: nil)
    @log << LogEntry.new(message, cards, recipient_id, nil)
  end

  def add_action(player, action, cards: nil, recipient_id: nil)
    action_str = "#{player.name} #{action}"
    @log << LogEntry.new(action_str, cards, recipient_id, player.id)
  end

  def pending_messages(player_info)
    messages = @log[player_info.next_message..-1]
    player_info.next_message = @log.size
    messages.select! { |message| message.player_id.nil? || message.player_id == player_info.player_id }
    messages.map do |message|
      h = { text: message.text }
      h[:cards] = message.cards if message.cards.present?
      h[:pi] = rotate_index(player_index(message.actor_id), player_info.player_id) if message.actor_id
      h
    end
  end

  def team_name(index)
    raise "invalid team index" unless [0, 1].include?(index)
    "#{players[index].name}/#{players[index + 2].name}"
  end

  def rotate_players(for_player)
    players.rotate(player_index(for_player))
  end

  def rotate_scores(for_player)
    scores.rotate(player_index(for_player) % 2)
  end

  def rotate_index(index, for_player)
    (index - player_index(for_player)) % 4
  end

  def last_play(for_player)
    play = plays&.last
    return nil unless play
    h = { type: play.type, ts: play.ts.to_f, cards: play.to_s(sorted: true) }
    if play.player_index
      h.merge!(player: rotate_index(play.player_index, for_player))
    end
    h
  end

  def player_index(for_player)
    return 0 unless for_player
    @index ||= {}
    @index[for_player] ||= players.find_index { |player| player.id == for_player }
    @index[for_player]
  end

  def self.new_id
    # omit letters/numbers that are visually or aurally confusable
    %w(A C E F G H J K L M N P Q R T U W X Y Z 2 3 4 6 7 8 9).sample(5).join
  end
end
