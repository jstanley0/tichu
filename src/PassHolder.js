import React from "react"
import { Draggable, Droppable } from 'react-beautiful-dnd'
import FaceCard from "./FaceCard"

export default function PassHolder({droppableId, caption, card})
{
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