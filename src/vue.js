#!/usr/bin/env node
const { initialize } = require('./init')
const { findIOSAppDirectory } = require('./utils/ios-folder-finder')
const { findWindowsAppDirectory } = require('./utils/win-folder-finder')
const { cleanDirectory } = require('./utils/file-system')
const { log, error } = require('./utils/logger')
const vueService = require('@vue/cli-service')
const getFreePort = require('./utils/port-finder')
const PitcherWatcherPlugin = require('./hmr')

const execServe = async (destination) => {
  // base script
  const vueScript = `vue-cli-service serve`
  const service = new vueService(process.cwd())

  log(`Executing script: ${vueScript}`, 'green')

  service.init('development')

  // additional vue options
  const vueOptions = {}

  // run vue-cli programmatically
  // eslint-disable-next-line no-unused-vars
  service.run('serve', vueOptions).then(({ server, url }) => {
    /*
      TO DO:
      manipulate index.html in destination
    */
  })
}

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
    mode: hmr.mode,
    port: await getFreePort(hmr.wsport),
  }

  // inject HMR plugin
  service.projectOptions.configureWebpack.plugins = service.projectOptions.configureWebpack.plugins
    ? service.projectOptions.configureWebpack.plugins.push(new PitcherWatcherPlugin(hmrPluginOptions))
    : [new PitcherWatcherPlugin(hmrPluginOptions)]

  // run build watch
  service.run('build', vueOptions)
}

/******************/
/* Starting point */
/******************/

;(async () => {
  // initialize application and get args
  const { platform, fileID, dest, clean, vueArgs, hmr } = initialize('vue')

  try {
    // if user set the destination folder manually
    let destination = dest

    if (destination) log('Argument --dest provided manually, skipping folder search')

    if (!destination && platform === 'ios') {
      destination = await findIOSAppDirectory(fileID)
    } else if (!destination && (platform === 'win' || platform === 'windows')) {
      destination = await findWindowsAppDirectory(fileID)
    }

    // if everything is fine until this point, execute vue script depending on the mode
    if (hmr.mode === 'redirect') {
      await execServe(destination)
    } else {
      await execBuildWatch(vueArgs, destination, clean, hmr)
    }
  } catch (err) {
    error(err.message)
    process.exit(1)
  }
})()
