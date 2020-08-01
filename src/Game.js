import React, { useState, useEffect } from 'react'
import Container from "@material-ui/core/Container"
import Box from "@material-ui/core/Box"
import Player from "./Player"
import Player0 from "./Player0"
import History from "./History"
import StatusBox from "./StatusBox"
import GlobalHistory from "./GlobalHistory"
import KeepAlive from "./KeepAlive"

export default function Game({game_id, player_id}) {
  const MAX_HISTORY = 20

  const [ socket, setSocket ] = useState()
  const [ gameState, setGameState ] = useState({"state":"connecting"})
  const [ history, setHistory ] = useState([])

  useEffect(() => {
    const ws = new WebSocket(`${location.origin.replace(/^http/, 'ws')}/connect?game_id=${game_id}&player_id=${player_id}`)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.state === 'over') {
        KeepAlive.stop()
        ws.close()
      } else {
        KeepAlive.reset(ws)
      }
      setHistory(GlobalHistory.consume(data.log, data.error, MAX_HISTORY))
      setGameState(data)
    }
    ws.onclose = () => {
      if (KeepAlive.gameOver()) {
        setHistory(GlobalHistory.consume(["Game Over!"], null, MAX_HISTORY))
      } else {
        setHistory(GlobalHistory.consume([], "You have been disconnected. Reload the page to reconnect.", MAX_HISTORY))
      }
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
    <div style={{display: 'flex', height: '100%', minWidth: 1000, minHeight: 720, flexDirection: 'column'}}>
      <div style={{display: 'flex', flexGrow: 1}}>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <StatusBox wish={gameState.wish_rank} scores={gameState.scores}/>
          <div style={{flexGrow: 1}}/>
          <Player data={gameState.players[1]} vertical={true} turn={gameState.turn === 1} trickWinner={gameState.trick_winner === 1 || gameState.dealer === 1} align='left'/>
          <div style={{flexGrow: 1}}/>
        </div>
        <div style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
          <div style={{display: 'flex'}}>
            <div style={{flexGrow: 1}}/>
            <Player data={gameState.players[2]} vertical={false} turn={gameState.turn === 2} trickWinner={gameState.trick_winner === 2 || gameState.dealer === 2} align='left'/>
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
          <Player data={gameState.players[3]} vertical={true} turn={gameState.turn === 3} trickWinner={gameState.trick_winner === 3 || gameState.dealer === 3} align='right'/>
          <div style={{flexGrow: 1}}/>
        </div>
      </div>
      <div>
        { gameState.players[0].hasOwnProperty('hand') ?
            <Player0 gameState={gameState} socket={socket}/>
          : <div style={{display: 'flex', justifyContent: 'center'}}>
              <Player data={gameState.players[0]} vertical={false} turn={gameState.turn === 0} trickWinner={gameState.trick_winner === 0 || gameState.dealer === 0} align='right'/>
            </div> }
        <Box height={16}/>
      </div>
    </div>
  </Container>
}

