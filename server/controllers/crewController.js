import supabase from '../config/supabase.js'

export const getAll = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('crew')
            .select('*, airlines(name, code)')
            .order('last_name')

        if (error) throw error
        res.json(data)
    } catch (error) {
        next(error)
    }
}

export const getAvailable = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('crew')
            .select('*')
            .eq('is_available', true)
            .order('last_name')

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
            .from('crew')
            .select(`
        *, 
        airlines(name),
        flight_crew(
            role_on_flight,
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

export const create = async (req, res, next) => {
    try {
        const { airline_id, first_name, last_name, role, employee_id, license_number, is_available } = req.body

        if (!first_name || !last_name || !role || !employee_id) {
            return res.status(400).json({ error: 'Required fields missing' })
        }

        const { data, error } = await supabase
            .from('crew')
            .insert([{
                airline_id, first_name, last_name, role, employee_id, license_number, is_available
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
            .from('crew')
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
        const { error } = await supabase
            .from('crew')
            .delete()
            .eq('id', id)

        if (error) throw error
        res.json({ message: 'Crew member deleted successfully' })
    } catch (error) {
        next(error)
    }
}

export const assignToFlight = async (req, res, next) => {
    try {
        const { flight_id, crew_id, role_on_flight } = req.body

        if (!flight_id || !crew_id || !role_on_flight) {
            return res.status(400).json({ error: 'All fields required' })
        }

        // Check availability
        const { data: crew, error: cError } = await supabase
            .from('crew')
            .select('is_available')
            .eq('id', crew_id)
            .single()

        if (cError) throw cError
        if (!crew.is_available) {
            return res.status(400).json({ error: 'Crew member is not available' })
        }

        // Check existing assignment
        const { data: existing, error: eError } = await supabase
            .from('flight_crew')
            .select('id')
            .eq('flight_id', flight_id)
            .eq('crew_id', crew_id)
            .maybeSingle() // use maybeSingle to avoid error if not found

        if (existing) {
            return res.status(400).json({ error: 'Already assigned to this flight' })
        }

        const { data, error } = await supabase
            .from('flight_crew')
            .insert([{ flight_id, crew_id, role_on_flight }])
            .select(`
        *,
        crew(first_name, last_name, role, employee_id)
      `)
            .single()

        if (error) throw error
        res.status(201).json(data)
    } catch (error) {
        next(error)
    }
}

export const removeFromFlight = async (req, res, next) => {
    try {
        const { id } = req.params
        const { error } = await supabase
            .from('flight_crew')
            .delete()
            .eq('id', id)

        if (error) throw error
        res.json({ message: 'Removed from flight' })
    } catch (error) {
        next(error)
    }
}

export const getFlightCrew = async (req, res, next) => {
    try {
        const { id } = req.params // flight id
        const { data, error } = await supabase
            .from('flight_crew')
            .select(`
                *,
                crew(*)
            `)
            .eq('flight_id', id)

        if (error) throw error
        res.json(data)
    } catch (error) {
        next(error)
    }
}
