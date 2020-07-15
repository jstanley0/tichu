function Player({data, vertical, align}) {
  const { Grid, Typography, Chip } = MaterialUI

  if (!data) {
    return <Typography variant='body1' color='secondary' align={vertical ? align : 'center'}>Waiting...</Typography>
  }

  return <Grid container>
    <Grid item xs={12}>
      <Typography variant='h6' component='span'>
        { data.name }
      </Typography>
      <Typography component='span'>
        { data.tichu }
      </Typography>
      <Typography component='span'>
        { data.points_taken }
      </Typography>
    </Grid>
    <Grid item xs={vertical ? 6 : 12}>
      <Hand vertical={vertical} align={align} size={data.hand_size}/>
    </Grid>
    { data.passed_cards ? (
    <Grid item xs={vertical ? 6 : 12}>
      <Hand vertical={vertical} align={align} size={3} skew={true}/>
    </Grid>) : null }
  </Grid>
}
