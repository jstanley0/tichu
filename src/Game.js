import React, { useState, useEffect } from 'react'
import Container from "@material-ui/core/Container"
import Box from "@material-ui/core/Box"
import Player from "./Player"
import Player0 from "./Player0"
import History from "./History"
import StatusBox from "./StatusBox"
import GlobalHistory from "./GlobalHistory"

export default function Game({game_id, player_id}) {
  const MAX_HISTORY = 20

  const [ socket, setSocket ] = useState()
  const [ gameState, setGameState ] = useState({"state":"connecting"})
  const [ history, setHistory ] = useState([])

  useEffect(() => {
    const ws = new WebSocket(`${location.origin.replace(/^http/, 'ws')}/connect?game_id=${game_id}&player_id=${player_id}`)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log(data)
      setHistory(GlobalHistory.consume(data.log, data.error, MAX_HISTORY))
      setGameState(data)
    }
    ws.onclose = () => {
      setHistory(GlobalHistory.consume([], "You have been disconnected. Reload the page to reconnect.", MAX_HISTORY))
    }
    ws.onerror = () => {
      window.location.href = '/'
    }
    setSocket(ws)
  }, [game_id, player_id])

  if (gameState['state'] === 'connecting') {
    return <Container>
      <em>Connecting...</em>
      <History data={history}/>
    </Container>
  }

  return <Container maxWidth='lg'>
    <div style={{display: 'flex', height: '100%', minWidth: 800, minHeight: 600, flexDirection: 'column'}}>
      <div style={{display: 'flex', flexGrow: 1}}>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <StatusBox wish={gameState.wish_rank} scores={gameState.scores}/>
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
          <History data={history}/>
        </div>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <div className='thetitle'>
            <div className='overline'>Touchless Tichu</div>
            <div className='big'>{ gameState.id }</div>
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

