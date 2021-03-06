const http = require('http')
const WebSocket = require('ws')
const express = require('express')
const { clog } = require('../utils/logger')

const startServer = (port) => {
  const app = express()

  app.get('/', (req, res) => {
    res.set('Content-Type', 'text/html')
    res.send(Buffer.from('<h2>Pitcher Watcher HMR</h2>'))
  })

  const server = http.createServer(app)
  const ws = new WebSocket.Server({ server })

  server.listen(port, () => {
    clog('\n[@pitcher/watcher]:', 'white', `HMR Server running on port: ${server.address().port}`, 'cyan')
  })

  return { server, ws }
}

module.exports = startServer
