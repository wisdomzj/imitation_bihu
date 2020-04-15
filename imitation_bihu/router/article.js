const Router = require('koa-router')
const router = new Router({
    prefix: '/article'
})
const articleModel = require("../model/articleModel")
const userModel = require("../model/userModel")
const collectionModel = require("../model/collectionModel")
const focusModel = require("../model/focusModel")
const linkModel = require("../model/linkModel")
const commentModel = require("../model/commentModel")
const settingModel = require("../model/settingModel")
const tools = require("../utils/tools")
const {
    baseUrl
} = require('../web.config')
const rp = require('request-promise')
const xss = require("xss")


// 添加文章
router.get("/add", async (ctx, next) => {
    if (!ctx.session.userInfo) {
        ctx.redirect("/login")
    } else {
        const {
            uid,
            islogin
        } = ctx.session.userInfo
        const userData = await userModel.findById({
            _id: uid
        })
        const setInfo = await settingModel.find({})
        ctx.render("addarticle", {
            islogin,
            setInfo,
            userData
        })
    }
})

//添加文章验证
router.post("/addcheck", async (ctx, next) => {
    const {
        uid
    } = ctx.session.userInfo
    const {
        title,
        content,
        imgUrl
    } = ctx.request.body
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
        data: {
            result,
            msg: "success"
        }
    }
})

// 删除文章
router.get("/remove/:id", async (ctx, next) => {
    const _id = ctx.params.id
    const res = await articleModel.remove({
        _id
    })
    if (res.ok === 1) {
        ctx.body = {
            data: {
                res,
                msg: "删除成功"
            }
        }
    } else {
        ctx.body = {
            data: {
                res,
                msg: "删除失败"
            }
        }
    }
})

//编辑文章
router.get("/edit/:id", async (ctx, next) => {
    if (!ctx.session.userInfo) {
        ctx.redirect("/login")
    } else {
        const art_id = ctx.params.id
        const {
            uid,
            islogin
        } = ctx.session.userInfo
        const artRes = await articleModel.findById({
            _id: art_id
        })
        const userData = await userModel.findById({
            _id: uid
        })
        const setInfo = await settingModel.find({})
        ctx.render("editarticle", {
            islogin,
            setInfo,
            userData,
            artRes
        })
    }
})

// 验证编辑文章
router.post("/editcheck", async (ctx, next) => {
    const {
        aid,
        title,
        content,
        coverimgUrl
    } = ctx.request.body
    const artRes = await articleModel.findById({
        _id: aid
    })
    const imgUrl = !coverimgUrl ? artRes.imgUrl : coverimgUrl
    const result = await articleModel.updateOne({
        _id: aid
    }, {
        $set: {
            title,
            content,
            imgUrl
        }
    })
    ctx.body = {
        data: {
            result
        }
    }
})

// 文章详情
router.get("/details/:aid", async (ctx, next) => {
    if (!ctx.session.userInfo) {
        ctx.redirect("/login")
    } else {
        const {
            aid
        } = ctx.params
        const {
            uid,
            islogin
        } = ctx.session.userInfo
        const userData = await userModel.findById({
            _id: uid
        })
        const artRes = await articleModel.findOne({
            _id: aid
        }).populate('uid')
        artRes.at = tools.formatDate(artRes.addTime, format = "YY年MM月DD日")
        const iscollection = await collectionModel.findOne({
            uid,
            aid
        })
        const setInfo = await settingModel.find({})
        let commRes = await commentModel.find({
            aid
        }).sort({
            createTime: -1
        })
        commRes = commRes.map((item) => {
            item.ct = tools.formatDate(item.createTime, format = "YY-MM-DD hh:mm:ss")
            return item
        })
        ctx.render("page", {
            islogin,
            setInfo,
            userData,
            artRes,
            commRes,
            iscollection: iscollection ? 'cur' : ''
        })
    }
})

// 封面图上传
router.post('/upload', async (ctx, next) => {
    const data = await ctx.req.pipe(rp.post(`${baseUrl}/upload`, {
        json: true
    }))
    ctx.body = {
        data
    }
})

// 收藏文章
router.post("/collection", async (ctx, next) => {
    const {
        uid,
        islogin
    } = ctx.session.userInfo
    const {
        aid
    } = ctx.request.body
    const iscollection = await collectionModel.findOne({
        uid,
        aid
    })

    if (islogin != "success") {
        ctx.body = JSON.stringify({
            // 返回1表示未登陆
            stu: 1,
            msg: "未登录,前先登录进行收藏操作"
        })
    } else {
        if (!iscollection) {
            let collectionEnity = new collectionModel({
                uid,
                aid,
                coll_time: new Date()
            })
            await collectionEnity.save((err, data) => {
                if (err) return err
                console.log("收藏文章成功")
            })
            ctx.body = JSON.stringify({
                // 返回2表示之前没收藏过 此时进行收藏操作
                stu: 2,
                msg: "收藏成功"
            })
        } else {
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

// 搜索文章
router.get('/search', async (ctx, next) => {
    const {
        keyword,
        page
    } = ctx.request.query // 提取前端参数
    const pageSize = 3 //一页显示多少条数据
    const currentPage = page || 1 // 表示当前页
    let list = await articleModel.find({
        title: new RegExp(keyword)
    }, {}, {
        skip: (currentPage - 1) * pageSize,
        limit: pageSize
    }).sort({
        addTime: -1
    }).populate('uid') // 5条具体数据

    // 查询所有符合关键字的所有结果
    const totalRes = await articleModel.find({
        title: new RegExp(keyword)
    })

    // 总页数
    const pageSum = Math.ceil(totalRes.length / pageSize)

    // 分页数据
    let pnatorarr = []
    for (let i = 1; i <= pageSum; i++) {
        pnatorarr.push(i)
    }

    list = list.map((x) => {
        x.id = x._id.toString().slice(1, -1);
        x.at = tools.formatDate(x.addTime, format = "YY年MM月DD日");
        x.content = xss(x.content, {
            whiteList: [], // 白名单为空，表示过滤所有标签
            stripIgnoreTag: true, // 过滤所有非白名单标签的HTML
            stripIgnoreTagBody: ['script'] // script标签较特殊，需要过滤标签中间的内容
        }).slice(0, 100);
        return x;
    })

    const Paginator = {
        total: totalRes.length,
        currentPage,
        pageSize,
        pageSum,
        list,
        pnatorarr
    }

    const {
        uid,
        islogin
    } = ctx.session.userInfo
    const userData = await userModel.findById({
        _id: uid
    })
    const setInfo = await settingModel.find({})
    const focus = await focusModel.find({
        status: 1
    })
    const links = await linkModel.find({
        status: 1
    })

    ctx.render("searchresult", {
        islogin,
        focus,
        links,
        userData,
        setInfo,
        Paginator,
        keyword
    })
})

// 添加文章评论
router.post('/addcomment', async (ctx, next) => {
    const data = ctx.request.body
    const commentEntity = new commentModel({
        ...data
    })
    const result = await commentEntity.save()

    ctx.body = {
        result
    }
})

module.exports = router