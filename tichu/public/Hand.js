function Hand({vertical, size, collapse}) {
  let cards = []
  for(let i = 0; i < size; ++i) {
    cards.push(<Card vertical={vertical} collapse={collapse} key={i} label={collapse && (i === size - 1) ? size : null}/>)
  }
  return <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row'}}>
    {cards}
  </div>
}

function PassSplay({vertical, align}) {
  return <div style={{display: 'flex', justifyContent: 'center',
                      flexDirection: vertical ? 'column' : 'row',
                      height: vertical ? '100%' : 'initial',
                      marginLeft: vertical && (align === 'left') ? -10 : 0,
                      marginRight: vertical && (align !== 'left') ? -10 : 0,
                      marginTop: !vertical && (align !== 'left') ? -10 : 0,
                      marginBottom: !vertical && (align === 'left') ? -10 : 0
                    }}>
    <Card vertical={vertical} rotate={align === 'left' ? -40 : 40}/>
    <Card vertical={vertical} translateX={vertical ? ((align === 'left') ? 20 : -20) : 0}
          translateY={vertical ? 0 : (align === 'left') ? -20 : 20}/>
    <Card vertical={vertical} rotate={align === 'left' ? 40 : -40}/>
  </div>
}