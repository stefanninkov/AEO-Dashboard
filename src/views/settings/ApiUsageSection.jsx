/**
 * ApiUsageSection — Provider selector, API key management, model selection, and usage dashboard.
 */
import { useState, useCallback } from 'react'
import { Key, Eye, EyeOff, Save, Check, AlertTriangle, BarChart3, Zap, Cpu, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  getActiveProvider, setActiveProvider, getProviderConfig, getAllProviders,
  getApiKey, setApiKey as setProviderApiKey, hasApiKey, getModel, setModel,
} from '../../utils/aiProvider'
import { useUsageStats } from '../../hooks/useUsageStats'
import { resetUsage, formatTokens, formatCost } from '../../utils/usageTracker'
import {
  sectionTitleStyle, settingsRowStyle, lastRowStyle, labelStyle,
  inlineSaveBtnStyle, smallSelectStyle, flash,
} from './SettingsShared'

export default function ApiUsageSection() {
  const { t } = useTranslation('app')

  // Provider state
  const [activeProviderId, setActiveProviderId] = useState(getActiveProvider)
  const providers = getAllProviders()
  const activeConfig = getProviderConfig(activeProviderId)

  // API key state (per provider)
  const [apiKeyValue, setApiKeyValue] = useState(() => getApiKey(activeProviderId))
  const [showKey, setShowKey] = useState(false)
  const [keySaved, setKeySaved] = useState(false)

  // Model state
  const [selectedModel, setSelectedModel] = useState(() => getModel(activeProviderId))

  // Usage stats
  const { today, thisWeek, thisMonth, history, refresh } = useUsageStats(30000)

  // Handlers
  const handleProviderChange = useCallback((providerId) => {
    setActiveProvider(providerId)
    setActiveProviderId(providerId)
    setApiKeyValue(getApiKey(providerId))
    setSelectedModel(getModel(providerId))
    setShowKey(false)
  }, [])

  const handleSaveKey = useCallback(() => {
    setProviderApiKey(activeProviderId, apiKeyValue)
    flash(setKeySaved)
  }, [activeProviderId, apiKeyValue])

  const handleModelChange = useCallback((modelId) => {
    setModel(activeProviderId, modelId)
    setSelectedModel(modelId)
  }, [activeProviderId])

  const handleResetUsage = useCallback(() => {
    if (window.confirm('Reset all usage data? This cannot be undone.')) {
      resetUsage()
      refresh()
    }
  }, [refresh])

  const keyExists = apiKeyValue.trim().length > 0

  // Usage chart - max bar height
  const maxCalls = Math.max(1, ...history.map(d => d.calls))

  return (
    <>
      {/* ── Provider Selector ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><Cpu size={15} /> AI Provider</div>

        <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.5rem' }}>
          {providers.map(provider => {
            const isActive = activeProviderId === provider.id
            return (
              <button
                key={provider.id}
                onClick={() => handleProviderChange(provider.id)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '0.625rem',
                  border: `1.5px solid ${isActive ? 'var(--color-phase-1)' : 'var(--border-subtle)'}`,
                  background: isActive ? 'rgba(99,102,241,0.06)' : 'var(--bg-input)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem',
                }}>
                  <div style={{
                    width: '0.5rem', height: '0.5rem', borderRadius: '50%',
                    background: isActive ? 'var(--color-phase-1)' : 'var(--border-default)',
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-heading)', fontSize: '0.8125rem',
                    fontWeight: isActive ? 700 : 500, color: 'var(--text-primary)',
                  }}>
                    {provider.name}
                  </span>
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                  {provider.models.length} models available
                </span>
              </button>
            )
          })}
        </div>

        {/* Web search warning for OpenAI */}
        {!activeConfig.supportsWebSearch && (
          <div style={{
            margin: '0 1.25rem 1rem',
            padding: '0.625rem 0.875rem',
            borderRadius: '0.5rem',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.15)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
          }}>
            <AlertTriangle size={14} style={{ color: 'var(--color-warning)', marginTop: '0.125rem', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              Web search is only available with Anthropic. Some features (like real-time analysis) will use the AI's training data instead of live web results.
            </span>
          </div>
        )}
      </div>

      {/* ── API Key ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><Key size={15} /> {activeConfig.name} API Key</div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>API Key</span>
          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                className="input-field"
                type={showKey ? 'text' : 'password'}
                value={apiKeyValue}
                onChange={(e) => setApiKeyValue(e.target.value)}
                placeholder={activeConfig.keyPlaceholder}
                aria-label={`${activeConfig.name} API key`}
                style={{ width: '100%', paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
                style={{
                  position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-tertiary)', padding: '0.25rem', display: 'flex', alignItems: 'center',
                }}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button className="btn-primary" style={inlineSaveBtnStyle} onClick={handleSaveKey}>
              {keySaved ? <Check size={13} /> : <Save size={13} />}
              {keySaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Status</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '0.5rem', height: '0.5rem', borderRadius: '50%',
              background: keyExists ? 'var(--color-success)' : 'var(--text-disabled)',
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: '0.8125rem',
              color: keyExists ? 'var(--color-success)' : 'var(--text-tertiary)',
            }}>
              {keyExists ? 'Connected' : 'Not set'}
            </span>
          </div>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Model</span>
          <select
            style={smallSelectStyle}
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            aria-label="AI Model"
          >
            {activeConfig.models.map(m => (
              <option key={m.id} value={m.id}>
                {m.label}{m.fast ? ' (Fast)' : m.default ? ' (Default)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div style={lastRowStyle}>
          <span style={labelStyle} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            Your API key is stored locally in your browser and never sent to our servers.
          </span>
        </div>
      </div>

      {/* ── Usage Dashboard ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><BarChart3 size={15} /> Usage Overview</div>

        {/* Summary cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem',
          padding: '1rem 1.25rem',
        }}>
          {[
            { label: 'Today', data: today },
            { label: 'This Week', data: thisWeek },
            { label: 'This Month', data: thisMonth },
          ].map(({ label, data }) => (
            <div key={label} style={{
              padding: '0.875rem',
              borderRadius: '0.625rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                fontSize: '0.6875rem', color: 'var(--text-tertiary)',
                fontWeight: 500, marginBottom: '0.5rem', textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {label}
              </div>
              <div style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.125rem',
                fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem',
              }}>
                {data.calls} <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>calls</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                <span>{formatTokens(data.inputTokens)} in</span>
                <span>{formatTokens(data.outputTokens)} out</span>
              </div>
              <div style={{
                fontSize: '0.75rem', fontWeight: 600,
                color: data.costEstimate > 0 ? 'var(--color-phase-1)' : 'var(--text-disabled)',
                marginTop: '0.375rem',
              }}>
                {formatCost(data.costEstimate)}
              </div>
            </div>
          ))}
        </div>

        {/* 30-day trend chart */}
        <div style={{ padding: '0 1.25rem 1rem' }}>
          <div style={{
            fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500,
            marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            Last 30 Days
          </div>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: '2px',
            height: '4rem', padding: '0',
          }}>
            {history.map((day, i) => {
              const height = maxCalls > 0 ? Math.max(2, (day.calls / maxCalls) * 100) : 2
              const dateLabel = day.date?.slice(5) || '' // MM-DD
              return (
                <div
                  key={i}
                  title={`${day.date}: ${day.calls} calls, ${formatCost(day.costEstimate)}`}
                  style={{
                    flex: 1,
                    height: `${height}%`,
                    background: day.calls > 0 ? 'var(--color-phase-1)' : 'var(--border-subtle)',
                    borderRadius: '2px 2px 0 0',
                    transition: 'height 0.2s ease',
                    opacity: day.calls > 0 ? 1 : 0.3,
                    cursor: 'default',
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Per-model breakdown */}
        {Object.keys(thisMonth.byModel || {}).length > 0 && (
          <div style={{ padding: '0 1.25rem 1rem' }}>
            <div style={{
              fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500,
              marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              By Model (This Month)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {Object.entries(thisMonth.byModel).map(([model, data]) => (
                <div key={model} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                  background: 'var(--bg-input)',
                  fontSize: '0.75rem',
                }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', flex: 1, minWidth: 0 }}>
                    {model}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)' }}>{data.calls} calls</span>
                  <span style={{ color: 'var(--text-tertiary)' }}>{formatTokens(data.inputTokens + data.outputTokens)} tokens</span>
                  <span style={{ color: 'var(--color-phase-1)', fontWeight: 600 }}>{formatCost(data.costEstimate)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset button */}
        <div style={lastRowStyle}>
          <span style={labelStyle} />
          <button
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }}
            onClick={handleResetUsage}
          >
            <Trash2 size={12} /> Reset Usage Data
          </button>
        </div>
      </div>
    </>
  )
}
