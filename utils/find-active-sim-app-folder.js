const { exec } = require('child_process')

const findActiveDeviceId = () =>
  new Promise((resolve, reject) => {
    exec('xcrun simctl list devices --json', (err, stdout) => {
      if (err) {
        console.log(`Something went wrong: ${JSON.stringify(err)}`)
        return reject(err)
      }
      const { devices } = JSON.parse(stdout)
      const active = Object.keys(devices).reduce((acc, key) => {
        const found = devices[key].find(d => d.state === 'Booted')
        return found ? [...acc, found] : acc
      }, [])

      return active.length ? resolve(active.pop().udid) : reject(new Error('No simulator device is running!'))
    })
  })

const findSimulatorAppWorkingDirectory = (deviceId, fileId) =>
  new Promise((resolve, reject) => {
    exec(
      `find ~/Library/Developer/CoreSimulator/Devices/${deviceId} -type d -name "${fileId}*" -print -quit`,
      (err, stdout) => {
        if (err) {
          console.log(`Something went wrong: ${JSON.stringify(err)}`)
          return reject(err)
        }

        return resolve(stdout.slice(0, -1))
      }
    )
  })

;(async () => {
  try {
    const fileId = process.env.FILE_ID
    if (fileId === 'HERECOMESMYFILEID') throw new Error('Please set your file ID in the npm script!')
    const deviceId = await findActiveDeviceId()
    const path = await findSimulatorAppWorkingDirectory(deviceId, fileId)
    console.log(path)
  } catch (err) {
    console.error(err.message)
    process.exitCode = 1
  }
})()
