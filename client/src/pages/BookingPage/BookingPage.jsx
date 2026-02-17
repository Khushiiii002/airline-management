import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Plane, Calendar, User, CreditCard, Check } from 'lucide-react'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import StatusBadge from '../../components/StatusBadge'
import { useToast } from '../../components/Toast'
import './BookingPage.css'

export default function BookingPage() {
    const { flightId } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { error, success } = useToast()

    const initialClass = searchParams.get('class') || 'economy'

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [flight, setFlight] = useState(null)
    const [seatClass, setSeatClass] = useState(initialClass)

    // Form State
    const [tab, setTab] = useState('new') // 'new' or 'existing'
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        passport_number: '', nationality: '', date_of_birth: '',
        special_requests: ''
    })

    // Existing Passenger Search
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedPassenger, setSelectedPassenger] = useState(null)

    useEffect(() => {
        fetchFlight()
    }, [flightId])

    const fetchFlight = async () => {
        try {
            const res = await api.get(`/flights/${flightId}`)
            setFlight(res.data)
        } catch (err) {
            error('Failed to load flight details')
            navigate('/flights')
        } finally {
            setLoading(false)
        }
    }

    const handleSearchPassenger = async (q) => {
        setSearchQuery(q)
        if (q.length < 2) {
            setSearchResults([])
            return
        }
        try {
            const res = await api.get(`/passengers/search?q=${q}`)
            setSearchResults(res.data)
        } catch (err) { console.error(err) }
    }

    const selectPassenger = (p) => {
        setSelectedPassenger(p)
        setSearchResults([])
        setSearchQuery(`${p.first_name} ${p.last_name}`)
    }

    const getPrice = () => {
        if (!flight) return 0
        return Number(flight[`${seatClass}_price`])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            let passengerId = selectedPassenger?.id

            // 1. If new passenger, create them first
            if (tab === 'new') {
                const res = await api.post('/passengers', {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    phone: formData.phone,
                    passport_number: formData.passport_number,
                    nationality: formData.nationality,
                    date_of_birth: formData.date_of_birth
                })
                passengerId = res.data.id
            }

            if (!passengerId) throw new Error('Passenger selection failed')

            // 2. Create Booking
            const bookingRes = await api.post('/bookings', {
                flight_id: flight.id,
                passenger_id: passengerId,
                seat_class: seatClass,
                special_requests: formData.special_requests
            })

            success('Booking successful!')
            navigate(`/booking-confirm/${bookingRes.data.id}`)

        } catch (err) {
            error(err.response?.data?.error || 'Booking failed')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <Spinner fullPage />
    if (!flight) return null

    const price = getPrice()
    const taxes = price * 0.15
    const total = price + taxes

    return (
        <div className="booking-page animate-fade-in">
            <div className="booking-grid">
                {/* LEFT COMPONENT */}
                <div className="flight-summary card">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Plane size={20} className="text-primary" /> Flight Summary
                    </h3>

                    <div className="summary-header">
                        <div>
                            <div className="text-xs text-muted">Airline</div>
                            <div className="font-bold">{flight.airlines.name}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-muted">Flight No</div>
                            <div className="font-mono font-bold">{flight.flight_number}</div>
                        </div>
                    </div>

                    <div className="route-display my-6">
                        <div className="city">
                            <div className="code">{flight.origin.code}</div>
                            <div className="name">{flight.origin.city}</div>
                            <div className="time">{new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            <div className="date text-muted">{new Date(flight.departure_time).toLocaleDateString()}</div>
                        </div>
                        <div className="connector">
                            <div className="duration">{Math.floor(flight.duration_minutes / 60)}h {flight.duration_minutes % 60}m</div>
                            <div className="line">✈</div>
                        </div>
                        <div className="city text-right">
                            <div className="code">{flight.destination.code}</div>
                            <div className="name">{flight.destination.city}</div>
                            <div className="time">{new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            <div className="date text-muted">{new Date(flight.arrival_time).toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div className="detail-row">
                        <span className="text-muted">Aircraft</span>
                        <span className="font-medium">{flight.aircraft.model}</span>
                    </div>
                    <div className="detail-row">
                        <span className="text-muted">Gate / Terminal</span>
                        <span className="font-medium">{flight.gate || 'TBD'} / {flight.terminal || '-'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="text-muted">Status</span>
                        <StatusBadge status={flight.status} />
                    </div>

                    <div className="class-selector mt-6">
                        <label className="text-sm font-bold mb-2 block">Seat Class</label>
                        <div className="class-buttons">
                            {['economy', 'business', 'first_class'].map(cls => (
                                <button
                                    key={cls}
                                    type="button"
                                    className={`class-btn ${seatClass === cls ? 'active' : ''}`}
                                    onClick={() => setSeatClass(cls)}
                                >
                                    <span className="cls-name">{cls.replace('_', ' ')}</span>
                                    <span className="cls-price">${Number(flight[`${cls}_price`]).toLocaleString()}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COMPONENT */}
                <div className="passenger-form card">
                    <h2 className="text-xl font-bold mb-6">Passenger Details</h2>

                    <div className="tabs mb-6">
                        <button
                            className={`tab ${tab === 'new' ? 'active' : ''}`}
                            onClick={() => setTab('new')}
                        >
                            <User size={16} /> New Passenger
                        </button>
                        <button
                            className={`tab ${tab === 'existing' ? 'active' : ''}`}
                            onClick={() => setTab('existing')}
                        >
                            <Check size={16} /> Existing Passenger
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {tab === 'existing' ? (
                            <div className="form-group relative mb-6">
                                <label>Search Passenger</label>
                                <input
                                    className="input"
                                    placeholder="Name or Email..."
                                    value={searchQuery}
                                    onChange={e => handleSearchPassenger(e.target.value)}
                                />
                                {searchResults.length > 0 && (
                                    <div className="autocomplete-dropdown">
                                        {searchResults.map(p => (
                                            <div key={p.id} className="dropdown-item" onClick={() => selectPassenger(p)}>
                                                <div className="font-bold">{p.first_name} {p.last_name}</div>
                                                <div className="text-xs text-muted">{p.email}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedPassenger && (
                                    <div className="selected-p-card mt-4 p-4 bg-blue-50 rounded border border-blue-100">
                                        <div className="font-bold">{selectedPassenger.first_name} {selectedPassenger.last_name}</div>
                                        <div className="text-sm">{selectedPassenger.email}</div>
                                        <div className="text-sm">{selectedPassenger.phone}</div>
                                        <div className="text-sm">Passport: {selectedPassenger.passport_number}</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="new-p-form">
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>First Name*</label>
                                        <input className="input" required
                                            value={formData.first_name}
                                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name*</label>
                                        <input className="input" required
                                            value={formData.last_name}
                                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid-2 mt-4">
                                    <div className="form-group">
                                        <label>Email*</label>
                                        <input className="input" type="email" required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone*</label>
                                        <input className="input" required
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid-2 mt-4">
                                    <div className="form-group">
                                        <label>Passport Number</label>
                                        <input className="input"
                                            value={formData.passport_number}
                                            onChange={e => setFormData({ ...formData, passport_number: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Date of Birth</label>
                                        <input className="input" type="date"
                                            value={formData.date_of_birth}
                                            onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group mt-4">
                                    <label>Nationality</label>
                                    <input className="input"
                                        value={formData.nationality}
                                        onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-group mt-6">
                            <label>Special Requests (Optional)</label>
                            <textarea
                                className="textarea"
                                rows="3"
                                placeholder="Meal preference, wheelchair assistance, etc."
                                value={formData.special_requests}
                                onChange={e => setFormData({ ...formData, special_requests: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="price-summary mt-6">
                            <div className="row">
                                <span>Base Fare ({seatClass.replace('_', ' ')})</span>
                                <span>${price.toLocaleString()}</span>
                            </div>
                            <div className="row">
                                <span>Taxes & Fees (15%)</span>
                                <span>${taxes.toLocaleString()}</span>
                            </div>
                            <div className="row total">
                                <span>Total</span>
                                <span>${total.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block text-lg mt-6"
                            disabled={submitting || (tab === 'existing' && !selectedPassenger)}
                        >
                            {submitting ? <Spinner size={20} /> : `Confirm Booking ($${total.toLocaleString()})`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
