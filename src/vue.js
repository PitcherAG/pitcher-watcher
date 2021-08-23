#!/usr/bin/env node
const { exec } = require('child_process')
const { initialize } = require('./init')
const { findIOSAppDirectory } = require('./utils/ios-folder-finder')
const { findWindowsAppDirectory } = require('./utils/win-folder-finder')
const { log, error } = require('./utils/logger')

const execVueScript = async (vueArgs, destination, platform) => {
  const args = vueArgs.split('--').filter((a) => a)

  // if external vueArgs does not include mode, add mode development
  !args.some((a) => a.includes('mode')) && args.unshift('mode development')
  // if external vueArgs does not include dest, add default destination
  !args.some((a) => a.includes('dest')) && args.push(`dest '${destination}'`)

  // this due to vue-cli trying to clean the folder, not possible in windows
  if ((platform === 'win' || platform === 'windows') && !args.some((a) => a.includes('no-clean'))) {
    args.push(`no-clean`)
  }

  // base script
  let vueScript = 'NODE_ENV=development vue-cli-service build --watch'

  // build script with args
  args.forEach((arg) => {
    vueScript += ` --${arg.trim()}`
  })

  log(`Executing script: ${vueScript}`, 'green')
  const { stdout, stderr } = exec(`${vueScript} --color=always`)

  stdout.pipe(process.stdout)
  stderr.pipe(process.stderr)
}

/******************/
/* Starting point */
/******************/

;(async () => {
  // initialize application and get args
  const { platform, fileID, vueArgs } = initialize()

  try {
    let destination = null

    if (platform === 'ios') {
      destination = await findIOSAppDirectory(fileID)
    } else if (platform === 'win' || platform === 'windows') {
      destination = await findWindowsAppDirectory(fileID)
    }

    // if everything is fine until this point, execute vue script
    await execVueScript(vueArgs, destination, platform)
  } catch (err) {
    error(err.message)
    process.exit(1)
  }
})()
