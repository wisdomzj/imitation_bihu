const Router = require('koa-router')
const router = new Router({ prefix: '/article' })
const articleModel = require("../model/articleModel")
const userModel = require("../model/userModel")
const collectionModel = require("../model/collectionModel")
const tools = require("../utils/tools")

// 添加文章
router.get("/add", async (ctx, next) => {
    const { uid, islogin } = ctx.session.userInfo
    const userData = await userModel.findById({ _id: uid })
    if(!ctx.session.userInfo){
        ctx.render("error",{
            res: "快去登陆啊，不然我不让你写文章",
            msg: "别捣乱啊！",
            prevpage: "前往登陆页",
            redirecturl: "/login"
        })
    }else{
        ctx.render("addarticle",{
            islogin,
            userData
        })
    }
})

//添加文章验证
router.post("/addcheck", async (ctx, next) => {
    const { uid } = ctx.session.userInfo
    const { title, content } = ctx.request.body
    const imgUrl = "http://localhost:3000/default/coverbg.jpg"   
    const articleEntity = new articleModel({
        uid,
        title,
        status: 0,
        is_best: 0,
        is_hot: 0,
        is_new: 0,
        keywords: '',
        description: '',
        content,
        addTime: new Date(),
        imgUrl
    })
    const result = await articleEntity.save()

    ctx.body = {
        data:{
            result,
            msg:"success"
        }
    }
})

// 删除文章
router.get("/remove/:id", async (ctx, next) => {
    const _id = ctx.params.id
    const res = await articleModel.remove({ _id })
    if(res.ok === 1){
        ctx.body = {
            data:{
                res,
                msg: "删除成功"
            }
        }
    }else{
        ctx.body = {
            data:{
                res,
                msg: "删除失败"
            }
        }
    }
})

//编辑文章
router.get("/edit/:id",async (ctx, next) => {
    const art_id = ctx.params.id
    const { uid, islogin } = ctx.session.userInfo
    const artRes = await articleModel.findById({ _id: art_id })
    const userData = await userModel.findById({ _id:uid })
    if(!ctx.session.userInfo){
        ctx.render("/error",{
            res: "编辑好像出了点问题",
            msg: "编辑文章失败！",
            prevpage: "前往上一页",
            redirecturl: `/article/edit/${art_id}`
        })
    }else{
        ctx.render("editarticle",{
            islogin,
            userData,
            artRes
        })
    }
})

// 验证编辑文章
router.post("/editcheck", async (ctx, next) => {
    const { aid ,title, content } = ctx.request.body 
    const result = await articleModel.updateOne({ _id:aid }, {$set:{title,content}})
    ctx.body = {
        data:{
            result
        }
    }
})

// 文章详情
router.get("/details/:id", async (ctx, next) => {
    const aid = ctx.params.id 
    const { uid, islogin } = ctx.session.userInfo
    const userData = await userModel.findById({ _id: uid })
    const artRes = await articleModel.findOne({
        _id: aid
    }).populate('uid')
    artRes.at = tools.formatDate(artRes.addTime, format = "YY年MM月DD日")
    const iscollection = await collectionModel.findOne({ uid, aid })
    
    ctx.render("page", {
        islogin,
        userData,
        artRes,
        aid,
        iscollection: iscollection ? 'cur' : ''
    })
})

// 收藏文章
router.post("/collection", async (ctx, next) => {
    const { uid, islogin } = ctx.session.userInfo
    const { aid } = ctx.request.body  
    const iscollection = await collectionModel.findOne({ uid, aid })
    
    if(islogin != "success"){
        ctx.body = JSON.stringify({
            // 返回1表示未登陆
            stu: 1,
            msg: "未登录,前先登录进行收藏操作"
        })
    }else{
        if (!iscollection) {
            let collectionEnity = new collectionModel({
                uid,
                aid,
                coll_time: new Date()
            })
            await collectionEnity.save((err,data)=>{
                if(err) return err
                console.log("收藏文章成功")
            })
            ctx.body = JSON.stringify({
                // 返回2表示之前没收藏过 此时进行收藏操作
                stu: 2,
                msg: "收藏成功"
            }) 
        }else{
            await collectionModel.remove({
                uid,
                aid
            })
            ctx.body = JSON.stringify({
                // 返回3表示之前已经收藏过 此时进行取消收藏操作
                stu: 3,
                msg: "取消收藏"
            })
        }
    }
})

module.exports = router