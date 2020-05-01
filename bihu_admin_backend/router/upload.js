const Router = require('koa-router')
const router = new Router({prefix: '/upload'})
const { upload } = require('../controller/upload')

router.post('/', upload)

module.exports = router