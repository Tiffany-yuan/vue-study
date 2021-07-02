// 1. 插件  挂载 $store
// 2. 实现Store类


let Vue

class Store {
    constructor(options) {
        this.$options = options;
        // data响应式处理
        // 这里不会隐晦的处理下，避免外界直接变更Vue实例
        // this.state = new Vue({
        //     data: options.state
        // })
        this._vm = new Vue({
            data: {
                $$state: options.state
            }
        })
        this._mutations = options.mutations
        this._actions = options.actions
        this.commit = this.commit.bind(this)
        this.dispatch = this.dispatch.bind(this)
        // TODO
        this.getters = {}
        // defineProperties(this.getters, 'doubleCounter', { get() { })
    }
    // 隐晦处理
    get state() {
        return this._vm._data.$$state;
    }
    set state(v) {
        console.error('please use replaceState to reset state');
    }

    commit(type, payload) {
        const entry = this._mutations[type]
        if (!entry) {
            console.error('unknow mutation type');
        }
        entry(this.state, payload)
    }
    dispatch(type, payload) {
        const entry = this._actions[type]
        if (!entry) {
            console.error('unknow actions type');
        }
        entry(this, payload)
    }
     
}

function install(_Vue) {
    Vue = _Vue
    Vue.mixin({
        beforeCreate() {
            if (this.$options.store) {
                Vue.prototype.$store = this.$options.store
            } 
        }
    })
}
export default {Store, install}