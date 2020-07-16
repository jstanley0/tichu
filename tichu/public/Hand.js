function Hand({vertical, size, collapse}) {
  let cards = []
  for(let i = 0; i < size; ++i) {
    cards.push(<Card vertical={vertical} collapse={collapse} key={i} label={collapse && (i === size - 1) ? size : null}/>)
  }

  return <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row'}}>
    {cards}
  </div>
}
