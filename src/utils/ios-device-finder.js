const { exec } = require('child_process')

const findActiveDevices = () => {
  return new Promise((resolve, reject) => {
    exec('xcrun simctl list devices --json', (err, stdout) => {
      if (err) {
        console.log(`Something went wrong: ${JSON.stringify(err)}`)

        return reject(err)
      }

      const { devices } = JSON.parse(stdout)

      let active = []

      for (const key in devices) {
        const found = devices[key].filter((d) => d.state === 'Booted')

        if (found.length) {
          active = [...active, ...found]
        }
      }

      return active.length ? resolve(active) : reject(new Error('No simulator device is running!'))
    })
  })
}

const findSimulatorAppWorkingDirectory = (deviceId, fileId) =>
  new Promise((resolve, reject) => {
    exec(
      `find ~/Library/Developer/CoreSimulator/Devices/${deviceId} -type d -name "${fileId}*" -print -quit`,
      (err, stdout) => {
        if (err) {
          console.log(`Something went wrong: ${JSON.stringify(err)}`)

          return reject(err)
        }

        if (!stdout) {
          throw new Error(`There is no folder that contains ${fileId} under /Pitcher Folders/zip!`)
        }

        return resolve(stdout.slice(0, -1))
      }
    )
  })

module.exports = {
  findActiveDevices,
  findSimulatorAppWorkingDirectory,
}

// ;(async () => {
//   try {
//     const fileId = process.env.FILE_ID
//     if (fileId === 'HERECOMESMYFILEID') throw new Error('Please set your file ID in the npm script!')
//     const deviceId = await findActiveDeviceId()
//     const path = await findSimulatorAppWorkingDirectory(deviceId, fileId)
//     console.log(path)
//   } catch (err) {
//     console.error(err.message)
//     process.exitCode = 1
//   }
// })()
