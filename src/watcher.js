#!/usr/bin/env node
const chokidar = require('chokidar')
const { initialize } = require('./init')
const { findIOSAppDirectory } = require('./utils/ios-folder-finder')
const { findWindowsAppDirectory } = require('./utils/win-folder-finder')
const { cleanDirectory } = require('./utils/clean')
const { log, error } = require('./utils/logger')

let filePath = null

const defaults = {
  path: '.',
  dest: '',
  ignoreDotFiles: true,

  // chokidar specific
  persistent: true,
  ignored: /(^|[\/\\])\../,
  ignoreInitial: false,
  followSymlinks: true,
  cwd: '.',
  disableGlobbing: false,
  usePolling: false,
  interval: 100,
  binaryInterval: 300,
  alwaysStat: false,
  depth: 99,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100,
  },
  ignorePermissionErrors: false,
  atomic: true,
}

const execWatcher = (destination) => {
  filePath = destination
  // file, dir, glob, or array
  const watcher = chokidar.watch(defaults.src, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
  })

  // Event listeners
  watcher
    // .on('add', (path) => log(`File ${path} has been added`))
    .on('unlink', (path) => log(`File ${path} has been removed`))
    .on('change', (path) => {
      log(`File ${path} has been changed`)
      // copy files here to destination
      console.log('updated:', filePath)
    })
    .on('ready', () => log('[WATCHER]: Initial scan complete. Ready for changes'))
    .on('error', (err) => error(`[ERROR]: Watcher error: ${err}`))
}

/******************/
/* Starting point */
/******************/

;(async () => {
  // initialize application and get args
  const { platform, fileID, dest, clean } = initialize('watcher')

  try {
    let destination = dest

    if (destination) log('Argument --dest provided manually, skipping folder search')

    if (!destination && platform === 'ios') {
      destination = await findIOSAppDirectory(fileID)
    } else if (!destination && (platform === 'win' || platform === 'windows')) {
      destination = await findWindowsAppDirectory(fileID)
    }

    // if (clean) {
    //   cleanDirectory(destination)
    // }

    // // if everything is fine until this point, start watcher
    // await execWatcher(vueArgs, destination, platform)
  } catch (err) {
    error(err.message)
    process.exit(1)
  }
})()
