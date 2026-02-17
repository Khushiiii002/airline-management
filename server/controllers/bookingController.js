import supabase from '../config/supabase.js'

export const getAll = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
        *,
        flights(
            flight_number, departure_time, arrival_time, status,
            airlines(name),
            origin:origin_airport_id(code, city),
            destination:destination_airport_id(code, city)
        ),
        passengers(first_name, last_name, email, phone)
      `)
            .order('booked_at', { ascending: false })

        if (error) throw error
        res.json(data)
    } catch (error) {
        next(error)
    }
}

export const getOne = async (req, res, next) => {
    try {
        const { id } = req.params
        const { data, error } = await supabase
            .from('bookings')
            .select(`
        *,
        flights(
            flight_number, departure_time, arrival_time, status,
            airlines(name, logo),
            origin:origin_airport_id(code, city, name),
            destination:destination_airport_id(code, city, name),
            gate, terminal
        ),
        passengers(*)
      `)
            .eq('id', id)
            .single()

        if (error) throw error
        res.json(data)
    } catch (error) {
        next(error)
    }
}

export const getByPassenger = async (req, res, next) => {
    try {
        const { id } = req.params
        const { data, error } = await supabase
            .from('bookings')
            .select(`
        *,
        flights(
            flight_number, departure_time, arrival_time, status,
            airlines(name, code),
            origin:origin_airport_id(code, city),
            destination:destination_airport_id(code, city)
        )
      `)
            .eq('passenger_id', id)
            .order('booked_at', { ascending: false })

        if (error) throw error
        res.json(data)
    } catch (error) {
        next(error)
    }
}

export const getByFlight = async (req, res, next) => {
    try {
        const { id } = req.params
        const { data, error } = await supabase
            .from('bookings')
            .select(`
        *,
        flights(
            flight_number, departure_time, arrival_time, status,
            airlines(name, code),
            origin:origin_airport_id(code, city),
            destination:destination_airport_id(code, city)
        ),
        passengers(first_name, last_name, email)
      `)
            .eq('flight_id', id)
            .order('booked_at', { ascending: false })

        if (error) throw error
        res.json(data)
    } catch (error) {
        next(error)
    }
}

export const create = async (req, res, next) => {
    try {
        const { flight_id, passenger_id, seat_class, special_requests } = req.body

        if (!flight_id || !passenger_id || !seat_class) {
            return res.status(400).json({ error: 'Flight, passenger and seat class required' })
        }

        // 1. Check flight exists and active
        const { data: flight, error: fError } = await supabase
            .from('flights')
            .select(`
            id, status, 
            economy_price, business_price, first_class_price,
            aircraft(total_seats, economy_seats, business_seats, first_class_seats)
        `)
            .eq('id', flight_id)
            .single()

        if (fError || !flight) return res.status(404).json({ error: 'Flight not found' })
        if (['cancelled', 'departed', 'arrived'].includes(flight.status)) {
            return res.status(400).json({ error: 'Flight is not available for booking' })
        }

        // 2. Check availability
        const { count, error: cError } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('flight_id', flight_id)
            .eq('seat_class', seat_class)
            .neq('status', 'cancelled')

        if (cError) throw cError

        const capacity = flight.aircraft[`${seat_class === 'first_class' ? 'first_class_seats' : seat_class + '_seats'}`]
        if (count >= capacity) {
            return res.status(400).json({ error: `No ${seat_class} seats available` })
        }

        // 3. Generate Booking Ref
        const booking_reference = Math.random().toString(36).substring(2, 8).toUpperCase()

        // 4. Get Price
        const price = flight[`${seat_class}_price`]

        // 5. Auto assign seat (Simplified logic: just random unused or next available)
        // For specific seat logic:
        // Economy: 10-40, Business: 5-9, First: 1-4
        // This requires checking ALL used seats.
        const { data: takenSeats, error: sError } = await supabase
            .from('bookings')
            .select('seat_number')
            .eq('flight_id', flight_id)
            .neq('status', 'cancelled')

        if (sError) throw sError
        const taken = new Set(takenSeats.map(b => b.seat_number))

        let rowsStart, rowsEnd, letters
        if (seat_class === 'first_class') { rowsStart = 1; rowsEnd = 4; letters = ['A', 'B', 'C', 'D']; }
        else if (seat_class === 'business') { rowsStart = 5; rowsEnd = 9; letters = ['A', 'B', 'C', 'D']; }
        else { rowsStart = 10; rowsEnd = 40; letters = ['A', 'B', 'C', 'D', 'E', 'F']; }

        let assignedSeat = null
        for (let r = rowsStart; r <= rowsEnd; r++) {
            for (let l of letters) {
                const seat = `${r}${l}`
                if (!taken.has(seat)) {
                    assignedSeat = seat
                    break
                }
            }
            if (assignedSeat) break
        }

        if (!assignedSeat) return res.status(400).json({ error: 'Could not assign seat automatically' })

        // 6. Insert
        const { data, error } = await supabase
            .from('bookings')
            .insert([{
                booking_reference,
                flight_id,
                passenger_id,
                seat_class,
                seat_number: assignedSeat,
                price,
                special_requests
            }])
            .select(`
        *,
        flights(
            flight_number, departure_time, arrival_time, status,
            airlines(name),
            origin:origin_airport_id(code, city),
            destination:destination_airport_id(code, city)
        ),
        passengers(first_name, last_name, email)
      `)
            .single()

        if (error) throw error
        res.status(201).json(data)
    } catch (error) {
        next(error)
    }
}

export const updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params
        const { status } = req.body

        // Logic for cancelling -> refund
        let updates = { status }

        if (status === 'cancelled') {
            updates.payment_status = 'refunded'
        }

        const { data, error } = await supabase
            .from('bookings')
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

export const getStats = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('status, seat_class, price, payment_status')

        if (error) throw error

        const stats = {
            total: data.length,
            status_counts: {},
            class_counts: { economy: 0, business: 0, first_class: 0 },
            revenue: 0,
            revenue_by_class: { economy: 0, business: 0, first_class: 0 }
        }

        data.forEach(b => {
            // Status
            stats.status_counts[b.status] = (stats.status_counts[b.status] || 0) + 1

            // Class
            if (stats.class_counts[b.seat_class] !== undefined) {
                stats.class_counts[b.seat_class]++
            }

            // Revenue
            if (b.payment_status === 'paid') {
                const amount = Number(b.price)
                stats.revenue += amount
                if (stats.revenue_by_class[b.seat_class] !== undefined) {
                    stats.revenue_by_class[b.seat_class] += amount
                }
            }
        })

        res.json(stats)
    } catch (error) {
        next(error)
    }
}
