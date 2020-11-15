import React, { useState, useCallback } from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'

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
      <DialogContent>
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
