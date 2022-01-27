const http = require('http')
const WebSocket = require('ws')
const express = require('express')
const { log } = require('../utils/logger')

const startServer = (port) => {
  /*
      TO DO:
      check port first if available
      https://github.com/http-party/node-portfinder
  */
  const app = express()

  app.get('/', (req, res) => {
    res.set('Content-Type', 'text/html')
    res.send(Buffer.from('<h2>Pitcher Watcher HMR</h2>'))
  })

  const server = http.createServer(app)
  const wss = new WebSocket.Server({ server })

  // wss.on('connection', (ws) => {
  //   ws.on('message', (msg) => {
  //     // received message
  //     console.log('received: %s', msg)
  //   })
  // })

  server.listen(port, () => {
    log(`HMR Server listening on port: ${server.address().port}`)
  })

  return { wss, server }
}

module.exports = startServer
