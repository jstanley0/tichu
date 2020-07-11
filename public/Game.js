function Game({game_id, player_id, token}) {
  const { useState, useEffect } = React
  const { Container, TextField, Button } = MaterialUI

  const [ status, setStatus ] = useState('Connecting...')
  const [ socket, setSocket ] = useState()
  const [ command, setCommand ] = useState()
  const [ gameState, setGameState ] = useState({})

  useEffect(() => {
    const ws = new WebSocket(`${location.origin.replace(/^http/, 'ws')}/connect?game_id=${game_id}&player_id=${player_id}&token=${token}`)
    ws.onmessage = (event) => {
      setStatus(event.data)
    }
    ws.onerror = (event) => {
      setStatus(event.toString())
    }
    setSocket(ws)
  }, [])

  return <Container>
    { status }
    <TextField label='command' multiline fullWidth onChange={event => setCommand(event.target.value)}/>
    <Button variant='contained' onClick={() => socket.send(command)}>Send</Button>
    </Container>
}
