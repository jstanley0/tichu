import React from "react"
import Box from "@material-ui/core/Box"
import PlayerInfo from "./PlayerInfo"
import Splay from "./Splay"

export default function Player({data, vertical, align, turn, trickWinner}) {
  return <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: align === 'right' ? 'flex-end' : 'flex-start'}}>
    <PlayerInfo data={data} turn={turn} trickWinner={trickWinner}/>
    <Box width={5} height={5}/>
    <div style={{flexGrow: 1, display: 'flex', flexDirection: vertical ? (align === 'right' ? 'row-reverse' : 'row') : (align === 'right' ? 'column-reverse' : 'column')}}>
      <div>
        <Splay vertical={vertical} align={align} labeled={true} size={data ? data.hand_size : 0} angle={30} collapse={true} flip={align === 'right'}/>
      </div>
      { (data && data.passed_cards) ?
        (<div>
          <Splay vertical={vertical} align={align} size={3} angle={120} flip={align === 'right'}/>
        </div>) : null }
    </div>
  </div>
}
