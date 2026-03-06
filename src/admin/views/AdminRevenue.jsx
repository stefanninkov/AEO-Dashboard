import { useState, useMemo } from 'react'
import { DollarSign, TrendingUp, Users, CreditCard, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import StatCard from '../../views/dashboard/StatCard'
import { AeoFunnelChart, WaterfallChart } from '../../components/charts'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts'

/* ── Demo data (replace with real Stripe/payment data when integrated) ── */
const DEMO_MRR_TREND = [
  { month: 'Sep', mrr: 0 },
  { month: 'Oct', mrr: 290 },
  { month: 'Nov', mrr: 580 },
  { month: 'Dec', mrr: 870 },
  { month: 'Jan', mrr: 1450 },
  { month: 'Feb', mrr: 2320 },
  { month: 'Mar', mrr: 3190 },
]

const DEMO_PLAN_DIST = [
  { name: 'Free', users: 142, color: '#6B7280' },
  { name: 'Starter', users: 38, color: '#3B82F6' },
  { name: 'Pro', users: 22, color: '#8B5CF6' },
  { name: 'Enterprise', users: 5, color: '#10B981' },
]

const DEMO_REVENUE_BREAKDOWN = [
  { name: 'Starter Plans', value: 1140, color: '#3B82F6' },
  { name: 'Pro Plans', value: 1540, color: '#8B5CF6' },
  { name: 'Enterprise', value: 2500, color: '#10B981' },
  { name: 'Refunds', value: -190, color: '#EF4444' },
  { name: 'Discounts', value: -300, color: '#F59E0B' },
]

const DEMO_CHURN_RATE = [
  { month: 'Sep', rate: 0 },
  { month: 'Oct', rate: 8.2 },
  { month: 'Nov', rate: 6.5 },
  { month: 'Dec', rate: 5.1 },
  { month: 'Jan', rate: 4.8 },
  { month: 'Feb', rate: 3.9 },
  { month: 'Mar', rate: 3.2 },
]

const DEMO_CONVERSION_FUNNEL = [
  { name: 'Free Users', value: 142 },
  { name: 'Trial Started', value: 68 },
  { name: 'Trial Active', value: 45 },
  { name: 'Converted to Paid', value: 27 },
  { name: 'Active 30d+', value: 22 },
]

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.0625rem solid var(--border-default)',
      borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem',
      boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ color: 'var(--text-tertiary)', marginBottom: '0.25rem', fontWeight: 600 }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || entry.fill, fontWeight: 500 }}>
          {entry.name}: {typeof entry.value === 'number' && entry.name !== 'Churn %'
            ? `$${entry.value.toLocaleString()}`
            : `${entry.value}%`
          }
        </p>
      ))}
    </div>
  )
}

export default function AdminRevenue() {
  const [isDemo] = useState(true) // Will switch to false when real payment data connected

  const currentMrr = DEMO_MRR_TREND[DEMO_MRR_TREND.length - 1].mrr
  const prevMrr = DEMO_MRR_TREND[DEMO_MRR_TREND.length - 2].mrr
  const mrrGrowth = prevMrr > 0 ? Math.round(((currentMrr - prevMrr) / prevMrr) * 100) : 0
  const totalPaid = DEMO_PLAN_DIST.filter(p => p.name !== 'Free').reduce((s, p) => s + p.users, 0)
  const avgRevPerUser = totalPaid > 0 ? Math.round(currentMrr / totalPaid) : 0

  return (
    <div className="view-wrapper">
      <div className="view-header">
        <div className="view-header-text">
          <h2 className="view-title">Revenue</h2>
          <p className="view-subtitle">
            Revenue tracking, subscription metrics, and conversion analytics
          </p>
        </div>
        {isDemo && (
          <span style={{
            fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
            padding: '0.25rem 0.5rem', borderRadius: '0.25rem',
            background: 'color-mix(in srgb, var(--color-warning) 15%, transparent)',
            color: 'var(--color-warning)', letterSpacing: '0.04rem',
          }}>
            Demo Data
          </span>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid-stats">
        <StatCard
          icon={<DollarSign size={16} />}
          iconColor="#10B981"
          label="MRR"
          value={`$${currentMrr.toLocaleString()}`}
          trend={mrrGrowth > 0 ? `+${mrrGrowth}%` : `${mrrGrowth}%`}
          trendUp={mrrGrowth > 0}
        />
        <StatCard icon={<TrendingUp size={16} />} iconColor="#3B82F6" label="Avg Revenue/User" value={`$${avgRevPerUser}`} />
        <StatCard icon={<Users size={16} />} iconColor="#8B5CF6" label="Paid Users" value={totalPaid.toString()} />
        <StatCard icon={<CreditCard size={16} />} iconColor="#2563EB" label="Churn Rate" value={`${DEMO_CHURN_RATE[DEMO_CHURN_RATE.length - 1].rate}%`} />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1rem' }}>
        {/* MRR Trend */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700,
            color: 'var(--text-disabled)', textTransform: 'uppercase',
            letterSpacing: '0.04rem', marginBottom: '1rem',
          }}>
            Monthly Recurring Revenue
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={DEMO_MRR_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" tick={{ fontSize: '0.625rem', fill: 'var(--text-tertiary)' }} />
              <YAxis tick={{ fontSize: '0.625rem', fill: 'var(--text-tertiary)' }} tickFormatter={v => `$${v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="mrr" name="MRR" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Churn Rate Trend */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700,
            color: 'var(--text-disabled)', textTransform: 'uppercase',
            letterSpacing: '0.04rem', marginBottom: '1rem',
          }}>
            Churn Rate Trend
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={DEMO_CHURN_RATE}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" tick={{ fontSize: '0.625rem', fill: 'var(--text-tertiary)' }} />
              <YAxis tick={{ fontSize: '0.625rem', fill: 'var(--text-tertiary)' }} tickFormatter={v => `${v}%`} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="rate" name="Churn %" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700,
            color: 'var(--text-disabled)', textTransform: 'uppercase',
            letterSpacing: '0.04rem', marginBottom: '1rem',
          }}>
            Subscription Distribution
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DEMO_PLAN_DIST} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" tick={{ fontSize: '0.625rem', fill: 'var(--text-tertiary)' }} />
              <YAxis tick={{ fontSize: '0.625rem', fill: 'var(--text-tertiary)' }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="users" name="Users" radius={[4, 4, 0, 0]}>
                {DEMO_PLAN_DIST.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Funnel */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700,
            color: 'var(--text-disabled)', textTransform: 'uppercase',
            letterSpacing: '0.04rem', marginBottom: '1rem',
          }}>
            Free → Paid Conversion Funnel
          </div>
          <AeoFunnelChart data={DEMO_CONVERSION_FUNNEL} height={200} />
        </div>
      </div>

      {/* Revenue Breakdown (Waterfall) */}
      <div className="card" style={{ padding: '1.25rem', marginTop: '1rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700,
          color: 'var(--text-disabled)', textTransform: 'uppercase',
          letterSpacing: '0.04rem', marginBottom: '1rem',
        }}>
          Revenue Breakdown
        </div>
        <WaterfallChart
          data={DEMO_REVENUE_BREAKDOWN}
          height={200}
        />
      </div>
    </div>
  )
}
