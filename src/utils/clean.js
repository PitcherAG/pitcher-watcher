const fs = require('fs')
const { exec } = require('child_process')
const { error } = require('./logger')

const isDirEmpty = (path) => fs.readdirSync(path).length === 0

const cleanDirectory = (path, platform) => {
  let destination = path

  if (platform === 'win' || platform === 'windows') {
    destination = destination.replace(/(\[|\]|\s)/g, '\\$&')
  }

  // add trailing slash, needed for rm to only clean directory
  destination += !destination.endsWith('/') ? '/*' : '*'

  if (!isDirEmpty(path)) {
    exec(`rm -r ${destination}`, (err) => {
      if (err) {
        error(`Something went wrong while cleaning the directory: ${destination}`)
        error(`${JSON.stringify(err)}`)
        process.exit(1)
      }
    })
  }
}

module.exports = {
  cleanDirectory,
}
