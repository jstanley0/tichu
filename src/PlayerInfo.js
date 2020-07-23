import React from 'react'
import Typography from "@material-ui/core/Typography"
import Chip from "@material-ui/core/Chip"

export default function PlayerInfo({data, turn, trickWinner}) {
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
