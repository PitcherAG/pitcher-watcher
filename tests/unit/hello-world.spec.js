import helloWorld from '@/components/hello-world.vue'
import { shallowMount } from '@vue/test-utils'

describe('hello-world', () => {
  const getWrapper = () =>
    shallowMount(helloWorld, {
      propsData: {
        languages: {},
      },
    })

  describe('rendering', () => {
    it('renders correctly', () => {
      const wrapper = getWrapper()

      expect(wrapper).toMatchSnapshot()
    })
  })
})
