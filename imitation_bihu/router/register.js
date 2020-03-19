const Router = require('koa-router')
const router = new Router({ prefix: '/register' })
const userModel = require("../model/userModel")
const settingModel = require("../model/settingModel")

//注册
router.get("/", async (ctx) => {
    const setInfo = await settingModel.find({})
    await ctx.render("register",{
        setInfo
    })
})

//注册验证
router.post("/check", async (ctx) => {
    const { name, password } = ctx.request.body
    const avatar = "http://localhost:3000/default/touxiang.png"
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
            avatar,
            loginTime: new Date(),
            addTime: new Date()
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