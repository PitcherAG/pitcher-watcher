#!/usr/bin/env node
const chokidar = require('chokidar')
const { exec } = require('child_process')
const { initialize } = require('./init')
const { findIOSAppDirectory } = require('./utils/ios-folder-finder')
const { findWindowsAppDirectory } = require('./utils/win-folder-finder')
const { log, error } = require('./utils/logger')

let filePath = null

const options = {
  paths: '',
}

const execWatcher = (destination) => {
  filePath = destination
  // file, dir, glob, or array
  const watcher = chokidar.watch('src/', {
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
}

/******************/
/* Starting point */
/******************/

;(async () => {
  // initialize application and get args
  const { platform, fileID, vueArgs } = initialize()

  try {
    let destination = null

    if (platform === 'ios') {
      destination = await findIOSAppDirectory(fileID)
    } else if (platform === 'win' || platform === 'windows') {
      destination = await findWindowsAppDirectory(fileID)
    }

    // if everything is fine until this point, execute vue script
    await execWatcher(vueArgs, destination, platform)
  } catch (err) {
    error(err.message)
    process.exit(1)
  }
})()
