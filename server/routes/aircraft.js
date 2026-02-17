import express from 'express'
import * as controller from '../controllers/aircraftController.js'

const router = express.Router()

router.get('/', controller.getAll)
router.get('/airline/:id', controller.getByAirline)
router.get('/:id', controller.getOne)
router.post('/', controller.create)
router.put('/:id', controller.update)
router.patch('/:id/status', controller.updateStatus)
router.delete('/:id', controller.remove)

export default router
