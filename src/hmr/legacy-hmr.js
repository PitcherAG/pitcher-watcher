const path = require('path')
const { parseHTML } = require('linkedom')
const { readFile, writeFile } = require('fs/promises')
const { dirExist } = require('../utils/file-system')
const { warn } = require('../utils/logger')

const copyHMRHelper = async (hmr, destination) => {
  // read local JS template file
  const legacyHelperPath = path.join(__dirname, 'hmr-helper-legacy.js')

  // read legacy helper file
  let rawHelperFile = await readFile(legacyHelperPath, { encoding: 'utf-8' })

  // replace dynamic variables
  rawHelperFile = rawHelperFile.replace('{{HMR_LOCAL_IP}}', hmr.ip)
  rawHelperFile = rawHelperFile.replace('{{HMR_PORT}}', hmr.port)
  rawHelperFile = rawHelperFile.replace('{{HMR_MODE}}', hmr.mode)

  await writeFile(`${destination}/hmr-helper-legacy.js`, rawHelperFile)
}

const injectHelperToHTML = async (destination) => {
  const indexHtmlPath = `${destination}/index.html`

  if (!dirExist(indexHtmlPath)) {
    warn(`index.html in destination path could not be found! HMR is not active...`)

    return
  }

  const htmlFile = await readFile(indexHtmlPath, { encoding: 'utf-8' })

  // NOTE: document is not global
  const { document } = parseHTML(htmlFile)
  const helperScript = document.createElement('script')

  helperScript.setAttribute('src', 'hmr-helper-legacy.js')
  helperScript.setAttribute('type', 'text/javascript')
  document.head.appendChild(helperScript)

  await writeFile(`${destination}/index.html`, document.toString())
}

const useHtmlInject = async (hmr, destination) => {
  await copyHMRHelper(hmr, destination)
  await injectHelperToHTML(destination)
}

// parses file name from full file path
const parseFileName = (path) => path.substring(path.lastIndexOf('/') + 1)

const emitChangesToClients = (wss, mode, changedFiles) => {
  wss.clients.forEach((client) => {
    if (mode === 'hot') {
      const filesToEmit = Array.from(changedFiles).map((p) => parseFileName(p))

      client.send(JSON.stringify({ event: 'HOT_RELOAD', files: filesToEmit }))

      return
    }
    client.send(JSON.stringify({ event: 'LIVE_RELOAD' }))
  })
}

module.exports = {
  useHtmlInject,
  emitChangesToClients,
}
