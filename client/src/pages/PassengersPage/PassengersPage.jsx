import React, { useState, useEffect } from 'react'
import { Users, Search, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import Modal from '../../components/Modal'
import DataTable from '../../components/DataTable'
import SearchBar from '../../components/SearchBar'
import EmptyState from '../../components/EmptyState'
import { useToast } from '../../components/Toast'
import './PassengersPage.css'

export default function PassengersPage() {
    const [loading, setLoading] = useState(true)
    const [passengers, setPassengers] = useState([])
    const [filteredPassengers, setFilteredPassengers] = useState([])
    const [search, setSearch] = useState('')

    const [modalOpen, setModalOpen] = useState(false)
    const [editingPassenger, setEditingPassenger] = useState(null)

    const { success, error } = useToast()

    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        passport_number: '', nationality: '', date_of_birth: ''
    })

    useEffect(() => {
        fetchPassengers()
    }, [])

    const fetchPassengers = async () => {
        try {
            const res = await api.get('/passengers')
            setPassengers(res.data)
            setFilteredPassengers(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (search) {
            const q = search.toLowerCase()
            setFilteredPassengers(passengers.filter(p =>
                p.first_name.toLowerCase().includes(q) ||
                p.last_name.toLowerCase().includes(q) ||
                p.email.toLowerCase().includes(q) ||
                p.passport_number?.toLowerCase().includes(q)
            ))
        } else {
            setFilteredPassengers(passengers)
        }
    }, [search, passengers])

    const handleOpenModal = (p = null) => {
        if (p) {
            setEditingPassenger(p)
            setFormData({
                first_name: p.first_name, last_name: p.last_name,
                email: p.email, phone: p.phone,
                passport_number: p.passport_number || '',
                nationality: p.nationality || '',
                date_of_birth: p.date_of_birth ? p.date_of_birth.split('T')[0] : ''
            })
        } else {
            setEditingPassenger(null)
            setFormData({
                first_name: '', last_name: '', email: '', phone: '',
                passport_number: '', nationality: '', date_of_birth: ''
            })
        }
        setModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingPassenger) {
                const res = await api.put(`/passengers/${editingPassenger.id}`, formData)
                setPassengers(prev => prev.map(p => p.id === editingPassenger.id ? { ...res.data, bookings: p.bookings } : p))
                success('Passenger updated')
            } else {
                const res = await api.post('/passengers', formData)
                setPassengers(prev => [res.data, ...prev])
                success('Passenger registered')
            }
            setModalOpen(false)
        } catch (err) {
            error(err.response?.data?.error || 'Operation failed')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This will delete all booking history for this passenger!')) return
        try {
            await api.delete(`/passengers/${id}`)
            setPassengers(prev => prev.filter(p => p.id !== id))
            success('Passenger deleted')
        } catch (err) {
            error('Failed to delete passenger')
        }
    }

    const columns = [
        {
            label: 'Name', key: 'name', sortable: true, render: (r) => (
                <div className="flex items-center gap-3">
                    <div className="avatar-circle-sm">
                        {r.first_name[0]}{r.last_name[0]}
                    </div>
                    <div className="font-medium">{r.first_name} {r.last_name}</div>
                </div>
            )
        },
        {
            label: 'Contact', key: 'contact', render: (r) => (
                <div className="text-sm">
                    <div className="flex items-center gap-1 text-muted"><Mail size={12} /> {r.email}</div>
                    <div className="flex items-center gap-1 text-muted"><Phone size={12} /> {r.phone}</div>
                </div>
            )
        },
        {
            label: 'Passport / Nat.', key: 'passport', render: (r) => (
                <div className="text-sm">
                    <div className="font-mono">{r.passport_number || '-'}</div>
                    <div className="text-muted">{r.nationality}</div>
                </div>
            )
        },
        {
            label: 'Bookings', key: 'bookings', sortable: true, render: (r) => (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                    {r.bookings?.length || 0} trips
                </span>
            )
        },
        {
            label: 'Actions', key: 'actions', render: (row) => (
                <div className="flex gap-2">
                    <button className="icon-btn" onClick={() => handleOpenModal(row)}><Edit size={16} className="text-blue-600" /></button>
                    <button className="icon-btn" onClick={() => handleDelete(row.id)}><Trash2 size={16} className="text-red-500" /></button>
                </div>
            )
        }
    ]

    if (loading) return <Spinner fullPage />

    return (
        <div className="passengers-page animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="text-primary" /> Passengers
                </h1>
                {/* Generally passengers are added via booking, but admin might need to manual add */}
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <users size={18} /> + Add Passenger
                </button>
            </div>

            <div className="card mb-4 p-4 flex justify-between items-center">
                <div className="text-muted text-sm font-bold">Total: {passengers.length}</div>
                <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, passport..." />
            </div>

            <div className="card">
                {filteredPassengers.length === 0 ? (
                    <EmptyState icon={Users} title="No passengers found" message="Try searching for a different name." />
                ) : (
                    <DataTable
                        columns={columns}
                        data={filteredPassengers}
                    />
                )}
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingPassenger ? 'Edit Passenger' : 'Add Passenger'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="grid-2 mb-4">
                        <div className="form-group">
                            <label>First Name*</label>
                            <input className="input" required
                                value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name*</label>
                            <input className="input" required
                                value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid-2 mb-4">
                        <div className="form-group">
                            <label>Email*</label>
                            <input className="input" type="email" required
                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone*</label>
                            <input className="input" required
                                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid-2 mb-4">
                        <div className="form-group">
                            <label>Passport Number</label>
                            <input className="input"
                                value={formData.passport_number} onChange={e => setFormData({ ...formData, passport_number: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Nationality</label>
                            <input className="input"
                                value={formData.nationality} onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group mb-6">
                        <label>Date of Birth</label>
                        <input className="input" type="date"
                            value={formData.date_of_birth} onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Passenger</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
