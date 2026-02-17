import supabase from '../config/supabase.js'

export const getAll = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('airports')
            .select('*')
            .order('city')

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
            .from('airports')
            .select('*')
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
            .from('airports')
            .select('*')
            .or(`city.ilike.%${q}%,code.ilike.%${q}%,name.ilike.%${q}%`)
            .limit(10)

        if (error) throw error
        res.json(data)
    } catch (error) {
        next(error)
    }
}

export const create = async (req, res, next) => {
    try {
        const { name, code, city, country, timezone } = req.body
        if (!name || !code || !city || !country || !timezone) {
            return res.status(400).json({ error: 'All fields are required' })
        }
        if (code.length !== 3) {
            return res.status(400).json({ error: 'Code must be exactly 3 characters' })
        }

        const { data, error } = await supabase
            .from('airports')
            .insert([{
                name,
                code: code.toUpperCase(),
                city,
                country,
                timezone
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
            .from('airports')
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
            .from('airports')
            .delete()
            .eq('id', id)

        if (error) throw error
        res.json({ message: 'Airport deleted successfully' })
    } catch (error) {
        next(error)
    }
}
