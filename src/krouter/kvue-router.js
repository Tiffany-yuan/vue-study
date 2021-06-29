// 1. 插件
// 2.两个组件 router-view & router-link

// vue插件： 要求必须要又一个install方法，会被Vue.use调用

let Vue; // 保存Vue构造函数，插件中要使用，不导入还能用
class VueRouter {
    constructor(options) {
        this.$options = options;

        // 把current作为响应式数据
        // 将来hash发生变化时，router-view的render函数能够再次执行
        // vue底层给我们提供了一个定义响应式数据的方法 defineReactive
        const inital = window.location.hash.slice('#') || '/';
        Vue.util.defineReactive(this, 'current', inital);
        // this.current = '/';
        //监听hash变化
        window.addEventListener('hashchange', () => {
            this.current = window.location.hash.slice(1);
        })
    }
}

// 参数是Vue.use调用时传入的
VueRouter.install = function (_Vue) {
    Vue = _Vue;
    // 1. 在此挂载$router属性
    // 全局混入目的：延迟下面逻辑到router创建完毕并且附加到选项上时才执行
    Vue.mixin({
        // 次钩子在每个组件创建实例时都会被调用
        beforeCreate() {
            // 只有根实例才有此选项
            if (this.$options.router) {
                Vue.prototype.$route = this.$options.router;
            }
        }
    })

    // 2.注册实现两个组件router-view & router-link 
    Vue.component('router-link', {
        props: {
            to: {
                type: String,
                required: true
            }
        },
        render(h) {
            // <a href="">xxx</a>
            // 这里也可以用jsx，但是jsx兼容性较差，不推荐使用
            // return <a href={'#' + this.to}>{this.$slots.default}</a>
            return h(
                'a',
                {
                    attrs: {
                        href: '#' + this.to
                    }
                },
                this.$slots.default
            )
        }
    })

    Vue.component('router-view', {
        render(h) {
            // 获取当前路由对应的组件  
            let component = null;
            const route = this.$route.$options.routes.find(route => route.path === this.$route.current)
            if (route) {
                component = route.component;
            }
            console.log(this.$route.current, component);
            return h(component);
        }
    })

}

export default VueRouter
