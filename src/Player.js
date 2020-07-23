import React from "react"
import Box from "@material-ui/core/Box"
import PlayerInfo from "./PlayerInfo"
import PassSplay from "./PassSplay"
import Hand from "./Hand"

export default function Player({data, vertical, align, turn, trickWinner}) {
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
