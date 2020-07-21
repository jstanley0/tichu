function Player({data, vertical, align, turn, trickWinner}) {
  const { Box } = MaterialUI
  return <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: align === 'right' ? 'flex-end' : 'flex-start'}}>
    <PlayerInfo data={data} turn={turn} trickWinner={trickWinner}/>
    <Box width={5} height={5}/>
    <div style={{flexGrow: 1, display: 'flex', flexDirection: vertical ? (align === 'right' ? 'row-reverse' : 'row') : 'column'}}>
      <div>
        <Hand vertical={vertical} align={align} collapse={true} size={data ? data.hand_size : 0}/>
      </div>
      { (data && data.passed_cards) ?
        (<div>
          <PassSplay vertical={vertical} align={align}/>
        </div>) : null }
    </div>
  </div>
}

function PlayerInfo({data, turn, trickWinner}) {
  const { Typography, Chip } = MaterialUI
  return <div className={'playerinfo ' + (turn ? 'playerinfo-turn' : (trickWinner ? 'playerinfo-trickwinner' : ''))}>
      <Typography variant={data ? 'h6' : 'body2'} component='h2'>
        { data ? data.name : 'Waiting for player...'}
      </Typography>
      <Chip label={ data ? data.points_taken : '-'}/>&ensp;
      { data && data.tichu > 0 ?
        (<Chip label={ data.tichu === 200 ? 'GT' : 'T' }
               color={ data.tichu_status === true ? 'primary' :
                      (data.tichu_status === false ? 'secondary' : 'default')}/>) : null }
    </div>
}

function insertIntoArray(array, value, index) {
  const a = Array.from(array)
  a.splice(index, 0, value)
  return a
}

function removeFromArray(array, index) {
  const a = Array.from(array)
  a.splice(index, 1)
  return a
}

function reorderArray(array, source_index, dest_index) {
  const a = Array.from(array)
  const [removed] = a.splice(source_index, 1)
  a.splice(dest_index, 0, removed)
  return a
}

function swapWithArray(array, index, card) {
  const a = Array.from(array)
  if (card) {
    a[index] = card
  } else {
    a.splice(index, 1)
  }
  return a
}

