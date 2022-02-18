const fs = require('fs')
const { exec } = require('child_process')
const { log, error } = require('./logger')

const isDirEmpty = (path) => fs.readdirSync(path).filter((f) => !/^\..*/.test(f)).length === 0

const dirExist = (path) => fs.existsSync(path)

const fixPath = (path) => path.replace(/(\[|\]|\s)/g, '\\$&')

// cleaning with rm -rf
// needs to be from bash because of the file system access rights on windows side
const cleanDirectory = (path, showMessage = true) => {
  return new Promise((resolve) => {
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
        error(`${JSON.stringify(err)}`)
        process.exit(1)
      }

      resolve()
    })
  })
}

const bashCopy = (sources, dest, ignored = []) => {
  return new Promise((resolve) => {
    let excludeScript = ''

    // if any ignored, build exclude script
    ignored.length && ignored.forEach((v) => (excludeScript += ` --exclude '${v}'`))

    // join each path with space
    exec(`rsync -r ${sources.join(' ')} ${fixPath(dest)} ${excludeScript}`, (err) => {
      if (err) {
        error(`Something went wrong while running the copy script!`)
        error(`${JSON.stringify(err)}`)
        process.exit(1)
      }

      log('copied files', 'magenta')
      resolve()
    })
  })
}

// gets the folder name with parent folder name
const getFolderNameWithParent = (path) => {
  const secondLastIndex = path.lastIndexOf('/', path.lastIndexOf('/') - 1)

  return path.substring(secondLastIndex + 1)
}

module.exports = {
  isDirEmpty,
  dirExist,
  cleanDirectory,
  bashCopy,
  getFolderNameWithParent,
}
