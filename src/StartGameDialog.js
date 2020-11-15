import React, { useState } from 'react'
import axios from 'axios'
import Grid from "@material-ui/core/Grid"
import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"
import Container from "@material-ui/core/Container"
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import {Connect} from "./index"

export default function StartGameDialog() {
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [shortGame, setShortGame] = useState(false)

  const startGame = () => {
    axios.post('/new', null, { params: { name: name, end_score: shortGame ? 500 : 1000 } })
      .then(response => {
        Connect(response.data.game_id, response.data.player_id)
      })
      .catch(error => {
        if (error.response?.status === 400 || error.response?.status === 403) {
          setError(error.response.data)
        } else {
          setError(error.toString())
        }
      })
  }

  const toggleShortGame = () => {
    setShortGame(!shortGame)
  }

  return <Container maxWidth="xs">
    <Box height="15%"/>
    <Typography align="center" gutterBottom={true} variant="h2" component="h1">Touchless Tichu</Typography>
    <form noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField fullWidth label="Your Name" autoFocus value={name} onChange={event => setName(event.target.value)}/>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel control={<Checkbox color="primary" name="shortGame" checked={shortGame} onChange={toggleShortGame}/>} label="Short game (500 points)" />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained"
                  color="primary"
                  disabled={name.length === 0}
                  onClick={startGame}>
            Start Game
          </Button>
        </Grid>
        <Grid item xs={12}>
          { <Typography color="error">{error}</Typography> }
        </Grid>
      </Grid>
    </form>
  </Container>
}
