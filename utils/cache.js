let cache = {}

const MAX_AGE = 30 * 60 * 1000

const fetch = async (key, func) => {
  // Block duplicate fetches for the same data
  if (!cache[key]) {
    cache[key] = { age: new Date().getTime(), data: {} }
  } else {
    cache[key] = { ...cache[key], age: new Date().getTime() }
  }

  console.log('Caching route: ', key)
  console.time('Route Cached')
  const data = await func()
  console.timeEnd('Route Cached')
  cache[key] = { age: new Date().getTime(), data }
  return data
}

const checkCache = async (key, func) => {
  // if cache is empty, block until we have inital data
  if (!cache[key]) return await fetch(key, func)

  const isStale = cache[key].age + MAX_AGE < new Date().getTime()

  if (isStale) {
    console.log('Fetching new data')
    fetch(key, func)
    return cache[key].data
  } else {
    console.log('Returning cached data: ', cache[key].age)
    return cache[key].data
  }
}

module.exports = checkCache
