const chalk = require('chalk')

const log = (msg, color = 'cyan') => console.log(chalk.white(`[@pitcher/watcher]:`, chalk[color](msg)))
const clog = (msg, color = 'white', msg2 = '', color2 = 'cyan') => console.log(chalk[color](msg), chalk[color2](msg2))
const error = (msg, color = 'red') => console.log(chalk[color](msg))
const warn = (msg, color = 'yellow') => console.log(chalk[color](msg))

module.exports = {
  log,
  clog,
  error,
  warn,
}
