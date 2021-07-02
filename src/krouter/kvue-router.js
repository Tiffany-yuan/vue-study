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
        // 处理当前只有一层路由的情况
        // Vue.util.defineReactive(this, 'current', inital);
        // 处理多级路由
        this.current = inital;
        Vue.util.defineReactive(this, 'matched', [])
        this.match()
        //监听hash变化
        window.addEventListener('hashchange', () => {
            this.current = window.location.hash.slice(1);
            this.matched = [];
            this.match()
        }) 
    }

    // 实现match
    match(routes) {
        routes = routes || this.$options.routes
        // 递归遍历
        for (const route of routes) {
            if (route.path === '/' && this.current === '/') {
                this.matched.push(route)
                return
            }
            // /about/info
            if (route.path !== '/' && this.current.indexOf(route.path) != -1) {
                this.matched.push(route)
                if (route.children) {
                    this.match(route.children)
                }
                return
            }
        }
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

    // 这里只解决了当前只有一层路由的情况
    // Vue.component('router-view', {
    //     render(h) {
    //         // 获取当前路由对应的组件  
    //         let component = null;
    //         const route = this.$route.$options.routes.find(route => route.path === this.$route.current)
    //         if (route) {
    //             component = route.component;
    //         }
    //         console.log(this.$route.current, component);
    //         return h(component);
    //     }
    // })
    
    // 如果存在多级路由：
    // 1. 标记routerView
    // 2. 通过这个标记计算路由的深度
    // 3. 路由匹配时获取代表深度层级的matched数组
    // 解决多级路由
    Vue.component('router-view', {
        render(h) {
            //标记当前router-view的深度
            this.$vnode.data.routerView = true;
            let depth = 0
            let parent = this.$parent
            while (parent) {
                const vnodeData = parent.$vnode && parent.$vnode.data
                if (vnodeData && vnodeData.routerView) {
                    //说明当前的parent是一个router-view
                    depth++
                }
                parent = parent.$parent
            }

            // 这里只解决了当前只有一层路由的情况
            // 获取当前路由对应的组件  
            // let component = null;
            // const route = this.$route.$options.routes.find(route => route.path === this.$route.current)
            // if (route) {
            //     component = route.component;
            // }
            // console.log(this.$route.current, component);
            
            // 如果存在多级路由：
            let component = null
            const route = this.$route.matched[depth]
            if (route) {
                component = route.component;
            }
            return h(component)
        }
    })

}

export default VueRouter
