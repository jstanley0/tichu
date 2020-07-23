import React from 'react'
import CardBack from './CardBack'

export default function PassSplay({vertical, align}) {
  return <div style={{display: 'flex', justifyContent: 'center',
                      flexDirection: vertical ? 'column' : 'row',
                      height: vertical ? '100%' : 'initial',
                      marginLeft: vertical && (align === 'left') ? -10 : 0,
                      marginRight: vertical && (align !== 'left') ? -10 : 0,
                      marginTop: !vertical && (align !== 'left') ? -10 : 0,
                      marginBottom: !vertical && (align === 'left') ? -10 : 0
                    }}>
    <CardBack vertical={vertical} rotate={align === 'left' ? -40 : 40}/>
    <CardBack vertical={vertical} translateX={vertical ? ((align === 'left') ? 20 : -20) : 0}
          translateY={vertical ? 0 : (align === 'left') ? -20 : 20}/>
    <CardBack vertical={vertical} rotate={align === 'left' ? 40 : -40}/>
  </div>
}
