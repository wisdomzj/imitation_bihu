const path = require('path')

class Upload{
    async upload(ctx,next){ 
        const file = ctx.request.files.file
        const basename = path.basename(file.path)
        const imgUrl =  `${ctx.origin}/upload/${basename}`
        const filename = file.name
        
        ctx.body = {
            data:{
                result:{
                    imgUrl,
                    filename
                },
                msg:'ok',
                err_code: 0    
            }
        }
    }
}

module.exports = new Upload()