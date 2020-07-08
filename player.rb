require_relative 'state'
require_relative 'card'

class Player
  attr_reader :name, :id, :token, :hand, :hidden_cards, :cards_to_pass, :possible_plays, :tricks, :plays, :tichu

  def initialize(name)
    @name = name
    @id = State.new_id
    @token = State.new_id
  end

  def assign_hand!(cards)
    @hand = cards[0..7]
    @hidden_cards = cards[8..-1]
    @cards_to_pass = []
    @possible_plays = {}
    @tricks = []
    @plays = []
    @tichu = 0
  end

  def accept_card(card, _from_player: nil)
    # eh, maybe someday I'll feel like tracking which card came from where?
    @hand << card
  end

  def set_possible_plays!(play_hash)
    @possible_plays = play_hash
  end

  def find_play(cards)
    possible_plays.find { |play| play.match?(cards) }
  end

  def to_h(complete: true)
    h = {
      id: id,
      name: name,
      hand_size: hand.size,
      tichu: tichu,
      points_taken: tricks.map(&:points).inject(:+),
      last_play: plays.last&.to_h,
      passed_cards: cards_to_pass.any?
    }
    if complete
      h[:token] = token
      h[:hand] = Card.serialize(hand)
      h[:possible_plays] = Play.serialize_plays(@possible_plays)
    end
    h
  end

  def uncover_last_6!
    raise "already uncovered last 6" if @hidden_cards.empty?
    @hand.concat(@hidden_cards)
    @hidden_cards = []
  end

  def passed_cards?
    !cards_to_pass.empty?
  end

  def pass_cards!(cards)
    raise "pass_cards! expected 3 cards" unless cards.size == 3
    cards = Card.deserialize(cards)
    remove_cards!(cards)
    @cards_to_pass = cards
  end

  def call_tichu!
    raise "you have already played a card" if plays.any?
    raise "you have already called tichu or grand tichu" if tichu != 0
    @tichu = 100
  end

  def call_grand_tichu!
    raise "you have seen all your cards" if hidden_cards.empty?
    raise "you have already called tichu or grand tichu" if tichu != 0
    @tichu = 200
  end

  def make_play!(play)
    remove_cards!(play.cards)
    @plays << play
  end

  def take_trick!(trick)
    @tricks << trick
  end

  def remove_cards!(cards)
    raise "you tried to use a card you don't have" unless (cards - hand).empty?
    @hand -= cards
    cards
  end
end
