// ensure ping packets are sent if no messages are transferred in a given period
// but don't keep the connection alive *forever* or I'll run out of free dyno hours
const PING_INTERVAL = 30000
const MAX_PINGS = 60

let intervalId, pingCount = 0

const KeepAlive = {
  reset: (websocket) => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    pingCount = 0
    intervalId = setInterval(() => {
      console.log('KeepAlive: ping')
      websocket.send('ping')
      if (++pingCount >= MAX_PINGS) {
        clearInterval(intervalId)
        intervalId = null
        console.log('KeepAlive: timing out FRD')
      }
    }, PING_INTERVAL)
  }
}

Object.freeze(KeepAlive)
export default KeepAlive
