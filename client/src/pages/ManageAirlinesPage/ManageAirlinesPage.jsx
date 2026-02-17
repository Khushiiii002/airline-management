import React, { useState, useEffect } from 'react'
import { Briefcase, Plus, Edit, Trash2, Power, Plane } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import Modal from '../../components/Modal'
import EmptyState from '../../components/EmptyState'
import { useToast } from '../../components/Toast'
import './ManageAirlinesPage.css'

export default function ManageAirlinesPage() {
    const [loading, setLoading] = useState(true)
    const [airlines, setAirlines] = useState([])
    const [modalOpen, setModalOpen] = useState(false)
    const [editingAirline, setEditingAirline] = useState(null)

    const { success, error } = useToast()

    const [formData, setFormData] = useState({
        name: '', code: '', country: '', logo: '', is_active: true
    })

    useEffect(() => {
        fetchAirlines()
    }, [])

    const fetchAirlines = async () => {
        try {
            const res = await api.get('/airlines')
            setAirlines(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (airline = null) => {
        if (airline) {
            setEditingAirline(airline)
            setFormData({
                name: airline.name, code: airline.code,
                country: airline.country, logo: airline.logo || '',
                is_active: airline.is_active
            })
        } else {
            setEditingAirline(null)
            setFormData({ name: '', code: '', country: '', logo: '', is_active: true })
        }
        setModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingAirline) {
                const res = await api.put(`/airlines/${editingAirline.id}`, formData)
                setAirlines(prev => prev.map(a => a.id === editingAirline.id ? res.data : a))
                success('Airline updated')
            } else {
                const res = await api.post('/airlines', formData)
                setAirlines(prev => [...prev, res.data])
                success('Airline created')
            }
            setModalOpen(false)
        } catch (err) {
            error(err.response?.data?.error || 'Operation failed')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This will delete all related aircraft and flights!')) return
        try {
            await api.delete(`/airlines/${id}`)
            setAirlines(prev => prev.filter(a => a.id !== id))
            success('Airline deleted')
        } catch (err) {
            error('Failed to delete airline')
        }
    }

    const toggleActive = async (id) => {
        try {
            const res = await api.patch(`/airlines/${id}/toggle`)
            setAirlines(prev => prev.map(a => a.id === id ? res.data : a))
        } catch (err) {
            error('Failed to toggle status')
        }
    }

    if (loading) return <Spinner fullPage />

    return (
        <div className="manage-airlines-page animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Briefcase className="text-primary" /> Airlines
                </h1>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Add Airline
                </button>
            </div>

            {airlines.length === 0 ? (
                <EmptyState icon={Briefcase} title="No airlines found" message="Add your first airline to get started." />
            ) : (
                <div className="airlines-grid">
                    {airlines.map(airline => (
                        <div key={airline.id} className={`airline-card card ${!airline.is_active ? 'opacity-75' : ''}`}>
                            <div className="card-header">
                                <div className="logo-box">
                                    {airline.logo ? (
                                        <img src={airline.logo} alt={airline.name} />
                                    ) : (
                                        <span>{airline.code}</span>
                                    )}
                                </div>
                                <button
                                    className={`toggle-btn ${airline.is_active ? 'active' : ''}`}
                                    onClick={() => toggleActive(airline.id)}
                                    title="Toggle Active Status"
                                >
                                    <Power size={16} />
                                </button>
                            </div>

                            <div className="card-body mt-4">
                                <div className="text-xs font-bold text-muted mb-1">{airline.country}</div>
                                <h3 className="text-lg font-bold">{airline.name}</h3>
                                <div className="font-mono text-sm bg-slate-100 inline-block px-2 py-1 rounded mt-2">{airline.code}</div>
                            </div>

                            <div className="card-footer mt-6 flex justify-between items-center">
                                <Link to={`/manage/aircraft?airline=${airline.id}`} className="text-sm text-primary flex items-center gap-1 hover:underline">
                                    <Plane size={14} /> View Fleet
                                </Link>
                                <div className="flex gap-2">
                                    <button className="icon-btn" onClick={() => handleOpenModal(airline)}>
                                        <Edit size={16} className="text-blue-600" />
                                    </button>
                                    <button className="icon-btn" onClick={() => handleDelete(airline.id)}>
                                        <Trash2 size={16} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingAirline ? 'Edit Airline' : 'Add Airline'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-4">
                        <label>Airline Name*</label>
                        <input className="input" required
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid-2 mb-4">
                        <div className="form-group">
                            <label>Unique Code (2-3 chars)*</label>
                            <input className="input uppercase" required maxLength="3"
                                value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Country*</label>
                            <input className="input" required
                                value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-group mb-6">
                        <label>Logo URL (Optional)</label>
                        <input className="input"
                            value={formData.logo} onChange={e => setFormData({ ...formData, logo: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Airline</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
