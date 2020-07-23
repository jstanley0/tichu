import React, { useMemo } from 'react'
import Button from '@material-ui/core/Button'

export default function ActionBar({gameState, socket, cards, passLeft, passAcross, passRight}) {
  const validPlay = useMemo(() => {
    // FIXME use a more efficient play representation, so we can test valid plays via hasOwnProperty
    const cc = Array.from(cards).sort().join()
    const possible = gameState.players[0].possible_plays
    for (let i in possible) {
      const ps = Array.from(possible[i]).sort().join()
      if (cc === ps) {
        return true
      }
    }
    return false
  }, [cards, gameState.players[0].possible_plays])

  function performAction() {
    const h = {command: this.action, ...this.params}
    socket.send(JSON.stringify(h))
  }

  let buttons = []
  switch (gameState.state) {
    case 'passing':
      if (gameState.players[0].can_gt) {
        buttons.push({label: 'Call Grand Tichu', action: 'grand_tichu'})
      } else if (gameState.players[0].can_tichu) {
        buttons.push({label: 'Call Tichu', action: 'tichu'})
      }

      if (gameState.players[0].hand_size === 8) {
        buttons.push({primary: true, label: 'Take cards', action: 'back6'})
      } else if (!gameState.players[0].passed_cards && passLeft && passAcross && passRight) {
        buttons.push({
          primary: true,
          label: 'Pass cards',
          action: 'pass_cards',
          params: {cards: [passLeft, passAcross, passRight]}
        })
      }
      break

    case 'playing':
      if (gameState.players[0].can_tichu) {
        buttons.push({label: 'Call Tichu', action: 'tichu'})
      }

      if (validPlay) {
        buttons.push({primary: true, label: cards.length ? 'Play' : 'Pass', action: 'play', params: {cards}})
      }

      if (gameState.turn == null && gameState.trick_winner === 0) {
        if (gameState.dragon_trick) {
          buttons.push({
            primary: true,
            label: `Give trick to ${gameState.players[1].name}`,
            action: 'claim',
            params: {to_player: 1}
          })
          buttons.push({
            primary: true,
            label: `Give trick to ${gameState.players[3].name}`,
            action: 'claim',
            key: 'claimR',
            params: {to_player: 3}
          })
        } else {
          buttons.push({primary: true, label: 'Claim trick', action: 'claim', params: {to_player: 0}})
        }
      }
      break
  }

  return <div style={{display: 'flex', justifyContent: 'center'}} className='action-bar'>
    {
      buttons.map((button) => <Button className='action-button'
                                      key={button.key || button.action}
                                      color={button.primary ? 'primary' : 'secondary'}
                                      onClick={performAction.bind(button)}>
        {button.label}
      </Button>)
    }
  </div>
}