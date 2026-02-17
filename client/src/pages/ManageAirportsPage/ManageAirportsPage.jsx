import React, { useState, useEffect } from 'react'
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import Modal from '../../components/Modal'
import EmptyState from '../../components/EmptyState'
import DataTable from '../../components/DataTable'
import { useToast } from '../../components/Toast'
import './ManageAirportsPage.css'

export default function ManageAirportsPage() {
    const [loading, setLoading] = useState(true)
    const [airports, setAirports] = useState([])
    const [modalOpen, setModalOpen] = useState(false)
    const [editingAirport, setEditingAirport] = useState(null)

    const { success, error } = useToast()

    const [formData, setFormData] = useState({
        name: '', code: '', city: '', country: '', timezone: ''
    })

    // Common timezones
    const timezones = [
        'America/New_York', 'America/Chicago', 'America/Los_Angeles',
        'Europe/London', 'Europe/Paris', 'Europe/Amsterdam',
        'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney'
    ]

    useEffect(() => {
        fetchAirports()
    }, [])

    const fetchAirports = async () => {
        try {
            const res = await api.get('/airports')
            setAirports(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (airport = null) => {
        if (airport) {
            setEditingAirport(airport)
            setFormData({
                name: airport.name, code: airport.code,
                city: airport.city, country: airport.country,
                timezone: airport.timezone
            })
        } else {
            setEditingAirport(null)
            setFormData({ name: '', code: '', city: '', country: '', timezone: timezones[0] })
        }
        setModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingAirport) {
                const res = await api.put(`/airports/${editingAirport.id}`, formData)
                setAirports(prev => prev.map(a => a.id === editingAirport.id ? res.data : a))
                success('Airport updated')
            } else {
                const res = await api.post('/airports', formData)
                setAirports(prev => [...prev, res.data])
                success('Airport created')
            }
            setModalOpen(false)
        } catch (err) {
            error(err.response?.data?.error || 'Operation failed')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This will delete related flights!')) return
        try {
            await api.delete(`/airports/${id}`)
            setAirports(prev => prev.filter(a => a.id !== id))
            success('Airport deleted')
        } catch (err) {
            error('Failed to delete airport')
        }
    }

    const columns = [
        { label: 'Sort', key: 'sort', width: '50px', render: () => '📍' }, // Just an icon
        { label: 'Code', key: 'code', sortable: true, render: (row) => <span className="font-mono font-bold text-primary text-lg">{row.code}</span> },
        { label: 'Name', key: 'name', sortable: true },
        { label: 'City', key: 'city', sortable: true, render: (row) => <span>{row.city}, {row.country}</span> },
        { label: 'Timezone', key: 'timezone' },
        {
            label: 'Actions', key: 'actions', width: '100px', render: (row) => (
                <div className="flex gap-2">
                    <button className="icon-btn" onClick={() => handleOpenModal(row)}><Edit size={16} className="text-blue-600" /></button>
                    <button className="icon-btn" onClick={() => handleDelete(row.id)}><Trash2 size={16} className="text-red-500" /></button>
                </div>
            )
        }
    ]

    if (loading) return <Spinner fullPage />

    return (
        <div className="manage-airports-page animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <MapPin className="text-primary" /> Airports
                </h1>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Add Airport
                </button>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={airports}
                    emptyMessage="No airports found."
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingAirport ? 'Edit Airport' : 'Add Airport'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="grid-2 mb-4">
                        <div className="form-group">
                            <label>IATA Code (3 chars)*</label>
                            <input className="input uppercase" required maxLength="3" minLength="3"
                                value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Timezone*</label>
                            <select className="select" required
                                value={formData.timezone} onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                            >
                                {timezones.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group mb-4">
                        <label>Airport Name*</label>
                        <input className="input" required
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid-2 mb-6">
                        <div className="form-group">
                            <label>City*</label>
                            <input className="input" required
                                value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Country*</label>
                            <input className="input" required
                                value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Airport</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
