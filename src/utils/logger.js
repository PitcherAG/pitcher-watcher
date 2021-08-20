const chalk = require('chalk')

const log = (msg, color = 'white') => console.log(chalk[color](msg))
const error = (msg, color = 'red') => console.log(chalk[color](msg))
const warn = (msg, color = 'yellow') => console.log(chalk[color](msg))

module.exports = {
  log,
  error,
  warn,
}
