const Router = require('koa-router')
const router = new Router({ prefix: '/login' })
const userModel = require("../model/userModel")

//登录
router.get("/", async (ctx, next) => {
    await ctx.render("login")
})

//登录验证
router.post("/check", async (ctx, next) => {
    const { name, password } = ctx.request.body
    const userRes = await userModel.findOne({ name })
    if (!userRes) {
        ctx.body = {
            msg: "用户不存在",
            code: 5008,
        }
    } else {
        if (userRes.password === password) {
            ctx.session.userInfo = {
                islogin: "success",
                uid: userRes._id,
                name: userRes.name
            }
            ctx.body = {
                msg: "登录成功",
                code: 5009,
            }
        } else {
            ctx.body = {
                msg: "密码错误",
                code: 5008,
            }
        }
    }
})

//退出登录
router.get("/exit", async (ctx) => {
    ctx.session.userInfo = null
    ctx.body = {
        msg: "退出成功",
        code: 5007,
    }
})

module.exports = router