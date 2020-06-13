require_relative 'card'

class Play
  attr_accessor :cards, :rank

  def initialize(cards, rank)
    @cards = cards
    @rank = rank
  end

  def self.identify(cards, prev_play)
    if cards.size == 1
      # phoenix is not used as a wildcard
      play = identify_single(cards, prev_play)
      return play if play
    else
      pindex = cards.index { |c| c.unsubstituted_phoenix? }
      if pindex
        # try wildcard substitutions
        sub_cards = cards.dup
        (2..Card::ACE).reverse_each do |rank|
          sub_cards[pindex].rank = rank
          play = identify_multi(sub_cards, prev_play)
          return play if play
        end
      else
        # no phoenix present
        play = identify_multi(cards, prev_play)
        return play if play
      end
    end
  end

  def type
    self.class_name
  end

  def size
    @cards.size
  end


  private

  def identify_single(cards, prev_play)
    Dog.build(cards, prev_play) ||
      Single.build(cards, prev_play)
  end

  def identify_multi(cards, prev_play)
    Bomb.build(cards, prev_play) ||
      Pair.build(cards, prev_play) ||
      Triple.build(cards, prev_play) ||
      Straight.build(cards, prev_play) ||
      Ladder.build(cards, prev_play) ||
      FullHouse.build(cards, prev_play)
  end

end

class Dog < Play
  def self.build(cards, prev_play)
    return unless cards.size == 1 && cards[0].rank == Card::DOG && prev_play.nil?
    Dog.new(cards, Card::DOG)
  end
end

# since the phoenix behaves oddly with singles, provide it unsubstituted to this matcher
class Single < Play
  def self.build(cards, prev_play)
    return unless cards.size == 1
    return if cards[0].substituted_phoenix?

    rank = cards[0].rank
    return if rank == Card::DOG

    if prev_play
      return unless prev_play.is_a?(Single)
      if rank == Card::PHOENIX
        return if prev_play.rank == Card::DRAGON
        rank = prev_play.rank + 0.5
      else
        return unless rank > prev_play.rank
      end
    else
      if rank == Card::PHOENIX
        rank = 1.5
      end
    end

    Single.new(cards, rank)
  end

end

# to simplify logic, the following matchers do not expect to see an unsubstituted phoenix
# you need to try with each possible wildcard substitution, because I am lazy

class Pair < Play
  def self.build(cards, prev_play)
    return unless cards.size == 2 && Card::matched_rank?(cards)
    rank = cards[0].rank

    if prev_play
      return unless prev_play.is_a?(Pair)
      return unless rank > prev_play.rank
    end

    Pair.new(cards, rank)
  end

end

class Triple < Play
  def self.build(cards, prev_play)
    return unless cards.size == 3 && Card::matched_rank?(cards)
    rank = cards[0].rank

    if prev_play
      return unless prev_play.is_a?(Triple)
      return unless rank > prev_play.rank
    end

    Triple.new(cards, rank)
  end

end

class Straight < Play
  def self.build(cards, prev_play)
    return unless cards.size >= 5 && Card::sequence?(cards)
    rank = cards.map(&:rank).max

    if prev_play
      return unless prev_play.is_a?(Straight)
      return unless cards.size == prev_play.size
      return unless rank > prev_play.rank
    end

    Straight.new(cards.sort_by(&:rank), rank)
  end

end

class Ladder < Play
  def self.build(cards, prev_play)
    return unless cards.size.even? && cards.size >= 4
    unique_rank_cards = cards.uniq(&:rank)
    return unless unique_rank_cards.size == cards.size / 2
    return unless Card::sequence?(unique_rank_cards)

    rank = cards.map(&:rank).max
    if prev_play
      return unless prev_play.is_a?(Ladder)
      return unless prev_play.size == cards.size
      return unless rank > prev_play.rank
    end

    Ladder.new(cards.sort_by(&:rank), rank)
  end

end

class FullHouse < Play
  def self.build(cards, prev_play)
    return unless cards.size == 5
    # groups = e.g. [[3G, 3B], [5R, 5G, 5B]]
    groups = cards.group_by(&:rank).values.sort_by(&:size)
    return unless groups.size == 2 && groups[0].size == 2
    rank = groups[1][0].rank
    if prev_play
      return unless prev_play.is_a?(FullHouse)
      return unless rank > prev_play.rank
    end

    FullHouse.new(groups[1] + groups[0], rank)
  end

end

class Bomb < Play
  def self.match?(cards)
    return unless cards.size >= 4
    return if cards.any? { |card| card.phoenix? }
    if Card::sequence?(cards)
      return unless cards.size >= 5
      return unless Card::matched_suit?(cards)
    else
      return unless Card::matched_rank?(cards)
    end
    rank = cards.size * 100 + cards.map(&:rank).max
    if prev_play
      return if prev_play.is_a?(Bomb) && rank <= prev_play.rank
    end

    Bomb.new(cards.sort_by(&:rank), rank)
  end

end