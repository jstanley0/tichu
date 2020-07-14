function Player({data, orientation, align}) {
  const { Grid, Typography, CircularProgress } = MaterialUI

  return <Grid container>
    <Grid item xs={12}>
      <Typography variant='h6' component='h2' align={orientation == 'v' ? align : 'center'}>
        { data ? data.name : 'Waiting...' }
      </Typography>
    </Grid>
  </Grid>
}