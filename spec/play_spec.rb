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
    expect(Straight.enumerate(sparrow_hand, nil).size).to eq 5
  end

  it "enumerates Ladder" do

  end

  it "enumerates FullHouse" do

  end

  it "enumerates Bomb" do

  end

  it "disallows passing when a wish can be fulfilled" do

  end
end