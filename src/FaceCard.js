import React, { useCallback } from 'react'
import Card from '@material-ui/core/Card'

export default function FaceCard({card, dragging, small, selected, toggleSelect}) {
  let color_style, rank_offset = 1, suit

  const getStyles = useCallback(() => {
    const h = {width: small ? 45 : 60, height: small ? 63 : 84, margin: 2}
    if (selected) {
      h.border = '2px solid gold'
    }
    return h
  }, [selected, small])

  const handleClick = useCallback(() => {
    if (toggleSelect) {
      toggleSelect(card)
    }
  }, [card, toggleSelect])

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
               className={small ? 'card-small' : 'tichu-card'}
               elevation={dragging || selected ? 5 : 1}
               style={getStyles()}
               onClick={handleClick}>
    <div className={`${color_style} card-rank ${small ? 'card-small' : ''}`}>{rank}</div>
    <div className={`${color_style} card-suit ${small ? 'card-small' : ''}`}>{suit}</div>
  </Card>
}
