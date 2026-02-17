import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react'

/* ── Placeholder stat card ── */
function PlaceholderCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{
          width: '2rem', height: '2rem', borderRadius: '0.5rem',
          background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700,
          color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06rem',
        }}>{label}</span>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          {value}
        </div>
      </div>
    </div>
  )
}

export default function AdminRevenue() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Revenue
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
          Revenue tracking and subscription management
        </p>
      </div>

      {/* Placeholder stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))', gap: '1rem' }}>
        <PlaceholderCard icon={DollarSign} label="MRR" value="$0" color="#10B981" />
        <PlaceholderCard icon={TrendingUp} label="Growth" value="—" color="#3B82F6" />
        <PlaceholderCard icon={Users} label="Paid Users" value="0" color="#8B5CF6" />
        <PlaceholderCard icon={CreditCard} label="Subscriptions" value="0" color="#FF6B35" />
      </div>

      {/* Coming soon */}
      <div className="card" style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <div style={{
          width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
          background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <DollarSign size={24} style={{ color: '#10B981' }} />
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
            Revenue Dashboard Coming Soon
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', lineHeight: 1.6, maxWidth: '28rem' }}>
            This section will track MRR, subscription management, payment history, and revenue analytics once a payment system is integrated (Stripe, LemonSqueezy, etc.).
          </p>
        </div>
      </div>
    </div>
  )
}
