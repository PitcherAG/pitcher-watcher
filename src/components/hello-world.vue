<template>
  <div class="hello-world-container">
    <div class="subtitle-2 mb-2">{{ $gettext('Language') }}</div>

    <VSelect
      :items="mapLanguages"
      :value="i18n.state.locale"
      color="primary"
      dense
      outlined
      hideDetails
      @input="(val) => setLanguage(val)"
    />
  </div>
</template>

<script>
import { computed, defineComponent } from '@vue/composition-api'
import { useI18nStore } from '@pitcher/i18n'

export default defineComponent({
  name: 'HelloWorld',
  props: {
    languages: {
      type: Object,
      default: () => {},
      required: true,
    },
  },
  setup(props) {
    const i18n = useI18nStore()
    const setLanguage = async (lang) => await i18n.setLanguage(lang)

    // SDK dropdown needs an object array,
    // Map object as an array
    const mapLanguages = computed(() => {
      const languagesArray = []

      for (const langKey in props.languages) {
        languagesArray.push({
          // Text to show in dropdown
          text: props.languages[langKey],
          // Value to emit when selected
          value: langKey,
        })
      }

      return languagesArray
    })

    return { i18n, setLanguage, mapLanguages }
  },
})
</script>

<style lang="scss" scoped>
.hello-world-container {
  // styles here, always have a container class and put styles inside
}
</style>
