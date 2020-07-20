function History({data}) {
  const { useEffect, useRef } = React
  const { List, ListItem, Typography, Divider } = MaterialUI

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
    <div ref={endRef}/>
  </div>
}
