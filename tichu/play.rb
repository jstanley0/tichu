require 'set'
require_relative 'card'

class Play
  attr_accessor :cards, :rank, :player_index

  def initialize(cards, rank = nil)
    @cards = cards
    @rank = rank
    @player_index = nil
  end

  def self.enumerate(hand, prev_play, wish_rank)
    plays = []
    [Pass, Dog, Single, Pair, Triple, Straight, Ladder, FullHouse, Bomb].each do |play_klass|
      plays.concat play_klass.enumerate(hand, prev_play)
    end

    if wish_rank
      if plays.any? { |play| play.fulfills_wish?(wish_rank) }
        plays = plays.select { |play| play.is_a?(Bomb) || play.fulfills_wish?(wish_rank) }
      end
    end

    plays
  end

  def self.enumerate_bombs(hand, prev_play)
    {'Bomb' => Bomb.enumerate(hand, prev_play)}
  end

  def tag(player_index)
    @player_index = player_index
    self
  end

  def eql?(rhs)
    hash == rhs.hash
  end

  def hash
    @hash ||= Card.hand_signature(cards)
  end

  def self.with_phoenix_substitution(hand)
    phoenix = hand.find(&:phoenix?)
    if phoenix
      (2..Card::ACE).each do |replacement_rank|
        phoenix.substitute!(replacement_rank)
        yield hand
      end
      phoenix.unsubstitute!
    else
      yield hand
    end
  end

  def type
    self.class.name
  end

  def size
    @cards.size
  end

  def points
    cards.map(&:points).inject(:+)
  end

  def match?(cards)
    hash == Card::hand_signature(cards)
  end

  def fulfills_wish?(wish_rank)
    # normal? precludes a phoenix from being required to support a wish
    cards.any? { |card| card.normal? && card.rank == wish_rank }
  end

  def to_h
    { cards: Card.serialize(cards), rank: rank }
  end

  def self.serialize_plays(enumerated_plays)
    enumerated_plays.transform_values { |play| play.to_h }
  end
end

class Pass < Play
  def self.enumerate(cards, prev_play)
    return [Pass.new([])] if prev_play
    return []
  end
end

class Dog < Play
  def self.enumerate(cards, prev_play)
    return [] if prev_play
    dogs = cards.select(&:dog?) # there's only one but a play has an array of cards so
    return [Dog.new(dogs)] if dogs.any?
    return []
  end
end

class Single < Play
  def self.enumerate(hand, prev_play)
    plays = []
    return plays unless prev_play.nil? || prev_play.is_a?(Single)
    hand.each do |card|
      next if card.dog?
      rank = if card.phoenix?
        if prev_play && prev_play.rank < Card::DRAGON
          prev_play.rank + 0.5
        else
          1.5
        end
      else
        card.rank
      end
      next if prev_play && prev_play.rank >= rank
      plays << Single.new([card], rank)
    end
    plays
  end
end

class Pair < Play
  def self.enumerate(h, prev_play)
    return [] unless prev_play.nil? || prev_play.is_a?(Pair)
    return [] unless h.size >= 2
    plays = Set.new
    with_phoenix_substitution(h) do |hand|
      Card.groups(hand, 2).each do |cards|
        rank = cards[0].rank
        next if prev_play && prev_play.rank >= rank
        plays << Pair.new(cards, rank)
      end
    end
    plays.to_a
  end
end

class Triple < Play
  def self.enumerate(h, prev_play)
    return [] unless prev_play.nil? || prev_play.is_a?(Triple)
    return [] unless h.size >= 3
    plays = Set.new
    with_phoenix_substitution(h) do |hand|
      Card.groups(hand, 3).each do |cards|
        rank = cards[0].rank
        next if prev_play && prev_play.rank >= rank
        plays << Triple.new(cards, rank)
      end
    end
    plays.to_a
  end
end

class Straight < Play
  def self.enumerate(h, prev_play)
    return [] unless prev_play.nil? || prev_play.is_a?(Straight)
    return [] unless h.size >= 5
    plays = Set.new
    min_size = prev_play&.size || 5
    max_size = prev_play&.size || 14
    with_phoenix_substitution(h) do |hand|
      Card.sequences(hand, min_size, max_size).each do |cards|
        rank = cards[-1].rank
        next if prev_play && prev_play.rank >= rank
        next if cards.map(&:suit).uniq.size == 1  # bombs don't count here
        plays << Straight.new(cards, rank)
      end
    end
    plays.to_a
  end
end

class Ladder < Play
  def self.enumerate(h, prev_play)
    return [] unless prev_play.nil? || prev_play.is_a?(Ladder)
    return [] unless h.size >= 4
    plays = Set.new
    min_size = prev_play&.size || 4
    max_size = prev_play&.size || 14
    with_phoenix_substitution(h) do |hand|
      pairs = Card.groups(hand, 2)
      ranks = pairs.map { |cards| cards[0] }.uniq(&:rank)
      Card.sequences(ranks, min_size / 2, max_size / 2).each do |half_ladder|
        ladder_groups = half_ladder.map { |card| pairs.select { |p| p[0].rank == card.rank } }
        first_group = ladder_groups.shift
        first_group.product(*ladder_groups).map(&:flatten).each do |ladder|
          rank = ladder[-1].rank
          plays << Ladder.new(ladder, rank) unless prev_play && prev_play.rank >= rank
        end
      end
    end
    plays.to_a
  end
end

class FullHouse < Play
  def self.enumerate(h, prev_play)
    return [] unless prev_play.nil? || prev_play.is_a?(FullHouse)
    return [] unless h.size >= 5
    plays = Set.new
    with_phoenix_substitution(h) do |hand|
      trips = Card.groups(hand, 3)
      pairs = Card.groups(hand, 2)
      combos = trips.product(pairs).reject { |combo| combo[0][0].rank == combo[1][0].rank }
      combos.each do |combo|
        rank = combo[0][0].rank
        next if prev_play && prev_play.rank >= rank
        # when making a full house out of two pairs plus a phoenix, use the phoenix with the higher rank
        if combo[0].any?(&:substituted_phoenix?)
          next if rank < combo[1][0].rank
        end
        plays << FullHouse.new(combo.flatten, rank)
      end
    end
    plays.to_a
  end
end

class Bomb < Play
  def self.enumerate(hand, prev_play)
    plays = []
    prev_bomb = prev_play&.is_a?(Bomb) && prev_play
    Card.groups(hand, 4).each do |cards|
      rank = cards[0].rank
      next if prev_bomb && prev_bomb.rank >= rank
      plays << Bomb.new(cards, rank)
    end
    Card.flush_sequences(hand, 5, 14).each do |cards|
      rank = cards.size * 100 + cards[-1].rank
      next if prev_bomb && prev_bomb.rank >= rank
      plays << Bomb.new(cards, rank)
    end
    plays
  end
end
