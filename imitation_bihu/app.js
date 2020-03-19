const Koa = require('koa')
const error = require('koa-json-error')
const render = require("koa-art-template")
const session = require("koa-session")
const koaBody = require('koa-body')
const static = require('koa-static')
const mongoose = require('mongoose')
const { dbUrl } = require('./web.config')
const routing = require('./router')
const path = require('path')
const url = require('url')
const app = new Koa()

// 数据库链接
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

mongoose.connection.on("error", (err) => {
    console.log("数据库连接失败：" + err)
})

mongoose.connection.on("open", () => {
    console.log("------数据库连接成功！------")
})


// 统一捕获错误
app.use(error({
    postFormat: (e, {
        stack,
        ...rest
    }) => process.env.NODE_ENV === 'production' ? rest : {
        stack,
        ...rest
    }
}))

// 接受post参数
app.use(koaBody())

// 处理session
app.keys = ['some secret hurr']
const CONFIG = {
    key: 'koa:sess',
    autoCommit: true,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false,
    renew: false
}
app.use(session(CONFIG, app))

// 处理静态资源
app.use(static(path.join(__dirname, "./public")))

// 模板引擎
render(app, {
    root: path.join(__dirname, 'views'),
    extname: '.html',
    debug: process.env.NODE_ENV !== 'production',
    dateFormat: dateFormat = function (value) {
        return sd.format(value, 'YYYY-MM-DD HH:mm')
    } /*扩展模板里面的方法*/
})

// 路由处理
routing(app)

app.listen(4000, () => {
    console.log("服务启动成功 端口号：4000")
})