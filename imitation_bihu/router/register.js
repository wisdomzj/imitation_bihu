const Router = require('koa-router')
const router = new Router({
    prefix: '/register'
})
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
        ctx.render("/error", {
            res: "用户名已存在",
            msg: "请换一个用户名",
            prevpage: "前往注册页",
            redirecturl: `${ctx.state.__HOST__}/register`
        })
    } else {
        const userEnity = new userModel({
            name,
            password,
            avatar: `/upload/avatar/touxiang.png`,
            loginTime: new Data(),
            addTime: new Data()
        })
        await userEnity.save((err, data) => {
            if (err) return
            console.log("注册用户成功")
        })
        ctx.redirect(`${ctx.state.__HOST__}/login`)
    }
})

module.exports = router