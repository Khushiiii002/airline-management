import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Plane, Calendar, Users, ArrowRight, Clock } from 'lucide-react'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import { useToast } from '../../components/Toast'
import './FlightsPage.css'

export default function FlightsPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const { error } = useToast()

    const [loading, setLoading] = useState(false)
    const [flights, setFlights] = useState([])
    const [hasSearched, setHasSearched] = useState(false)

    // Form State
    const [origin, setOrigin] = useState('')
    const [destination, setDestination] = useState('')
    const [date, setDate] = useState('')
    const [seatClass, setSeatClass] = useState('economy')
    const [passengers, setPassengers] = useState(1)

    // Autocomplete State
    const [originResults, setOriginResults] = useState([])
    const [destResults, setDestResults] = useState([])
    const [showOriginDropdown, setShowOriginDropdown] = useState(false)
    const [showDestDropdown, setShowDestDropdown] = useState(false)
    const [originObj, setOriginObj] = useState(null)
    const [destObj, setDestObj] = useState(null)

    // Handle Search Strings
    const handleAirportSearch = async (q, setter) => {
        if (q.length < 2) {
            setter([])
            return
        }
        try {
            const res = await api.get(`/airports/search?q=${q}`)
            setter(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    // Effect to debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (origin && !originObj) handleAirportSearch(origin, setOriginResults)
        }, 300)
        return () => clearTimeout(timer)
    }, [origin, originObj])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (destination && !destObj) handleAirportSearch(destination, setDestResults)
        }, 300)
        return () => clearTimeout(timer)
    }, [destination, destObj])

    const selectOrigin = (airport) => {
        setOriginObj(airport)
        setOrigin(`${airport.code} - ${airport.city}`)
        setShowOriginDropdown(false)
    }

    const selectDest = (airport) => {
        setDestObj(airport)
        setDestination(`${airport.code} - ${airport.city}`)
        setShowDestDropdown(false)
    }

    const handleSearch = async (e) => {
        e.preventDefault()
        setLoading(true)
        setHasSearched(true)

        try {
            const params = new URLSearchParams()
            if (originObj) params.append('origin', originObj.id)
            if (destObj) params.append('destination', destObj.id)
            if (date) params.append('date', date)
            if (seatClass) params.append('seat_class', seatClass)

            // Update URL
            setSearchParams(params)

            const res = await api.get(`/flights/search?${params.toString()}`)
            setFlights(res.data)
        } catch (err) {
            error('Failed to search flights')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flights-page animate-fade-in">
            <div className="search-card card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Plane className="text-primary" /> Search Flights
                </h2>
                <form onSubmit={handleSearch}>
                    <div className="grid-3 mb-4">
                        <div className="form-group relative">
                            <label>From</label>
                            <input
                                className="input"
                                value={origin}
                                onChange={e => { setOrigin(e.target.value); setOriginObj(null); setShowOriginDropdown(true); }}
                                placeholder="City or Airport"
                                required
                            />
                            {showOriginDropdown && originResults.length > 0 && (
                                <div className="autocomplete-dropdown">
                                    {originResults.map(a => (
                                        <div key={a.id} className="dropdown-item" onClick={() => selectOrigin(a)}>
                                            <span className="font-bold w-12">{a.code}</span>
                                            <span>{a.city}, {a.country}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="form-group relative">
                            <label>To</label>
                            <input
                                className="input"
                                value={destination}
                                onChange={e => { setDestination(e.target.value); setDestObj(null); setShowDestDropdown(true); }}
                                placeholder="City or Airport"
                                required
                            />
                            {showDestDropdown && destResults.length > 0 && (
                                <div className="autocomplete-dropdown">
                                    {destResults.map(a => (
                                        <div key={a.id} className="dropdown-item" onClick={() => selectDest(a)}>
                                            <span className="font-bold w-12">{a.code}</span>
                                            <span>{a.city}, {a.country}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                className="input"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>
                    <div className="grid-3 mb-6">
                        <div className="form-group">
                            <label>Class</label>
                            <select className="select" value={seatClass} onChange={e => setSeatClass(e.target.value)}>
                                <option value="economy">Economy</option>
                                <option value="business">Business</option>
                                <option value="first_class">First Class</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Passengers</label>
                            <input
                                type="number"
                                className="input"
                                min="1" max="9"
                                value={passengers}
                                onChange={e => setPassengers(e.target.value)}
                            />
                        </div>
                        <div className="form-group flex justify-end items-end">
                            <button type="submit" className="btn btn-primary btn-block text-lg" disabled={loading}>
                                {loading ? <Spinner size={20} /> : 'Search Flights'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="results-area mt-6">
                {hasSearched && !loading && (
                    <div className="mb-4 text-muted font-bold">
                        {flights.length} flights found
                    </div>
                )}

                {loading && <div className="flex justify-center p-12"><Spinner size={40} /></div>}

                {!loading && hasSearched && flights.length === 0 && (
                    <EmptyState
                        icon={Plane}
                        title="No flights found"
                        message="Try changing your search criteria or dates."
                    />
                )}

                <div className="flex flex-col gap-4">
                    {flights.map(flight => {
                        const seatsLeft = flight.available_seats[seatClass]
                        const price = flight[`${seatClass}_price`]

                        return (
                            <div key={flight.id} className="flight-card card">
                                <div className="carrier-info">
                                    {flight.airlines.logo ? (
                                        <img src={flight.airlines.logo} alt={flight.airlines.name} className="airline-logo" />
                                    ) : (
                                        <div className="airline-logo-placeholder">{flight.airlines.code}</div>
                                    )}
                                    <div>
                                        <div className="font-bold">{flight.airlines.name}</div>
                                        <div className="text-xs text-muted flex items-center gap-1">
                                            <Plane size={12} /> {flight.aircraft.model}
                                        </div>
                                    </div>
                                </div>

                                <div className="flight-route">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{flight.origin.code}</div>
                                        <div className="text-xs text-muted">{new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>

                                    <div className="flight-duration">
                                        <div className="text-xs text-muted text-center mb-1">
                                            {Math.floor(flight.duration_minutes / 60)}h {flight.duration_minutes % 60}m
                                        </div>
                                        <div className="route-line">
                                            <Plane size={14} className="plane-icon" />
                                        </div>
                                        <div className="text-xs text-success text-center mt-1">Direct</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{flight.destination.code}</div>
                                        <div className="text-xs text-muted">{new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>

                                <div className="flight-status flex flex-col justify-center items-center gap-2">
                                    <StatusBadge status={flight.status} />
                                    <div className="text-xs text-muted">Gate {flight.gate || 'TBD'}</div>
                                </div>

                                <div className="flight-price">
                                    <div className="price-tag text-accent font-bold text-2xl">
                                        ${Number(price).toLocaleString()}
                                    </div>
                                    <div className={`text-xs mb-2 ${seatsLeft < 10 ? 'text-danger font-bold' : 'text-muted'}`}>
                                        {seatsLeft} seats left
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate(`/book/${flight.id}?class=${seatClass}`)}
                                        disabled={seatsLeft <= 0}
                                    >
                                        Select <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
