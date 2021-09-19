import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: require('@/components/Login').default,
    },
    {
      path: '/main',
      name: 'main',
      component: require('@/components/Main').default,
    },
    {
      path: '/rooms',
      name: 'rooms',
      component: require('@/components/Rooms').default,
    }
  ]
})
