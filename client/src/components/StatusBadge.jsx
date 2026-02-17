import React from 'react'

const styles = {
    // Flights
    scheduled: { bg: '#E0F2FE', color: '#0369A1', label: 'Scheduled' },
    boarding: { bg: '#FEF9C3', color: '#854D0E', label: 'Boarding' },
    departed: { bg: '#F0FDF4', color: '#166534', label: 'Departed' },
    arrived: { bg: '#DCFCE7', color: '#15803D', label: 'Arrived' },
    delayed: { bg: '#FEF3C7', color: '#B45309', label: 'Delayed' },
    cancelled: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },

    // Bookings
    confirmed: { bg: '#DBEAFE', color: '#1D4ED8', label: 'Confirmed' },
    checked_in: { bg: '#F0FDF4', color: '#166534', label: 'Checked In' },
    boarded: { bg: '#F5F3FF', color: '#6D28D9', label: 'Boarded' },
    no_show: { bg: '#F1F5F9', color: '#475569', label: 'No Show' },

    // Aircraft
    active: { bg: '#D1FAE5', color: '#065F46', label: 'Active' },
    maintenance: { bg: '#FEF3C7', color: '#92400E', label: 'Maintenance' },
    retired: { bg: '#F1F5F9', color: '#374151', label: 'Retired' }
}

export default function StatusBadge({ status }) {
    const config = styles[status] || { bg: '#F1F5F9', color: '#64748B', label: status }

    return (
        <span style={{
            backgroundColor: config.bg,
            color: config.color,
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'inline-block'
        }}>
            {config.label}
        </span>
    )
}
