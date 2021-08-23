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

const execVueScript = async (destination, vueArgs, platform) => {
  const args = vueArgs.split('--').filter((a) => a)

  !args.some((a) => a.includes('mode')) && args.unshift('mode development')
  !args.some((a) => a.includes('dest')) && args.push(`dest '${destination}'`)

  // this due to vue-cli trying to clean the folder, not possible in windows
  if (platform === 'win' || platform === 'windows') args.push(`no-clean`)

  // base script
  let vueScript = 'NODE_ENV=development vue-cli-service build --watch '

  // build script with args
  args.forEach((arg) => {
    vueScript += `--${arg.trim()} `
  })

  log(`Executing script: ${vueScript}`, 'green')
  const { stdout, stderr } = exec(`${vueScript} --color=always`)

  stdout.pipe(process.stdout)
  stderr.pipe(process.stderr)
}

module.exports = {
  execWatcher,
  execVueScript,
}
