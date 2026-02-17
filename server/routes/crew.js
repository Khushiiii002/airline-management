import express from 'express'
import * as controller from '../controllers/crewController.js'

const router = express.Router()

router.get('/available', controller.getAvailable) // Wait, I didn't impl getAvailable in controller explicitly?
// checking crewController.js... 
// Ah, I missed 'getAvailable' in crewController! The user spec said "getAvailable: select * from crew where is_available = true".
// I must implement it. I'll add it to the crewController logic in a fix or I can inline it if I can't edit now?
// I can make a multi_replace or just re-write the file. Re-writing is safer since I just wrote it.
// I will rewrite crewController.js later or now?
// I'll finish routes first, then fix crewController.

router.get('/flight/:id', controller.getFlightCrew)
router.get('/', controller.getAll)
router.get('/:id', controller.getOne)
router.post('/', controller.create)
router.put('/:id', controller.update)
router.post('/assign', controller.assignToFlight)
router.delete('/assign/:id', controller.removeFromFlight)
router.delete('/:id', controller.remove)

export default router
