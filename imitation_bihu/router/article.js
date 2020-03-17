const Router = require('koa-router')
const router = new Router({ prefix: '/article' })
const articleModel = require("../model/articleModel")
const userModel = require("../model/userModel")
const collectionModel = require("../model/collectionModel")
const multer = require("koa-multer")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/upload") //注意路径必须存在
    },
    filename: (req, file, cb) => {
        let fileFormat = (file.originalname).split(".");
        cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
})

const upload = multer({
    storage: storage
})

// 添加文章
router.get("/add", async (ctx, next) => {
    const { uid, islogin } = ctx.session.userInfo
    const userData = await userModel.findById({ _id: uid })
    if(!ctx.session.userInfo){
        ctx.render("/error",{
            res: "快去登陆啊，不然我不让你写文章",
            msg: "别捣乱啊！",
            prevpage: "前往登陆页",
            redirecturl: `${ctx.state.__HOST__}/login`
        })
    }else{
        ctx.render("addarticle",{
            islogin,
            userData
        })
    }
})

//添加文章验证
router.post("/addcheck", upload.single("imgUrl"), async (ctx, next) => {
    const { _id } = ctx.session.userInfo
    const { title, content } = ctx.request.body
    const imgUrl = ctx.request.files.path   
    const articleEntity = new articleModel({
        uid: _id,
        title,
        keywords: '',
        description: '',
        content,
        addTime: new Data(),
        imgUrl,
        is_best: 0,
        is_hot: 0,
        is_new: 0,
        status: 0
    })
    await articleEntity.save((err, data) => {
        if (err) return
        console.log("添加文章成功")
    })
    ctx.redirect(`${ctx.state.__HOST__}/home`)
})

// 删除文章
router.get("/remove/:id", async (ctx, next) => {
    const _id = ctx.params.id
    const res = await articleModel.remove({ _id })
    if(res.ok === 1){
        ctx.body = {
            data:{
                res,
                msg: "success"
            }
        }
    }else{
        ctx.body = {
            data:{
                res,
                msg: "error"
            }
        }
    }
})

//编辑文章
router.get("/edit/:id",async (ctx, next) => {
    const art_id = ctx.params.id
    const { uid, islogin } = ctx.session.userInfo
    const artRes = await articleModel.findById({ _id: art_id })
    const userRes = await userModel.findById({ _id:uid })
    if(!ctx.session.userInfo){
        ctx.render("/error",{
            res: "编辑好像出了点问题",
            msg: "编辑文章失败！",
            prevpage: "前往上一页",
            redirecturl: `${ctx.state.__HOST__}/article/edit/${art_id}`
        });
    }else{
        ctx.render("/editarticle",{
            islogin,
            userRes,
            artRes
        })
    }
})

// 验证编辑文章
router.post("/editcheck", upload.single("imgUrl"), async (ctx, next) => {
    const { uid } = ctx.session.userInfo
    const { aid ,title, content } = ctx.request.body
    const imgUrl = ctx.req.file ? ctx.req.file.path : artinfo.img_url   
    const articleEntity = new articleModel({
        uid,
        title,
        keywords: '',
        description: '',
        content,
        addTime: new Data(),
        imgUrl,
        is_best: 0,
        is_hot: 0,
        is_new: 0,
        status: 0
    })
    await articleEntity.save((err, data) => {
        if (err) return
        console.log("添加文章成功")
    })
    ctx.redirect(`${ctx.state.__HOST__}/home`)
    let updatainfo = await articleModel.updateOne({_id:aid},articlecon);
    
    if(updatainfo.ok == 1){
        ctx.redirect(ctx.state.__HOST__+"/bihuwebsite/mycenter");
    }else{
        ctx.render("default/bihu/error",{
            "res": "肯定是你的操作有误",
            "msg": "编辑文章失败！",
            "prevpage": "前往上一页",
            "redirecturl":ctx.state.__HOST__+"/bihuwebsite/article/edit"+id
        });
    }
    
})

// 文章详情
router.get("/details/:id", async (ctx, next) => {
    const aid = ctx.params.id 
    const { uid, islogin } = ctx.session.userInfo
    const userRes = await userModel.findById({ _id: uid })
    const artRes = await articleModel.findOne({
        _id: aid
    }).populate('uid')
    // data.at = tools.formatDate(data.add_time, format = "YY年MM月DD日");
    const iscollection = await collectionModel.findOne({ uid, aid })
    ctx.render("/page", {
        islogin,
        userRes,
        artRes,
        iscollection: iscollection ? 'cur' : ''
    });
});

// 收藏文章
router.post("/collection", async (ctx, next) => {
    const { uid, islogin } = ctx.session.userInfo
    const { aid } = ctx.request.body  
    const iscollection = await collectionModel.findOne({ uid, aid })
    if(islogin != "success"){
        ctx.body = JSON.stringify({
            // 返回1表示未登陆
            stu: 1,
            msg: "success"
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
                msg: "success"
            }) 
        }else{
            await collectionModel.remove({
                uid,
                aid
            })
            ctx.body = JSON.stringify({
                // 返回3表示之前已经收藏过 此时进行取消收藏操作
                stu: 3,
                msg: "success"
            })
        }
    }
})

module.exports = router