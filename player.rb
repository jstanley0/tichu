require 'byebug'
require_relative 'state'
require_relative 'card'
require_relative 'error'

class Player
  attr_reader :name, :id, :hand, :hidden_cards, :cards_to_pass, :possible_plays, :tricks, :plays, :tichu

  def initialize(name)
    @name = name
    @id = State.new_id
    reset_state!
  end

  def assign_hand!(cards)
    reset_state!
    @hand = cards[0..7]
    @hidden_cards = cards[8..-1]
  end

  def reset_state!
    @hand = []
    @hidden_cards = []
    @cards_to_pass = []
    @cards_to_pass = []
    @possible_plays = {}
    @tricks = []
    @plays = []
    @tichu = 0
  end

  def accept_card(card, from_player: nil)
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
      name: name,
      hand_size: hand.size,
      tichu: tichu,
      points_taken: tricks.map(&:points).inject(:+) || 0,
      passed_cards: cards_to_pass.any?
    }
    if complete
      h[:hand] = Card.serialize(hand)
      h[:can_tichu] = can_call_tichu?
      h[:can_gt] = can_call_grand_tichu?
      h[:possible_plays] = Play.serialize_plays(@possible_plays)
    end
    h
  end

  def uncover_last_6!
    raise TichuError, "already uncovered last 6" if @hidden_cards.empty?
    @hand.concat(@hidden_cards)
    @hidden_cards = []
  end

  def passed_cards?
    !cards_to_pass.empty?
  end

  def pass_cards!(cards)
    raise TichuError, "pass_cards! expected 3 cards" unless cards&.size == 3
    raise TichuError, "must uncover cards first" unless @hidden_cards.empty?
    cards = Card.deserialize(cards)
    remove_cards!(cards)
    @cards_to_pass = cards
  end

  def can_call_tichu?
    hand.size == 14 && tichu == 0 && hidden_cards.size == 0 && plays.empty?
  end

  def call_tichu!
    raise TichuError, "can't call tichu" unless can_call_tichu?
    @tichu = 100
  end

  def can_call_grand_tichu?
    hand.size <= 8 && hidden_cards.size >= 6
  end

  def call_grand_tichu!
    raise TichuError, "can't call grand tichu" unless can_call_grand_tichu?
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
    raise TichuError, "you tried to use a card more than once" unless cards.uniq.size == cards.size
    raise TichuError, "you tried to use a card you don't have" unless (cards - hand).empty?
    @hand -= cards
    cards
  end
end
