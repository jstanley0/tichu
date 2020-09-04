import React, { useMemo, useState, useCallback, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import WishModal from './WishModal'

export default function ActionBar({gameState, socket, cards, passLeft, passAcross, passRight, selectCards}) {
  const [wishing, setWishing] = useState(false)
  const [disabled, setDisabled] = useState(false)

  const validPlay = useMemo(() => {
    const cc = Array.from(cards).sort().join('')
    return Object.prototype.hasOwnProperty.call(gameState.players[0].possible_plays, cc)
  }, [cards, gameState.players[0].possible_plays])

  const handleWish = useCallback((rank) => {
    const h = {command: 'play', cards: cards.join(''), wish_rank: rank}
    socket.send(JSON.stringify(h))
    setWishing(false)
  }, [cards, socket])

  const cancelWish = useCallback(() => {
    setWishing(false)
  }, [])

  // re-enable sending commands when the game state changes
  useEffect(() => {
    setDisabled(false)
  }, [gameState])

  function performAction() {
    if (this.action === 'wish') {
      setWishing(true)
    } else if (this.action === 'clear_selection') {
      selectCards([])
    } else if (this.action === 'load_bomb') {
      selectCards(Array.from(this.bomb))
    } else {
      const h = {command: this.action, ...this.params}
      socket.send(JSON.stringify(h))
      setDisabled(true) // prevent further actions until new state is pushed from the server
    }
  }

  function leftButtonProps() {
    if (gameState.state === 'playing' && gameState.turn == null && gameState.trick_winner === 0 && gameState.dragon_trick) {
      return {label: `Give trick to ${gameState.players[1].name}`, action: 'claim', params: {to_player: 1}}
    } else if (gameState.players[0].can_gt) {
      return {label: 'Call Grand Tichu', action: 'grand_tichu'}
    } else if (gameState.players[0].can_tichu) {
      return {label: 'Call Tichu', action: 'tichu'}
    }
  }

  function centerButtonProps() {
    if (gameState.state === 'ready' && gameState.dealer === 0) {
      return {label: 'Start Game', action: 'deal'}
    } else if (gameState.state === 'passing') {
      if (gameState.players[0].hand_size === 8) {
        return {label: 'Take cards', action: 'back6'}
      } else if (!gameState.players[0].passed_cards && passLeft && passAcross && passRight) {
        return {label: 'Pass cards', action: 'pass_cards', params: {cards: [passLeft, passAcross, passRight].join('')}}
      }
    } else if (gameState.state === 'playing') {
      if (gameState.turn == null && gameState.trick_winner === 0 && !gameState.dragon_trick) {
        return {label: 'Claim trick', action: 'claim', params: {to_player: 0}}
      } else if (validPlay) {
        if (cards.includes('1')) {
          return {label: 'Play', action: 'wish'}
        } else {
          return {label: cards.length ? 'Play' : 'Pass', action: 'play', params: {cards: cards.join('')}}
        }
      }
    }
  }

  function rightButtonProps() {
    if (gameState.state === 'ready' && gameState.dealer === 0) {
      return {label: 'Rotate teams', action: 'rotate_teams'}
    } else if (gameState.state === 'playing') {
      if (gameState.turn == null && gameState.trick_winner === 0 && gameState.dragon_trick) {
        return {label: `Give trick to ${gameState.players[3].name}`, action: 'claim', params: {to_player: 3}}
      } else if (cards.length > 0) {
        return {label: 'Clear', action: 'clear_selection'}
      } else if (gameState.players[0].bomb) {
        return {label: 'Bomb', action: 'load_bomb', bomb: gameState.players[0].bomb}
      }
    }
  }

  function renderButton(buttonProps) {
    if (!buttonProps || !buttonProps.label) {
      return null
    }
    return <div style={{display: 'flex', justifyContent: 'center'}}>
      <Button color={buttonProps.primary ? 'primary' : 'secondary'}
              onClick={performAction.bind(buttonProps)}
              disabled={disabled}>
        {buttonProps.label}
      </Button>
    </div>
  }

  return <div className='action-bar'>
    <Grid container>
      <Grid item xs={4}>{ renderButton(leftButtonProps()) }</Grid>
      <Grid item xs={4}>{ renderButton({primary: true, ...centerButtonProps()}) }</Grid>
      <Grid item xs={4}>{ renderButton(rightButtonProps()) }</Grid>
    </Grid>
    <WishModal open={wishing} onWish={handleWish} onCancel={cancelWish}/>
  </div>
}
