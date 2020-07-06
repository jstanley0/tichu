require 'securerandom'

class State
  attr_reader :id, :passing_cards, :players, :wish_rank, :turn, :scores

  def initialize
    @id = self.class.new_id
    @scores = [0, 0]
    @players = []
  end

  def add_player!(player)
    raise "game is full" if players.size == 4
    @players << player
  end

  def init_round
    raise "not enough players" unless players.size == 4
    @passing_cards = true
    @wish_rank = nil
  end

  def to_h(for_player: nil)
    h = {
      id: id,
      scores: scores,
      passing_cards: passing_cards,
      wish_rank: wish_rank,
      turn: turn,
      audience_size: watchers.size
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