import React, { useState, useEffect } from "react"
import Box from "@material-ui/core/Box"
import { DragDropContext } from 'react-beautiful-dnd'
import PlayerInfo from "./PlayerInfo"
import PassSplay from "./PassSplay"
import PassTarget from "./PassTarget"
import PlayTarget from "./PlayTarget"
import ActionBar from "./ActionBar"
import Hand0 from "./Hand0"

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

export default function Player0({gameState, socket}) {
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

  const onDragEnd = ({source, destination, draggableId} ) => {
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
