import React from 'react'
import Typography from "@material-ui/core/Typography"
import Chip from "@material-ui/core/Chip"
import TichuIndicator from "./TichuIndicator"

export default function PlayerInfo({data, turn, trickWinner}) {
    return <div className={'playerinfo ' + (turn ? 'playerinfo-turn' : (trickWinner ? 'playerinfo-trickwinner' : ''))}>
      <Typography color={data?.connected ? 'textPrimary' : 'textSecondary'} variant={data ? 'h6' : 'body2'} component='h2'>
        { data ? data.name : 'Waiting for player...'}
      </Typography>
      <div className='tichu-indicator tichu-score'>{ data ? data.points_taken : '-' }</div>&ensp;
      { data?.tichu ? <TichuIndicator tichu={data.tichu} status={data.tichu_status}/> : null }
    </div>
}
