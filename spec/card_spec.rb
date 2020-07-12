require 'rspec'
require_relative '../tichu/card.rb'

describe Card do
  let(:hand) { Card.deserialize(%w(1 k2 r2 g2 b2 k3 k4 k5 b5 r5 k6 k7 rA gA)) }

  describe "groups" do
    it 'finds groups of 2' do
      expect(Card.groups(hand, 2).size).to eq 10 # 4 choose 2 + 3 choose 2 + 1
    end

    it 'finds groups of 3' do
      expect(Card.groups(hand, 3).size).to eq 5 # 4 choose 3 + 1
    end

    it 'finds groups of 4' do
      expect(Card.groups(hand, 4).first).to match_array Card.deserialize(%w(r2 g2 b2 k2))
    end
  end

  describe "sequences" do
    it 'finds sequences' do
      expect(Card.sequences(hand, 5, 14)).to eq []
    end

    it 'finds limited sequences' do
      expect(Card.sequences(hand, 5, 5)).to eq []
    end
  end

  describe "flush_sequences" do
    it 'finds flushes' do
      expect(Card.flush_sequences(hand, 5, 14)).to eq []
    end
  end
end
