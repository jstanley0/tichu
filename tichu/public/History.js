function History({data}) {
  const { List, ListItem, ListItemText, Divider } = MaterialUI

  return <div className="history-box">
    <List>
      {
        (data || []).map((entry, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemText>
                { entry }
              </ListItemText>
            </ListItem>
            <Divider/>
          </React.Fragment>
        ))
      }
    </List>
  </div>
}
