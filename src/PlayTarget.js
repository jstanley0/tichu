import React from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import FaceCard from "./FaceCard"

export default function PlayTarget({cards}) {
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
