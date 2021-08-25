const fs = require('fs')
const { exec } = require('child_process')
const { log, error } = require('./logger')

const isDirEmpty = (path) => fs.readdirSync(path).filter((f) => !/^\..*/.test(f)).length === 0

const dirExist = (path) => fs.existsSync(path)

const fixPath = (path) => path.replace(/(\[|\]|\s)/g, '\\$&')

// cleaning with rm -rf
// needs to be from bash because of the file system access rights on windows side
const cleanDirectory = (path, showMessage = true) => {
  return new Promise((resolve, reject) => {
    let destination = fixPath(path)

    // add trailing slash, needed for rm to only clean directory
    destination += !destination.endsWith('/') ? '/*' : '*'

    if (isDirEmpty(path)) {
      log('Directory is empty, skipping cleaning')
      resolve()

      return
    }

    if (showMessage) {
      log('Directory is not empty, cleaning...')
    }

    exec(`rm -rf ${destination}`, (err) => {
      if (err) {
        error(`Something went wrong while cleaning the directory: ${destination}`)
        reject(`${JSON.stringify(err)}`)
        process.exit(1)
      }

      resolve()
    })
  })
}

const bashCopy = (sources, dest, ignored) => {
  let excludeScript = ''

  // if any ignored, build exclude script
  ignored.length && ignored.forEach((v) => (excludeScript += ` --exclude '${v}'`))

  log('copying files...', 'grey')

  // execute copy script for each path
  sources.forEach((src) => {
    exec(`rsync -r ${src} ${fixPath(dest)} ${excludeScript}`, (err) => {
      if (err) {
        error(`Something went wrong while cleaning the directory: ${dest}`)
        error(`${JSON.stringify(err)}`)
        process.exit(1)
      }
    })
  })
}

module.exports = {
  isDirEmpty,
  dirExist,
  cleanDirectory,
  bashCopy,
}
