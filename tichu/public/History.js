function History({data}) {
  const { List, ListItem, ListItemText, Divider } = MaterialUI

  return <div style={{display: 'flex', flexDirection: 'column'}}>
    <div style={{flexGrow: 1}}/>
    <div style={{maxHeight: '100%', overflowY: 'scroll'}}>
      <List style={{margin: 40}}>
        {
          data.map((entry, index) => (
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
  </div>

}
