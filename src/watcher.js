#!/usr/bin/env node
const chokidar = require('chokidar')
const { initialize } = require('./init')
const { findIOSAppDirectory } = require('./utils/ios-folder-finder')
const { findWindowsAppDirectory } = require('./utils/win-folder-finder')
const { cleanDirectory, bashCopy } = require('./utils/file-system')
const { log, clog, error } = require('./utils/logger')

const execWatcher = (chokidarOpts, destination, fileID, clean) => {
  const watcher = chokidar.watch(chokidarOpts.paths, chokidarOpts)

  const copyFiles = () => {
    // clean directory before
    if (clean) cleanDirectory(destination, false)

    bashCopy(chokidarOpts.paths, destination)
  }

  const initialLog = () => {
    console.log()
    log('Waiting for changes...', 'green')
    console.log()
    clog('- File ID:', 'white', fileID, 'cyan')
    clog('- Copy destination:', 'white', destination, 'cyan')
    clog('- Watching paths:', 'white')
    chokidarOpts.paths.forEach((p) => clog(`  - ${p}`, 'green'))
    console.log()
  }

  // Event listeners
  watcher
    .on('unlink', (path) => log(`removed: ${path}`, 'red'))
    .on('change', (path) => {
      log(`changed: ${path}`, 'yellow')
      copyFiles()
    })
    .on('ready', () => {
      copyFiles()
      initialLog()
    })
    .on('error', (err) => error(`[ERROR]: Watcher error: ${err}`))
}

/******************/
/* Starting point */
/******************/

;(async () => {
  // initialize application and get args
  const { platform, fileID, dest, clean, chokidarOpts } = initialize('watcher')

  try {
    let destination = dest

    if (destination) log('Argument --dest provided manually, skipping folder search')

    if (!destination && platform === 'ios') {
      destination = await findIOSAppDirectory(fileID)
    } else if (!destination && (platform === 'win' || platform === 'windows')) {
      destination = await findWindowsAppDirectory(fileID)
    }

    // if everything is fine until this point, start watcher
    await execWatcher(chokidarOpts, destination, fileID, clean)
  } catch (err) {
    error(err.message)
    process.exit(1)
  }
})()
