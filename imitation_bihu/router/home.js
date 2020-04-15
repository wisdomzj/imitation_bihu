const Router = require('koa-router')
const router = new Router({
    prefix: '/home'
})
const articleModel = require("../model/articleModel")
const userModel = require("../model/userModel")
const focusModel = require("../model/focusModel")
const linkModel = require("../model/linkModel")
const settingModel = require("../model/settingModel")
const tools = require("../utils/tools")
const xss = require("xss")

//首页
router.get("/", async (ctx) => {
    if (!ctx.session.userInfo) {
        ctx.redirect('/login')
    } else {
        const {
            type
        } = ctx.request.query
        const pageSize = 5
        const currentPage = ctx.query.curpage || 1
        let list = await articleModel.find({}, {}, {
            skip: (currentPage - 1) * pageSize,
            limit: pageSize
        }).sort({
            addTime: -1
        }).populate('uid')
        switch (type) {
            case "news":
                list = await articleModel.find({
                    is_new: 1
                }, {}, {
                    skip: (currentPage - 1) * pageSize,
                    limit: pageSize
                }).sort({
                    add_time: -1
                }).populate('uid')
                break
            case "hots":
                list = await articleModel.find({
                    is_hot: 1
                }, {}, {
                    skip: (currentPage - 1) * pageSize,
                    limit: pageSize
                }).sort({
                    add_time: -1
                }).populate('uid')
                break
            case "bests":
                list = await articleModel.find({
                    is_best: 1
                }, {}, {
                    skip: (currentPage - 1) * pageSize,
                    limit: pageSize
                }).sort({
                    add_time: -1
                }).populate('uid')
                break
        }

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

        ctx.render("home", {
            islogin,
            focus,
            links,
            userData,
            setInfo,
            Paginator,
            type: !type ? 'news' : type
        })
    }
})


module.exports = router