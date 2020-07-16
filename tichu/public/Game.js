function Game({game_id, player_id}) {
  const { useState, useEffect, useRef } = React
  const { Container, Box, Typography, Button, CircularProgress } = MaterialUI

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

  return <Container maxWidth='xl'>
    <div style={{display: 'flex', height: '100%', minWidth: 1100, minHeight: 750, flexDirection: 'column'}}>
      <div style={{display: 'flex', flexGrow: 1}}>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <div style={{flexGrow: 1}}/>
          <Player data={gameState.players[1]} vertical={true} align='left'/>
          <div style={{flexGrow: 1}}/>
        </div>
        <div style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
          <div style={{display: 'flex'}}>
            <div style={{flexGrow: 1}}/>
            <Player data={gameState.players[2]} vertical={false}/>
            <div style={{flexGrow: 2}}/>
          </div>
          <History data={history}/>
        </div>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <div style={{height: 0}}>
            <Typography align='right'>Terrible Tichu</Typography>
            <Typography variant='h4' align='right' component='h1'>{ gameState.id }</Typography>
          </div>
          <div style={{flexGrow: 1}}/>
          <Player data={gameState.players[3]} vertical={true} align={'right'}/>
          <div style={{flexGrow: 1}}/>
        </div>
      </div>
      <div>
        <Player0 gameState={gameState}/>
        <Box height={16}/>
      </div>
    </div>
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
