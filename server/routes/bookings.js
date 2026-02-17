import express from 'express'
import * as controller from '../controllers/bookingController.js'

const router = express.Router()

router.get('/stats', controller.getStats)
router.get('/flight/:id', controller.getOne) // Note: getOne by flight handled by query but here :id is generic. 
// Wait, the spec says getByFlight is GET /flight/:id. And getByPassenger is /passenger/:id
// My controller definitions: getByFlight, getByPassenger.
// Route should be:
router.get('/flight/:id', (req, res, next) => {
    // This looks like it matches /flight/:id. 
    // Wait, if I have /:id later, does /flight/:id conflict? No it's literal 'flight'.
    controller.getByFlight(req, res, next)
})
// Actually simply:
// router.get('/flight/:id', controller.getByFlight)

// But wait, in bookingController I used req.params.id for both.
// So:
router.get('/flight/:id', controller.getByFlight)
router.get('/passenger/:id', controller.getByPassenger)

router.get('/', controller.getAll)
router.get('/:id', controller.getOne)
router.post('/', controller.create)
router.patch('/:id/status', controller.updateStatus)

export default router
