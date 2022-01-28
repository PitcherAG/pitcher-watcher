const portfinder = require('portfinder')
const { error } = require('./logger')

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

module.exports = getFreePort
