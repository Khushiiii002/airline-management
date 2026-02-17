import React, { useState, useEffect } from 'react'
import { Users, Filter, Plus, Edit, Trash2, Award } from 'lucide-react'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import Modal from '../../components/Modal'
import DataTable from '../../components/DataTable'
import EmptyState from '../../components/EmptyState'
import { useToast } from '../../components/Toast'
import './CrewPage.css'

export default function CrewPage() {
    const [loading, setLoading] = useState(true)
    const [crew, setCrew] = useState([])
    const [filteredCrew, setFilteredCrew] = useState([])
    const [filterRole, setFilterRole] = useState('All')

    const [modalOpen, setModalOpen] = useState(false)
    const [editingCrew, setEditingCrew] = useState(null)

    const { success, error } = useToast()

    const [formData, setFormData] = useState({
        name: '', role: 'Flight Attendant', license_number: ''
    })

    useEffect(() => {
        fetchCrew()
    }, [])

    const fetchCrew = async () => {
        try {
            const res = await api.get('/crew')
            setCrew(res.data)
            setFilteredCrew(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (filterRole === 'All') {
            setFilteredCrew(crew)
        } else {
            setFilteredCrew(crew.filter(c => c.role === filterRole))
        }
    }, [filterRole, crew])

    const handleOpenModal = (c = null) => {
        if (c) {
            setEditingCrew(c)
            setFormData({
                name: c.name, role: c.role, license_number: c.license_number
            })
        } else {
            setEditingCrew(null)
            setFormData({ name: '', role: 'Flight Attendant', license_number: '' })
        }
        setModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingCrew) {
                const res = await api.put(`/crew/${editingCrew.id}`, formData)
                setCrew(prev => prev.map(c => c.id === editingCrew.id ? res.data : c))
                success('Crew member updated')
            } else {
                const res = await api.post('/crew', formData)
                setCrew(prev => [...prev, res.data])
                success('Crew member added')
            }
            setModalOpen(false)
        } catch (err) {
            error(err.response?.data?.error || 'Operation failed')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return
        try {
            await api.delete(`/crew/${id}`)
            setCrew(prev => prev.filter(c => c.id !== id))
            success('Crew member deleted')
        } catch (err) {
            error('Failed to delete crew member')
        }
    }

    const columns = [
        {
            label: 'Name', key: 'name', sortable: true, render: (r) => (
                <div className="font-bold">{r.name}</div>
            )
        },
        {
            label: 'Role', key: 'role', sortable: true, render: (r) => (
                <span className={`role-badge role-${r.role.toLowerCase().replace(' ', '-')}`}>
                    {r.role}
                </span>
            )
        },
        {
            label: 'License', key: 'license_number', render: (r) => (
                <div className="font-mono text-sm text-muted">{r.license_number || 'N/A'}</div>
            )
        },
        {
            label: 'Assignments', key: 'flights', render: (r) => (
                <span className="text-sm">Not Implemented</span>
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
        <div className="crew-page animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Award className="text-primary" /> Crew Management
                </h1>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Add Crew Member
                </button>
            </div>

            <div className="card mb-4 p-4 flex items-center gap-4">
                <Filter size={18} className="text-muted" />
                <select className="select max-w-xs" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                    <option value="All">All Roles</option>
                    <option value="Pilot">Pilots</option>
                    <option value="Co-Pilot">Co-Pilots</option>
                    <option value="Flight Attendant">Flight Attendants</option>
                </select>
                <span className="text-muted text-sm ml-auto">Total: {crew.length}</span>
            </div>

            <div className="card">
                {filteredCrew.length === 0 ? (
                    <EmptyState icon={Users} title="No crew members found" message="Add crew profiles to get started." />
                ) : (
                    <DataTable
                        columns={columns}
                        data={filteredCrew}
                    />
                )}
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingCrew ? 'Edit Crew Member' : 'Add Crew Member'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-4">
                        <label>Full Name*</label>
                        <input className="input" required
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid-2 mb-6">
                        <div className="form-group">
                            <label>Role*</label>
                            <select className="select" required
                                value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="Pilot">Pilot</option>
                                <option value="Co-Pilot">Co-Pilot</option>
                                <option value="Flight Attendant">Flight Attendant</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>License Number*</label>
                            <input className="input" required
                                value={formData.license_number} onChange={e => setFormData({ ...formData, license_number: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Profile</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
