import React from 'react'

export default function Spinner({ size = 24, fullPage = false }) {
    const spinner = (
        <div
            className="spinner"
            style={{
                width: size,
                height: size,
                borderWidth: size > 30 ? 4 : 2
            }}
        />
    )

    if (fullPage) {
        return (
            <div className="spinner-overlay">
                {spinner}
            </div>
        )
    }

    return spinner
}

const styles = `
.spinner {
  border: 2px solid #E2E8F0;
  border-top: 2px solid var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
.spinner-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.8);
  z-index: 50;
  backdrop-filter: blur(2px);
}
`

// Inject styles once
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet)
}
