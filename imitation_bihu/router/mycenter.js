const Router = require('koa-router')
const router = new Router({
    prefix: '/mycenter'
})
const articleModel = require("../model/articleModel")
const userModel = require("../model/userModel")
const collectionModel = require("../model/collectionModel")
const xss = require("xss")
const multer = require("koa-multer")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/upload/user/bihu") //注意路径必须存在
    },
    filename: (req, file, cb) => {
        let fileFormat = (file.originalname).split(".");
        cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
})

const upload = multer({
    storage: storage
})

router.get("/", async (ctx, next) => {
    const { uid, islogin } = ctx.session.userInfo
    
    // 获取当前用户所发布的所有的文章
    const arts = await articleModel.find({ uid })
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
    const collarts = await articleModel.find({ _id:{$in:collaidarr}})
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
    const user = await userModel.find({ uid })
    
    ctx.render("/mycenter",{
        islogin,
        arts: arts,
        collarts: collarts,
        user: user 
    })
});

// 修改个人信息
router.post("/edituinfo", upload.single("avatar"), async (ctx, next)=>{
    let uid = ctx.session.uinfo.uid;
    let uname = ctx.req.body.uname;
    let password = ctx.req.body.password;
    let rpassword = ctx.req.body.rpassword;
    let uinfo = await userModel.findById({"_id":uid});
    let headportait = ctx.req.file ? ctx.req.file.path : uinfo.headportait;
    let prevPage = ctx.req.body.prevPage;
    let user = {
        "uname": uname,
        "password": password,
        "status": 0,
        "logintime": new Date(),
        "addtime": new Date(),
        "headportait": headportait
    }
    if (password != "") {
        if (password != rpassword) {
            ctx.render("default/bihu/error", {
                "res": "两次密码不一样",
                "msg": "卧槽,你怎么这么糊涂",
                "prevpage": "前往上一页",
                "redirecturl":prevPage
            });
        } else {
            let updateinfo = await userModel.updateOne({
                "_id": uid
            },user);
            if (updateinfo.ok == 1) {
                console.log("修改用户信息成功")
                ctx.redirect(ctx.state.__HOST__ + "/bihuwebsite/login");
            } else {
                ctx.render("default/bihu/error", {
                    "res": "修改信息错误",
                    "msg": "肯定是你操作有误",
                    "prevpage": "前往上一页",
                    "redirecturl":prevPage
                });
            }
        }
    } else {
        ctx.redirect(ctx.state.__HOST__ + "/bihuwebsite/mycenter");
    }
})

module.exports = router