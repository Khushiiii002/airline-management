import React from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, Bell, User } from 'lucide-react'

const getPageTitle = (pathname) => {
    if (pathname === '/') return 'Dashboard'
    if (pathname.startsWith('/flights')) return 'Search Flights'
    if (pathname.startsWith('/book/')) return 'Book Flight'
    if (pathname.startsWith('/booking-confirm/')) return 'Booking Confirmation'
    if (pathname.startsWith('/bookings')) return 'My Bookings'

    if (pathname.startsWith('/manage/flights')) return 'Flight Operations'
    if (pathname.startsWith('/manage/airlines')) return 'Airlines Management'
    if (pathname.startsWith('/manage/aircraft')) return 'Aircraft Fleet'
    if (pathname.startsWith('/manage/airports')) return 'Airports Management'
    if (pathname.startsWith('/manage/passengers')) return 'Passenger Management'
    if (pathname.startsWith('/manage/crew')) return 'Crew Management'

    return 'Airline Management'
}

export default function Navbar() {
    const location = useLocation()
    const title = getPageTitle(location.pathname)

    // Mobile toggle logic would go here (using context or props if lifted state)
    // For now, simple implementation

    return (
        <div className="navbar justify-between">
            <div className="flex items-center gap-4">
                <button className="btn-icon mobile-only" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>
                    <Menu size={24} />
                </button>
                <h2 className="text-xl font-bold">{title}</h2>
            </div>

            <div className="flex items-center gap-4">
                <div style={{ position: 'relative' }}>
                    <Bell size={20} className="text-muted" />
                    <span style={{
                        position: 'absolute', top: -2, right: -2,
                        width: 8, height: 8, background: 'var(--danger)',
                        borderRadius: '50%'
                    }} />
                </div>
                <div className="flex items-center gap-2">
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={18} className="text-muted" />
                    </div>
                    <span className="text-sm font-medium hidden-mobile">Admin User</span>
                </div>
            </div>

            <style>{`
        @media (min-width: 769px) {
            .mobile-only { display: none; }
        }
        @media (max-width: 768px) {
            .hidden-mobile { display: none; }
        }
      `}</style>
        </div>
    )
}
