const inquirer = require('inquirer')

const iOS_deviceSelectionPrompt = (devices) => {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'deviceSelection',
          message: 'Select a running device: ',
          default: devices[0],
          choices: devices.map((d) => ({ name: `${d.name} - ${d.udid}`, value: d })),
        },
      ])
      .then((answers) => {
        return resolve(answers.deviceSelection)
      })
      .catch((err) => {
        throw new Error(`Something went wrong: ${err}`)
      })
  })
}

const iOS_folderSelectionPrompt = (folders) => {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'folderSelection',
          message: 'Select a folder: ',
          default: folders[0],
          choices: folders.map((f) => ({ name: `${f.name}`, value: f.value })),
        },
      ])
      .then((answers) => {
        return resolve(answers.folderSelection)
      })
      .catch((err) => {
        throw new Error(`Something went wrong: ${err}`)
      })
  })
}

const win_driveSelectionPrompt = (drives) => {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'driveSelection',
          message: 'Select a drive: ',
          default: drives[0],
          choices: drives.map((d) => ({ name: d.name, value: d })),
        },
      ])
      .then((answers) => {
        return resolve(answers.driveSelection)
      })
      .catch((err) => {
        throw new Error(`Something went wrong: ${err}`)
      })
  })
}

const win_userSelectionPrompt = (users) => {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'userSelection',
          message: 'Select Windows User: ',
          default: users[0],
          choices: users.map((d) => ({ name: d, value: d })),
        },
      ])
      .then((answers) => {
        return resolve(answers.userSelection)
      })
      .catch((err) => {
        throw new Error(`Something went wrong: ${err}`)
      })
  })
}

module.exports = {
  iOS_deviceSelectionPrompt,
  iOS_folderSelectionPrompt,
  win_driveSelectionPrompt,
  win_userSelectionPrompt,
}
