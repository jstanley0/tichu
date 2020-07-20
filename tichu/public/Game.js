// many sorry for this; I tried useState but it kept getting cleared unexpectedly
window.tichu_history = []

function Game({game_id, player_id}) {
  const MAX_HISTORY = 20

  const { useState, useEffect, useCallback } = React
  const { Container, Box, Typography } = MaterialUI

  const [ socket, setSocket ] = useState()
  const [ gameState, setGameState ] = useState({"state":"connecting"})

  const appendHistory = (entries) => {
    tichu_history.push(...entries)
    if (tichu_history.length > MAX_HISTORY) {
      tichu_history.splice(0, tichu_history.length - MAX_HISTORY)
    }
  }

  useEffect(() => {
    const ws = new WebSocket(`${location.origin.replace(/^http/, 'ws')}/connect?game_id=${game_id}&player_id=${player_id}`)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log(data)
      let new_log = []
      if (data.log.hasOwnProperty('length')) {
        new_log = new_log.concat(data.log)
      }
      if (data.error) {
        new_log.push({error: data.error})
      }
      if (new_log.length) {
        appendHistory(new_log)
      }
      setGameState(data)
    }
    ws.onerror = (event) => {
      window.location.href = '/'
    }
    setSocket(ws)
  }, [])

  if (gameState['state'] === 'connecting') {
    return <Container>
      <Typography>Connecting...</Typography>
      <History data={tichu_history}/>
    </Container>
  }

  return <Container maxWidth='xl'>
    <div style={{display: 'flex', height: '100%', minWidth: 1000, minHeight: 720, flexDirection: 'column'}}>
      <div style={{display: 'flex', flexGrow: 1}}>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <div style={{flexGrow: 1}}/>
          <Player data={gameState.players[1]} vertical={true} turn={gameState.turn === 1} trickWinner={gameState.trick_winner === 1} align='left'/>
          <div style={{flexGrow: 1}}/>
        </div>
        <div style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
          <div style={{display: 'flex'}}>
            <div style={{flexGrow: 1}}/>
            <Player data={gameState.players[2]} vertical={false} turn={gameState.turn === 2} trickWinner={gameState.trick_winner === 2}/>
            <div style={{flexGrow: 1}}/>
          </div>
          <History data={tichu_history}/>
        </div>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <div className='thetitle'>
            <Typography align='right'>Touchless Tichu</Typography>
            <Typography variant='h4' align='right' component='h1'>{ gameState.id }</Typography>
          </div>
          <div style={{flexGrow: 1}}/>
          <Player data={gameState.players[3]} vertical={true} turn={gameState.turn === 3} trickWinner={gameState.trick_winner === 3} align='right'/>
          <div style={{flexGrow: 1}}/>
        </div>
      </div>
      <div>
        <Player0 gameState={gameState} socket={socket}/>
        <Box height={16}/>
      </div>
    </div>
  </Container>
}

