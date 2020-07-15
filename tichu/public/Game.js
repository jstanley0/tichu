function Game({game_id, player_id}) {
  const { useState, useEffect, useRef } = React
  const { Container, Grid, Box, Typography, Button, CircularProgress } = MaterialUI

  const [ socket, setSocket ] = useState()
  const [ gameState, setGameState ] = useState({"state":"connecting"})
  const [ history, setHistory ] = useState([])

  useEffect(() => {
    const ws = new WebSocket(`${location.origin.replace(/^http/, 'ws')}/connect?game_id=${game_id}&player_id=${player_id}`)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.action && data.action.hasOwnProperty('length')) {
        setHistory(appendHistory(data.action))
      }
      setGameState(data)
    }
    ws.onerror = (event) => {
      setHistory(appendHistory([`error: ${event.toString()}`]))
    }
    setSocket(ws)
  }, [])

  if (gameState['state'] === 'connecting') {
    return <Container>
      <CircularProgress/>
    </Container>
  }

  return <Container>
    <Grid container spacing='2' className='full_height'>
      <Grid item xs={3}>
        <Box height="25%"/>
      </Grid>
      <Grid item xs={6}>
       <Player data={gameState.players[2]} vertical={false}/>
      </Grid>
      <Grid item xs={3}>
        <Typography align='right'>Terrible Tichu</Typography>
        <Typography variant='h4' align='right' component='h1'>{ gameState.id }</Typography>
      </Grid>
      <Grid item xs={3}>
       <Player data={gameState.players[1]} vertical={true} align='left'/>
      </Grid>
      <Grid item xs={6}>
        <Box height='50%'>
          <History data={history}/>
        </Box>
      </Grid>
      <Grid item xs={3}>
       <Player data={gameState.players[3]} vertical={true} align='right'/>
      </Grid>
      <Grid item xs={3}>
        <Box height="25%"/>
      </Grid>
      <Grid item xs={6}>
       <Player data={gameState.players[0]} orientation='h'/>
      </Grid>
    </Grid>
  </Container>
}

const MAX_HISTORY = 6
let idkwid = []
function appendHistory(entries) {
  idkwid = idkwid.concat(entries)
  if (idkwid.length > MAX_HISTORY) {
    idkwid.splice(0, idkwid.length - MAX_HISTORY)
  }
  return idkwid
}