function Player0({gameState, socket}) {
  const { Box } = MaterialUI
  const { useState, useEffect } = React
  const { DragDropContext } = ReactBeautifulDnd

  const [ hand, setHand ] = useState(gameState.players[0].hand)
  const [ cards, setCards ] = useState([])
  const [ passLeft, setPassLeft ] = useState('')
  const [ passAcross, setPassAcross ] = useState('')
  const [ passRight, setPassRight ] = useState('')

  // reconcile hand state with the server
  useEffect(() => {
    let client_cards = hand.concat(cards)
    if (passLeft) client_cards.push(passLeft)
    if (passAcross) client_cards.push(passAcross)
    if (passRight) client_cards.push(passRight)

    // new hand, probably (or back 6, which I want to be sorted into the existing 8)
    if (gameState.players[0].hand.some(card => !client_cards.includes(card))) {
      setHand(gameState.players[0].hand)
      setCards([])
      setPassLeft('')
      setPassAcross('')
      setPassRight('')
      console.log('refreshed hand from server')
      return
    }

    // cards passed or played. remove them from the hand, keeping the player's dragged order intact
    const extra_cards = client_cards.filter(card => !gameState.players[0].hand.includes(card))
    if (extra_cards.length) {
      console.log(`reconciling client cards: removing ${extra_cards.length} extra cards`)
      if (extra_cards.includes(passLeft)) setPassLeft('')
      if (extra_cards.includes(passAcross)) setPassAcross('')
      if (extra_cards.includes(passRight)) setPassRight('')
      setHand(hand.filter(card => !extra_cards.includes(card)))
      setCards(cards.filter(card => !extra_cards.includes(card)))
    }
  }, [gameState.players[0].hand])

  const onDragEnd = (result) => {
    console.log(result)
    const {source, destination, draggableId} = result
    if (!destination) {
      return
    }

    // reorder
    if (destination.droppableId === source.droppableId) {
      switch(destination.droppableId) {
        case 'hand':
          setHand(reorderArray(hand, source.index, destination.index))
          break
        case 'playTarget':
          setCards(reorderArray(cards, source.index, destination.index))
          break
      }
      return
    }

    // hoo boy, this is in dire need of refactoring
    // but the behavior I want (swapping an existing card in the pass area with the source) is not exactly trivial
    switch(destination.droppableId) {
      case 'hand':
        switch(source.droppableId) {
          case 'playTarget':
            setCards(removeFromArray(cards, source.index))
            break
          case 'passLeft':
            setPassLeft('')
            break
          case 'passAcross':
            setPassAcross('')
            break
          case 'passRight':
            setPassRight('')
            break
        }
        setHand(insertIntoArray(hand, draggableId, destination.index))
        break
      case 'playTarget':
        switch(source.droppableId) {
          case 'hand':
            setHand(removeFromArray(hand, source.index))
            break
        }
        setCards(insertIntoArray(cards, draggableId, destination.index))
        break
      case 'passLeft':
        switch(source.droppableId) {
          case 'hand':
            setHand(swapWithArray(hand, source.index, passLeft))
            break
          case 'passAcross':
            setPassAcross(passLeft)
            break
          case 'passRight':
            setPassRight(passLeft)
            break
        }
        setPassLeft(draggableId)
        break
      case 'passAcross':
        switch(source.droppableId) {
          case 'hand':
            setHand(swapWithArray(hand, source.index, passAcross))
            break
          case 'passLeft':
            setPassLeft(passAcross)
            break
          case 'passRight':
            setPassRight(passAcross)
            break
        }
        setPassAcross(draggableId)
        break
      case 'passRight':
        switch(source.droppableId) {
          case 'hand':
            setHand(swapWithArray(hand, source.index, passRight))
            break
          case 'passLeft':
            setPassLeft(passRight)
            break
          case 'passAcross':
            setPassAcross(passRight)
            break
        }
        setPassRight(draggableId)
        break
    }
  }

  return <div style={{display: 'flex', alignItems: 'flex-end'}}>
    <div style={{flexGrow: 1}}/>
    <PlayerInfo data={gameState.players[0]} turn={gameState.turn === 0} trickWinner={gameState.trick_winner === 0}/>
    <Box width={5} height={5}/>
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{display: 'flex', flexDirection: 'column-reverse'}}>
        <Hand0 hand={hand}/>
        { gameState.state === 'passing' ?
          (gameState.players[0].passed_cards ?
            <PassSplay vertical={false} align='left'/>
            : (gameState.players[0].hand_size == 14) ?
              <PassTarget passLeft={passLeft} passAcross={passAcross} passRight={passRight}/>
              : null)
          : (gameState.state == 'playing' ?  <PlayTarget cards={cards}/> : null) }
          <ActionBar gameState={gameState} socket={socket} cards={cards} passLeft={passLeft} passAcross={passAcross} passRight={passRight}/>
      </div>
    </DragDropContext>
    <div style={{flexGrow: 1}}/>
  </div>
}

