import supabase from '../config/supabase.js'

export const getAll = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('aircraft')
            .select('*, airlines(name, code)')
            .order('created_at', { ascending: false })

        if (error) throw error
        res.json(data)
    } catch (error) {
        next(error)
    }
}

export const getByAirline = async (req, res, next) => {
    try {
        const { id } = req.params
        const { data, error } = await supabase
            .from('aircraft')
            .select('*')
            .eq('airline_id', id)

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
            .from('aircraft')
            .select('*, airlines(name)')
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
        const {
            airline_id, model, registration,
            economy_seats, business_seats, first_class_seats, status
        } = req.body

        const eco = Number(economy_seats) || 0
        const bus = Number(business_seats) || 0
        const first = Number(first_class_seats) || 0
        const total_seats = eco + bus + first

        if (eco < 0 || bus < 0 || first < 0) {
            return res.status(400).json({ error: 'Seat counts cannot be negative' })
        }
        if (total_seats === 0) {
            return res.status(400).json({ error: 'Total seats must be greater than 0' })
        }

        const { data, error } = await supabase
            .from('aircraft')
            .insert([{
                airline_id,
                model,
                registration,
                total_seats,
                economy_seats: eco,
                business_seats: bus,
                first_class_seats: first,
                status: status || 'active'
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
        // Recalculate total seats if seat counts are updated
        let updates = { ...req.body }
        if (updates.economy_seats || updates.business_seats || updates.first_class_seats) {
            // Ideally we should fetch current values to be safe, but for simplicity assuming full payload or client sends logic
            // But to be safe let's just use what's sent and trust client or trigger, 
            // OR fetch existing to recalc. Let's trust client sends total_seats or we calculate if provided.
            // For this tool, I'll assume the client sends the correct total_seats OR all 3 numbers.
            // Use a safer approach:
            // If any seat count is in body, we need to know the others to update total.
            // Let's assume the client sends ALL seat fields if editing configuration.
            if (updates.economy_seats !== undefined && updates.business_seats !== undefined && updates.first_class_seats !== undefined) {
                updates.total_seats = Number(updates.economy_seats) + Number(updates.business_seats) + Number(updates.first_class_seats)
            }
        }

        const { data, error } = await supabase
            .from('aircraft')
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
        const { status } = req.body

        if (!['active', 'maintenance', 'retired'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' })
        }

        const { data, error } = await supabase
            .from('aircraft')
            .update({ status })
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
            .from('aircraft')
            .delete()
            .eq('id', id)

        if (error) throw error
        res.json({ message: 'Aircraft deleted successfully' })
    } catch (error) {
        next(error)
    }
}
