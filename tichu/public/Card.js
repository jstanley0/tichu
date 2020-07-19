function Card({vertical, collapse, label, rotate, translateX, translateY}) {
  const { Box, Typography } = MaterialUI
  const cm = collapse && !label ? -40 : 2
  return <MaterialUI.Card variant="outlined" style={{
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
  </MaterialUI.Card>
}

function FaceCard({card, dragging}) {
  const { Typography } = MaterialUI
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
  return <MaterialUI.Card variant='elevation' elevation={dragging ? 5 : 1} style={{width: 60, height: 84, margin: 2}}>
    <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      { rank ? <div className={`${color_style} card-rank`}>{rank}</div> : null }
      <div className={`${color_style} card-suit`}>{suit}</div>
    </div>
  </MaterialUI.Card>
}
