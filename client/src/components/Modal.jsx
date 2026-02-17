import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            const handleEsc = (e) => e.key === 'Escape' && onClose()
            window.addEventListener('keydown', handleEsc)
            return () => {
                document.body.style.overflow = 'unset'
                window.removeEventListener('keydown', handleEsc)
            }
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const width = {
        sm: '400px',
        md: '600px',
        lg: '800px',
        xl: '1000px'
    }[size]

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                width: '100%',
                maxWidth: width,
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '4px', borderRadius: '50%'
                    }} className="close-btn">
                        <X size={20} className="text-muted" />
                    </button>
                </div>

                <div style={{
                    padding: '24px',
                    overflowY: 'auto'
                }}>
                    {children}
                </div>
            </div>
            <style>{`
        .close-btn:hover { background: #F3F4F6; }
      `}</style>
        </div>
    )
}
