const fs = require('fs')

const isDirEmpty = (path) => fs.readdirSync(path).filter((f) => !/^\..*/.test(f)).length === 0

const dirExist = (path) => fs.existsSync(path)

module.exports = {
  isDirEmpty,
  dirExist,
}
