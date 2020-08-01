require 'rspec'
require_relative '../tichu/play.rb'

describe Play do
  let(:hand) { Card.deserialize(%w(d k2 r2 g2 b2 k3 k4 k5 b5 r5 k6 k7 rA gA)) }
  let(:phoenix_hand) { Card.deserialize(%w(d k2 r2 g2 b2 k3 k4 k5 b5 r5 k6 k7 rA P)) }

  it "enumerates Pass" do
    expect(Pass.enumerate(hand, nil).size).to eq 0
    expect(Pass.enumerate(hand, Single.new(Card.deserialize(%w(1)), 1)).size).to eq 1
  end

  it "enumerates Dog" do
    expect(Dog.enumerate(hand, nil).size).to eq 1
    expect(Dog.enumerate(hand, Single.new(Card.deserialize(%w(1)), 1)).size).to eq 0
  end

  it "enumerates Single" do
    expect(Single.enumerate(hand, nil).size).to eq 13
    expect(Single.enumerate(hand, Single.new(Card.deserialize(%w(r4)), 4)).size).to eq 7
    expect(Single.enumerate(hand, Pair.new(Card.deserialize(%w(b4 r4)), 4)).size).to eq 0
    expect(Single.enumerate([Card.new(0, Card::PHOENIX)], Single.new([Card.new(0, Card::ACE)], Card::ACE)).size).to eq 1
    expect(Single.enumerate([Card.new(0, Card::PHOENIX)], Single.new([Card.new(0, Card::DRAGON)], Card::DRAGON)).size).to eq 0
  end

  it "enumerates Pair" do
    expect(Pair.enumerate(hand, nil).size).to eq 10
    expect(Pair.enumerate(hand, Pair.new(Card.deserialize(%w(b4 r4)), 4)).size).to eq 4
    expect(Pair.enumerate(hand, Single.new(Card.deserialize(%w(r4)), 4)).size).to eq 0
    expect(Pair.enumerate(phoenix_hand, nil).size).to eq 21
  end

  it "enumerates Triple" do
    expect(Triple.enumerate(hand, nil).size).to eq 5
    expect(Triple.enumerate(hand, Triple.new(Card.deserialize(%w(b4 r4 r4)), 4)).size).to eq 1
    expect(Triple.enumerate(hand, Single.new(Card.deserialize(%w(1)), 1)).size).to eq 0
    expect(Triple.enumerate(phoenix_hand, nil).size).to eq 14
  end

  it "enumerates Straight" do
    sparrow_hand = Card.deserialize(%w(1 k2 r2 g2 b2 k3 k4 k5 b5 r5 k6 k7 rA gA))
    expect(Straight.enumerate(sparrow_hand, nil).size).to eq 60 # excludes the 3 bombs found in the Card spec
    expect(Straight.enumerate(sparrow_hand, Straight.new(Card.deserialize(%w(1 b2 b3 b4 b5 b6)), 6)).size).to eq 11
    expect(Straight.enumerate(phoenix_hand, nil).size).to eq 144
    expect(Straight.enumerate(Card.deserialize(%w(r4 g5 b6 k7 P)), nil).first.rank).to eq 8 # use phoenix as high card
    expect(Straight.enumerate(Card.deserialize(%w(rJ bQ gK kA P)), nil).first.rank).to eq Card::ACE # allow phoenix to be low card when ace is high
  end

  it "enumerates Ladder" do
    ladder_hand = Card.deserialize(%w(1 k2 r2 g2 k3 b3 g4 r4 k5 b5 r5 k6 k7 kJ))
    expect(Ladder.enumerate(ladder_hand, nil).size).to eq 22
    expect(Ladder.enumerate(ladder_hand, Ladder.new(Card.deserialize(%w(r2 g2 r3 g3 r4 g4)), 4)).size).to eq 3
    expect(Ladder.enumerate(phoenix_hand, nil).size).to eq 12
  end

  it "enumerates FullHouse" do
    expect(FullHouse.enumerate(hand, nil).size).to eq 23
    expect(FullHouse.enumerate(hand, FullHouse.new(Card.deserialize(%w(r4 g4 b4 r8 g8)), 4)).size).to eq 7
    expect(FullHouse.enumerate(Card.deserialize(%w(r5 g5 r6 g6 P)), nil).size).to eq 1 # higher only
  end

  it "enumerates Bomb" do
    bombs = Bomb.enumerate(hand, nil)
    expect(bombs.size).to eq 4
    expect(bombs.map(&:rank)).to match_array([2, 506, 507, 607])
    expect(Bomb.enumerate(hand, bombs.find { |b| b.rank == 506 }).size).to eq 2
  end

  it "enumerates all plays" do
    all_plays = Play.enumerate(hand, nil, nil)
    expect(all_plays.size).to eq 80
    expect(all_plays.find { |play| play.is_a?(Dog) }).not_to be_nil
    expect(all_plays.find { |play| play.is_a?(Pass) }).to be_nil

    new_plays = Play.enumerate(hand, Pair.new(Card.deserialize(%w(rJ gJ)), Card::JACK), nil)
    expect(new_plays.map(&:type)).to match_array(%w(Pass Pair Bomb Bomb Bomb Bomb))
  end

  it "requires you to fulfill the wish if you can (or bomb)" do
    plays = Play.enumerate(hand, Single.new(Card.deserialize(%w(1)), 1), 5)
    expect(plays.map(&:type)).to match_array(%w(Single Single Single Bomb Bomb Bomb Bomb))
  end

  it "allows you to pass or play if you can't fulfill the wish" do
    plays = Play.enumerate(hand, Pair.new(Card.deserialize(%w(r9 g9)), 9), Card::JACK)
    expect(plays.map(&:type)).to match_array(%w(Pass Pair Bomb Bomb Bomb Bomb))
  end
end