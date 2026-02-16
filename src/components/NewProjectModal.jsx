import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useFocusTrap } from '../hooks/useFocusTrap'

export default function NewProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const trapRef = useFocusTrap(true)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate(name.trim(), url.trim())
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={trapRef}
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title"
        style={{ maxWidth: 440, animation: 'dialog-scale-in 250ms ease-out both' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 id="new-project-title" style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            New Project
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: 6, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center',
            }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="project-name" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Project Name
            </label>
            <input
              id="project-name"
              type="text"
              placeholder="My Website"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="project-url" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Website URL <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>(optional)</span>
            </label>
            <input
              id="project-url"
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-primary"
              style={{ flex: 1, opacity: name.trim() ? 1 : 0.5 }}
            >
              <Plus size={14} />
              Create Project
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
