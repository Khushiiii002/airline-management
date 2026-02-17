import React, { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search...', onSearch, debounceMs = 300 }) {
    const [localValue, setLocalValue] = useState(value)

    useEffect(() => {
        setLocalValue(value)
    }, [value])

    useEffect(() => {
        const handler = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue)
            }
        }, debounceMs)
        return () => clearTimeout(handler)
    }, [localValue, debounceMs, onChange, value])

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search size={18} style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none'
            }} />
            <input
                type="text"
                className="input"
                placeholder={placeholder}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch && onSearch(localValue)}
                style={{ paddingLeft: '40px', paddingRight: localValue ? '36px' : '10px' }}
            />
            {localValue && (
                <button onClick={() => { setLocalValue(''); onChange('') }} style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center'
                }}>
                    <X size={16} />
                </button>
            )}
        </div>
    )
}
