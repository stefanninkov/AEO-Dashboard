import { memo } from 'react'
import {
  CheckCircle2, AlertTriangle, XCircle, Info,
  Cpu, HardDrive, Globe, Clock, Users, Database, Layers,
} from 'lucide-react'
import { useHealthMonitor } from '../hooks/useHealthMonitor'

const STATUS_CONFIG = {
  healthy: { icon: CheckCircle2, color: 'var(--color-success)', label: 'Healthy' },
  warning: { icon: AlertTriangle, color: 'var(--color-warning)', label: 'Warning' },
  error:   { icon: XCircle,      color: 'var(--color-error)',   label: 'Error' },
  info:    { icon: Info,          color: 'var(--text-disabled)', label: 'No Data' },
}

function HealthDashboard({ activeProject, projects = [] }) {
  const { perfMetrics, dataHealth, systemStatus, portfolioHealth } = useHealthMonitor({ activeProject, projects })

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-header-text">
          <h1 className="view-title">System Health</h1>
        </div>
        <span style={{
          fontSize: 'var(--text-2xs)', fontWeight: 600, color: systemStatus.color,
          background: `color-mix(in srgb, ${systemStatus.color} 10%, transparent)`,
          padding: '0.125rem var(--space-2)', borderRadius: 'var(--radius-full)',
        }}>
          {systemStatus.label}
        </span>
      </div>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', margin: '0 0 var(--space-5)' }}>
        Application performance, data health, and system status
      </p>

      {/* Performance metrics */}
      {perfMetrics && (
        <>
          <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <Cpu size={14} style={{ color: 'var(--accent)' }} />
            Performance Metrics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
            <MetricCard label="Page Load" value={perfMetrics.pageLoadTime ? `${perfMetrics.pageLoadTime}ms` : '—'} icon={Clock} status={perfMetrics.pageLoadTime < 3000 ? 'good' : 'warn'} />
            <MetricCard label="DOM Ready" value={perfMetrics.domContentLoaded ? `${perfMetrics.domContentLoaded}ms` : '—'} icon={Globe} status={perfMetrics.domContentLoaded < 1500 ? 'good' : 'warn'} />
            <MetricCard label="First Paint" value={perfMetrics.firstContentfulPaint ? `${perfMetrics.firstContentfulPaint}ms` : '—'} icon={Layers} status={perfMetrics.firstContentfulPaint < 1800 ? 'good' : 'warn'} />
            <MetricCard label="JS Heap" value={perfMetrics.jsHeapSize ? `${perfMetrics.jsHeapSize}MB` : '—'} icon={HardDrive} status={perfMetrics.jsHeapSize && perfMetrics.jsHeapLimit ? (perfMetrics.jsHeapSize / perfMetrics.jsHeapLimit < 0.7 ? 'good' : 'warn') : 'good'} />
            <MetricCard label="Resources" value={perfMetrics.resourceCount} icon={Database} status="good" />
            <MetricCard label="Transfer Size" value={perfMetrics.totalTransferSize ? `${Math.round(perfMetrics.totalTransferSize / 1024)}KB` : '—'} icon={Globe} status="good" />
          </div>
        </>
      )}

      {/* Data health checks */}
      <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
        <Database size={14} style={{ color: 'var(--accent)' }} />
        Data Health
      </h2>
      <div style={{
        background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-5)',
      }}>
        {dataHealth.map((check, i) => {
          const cfg = STATUS_CONFIG[check.status]
          const Icon = cfg.icon
          return (
            <div key={check.id} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              borderBottom: i < dataHealth.length - 1 ? '0.0625rem solid var(--border-subtle)' : 'none',
            }}>
              <div style={{
                width: '1.75rem', height: '1.75rem', borderRadius: '50%', flexShrink: 0,
                background: `color-mix(in srgb, ${cfg.color} 12%, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={13} style={{ color: cfg.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {check.label}
                </div>
                <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>
                  {check.detail}
                </div>
              </div>
              {check.freshness && (
                <span style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)', flexShrink: 0 }}>
                  {check.freshness}
                </span>
              )}
              <span style={{
                fontSize: '0.5625rem', fontWeight: 600, color: cfg.color,
                background: `color-mix(in srgb, ${cfg.color} 8%, transparent)`,
                padding: '0.0625rem var(--space-1)', borderRadius: 'var(--radius-sm)',
              }}>
                {cfg.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Portfolio overview */}
      <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
        <Users size={14} style={{ color: 'var(--accent)' }} />
        Portfolio Overview
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))', gap: 'var(--space-3)' }}>
        <SummaryCard label="Projects" value={portfolioHealth.totalProjects} />
        <SummaryCard label="With URL" value={portfolioHealth.projectsWithUrl} />
        <SummaryCard label="Monitored" value={portfolioHealth.projectsWithMonitoring} />
        <SummaryCard label="Data Points" value={portfolioHealth.totalDataPoints.toLocaleString()} />
        <SummaryCard label="Team Members" value={portfolioHealth.totalMembers} />
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon: Icon, status }) {
  const color = status === 'warn' ? 'var(--color-warning)' : 'var(--color-success)'
  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', textAlign: 'center',
    }}>
      <Icon size={14} style={{ color: 'var(--text-disabled)', marginBottom: 'var(--space-1)' }} />
      <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)' }}>{label}</div>
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', textAlign: 'center',
    }}>
      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)' }}>{label}</div>
    </div>
  )
}

export default memo(HealthDashboard)
