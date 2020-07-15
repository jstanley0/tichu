function Hand({vertical, align, size, skew}) {
  let cards = []
  for(let i = 0; i < size; ++i) {
    cards.push(<Card vertical={vertical} key={i}/>)
  }

  return <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row'}}>
    {cards}
  </div>
}
