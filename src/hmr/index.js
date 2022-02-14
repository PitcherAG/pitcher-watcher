/**
|--------------------------------------------------
| Pitcher Watcher Webpack Plugin
|--------------------------------------------------
**/

const startServer = require('./socket-server')
const ip = require('ip')

const pluginName = 'PitcherWatcherPlugin'

class PitcherWatcherPlugin {
  constructor(options = {}) {
    // parse options
    this.port = options.port
    this.mode = options.mode || 'hot'
    // destination of project files
    this.destination = options.destination
    this.isLiveOrHot = ['hot', 'live'].includes(this.mode)
    // server & websocket instances set by useHMR function
    this.server = undefined
    this.wss = undefined

    // bundle files (js/css)
    this.files = {
      current: [],
      updated: [],
    }

    if (this.isLiveOrHot) {
      process.env.VUE_APP_HMR = true
      process.env.VUE_APP_HMR_MODE = this.mode
      process.env.VUE_APP_HMR_IP = ip.address()
      process.env.VUE_APP_HMR_PORT = this.port

      // sets server and wss
      this.useHMR()
    }
  }

  apply(compiler) {
    // do not continue if mode is not hot or live
    if (!this.isLiveOrHot) return

    // HMR helper for consumer project, inject WebSocket file to listen events
    compiler.hooks.entryOption.tap(pluginName, (ctx, entry) => {
      if (process.env.NODE_ENV === 'development') {
        entry.hmr_helper = ['@pitcher/watcher/src/hmr/hmr-helper.js']
      }
    })

    const extensions = ['.js', '.css']
    const blocked = ['hmr_helper', 'polyfill', 'chunk-vendors']

    // Emit global message through Node.js when compiled
    compiler.hooks.done.tap(pluginName, (stats) => {
      const bundleFiles = Array.from(stats.compilation.assetsInfo.keys())

      const filteredFiles = bundleFiles
        .filter((fileName) => extensions.some((ext) => fileName.endsWith(ext)))
        .filter((fileName) => blocked.every((str) => !fileName.includes(str)))

      // save updated files first
      this.files.updated = filteredFiles

      // Send message to each client
      this.wss.clients.forEach((client) => {
        if (this.mode === 'hot') {
          client.send(JSON.stringify({ event: 'HOT_RELOAD', files: this.files }))

          return
        }
        client.send(JSON.stringify({ event: 'LIVE_RELOAD' }))
      })

      // save updated files as current after sending message to all clients
      this.files.current = filteredFiles
    })
  }
  useHMR() {
    const { server, wss } = startServer(this.port)

    this.server = server
    this.wss = wss
  }
}

module.exports = PitcherWatcherPlugin
