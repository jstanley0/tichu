class Card
  # numeric values that will work in straights
  JACK = 11
  QUEEN = 12
  KING = 13
  ACE = 14
  # skip ranks so they won't form straights
  PHOENIX = 16
  DRAGON = 18
  # sort low
  DOG = -1

  attr_accessor :suit, :rank

  def initialize(suit, rank)
    @suit = suit
    @rank = rank
  end

  def eql?(rhs)
    self.hash == rhs.hash
  end

  def ==(rhs)
    eql?(rhs)
  end

  def hash
    # a single bit; this way we can bitwise OR card hashes to get a play signature
    1 << sequence_number
  end

  def sequence_number
    # number each card 0 to 55
    case rank
    when DOG
      0
    when 1
      1
    when PHOENIX
      54
    when DRAGON
      55
    else
      2 + (rank - 2) * 4 + suit - 1
    end
  end

  # :|
  def self.hand_signature(cards)
    cards.map(&:hash).inject(:|)
  end

  def <=>(rhs)
    self.hash <=> rhs.hash
  end

  def self.deserialize(card_or_array)
    if card_or_array.is_a?(Array)
      card_or_array.map { |s| from_string(s) }
    else
      from_string(card_or_array)
    end
  end

  # return each group of size having matched rank
  def self.groups(hand, size)
    groups = []
    hand.group_by(&:rank).each_value do |cards|
      next if cards.size < size
      groups.concat cards.combination(size).to_a
    end
    groups
  end

  def self.sequences(hand, min_size, max_size)
    groups = hand.reject { |card| card.dragon? || card.dog? }.group_by(&:rank)
    return [] if groups.empty?

    # find all sequences of rank greater than or equal to the min_size
    ranks = groups.keys.sort
    rank_seqs = []
    current_sequence = [ranks.shift]
    ranks.each do |rank|
      if rank == current_sequence[-1] + 1
        current_sequence << rank
      else
        rank_seqs << current_sequence if current_sequence.size >= min_size
        current_sequence = [rank]
      end
    end
    rank_seqs << current_sequence if current_sequence.size >= min_size

    # enumerate all subsequences in the desired size range
    card_sequences = []
    rank_seqs.each do |rank_seq|
      for size in min_size..max_size
        rank_seq.each_cons(size) do |rank_subseq|
          card_groups = rank_subseq.map { |rank| groups[rank] }
          first_card_group = card_groups.shift
          card_sequences.concat(first_card_group.product(card_groups))
        end
      end
    end

    card_sequences
  end

  def self.flush_sequences(hand, min_size, max_size)
    sequences = []
    hand.group_by(&:suit).each_value do |monochromatic_cards|
      sequences.concat Card.sequences(monochromatic_cards, min_size, max_size)
    end
    sequences
  end

  def self.serialize(cards)
    cards.sort_by(&:rank).map(&:to_s)
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

  def sparrow?
    @rank == 1
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

  def inspect
    to_s
  end

  def suit_string
    Card.suit_string(@suit)
  end

  def rank_string
    Card.rank_string(@rank)
  end

  def self.suit_string(suit)
    ['', 'r', 'g', 'b', 'k'][suit]
  end

  def self.rank_string(rank)
    case rank
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
      rank.to_s
    end
  end

  def self.rank_from_string(rank_string)
    case rank_string
    when 'D'
      DRAGON
    when 'P'
      PHOENIX
    when 'd'
      DOG
    when 'A'
      ACE
    when 'K'
      KING
    when 'Q'
      QUEEN
    when 'J'
      JACK
    else
      rank_string.to_i
    end
  end

  def self.suit_from_string(suit_string)
    return 0 if suit_string.empty?
    "rgbk".index(suit_string) + 1
  end

  def self.from_string(s)
    suit, rank = s.match(/([rgbk]?)(.+)/).to_a[1..-1]
    self.new(suit_from_string(suit), rank_from_string(rank))
  end
end