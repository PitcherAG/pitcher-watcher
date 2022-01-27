const http = require('http')
const WebSocket = require('ws')
const express = require('express')
const portfinder = require('portfinder')
const { log, error } = require('../utils/logger')

// eslint-disable-next-line consistent-return
const getFreePort = async (port) => {
  try {
    return await portfinder.getPortPromise({
      port, // minimum port
      stopPort: port + 1000, // maximum port
    })
  } catch (e) {
    error('[ERROR]: Something went wrong when trying to find a free port for HMR server!')
    error(e)
  }
}

const startServer = async (_port) => {
  const port = await getFreePort(_port)
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
    log(`HMR Server running on port: ${server.address().port}`)
  })

  return { port, server, wss }
}

module.exports = startServer
