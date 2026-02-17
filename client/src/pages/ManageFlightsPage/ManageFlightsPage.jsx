import React, { useState, useEffect } from 'react'
import { ClipboardList, Plus, Edit, Trash2, Filter } from 'lucide-react'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import Modal from '../../components/Modal'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import SearchBar from '../../components/SearchBar'
import { useToast } from '../../components/Toast'
import './ManageFlightsPage.css'

export default function ManageFlightsPage() {
    const [loading, setLoading] = useState(true)
    const [flights, setFlights] = useState([])
    const [airlines, setAirlines] = useState([])
    const [airports, setAirports] = useState([])
    const [aircraft, setAircraft] = useState([])

    // Filter/Search
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('All')

    const [modalOpen, setModalOpen] = useState(false)
    const [editingFlight, setEditingFlight] = useState(null)

    const { success, error } = useToast()

    const initialForm = {
        airline_id: '', flight_number: '',
        origin_id: '', destination_id: '',
        departure_time: '', arrival_time: '',
        aircraft_id: '', status: 'scheduled',
        economy_price: 100, business_price: 250, first_class_price: 500, gate: '', terminal: ''
    }

    const [formData, setFormData] = useState(initialForm)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [flRes, alRes, apRes, acRes] = await Promise.all([
                api.get('/flights'),
                api.get('/airlines'),
                api.get('/airports'),
                api.get('/aircraft')
            ])
            setFlights(flRes.data)
            setAirlines(alRes.data)
            setAirports(apRes.data)
            setAircraft(acRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (flight = null) => {
        if (flight) {
            setEditingFlight(flight)
            setFormData({
                airline_id: flight.airline_id,
                flight_number: flight.flight_number,
                origin_id: flight.origin_id,
                destination_id: flight.destination_id,
                departure_time: flight.departure_time.slice(0, 16), // fit datetime-local input
                arrival_time: flight.arrival_time.slice(0, 16),
                aircraft_id: flight.aircraft_id,
                status: flight.status,
                economy_price: flight.economy_price,
                business_price: flight.business_price,
                first_class_price: flight.first_class_price,
                gate: flight.gate || '',
                terminal: flight.terminal || ''
            })
        } else {
            setEditingFlight(null)
            setFormData(initialForm)
        }
        setModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            // Calculate duration simply for backend or let backend handle it? 
            // Backend expects us to send duration? Actually backend migration says duration_minutes is stored.
            // It's better to calculate it here or let backend do it. We can calculate simple diff.
            const start = new Date(formData.departure_time)
            const end = new Date(formData.arrival_time)
            const duration = Math.round((end - start) / 60000)

            const payload = { ...formData, duration_minutes: duration }

            if (editingFlight) {
                const res = await api.put(`/flights/${editingFlight.id}`, payload)
                setFlights(prev => prev.map(f => f.id === editingFlight.id ? res.data : f))
                success('Flight updated')
            } else {
                const res = await api.post('/flights', payload)
                setFlights(prev => [res.data, ...prev])
                success('Flight scheduled')
            }
            setModalOpen(false)
        } catch (err) {
            error(err.response?.data?.error || 'Operation failed')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This will delete all booking links!')) return
        try {
            await api.delete(`/flights/${id}`)
            setFlights(prev => prev.filter(f => f.id !== id))
            success('Flight deleted')
        } catch (err) {
            error('Failed to delete flight')
        }
    }

    // Filter logic
    let filteredFlights = flights
    if (filterStatus !== 'All') filteredFlights = filteredFlights.filter(f => f.status === filterStatus.toLowerCase())
    if (search) filteredFlights = filteredFlights.filter(f => f.flight_number.toLowerCase().includes(search.toLowerCase()))

    const columns = [
        { label: '#', key: 'flight_number', sortable: true, render: (r) => <span className="font-mono font-bold">{r.flight_number}</span> },
        { label: 'Route', key: 'route', render: (r) => <span>{r.origin.code} ➝ {r.destination.code}</span> },
        { label: 'Departure', key: 'departure_time', sortable: true, render: (r) => new Date(r.departure_time).toLocaleString() },
        { label: 'Status', key: 'status', render: (r) => <StatusBadge status={r.status} /> },
        { label: 'Gate', key: 'gate' },
        {
            label: 'Actions', key: 'actions', render: (row) => (
                <div className="flex gap-2">
                    <button className="icon-btn" onClick={() => handleOpenModal(row)}><Edit size={16} className="text-blue-600" /></button>
                    <button className="icon-btn" onClick={() => handleDelete(row.id)}><Trash2 size={16} className="text-red-500" /></button>
                </div>
            )
        }
    ]

    // Helper to filter aircraft by selected airline
    const availableAircraft = formData.airline_id
        ? aircraft.filter(a => a.airline_id === formData.airline_id)
        : []

    if (loading) return <Spinner fullPage />

    return (
        <div className="manage-flights-page animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ClipboardList className="text-primary" /> Flight Operations
                </h1>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Schedule Flight
                </button>
            </div>

            <div className="card mb-4 p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Filter size={18} className="text-muted" />
                    <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        {['All', 'Scheduled', 'Boarding', 'Departed', 'Arrived', 'Delayed', 'Cancelled'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <SearchBar value={search} onChange={setSearch} placeholder="Search Flight No..." />
            </div>

            <div className="card">
                <DataTable columns={columns} data={filteredFlights} emptyMessage="No flights found." />
            </div>

            {/* MODAL IS QUITE LARGE FOR FLIGHTS */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingFlight ? 'Edit Flight' : 'Schedule New Flight'}
                size="lg"
            >
                <form onSubmit={handleSubmit}>
                    <div className="grid-2 mb-4">
                        <div className="form-group">
                            <label>Airline*</label>
                            <select className="select" required
                                value={formData.airline_id} onChange={e => setFormData(prev => ({ ...prev, airline_id: e.target.value, aircraft_id: '' }))}
                            >
                                <option value="" disabled>Select Airline</option>
                                {airlines.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Flight Number*</label>
                            <input className="input" required placeholder="e.g. AA123"
                                value={formData.flight_number} onChange={e => setFormData({ ...formData, flight_number: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid-2 mb-4">
                        <div className="form-group">
                            <label>Origin*</label>
                            <select className="select" required
                                value={formData.origin_id} onChange={e => setFormData({ ...formData, origin_id: e.target.value })}
                            >
                                <option value="" disabled>Select Origin</option>
                                {airports.map(a => <option key={a.id} value={a.id}>{a.city} ({a.code})</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Destination*</label>
                            <select className="select" required
                                value={formData.destination_id} onChange={e => setFormData({ ...formData, destination_id: e.target.value })}
                            >
                                <option value="" disabled>Select Destination</option>
                                {airports.map(a => <option key={a.id} value={a.id}>{a.city} ({a.code})</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid-2 mb-4">
                        <div className="form-group">
                            <label>Departure Time*</label>
                            <input className="input" type="datetime-local" required
                                value={formData.departure_time} onChange={e => setFormData({ ...formData, departure_time: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Arrival Time*</label>
                            <input className="input" type="datetime-local" required
                                min={formData.departure_time}
                                value={formData.arrival_time} onChange={e => setFormData({ ...formData, arrival_time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid-2 mb-4">
                        <div className="form-group">
                            <label>Aircraft* {(!formData.airline_id) && <span className="text-xs text-danger">(Select Airline First)</span>}</label>
                            <select className="select" required disabled={!formData.airline_id}
                                value={formData.aircraft_id} onChange={e => setFormData({ ...formData, aircraft_id: e.target.value })}
                            >
                                <option value="" disabled>Select Aircraft</option>
                                {availableAircraft.map(a => <option key={a.id} value={a.id}>{a.model}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select className="select" required
                                value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                {['scheduled', 'active', 'delayed', 'cancelled', 'landed'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid-3 mb-6">
                        <div className="form-group">
                            <label>Economy Price*</label>
                            <input type="number" className="input" min="0" required
                                value={formData.economy_price} onChange={e => setFormData({ ...formData, economy_price: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Business Price*</label>
                            <input type="number" className="input" min="0" required
                                value={formData.business_price} onChange={e => setFormData({ ...formData, business_price: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>First Class Price*</label>
                            <input type="number" className="input" min="0" required
                                value={formData.first_class_price} onChange={e => setFormData({ ...formData, first_class_price: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid-2 mb-6">
                        <div className="form-group">
                            <label>Gate</label>
                            <input className="input"
                                value={formData.gate} onChange={e => setFormData({ ...formData, gate: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Terminal</label>
                            <input className="input"
                                value={formData.terminal} onChange={e => setFormData({ ...formData, terminal: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Flight</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
