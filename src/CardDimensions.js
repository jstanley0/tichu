const CardDimensions = {
  reg: {width: 58, height: 82, margin: 3},
  small: {width: 43, height: 61, margin: 2},
  regAreaWidth: n => n * (CardDimensions.reg.width + CardDimensions.reg.margin * 2 + 2),
  regAreaHeight: n => n * (CardDimensions.reg.height + CardDimensions.reg.margin * 2 + 2)
}

Object.freeze(CardDimensions)
export default CardDimensions
