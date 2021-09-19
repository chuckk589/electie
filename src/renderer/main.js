
import Vue from 'vue'
// import 'core-js/stable'
import axios from 'axios'
import CoreuiVue from '@coreui/vue'
import App from './App'
import router from './router'
import { iconsSet as icons } from './assets/icons/icons'
import store from './store'
//const config = require('./config').default
// store.clear();
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.prototype.$config = {
  server: process.env.NODE_ENV === 'development'
  ? 'http://localhost:778'
  : 'http://195.161.41.49:778'
}
Vue.use(CoreuiVue)
Vue.config.productionTip = false

// router.beforeEach((to, from, next) => {
//   //store.state.authed =false
//   // store.commit('set', ['authed', false])
//   if(to.name === 'login' && store.state.authed === true){
//     router.push('/rooms')
//   }
//   next()
// })

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  icons,
  template: '<App/>'
}).$mount('#app')


