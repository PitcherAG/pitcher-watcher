#!/usr/bin/env node
const { findIOSAppDirectory } = require('./utils/ios-folder-finder')
const { findWindowsAppDirectory } = require('./utils/win-folder-finder')
const { execVueScript, execWatcher } = require('./utils/watcher')
const { log, error } = require('./utils/logger')

const args = require('minimist')(process.argv.slice(2))

// Check args
let shouldExit = false

// if (!args.fileID || args.fileID === 'HERECOMESMYFILEID') {
//   error('[ERROR]: --fileID argument is required! Please set your file ID in the npm script')
//   shouldExit = true
// }
// if (!args.platform) {
//   error('[ERROR]: --platform argument is required! Available arguments: [ios, windows]')
//   shouldExit = true
// }

// if (shouldExit) {
//   process.exit(1)
// }

const platform = args.platform
const fileID = args.fileID
const isVue = args.vue
const vueArgs = args.vueArgs || ''

;(async () => {
  try {
    // const fileId = '729463' // non existing
    // const fileId = '796358' // existing
    // const fileId = '994133' // windows existing
    let destination = null

    if (platform === 'ios') {
      destination = await findIOSAppDirectory(fileID)
    } else if (platform === 'win' || platform === 'windows') {
      destination = await findWindowsAppDirectory(fileID)
    } else {
      error(`[ERROR]: Platform ${platform} is not supported!`)
      process.exit(1)
    }

    // default behaviour?
    if (isVue) {
      await execVueScript(destination, vueArgs, platform)
    }
  } catch (err) {
    error(err.message)
    process.exit(1)
  }
})()
