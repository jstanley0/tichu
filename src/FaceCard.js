import React from 'react'
import Card from '@material-ui/core/Card'
import { cardWidth, cardHeight, cardMargin } from './Dimensions'

export default function FaceCard({card, dragging}) {
  let color_style, rank_offset = 1, suit
  switch (card[0]) {
    case 'r': color_style = 'red-card'; suit = '♥'; break
    case 'g': color_style = 'green-card'; suit = '♣'; break
    case 'b': color_style = 'blue-card'; suit = '♦'; break
    case 'k': color_style = 'black-card'; suit = '♠'; break
    default: color_style = 'special-card'; suit = null; rank_offset = 0
  }
  let rank = card.substr(rank_offset)
  if (!suit) {
    switch(rank) {
      case 'D': suit = '🐲'; break;
      case 'd': suit = '🐶'; rank = 'H'; break;
      case 'P': suit = '🦜'; break;
      case '1': suit = '🐣'; break;
    }
  }
  return <Card variant='elevation'
                          className={'tichu-card'}
                          elevation={dragging ? 5 : 1}
                          style={{width: cardWidth, height: cardHeight, margin: cardMargin}}>
    <div className={`${color_style} card-rank`}>{rank}</div>
    <div className={`${color_style} card-suit`}>{suit}</div>
  </Card>
}
