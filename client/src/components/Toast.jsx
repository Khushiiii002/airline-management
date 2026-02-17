import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext()

export const useToast = () => useContext(ToastContext)

export default function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9)
        setToasts((prev) => [...prev, { id, message, type }])
        setTimeout(() => removeToast(id), 3500)
    }, [])

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const success = (msg) => addToast(msg, 'success')
    const error = (msg) => addToast(msg, 'error')
    const info = (msg) => addToast(msg, 'info')
    const warning = (msg) => addToast(msg, 'warning')

    return (
        <ToastContext.Provider value={{ addToast, success, error, info, warning }}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast toast-${toast.type} animate-fade-in`}>
                        {toast.type === 'success' && <CheckCircle size={20} />}
                        {toast.type === 'error' && <AlertCircle size={20} />}
                        {toast.type === 'info' && <Info size={20} />}
                        {toast.type === 'warning' && <AlertTriangle size={20} />}
                        <span>{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} className="toast-close">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 9999;
          pointer-events: none;
        }
        .toast {
          background: white;
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 300px;
          max-width: 400px;
          pointer-events: auto;
          border-left: 4px solid transparent;
          font-size: 0.9rem;
        }
        .toast-success { border-left-color: var(--success); color: #064E3B; background: #ECFDF5; }
        .toast-error { border-left-color: var(--danger); color: #7F1D1D; background: #FEF2F2; }
        .toast-info { border-left-color: var(--primary); color: #1E3A8A; background: #EFF6FF; }
        .toast-warning { border-left-color: var(--warning); color: #78350F; background: #FFFBEB; }
        .toast-close {
          margin-left: auto;
          background: transparent;
          border: none;
          cursor: pointer;
          opacity: 0.6;
          display: flex;
          align-items: center;
        }
        .toast-close:hover { opacity: 1; }
      `}</style>
        </ToastContext.Provider>
    )
}
