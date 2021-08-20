import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'
// Required for pitcherify overrides
import CUSTOM_ICONS from '@pitcher/pitcherify/src/utils/fa-icons'
import scssVars from '@/styles/js-variables.scss'
import '@pitcher/pitcherify/src/styles/overrides.scss'

Vue.use(Vuetify)

const VInstance = new Vuetify({
  theme: {
    options: {
      // must be disabled to work properly in IE11
      customProperties: false,
    },
    themes: {
      light: {
        primary: scssVars.primary,
        secondary: scssVars.secondary,
        accent: scssVars.accent,
        error: scssVars.error,
        info: scssVars.info,
        success: scssVars.success,
        warning: scssVars.warning,
        background: scssVars.bodyBg,
      },
    },
  },
  icons: {
    iconfont: 'fa',
    values: CUSTOM_ICONS,
  },
})

/* 
Save vuetify instance into the vue instance
This is required to be able to access Vuetify instance across different modules
*/
// REQUIRED
Vue.prototype.$vuetify = VInstance

export default VInstance
