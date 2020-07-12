require 'rspec'
require_relative '../tichu/play.rb'

describe Play do
  let(:hand1) { Card.deserialize(%w(1 k2 r2 g2 b2 k3 k4 k5 b5 r5 k6 k7 rA gA)) }
  let(:dog_hand) { Card.deserialize(%w(d k2 r2 g2 b2 k3 k4 k5 b5 r5 k6 k7 rA gA)) }
  let(:play1) { Single.new(Card.deserialize(%w(1)), 1) }

  describe Pass do
    it 'disallows leading with pass' do
      expect(Pass.enumerate(hand1, nil).size).to eq 0
    end

    it 'allows passing after a play' do
      expect(Pass.enumerate(hand1, play1).size).to eq 1
    end
  end

  describe Dog do
    it 'allows leading with dog' do
      expect(Dog.enumerate(dog_hand, nil).size).to eq 1
    end

    it 'disallows playing dog on something' do
      expect(Dog.enumerate(dog_hand, play1).size).to eq 0
    end
  end

  describe Single do
    it 'enumerates all valid singles when no previous play' do
      expect(Single.enumerate(dog_hand, nil).size).to eq 13
    end

    it 'enumerates singles that beat the previous play' do
      expect(Single.enumerate(dog_hand, Single.new(Card.deserialize(%w(r4)), 4)).size).to eq 7
    end

    it 'disallows playing singles on other kinds of plays' do
      expect(Single.enumerate(dog_hand, Pair.new(Card.deserialize(%w(b4 r4)), 4)).size).to eq 0
    end
  end

  describe Pair do

  end

  describe Triple do

  end

  describe Straight do

  end

  describe Ladder do

  end

  describe FullHouse do

  end

  describe Bomb do

  end

  it "disallows passing when a wish can be fulfilled" do

  end
end