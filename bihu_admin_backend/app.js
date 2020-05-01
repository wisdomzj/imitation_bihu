const Koa = require('koa')
const cors = require('koa2-cors')
const koabody = require('koa-body')
const koajwt = require('koa-jwt')
const parameter = require('koa-parameter')
const error = require('koa-json-error')
const static = require('koa-static')
const mongoose = require('mongoose')
const { dbUrl } = require('./cmsSys.config')
const routing = require('./router')
const path = require('path')
const app = new Koa()

// 数据库链接
mongoose.connect(dbUrl,{
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

// 跨域
app.use(cors())

// 统一捕获错误
app.use(error({
    postFormat: (e, {stack, ...rest}) => process.env.NODE_ENV === 'production' ? rest :  {stack, ...rest}
}))

// 静态资源
app.use(static(path.join(__dirname,"./public")))

// 验证token
app.use(koajwt({
	secret: 'my_token'
}).unless({
	path: [
        /^\/admin\/login/,
        /^\/public/
    ]
}))

// 校验参数
app.use(parameter(app))

// 接受post和文件
app.use(koabody({
    multipart:true,
    formidable:{
        uploadDir:path.join(__dirname,'/public/upload'),
        keepExtensions:true
    }
}))

// 路由处理
routing(app)

app.listen(3000, ()=>{
    console.log("服务启动成功 端口号：3000")
})