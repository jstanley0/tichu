import React from 'react'
import Box from "@mui/material/Box"
import PassHolder from "./PassHolder"

export default function PassTarget({passLeft, passAcross, passRight}) {
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