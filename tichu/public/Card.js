function Card({vertical}) {
  const { Box } = MaterialUI

  return <MaterialUI.Card variant="outlined" style={{margin: 2}}><Box width={vertical ? 70 : 50} height={vertical ? 50 : 70}/></MaterialUI.Card>
}
