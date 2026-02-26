/**
 * useBulkEmail — Custom template CRUD, send history, CSV generation.
 *
 * Custom templates stored in Firestore: admin/emailTemplates/custom/{id}
 * Send history stored in: admin/bulkEmails/{batchId}
 */
import { useState, useEffect, useCallback } from 'react'
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db } from '../../firebase'
import { fillTemplate, buildLeadVariables } from '../constants/emailTemplates'
import logger from '../../utils/logger'

export function useBulkEmail() {
  const [customTemplates, setCustomTemplates] = useState([])
  const [sendHistory, setSendHistory] = useState([])
  const [loading, setLoading] = useState(true)

  // ── Fetch custom templates + send history ──
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // Custom templates
      const templatesSnap = await getDocs(
        query(collection(db, 'admin', 'emailTemplates', 'custom'), orderBy('createdAt', 'desc'))
      ).catch(() => ({ docs: [] }))
      const templates = templatesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      setCustomTemplates(templates)

      // Send history
      const historySnap = await getDocs(
        query(collection(db, 'admin', 'bulkEmails'), orderBy('createdAt', 'desc'))
      ).catch(() => ({ docs: [] }))
      const history = historySnap.docs.map(d => ({ id: d.id, ...d.data() }))
      setSendHistory(history)
    } catch (err) {
      logger.error('Failed to fetch bulk email data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Save custom template (create or update) ──
  const saveCustomTemplate = useCallback(async (template) => {
    try {
      if (template.id) {
        // Update existing
        const ref = doc(db, 'admin', 'emailTemplates', 'custom', template.id)
        await updateDoc(ref, {
          ...template,
          updatedAt: serverTimestamp(),
        })
        setCustomTemplates(prev =>
          prev.map(t => t.id === template.id ? { ...t, ...template } : t)
        )
      } else {
        // Create new
        const ref = await addDoc(collection(db, 'admin', 'emailTemplates', 'custom'), {
          ...template,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        setCustomTemplates(prev => [{ id: ref.id, ...template }, ...prev])
        return ref.id
      }
    } catch (err) {
      logger.error('Failed to save custom template:', err)
      throw err
    }
  }, [])

  // ── Delete custom template ──
  const deleteCustomTemplate = useCallback(async (templateId) => {
    try {
      await deleteDoc(doc(db, 'admin', 'emailTemplates', 'custom', templateId))
      setCustomTemplates(prev => prev.filter(t => t.id !== templateId))
    } catch (err) {
      logger.error('Failed to delete custom template:', err)
      throw err
    }
  }, [])

  // ── Duplicate template ──
  const duplicateTemplate = useCallback(async (template) => {
    const copy = {
      name: `${template.name} (Copy)`,
      description: template.description || '',
      recommendedAudience: template.recommendedAudience || [],
      subject: template.subject,
      body: template.body,
      customFields: template.customFields || [],
    }
    return saveCustomTemplate(copy)
  }, [saveCustomTemplate])

  // ── Log bulk export to Firestore ──
  const logBulkExport = useCallback(async ({
    templateId, templateName, audience, audienceFilter,
    recipientCount, recipientEmails, exportMethod, notes,
  }) => {
    try {
      const ref = await addDoc(collection(db, 'admin', 'bulkEmails'), {
        templateId,
        templateName,
        audience,
        audienceFilter: audienceFilter || null,
        recipientCount,
        recipientEmails: recipientEmails || [],
        exportMethod,
        notes: notes || '',
        createdAt: serverTimestamp(),
      })
      setSendHistory(prev => [{
        id: ref.id, templateId, templateName, audience,
        recipientCount, exportMethod, createdAt: new Date(),
      }, ...prev])
      return ref.id
    } catch (err) {
      logger.error('Failed to log bulk export:', err)
    }
  }, [])

  // ── Generate personalized CSV ──
  const generatePersonalizedCsv = useCallback((leads, template, customOverrides = {}) => {
    const headers = ['Name', 'Email', 'Subject', 'Body']
    const rows = leads.map(lead => {
      const vars = buildLeadVariables(lead, customOverrides)
      const subject = fillTemplate(template.subject, vars)
      const body = fillTemplate(template.body, vars)
      return [lead.name || '', lead.email || '', subject, body]
    })

    const escape = (str) => `"${String(str || '').replace(/"/g, '""')}"`
    const csv = [headers.map(escape).join(','), ...rows.map(row => row.map(escape).join(','))].join('\n')
    return csv
  }, [])

  // ── Get send history for template (for double-send protection) ──
  const getSendHistoryForTemplate = useCallback((templateId) => {
    return sendHistory.filter(h => h.templateId === templateId)
  }, [sendHistory])

  return {
    customTemplates,
    sendHistory,
    loading,
    saveCustomTemplate,
    deleteCustomTemplate,
    duplicateTemplate,
    logBulkExport,
    generatePersonalizedCsv,
    getSendHistoryForTemplate,
    refresh: fetchData,
  }
}
