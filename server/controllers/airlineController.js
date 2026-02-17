import supabase from '../config/supabase.js'

export const getAll = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('airlines')
            .select('*')
            .order('name')

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
            .from('airlines')
            .select('*')
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
        const { name, code, logo, country } = req.body
        if (!name || !code || !country) {
            return res.status(400).json({ error: 'Name, code, and country are required' })
        }
        if (code.length < 2 || code.length > 3) {
            return res.status(400).json({ error: 'Code must be 2-3 characters' })
        }

        const { data, error } = await supabase
            .from('airlines')
            .insert([{ name, code: code.toUpperCase(), logo, country }])
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
            .from('airlines')
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
            .from('airlines')
            .delete()
            .eq('id', id)

        if (error) throw error
        res.json({ message: 'Airline deleted successfully' })
    } catch (error) {
        next(error)
    }
}

export const toggleActive = async (req, res, next) => {
    try {
        const { id } = req.params
        // First get current status
        const { data: current, error: fetchError } = await supabase
            .from('airlines')
            .select('is_active')
            .eq('id', id)
            .single()

        if (fetchError) throw fetchError

        const { data, error } = await supabase
            .from('airlines')
            .update({ is_active: !current.is_active })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        res.json(data)
    } catch (error) {
        next(error)
    }
}
