import React from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import FaceCard from "./FaceCard"

export default function Hand0({hand, selection, toggleSelect}) {
    return <Droppable droppableId='hand' direction='horizontal'>
    {(provided, snapshot) => (
      <div ref={provided.innerRef} {...provided.droppableProps} style={{width: 14*66, height: 88, display: 'flex'}} className={`hand0 ${snapshot.isDraggingOver ? 'card-dragover' : ''}`}>
        {hand.map((card, index) => (
          <Draggable draggableId={card} index={index} key={card}>
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                <FaceCard key={card} card={card} selected={selection[card]} toggleSelect={toggleSelect} dragging={snapshot.isDragging}/>
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
