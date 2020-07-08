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
    @possible_plays = {}
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
      last_play: plays.last&.to_h,
      passed_cards: !cards_to_pass.empty?
    }
    if complete
      h[:token] = token
      limit = uncovered_last_six ? -1 : 7
      h[:hand] = Card.serialize(hand[0..limit])
      h[:possible_plays] = Play.serialize_plays(@possible_plays)
    end
    h
  end

  def uncover_last_6!
    raise "already uncovered last 6" if uncovered_last_six
    @uncovered_last_six = true
  end

  def pass_cards!(cards_to_pass)

  end

  def call_tichu!
    raise "you have already played a card" if plays.any?
    raise "you have already called tichu or grand tichu" if tichu != 0
    @tichu = 100
  end

  def call_grand_tichu!
    raise "you have seen all your cards" if uncovered_last_six
    raise "you have already called tichu or grand tichu" if tichu != 0
    @tichu = 200
  end

  def make_play!(play)

  end
end
