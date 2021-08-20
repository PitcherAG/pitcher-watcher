const { exec } = require('child_process')
const { iOS_deviceSelectionPrompt } = require('../prompts')
const { error } = require('./logger')

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
          error(`[ERROR]: There is no folder that contains ${fileID} under /Pitcher Folders/zip!`)
          process.exit(1)
        }

        return resolve(stdout.slice(0, -1))
      }
    )
  })

const findIOSAppDirectory = async (fileID) => {
  const devices = await findActiveDevices()
  const selectedDevice = devices.length > 1 ? await iOS_deviceSelectionPrompt(devices) : devices.pop()
  const appDirectory = await findSimulatorAppWorkingDirectory(selectedDevice.udid, fileID)

  return appDirectory
}

module.exports = {
  findIOSAppDirectory,
}
