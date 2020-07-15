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

  return <Container fixed>
    <div style={{display: 'flex', height: '100%'}}>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{height: 80}}/>
        <Player data={gameState.players[1]} vertical={true} align='left'/>
      </div>
      <div style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
        <Player data={gameState.players[2]} vertical={false}/>
        <div style={{flexGrow: 1}}>
          <History data={history}/>
        </div>
        <Player data={gameState.players[0]} vertical={false}/>
      </div>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{height: 80}}>
          <Typography align='right'>Terrible Tichu</Typography>
          <Typography variant='h4' align='right' component='h1'>{ gameState.id }</Typography>
        </div>
        <Player data={gameState.players[3]} vertical={true} align='right'/>
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
