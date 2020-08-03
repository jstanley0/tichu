const CardDimensions = {
  reg: {width: 60, height: 84, margin: 3},
  small: {width: 45, height: 63, margin: 2},
  regAreaWidth: n => n * (CardDimensions.reg.width + CardDimensions.reg.margin * 2),
  regAreaHeight: n => n * (CardDimensions.reg.height + CardDimensions.reg.margin * 2)
}

Object.freeze(CardDimensions)
export default CardDimensions
