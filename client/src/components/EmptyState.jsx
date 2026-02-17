import React from 'react'

export default function EmptyState({ icon: Icon, title, message, action }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)'
        }}>
            {Icon ? (
                <div style={{
                    background: '#F1F5F9',
                    padding: '24px',
                    borderRadius: '50%',
                    marginBottom: '20px',
                    color: '#94A3B8'
                }}>
                    <Icon size={48} />
                </div>
            ) : (
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                    📭
                </div>
            )}
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                {title}
            </h3>
            <p className="mb-6" style={{ maxWidth: '400px' }}>
                {message}
            </p>
            {action}
        </div>
    )
}
