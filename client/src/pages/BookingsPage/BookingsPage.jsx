import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Ticket, Search, Filter } from 'lucide-react'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import SearchBar from '../../components/SearchBar'
import './BookingsPage.css'

export default function BookingsPage() {
    const [loading, setLoading] = useState(true)
    const [bookings, setBookings] = useState([])
    const [filteredBookings, setFilteredBookings] = useState([])

    // Filters
    const [filterStatus, setFilterStatus] = useState('All')
    const [filterClass, setFilterClass] = useState('All')
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings')
            setBookings(res.data)
            setFilteredBookings(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let result = bookings

        // Filter by status
        if (filterStatus !== 'All') {
            result = result.filter(b => b.status === filterStatus.toLowerCase().replace(' ', '_'))
        }

        // Filter by class
        if (filterClass !== 'All') {
            result = result.filter(b => b.seat_class === filterClass.toLowerCase().replace(' ', '_'))
        }

        // Filter by search
        if (search) {
            const q = search.toLowerCase()
            result = result.filter(b =>
                b.booking_reference.toLowerCase().includes(q) ||
                b.passengers.first_name.toLowerCase().includes(q) ||
                b.passengers.last_name.toLowerCase().includes(q) ||
                b.flights.flight_number.toLowerCase().includes(q)
            )
        }

        setFilteredBookings(result)
    }, [filterStatus, filterClass, search, bookings])

    // Admin function to update status
    const updateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/bookings/${id}/status`, { status: newStatus })
            // Optimistic update
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
        } catch (err) {
            console.error('Failed to update status')
        }
    }

    if (loading) return <Spinner fullPage />

    return (
        <div className="bookings-page animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    <Ticket className="text-primary" /> All Bookings
                    <span className="bg-slate-200 text-slate-700 text-sm px-2 py-1 rounded-full">{bookings.length}</span>
                </h1>
                <Link to="/flights" className="btn btn-primary">＋ New Booking</Link>
            </div>

            <div className="card mb-6 p-4">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-2 items-center">
                        <Filter size={18} className="text-muted" />
                        <div className="flex gap-2">
                            {['All', 'Confirmed', 'Checked In', 'Boarded', 'Cancelled'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`filter-pill ${filterStatus === s ? 'active' : ''}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <select className="select" style={{ width: '150px' }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                            <option>All Classes</option>
                            <option value="economy">Economy</option>
                            <option value="business">Business</option>
                            <option value="first_class">First Class</option>
                        </select>
                        <SearchBar
                            placeholder="Ref, Name, Flight..."
                            value={search}
                            onChange={setSearch}
                        />
                    </div>
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <EmptyState icon={Ticket} title="No bookings found" message="Try adjusting your filters" />
            ) : (
                <div className="bookings-grid">
                    {filteredBookings.map(booking => (
                        <div key={booking.id} className="booking-card card" style={{
                            borderLeft: `4px solid ${booking.status === 'confirmed' ? 'var(--primary-light)' :
                                    booking.status === 'cancelled' ? 'var(--danger)' :
                                        'var(--success)'
                                }`
                        }}>
                            <div className="flex justify-between mb-2">
                                <div className="font-mono font-bold text-lg">{booking.booking_reference}</div>
                                <div className="text-xs text-muted">
                                    Ordered {new Date(booking.booked_at).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                <div className="avatar-circle">
                                    {booking.passengers.first_name[0]}{booking.passengers.last_name[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{booking.passengers.first_name} {booking.passengers.last_name}</div>
                                    <div className="text-xs text-muted">{booking.passengers.email}</div>
                                </div>
                            </div>

                            <div className="route-mini mb-3">
                                <div className="font-bold">{booking.flights.origin.code} ➝ {booking.flights.destination.code}</div>
                                <div className="text-xs text-muted">
                                    {new Date(booking.flights.departure_time).toLocaleString('en-US', {
                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                                <div className="flex gap-2">
                                    <span className="class-badge">{booking.seat_class.replace('_', ' ')}</span>
                                </div>
                                <div className="font-bold text-success">${Number(booking.price).toLocaleString()}</div>
                            </div>

                            <div className="mt-3 flex justify-between items-center">
                                <StatusBadge status={booking.status} />
                                {/* Admin Action for Demo */}
                                <select
                                    className="text-xs border rounded p-1"
                                    value={booking.status}
                                    onChange={(e) => updateStatus(booking.id, e.target.value)}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <option value="confirmed">Confirmed</option>
                                    <option value="checked_in">Checked In</option>
                                    <option value="boarded">Boarded</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="no_show">No Show</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
