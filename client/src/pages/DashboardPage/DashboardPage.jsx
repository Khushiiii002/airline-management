import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plane, Ticket, CheckCircle, Clock, AlertTriangle, XCircle, DollarSign, Calendar } from 'lucide-react'
import api from '../../api/axios'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'
import Spinner from '../../components/Spinner'
import { useToast } from '../../components/Toast'
import './DashboardPage.css'

export default function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [flights, setFlights] = useState([])
    const [bookings, setBookings] = useState([])
    const [currentTime, setCurrentTime] = useState(new Date())
    const { error } = useToast()

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const [flightStatsRes, bookingStatsRes, flightsRes, bookingsRes] = await Promise.all([
                api.get('/flights/stats'),
                api.get('/bookings/stats'),
                api.get('/flights?limit=5'), // backend doesn't support limit param but we can slice
                api.get('/bookings') // same, mock slice
            ])

            setStats({
                flights: flightStatsRes.data,
                bookings: bookingStatsRes.data
            })

            // Get upcoming flights (scheduled/boarding) sorted by date
            const activeFlights = flightsRes.data
                .filter(f => ['scheduled', 'boarding', 'delayed'].includes(f.status))
                .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time))
                .slice(0, 5)
            setFlights(activeFlights)

            // Booking slice
            setBookings(bookingsRes.data.slice(0, 5))

        } catch (err) {
            error(err.response?.data?.error || 'Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <Spinner fullPage />

    return (
        <div className="dashboard-page animate-fade-in">
            <div className="hero-banner">
                <div>
                    <h1 className="text-2xl font-bold mb-2">✈️ Airline Management System</h1>
                    <p className="text-blue-100 flex items-center gap-2">
                        <Calendar size={16} />
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        {' · '}
                        <Clock size={16} />
                        {currentTime.toLocaleTimeString()}
                    </p>
                </div>
                <div className="hero-stats">
                    <div className="pill">
                        <Plane size={14} /> Total Flights: {stats?.flights?.total || 0}
                    </div>
                    <div className="pill">
                        <Calendar size={14} /> Active Today: {stats?.flights?.todayCount || 0}
                    </div>
                    <div className="pill">
                        <Ticket size={14} /> Bookings: {stats?.bookings?.total || 0}
                    </div>
                    <div className="pill success">
                        <DollarSign size={14} /> Rev: ${(stats?.bookings?.revenue || 0).toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                {/* Row 1: Flights */}
                <StatCard
                    icon={Plane} label="Total Flights"
                    value={stats?.flights?.total || 0}
                    color="var(--primary)"
                />
                <StatCard
                    icon={CheckCircle} label="Scheduled"
                    value={stats?.flights?.statusCounts?.scheduled || 0}
                    color="var(--success)"
                    subValue={stats?.flights?.statusCounts?.active || 0}
                    subLabel="Active"
                />
                <StatCard
                    icon={Clock} label="Delayed"
                    value={stats?.flights?.statusCounts?.delayed || 0}
                    color="#D97706"
                />
                <StatCard
                    icon={XCircle} label="Cancelled"
                    value={stats?.flights?.statusCounts?.cancelled || 0}
                    color="#EF4444"
                />

                {/* Row 2: Bookings */}
                <StatCard
                    icon={Ticket} label="Total Bookings"
                    value={stats?.bookings?.total || 0}
                    color="var(--primary-dark)"
                />
                <StatCard
                    icon={Ticket} label="Economy"
                    value={stats?.bookings?.class_counts?.economy || 0}
                    color="#64748B"
                />
                <StatCard
                    icon={Ticket} label="Business"
                    value={stats?.bookings?.class_counts?.business || 0}
                    color="#4F46E5"
                />
                <StatCard
                    icon={Ticket} label="First Class"
                    value={stats?.bookings?.class_counts?.first_class || 0}
                    color="#F59E0B"
                />
            </div>

            <div className="revenue-card card mt-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="icon-circle"><DollarSign size={24} color="white" /></div>
                    <div>
                        <div className="text-muted uppercase text-xs font-bold">Total Revenue</div>
                        <div className="text-2xl font-bold text-success">
                            ${(stats?.bookings?.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>
                <div className="revenue-breakdown">
                    <div className="rb-item">
                        <span className="dot eco"></span>
                        <span>Economy: <b>${(stats?.bookings?.revenue_by_class?.economy || 0).toLocaleString()}</b></span>
                    </div>
                    <div className="rb-item">
                        <span className="dot bus"></span>
                        <span>Business: <b>${(stats?.bookings?.revenue_by_class?.business || 0).toLocaleString()}</b></span>
                    </div>
                    <div className="rb-item">
                        <span className="dot first"></span>
                        <span>First Class: <b>${(stats?.bookings?.revenue_by_class?.first_class || 0).toLocaleString()}</b></span>
                    </div>
                </div>
            </div>

            <div className="grid-2 mt-6">
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">Upcoming Flights</h3>
                        <Link to="/flights" className="text-sm text-primary">View All →</Link>
                    </div>
                    <div className="list">
                        {flights.map(flight => (
                            <div key={flight.id} className="list-item">
                                <div className="flex items-center gap-3">
                                    <div className="font-mono font-bold bg-slate-100 px-2 py-1 rounded">{flight.flight_number}</div>
                                    <div>
                                        <div className="text-sm font-semibold">{flight.origin.code} ➝ {flight.destination.code}</div>
                                        <div className="text-xs text-muted">
                                            {new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-xs text-right">
                                        {flight.gate && <div>Gate {flight.gate}</div>}
                                    </div>
                                    <StatusBadge status={flight.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">Recent Bookings</h3>
                        <Link to="/bookings" className="text-sm text-primary">View All →</Link>
                    </div>
                    <div className="list">
                        {bookings.map(booking => (
                            <div key={booking.id} className="list-item">
                                <div className="flex items-center gap-3">
                                    <div className="font-mono font-bold text-primary bg-blue-50 px-2 py-1 rounded">{booking.booking_reference}</div>
                                    <div>
                                        <div className="text-sm font-semibold">{booking.passengers.first_name} {booking.passengers.last_name}</div>
                                        <div className="text-xs text-muted">
                                            {booking.flights.flight_number} • {booking.seat_class}
                                        </div>
                                    </div>
                                </div>
                                <StatusBadge status={booking.status} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
