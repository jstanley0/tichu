import React from "react"

export default function TichuIndicator({tichu, status}) {
  const text = (tichu === 200 ? 'GT' : 'T')
  return <div className={`tichu-indicator ${status === true ? 'tichu-success' : (status === false ? 'tichu-fail' : 'tichu-pending')}`}>{text}</div>
}
