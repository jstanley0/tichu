function History({data}) {
  const { List, ListItem, ListItemText, Divider } = MaterialUI

  // I do not understand this React magic
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }


  return <List>
    {
      data.map((entry, index) => (
        <React.Fragment>
          <ListItem key={index}>
            <ListItemText>
              { entry }
            </ListItemText>
          </ListItem>
          <Divider/>
        </React.Fragment>
      ))
    }
  </List>

}
