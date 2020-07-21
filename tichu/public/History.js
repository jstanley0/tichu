function History({data}) {
  const { useEffect } = React
  const { List, ListItem, Typography, Divider } = MaterialUI

  useEffect(() => {
    // sometimes it just doesn't want to scroll far enough.
    // wondering if it's because we scroll before the history is fully rendered?
    setTimeout(() => document.getElementById('history-list-end').scrollIntoView(), 100)
    setTimeout(() => document.getElementById('history-list-end').scrollIntoView(), 1000)
    setTimeout(() => document.getElementById('history-list-end').scrollIntoView(), 3000)
  }, [data])

  return <div className="history-box">
    <List>
      {
        (data || []).map((entry, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <Typography>{ entry.error ? `⚠️ ${entry.error}` : entry.text }</Typography>
                &ensp;
                { entry.cards && entry.cards.map((card, index) =>
                  <FaceCard card={card} small={true}/>) }
            </ListItem>
            <Divider/>
          </React.Fragment>
        ))
      }
    </List>
    <div id='history-list-end'/>
  </div>
}
