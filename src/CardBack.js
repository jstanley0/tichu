import React from 'react'
import Card from '@material-ui/core/Card'
import Typography from "@material-ui/core/Typography"
import Box from "@material-ui/core/Box"

export default function CardBack({vertical, collapse, label, rotate, translateX, translateY}) {
  const cm = collapse && !label ? -40 : 2
  return <Card variant="outlined" style={{
    marginRight: vertical ? 2 : cm,
    marginBottom: vertical ? cm : 2,
    width: vertical ? 84 : 60,
    height: vertical ? 60 : 84,
    transform: rotate ? `rotate(${rotate}deg)` :
      (translateX ? `translateX(${translateX}px)` :
        (translateY ? `translateY(${translateY}px)` :
          null))
  }}>
    <Box width={vertical ? 74 : 50} height={vertical ? 50 : 74} className='card-back'>
      <Typography className='card-back'>{label}</Typography>
    </Box>
  </Card>
}
