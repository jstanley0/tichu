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

function Player0({gameState}) {
  const { Box } = MaterialUI
  const { useCallback } = React
  const { DragDropContext } = ReactBeautifulDnd

  const onDragEnd = useCallback((result) => {

  }, [])

  return <div style={{display: 'flex', alignItems: 'flex-end'}}>
    <div style={{flexGrow: 1}}/>
    <PlayerInfo data={gameState.players[0]}/>
    <Box width={5} height={5}/>
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{display: 'flex', flexDirection: 'column-reverse'}}>
        <Hand0 gameState={gameState}/>
        { gameState.state === 'passing' && !gameState.passed_cards ?
          <PassTarget/> : (gameState.state == 'playing' ?  <PlayTarget/> : null) }
      </div>
    </DragDropContext>
    <div style={{flexGrow: 1}}/>
  </div>
}

function Hand0({gameState}) {
  const { useState } = React
  const { Draggable, Droppable } = ReactBeautifulDnd

  const { hand, setHand } = useState(gameState.hand)

  return <Droppable droppableId='hand' direction='horizontal'>
    {(provided, snapshot) => (
      <div ref={provided.innerRef} {...provided.droppableProps} style={{width: 14*70, height: 90, display: 'flex'}} className='hand0'>
        {(hand || []).map((card, index) => (
          <FaceCard key={index} card={card}/>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
}

function PassTarget({}) {
  const { Droppable } = ReactBeautifulDnd
  const { Box } = MaterialUI
  return <div style={{display: 'flex', margin: 5}}>
    <div style={{flexGrow: 1}}/>
    <Droppable droppableId='passLeft' direction='horizontal'>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.droppableProps} style={{width: 70, height: 90}} className='passTarget'>
          &#x2190;
          {provided.placeholder}
        </div>
      )}
    </Droppable>
    <Box width={10}/>
    <Droppable droppableId='passAcross' direction='horizontal'>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.droppableProps} style={{width: 70, height: 90}} className='passTarget'>
          &#x2191;
          {provided.placeholder}
        </div>
      )}
    </Droppable>
    <Box width={10}/>
    <Droppable droppableId='passRight' direction='horizontal'>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.droppableProps} style={{width: 70, height: 90}} className='passTarget'>
          &#x2192;
          {provided.placeholder}
        </div>
      )}
    </Droppable>
    <div style={{flexGrow: 1}}/>
  </div>
}

function PlayTarget({}) {
  const { Droppable } = ReactBeautifulDnd
  return <Droppable droppableId='playTarget' direction='horizontal'>
    {(provided, snapshot) => (
      <div ref={provided.innerRef} {...provided.droppableProps} style={{width: 14*70, height: 90, margin: 5}} className='playTarget'>
        {provided.placeholder}
      </div>
    )}
  </Droppable>
}
