import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react'
import StatCard from '../../views/dashboard/StatCard'
import EmptyState from '../../components/EmptyState'

export default function AdminRevenue() {
  return (
    <div className="view-wrapper">
      <div className="view-header">
        <div className="view-header-text">
          <h2 className="view-title">Revenue</h2>
          <p className="view-subtitle">
            Revenue tracking and subscription management
          </p>
        </div>
      </div>

      {/* Placeholder stats */}
      <div className="grid-stats">
        <StatCard icon={<DollarSign size={16} />} iconColor="#10B981" label="MRR" value="$0" />
        <StatCard icon={<TrendingUp size={16} />} iconColor="#3B82F6" label="Growth" value="—" />
        <StatCard icon={<Users size={16} />} iconColor="#8B5CF6" label="Paid Users" value="0" />
        <StatCard icon={<CreditCard size={16} />} iconColor="#2563EB" label="Subscriptions" value="0" />
      </div>

      {/* Coming soon */}
      <EmptyState
        icon={DollarSign}
        title="Revenue Dashboard Coming Soon"
        description="This section will track MRR, subscription management, payment history, and revenue analytics once a payment system is integrated (Stripe, LemonSqueezy, etc.)."
        color="var(--color-success)"
      />
    </div>
  )
}
