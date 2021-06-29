import Vue from 'vue'
import Vuex from './kvuex'

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
    add({commit}) {
      // 参数是什么 从哪来的？
      setTimeout(() => {
        commit('add')
      }, 1000)
    }
  },
  getters: {
    doubleCounter(state) {
      return state.counter * 2
    }
  }
})
