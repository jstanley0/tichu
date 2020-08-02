function rankFromNumber(number) {
    switch(number) {
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      case 14:
        return 'A'
      default:
        return number.toString()
    }
}

export default function decodeCard(card) {
  const n = card.charCodeAt() - '0'.charCodeAt()
  let suit, rank, color_style

  switch(n) {
    case 0:
      rank = 'H'
      suit = '🐶'
      color_style = 'special-card'
      break
    case 1:
      rank = '1'
      suit = '🐣'
      color_style = 'special-card'
      break
    case 54:
      rank = 'P'
      suit = '🦜'
      color_style = 'special-card'
      break
    case 55:
      rank = 'D'
      suit = '🐲'
      color_style = 'special-card'
      break
    default:
      rank = rankFromNumber(2 + Math.floor((n - 2) / 4))
      switch((n - 2) % 4) {
        case 0:
          color_style = 'red-card'
          suit = '♥'
          break
        case 1:
          color_style = 'green-card'
          suit = '♣'
          break
        case 2:
          color_style = 'blue-card'
          suit = '♦'
          break
        case 3:
          color_style = 'black-card'
          suit = '♠'
          break
      }
  }

  return { suit, rank, color_style }
}