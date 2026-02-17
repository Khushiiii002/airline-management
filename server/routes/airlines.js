import express from 'express'
import * as controller from '../controllers/airlineController.js'

const router = express.Router()

router.get('/', controller.getAll)
router.get('/:id', controller.getOne)
router.post('/', controller.create)
router.put('/:id', controller.update)
router.patch('/:id/toggle', controller.toggleActive)
router.delete('/:id', controller.remove)

export default router
