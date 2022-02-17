#!/usr/bin/env node
const chokidar = require('chokidar')
const { exec } = require('child_process')
const { initialize } = require('./init')
const { findIOSAppDirectory } = require('./utils/ios-folder-finder')
const { findWindowsAppDirectory } = require('./utils/win-folder-finder')
const { cleanDirectory, bashCopy } = require('./utils/file-system')
const { useHtmlInject, emitChangesToClients } = require('./hmr/legacy-hmr')
const startWSServer = require('./hmr/socket-server')
const { log, clog, error } = require('./utils/logger')

const initialLog = (fileID, destination, paths) => {
  console.log()
  log('Waiting for changes...', 'green')
  console.log()
  clog('- File ID:', 'white', fileID, 'cyan')
  clog('- Copy destination:', 'white', destination, 'cyan')
  clog('- Watching paths:', 'white')
  paths.forEach((p) => clog(`  - ${p}`, 'green'))
  console.log()
}

// variable to store changed files, cleared after copy
const changedFiles = new Set()

const execWatcher = async (chokidarOpts, destination, fileID, clean, execAfter, hmr) => {
  const watcher = chokidar.watch(chokidarOpts.paths, chokidarOpts)
  const isHotOrLive = ['hot', 'live'].includes(hmr.mode)
  const socketServer = isHotOrLive ? startWSServer(hmr.port) : undefined
  let copyTimer = null

  const execAfterAction = async () => {
    // clean directory before
    if (clean) await cleanDirectory(destination, false)

    // default execute action after file changes
    if (!execAfter) {
      await bashCopy(chokidarOpts.paths, destination, chokidarOpts.ignored)

      // if HMR is active
      if (isHotOrLive) {
        // move helper.js to destination & inject to index.html file
        await useHtmlInject(hmr, destination)
        // emit changes through websocket server
        emitChangesToClients(socketServer.wss, hmr.mode, changedFiles)
      }

      // clear changed file list copy operation
      changedFiles.clear()

      return
    }

    // custom execute action after file changes
    exec(execAfter, (err) => {
      log(`Executing custom script: ${execAfter}`, 'grey')
      if (err) {
        error(`Something went wrong the script: ${execAfter}`)
        error(`${JSON.stringify(err)}`)
        process.exit(1)
      }
    })
  }

  // Event listeners
  watcher
    .on('unlink', (path) => log(`removed: ${path}`, 'red'))
    .on('change', async (path) => {
      changedFiles.add(path)

      if (copyTimer) clearTimeout(copyTimer)

      // execute script with timeout, otherwise it is runned for each file change
      copyTimer = setTimeout(() => {
        changedFiles.forEach((filePath) => log(`changed: ${filePath}`, 'yellow'))
        execAfterAction()
      }, 600)
    })
    .on('ready', async () => {
      await execAfterAction()
      initialLog(fileID, destination, chokidarOpts.paths)
    })
    .on('error', (err) => error(`[ERROR]: Watcher error: ${err}`))
}

/******************/
/* Starting point */
/******************/

;(async () => {
  // initialize application and get args
  const { platform, fileID, dest, clean, chokidarOpts, execAfter, hmr } = await initialize('watcher')

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
    await execWatcher(chokidarOpts, destination, fileID, clean, execAfter, hmr)
  } catch (err) {
    error(err.message)
    process.exit(1)
  }
})()
