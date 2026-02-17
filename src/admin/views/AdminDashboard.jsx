import { Shield, Users, FolderKanban, Activity, TrendingUp } from 'lucide-react'

function StatCard({ icon: Icon, label, value, sublabel, color }) {
  return (
    <div className="card" style={{
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '0.5rem',
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          fontWeight: 700,
          color: 'var(--text-disabled)',
          textTransform: 'uppercase',
          letterSpacing: '0.06rem',
        }}>
          {label}
        </span>
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.25rem',
        }}>
          {value}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          {sublabel}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard({ user }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
        }}>
          Welcome, {user?.displayName || 'Admin'}
        </h2>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-tertiary)',
          lineHeight: 1.6,
        }}>
          This is your platform admin dashboard. From here you can manage all users, projects, activity, revenue, and platform settings.
        </p>
      </div>

      {/* Stat cards (placeholder values) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
        gap: '1rem',
      }}>
        <StatCard
          icon={Users}
          label="Total Users"
          value="\u2014"
          sublabel="Coming in Feature 2"
          color="var(--color-phase-1)"
        />
        <StatCard
          icon={FolderKanban}
          label="Total Projects"
          value="\u2014"
          sublabel="Coming in Feature 2"
          color="var(--color-phase-3)"
        />
        <StatCard
          icon={Activity}
          label="Activity (7d)"
          value="\u2014"
          sublabel="Coming in Feature 2"
          color="var(--color-phase-4)"
        />
        <StatCard
          icon={TrendingUp}
          label="MRR"
          value="\u2014"
          sublabel="Coming in Feature 6"
          color="var(--color-phase-5)"
        />
      </div>

      {/* Placeholder */}
      <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <Shield size={40} style={{ color: 'var(--text-disabled)', margin: '0 auto 1rem' }} />
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.9375rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
        }}>
          Admin Panel Active
        </h3>
        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--text-tertiary)',
          lineHeight: 1.6,
          maxWidth: '32rem',
          margin: '0 auto',
        }}>
          The admin shell is ready. Real-time stats, user management, project management, activity log, revenue tracking, analytics, and platform settings will be built next.
        </p>
      </div>
    </div>
  )
}
