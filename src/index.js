const { findActiveDevices, findSimulatorAppWorkingDirectory } = require('./utils/ios-device-finder')
const { deviceSelectionPrompt } = require('./prompts')
const { watch } = require('./watcher')

;(async () => {
  try {
    // const fileId = process.env.FILE_ID
    // const fileId = '729463' // non existing
    const fileId = '796358' // existing

    if (fileId === 'HERECOMESMYFILEID') throw new Error('Please set your file ID in the npm script!')

    const devices = await findActiveDevices()
    const selectedDevice = devices.length > 1 ? await deviceSelectionPrompt(devices) : devices.pop()
    const destinationFolder = await findSimulatorAppWorkingDirectory(selectedDevice.udid, fileId)

    console.log('selected device:', selectedDevice.udid)
    console.log('watching...')
    // console.log(destinationFolder)

    watch(destinationFolder)
  } catch (err) {
    console.error(err.message)
    process.exitCode = 1
  }
})()
