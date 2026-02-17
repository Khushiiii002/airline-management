import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Printer, ArrowRight } from 'lucide-react'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import StatusBadge from '../../components/StatusBadge'
import './BookingConfirmPage.css'

export default function BookingConfirmPage() {
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [booking, setBooking] = useState(null)

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await api.get(`/bookings/${id}`)
                setBooking(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchBooking()
    }, [id])

    if (loading) return <Spinner fullPage />
    if (!booking) return <div className="p-8 text-center">Booking not found</div>

    return (
        <div className="confirm-page animate-fade-in">
            <div className="success-header">
                <CheckCircle size={64} className="text-success mb-4" />
                <h1 className="text-2xl font-bold text-success">Booking Confirmed! 🎉</h1>
                <p className="text-muted mt-2">Your flight has been successfully booked.</p>
            </div>

            <div className="boarding-pass">
                <div className="bp-top">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            {booking.flights.airlines.logo && <img src={booking.flights.airlines.logo} alt="logo" className="w-8 h-8 object-contain" />}
                            <span className="font-bold text-lg">{booking.flights.airlines.name}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-muted">BOOKING REFERENCE</div>
                            <div className="booking-ref-box">{booking.booking_reference}</div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center px-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold">{booking.flights.origin.code}</div>
                            <div className="text-sm text-muted">{booking.flights.origin.city}</div>
                        </div>
                        <div className="flex-1 text-center px-4 relative" style={{ top: '-10px' }}>
                            <div className="text-xs text-muted mb-1">
                                {Math.floor((new Date(booking.flights.arrival_time) - new Date(booking.flights.departure_time)) / 60000 / 60)}h
                                {Math.floor((new Date(booking.flights.arrival_time) - new Date(booking.flights.departure_time)) / 60000 % 60)}m
                            </div>
                            <div style={{ borderTop: '2px dashed #CBD5E1', width: '100%' }}></div>
                            <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 5px' }}>✈</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">{booking.flights.destination.code}</div>
                            <div className="text-sm text-muted">{booking.flights.destination.city}</div>
                        </div>
                    </div>
                </div>

                <div className="bp-divider"></div>

                <div className="bp-bottom">
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="label">PASSENGER</div>
                            <div className="value">{booking.passengers.first_name} {booking.passengers.last_name}</div>
                        </div>
                        <div className="info-item">
                            <div className="label">DATE</div>
                            <div className="value">{new Date(booking.flights.departure_time).toLocaleDateString()}</div>
                        </div>
                        <div className="info-item">
                            <div className="label">FLIGHT</div>
                            <div className="value">{booking.flights.flight_number}</div>
                        </div>
                        <div className="info-item">
                            <div className="label">TIME</div>
                            <div className="value">{new Date(booking.flights.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <div className="info-item">
                            <div className="label">CLASS</div>
                            <div className="value capitalize">{booking.seat_class.replace('_', ' ')}</div>
                        </div>
                        <div className="info-item">
                            <div className="label">SEAT</div>
                            <div className="value">{booking.seat_number}</div>
                        </div>
                        <div className="info-item">
                            <div className="label">GATE</div>
                            <div className="value">{booking.flights.gate || 'TBD'}</div>
                        </div>
                        <div className="info-item">
                            <div className="label">STATUS</div>
                            <div className="value"><StatusBadge status={booking.status} /></div>
                        </div>
                    </div>

                    <div className="barcode mt-6">
                        ||| || ||| || ||| || ||| || ||| || ||| || |||
                    </div>
                </div>
            </div>

            <div className="actions flex justify-center gap-4 mt-8 print:hidden">
                <button className="btn btn-secondary" onClick={() => window.print()}>
                    <Printer size={18} /> Print Boarding Pass
                </button>
                <Link to="/flights" className="btn btn-primary">
                    Book Another Flight
                </Link>
                <Link to="/bookings" className="btn btn-secondary">
                    View All Bookings <ArrowRight size={18} />
                </Link>
            </div>
        </div>
    )
}
