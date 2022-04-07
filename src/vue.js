#!/usr/bin/env node
const vueService = require('@vue/cli-service')
const { initialize } = require('./init')
const { findIOSAppDirectory } = require('./utils/ios-folder-finder')
const { findWindowsAppDirectory } = require('./utils/win-folder-finder')
const { cleanDirectory } = require('./utils/file-system')
const { log, error } = require('./utils/logger')
const PitcherWatcherPlugin = require('./hmr')

const execBuildWatch = async (vueArgs, destination, clean, hmr) => {
  // cleaning handled by this package, vue-cli should not delete anything
  if (clean) {
    await cleanDirectory(destination)
  }
  const service = new vueService(process.cwd())

  // preview script
  const vueScript = 'vue-cli-service build --watch'

  log(`Executing script: ${vueScript}`, 'green')

  service.init('development')

  // default options
  const vueOptions = {
    watch: true,
    dest: destination,
    // should always be false as watcher handles cleaning
    clean: false,
  }

  // parse vueArgs & exclude mode and clean params as they are handled by watcher
  vueArgs
    .split('--')
    .filter((arg) => arg && !arg.includes('mode') && !arg.includes('clean'))
    .forEach((arg) => {
      const splitted = arg.split(' ')

      vueOptions[splitted[0].trim()] = splitted[1].trim()
    })

  const hmrPluginOptions = {
    destination,
    ...hmr,
  }

  // inject HMR plugin
  // if plugins already exist, push the plugin
  // otherwise create an array which including the plugin
  service.projectOptions.configureWebpack = service.projectOptions.configureWebpack || {}
  service.projectOptions.configureWebpack.plugins = [...service.projectOptions.configureWebpack.plugins || [], new PitcherWatcherPlugin(hmrPluginOptions)]

  // run build watch
  service.run('build', vueOptions)
}

/******************/
/* Starting point */
/******************/

;(async () => {
  // initialize application and get args
  const { platform, fileID, dest, clean, vueArgs, hmr } = await initialize('vue')

  try {
    // if user set the destination folder manually
    let destination = dest

    if (destination) log('Argument --dest provided manually, skipping folder search')

    if (!destination && platform === 'ios') {
      destination = await findIOSAppDirectory(fileID)
    } else if (!destination && (platform === 'win' || platform === 'windows')) {
      destination = await findWindowsAppDirectory(fileID)
    }

    // if everything is fine until this point, execute vue script
    await execBuildWatch(vueArgs, destination, clean, hmr)
  } catch (err) {
    error(err.message)
    process.exit(1)
  }
})()
