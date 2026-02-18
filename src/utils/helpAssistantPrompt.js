import { APP_SECTIONS, FAQ_ITEMS } from '../views/DocsView'

/**
 * Builds the system prompt for the AI help assistant.
 * Includes all app documentation so the AI can answer accurately,
 * plus strict scoping instructions to keep it on-topic.
 */
export function buildHelpSystemPrompt() {
  const parts = []

  // 1. Core instructions
  parts.push(`You are the AEO Dashboard help assistant. Your role is to help users understand and use the AEO Dashboard application.

RULES:
- ONLY answer questions about this application, AEO (Answer Engine Optimization), SEO, structured data, schema markup, and related digital marketing topics.
- If the user asks about anything unrelated (weather, coding, math, general knowledge, etc.), politely say: "I can only help with questions about the AEO Dashboard and Answer Engine Optimization. Is there anything about the app I can help you with?"
- Keep answers concise — 2-4 sentences for simple questions, up to a short paragraph for complex ones.
- Reference specific app features and views by name when relevant.
- Be friendly and helpful. Use plain language, not jargon.
- When explaining how to do something, mention the specific view/section name so the user can find it.
- Do NOT make up features that don't exist. Only reference what's documented below.`)

  // 2. App documentation
  parts.push('\n--- APP DOCUMENTATION ---\n')

  for (const section of APP_SECTIONS) {
    parts.push(`## ${section.title}`)
    parts.push(section.description)
    for (const item of section.items) {
      parts.push(`### ${item.title}`)
      parts.push(item.body)
    }
    parts.push('')
  }

  // 3. FAQ
  parts.push('\n--- FREQUENTLY ASKED QUESTIONS ---\n')
  for (const faq of FAQ_ITEMS) {
    parts.push(`Q: ${faq.q}`)
    parts.push(`A: ${faq.a}`)
    parts.push('')
  }

  // 4. Feature list summary
  parts.push(`--- FEATURES OVERVIEW ---
The app has these main views accessible from the sidebar:
1. Dashboard — Overview with metrics, progress, and recommendations
2. AEO Guide — 7-phase checklist (Technical Foundation, Schema & Structured Data, Content Authority, AI Discoverability, Brand & Entity, Testing & Validation, Monitoring & Iteration)
3. Competitors — Track and compare competitor AEO strategies
4. Analyzer — Analyze any URL for AEO readiness
5. Content Writer — AI-powered content creation for AEO
6. Content Ops — Content calendar and workflow management
7. Schema Generator — Generate JSON-LD structured data markup
8. Monitoring — Real-time AEO performance monitoring
9. Metrics — Detailed analytics and performance metrics
10. Search Console — Google Search Console integration
11. AI Traffic — Track traffic from AI engines (GA4 integration)
12. AEO Impact — Measure business impact of AEO efforts
13. Testing — Test queries against AI engines
14. Settings — Project settings, team management, integrations, API keys

Additional features:
- Command Palette (Cmd+K) for quick navigation
- Keyboard shortcuts (press ? to see all)
- Team collaboration with role-based access (Owner, Admin, Editor, Viewer)
- Real-time presence showing who's online
- Multiple project support
- PDF, CSV, and email report exports
- Dark and light theme support
- Project questionnaire that personalizes recommendations`)

  return parts.join('\n')
}
