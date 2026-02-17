import supabase from '../config/supabase.js'

export const getAll = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('passengers')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        // Get booking counts for each passenger (manual simplification since no join aggregation in simple standard postgrest)
        // Actually we can do .select('*, bookings(count)') but supabase JS wrapper sometime tricky with exact count syntax on relation
        // Let's do it simply:
        const { data: bookingData, error: bError } = await supabase
            .from('bookings')
            .select('passenger_id')

        if (bError) throw bError

        const counts = {}
        bookingData.forEach(b => {
            counts[b.passenger_id] = (counts[b.passenger_id] || 0) + 1
        })

        const result = data.map(p => ({
            ...p,
            booking_count: counts[p.id] || 0
        }))

        res.json(result)
    } catch (error) {
        next(error)
    }
}

export const getOne = async (req, res, next) => {
    try {
        const { id } = req.params
        const { data, error } = await supabase
            .from('passengers')
            .select(`
        *,
        bookings(
            *,
            flights(flight_number, departure_time, origin:origin_airport_id(code), destination:destination_airport_id(code))
        )
      `)
            .eq('id', id)
            .single()

        if (error) throw error
        res.json(data)
    } catch (error) {
        next(error)
    }
}

export const search = async (req, res, next) => {
    try {
        const { q } = req.query
        if (!q) return res.json([])

        const { data, error } = await supabase
            .from('passengers')
            .select('*')
            .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,passport_number.ilike.%${q}%`)
            .limit(10)

        if (error) throw error
        res.json(data)
    } catch (error) {
        next(error)
    }
}

export const create = async (req, res, next) => {
    try {
        const { first_name, last_name, email, phone, passport_number, nationality, date_of_birth } = req.body

        if (!first_name || !last_name || !email || !phone) {
            return res.status(400).json({ error: 'Name, email and phone are required' })
        }

        const { data, error } = await supabase
            .from('passengers')
            .insert([{
                first_name, last_name, email, phone, passport_number, nationality, date_of_birth
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
        const { data, error } = await supabase
            .from('passengers')
            .update(req.body)
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
        // check for active bookings
        const { data: bookings, error: bError } = await supabase
            .from('bookings')
            .select('id')
            .eq('passenger_id', id)
            .in('status', ['confirmed', 'checked_in', 'boarded'])

        if (bError) throw bError
        if (bookings.length > 0) {
            return res.status(400).json({ error: 'Cannot delete passenger with active bookings' })
        }

        const { error } = await supabase
            .from('passengers')
            .delete()
            .eq('id', id)

        if (error) throw error
        res.json({ message: 'Passenger deleted successfully' })
    } catch (error) {
        next(error)
    }
}
