const Router = require('koa-router')
const router = new Router({prefix: '/admin'})
const { login, info, findAll, findById, remove, edit, add, changepwd } = require('../controller/admin')

router.post('/login', login)
router.get("/info", info)
router.post("/changepwd", changepwd)
router.get('/findAll',findAll)
router.get('/findById/:id', findById)
router.post('/edit', edit)
router.post('/remove', remove)
router.post('/add', add)

module.exports = router