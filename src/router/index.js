import Home from '@/views/home.view'
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  // Example for code splitting
  // {
  //   path: "/path",
  //   name: "name",
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ "@/views/VIEW_NAME.vue")
  // }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes,
})

export default router
