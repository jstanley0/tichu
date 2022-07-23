import React from 'react'
import Card from '@mui/material/Card'
import Box from "@mui/material/Box"
import CardDimensions from './CardDimensions'

export default function CardBack({label}) {
  return <Card variant="elevation" elevation={2} style={{...CardDimensions.reg}} className='pile'>
    <Box width={CardDimensions.reg.width - 10} height={CardDimensions.reg.height - 10} className='card-back'>
      <span className='card-back-label'>{label}</span>
    </Box>
  </Card>
}
