const { exec } = require('child_process')
const { isDirEmpty } = require('./file-system')
const { log, error } = require('./logger')

const cleanDirectory = (path) => {
  let destination = path.replace(/(\[|\]|\s)/g, '\\$&')

  // add trailing slash, needed for rm to only clean directory
  destination += !destination.endsWith('/') ? '/*' : '*'

  if (isDirEmpty(path)) {
    log('Directory is empty, skipping cleaning')

    return
  }

  log('Directory is not empty, cleaning...')
  exec(`rm -rf ${destination}`, (err) => {
    if (err) {
      error(`Something went wrong while cleaning the directory: ${destination}`)
      error(`${JSON.stringify(err)}`)
      process.exit(1)
    }
  })
}

module.exports = {
  cleanDirectory,
}
