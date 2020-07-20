function History({data}) {
  const { useEffect, useRef } = React
  const { List, ListItem, ListItemText, Divider } = MaterialUI

  const endRef = useRef(null)
  useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" })
  }, data)

  return <div className="history-box">
    <List>
      {
        (data || []).map((entry, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemText>
                { entry.error ? `⚠️ ${entry.error}` : `${entry.text}` }
                { entry.cards && entry.cards.map((card, index) =>
                    <FaceCard key={card} card={card} small={true}/>) }
              </ListItemText>
            </ListItem>
            <Divider/>
          </React.Fragment>
        ))
      }
    </List>
    <div ref={endRef}/>
  </div>
}
