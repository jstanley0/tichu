import React, { useState, useCallback } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'

export default function JoinButton({socket}) {
  const [name, setName] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const joinGame = useCallback(() => {
    const h = { command: 'join', name }
    socket.send(JSON.stringify(h))
    setModalOpen(false)
  }, [socket, name])

  const handleClose = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return <>
    <Button color="primary"
            variant="contained"
            disabled={modalOpen}
            onClick={() => setModalOpen(true)}>
      Join Game
    </Button>
    <Dialog open={modalOpen} onClose={handleClose}>
      <DialogTitle>Join Game</DialogTitle>
      <DialogContent dividers>
        <TextField label="Your Name" autoFocus value={name} onChange={event => setName(event.target.value)}/>
      </DialogContent>
      <DialogActions>
        <Button disabled={name.length === 0} onClick={joinGame} color='primary'>
          Join
        </Button>
      </DialogActions>
    </Dialog>
  </>
}
