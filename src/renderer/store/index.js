import Vue from 'vue'
import Vuex from 'vuex'

import { createPersistedState } from 'vuex-electron'


Vue.use(Vuex)

export default new Vuex.Store({
  state:{
    authed:false,
    user:{}
  },
  mutations: {
		set (state, [variable, value]) {
      state[variable] = value
    },
    updateUser(state, [value]) {
      for (const key in value) {
        state.user[key] = value[key]
      }
    },
	},
  plugins: [
    createPersistedState()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
