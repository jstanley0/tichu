import React from 'react'
import Card from '@material-ui/core/Card'
import Typography from "@material-ui/core/Typography"
import Box from "@material-ui/core/Box"
import { cardWidth, cardHeight, cardMargin } from './Dimensions'

export default function CardBack({vertical, collapse, label, rotate, translateX, translateY}) {
  const cm = collapse && !label ? -cardWidth*0.75 : 2
  return <Card variant="outlined" style={{
    marginRight: vertical ? cardMargin : cm,
    marginBottom: vertical ? cm : cardMargin,
    width: vertical ? cardHeight : cardWidth,
    height: vertical ? cardWidth : cardHeight,
    transform: rotate ? `rotate(${rotate}deg)` :
      (translateX ? `translateX(${translateX}px)` :
        (translateY ? `translateY(${translateY}px)` :
          null))
  }}>
    <Box width={(vertical ? cardHeight : cardWidth) - 10} height={(vertical ? cardWidth : cardHeight) - 10} className='card-back'>
      <Typography className='card-back'>{label}</Typography>
    </Box>
  </Card>
}
