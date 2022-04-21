const { exec } = require('child_process')

export const execute = (command) =>
  new Promise((resolve, reject) =>
    exec(command, function(error, stdout, stderr) {
      if (error || stderr) return reject(error ? error : stderr)

      return resolve(stdout)
    })
  )
