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

const parseChokidarArgs = () => {
  const chokidarArgs = {
    path: '.',
    dest: '',
    ignoreDotFiles: true,

    // chokidar specific
    ignored: [],
    persistent: args.persistent,
    ignoreInitial: args.ignoreInitial,
    followSymlinks: args.followSymlinks,
    cwd: args.cwd,
    disableGlobbing: args.disableGlobbing,
    usePolling: args.usePolling,
    interval: args.interval,
    binaryInterval: args.binaryInterval,
    alwaysStat: args.alwaysStat,
    depth: args.depth,
    // separate logic for this one below
    // awaitWriteFinish: {},
    ignorePermissionErrors: args.ignorePermissionErrors,
    atomic: args.atomic,
  }

  const { ignoreDotFiles, ignored } = args

  // parse ignored argument or empty array
  chokidarArgs.ignored = (ignored && ignored.split(',').map((val) => val.trim())) || []
  // ignore dot files by default
  !ignoreDotFiles && chokidarArgs.ignored.push(/(^|[\/\\])\../)

  if (typeof args.awaitWriteFinish === 'string') {
    warn('awaitWriteFinish argument is not supported to use with string')
    warn('use --awaitWriteFinish.stabilityThreshold or --awaitWriteFinish.pollIntervall instead')
  } else if (typeof args.awaitWriteFinish === 'boolean' || typeof args.awaitWriteFinish === 'object') {
    chokidarArgs.awaitWriteFinish = args.awaitWriteFinish
  }

  // clean-up undefined values
  Object.keys(chokidarArgs).forEach((key) => chokidarArgs[key] === undefined && delete chokidarArgs[key])

  return chokidarArgs
}

// const fileId = '729463' // non existing
// const fileId = '796358' // existing
// const fileId = '994133' // windows existing

// Starting point
const initialize = (type = 'vue') => {
  validateCommonArgs()

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
  parsedArgs.chokidar = parseChokidarArgs()

  return parsedArgs
}

module.exports = {
  initialize,
}
