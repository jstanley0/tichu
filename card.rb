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

  # return each group of size having matched rank
  def self.groups(hand, size)

  end

  # return each sequence of increasing rank in the given size ranges, optionally matching suit
  def self.sequences(hand, min_size, max_size, match_suit: false)

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

  def substitute!(rank)
    @rank = rank if rank >= 2 && rank <= ACE
  end

  def unsubstitute!
    @rank = PHOENIX
  end

  def dragon?
    @rank == DRAGON
  end

  def dog?
    @rank == DOG
  end

  def normal?
    @rank >= 2 && @rank <= ACE && @suit != 0
  end

  def special?
    [PHOENIX, DOG, DRAGON, 1].include?(@rank) || substituted_phoenix?
  end

  def points
    return -25 if phoenix?
    return 25 if @rank == DRAGON
    return 10 if @rank == 10 || @rank == KING
    return 5 if @rank == 5
    0
  end

  def to_s
    "#{suit_string}#{rank_string}"
  end

  def suit_string
    ['', 'r', 'g', 'b', 'k'][@suit]
  end

  def rank_string
    case @rank
    when DRAGON
      'D'
    when PHOENIX
      'P'
    when DOG
      'd'
    when ACE
      'A'
    when KING
      'K'
    when QUEEN
      'Q'
    when JACK
      'J'
    else
      @rank.to_s
    end
  end
end