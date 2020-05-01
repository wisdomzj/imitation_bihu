const linkModel = require("../model/linkModel")

class Link{
    async findAll_Paging(ctx,next){
        const total = await linkModel.find({}).count()
        const { page, size } = ctx.request.query 
        const curpage = Number.parseInt(page) || 1
        const len = Number.parseInt(size) || 5
        const sum = Math.ceil(total / len)
        const list = await linkModel.find({}, {}, {
            skip: (curpage - 1) * len,
            limit: len
        }).sort({addTime: -1}) 
        
        ctx.body = {
            data:{
                result:{
                    total,
                    curpage,
                    len,
                    sum,
                    list
                },
                msg:'ok',
                err_code: 0
            }
        }
    }

    async findAll_notPaging(ctx,next){
        const list = await linkModel.find({}).sort({addTime: -1})
        ctx.body = {
            data: {
                result:{
                    list
                },
                msg:'ok',
                err_code: 0
            }
        }
    }

    async findById(ctx,next){
        const _id = ctx.request.query.id
        const result = await linkModel.findById({ _id })
        
        ctx.body = {
            data:{
                result,
                msg:'ok',
                err_code: 0
            }
        }
    }

    async edit(ctx,next){ 
        const { _id, review, linkurl, ...data } = ctx.request.body 
        const status = review === '审核' ? 1 : 0  
        const result = await linkModel.updateOne({ _id }, {...data, url:linkurl, status})
        
        ctx.body = {
            data:{
                result,
                msg:'ok',
                err_code: 0
            }
        }
    }

    async remove(ctx,next){
        const _id = ctx.request.query.id
        const result = await linkModel.remove({ _id })
        
        ctx.body = {
            data:{
                result,
                msg:'ok',
                err_code: 0
            }
        }
    }

    async add(ctx,next){
        const { review, linkurl, ...data } = ctx.request.body
        const status = review === '审核' ? 1 : 0  
        const linkEntity = new linkModel({ ...data, url:linkurl, status })
        const result = await linkEntity.save()
        
        ctx.body = {
            data:{
                result,
                msg:'ok',
                err_code: 0
            }
        }
    }
}

module.exports = new Link()