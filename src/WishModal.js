import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'

export default function WishModal({open, onWish, onCancel}) {
  const [rank, setRank] = useState(0)

  const handleChange = (event) => {
    setRank(event.target.value)
  }

  const handleClose = () => {
    onCancel()
  }

  const handleWish = () => {
    onWish(rank !== 0 ? rank : undefined)
  }

  return <Dialog open={open} onClose={handleClose}>
    <DialogTitle>Wish for a rank</DialogTitle>
    <DialogContent>
      <Select value={rank} onChange={handleChange}>
        <MenuItem value={0}>(no wish)</MenuItem>
        <MenuItem value='2'>2</MenuItem>
        <MenuItem value='3'>3</MenuItem>
        <MenuItem value='4'>4</MenuItem>
        <MenuItem value='5'>5</MenuItem>
        <MenuItem value='6'>6</MenuItem>
        <MenuItem value='7'>7</MenuItem>
        <MenuItem value='8'>8</MenuItem>
        <MenuItem value='9'>9</MenuItem>
        <MenuItem value='10'>10</MenuItem>
        <MenuItem value='J'>J</MenuItem>
        <MenuItem value='Q'>Q</MenuItem>
        <MenuItem value='K'>K</MenuItem>
        <MenuItem value='A'>A</MenuItem>
      </Select>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose}>
        Cancel
      </Button>
      <Button onClick={handleWish} color='primary'>
        { rank === 0 ? 'Play' : 'Wish' }
      </Button>
    </DialogActions>
  </Dialog>
}