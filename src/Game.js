import React, { useState, useEffect, useCallback } from 'react'
import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Player from "./Player"
import Player0 from "./Player0"
import History from "./History"
import StatusBox from "./StatusBox"
import JoinButton from "./JoinButton"
import Themer, { DarkModeContext } from "./Themer"
import GlobalHistory from "./GlobalHistory"
import KeepAlive from "./KeepAlive"
import playNotificationSound from "./notification"

export default function Game({game_id, player_id}) {
  const MAX_HISTORY = 20

  const [ socket, setSocket ] = useState()
  const [ gameState, setGameState ] = useState({"state":"connecting"})
  const [ history, setHistory ] = useState([])

  const appendHistory = useCallback((log, error) => {
    setHistory(GlobalHistory.consume(log, error, MAX_HISTORY))
  }, [setHistory])

  useEffect(() => {
    const ws = new WebSocket(`${location.origin.replace(/^http/, 'ws')}/connect?game_id=${game_id}&player_id=${player_id}`)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.player_id) {
        location.hash = `${data.id}:${data.player_id}`
      }
      if (data.state === 'over') {
        KeepAlive.stop()
        ws.close()
      } else {
        KeepAlive.reset(ws)
      }
      appendHistory(data.log, data.error)
      setGameState(data)
    }
    ws.onclose = () => {
      if (!KeepAlive.gameOver()) {
        appendHistory([], "You have been disconnected. Reload the page to reconnect.")
      }
    }
    ws.onerror = () => {
      window.location.href = '/'
    }
    setSocket(ws)
  }, [game_id, player_id, appendHistory])

  const [ turnNotification, setTurnNotification ] = useState(
    localStorage.getItem("bell") === "on"
  )

  useEffect(() => {
    localStorage.setItem("bell", turnNotification ? "on" : "off")
  }, [turnNotification])

  useEffect(() => {
    if (gameState.turn === 0 && turnNotification) {
      playNotificationSound()
    }
  }, [gameState.turn])  // eslint-disable-line react-hooks/exhaustive-deps

  const copyGameLink = useCallback(() => {
    const link = `${window.origin}/#${game_id}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(
        () => { appendHistory([{text: 'Game link copied!'}]) },
        () => { appendHistory([], 'Failed to copy link.') })
    } else {
      // clipboard not available (possibly because we are not using SSL)
      appendHistory([{text: 'Game link:', link}] )
    }
  }, [game_id, appendHistory])

  if (gameState['state'] === 'connecting') {
    return <Container>
      <em>Connecting...</em>
      <History data={history}/>
    </Container>
  }

  return <Themer>
    <Container maxWidth='lg'>
      <div style={{display: 'flex', height: '100%', minWidth: 1000, minHeight: 720, flexDirection: 'column'}}>
        <div style={{display: 'flex', flexGrow: 1}}>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <StatusBox wish={gameState.wish_rank} scores={gameState.scores} endScore={gameState.end_score}/>
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
              <div className='big'>
                <Tooltip title='Toggle turn notification sound'>
                  <IconButton size="small" onClick={() => setTurnNotification(!turnNotification)}>
                    { turnNotification ? '🔔' : '🔕' }
                  </IconButton>
                </Tooltip>
                <DarkModeContext.Consumer>
                  {({darkMode, toggleDarkMode}) => (
                    <Tooltip title='Toggle dark mode'>
                      <IconButton size="small" onClick={toggleDarkMode}>
                        { darkMode ? '🌒' : '🌞' }
                      </IconButton>
                    </Tooltip>
                  )}
                </DarkModeContext.Consumer>
                <Tooltip title='Copy game link'>
                  <IconButton size="small" onClick={copyGameLink}>
                    &#x1f517;
                  </IconButton>
                </Tooltip>
                { gameState.can_join ? <JoinButton socket={socket}/> : null }
              </div>
            </div>
            <div style={{flexGrow: 1}}/>
            <Player data={gameState.players[3]} vertical={true} turn={gameState.turn === 3} trickWinner={gameState.trick_winner === 3 || gameState.dealer === 3} align='right'/>
            <div style={{flexGrow: 1}}/>
          </div>
        </div>
        <div>
          { Object.prototype.hasOwnProperty.call(gameState.players[0], 'hand') ?
              <Player0 gameState={gameState} socket={socket}/>
            : <div style={{display: 'flex', justifyContent: 'center'}}>
                <Player data={gameState.players[0]} vertical={false} turn={gameState.turn === 0} trickWinner={gameState.trick_winner === 0 || gameState.dealer === 0} align='right'/>
              </div> }
          <Box height={16}/>
        </div>
      </div>
    </Container>
  </Themer>
}

