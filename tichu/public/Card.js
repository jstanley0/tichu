function Card({vertical, collapse, label, rotate, translateX, translateY}) {
  const { Box, Typography } = MaterialUI
  const cm = collapse && !label ? -40 : 2
  return <MaterialUI.Card variant="outlined" style={{
    marginRight: vertical ? 2 : cm,
    marginBottom: vertical ? cm : 2,
    width: vertical ? 84 : 60,
    height: vertical ? 60 : 84,
    transform: rotate ? `rotate(${rotate}deg)` :
      (translateX ? `translateX(${translateX}px)` :
        (translateY ? `translateY(${translateY}px)` :
          null))
  }}>
    <Box width={vertical ? 74 : 50} height={vertical ? 50 : 74} style={{backgroundColor: '#e0e0f0', margin: 5}}>
      <Typography>&ensp;{label}</Typography>
    </Box>
  </MaterialUI.Card>
}
