import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import airlineRoutes from './routes/airlines.js'
import airportRoutes from './routes/airports.js'
import aircraftRoutes from './routes/aircraft.js'
import flightRoutes from './routes/flights.js'
import passengerRoutes from './routes/passengers.js'
import bookingRoutes from './routes/bookings.js'
import crewRoutes from './routes/crew.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

// Routes
app.use('/api/airlines', airlineRoutes)
app.use('/api/airports', airportRoutes)
app.use('/api/aircraft', aircraftRoutes)
app.use('/api/flights', flightRoutes)
app.use('/api/passengers', passengerRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/crew', crewRoutes)

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: err.message || 'Internal Server Error' })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
