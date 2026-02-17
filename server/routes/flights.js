import express from 'express'
import * as controller from '../controllers/flightController.js'

const router = express.Router()

router.get('/search', controller.search)
router.get('/stats', controller.getStats)
router.get('/', controller.getAll)
router.get('/:id', controller.getOne)
router.post('/', controller.create)
router.put('/:id', controller.update)
router.patch('/:id/status', controller.updateStatus)
router.delete('/:id', controller.remove)

export default router
