const { send } = require('micro')
const { router, get } = require('microrouter')
const { getCAs, fetchCAData } = require('./utils/gearbox')
const compress = require('micro-compress')
const checkCache = require('./utils/cache')

const fetchAllCAs = async (req, res) => {
  const data = await checkCache(req.url, getCAs)
  return send(res, 200, data)
}
const fetchCA = async (req, res) => {
  const ca = await fetchCAData(req.params.hash)
  return send(res, 200, ca)
}

module.exports = compress(
  router(
    get('/credit-accounts', fetchAllCAs),
    get('/credit-account/:hash', fetchCA)
  )
)
