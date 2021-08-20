const inquirer = require('inquirer')

const deviceSelectionPrompt = (devices) => {
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

module.exports = {
  deviceSelectionPrompt,
}
