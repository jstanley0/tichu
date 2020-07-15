function Player({data, vertical, align}) {
  const { Typography, Chip, Box } = MaterialUI

  if (!data) {
    return <Typography variant='body1' color='secondary'>Waiting...</Typography>
  }

  return <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: align === 'right' ? 'flex-end' : 'flex-start'}}>
    <div>
      <Typography variant='h6' component='h2'>
        { data.name }
      </Typography>
      <Chip label={ data.points_taken }/>&ensp;
      { data.tichu >= 0 ? (<Chip label={ data.tichu === 200 ? 'GT' : 'T' }/>) : null }
    </div>
    <Box width={5} height={5}></Box>
    <div style={{flexGrow: 1, display: 'flex', flexDirection: vertical ? (align === 'right' ? 'row-reverse' : 'row') : 'column'}}>
      <div>
        <Hand vertical={vertical} align={align} size={data.hand_size}/>
      </div>
      <div>
        { data.passed_cards || 1 ? <Hand vertical={vertical} align={align} size={3} skew={true}/> : null }
      </div>
    </div>
  </div>
}
