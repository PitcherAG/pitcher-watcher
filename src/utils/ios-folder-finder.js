const { exec } = require('child_process')
const { iOS_deviceSelectionPrompt } = require('../prompts')
const { log, error } = require('./logger')

const findActiveDevices = () => {
  return new Promise((resolve) => {
    // eslint-disable-next-line consistent-return
    exec('xcrun simctl list devices --json', (err, stdout) => {
      if (err) {
        error(`[ERROR]: Make sure you are running Parallels Machine and mounted the VM drive as network drive!`)
        error(`${JSON.stringify(err)}`)
        process.exit(1)
      }

      const { devices } = JSON.parse(stdout)

      let active = []

      for (const key in devices) {
        const found = devices[key].filter((d) => d.state === 'Booted')

        if (found.length) {
          active = [...active, ...found]
        }
      }

      if (active.length) {
        return resolve(active)
      }

      error(`[ERROR]: No iOS simulator device is running!`)
      process.exit(1)
    })
  })
}

const findSimulatorAppWorkingDirectory = (deviceID, fileID) =>
  new Promise((resolve, reject) => {
    exec(
      `find ~/Library/Developer/CoreSimulator/Devices/${deviceID} -type d -name "${fileID}*" -print -quit`,
      (err, stdout) => {
        if (err) {
          error(`Something went wrong: ${JSON.stringify(err)}`)

          return reject(err)
        }

        if (!stdout) {
          error(`File ID: ${fileID}`)
          error(`Device ID: ${deviceID}`)
          error(`[ERROR]: Could not find a folder that contains ${fileID} in /Pitcher Folders/!`)
          process.exit(1)
        }

        return resolve(stdout.slice(0, -1))
      }
    )
  })

const findIOSAppDirectory = async (fileID) => {
  log('Searching for available iOS devices')
  const devices = await findActiveDevices()

  log('Finding active devices')
  const selectedDevice = devices.length > 1 ? await iOS_deviceSelectionPrompt(devices) : devices.pop()

  log(`Searching for ${fileID} under Pitcher Folders/`)
  const appDirectory = await findSimulatorAppWorkingDirectory(selectedDevice.udid, fileID)

  log(`Directory found: ${appDirectory}`)

  return appDirectory
}

module.exports = {
  findIOSAppDirectory,
}
