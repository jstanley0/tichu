function Player({data, vertical, align}) {
  const { Box } = MaterialUI
  return <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: align === 'right' ? 'flex-end' : 'flex-start'}}>
    <PlayerInfo data={data}/>
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

function PlayerInfo({data}) {
  const { Typography, Chip } = MaterialUI
  return <div>
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

function Player0({gameState, socket}) {
  const { Box } = MaterialUI
  const { useState, useCallback } = React
  const { DragDropContext } = ReactBeautifulDnd

  const [ hand, setHand ] = useState(gameState.players[0].hand)
  const [ cards, setCards ] = useState([])
  const [ card0, setCard0 ] = useState('')
  const [ card1, setCard1 ] = useState('')
  const [ card2, setCard2 ] = useState('')

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
        case 'cards':
          setCards(reorderArray(cards, source.index, destination.index))
          break
      }
      return
    }

    // hoo boy, this is in dire need of refactoring
    switch(destination.droppableId) {
      case 'hand':
        switch(source.droppableId) {
          case 'playTarget':
            setCards(removeFromArray(cards, source.index))
            break
          case 'passLeft':
            setCard0('')
            break
          case 'passAcross':
            setCard1('')
            break
          case 'passRight':
            setCard2('')
            break
        }
        setHand(insertIntoArray(hand, draggableId, destination.index))
        break
      case 'playTarget':
        switch(source.droppableId) {
          case 'hand':
            setHand(removeFromArray(hand, source.index))
            break
          case 'passLeft':
            setCard0('')
            break
          case 'passAcross':
            setCard1('')
            break
          case 'passRight':
            setCard2('')
            break
        }
        setCards(insertIntoArray(cards, draggableId, destination.index))
        break
      case 'passLeft':
        switch(source.droppableId) {
          case 'hand':
            setHand(removeFromArray(hand, source.index))
            break
          case 'playTarget':
            setCards(removeFromArray(cards, source.index))
            break
          case 'passAcross':
            if (card0) {
              setCard1(card0)
            }
            break
          case 'passRight':
            if (card0) {
              setCard2(card0)
            }
            break
        }
        setCard0(draggableId)
        break
      case 'passAcross':
        switch(source.droppableId) {
          case 'hand':
            setHand(removeFromArray(hand, source.index))
            break
          case 'playTarget':
            setCards(removeFromArray(cards, source.index))
            break
          case 'passLeft':
            if (card1) {
              setCard0(card1)
            }
            break
          case 'passRight':
            if (card1) {
              setCard2(card1)
            }
            break
        }
        setCard1(draggableId)
        break
      case 'passRight':
        switch(source.droppableId) {
          case 'hand':
            setHand(removeFromArray(hand, source.index))
            break
          case 'playTarget':
            setCards(removeFromArray(cards, source.index))
            break
          case 'passLeft':
            if (card2) {
              setCard0(card2)
            }
            break
          case 'passAcross':
            if (card2) {
              setCard1(card2)
            }
            break
        }
        setCard2(draggableId)
        break
    }
  }

  return <div style={{display: 'flex', alignItems: 'flex-end'}}>
    <div style={{flexGrow: 1}}/>
    <PlayerInfo data={gameState.players[0]}/>
    <Box width={5} height={5}/>
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{display: 'flex', flexDirection: 'column-reverse'}}>
        <Hand0 hand={hand}/>
        { gameState.state === 'passing' ?
          (gameState.passed_cards ?
            <PassSplay vertical={false} align='left'/>
            : (gameState.players[0].hand.size == 14) ?
              <PassTarget card0={card0} card1={card1} card2={card2}/>
              : null)
          : (gameState.state == 'playing' ?  <PlayTarget cards={cards}/> : null) }
      </div>
    </DragDropContext>
    <div style={{flexGrow: 1}}/>
  </div>
}

function Hand0({hand}) {
  const { Draggable, Droppable } = ReactBeautifulDnd

  return <Droppable droppableId='hand' direction='horizontal'>
    {(provided, snapshot) => (
      <div ref={provided.innerRef} {...provided.droppableProps} style={{width: 14*70, height: 90, display: 'flex'}} className='hand0'>
        {hand.map((card, index) => (
          <Draggable draggableId={card} index={index} key={card}>
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                <FaceCard key={card} card={card}/>
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

  return <Droppable droppableId={droppableId} direction='horizontal'>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.droppableProps} style={{width: 70, height: 90}} className='passTarget'>
          {caption}
          {card && (<Draggable draggableId={card} index={0}>
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                <FaceCard key={card}/>
                {provided.placeholder}
              </div>
            )}
          </Draggable>)}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
}

function PassTarget({card0, card1, card2}) {
  const { Box } = MaterialUI
  return <div style={{display: 'flex', margin: 5}}>
    <div style={{flexGrow: 1}}/>
    <PassHolder card={card0} droppableId='passLeft' caption="&#x2190;"/>
    <Box width={10}/>
    <PassHolder card={card1} droppableId='passAcross' caption="&#x2190;"/>
    <Box width={10}/>
    <PassHolder card={card2} droppableId='passRight' caption="&#x2190;"/>
    <div style={{flexGrow: 1}}/>
  </div>
}

function PlayTarget({cards}) {
  const { Draggable, Droppable } = ReactBeautifulDnd
  return <Droppable droppableId='playTarget' direction='horizontal'>
    {(provided, snapshot) => (
      <div ref={provided.innerRef} {...provided.droppableProps} style={{width: 14*70, height: 90, margin: 5}} className='playTarget'>
        {cards.map((card, index) => (
          <Draggable draggableId={card} index={index}>
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                <FaceCard key={card} card={card}/>
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
