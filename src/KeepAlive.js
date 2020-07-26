import axios from 'axios'

// ensure ping packets are sent if no messages are transferred in a given period
// but don't keep the connection alive *forever* or I'll run out of free dyno hours
const PING_INTERVAL = 30000
const MAX_PINGS = 60

let intervalId, pingCount = 0, giveUp = false

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
        giveUp = true
        console.log('KeepAlive: timing out FRD')
      }
    }, PING_INTERVAL)
  }
}

Object.freeze(KeepAlive)
export default KeepAlive


// in addition to keeping the WebSocket connections open, we need occasional HTTP requests
// to keep the free dyno from sleeping, which I have learned it will happily do even when
// websocket packets are flying. unlike websocket pings, these run independent of game activity

const HTTP_PING_INTERVAL = 600000
const httpPingIntervalId = setInterval(() => {
  if (giveUp) {
    clearInterval(httpPingIntervalId)
  } else {
    axios.get("/ping")
      .then(response => console.log(`http ping: ${response.data}`))
      .catch(error => { console.log(error); giveUp = true })

  }
}, HTTP_PING_INTERVAL)
