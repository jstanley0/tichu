import React, { useCallback } from 'react'
import Card from '@material-ui/core/Card'
import decodeCard from './DecodeCard.js'
import CardDimensions from './CardDimensions'

export default function FaceCard({card, dragging, small, selected, toggleSelect}) {
  const getStyles = useCallback(() => {
    const h = small ? { ...CardDimensions.small } : { ...CardDimensions.reg }
    if (selected) {
      h.border = '2px solid gold'
      h.margin = 1
    }
    return h
  }, [selected, small])

  const handleClick = useCallback(() => {
    if (toggleSelect) {
      toggleSelect(card)
    }
  }, [card, toggleSelect])

  const { suit, rank, color_style } = decodeCard(card)
  return <Card variant='elevation'
               className={small ? 'card-small' : 'tichu-card'}
               elevation={dragging || selected ? 7 : 2}
               style={getStyles()}
               onClick={handleClick}>
    <div className={`${color_style} card-rank ${small ? 'card-small' : ''}`}>{rank}</div>
    <div className={`${color_style} card-suit ${small ? 'card-small' : ''}`}>{suit}</div>
  </Card>
}
