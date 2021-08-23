const args = require('minimist')(process.argv.slice(2))
const { error } = require('./utils/logger')

// Check args
const validateArgs = () => {
  const supportedPlatforms = ['ios', 'win', 'windows']
  let shouldExit = false

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

// const fileId = '729463' // non existing
// const fileId = '796358' // existing
// const fileId = '994133' // windows existing

// Starting point
const initialize = () => {
  validateArgs()

  return {
    platform: args.platform,
    fileID: args.fileID,
    vueArgs: args.vueArgs || '',
    clean: args.clean || true,
  }
}

module.exports = {
  initialize,
}
