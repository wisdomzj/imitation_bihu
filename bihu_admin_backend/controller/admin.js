const adminModel = require("../model/adminModel")
const jwt = require('jsonwebtoken')
const path = require('path')
const tools = require('../utils/Tools')

class Admin{
    async login(ctx,next){
        const admin = await adminModel.findOne(ctx.request.body)
        if(!admin) { 
            ctx.throw(401,'用户密码不正确')
        }
        const { _id, name } = admin
        const token = jwt.sign({ _id, name }, 'my_token')
        
        ctx.body = {
            data:{
                result:{
                    token
                },
                msg:'ok',
                err_code: 0
            }
        }
    }

    async info(ctx,next){
        if(!ctx.state.user) { 
            ctx.throw(403,'用户被列入黑名单')
        }
        const { _id } = ctx.state.user
        const info = await adminModel.findById({ _id })
        const { name, role, avatar } = info
        
        ctx.body = {
            data:{
                result: {
                    name, 
                    role, 
                    avatar
                },
                msg:'ok',
                err_code: 0
            }
        }
    }

    async changepwd(ctx,next){
        const { _id } = ctx.state.user
        const { password } = ctx.request.body
        const result = await adminModel.updateOne({ _id },{$set:{ password }})
        
        ctx.body = {
            data:{
                result,
                msg:'ok',
                err_code: 0
            }
        }
    }

    async findAll(ctx,next){
        const list = await adminModel.find({}) 
        ctx.body = {
            data:{
                result:{
                    list
                },
                msg: "ok",
                err_code: 0
            }
        } 
    }

    async findById(ctx,next){
        const _id = ctx.params.id
        const adminRes = await adminModel.findById({ _id }) 
        
        ctx.body = {
            data:{
                result: {
                    ...adminRes
                },
                msg: 'ok',
                err_code: 0
            }
        }
    }

    async remove(ctx,next){ 
        const { _id, avatar } = ctx.request.body
        const avaUrl = avatar.substr(ctx.origin.length,avatar.length)
        const oripath = path.join(__dirname,'../')
        const filepath = `${oripath}public${avaUrl}`
        const delRes = await adminModel.remove({ _id }) 
        
        if(!filepath.includes('default')){
            await tools.removeFile(filepath)
        }

        ctx.body = {
            data: {
                result:{
                    ...delRes
                },
                msg:'ok',
                err_code: 0
            }
        }
    }

    async edit(ctx,next){
        const { _id, oldavatar, oldpassword , ...data } = ctx.request.body 
        const password = !data.password ? oldpassword : data.password
        const avatar = !data.avatar ? oldavatar : data.avatar
        const info = {
            password,
            avatar,
            name: data.name,
            role: Number.parseInt(data.role)
        }

        const editRes = await userModel.updateOne({ _id }, { $set: { ...info }})
        
        if(data.avatar){
            const avaUrl = oldavatar.substr(ctx.origin.length,oldavatar.length)
            const oripath = path.join(__dirname,'../')
            const filepath = `${oripath}public${avaUrl}`
            if(!filepath.includes('default')){
                await tools.removeFile(filepath)
            }
        }
    
        ctx.body = {
            data: {
                result:{
                    ...editRes
                },
                msg:'ok',
                err_code: 0
            }
        }
    }

    async add(ctx,next){
        const data = ctx.request.body
        const file = ctx.request.files.avatar
        const basename = path.basename(file.path)
        const avatar =  `${ctx.origin}/upload/${basename}` 
        const adminEntity = new adminModel({...data, avatar})
        const addRes = await adminEntity.save()
        
        ctx.body = {
            data:{
                result: {
                    ...addRes
                },
                msg: 'ok',
                err_code: 0
            }
        }
    }
}

module.exports = new Admin()