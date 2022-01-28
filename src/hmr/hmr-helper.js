function removeCurrentFiles(fileList) {
  const links = Array.from(document.querySelectorAll('link'))
  const scripts = Array.from(document.querySelectorAll('script'))

  fileList.forEach((file) => {
    let el = null

    if (file.endsWith('.css')) {
      el = links.find((link) => link.href.includes(file))
    } else if (file.endsWith('.js')) {
      el = scripts.find((script) => script.src.includes(file))
    }

    if (el) {
      el.parentNode.removeChild(el)
    }
  })
}

function injectNewFiles(fileList) {
  fileList.forEach((file) => {
    let newElement = null
    const url = `${file}?updated=${Date.now()}`

    if (file.endsWith('.css')) {
      newElement = document.createElement('link')
      newElement.rel = 'stylesheet'
      newElement.href = url
      document.head.appendChild(newElement)
    }
    if (file.endsWith('.js')) {
      newElement = document.createElement('script')
      newElement.type = 'text/javascript'
      newElement.src = file
      document.body.appendChild(newElement)
    }
  })
}

// Starting point

if (process.env.VUE_APP_HMR) {
  const WS_URL = `ws://localhost:${process.env.VUE_APP_HMR_PORT || 8099}`
  const socket = new WebSocket(WS_URL)

  socket.onopen = () => {
    console.log(
      `[@pitcher/watcher]: HMR enabled in port: ${process.env.VUE_APP_HMR_PORT}, mode: ${process.env.VUE_APP_HMR_MODE}`
    )
  }

  socket.onmessage = ({ data }) => {
    const res = JSON.parse(data)

    if (res.event === 'HOT_RELOAD') {
      console.log('[@pitcher/watcher]: page updated')
      removeCurrentFiles(res.files.current)
      injectNewFiles(res.files.updated)
    } else if (res.event === 'LIVE_RELOAD') {
      window.location.reload()
    }
  }

  socket.onclose = () => {
    console.error('[@pitcher/watcher]: HMR connection closed!')
  }
}

// export const useHotModule = (fileNames) => {
//   const scriptsArray = Array.from(document.scripts)

//   let foundScripts = []

//   fileNames.forEach((name) => {
//     const found = scriptsArray.filter((el) => el.src.includes(name))

//     if (!found) return

//     found.forEach((script) => {
//       foundScripts.push(script)
//     })
//   })

//   foundScripts = Array.from(new Set(foundScripts.map((item) => item)))

//   foundScripts.forEach((script) => {
//     const parentContainer = script.parentNode
//     const src = `${script.getAttribute('src')}?updated=${Date.now()}`

//     script.remove()

//     const newScript = document.createElement('script')

//     newScript.src = src
//     newScript.type = 'text/javascript'
//     parentContainer.appendChild(newScript)
//   })
// }

// Singular example
// export const useHotModule = (fileNames) => {
//   const scriptsArray = Array.from(document.scripts)
//   const foundScript = scriptsArray.find((el) => el.src.includes(fileNames))
//   const parentContainer = foundScript.parentNode

//   const src = `${foundScript.getAttribute('src')}?updated=${Date.now()}`
//   const newScript = document.createElement('script')

//   foundScript.remove()

//   newScript.src = src
//   newScript.type = 'text/javascript'
//   parentContainer.appendChild(newScript)
// }
