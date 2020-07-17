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
  return <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row'}}>
    <div style={{flexGrow: 1}}/>
    <Card vertical={vertical} rotate={align === 'left' ? -35 : 35}/>
    <Card vertical={vertical} translateX={vertical ? ((align === 'left') ? 20 : -20) : 0}
          translateY={vertical ? 0 : 20}/>
    <Card vertical={vertical} rotate={align === 'left' ? 35 : -35}/>
    <div style={{flexGrow: 1}}/>
  </div>
}