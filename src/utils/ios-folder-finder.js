const { exec } = require('child_process')
const { iOS_deviceSelectionPrompt, folderSelectionPrompt } = require('../prompts')
const { log, error } = require('./logger')
const { getFolderNameWithparent } = require('./file-system')

const findActiveDevices = () => {
  return new Promise((resolve) => {
    // eslint-disable-next-line consistent-return
    exec('xcrun simctl list devices --json', (err, stdout) => {
      if (err) {
        error(`Something went wrong: ${JSON.stringify(err)}`)
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
    const searchPath = `~/Library/Developer/CoreSimulator/Devices/${deviceID}/data/Containers/Data/Application`

    exec(`find ${searchPath} -type d -name "${fileID}*" -print`, (err, stdout) => {
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

      // map found folders
      const paths = stdout
        .split('\n')
        .filter((p) => p)
        .map((p) => ({
          name: getFolderNameWithparent(p),
          value: p,
        }))

      return resolve(paths)
    })
  })

const findIOSAppDirectory = async (fileID) => {
  log('Searching for available iOS devices')
  const devices = await findActiveDevices()

  log('Finding active devices')
  // use devices.pop to extract single object from array
  const selectedDevice = devices.length > 1 ? await iOS_deviceSelectionPrompt(devices) : devices.pop()

  log(`Searching for folder that contains ${fileID} under Pitcher Folders/`)
  const directories = await findSimulatorAppWorkingDirectory(selectedDevice.udid, fileID)

  let appDirectory = null

  if (directories.length > 1) {
    log(`Found multiple folders that contains '${fileID}' in name`)
    appDirectory = await folderSelectionPrompt(directories)
  } else if (directories.length === 1) {
    appDirectory = directories[0].value
  }

  log(`Directory found: ${appDirectory}`)

  return appDirectory
}

module.exports = {
  findIOSAppDirectory,
}
