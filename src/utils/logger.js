const chalk = require('chalk')

const log = (msg, color = 'cyan') => console.log(chalk.white(`[@pitcher/watcher]:`, chalk[color](msg)))
const error = (msg, color = 'red') => console.log(chalk[color](msg))
const warn = (msg, color = 'yellow') => console.log(chalk.yellow(`[@pitcher/watcher]:`, chalk[color](msg)))

module.exports = {
  log,
  error,
  warn,
}
