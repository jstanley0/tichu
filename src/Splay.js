import React from 'react'
import CardBack from "./CardBack"
import CardDimensions from './CardDimensions'

export default function Splay({vertical, size, labeled, angle, collapse, flip}) {
  if (size == 0) {
    return null
  }

  const dm = (!flip && !vertical) ? 1 : -1
  const am = (flip ? -1 : 1) * (vertical ? 1 : -1)
  const stepAngle = angle / size
  let marginBottom = collapse ? (vertical ? -CardDimensions.reg.height * 0.85 : 0) : (vertical ? CardDimensions.reg.width - CardDimensions.reg.height : 0)
  let marginRight = vertical ? CardDimensions.reg.height - CardDimensions.reg.width : (collapse ? -CardDimensions.reg.width * 0.8 : 0)
  let cards = []
  let a = (vertical ? (flip ? -90 : 90) : 0) - am * ((size - 1) * stepAngle / 2)
  let y = 0
  for(let i = 0; i < size; ++i) {
    if (i === size - 1) {
      if (vertical) {
        marginBottom = 0
      } else {
        marginRight = 0
      }
    }
    y = (CardDimensions.reg.height / 6) * dm * Math.sin(((i + 0.5) * Math.PI) / size)
    const transform = `rotate(${a}deg) translateY(${y}px)`
    cards.push(<div key={i} style={{marginBottom, marginRight, transform}}>
      <CardBack label={(labeled && i === size - 1) ? size : null}/>
    </div>)
    a += stepAngle * am
  }
  return <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', height: vertical ? '100%' : 'initial', justifyContent: 'center'}}>
    {cards}
  </div>
}
