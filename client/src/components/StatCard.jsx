import React from 'react'

export default function StatCard({ icon: Icon, label, value, subValue, subLabel, color }) {
    return (
        <div className="card" style={{ borderLeft: `4px solid ${color || 'var(--primary)'}` }}>
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-muted text-sm uppercase font-semibold mb-1">{label}</div>
                    <div className="text-xl font-bold">{value}</div>
                    {subValue && (
                        <div className="text-sm text-muted mt-1">
                            <span className="font-medium text-bold" style={{ color: color }}>{subValue}</span> {subLabel}
                        </div>
                    )}
                </div>
                {Icon && (
                    <div style={{
                        background: `${color}15`,
                        padding: '10px',
                        borderRadius: '50%',
                        color: color || 'var(--primary)'
                    }}>
                        <Icon size={24} />
                    </div>
                )}
            </div>
        </div>
    )
}
