import React from 'react'
import Card from '@material-ui/core/Card'
import Box from "@material-ui/core/Box"
import CardDimensions from './CardDimensions'

export default function CardBack({label}) {
  return <Card variant="elevation" elevation={2} style={{...CardDimensions.reg}}>
    <Box width={CardDimensions.reg.width - 10} height={CardDimensions.reg.height - 10} className='card-back'>
      <span className='card-back-label'>{label}</span>
    </Box>
  </Card>
}
