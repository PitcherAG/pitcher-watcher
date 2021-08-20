const { exec } = require('child_process')
const chokidar = require('chokidar')
const { log, error } = require('./logger')

// console.log(args)
let filePath = null

const options = {
  paths: '',
}

const execWatcher = (destination) => {
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

const execVueScript = async (destination, vueArgs) => {
  let vueScript = `NODE_ENV=development vue-cli-service build --watch --mode development --dest '${destination}'`

  vueScript += ` ${vueArgs}`

  log(`Executing script: ${vueScript}`)
  const { stdout, stderr } = exec(`${vueScript} --color=always`)

  stdout.pipe(process.stdout)
  stderr.pipe(process.stderr)
}

module.exports = {
  execWatcher,
  execVueScript,
}
