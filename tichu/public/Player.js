function Player({data, vertical, align}) {
  const { Box } = MaterialUI
  return <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: align === 'right' ? 'flex-end' : 'flex-start'}}>
    <PlayerInfo data={data}/>
    <Box width={5} height={5}/>
    <div style={{flexGrow: 1, display: 'flex', flexDirection: vertical ? (align === 'right' ? 'row-reverse' : 'row') : 'column'}}>
      <div>
        <Hand vertical={vertical} align={align} collapse={true} size={14 /*data.hand_size*/}/>
      </div>
    </div>
  </div>
}

function PlayerInfo({data}) {
  const { Typography, Chip } = MaterialUI
  return <div>
      <Typography variant={data ? 'h6' : 'body2'} component='h2'>
        { data ? data.name : 'Waiting...'}
      </Typography>
      <Chip label={ data ? data.points_taken : '-'}/>&ensp;
      { data && data.tichu > 0 ? (<Chip label={ data.tichu === 200 ? 'GT' : 'T' }/>) : null }
    </div>
}

function Player0({gameState}) {
  const { Box } = MaterialUI
  return <div style={{display: 'flex', alignItems: 'flex-end'}}>
    <div style={{flexGrow: 1}}/>
    <PlayerInfo data={gameState.players[0]}/>
    <Box width={5} height={5}/>
    <Hand vertical={0} collapse={false} size={14}/>
    <div style={{flexGrow: 1}}/>
  </div>
}
