const Router = require('koa-router')
const router = new Router({
    prefix: '/mycenter'
})
const articleModel = require("../model/articleModel")
const userModel = require("../model/userModel")
const collectionModel = require("../model/collectionModel")
const settingModel = require("../model/settingModel")
const xss = require("xss")
const tools = require("../utils/tools")

router.get("/", async (ctx, next) => {
    if (!ctx.session.userInfo) {
        ctx.redirect("/login")
    } else {
        const {
            uid,
            islogin
        } = ctx.session.userInfo

        // 获取当前用户所发布的所有的文章
        let arts = await articleModel.find({
            uid
        }).sort({
            addTime: -1
        })
        arts = arts.map(item => {
            item.id = item._id.toString().slice(1, -1)
            item.at = tools.formatDate(item.addTime, "YY-MM-DD hh:mm:ss")
            return item
        })

        // 获取当前用户所有收藏文章
        const collaids = await collectionModel.find({
            uid
        })
        const collaidarr = []
        collaids.forEach(x => {
            collaidarr.push(x.aid)
        })
        let collarts = await articleModel.find({
            _id: {
                $in: collaidarr
            }
        })
        collarts = collarts.map(x => {
            x.id = x._id.toString().slice(1, -1)
            x.at = tools.formatDate(x.addTime, "YY-MM-DD hh:mm:ss")
            x.content = xss(x.content, {
                whiteList: [], // 白名单为空，表示过滤所有标签
                stripIgnoreTag: true, // 过滤所有非白名单标签的HTML
                stripIgnoreTagBody: ['script'] // script标签较特殊，需要过滤标签中间的内容
            }).slice(0, 100)
            return x
        })

        // 获取用户信息
        const userData = await userModel.findById({
            _id: uid
        })

        // 获取设置信息
        const setInfo = await settingModel.find({})

        ctx.render("mycenter", {
            islogin,
            setInfo,
            arts,
            collarts,
            userData
        })
    }
})

// 修改个人信息
router.post("/edit", async (ctx, next) => {
    if (!ctx.session.userInfo) {
        ctx.redirect("/login")
    } else {
        const {
            avaimg,
            pwd
        } = ctx.request.body
        const {
            uid
        } = ctx.session.userInfo
        let uinfo = await userModel.findById({
            _id: uid
        })
        const avatar = !avaimg ? uinfo.avatar : avaimg
        const password = !pwd ? uinfo.password : pwd
        const result = await userModel.updateOne({
            _id: uid
        }, {
            $set: {
                avatar,
                password
            }
        })
        ctx.body = {
            data: {
                result
            }
        }
    }
})

module.exports = router