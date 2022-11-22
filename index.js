const { send, json } = require('micro')
const compress = require('micro-compress')

module.exports = compress(async (req, res) => {
  const body = await json(req)
  send(res, 200, body)
})
