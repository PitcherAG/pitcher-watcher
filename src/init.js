const args = require('minimist')(process.argv.slice(2))
const { error, warn } = require('./utils/logger')

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

  !includeNodeModules && chokidarOpts.ignored.push(/node_modules/)
  !includeDotFiles && chokidarOpts.ignored.push(/(^|[\/\\])\../)

  return chokidarOpts
}

// const fileId = '729463' // non existing
// const fileId = '796358' // existing
// const fileId = '994133' // windows existing

// Starting point
const initialize = (type = 'vue') => {
  validateCommonArgs()

  // common args first
  const parsedArgs = {
    platform: args.platform,
    fileID: args.fileID,
    clean: args.clean !== undefined ? args.clean : true,
    dest: args.dest !== undefined ? args.dest : undefined,
  }

  /* Vue watcher */
  if (type === 'vue') {
    parsedArgs.vueArgs = args.vueArgs || ''

    return parsedArgs
  }

  /* Plain watcher */
  parsedArgs.chokidarOpts = parseChokidarOpts()

  return parsedArgs
}

module.exports = {
  initialize,
}
