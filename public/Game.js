function Game({game_id, player_id, token}) {
  const { useState } = React
  const { Typography } = MaterialUI

  const [ status, setStatus ] = useState('Connecting...')

  return <Typography>
    { status }
    { `${game_id}:${player_id}:${token}` }
    </Typography>
}