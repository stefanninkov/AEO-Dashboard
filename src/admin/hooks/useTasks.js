/**
 * useTasks — CRUD + computed views for follow-up tasks.
 *
 * Tasks live at admin/tasks/{taskId} (centralized collection).
 * Each task is linked to a lead via leadId.
 */
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  collection, addDoc, onSnapshot, query, orderBy,
  doc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../firebase'
import { logTaskEvent } from '../utils/activityService'

const isFirebaseConfigured = !!db

/** Normalize a Date to midnight for day comparisons */
function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  // ── Real-time listener ──
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    const ref = collection(db, 'admin', 'tasks', 'items')
    const q = query(ref, orderBy('dueDate', 'asc'))

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        dueDate: d.data().dueDate?.toDate?.() || null,
        completedAt: d.data().completedAt?.toDate?.() || null,
        createdAt: d.data().createdAt?.toDate?.() || new Date(),
      }))
      setTasks(items)
      setLoading(false)
    }, (err) => {
      console.error('useTasks listener error:', err)
      setLoading(false)
    })

    return () => unsub()
  }, [])

  // ── Create a task ──
  const createTask = useCallback(async ({
    leadId, leadName, leadEmail, title, dueDate, priority = 'medium', notes = '',
  }) => {
    if (!isFirebaseConfigured) return null
    try {
      const ref = collection(db, 'admin', 'tasks', 'items')
      const docRef = await addDoc(ref, {
        leadId: leadId || null,
        leadName: leadName || '',
        leadEmail: leadEmail || '',
        title,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        notes,
        completed: false,
        completedAt: null,
        createdAt: serverTimestamp(),
      })
      if (leadId) {
        await logTaskEvent(leadId, title, 'created')
      }
      return docRef.id
    } catch (err) {
      console.error('createTask error:', err)
      return null
    }
  }, [])

  // ── Complete a task ──
  const completeTask = useCallback(async (taskId) => {
    if (!isFirebaseConfigured || !taskId) return
    const task = tasks.find((t) => t.id === taskId)
    try {
      await updateDoc(doc(db, 'admin', 'tasks', 'items', taskId), {
        completed: true,
        completedAt: serverTimestamp(),
      })
      if (task?.leadId) {
        await logTaskEvent(task.leadId, task.title, 'completed')
      }
    } catch (err) {
      console.error('completeTask error:', err)
    }
  }, [tasks])

  // ── Uncomplete a task (undo) ──
  const uncompleteTask = useCallback(async (taskId) => {
    if (!isFirebaseConfigured || !taskId) return
    try {
      await updateDoc(doc(db, 'admin', 'tasks', 'items', taskId), {
        completed: false,
        completedAt: null,
      })
    } catch (err) {
      console.error('uncompleteTask error:', err)
    }
  }, [])

  // ── Delete a task ──
  const deleteTask = useCallback(async (taskId) => {
    if (!isFirebaseConfigured || !taskId) return
    try {
      await deleteDoc(doc(db, 'admin', 'tasks', 'items', taskId))
    } catch (err) {
      console.error('deleteTask error:', err)
    }
  }, [])

  // ── Get tasks for a specific lead ──
  const getTasksForLead = useCallback((leadId) => {
    return tasks.filter((t) => t.leadId === leadId)
  }, [tasks])

  // ── Computed task groups ──
  const today = startOfDay(new Date())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const overdueTasks = useMemo(() =>
    tasks.filter((t) => !t.completed && t.dueDate && startOfDay(t.dueDate) < today),
  [tasks, today.getTime()])

  const todayTasks = useMemo(() =>
    tasks.filter((t) => !t.completed && t.dueDate &&
      startOfDay(t.dueDate).getTime() === today.getTime()),
  [tasks, today.getTime()])

  const upcomingTasks = useMemo(() =>
    tasks.filter((t) => !t.completed && t.dueDate &&
      startOfDay(t.dueDate) > today &&
      startOfDay(t.dueDate) <= nextWeek),
  [tasks, today.getTime(), nextWeek.getTime()])

  const unscheduledTasks = useMemo(() =>
    tasks.filter((t) => !t.completed && !t.dueDate),
  [tasks])

  const completedTasks = useMemo(() =>
    tasks.filter((t) => t.completed).sort((a, b) =>
      (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0)),
  [tasks])

  const activeTasks = useMemo(() =>
    tasks.filter((t) => !t.completed),
  [tasks])

  return {
    tasks, loading,
    createTask, completeTask, uncompleteTask, deleteTask,
    getTasksForLead,
    overdueTasks, todayTasks, upcomingTasks, unscheduledTasks,
    completedTasks, activeTasks,
  }
}
