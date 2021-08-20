<template>
  <VContainer class="home-container" fluid>
    <VRow>
      <VCol xs="12" sm="8" offsetSm="2" md="6" offsetMd="3" lg="4" offsetLg="4">
        <!-- example usage of translations -->
        <h1>{{ $t('Hello World!') }}</h1>
        <p>{{ $gettext('User: {username}', { username }) }}</p>
        <p>{{ $ngettext('I have {numTickets} tickets.', userNumTickets, { numTickets: userNumTickets }) }}</p>

        <HelloWorld class="my-4" :languages="availableLanguages" />

        <p>
          {{
            $gettext(
              'Pitcher redefines the way sales managers, marketing professionals, and field reps ' +
                'engage and interact with your customers. By integrating comprehensive solutions into a single, ' +
                'intuitive piece of sales enablement software, Pitcher empowers its users to be more productive ' +
                'and more profitable.'
            )
          }}
        </p>
        <p>{{ $gettext('Current time: {time}', { time: new Date() }) }}</p>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script>
import HelloWorld from '@/components/hello-world'
import { defineComponent, reactive, toRefs } from '@vue/composition-api'
import { useI18nStore } from '@pitcher/i18n'

export default defineComponent({
  name: 'Home',
  components: {
    HelloWorld,
  },
  setup() {
    const i18n = useI18nStore()

    const state = reactive({
      availableLanguages: i18n.state.availableLanguages,
      username: 'Anonymous User',
      userNumTickets: 5,
    })

    return {
      ...toRefs(state),
    }
  },
})
</script>

<style lang="scss" scoped>
.home-container {
  // styles here, always have a container class and put styles inside
}
</style>
