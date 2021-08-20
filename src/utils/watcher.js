const chokidar = require('chokidar')
const chalk = require('chalk')
const args = require('minimist')(process.argv.slice(2))
const log = (m) => console.log(chalk.yellow(m))

// console.log(args)
let filePath = null

const options = {
  paths: '',
}

const watch = (destination) => {
  filePath = destination
  // file, dir, glob, or array
  const watcher = chokidar.watch('src/', {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
  })

  // Event listeners
  watcher
    // .on('add', (path) => log(`File ${path} has been added`))
    .on('unlink', (path) => log(`File ${path} has been removed`))
    .on('change', (path) => {
      log(`File ${path} has been changed`)
      // copy files here to destination
      console.log('updated:', filePath)
    })
}

module.exports = {
  watch,
}
