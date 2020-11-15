import React from 'react'

export default function StatusBox({wish, scores, endScore}) {
  return <div className='status_box' style={{display: 'flex'}}>
    <div className='score_box'>
      <div className='overline'>Score</div>
      <div className='big'>{scores[0]} : {scores[1]}</div>
      <div className='endscore'>/{endScore}</div>
    </div>
    { wish && <div className='wish_box'>
      <div className='overline'>Wish</div>
      <div className='big'>{wish}</div>
    </div> }
  </div>
}
