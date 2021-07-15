// 数据响应式
function defineReactive(obj, key, val) {
    observe(val)
    
    // 创建Dep实例
    const dep = new Dep()

    Object.defineProperty(obj, key, {
        get() {
            console.log('get', key);
            // 依赖收集
            Dep.target && dep.addDep(Dep.target)
            return val;
        },
        set(newVal) {
            console.log('set', key);
            if (newVal !== val) {
                observe(newVal)
                val = newVal

                // 通知更新
                dep.notify()
                // watchers.forEach(w => {
                //     w.update()
                // })
            }
        }
    })  
}

// 遍历obj，对其所有属性做响应式
function observe(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return
    }
    // Object.keys(obj).forEach(key => {
    //     defineReactive(obj, key, obj[key])
    // })
    new Observe(obj)
}
// 根据传入value的类型做响应的响应式处理
class Observe {
    constructor(value) {
        this.value = value
        if (Array.isArray(value)) {
 
        } else {
            this.walk(value)
        }
    }
    // 对象响应式
    walk(obj) {
        Object.keys(obj).forEach(key => {
            defineReactive(obj, key, obj[key])
        })
    }
}

function proxy(vm) {
    Object.keys(vm.$data).forEach(key => {
        Object.defineProperty(vm, key, {
            get() {
                return vm.$data[key]
            },
            set(val) {
                vm.$data[key] = val
            }
        })
    })
}

// 先实现KVue类
// 1. 对data选项做响应式处理
// 2. 编译模版
class KVue {
    constructor(options) {
        this.$options = options
        this.$data = options.data

        // data响应式处理
        observe(this.$data)

        // 代理
        proxy(this)
        
        // 编译 compile
        new Compile(options.el, this)
    }
}

// 编译解析模版
// 1. 处理插值
// 2. 处理指令和事件
// 3. 以上两者初始化和更新
class Compile{
    constructor(el, vm) {
        this.$el = document.querySelector(el)
        this.$vm = vm
        if(this.$el) {
            this.compile(this.$el)
        }
    }
    compile($el) {
        // 遍历el子节点，判断他们类型做对应处理
        const childNodes = $el.childNodes
        childNodes.forEach(node => {
            if (node.nodeType === 1) { // 元素
                // console.log('元素', node.nodeName);
                // 处理指令和事件
                const attrs = node.attributes;
                Array.from(attrs).forEach(attr => {
                    // k-xxx="aaa"
                    const attrName = attr.name
                    const exp = attr.value
                    if (attrName.startsWith('k-')) {
                        const dir = attrName.substring(2)
                        this[dir] && this[dir](node, exp)
                    }
                })
            } else if (this.isInter(node)) { // 动态文本
                // console.log('插值', node.textContent);
                this.compileText(node)
            }
            // 递归处理
            if (node.childNodes) {
                this.compile(node)
            }
        })
    }

    update(node, exp, dir) {
        // 1. 初始化
        const fn = this[dir + 'Updater']
        fn && fn(node, this.$vm[exp])
        // 2. 更新
        new Watcher(this.$vm, exp, function (val) {
            fn && fn(node, val)
        })
    }

    // 属性上有k-xxx，一定会有一个xxx方法来执行它
    // k-text
    text(node, exp) {
        this.update(node, exp, 'text')
    }
    textUpdater(node, value) {
        node.textContent = value
    }
    // 编译文本
    compileText(node) {
        this.update(node, RegExp.$1, 'text')
    }
    // k-html
    html(node, exp) {
        this.update(node, exp, 'html')
    }
    htmlUpdater(node, value) {
        node.innerHTML = value
    }

    // 是否插值表达式
    isInter(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
    

}

// const watchers = []
// 监听器 负责依赖的更新
class Watcher {
    constructor(vm, key, updateFn) {
        this.$vm = vm
        this.key = key
        this.updateFn = updateFn

        // watchers.push(this)
        // 触发依赖收集
        Dep.target = this
        this.$vm[this.key]
        Dep.target = null
    }
    // 未来被Dep调用
    update() {
        // 执行实际的更新操作
        this.updateFn.call(this.$vm, this.$vm[this.key])
    }
}

class Dep {
    constructor() {
        this.deps = []
    }
    addDep(dep) {
        this.deps.push(dep)
    }
    //更新
    notify() {
        this.deps.forEach(dep => {
            dep.update()
        })
    }
}