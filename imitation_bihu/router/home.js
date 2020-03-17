const Router = require('koa-router')
const router = new Router({ prefix: '/home' })
const articleModel = require("../model/articleModel")
const userModel = require("../model/userModel")
const tools = require("../utils/tools")
const xss = require("xss")

//首页
router.get("/", async (ctx) => {
    const pageSize = 5
    const currentPage = ctx.query.curpage || 1
    let list = await articleModel.find({}, {}, {
        skip: (currentPage - 1) * pageSize,
        limit: pageSize
    }).sort({
        add_time: -1
    }).populate('uid')

    const total = await articleModel.count()
    const pageSum = Math.ceil(total / pageSize)
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
        total,
        currentPage,
        pageSize,
        pageSum,
        list,
        pnatorarr
    }
    const { uid, islogin } = ctx.session.userInfo
    const userData = await userModel.findById({ _id:uid })

    ctx.render("home", {
        islogin,
        userData,
        Paginator
    })
})

// 搜索页
router.get("/search", async (ctx) => {
    ctx.body = "搜索功能开发中..."
})


module.exports = router