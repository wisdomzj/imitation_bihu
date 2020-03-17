const Router = require('koa-router')
const router = new Router({ prefix: '/register' })
const userModel = require("../model/userModel")

//注册
router.get("/", async (ctx) => {
    await ctx.render("register")
})

//注册验证
router.post("/check", async (ctx) => {
    const { name, password } = ctx.request.body
    const exist = await userModel.find({ name })
    if (exist.length > 0) {
        ctx.body = {
            msg: "用户名已存在",
            code: 5005,
        }
    } else {
        const userEnity = new userModel({
            name,
            password,
            avatar: `${ctx.origin}/public/default/touxiang.png`,
            loginTime: new Data(),
            addTime: new Data()
        })
        await userEnity.save((err, data) => {
            if (err) return
            console.log("注册用户成功")
        })
        ctx.body = {
            msg: "注册用户成功",
            code: 0,
        }
    }
})

module.exports = router