// const fs = require('fs')
const languages = require('./gettext.config').languages
const pkgVersion = require('./package.json').version
const pkgName = require('./package.json').name
const filenameSuffix = process.env.NODE_ENV === 'development' ? '[hash:5]' : ''

module.exports = {
  lintOnSave: false,
  publicPath: './',
  /* HTTPS for window.location.href trick in Windows
  devServer: {
    https: {
      ca: fs.readFileSync('utils/cert/myCA.pem'),
      cert: fs.readFileSync('utils/cert/development.crt'),
      key: fs.readFileSync('utils/cert/development.key')
    },
    public: 'development:8080'
  }, */
  configureWebpack: {
    output: {
      filename: `js/[name]${filenameSuffix}.js`,
      chunkFilename: `js/[name]${filenameSuffix}.js`,
    },
    // Enable this to disable minification and split the shit out of chunks to identify problem easier on Windows environment
    // optimization: {
    //   minimize: false,
    //   splitChunks: {
    //     minSize: 10000,
    //     maxSize: 250000
    //   }
    // }
  },
  css: {
    extract: {
      filename: `css/[name]${filenameSuffix}.css`,
      chunkFilename: `css/[name]${filenameSuffix}.css`,
    },
  },
  // Include Packages for transpiling
  transpileDependencies: ['vuetify', '@pitcher/core', '@pitcher/pitcherify', '@pitcher/i18n', '@pitcher/vue-sdk'],
}

// NOTE: Don't forget to declare environmental variables in jest.setEnvVars.js as well for test purposes
process.env.VUE_APP_VERSION = JSON.stringify(pkgVersion)
process.env.VUE_APP_NAME = JSON.stringify(pkgName)
process.env.VUE_APP_LANGUAGES = JSON.stringify(languages)
