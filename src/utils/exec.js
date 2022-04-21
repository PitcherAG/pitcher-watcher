const { exec } = require('child_process')

const execute = (command) =>
  new Promise((resolve, reject) =>
    exec(command, function(error, stdout, stderr) {
      if (error || stderr) return reject(error ? error : stderr)

      return resolve(stdout)
    })
  )

module.exports = { execute }
