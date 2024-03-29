const { exec } = require('child_process')
const { readdir } = require('fs/promises')
const { win_driveSelectionPrompt, win_userSelectionPrompt, folderSelectionPrompt } = require('../prompts')
const { log, error, warn } = require('./logger')
const { getFolderNameWithParent } = require('./file-system')
const { execute } = require('./exec')

const MAX_BUFFER_SIZE = 2000 * 1024

const mountParallelsDrive = async () => {
  let windowsDriveName

  try {
    const output = await execute('ls /Volumes')

    windowsDriveName = JSON.stringify(output)
      .split('\\n')
      .find((name) => name.includes('Windows'))
  } catch (e) {
    windowsDriveName = ''
  } finally {
    windowsDriveName
      ? log(`Found drive: ${windowsDriveName}. Proceeding...`)
      : warn(`Parallels Windows VM is not mounted as a network drive! Will try to mount automatically...`)
  }
  const drivePath = `smb://Guest:@Windows 10._smb._tcp.local/${windowsDriveName || '[C] Windows 10'}`
  const cliScript = `osascript -e 'tell application "Finder"' -e 'try' -e 'mount volume "${drivePath}"' -e 'end try' -e 'end tell'`

  return new Promise((resolve) => {
    if (windowsDriveName) resolve(true)
    else {
      exec(cliScript, { timeout: 1000 }, (err) => {
        // Could not mount
        if (err) {
          warn(`Could not mount Parallels VM as a network drive!`)

          return resolve(false)
        }

        // success
        log('Mounted Parallels VM as network drive succesfully')

        return resolve(true)
      })
    }
  })
}

const fetchDisks = () => {
  return new Promise((resolve) => {
    exec('/bin/df -H | grep "//"', { maxBuffer: MAX_BUFFER_SIZE }, (err, stdout) => {
      if (err) {
        error(`[ERROR]: Make sure you are running Parallels Machine and mounted the VM drive as network drive!`)
        error(
          `[ERROR]: Check details on docs: https://ui.pitcher.com/docs/guides/helper-packages/pitcher-watcher.html#prerequisites`
        )
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
  const pitcherFolders = packagesDir.filter((d) => d.includes('Vayen'))

  if (!pitcherFolders.length) {
    error(`[ERROR]: Make sure you have installed Pitcher Impact on your Parallels machine!`)
    process.exit(1)
  }

  let pitcherFolder = pitcherFolders[0]

  if (pitcherFolders.length > 1) {
    log(`Found multiple Pitcher folders`)
    const mappedFolders = pitcherFolders.map((folder) => {
      return {
        name: folder,
        value: folder,
      }
    })

    pitcherFolder = await folderSelectionPrompt(mappedFolders)
  }

  return `${packagesPath}/${pitcherFolder}/LocalState`
}

// eslint-disable-next-line consistent-return
const getWindowsWorkingDirectory = async (basePath, fileID) => {
  const searchDirectories = ['zip', 'interfaces', 'slides', 'originals', 'surveys']

  for (const subfolder of searchDirectories) {
    const searchPath = `${basePath}/${subfolder}`
    const dir = await readdir(searchPath)
    const found = dir.filter((d) => d.includes(fileID))

    if (found.length) {
      return found.map((folder) => {
        const fullPath = `${searchPath}/${folder}`

        return {
          name: getFolderNameWithParent(fullPath),
          value: fullPath,
        }
      })
    }
  }

  error(`[ERROR]: Could not find a folder that contains ${fileID} in /Pitcher Folders/!`)
  process.exit(1)
}

const findWindowsAppDirectory = async (fileID) => {
  log('Trying to mount Parallels VM as a network drive')
  await mountParallelsDrive()

  log('Searching for available network drives')
  const driveList = await listDrives()
  const selectedDrive = await win_driveSelectionPrompt(driveList)

  log('Searching for Windows users in Parallels machine')
  const users = await findUsers(selectedDrive)
  const selectedUser = await win_userSelectionPrompt(users)

  log('Finding Local State folder path')
  const localStatePath = await getLocalStatePath(selectedDrive, selectedUser)

  log(`Searching for folder that contains ${fileID} under Pitcher Folders/`)
  const directories = await getWindowsWorkingDirectory(localStatePath, fileID)

  let appDirectory = null

  if (directories.length > 1) {
    log(`Found multiple folders that contains '${fileID}' in name`)
    appDirectory = await folderSelectionPrompt(directories)
  } else if (directories.length === 1) {
    appDirectory = directories[0].value
  }

  return appDirectory
}

module.exports = {
  findWindowsAppDirectory,
}
