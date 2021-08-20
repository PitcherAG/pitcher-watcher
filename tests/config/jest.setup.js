import Vue from 'vue'

// must come first
import VueCompositionApi from '@vue/composition-api'
Vue.use(VueCompositionApi)

import vuetify from 'vuetify'
import { TranslationPlugin } from '@pitcher/i18n'

Vue.use(vuetify)
Vue.use(TranslationPlugin, { availableLanguages: JSON.parse(process.env.VUE_APP_LANGUAGES) })
