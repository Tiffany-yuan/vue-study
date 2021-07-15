// 数据响应式
function defineReactive(obj, key, val) {
    observe(val)
    Object.defineProperty(obj, key, {
        get() {
            console.log('get', key);
            return val;
        },
        set(newVal) {
            // observe(newVal)
            console.log('set', key);
            if (newVal !== val) {
                val = newVal
            }
        }
    })  
}
// let obj = {}
// defineReactive(obj, 'yuan', '26')
// obj.yuan
// obj.yuan = 18

// 遍历obj，对其所有属性做响应式
function observe(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return
    }
    Object.keys(obj).forEach(key => {
        defineReactive(obj, key, obj[key])
    })
}

function set(obj, key, val) {
    defineReactive(obj, key, val)
}

let obj = {
    foo: 'foo',
    bar: 'bar',
    yuan: {
        name: 'myy',
        age: 26
    }
}
observe(obj)
obj.foo
obj.bar = 'barrrr'
obj.yuan.name = 'mengyuanyuan'
obj.yuan = { 
    job: 'coder'
}
// 当设置一个新属性时，下面这种方法不行
obj.dan = 'dandan' // 不可以！！！
// 需要用到这种转发
set(obj, 'dan', 'dandan')
obj.dan

// 数组
// js一共有七个改变数组本身的方法：push/pop/shift/unshift/reverse/sort/splice  以上这些方法使用defineProperty拦截不到

 