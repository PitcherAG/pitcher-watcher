#!/usr/bin/env node
const chokidar = require('chokidar')
const { exec } = require('child_process')
const { initialize } = require('./init')
const { findIOSAppDirectory } = require('./utils/ios-folder-finder')
const { findWindowsAppDirectory } = require('./utils/win-folder-finder')
const { cleanDirectory, bashCopy } = require('./utils/file-system')
const { log, clog, error } = require('./utils/logger')

const execWatcher = async (chokidarOpts, destination, fileID, clean, execAfter) => {
  const watcher = chokidar.watch(chokidarOpts.paths, chokidarOpts)
  let timer = null

  const execAfterAction = async () => {
    // clean directory before
    if (clean) await cleanDirectory(destination, false)

    if (!execAfter) {
      bashCopy(chokidarOpts.paths, destination, chokidarOpts.ignored)

      return
    }

    exec(execAfter, (err) => {
      log(`Executing script: ${execAfter}`, 'grey')
      if (err) {
        error(`Something went wrong the script: ${execAfter}`)
        error(`${JSON.stringify(err)}`)
        process.exit(1)
      }
    })
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
    .on('change', async (path) => {
      log(`changed: ${path}`, 'yellow')

      if (timer) clearTimeout(timer)
      // execute script with timeout, otherwise it is runned for each file change
      timer = setTimeout(execAfterAction, 600)
    })
    .on('ready', () => {
      execAfterAction()
      initialLog()
    })
    .on('error', (err) => error(`[ERROR]: Watcher error: ${err}`))
}

/******************/
/* Starting point */
/******************/

;(async () => {
  // initialize application and get args
  const { platform, fileID, dest, clean, chokidarOpts, execAfter } = initialize('watcher')

  try {
    // if user set the destination folder manually
    let destination = dest

    if (destination) log('Argument --dest provided manually, skipping folder search')

    if (!destination && platform === 'ios') {
      destination = await findIOSAppDirectory(fileID)
    } else if (!destination && (platform === 'win' || platform === 'windows')) {
      destination = await findWindowsAppDirectory(fileID)
    }

    // if everything is fine until this point, start watcher
    await execWatcher(chokidarOpts, destination, fileID, clean, execAfter)
  } catch (err) {
    error(err.message)
    process.exit(1)
  }
})()
