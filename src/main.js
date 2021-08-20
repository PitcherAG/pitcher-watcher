// Must be called first
import './plugins/composition-api'

// FastClick plugin to remove click delay in webview
// NOTE: This might cause some side effects
// import './plugins/fastclick'

// Sentry integration, enable if needed
// import './plugins/sentry'

import App from './App.vue'
import Vue from 'vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { TranslationPlugin } from '@pitcher/i18n'
import 'roboto-fontface/css/roboto/roboto-fontface.css'

Vue.use(TranslationPlugin, { availableLanguages: JSON.parse(process.env.VUE_APP_LANGUAGES) })
Vue.config.productionTip = false

new Vue({
  name: 'PitcherVueApp',
  router,
  vuetify,
  render: (h) => h(App),
}).$mount('#app')
