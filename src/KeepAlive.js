import axios from 'axios'

// ensure ping packets are sent if no messages are transferred in a given period
// but don't keep the connection alive *forever* or I'll run out of free dyno hours
const WS_PING_INTERVAL = 30000
const MAX_WS_PINGS = 60

// in addition to keeping the WebSocket connections open, we need occasional HTTP requests
// to keep the free dyno from sleeping, which I have learned it will happily do even when
// websocket packets are flying. unlike websocket pings, these run independent of game activity
// (but should not start until the game does)
const HTTP_PING_INTERVAL = 600000

let wsPingIntervalId, httpPingIntervalId, stopped = false, pingCount = 0

function dnr() {
  console.log('KeepAlive: DNR')
  if (wsPingIntervalId) {
    clearInterval(wsPingIntervalId)
    wsPingIntervalId = null
  }
  if (httpPingIntervalId) {
    clearInterval(httpPingIntervalId)
    httpPingIntervalId = null
  }
  stopped = true
}

function setHttpPingInterval() {
  return setInterval(() => {
      axios.get("/ping")
        .then(response => console.log(`http ping: ${response.data}`))
        .catch(error => { console.log(error); dnr() })
  }, HTTP_PING_INTERVAL)
}

function setWsPingInterval(websocket) {
  return setInterval(() => {
    console.log('KeepAlive: ping')
    websocket.send('ping')
    if (++pingCount >= MAX_WS_PINGS) {
      dnr()
    }
  }, WS_PING_INTERVAL)
}

const KeepAlive = {
  reset: (websocket) => {
    // this isn't reset with websocket activity, but shouldn't be started until the game starts
    if (!httpPingIntervalId) {
      httpPingIntervalId = setHttpPingInterval()
    }

    // a message was received; we can cancel the scheduled ping packet
    if (wsPingIntervalId) {
      clearInterval(wsPingIntervalId)
    }

    // reset ping count and reschedule the next keepalive ping
    pingCount = 0
    wsPingIntervalId = setWsPingInterval(websocket)
  },

  stop: () => {
    // the game is over, so stop burning my free dyno hours
    dnr()
  },

  gameOver: () => {
    return stopped
  }
}

Object.freeze(KeepAlive)
export default KeepAlive
