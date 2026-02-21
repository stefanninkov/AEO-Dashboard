/**
 * Nudge Email Templates — Pre-built re-engagement email templates.
 *
 * Each template has: id, name, subject(vars), body(vars)
 * Variables: { name, email, project, progress, phase, days, appUrl }
 */

const APP_URL = window.location.origin + window.location.pathname

export const NUDGE_TEMPLATES = [
  {
    id: 'need_help',
    name: 'Need help?',
    description: 'Generic re-engagement for inactive users',
    subject: ({ name }) => `Hey ${name || 'there'}, need help with your AEO project?`,
    body: ({ name, days, appUrl }) =>
      `Hi ${name || 'there'},\n\n` +
      `We noticed you haven't been around in ${days || 'a while'} days. ` +
      `No worries — AEO optimization is a marathon, not a sprint!\n\n` +
      `If you're stuck or need guidance, here are some things you can do:\n` +
      `- Check the 7-phase checklist for your next action items\n` +
      `- Run the AI analyzer to get personalized recommendations\n` +
      `- Use the content writer to create AEO-optimized content\n\n` +
      `Jump back in anytime: ${appUrl || APP_URL}\n\n` +
      `Best,\nThe AEO Dashboard Team`,
  },
  {
    id: 'checklist_stuck',
    name: 'Stuck on the checklist?',
    description: 'For users stuck on a specific phase',
    subject: ({ name, phase }) =>
      `${name || 'Hey'}, tips for Phase ${phase || ''} of your AEO checklist`,
    body: ({ name, project, progress, phase, appUrl }) =>
      `Hi ${name || 'there'},\n\n` +
      `We see you're at ${progress || '?'}% on "${project || 'your project'}" ` +
      `${phase ? `and currently in Phase ${phase}` : ''}. ` +
      `That phase can be tricky — here are some tips:\n\n` +
      `1. Focus on completing one category at a time\n` +
      `2. Use the AI analyzer to identify your biggest gaps\n` +
      `3. The content writer can help you create optimized content quickly\n` +
      `4. Don't skip the schema markup — it's one of the highest-impact items\n\n` +
      `Every item you check off improves your AEO score. Keep going!\n\n` +
      `Continue here: ${appUrl || APP_URL}\n\n` +
      `Best,\nThe AEO Dashboard Team`,
  },
  {
    id: 'project_misses_you',
    name: 'Your project misses you',
    description: 'Project-specific nudge mentioning progress',
    subject: ({ project }) =>
      `Your project "${project || 'AEO Project'}" is waiting for you`,
    body: ({ name, project, progress, days, appUrl }) =>
      `Hi ${name || 'there'},\n\n` +
      `Your project "${project || 'AEO Project'}" is at ${progress || '?'}% completion ` +
      `and hasn't had any activity in ${days || 'a while'} days.\n\n` +
      `You're closer than you think! Here's what you can do in just 15 minutes:\n` +
      `- Check off a few more items on your checklist\n` +
      `- Run a quick analysis to see your current score\n` +
      `- Review the AI-generated recommendations\n\n` +
      `Even small progress compounds over time. Let's keep the momentum going!\n\n` +
      `Pick up where you left off: ${appUrl || APP_URL}\n\n` +
      `Best,\nThe AEO Dashboard Team`,
  },
  {
    id: 'welcome_back',
    name: 'Welcome back!',
    description: 'For users who return after being nudged',
    subject: ({ name }) => `Welcome back, ${name || 'there'}!`,
    body: ({ name, project, appUrl }) =>
      `Hi ${name || 'there'},\n\n` +
      `Great to see you back! 🎉\n\n` +
      `${project ? `Your project "${project}" is ready for you. ` : ''}` +
      `Here's what's new since you've been away:\n` +
      `- The AI analyzer has been improved with better recommendations\n` +
      `- New content templates are available in the content writer\n` +
      `- Schema generator now supports more schema types\n\n` +
      `Dive back in: ${appUrl || APP_URL}\n\n` +
      `Best,\nThe AEO Dashboard Team`,
  },
]

/**
 * Auto-pick the best template based on user context.
 */
export function suggestTemplate({ hasProject, progress, daysSinceActivity, phase }) {
  if (!hasProject) return NUDGE_TEMPLATES.find(t => t.id === 'need_help')
  if (progress > 0 && progress < 75 && phase) return NUDGE_TEMPLATES.find(t => t.id === 'checklist_stuck')
  if (daysSinceActivity > 14) return NUDGE_TEMPLATES.find(t => t.id === 'project_misses_you')
  return NUDGE_TEMPLATES.find(t => t.id === 'need_help')
}

export function getTemplateById(id) {
  return NUDGE_TEMPLATES.find(t => t.id === id) || NUDGE_TEMPLATES[0]
}
