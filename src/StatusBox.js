import React from 'react'
import Typography from "@material-ui/core/Typography"

export default function StatusBox({wish, scores}) {
  return <div className='status_box' style={{display: 'flex'}}>
    <div className='score_box'>
      <Typography variant='overline'>Score</Typography>
      <div className='topline'>{scores[0]} - {scores[1]}</div>
    </div>
    { wish && <div className='wish_box'>
      <Typography variant='overline'>Wish</Typography>
      <div className='topline'>{wish}</div>
    </div> }
  </div>
}
