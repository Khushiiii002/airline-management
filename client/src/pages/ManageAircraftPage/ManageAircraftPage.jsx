import React, { useState, useEffect } from 'react'
import { Plane, Plus, Edit, Trash2, Filter } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import Modal from '../../components/Modal'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { useToast } from '../../components/Toast'
import './ManageAircraftPage.css'

export default function ManageAircraftPage() {
    const [loading, setLoading] = useState(true)
    const [aircraft, setAircraft] = useState([])
    const [airlines, setAirlines] = useState([])
    const [modalOpen, setModalOpen] = useState(false)
    const [editingAircraft, setEditingAircraft] = useState(null)

    const [searchParams] = useSearchParams()
    const initialAirline = searchParams.get('airline')
    const [filterAirline, setFilterAirline] = useState(initialAirline || 'All')

    const { success, error } = useToast()

    const [formData, setFormData] = useState({
        airline_id: '', model: '', capacity: 150, manufacturing_year: new Date().getFullYear(), status: 'active'
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [acRes, alRes] = await Promise.all([
                    api.get('/aircraft'),
                    api.get('/airlines')
                ])
                setAircraft(acRes.data)
                setAirlines(alRes.data)
                if (initialAirline && !formData.airline_id) {
                    setFormData(prev => ({ ...prev, airline_id: initialAirline }))
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleOpenModal = (ac = null) => {
        if (ac) {
            setEditingAircraft(ac)
            setFormData({
                airline_id: ac.airline_id, model: ac.model,
                capacity: ac.capacity, manufacturing_year: ac.manufacturing_year,
                status: ac.status
            })
        } else {
            setEditingAircraft(null)
            setFormData({
                airline_id: filterAirline !== 'All' ? filterAirline : airlines[0]?.id || '',
                model: '', capacity: 150,
                manufacturing_year: new Date().getFullYear(),
                status: 'active'
            })
        }
        setModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingAircraft) {
                const res = await api.put(`/aircraft/${editingAircraft.id}`, formData)
                setAircraft(prev => prev.map(a => a.id === editingAircraft.id ? res.data : a))
                success('Aircraft updated')
            } else {
                const res = await api.post('/aircraft', formData)
                setAircraft(prev => [...prev, res.data])
                success('Aircraft created')
            }
            setModalOpen(false)
        } catch (err) {
            error(err.response?.data?.error || 'Operation failed')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This will delete related flights!')) return
        try {
            await api.delete(`/aircraft/${id}`)
            setAircraft(prev => prev.filter(a => a.id !== id))
            success('Aircraft deleted')
        } catch (err) {
            error('Failed to delete aircraft')
        }
    }

    const filteredAircraft = filterAirline === 'All'
        ? aircraft
        : aircraft.filter(a => a.airline_id === filterAirline)

    const columns = [
        { label: 'Airline', key: 'airline', render: (row) => row.airlines?.name || row.airline_id },
        { label: 'Model', key: 'model', sortable: true, render: (row) => <span className="font-bold">{row.model}</span> },
        { label: 'Capacity', key: 'capacity', sortable: true },
        { label: 'Year', key: 'manufacturing_year', sortable: true },
        { label: 'Status', key: 'status', render: (row) => <StatusBadge status={row.status} /> },
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
        <div className="manage-aircraft-page animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Plane className="text-primary" /> Aircraft Fleet
                </h1>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Add Aircraft
                </button>
            </div>

            <div className="card mb-4 p-4 flex items-center gap-4">
                <Filter size={18} className="text-muted" />
                <select
                    className="select max-w-xs"
                    value={filterAirline}
                    onChange={e => setFilterAirline(e.target.value)}
                >
                    <option value="All">All Airlines</option>
                    {airlines.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                    ))}
                </select>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={filteredAircraft}
                    emptyMessage="No aircraft found."
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingAircraft ? 'Edit Aircraft' : 'Add Aircraft'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-4">
                        <label>Airline*</label>
                        <select className="select" required
                            value={formData.airline_id} onChange={e => setFormData({ ...formData, airline_id: e.target.value })}
                        >
                            <option value="" disabled>Select Airline</option>
                            {airlines.map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid-2 mb-4">
                        <div className="form-group">
                            <label>Model*</label>
                            <input className="input" required
                                value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })}
                                placeholder="e.g. Boeing 737"
                            />
                        </div>
                        <div className="form-group">
                            <label>Capacity*</label>
                            <input type="number" className="input" required min="1"
                                value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid-2 mb-6">
                        <div className="form-group">
                            <label>Mfg Year*</label>
                            <input type="number" className="input" required min="1970" max={new Date().getFullYear()}
                                value={formData.manufacturing_year} onChange={e => setFormData({ ...formData, manufacturing_year: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Status*</label>
                            <select className="select" required
                                value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="retired">Retired</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Aircraft</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
