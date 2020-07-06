require_relative 'state'
require_relative 'card'

class Player
  attr_reader :name, :id, :token, :hand, :uncovered_last_six, :cards_to_pass, :possible_plays, :tricks, :plays, :tichu

  def initialize(name)
    @name = name
    @id = State.new_id
    @token = State.new_id
  end

  def assign_hand!(cards)
    @hand = cards
    @uncovered_last_six = false
    @cards_to_pass = {}
    @possible_plays = []
    @tricks = []
    @plays = []
    @tichu = 0
  end

  def to_h(complete: true)
    h = {
      id: id,
      name: name,
      hand_size: hand.size,
      tichu: tichu,
      points_taken: tricks.map(&:points).inject(:+),
      last_play: plays.last&.to_h
    }
    if complete
      h[:token] = token
      limit = uncovered_last_six ? -1 : 7
      h[:hand] = Card.serialize(hand[0..limit])
    end
    h
  end
end