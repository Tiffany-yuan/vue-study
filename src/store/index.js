import Vue from 'vue'
import Vuex from 'vuex'

// this.$store.state.xxx
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    counter: 0
  },
  // commit 
  mutations: {
    add(state) {
      // state 从哪来
      state.counter++
    }
  },
  // dispatch
  actions: {
  },
  modules: {
  }
})
