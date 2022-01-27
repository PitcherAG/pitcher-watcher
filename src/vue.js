#!/usr/bin/env node
const { exec } = require('child_process')
const { initialize } = require('./init')
const { findIOSAppDirectory } = require('./utils/ios-folder-finder')
const { findWindowsAppDirectory } = require('./utils/win-folder-finder')
const { cleanDirectory } = require('./utils/file-system')
const { log, error } = require('./utils/logger')

const execServeScript = async (vueArgs, hmr) => {
  // base script
  const vueScript = `vue-cli-service serve ${vueArgs}`

  log(`Executing script: ${vueScript}`, 'green')

  const { stdout, stderr } = exec(`${vueScript} --color=always`, { env: { ...process.env, hmr: JSON.stringify(hmr) } })

  stdout.pipe(process.stdout)
  stderr.pipe(process.stderr)
}

const execBuildWatchScript = async (vueArgs, destination, clean, hmr) => {
  // cleaning handled by this package, vue-cli should not delete anything
  if (clean) {
    await cleanDirectory(destination)
  }

  const args = vueArgs.split('--').filter((a) => a)

  // if external vueArgs does not include mode, add mode development
  !args.some((a) => a.includes('mode')) && args.unshift('mode development')
  // if external vueArgs does not include dest, add default destination
  !args.some((a) => a.includes('dest')) && args.push(`dest '${destination}'`)

  // base script
  let vueScript = 'NODE_ENV=development vue-cli-service build --watch'

  // build script with args
  args.forEach((arg) => {
    vueScript += ` --${arg.trim()}`
  })

  log(`Executing script: ${vueScript}`, 'green')
  // cleaning handled by this package, vue-cli should not delete anything
  const { stdout, stderr } = exec(`${vueScript} --color=always --no-clean`, {
    env: { ...process.env, hmr: JSON.stringify(hmr) },
  })

  stdout.pipe(process.stdout)
  stderr.pipe(process.stderr)
}

/******************/
/* Starting point */
/******************/

;(async () => {
  // initialize application and get args
  const { platform, fileID, vueArgs, dest, clean, hmr } = initialize('vue')

  try {
    // if user set the destination folder manually
    let destination = dest

    if (destination) log('Argument --dest provided manually, skipping folder search')

    if (!destination && platform === 'ios') {
      destination = await findIOSAppDirectory(fileID)
    } else if (!destination && (platform === 'win' || platform === 'windows')) {
      destination = await findWindowsAppDirectory(fileID)
    }

    // save destination to use in HMR plugin later
    hmr.destination = destination

    // if everything is fine until this point, execute vue script depending on the mode
    if (hmr.mode === 'redirect') {
      await execServeScript(vueArgs, hmr)
    } else {
      await execBuildWatchScript(vueArgs, destination, clean, hmr)
    }
  } catch (err) {
    error(err.message)
    process.exit(1)
  }
})()
