class Card
  # numeric values that will work in straights
  JACK = 11
  QUEEN = 12
  KING = 13
  ACE = 14
  # dragon is greater than ace but not adjacent to it (can't be part of a straight)
  # eh, make it 2 greater than ace so a phoenix can't be used to bridge that gap :P
  DRAGON = 17
  # these two are just weird, sry
  PHOENIX = -1
  DOG = -2

  attr_accessor :suit, :rank

  def initialize(suit, rank)
    @suit = suit
    @rank = rank
  end

  def self.matched_rank?(cards)
    cards.map(&:rank).uniq.size == 1
  end

  def self.matched_suit?(cards)
    cards.map(&:suit).uniq.size == 1
  end

  def self.sequence?(cards)
    cards.map(&:rank).sort.each_cons(2).all? { |pair| pair[0] + 1 == pair[1] }
  end

  def phoenix?
    unsubstituted_phoenix? || substituted_phoenix?
  end

  def unsubstituted_phoenix?
    @rank == PHOENIX
  end

  def substituted_phoenix?
    # real suits are 1-4, so a colorless rank card must be a phoenix
    @suit == 0 && @rank >= 2 && @rank <= ACE
  end
end