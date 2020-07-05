class Player
  attr_reader :name, :hand, :uncovered_last_six, :cards_to_pass, :possible_plays, :tricks, :plays, :tichu, :grand_tichu

  def initialize(name)
    @name = name
  end

  def assign_hand!(cards)
    @hand = cards
    @uncovered_last_six = false
    @cards_to_pass = {}
    @possible_plays = []
    @tricks = []
    @plays = []
    @tichu = false
    @grand_tichu = false
  end
end