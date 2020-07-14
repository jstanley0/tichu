function Player({data, orientation}) {
  const { Grid, CircularProgress } = MaterialUI

  if (!data) {
    return <CircularProgress/>
  }

  return <Grid container>
    <Grid item xs={12}>
      { data.name }
    </Grid>
  </Grid>
}