function Hand0({hand}) {
  const { Draggable, Droppable } = ReactBeautifulDnd

  return <Droppable droppableId='hand' direction='horizontal'>
    {(provided, snapshot) => (
      <div ref={provided.innerRef} {...provided.droppableProps} style={{width: 14*64, height: 88, display: 'flex'}} className={`hand0 ${snapshot.isDraggingOver ? 'card-dragover' : ''}`}>
        {hand.map((card, index) => (
          <Draggable draggableId={card} index={index} key={card}>
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                <FaceCard key={card} card={card} dragging={snapshot.isDragging}/>
                {provided.placeholder}
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
}

function PassHolder({droppableId, caption, card})
{
  const { Draggable, Droppable } = ReactBeautifulDnd

  // FIXME the code intends to swap with the source if you drag onto a pass holder that already has a card
  // and it kinda works but it leaves the Draggable in the PassHolder in a bad state, so just disable dropping
  // on an occupied PassHolder for the moment
  return <Droppable droppableId={droppableId} isDropDisabled={!!card}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.droppableProps} style={{width: 64, height: 88}} className={`passTarget ${snapshot.isDraggingOver ? 'card-dragover' : ''}`}>
          {!card && <div className='pass-holder-arrow'>{caption}</div> }
          {card && (<Draggable draggableId={card} index={0}>
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                <FaceCard key={card} card={card} dragging={snapshot.isDragging}/>
                {provided.placeholder}
              </div>
            )}
          </Draggable>)}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
}

function PassTarget({passLeft, passAcross, passRight}) {
  const { Box } = MaterialUI
  return <div style={{display: 'flex', margin: 5}}>
    <div style={{flexGrow: 1}}/>
    <PassHolder card={passLeft} droppableId='passLeft' caption="&#x2190;"/>
    <Box width={60}/>
    <PassHolder card={passAcross} droppableId='passAcross' caption="&#x2191;"/>
    <Box width={60}/>
    <PassHolder card={passRight} droppableId='passRight' caption="&#x2192;"/>
    <div style={{flexGrow: 1}}/>
  </div>
}

function PlayTarget({cards}) {
  const { Draggable, Droppable } = ReactBeautifulDnd
  return <Droppable droppableId='playTarget' direction='horizontal'>
    {(provided, snapshot) => (
      <div ref={provided.innerRef} {...provided.droppableProps} style={{width: 14*64, height: 88, marginBottom: 5, display: 'flex'}} className={`playTarget ${snapshot.isDraggingOver ? 'card-dragover' : ''}`}>
        {cards.map((card, index) => (
          <Draggable key={card} draggableId={card} index={index}>
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                <FaceCard card={card} dragging={snapshot.isDragging}/>
                {provided.placeholder}
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
}

function ActionBar({gameState, socket, cards, passLeft, passAcross, passRight}) {
  const { Button } = MaterialUI
  const { useMemo, useCallback } = React

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
    const h = { command: this.action, ...this.params }
    socket.send(JSON.stringify(h))
  }

  let buttons = []
  switch(gameState.state) {
  case 'passing':
    if (gameState.players[0].can_gt) {
      buttons.push({label: 'Call Grand Tichu', action: 'grand_tichu'})
    } else if (gameState.players[0].can_tichu) {
      buttons.push({label: 'Call Tichu', action: 'tichu'})
    }

    if (gameState.players[0].hand_size === 8) {
      buttons.push({primary: true, label: 'Take cards', action: 'back6'})
    }
    else if (!gameState.players[0].passed_cards && passLeft && passAcross && passRight) {
      buttons.push({primary: true, label: 'Pass cards', action: 'pass_cards', params: {cards: [passLeft, passAcross, passRight]}})
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
        buttons.push({primary: true, label: `Give trick to ${gameState.players[1].name}`, action: 'claim', params: {to_player: 1}})
        buttons.push({primary: true, label: `Give trick to ${gameState.players[3].name}`, action: 'claim', key: 'claimR', params: {to_player: 3}})
      } else {
        buttons.push({primary: true, label: 'Claim trick', action: 'claim', params: {to_player: 0}})
      }
    }
    break
  }

  return <div style={{display: 'flex', justifyContent: 'center'}} className='action-bar'>
    {
      buttons.map((button, index) => <Button className='action-button'
                                                     key={button.key || button.action}
                                                     color={button.primary ? 'primary' : 'secondary'}
                                                     onClick={performAction.bind(button)}>
        {button.label}
      </Button>)
    }
  </div>
}