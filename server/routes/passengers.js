import express from 'express'
import * as controller from '../controllers/passengerController.js'

const router = express.Router()

router.get('/search', controller.search)
router.get('/', controller.getAll)
router.get('/:id', controller.getOne)
router.post('/', controller.create)
router.put('/:id', controller.update)
router.delete('/:id', controller.remove)

export default router
