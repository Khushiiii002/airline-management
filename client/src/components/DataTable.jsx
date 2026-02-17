import React from 'react'

export default function DataTable({
    columns,
    data = [],
    onSort,
    loading = false,
    emptyMessage = 'No data available'
}) {
    if (loading) {
        return (
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key || col.label} style={{ width: col.width }}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i}>
                                {columns.map((col, idx) => (
                                    <td key={idx}>
                                        <div style={{
                                            height: '20px',
                                            width: '80%',
                                            background: '#E2E8F0',
                                            borderRadius: '4px',
                                            animation: 'pulse 1.5s infinite'
                                        }} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <style>{`
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
        `}</style>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center text-muted card flex-center" style={{ padding: '60px 20px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🥡</div>
                <p>{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key || col.label}
                                onClick={() => col.sortable && onSort && onSort(col.key)}
                                style={{
                                    cursor: col.sortable ? 'pointer' : 'default',
                                    width: col.width
                                }}
                            >
                                {col.label} {col.sortable && <span style={{ opacity: 0.4 }}>⇅</span>}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIdx) => (
                        <tr key={row.id || rowIdx}>
                            {columns.map((col, colIdx) => (
                                <td key={col.key || colIdx}>
                                    {col.render ? col.render(row) : (row[col.key] || '-')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
