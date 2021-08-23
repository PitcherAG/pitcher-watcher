const { exec } = require('child_process')
const { readdir } = require('fs/promises')
const { win_driveSelectionPrompt, win_userSelectionPrompt } = require('../prompts')
const { log, error } = require('./logger')

const MAX_BUFFER_SIZE = 2000 * 1024

const fetchDisks = () => {
  return new Promise((resolve) => {
    exec('/bin/df -H | grep "//"', { maxBuffer: MAX_BUFFER_SIZE }, (err, stdout) => {
      if (err) {
        error(`[ERROR]: Make sure you are running Parallels Machine and mounted the VM drive as network drive!`)
        error(`${JSON.stringify(err)}`)
        process.exit(1)
      }

      return resolve(stdout)
    })
  })
}

const getAndFormatPath = (value) => {
  const extractedPath = value.match(/\/Volumes(.*)/)[0]
  const driveObj = {
    name: extractedPath.substring(extractedPath.lastIndexOf('/') + 1),
    path: extractedPath,
  }

  return driveObj
}

const listDrives = async () => {
  const diskListRaw = await fetchDisks()

  if (!diskListRaw.length) {
    throw new Error('No disks found')
  }

  const pathList = diskListRaw
    .split(/[\n\r]/g)
    .filter((val) => val)
    .map((val) => getAndFormatPath(val))

  return pathList
}

const findUsers = async (drive) => {
  const dir = await readdir(`${drive.path}/Users`)
  const ignoreList = ['Default', 'All Users', 'Public', '.']

  return dir.filter((d) => ignoreList.every((key) => !d.includes(key)))
}

const getLocalStatePath = async (drive, user) => {
  const packagesPath = `${drive.path}/Users/${user}/AppData/Local/Packages`
  const packagesDir = await readdir(packagesPath)
  const vayenFolderName = packagesDir.find((d) => d.includes('Vayen'))

  if (!vayenFolderName) {
    error(`[ERROR]: Make sure you have installed Pitcher Impact on your Parallels machine!`)
    process.exit(1)
  }

  return `${packagesPath}/${vayenFolderName}/LocalState`
}

// eslint-disable-next-line consistent-return
const getWindowsWorkingDirectory = async (basePath, fileID) => {
  const searchDirectories = ['zip', 'interfaces', 'slides']

  for (const subfolder of searchDirectories) {
    const searchPath = `${basePath}/${subfolder}`
    const dir = await readdir(searchPath)
    const found = dir.find((d) => d.includes(fileID))

    if (found) {
      return `${searchPath}/${found}`
    }
  }

  error(`[ERROR]: Could not find a folder that contains ${fileID} in /Pitcher Folders/!`)
  process.exit(1)
}

const findWindowsAppDirectory = async (fileID) => {
  log('Searching for available network drives')
  const driveList = await listDrives()
  const selectedDrive = await win_driveSelectionPrompt(driveList)

  log('Searching for Windows users in Parallels machine')
  const users = await findUsers(selectedDrive)
  const selectedUser = await win_userSelectionPrompt(users)

  log('Finding Local State folder path')
  const localStatePath = await getLocalStatePath(selectedDrive, selectedUser)

  log(`Searching for ${fileID} under Pitcher Folders/`)
  const appDirectory = await getWindowsWorkingDirectory(localStatePath, fileID)

  log(`Directory found: ${appDirectory}`)

  return appDirectory
}

module.exports = {
  findWindowsAppDirectory,
}
