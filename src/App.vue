<template>
  <VApp id="app">
    <VMain>
      <RouterView v-if="loaded" />
    </VMain>
  </VApp>
</template>

<script>
import { loadConfig, loadParams, useParamsStore } from '@pitcher/core'
import { onMounted, reactive, toRefs } from '@vue/composition-api'
import { useBrowserLanguage, useI18nStore } from '@pitcher/i18n'

export default {
  name: 'App',
  setup() {
    const i18n = useI18nStore()

    const state = reactive({
      isBrowser: typeof window.Ti === 'undefined',
      loaded: false,
    })

    onMounted(async () => {
      if (state.isBrowser) {
        const { getAvailableBrowserLanguage } = useBrowserLanguage()
        const lang = getAvailableBrowserLanguage(Object.keys(i18n.state.availableLanguages))

        if (lang) {
          i18n.setLanguage(lang)
        }
      } else {
        await loadConfig()
        await loadParams()

        const { language } = useParamsStore()

        if (language && i18n.state.availableLanguages[language]) {
          i18n.setLanguage(language)
        }
      }

      state.loaded = true
    })

    return {
      ...toRefs(state),
    }
  },
}
</script>

<style lang="scss">
@import '@/styles/global.scss';
</style>
