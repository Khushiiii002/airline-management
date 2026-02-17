import supabase from '../config/supabase.js'

export const getAll = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('flights')
            .select(`
        *,
        airlines(name, code),
        aircraft(model, registration),
        origin:origin_airport_id(name, code, city),
        destination:destination_airport_id(name, code, city)
      `)
            .order('departure_time', { ascending: true })

        if (error) throw error
        res.json(data)
    } catch (error) {
        next(error)
    }
}

export const search = async (req, res, next) => {
    try {
        const { origin, destination, date, seat_class } = req.query

        let query = supabase
            .from('flights')
            .select(`
        *,
        airlines(name, code, logo),
        aircraft(model, registration, total_seats, economy_seats, business_seats, first_class_seats),
        origin:origin_airport_id(name, code, city),
        destination:destination_airport_id(name, code, city)
      `)
            .in('status', ['scheduled', 'boarding']) // only upcoming flights

        if (origin) query = query.eq('origin_airport_id', origin)
        if (destination) query = query.eq('destination_airport_id', destination)

        if (date) {
            // Filter by date part of timestamp
            // PostgREST doesn't support easy casting in filters for dates directly in js client easily without rpc or raw filtering
            // But we can filter a range for that day.
            const start = new Date(date)
            start.setHours(0, 0, 0, 0)
            const end = new Date(date)
            end.setHours(23, 59, 59, 999)
            query = query.gte('departure_time', start.toISOString()).lte('departure_time', end.toISOString())
        }

        const { data: flights, error } = await query

        if (error) throw error

        // Determine seat availability for each flight
        // We need to count bookings for each flight to see if seats available
        // For a real app, we'd do this purely in SQL or a materialized view, but here:
        // Fetch booking counts for these flights.
        const flightIds = flights.map(f => f.id)
        if (flightIds.length > 0) {
            const { data: bookings, error: bookingError } = await supabase
                .from('bookings')
                .select('flight_id, seat_class')
                .in('flight_id', flightIds)
                .neq('status', 'cancelled')

            if (bookingError) throw bookingError

            // Map bookings to flights
            const bookingCounts = {} // { flightId: { economy: 0, business: 0, first_class: 0 } }
            bookings.forEach(b => {
                if (!bookingCounts[b.flight_id]) bookingCounts[b.flight_id] = { economy: 0, business: 0, first_class: 0 }
                bookingCounts[b.flight_id][b.seat_class] = (bookingCounts[b.flight_id][b.seat_class] || 0) + 1
            })

            // Attach availability to flight objects
            const results = flights.map(flight => {
                const counts = bookingCounts[flight.id] || { economy: 0, business: 0, first_class: 0 }
                const aircraft = flight.aircraft

                const available = {
                    economy: aircraft.economy_seats - counts.economy,
                    business: aircraft.business_seats - counts.business,
                    first_class: aircraft.first_class_seats - counts.first_class // first_class_seats vs first_class in booking enum
                }

                // Filter by requested seat_class if provided
                if (seat_class) {
                    if (available[seat_class] <= 0) return null
                }

                return {
                    ...flight,
                    available_seats: available
                }
            }).filter(f => f !== null)

            return res.json(results)
        }

        res.json(flights)
    } catch (error) {
        next(error)
    }
}

export const getOne = async (req, res, next) => {
    try {
        const { id } = req.params
        const { data: flight, error } = await supabase
            .from('flights')
            .select(`
        *,
        airlines(name, code, logo),
        aircraft(*),
        origin:origin_airport_id(name, code, city, timezone),
        destination:destination_airport_id(name, code, city, timezone),
        flight_crew(
            role_on_flight,
            crew(first_name, last_name, role, employee_id)
        )
      `)
            .eq('id', id)
            .single()

        if (error) throw error

        // Get booking stats
        const { data: bookingStats, error: statError } = await supabase
            .from('bookings')
            .select('seat_class, status')
            .eq('flight_id', id)
            .neq('status', 'cancelled')

        if (statError) throw statError

        const taken = { economy: 0, business: 0, first_class: 0 }
        bookingStats.forEach(b => {
            // bookings table has 'first_class', aircraft has 'first_class_seats'
            if (taken[b.seat_class] !== undefined) taken[b.seat_class]++
        })

        res.json({ ...flight, taken_seats: taken })
    } catch (error) {
        next(error)
    }
}

export const create = async (req, res, next) => {
    try {
        const {
            flight_number, airline_id, aircraft_id,
            origin_airport_id, destination_airport_id,
            departure_time, arrival_time,
            economy_price, business_price, first_class_price,
            gate, terminal, status
        } = req.body

        const dep = new Date(departure_time)
        const arr = new Date(arrival_time)
        const duration_minutes = Math.round((arr - dep) / 60000)

        if (duration_minutes <= 0) {
            return res.status(400).json({ error: 'Arrival must be after departure' })
        }

        const { data, error } = await supabase
            .from('flights')
            .insert([{
                flight_number, airline_id, aircraft_id,
                origin_airport_id, destination_airport_id,
                departure_time, arrival_time,
                duration_minutes,
                economy_price, business_price, first_class_price,
                gate, terminal, status: status || 'scheduled'
            }])
            .select()
            .single()

        if (error) throw error
        res.status(201).json(data)
    } catch (error) {
        next(error)
    }
}

export const update = async (req, res, next) => {
    try {
        const { id } = req.params
        // recalculate duration if times change
        let updates = { ...req.body }

        if (updates.departure_time && updates.arrival_time) {
            const dep = new Date(updates.departure_time)
            const arr = new Date(updates.arrival_time)
            updates.duration_minutes = Math.round((arr - dep) / 60000)
        }

        const { data, error } = await supabase
            .from('flights')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        res.json(data)
    } catch (error) {
        next(error)
    }
}

export const updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params
        const { status, delay_minutes } = req.body

        const { data, error } = await supabase
            .from('flights')
            .update({ status, delay_minutes: delay_minutes || 0 })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        res.json(data)
    } catch (error) {
        next(error)
    }
}

export const remove = async (req, res, next) => {
    try {
        const { id } = req.params
        const { error } = await supabase
            .from('flights')
            .delete()
            .eq('id', id)

        if (error) throw error
        res.json({ message: 'Flight deleted successfully' })
    } catch (error) {
        next(error)
    }
}

export const getStats = async (req, res, next) => {
    try {
        // Total flights
        const { count: total, error: e1 } = await supabase
            .from('flights')
            .select('*', { count: 'exact', head: true })
        if (e1) throw e1

        // Status breakup
        const { data: statusGroups, error: e2 } = await supabase
            .from('flights')
            .select('status')
        if (e2) throw e2
        const statusCounts = statusGroups.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1
            return acc
        }, {})

        // Flights today
        const today = new Date().toISOString().split('T')[0]
        const { count: todayCount, error: e3 } = await supabase
            .from('flights')
            .select('*', { count: 'exact', head: true })
            .gte('departure_time', `${today}T00:00:00`)
            .lte('departure_time', `${today}T23:59:59`)
        if (e3) throw e3

        res.json({
            total,
            statusCounts,
            todayCount
        })
    } catch (error) {
        next(error)
    }
}
