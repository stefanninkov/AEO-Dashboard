/**
 * usePipeline — Stage transitions, grouping, and pipeline stats.
 *
 * Accepts the leads array from the parent and provides:
 * - leadsByStage: leads grouped by pipelineStage (for Kanban columns)
 * - moveToStage: update pipelineStage + stageHistory + log activity
 * - stageStats: count per stage, avg days, stale leads, conversion rate
 */
import { useCallback, useMemo } from 'react'
import {
  doc, updateDoc, arrayUnion, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../firebase'
import { logStageChange } from '../utils/activityService'
import { PIPELINE_STAGES, OFF_PIPELINE_STAGES, ALL_STAGES } from '../constants/pipelineStages'

const isFirebaseConfigured = !!db

/** Days between two dates */
function daysBetween(a, b) {
  if (!a || !b) return 0
  const msA = a instanceof Date ? a.getTime() : a.toDate?.()?.getTime?.() || new Date(a).getTime()
  const msB = b instanceof Date ? b.getTime() : b.toDate?.()?.getTime?.() || new Date(b).getTime()
  return Math.max(0, Math.round(Math.abs(msB - msA) / (1000 * 60 * 60 * 24)))
}

export function usePipeline(leads = []) {
  // ── Group leads by pipeline stage ──
  const leadsByStage = useMemo(() => {
    const grouped = {}
    ALL_STAGES.forEach((s) => { grouped[s.id] = [] })

    leads.forEach((lead) => {
      const stage = lead.pipelineStage || 'new'
      if (!grouped[stage]) grouped[stage] = []
      grouped[stage].push(lead)
    })

    // Sort within each column: hot leads first, then by days in stage (oldest first)
    Object.keys(grouped).forEach((stageId) => {
      grouped[stageId].sort((a, b) => {
        // Hot leads (tier) first
        const tierOrder = { hot: 0, warm: 1, cold: 2 }
        const aTier = tierOrder[a.leadTier] ?? 3
        const bTier = tierOrder[b.leadTier] ?? 3
        if (aTier !== bTier) return aTier - bTier

        // Then by how long they've been in this stage (oldest first)
        const aDate = a.stageChangedAt?.toDate?.()?.getTime?.() ||
          (a.stageChangedAt ? new Date(a.stageChangedAt).getTime() : 0)
        const bDate = b.stageChangedAt?.toDate?.()?.getTime?.() ||
          (b.stageChangedAt ? new Date(b.stageChangedAt).getTime() : 0)
        return aDate - bDate
      })
    })

    return grouped
  }, [leads])

  // ── Move a lead to a new pipeline stage ──
  const moveToStage = useCallback(async (leadId, fromStage, toStage) => {
    if (!isFirebaseConfigured || !leadId || fromStage === toStage) return
    try {
      await updateDoc(doc(db, 'waitlist', leadId), {
        pipelineStage: toStage,
        stageChangedAt: serverTimestamp(),
        stageHistory: arrayUnion({
          from: fromStage,
          to: toStage,
          changedAt: new Date().toISOString(),
          changedBy: 'admin',
        }),
      })
      await logStageChange(leadId, fromStage, toStage)
    } catch (err) {
      console.error('moveToStage error:', err)
    }
  }, [])

  // ── Pipeline statistics ──
  const stageStats = useMemo(() => {
    const now = new Date()
    const stats = {}

    ALL_STAGES.forEach((stage) => {
      const stageLeads = leadsByStage[stage.id] || []
      const daysInStage = stageLeads.map((l) => {
        const changedAt = l.stageChangedAt?.toDate?.() ||
          (l.stageChangedAt ? new Date(l.stageChangedAt) : l.signedUpAt?.toDate?.() || new Date())
        return daysBetween(changedAt, now)
      })

      const avgDays = daysInStage.length > 0
        ? Math.round(daysInStage.reduce((s, d) => s + d, 0) / daysInStage.length)
        : 0

      // Stale: no activity in 14+ days
      const staleLeads = stageLeads.filter((l) => {
        const lastAct = l.lastActivityAt?.toDate?.() ||
          (l.lastActivityAt ? new Date(l.lastActivityAt) : null)
        return lastAct ? daysBetween(lastAct, now) >= 14 : true
      })

      stats[stage.id] = {
        count: stageLeads.length,
        avgDays,
        staleCount: staleLeads.length,
      }
    })

    // Conversion rate: new → paying
    const totalNew = leads.length || 1
    const totalPaying = (leadsByStage.paying || []).length
    stats._conversionRate = Math.round((totalPaying / totalNew) * 100)

    // Pipeline total (main stages only, not off-pipeline)
    stats._pipelineTotal = PIPELINE_STAGES.reduce(
      (sum, s) => sum + (leadsByStage[s.id] || []).length, 0,
    )

    // Off-pipeline total
    stats._offPipelineTotal = OFF_PIPELINE_STAGES.reduce(
      (sum, s) => sum + (leadsByStage[s.id] || []).length, 0,
    )

    // Avg days to first contact (from new → contacted/engaged/invited)
    const contactedLeads = leads.filter((l) =>
      l.pipelineStage && l.pipelineStage !== 'new' && l.stageHistory?.length > 0)
    if (contactedLeads.length > 0) {
      const totalDays = contactedLeads.reduce((sum, l) => {
        const firstMove = l.stageHistory[0]
        if (!firstMove?.changedAt) return sum
        const signedUp = l.signedUpAt?.toDate?.() ||
          (l.signedUpAt ? new Date(l.signedUpAt) : new Date())
        return sum + daysBetween(signedUp, new Date(firstMove.changedAt))
      }, 0)
      stats._avgDaysToContact = Math.round(totalDays / contactedLeads.length)
    } else {
      stats._avgDaysToContact = 0
    }

    return stats
  }, [leads, leadsByStage])

  return { leadsByStage, moveToStage, stageStats }
}
