const Router = require('koa-router')
const router = new Router({ prefix: '/login' })
const userModel = require("../model/userModel")

//登录
router.get("/", async(ctx, next) => {
    await ctx.render("login")
})

//登录验证
router.post("/check", async(ctx, next) => {
    const { name, password } = ctx.request.body
    const userRes = await userModel.findOne({ name })
    if (!userRes) {
        ctx.render("error", {
            res: "用户不存在",
            msg: "卧槽！查无此人",
            prevpage: "前往登陆页",
            redirectUrl: '/login'
        })
    } else {
        if (userRes.password === password) {
            ctx.session.userInfo = {
                islogin: "success",
                uid: userRes._id,
                name: userRes.name
            }
            ctx.redirect('/home')
        } else {
            ctx.render("error", {
                res: "密码错误!!!",
                msg: "卧槽！密码怎么忘记了",
                prevpage: "前往登陆页",
                redirecturl: '/login'
            })
        }
    }
})

//退出登录
router.get("/exit", async(ctx) => {
    ctx.session.userInfo = null
    ctx.redirect('/login')
})

module.exports = router