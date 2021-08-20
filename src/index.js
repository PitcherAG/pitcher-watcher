const { findActiveDevices, findSimulatorAppWorkingDirectory } = require('./utils/ios-folder-finder')
const { findWindowsAppDirectory } = require('./utils/win-folder-finder')
const { iOS_deviceSelectionPrompt } = require('./prompts')
const { watch } = require('./utils/watcher')
const { log, warn, error } = require('./utils/logger')

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

;(async () => {
  try {
    // const fileId = '729463' // non existing
    // const fileId = '796358' // existing
    // const fileId = '994133' // windows existing

    // const devices = await findActiveDevices()

    // console.log(devices)
    const test = await findWindowsAppDirectory(fileID)

    console.log(test, 'test')
    
    // const selectedDevice = devices.length > 1 ? await iOS_deviceSelectionPrompt(devices) : devices.pop()
    // const destinationFolder = await findSimulatorAppWorkingDirectory(selectedDevice.udid, fileID)

    // console.log('selected device:', selectedDevice.udid)
    // console.log('watching...')
    // // console.log(destinationFolder)

    // if (args.legacy) {
    //   watch(destinationFolder)
    // }
  } catch (err) {
    console.error(err.message)
    process.exitCode = 1
  }
})()
