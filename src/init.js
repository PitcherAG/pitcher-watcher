const args = require('minimist')(process.argv.slice(2))
const { log, clog, error, warn } = require('./utils/logger')

let shouldExit = false

/* Validate common args */
const validateCommonArgs = () => {
  const supportedPlatforms = ['ios', 'win', 'windows']

  // check fileID
  if (!args || !args.fileID || args.fileID === 'HERECOMESMYFILEID') {
    error('[ERROR]: --fileID argument is required! Please set your file ID in the npm script')
    shouldExit = true
  }

  // check platform
  if (!args || !args.platform) {
    error('[ERROR]: --platform argument is required! Available arguments: ios, win')
    shouldExit = true
  } else if (args && args.platform && !supportedPlatforms.includes(args.platform)) {
    error(`[ERROR]: Platform ${args.platform} is not supported!`)
    shouldExit = true
  }

  // check mode
  if (args.watchMode && !['hot', 'live', 'redirect', 'manual'].includes(args.watchMode)) {
    warn(`[WARNING]: --watchMode=${args.watchMode} is invalid. Available arguments hot, live, redirect, manual`)
    warn('[WARNING]: defaulting watchMode to: hot')
    args.watchMode = 'hot'
  }

  if (shouldExit) {
    process.exit(1)
  }
}

const parseChokidarOpts = () => {
  // to ignore default values
  const ignoreList = ['platform', 'fileID', 'clean', 'dest', '_']
  const chokidarOpts = {}

  // parse every key as chokidar arg except ignored ones (pitcher specific args)
  for (const key in args) {
    if (!ignoreList.includes(key)) {
      chokidarOpts[key] = args[key]
    }
  }

  const { paths, ignored, includeNodeModules, includeDotFiles } = chokidarOpts

  // parse ignored argument or empty array
  chokidarOpts.paths = (paths && paths.split(',').map((val) => val.trim())) || ['.']
  chokidarOpts.ignored = (ignored && ignored.split(',').map((val) => val.trim())) || []

  // add node_modules and files starting with dot to the ignore list by default
  !includeNodeModules && chokidarOpts.ignored.push(/node_modules/)
  !includeDotFiles && chokidarOpts.ignored.push('.*')

  return chokidarOpts
}

const showHelp = (type) => {
  log(`Command list - ${type}`)
  console.log()
  // common args
  clog('  --fileID', 'white', '- Interactive/UI fileID [required]')
  clog('  --platform', 'white', '- Target platform to copy files [required]')
  clog('  --no-clean', 'white', '- Disable copying after a change')
  // eslint-disable-next-line prettier/prettier
  clog('  --dest', 'white', '- Target folder to copy files [optional], NO NEED to use this unless you want to copy files to a static path')

  if (type === 'watcher') {
    clog('  --paths', 'white', `- Paths to watch ex: --paths='src/, lib/' (default: '.')`)
    // eslint-disable-next-line prettier/prettier
    clog('  --ignored', 'white', `- Paths to ignore ex: --ignored='utils/, *.json'. (Ignores node_modules and dot files by default)`)
    clog('  --execAfter', 'white', `- Script to execute after a change ex: --execAfter='echo hello'`)
    clog('\n  Supports also any other argument that chokidar has: https://github.com/paulmillr/chokidar')
  }

  if (type === 'vue') {
    // eslint-disable-next-line prettier/prettier
    clog('  --vueArgs', 'white', `- Inject arguments to vue-cli command ex: --vueArgs='--target="lib", --inline-vue'`)
  }

  clog('\n  Check out documentation here: https://ui.pitcher.com/docs/guides/helper-packages/pitcher-watcher.html')
  console.log()
  console.log()
}

// Starting point
const initialize = (type = 'vue') => {
  if (args.h || args.help) {
    showHelp(type)
    process.exit()
  }

  validateCommonArgs()

  // common args first
  const parsedArgs = {
    platform: args.platform,
    fileID: args.fileID,
    clean: args.clean !== undefined ? args.clean : true,
    dest: args.dest !== undefined ? args.dest : undefined,
    hmr: {
      mode: args.watchMode || 'hot',
      wsport: args.wsport || 8099,
    },
  }

  /* Vue watcher */
  if (type === 'vue') {
    parsedArgs.vueArgs = args.vueArgs || ''

    return parsedArgs
  }

  /* Plain watcher */
  parsedArgs.execAfter = args.execAfter
  parsedArgs.chokidarOpts = parseChokidarOpts()

  return parsedArgs
}

module.exports = {
  initialize,
}
