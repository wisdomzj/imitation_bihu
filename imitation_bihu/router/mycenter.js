const Router = require('koa-router')
const router = new Router({ prefix: '/mycenter' })
const articleModel = require("../model/articleModel")
const userModel = require("../model/userModel")
const collectionModel = require("../model/collectionModel")
const xss = require("xss")

router.get("/", async (ctx, next) => {
    const { uid, islogin } = ctx.session.userInfo
    
    // 获取当前用户所发布的所有的文章
    let arts = await articleModel.find({ uid })
    arts = arts.map(item => {
        item.id = item._id.toString().slice(1,-1)
        return item
    })
    
    // 获取当前用户所有收藏文章
    const collaids = await collectionModel.find({ uid })
    const collaidarr = []
    collaids.forEach(x=>{
        collaidarr.push(x.aid)
    })
    let collarts = await articleModel.find({ _id:{$in:collaidarr}})
    collarts = collarts.map(x=>{
        x.id = x._id.toString().slice(1,-1)
        x.content = xss(x.content, {
            whiteList: [], // 白名单为空，表示过滤所有标签
            stripIgnoreTag: true, // 过滤所有非白名单标签的HTML
            stripIgnoreTagBody: ['script'] // script标签较特殊，需要过滤标签中间的内容
    }).slice(0, 100)
        return x
    })
    
    // 获取用户信息
    const userData = await userModel.findById({ _id: uid })
    
    ctx.render("mycenter",{
        islogin,
        arts,
        collarts,
        userData 
    })
})

// 修改个人信息
router.post("/edit", async (ctx, next)=>{
    const { password } = ctx.request.body
    const { uid } = ctx.session.userInfo 
    const result = await userModel.updateOne({_id: uid}, {$set:{ password }})
    ctx.body = {
        data:{
            result
        }
    }
})

module.exports = router