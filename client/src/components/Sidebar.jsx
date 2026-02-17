import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard, Plane, Ticket, ClipboardList,
    Settings, Users, Briefcase, MapPin, Menu
} from 'lucide-react'

// Using plane icon for aircraft as well.
// Navigation config
const navItems = [
    {
        label: 'Public', items: [
            { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/flights', icon: Plane, label: 'Search Flights' },
            // Book a flight is accessed via search, not direct link usually, but let's keep it simple
            { to: '/bookings', icon: Ticket, label: 'My Bookings' },
        ]
    },
    {
        label: 'Admin', items: [
            { to: '/manage/flights', icon: ClipboardList, label: 'Flight Operations' },
            { to: '/manage/airlines', icon: Briefcase, label: 'Airlines' },
            { to: '/manage/aircraft', icon: Plane, label: 'Aircraft' },
            { to: '/manage/airports', icon: MapPin, label: 'Airports' },
            { to: '/manage/passengers', icon: Users, label: 'Passengers' },
            { to: '/manage/crew', icon: Users, label: 'Crew Management' },
        ]
    }
]

export default function Sidebar() {
    return (
        <div className="sidebar">
            <div className="logo-area">
                <Plane className="text-primary-light" size={24} />
                <span className="logo-text">AirManager</span>
            </div>

            <div className="nav-content">
                {navItems.map((section, idx) => (
                    <div key={idx}>
                        <div className="nav-section">{section.label}</div>
                        {section.items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                <item.icon size={20} />
                                <span className="nav-text">{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}
