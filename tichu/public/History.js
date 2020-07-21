function History({data}) {
  const { useEffect } = React
  const { List, ListItem, Typography, Divider } = MaterialUI

  function scrollHistory() {
    console.log('scrolling...')
    document.getElementById('history-list-end').scrollIntoView()
  }

  useEffect(() => {
    // sometimes it just doesn't want to scroll far enough.
    // wondering if it's because we scroll before the history is fully rendered?
    console.log('history change detected')
    setTimeout(scrollHistory, 100)
    setTimeout(scrollHistory, 1000)
  }, [data.length && data[data.length - 1].id])

  return <div className="history-box">
    <List>
      {
        data.map((entry) => (
          <div key={entry.id}>
            <ListItem>
              <Typography>{ entry.error ? `⚠️ ${entry.error}` : entry.text }</Typography>
                &ensp;
                { entry.cards && entry.cards.map((card, index) =>
                  <FaceCard card={card} key={card} small={true}/>) }
            </ListItem>
            <Divider/>
          </div>
        ))
      }
    </List>
    <div id='history-list-end'/>
  </div>
}
