function JoinGameDialog(_props) {
  const { useState } = React
  const { Box, Typography, Container, TextField, Button, Grid } = MaterialUI

  const [name, setName] = useState('')
  const [gameCode, setGameCode] = useState('')

  const handlePlay = () => {

  }

  return <Container maxWidth="xs">
    <Box height="15%"/>
    <Typography align="center" gutterBottom={true} variant="h2" component="h1">Terrible Tichu</Typography>
    <form noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField fullWidth label="Name" onChange={event => setName(event.target.value)}/>
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Game code" onChange={event => setGameCode(event.target.value)}/>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained"
                  color="primary"
                  disabled={name.length == 0}
                  onClick={handlePlay}>
            {gameCode.length > 0 ? 'Join Game' : 'Start Game'}
          </Button>
        </Grid>
      </Grid>
    </form>
  </Container>
}