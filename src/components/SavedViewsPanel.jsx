import { memo, useState } from 'react'
import {
  Bookmark, Plus, Pin, PinOff, Share2, Lock, Copy,
  Trash2, Pencil, Check, X, ExternalLink, Clock,
} from 'lucide-react'

/**
 * SavedViewsPanel — Manage saved view bookmarks with pin, share, and load.
 */
function SavedViewsPanel({
  views = [], pinnedViews = [], saveView, deleteView,
  updateView, togglePin, toggleShare, duplicateView,
  editingId, setEditingId, currentView, onLoadView,
}) {
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [editLabel, setEditLabel] = useState('')

  const handleSave = () => {
    if (!newLabel.trim()) return
    saveView({ label: newLabel.trim(), view: currentView })
    setNewLabel('')
    setShowSaveForm(false)
  }

  const handleRename = (id) => {
    if (!editLabel.trim()) return
    updateView(id, { label: editLabel.trim() })
    setEditingId(null)
  }

  const btnStyle = {
    background: 'none', border: 'none', cursor: 'pointer', padding: '0.125rem',
    color: 'var(--text-disabled)', display: 'flex', alignItems: 'center',
  }

  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '0.0625rem solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <Bookmark size={14} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Saved Views
          </span>
          <span style={{
            fontSize: '0.5625rem', fontWeight: 600, color: 'var(--text-disabled)',
            background: 'var(--hover-bg)', padding: '0 var(--space-1)',
            borderRadius: 'var(--radius-sm)',
          }}>
            {views.length}
          </span>
        </div>
        <button
          onClick={() => setShowSaveForm(!showSaveForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
            padding: 'var(--space-1) var(--space-2)',
            background: showSaveForm ? 'var(--hover-bg)' : 'var(--accent)',
            border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
            fontSize: 'var(--text-2xs)', fontWeight: 600,
            color: showSaveForm ? 'var(--text-secondary)' : '#fff',
          }}
        >
          {showSaveForm ? <X size={10} /> : <Plus size={10} />}
          {showSaveForm ? 'Cancel' : 'Save Current'}
        </button>
      </div>

      {/* Save form */}
      {showSaveForm && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '0.0625rem solid var(--border-subtle)',
          background: 'color-mix(in srgb, var(--accent) 4%, transparent)',
        }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder={`Name this ${currentView} view...`}
              autoFocus
              style={{
                flex: 1, padding: 'var(--space-1) var(--space-2)',
                fontSize: 'var(--text-xs)', border: '0.0625rem solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', background: 'var(--bg-input)',
                color: 'var(--text-primary)', outline: 'none',
              }}
            />
            <button
              onClick={handleSave}
              disabled={!newLabel.trim()}
              style={{
                padding: 'var(--space-1) var(--space-2)',
                background: 'var(--accent)', border: 'none',
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                fontSize: 'var(--text-2xs)', fontWeight: 600, color: '#fff',
                opacity: newLabel.trim() ? 1 : 0.4,
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Pinned section */}
      {pinnedViews.length > 0 && (
        <>
          <div style={{
            padding: 'var(--space-1) var(--space-4)',
            fontSize: '0.5625rem', fontWeight: 600, color: 'var(--text-disabled)',
            textTransform: 'uppercase', letterSpacing: '0.03rem',
            background: 'var(--hover-bg)',
          }}>
            Pinned
          </div>
          {pinnedViews.map(v => renderView(v))}
        </>
      )}

      {/* All views */}
      {views.length === 0 ? (
        <div style={{
          padding: 'var(--space-5)', textAlign: 'center',
          color: 'var(--text-disabled)', fontSize: 'var(--text-xs)',
        }}>
          <Bookmark size={20} style={{ margin: '0 auto var(--space-2)', opacity: 0.3 }} />
          <div>No saved views yet</div>
          <div style={{ fontSize: 'var(--text-2xs)', marginTop: '0.25rem' }}>
            Save your current view configuration for quick access
          </div>
        </div>
      ) : (
        <div>
          {views.filter(v => !v.pinned).length > 0 && pinnedViews.length > 0 && (
            <div style={{
              padding: 'var(--space-1) var(--space-4)',
              fontSize: '0.5625rem', fontWeight: 600, color: 'var(--text-disabled)',
              textTransform: 'uppercase', letterSpacing: '0.03rem',
              background: 'var(--hover-bg)',
            }}>
              All Views
            </div>
          )}
          {views.filter(v => !v.pinned).map(v => renderView(v))}
        </div>
      )}
    </div>
  )

  function renderView(v) {
    const isEditing = editingId === v.id

    return (
      <div
        key={v.id}
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-4)',
          borderBottom: '0.0625rem solid var(--border-subtle)',
          transition: 'background 100ms',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
              <input
                value={editLabel}
                onChange={e => setEditLabel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleRename(v.id); if (e.key === 'Escape') setEditingId(null) }}
                autoFocus
                style={{
                  flex: 1, padding: '0.125rem var(--space-1)',
                  fontSize: 'var(--text-xs)', border: '0.0625rem solid var(--accent)',
                  borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)',
                  color: 'var(--text-primary)', outline: 'none',
                }}
              />
              <button onClick={() => handleRename(v.id)} style={btnStyle}><Check size={12} style={{ color: 'var(--color-success)' }} /></button>
              <button onClick={() => setEditingId(null)} style={btnStyle}><X size={12} /></button>
            </div>
          ) : (
            <>
              <div
                onClick={() => onLoadView && onLoadView(v)}
                style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                {v.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginTop: '0.125rem' }}>
                <span style={{ fontSize: '0.5rem', color: 'var(--text-disabled)' }}>
                  {v.view}
                </span>
                {v.shared && (
                  <Share2 size={8} style={{ color: 'var(--accent)' }} title="Shared" />
                )}
                <span style={{ fontSize: '0.5rem', color: 'var(--text-disabled)' }}>
                  {v.createdByName}
                </span>
              </div>
            </>
          )}
        </div>

        {!isEditing && (
          <div style={{ display: 'flex', gap: '0.125rem', flexShrink: 0 }}>
            <button onClick={() => onLoadView && onLoadView(v)} style={btnStyle} title="Load view">
              <ExternalLink size={11} />
            </button>
            <button onClick={() => togglePin(v.id)} style={btnStyle} title={v.pinned ? 'Unpin' : 'Pin'}>
              {v.pinned ? <PinOff size={11} /> : <Pin size={11} />}
            </button>
            <button onClick={() => toggleShare(v.id)} style={btnStyle} title={v.shared ? 'Make private' : 'Share'}>
              {v.shared ? <Lock size={11} /> : <Share2 size={11} />}
            </button>
            <button onClick={() => { setEditingId(v.id); setEditLabel(v.label) }} style={btnStyle} title="Rename">
              <Pencil size={11} />
            </button>
            <button onClick={() => duplicateView(v.id)} style={btnStyle} title="Duplicate">
              <Copy size={11} />
            </button>
            <button onClick={() => deleteView(v.id)} style={{ ...btnStyle, color: 'var(--color-error)' }} title="Delete">
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>
    )
  }
}

export default memo(SavedViewsPanel)
