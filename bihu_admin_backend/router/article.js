const Router = require('koa-router')
const router = new Router({prefix: '/article'})
const { findAll, findById, remove, edit, add, findallArtcomm, removComment, searchArticle} = require('../controller/article')

router.get('/findAll', findAll)
router.get('/findById', findById)
router.get('/findallArtcomm', findallArtcomm)
router.get('/searchArticle',searchArticle)
router.get('/removComment',removComment)
router.post('/remove', remove)
router.post('/edit', edit)
router.post('/add', add)

module.exports = router