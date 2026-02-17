import express from 'express'
import * as controller from '../controllers/airportController.js'

const router = express.Router()

router.get('/search', controller.search) // Search first to avoid conflict with :id
router.get('/', controller.getAll)
router.get('/:id', controller.getOne)
router.post('/', controller.create)
router.put('/:id', controller.update)
router.delete('/:id', controller.remove)

export default router
