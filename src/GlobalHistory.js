let globalHistory = []
let nextId = 0

const GlobalHistory = {
  consume: (log_entries, error, return_window) => {
    log_entries.forEach(entry => {
      globalHistory.push({...entry, id: nextId++})
    })
    if (error) {
      globalHistory.push({error, id: nextId++})
    }
    return globalHistory.slice(globalHistory.length - Math.min(globalHistory.length, return_window), globalHistory.length)
  }

}

Object.freeze(GlobalHistory)
export default GlobalHistory
