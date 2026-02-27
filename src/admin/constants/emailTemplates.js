/**
 * Email Templates — 36 pre-built templates (12 EN + 12 DE + 12 SR) for waitlist outreach.
 *
 * Template variables:
 * {name} {email} {score} {maxScore} {tierLabel} {weakestCategory}
 * {websiteCount} {role} {priority1} {priority2} {priority3}
 * {link} {customField1} {customField2} {customField3}
 *
 * DESIGN POLICY: No emojis. All visual indicators use lucide-react icons.
 */
import {
  Flame, Circle, CircleDot, Mail, Rocket, Ticket,
  BarChart3, DollarSign, Newspaper, TrendingUp, Trophy, RefreshCw,
} from 'lucide-react'

// ═══════════════════════════════════════════════
//  ENGLISH (12)
// ═══════════════════════════════════════════════

// ── OUTREACH (EN) ──

const hotLeadOutreach = {
  id: 'hot_lead_outreach',
  name: 'Hot Lead — Personal Outreach',
  icon: Flame,
  lang: 'en',
  description: 'Direct, personal message for high-scoring leads with strong buying signals.',
  recommendedAudience: ['hot'],
  subject: '{name}, your AEO score puts you ahead of 95% of websites',
  body: `Hi {name},

I noticed you just took the AEO Readiness Assessment and scored {score}/{maxScore} ({tierLabel}). That puts you well ahead of most websites we see.

You manage {websiteCount} and your weakest area was {weakestCategory} — which is actually one of the easiest things to fix with the right tools.

I'm building AEO Dashboard specifically for agencies like yours. Would love to get your feedback on what we're building.

Got 15 minutes this week for a quick call?

— Stefan, Founder, AEO Dashboard`,
  customFields: [],
}

const warmLeadNurture = {
  id: 'warm_lead_nurture',
  name: 'Warm Lead — Value + Nurture',
  icon: Circle,
  lang: 'en',
  description: 'Provide value and build trust with moderately qualified leads.',
  recommendedAudience: ['warm'],
  subject: '{name}, 3 quick wins to improve your AEO score from {score}',
  body: `Hi {name},

Thanks for taking the AEO Readiness Assessment. You scored {score}/{maxScore} ({tierLabel}) — solid foundation, but room to grow.

Based on your results, here are your top 3 priorities:

1. {priority1}
2. {priority2}
3. {priority3}

These are exactly the kinds of things AEO Dashboard automates. We're building tools that fix these gaps in minutes, not weeks.

Want to be first in line when we launch? You're already on the list — I'll personally notify you.

— Stefan, Founder, AEO Dashboard`,
  customFields: [],
}

const coldLeadEducate = {
  id: 'cold_lead_educate',
  name: 'Cold Lead — Educate',
  icon: CircleDot,
  lang: 'en',
  description: 'Educational approach for early-stage leads who need awareness.',
  recommendedAudience: ['cold'],
  subject: 'Why AI search engines can\'t find your website, {name}',
  body: `Hi {name},

You recently took the AEO Readiness Assessment and scored {score}/{maxScore} ({tierLabel}).

Here's what that means: AI search engines like ChatGPT, Perplexity, and Google AI Overviews are rapidly becoming how people find information — and right now, they can't find your content.

The three biggest gaps holding you back:

1. {priority1}
2. {priority2}
3. {priority3}

The good news? These are all fixable, and the earlier you start, the bigger your competitive advantage.

I'm building AEO Dashboard to make this easy. Want me to send you a free guide on getting started?

— Stefan, Founder, AEO Dashboard`,
  customFields: [],
}

const abandonedQuizNudge = {
  id: 'abandoned_quiz_nudge',
  name: 'Abandoned Quiz — Nudge',
  icon: Mail,
  lang: 'en',
  description: 'Re-engage leads who started but didn\'t finish the assessment.',
  recommendedAudience: ['abandoned'],
  subject: '{name}, your AEO assessment is waiting',
  body: `Hi {name},

I noticed you started the AEO Readiness Assessment but didn't finish it. No worries — it happens!

The assessment only takes about 2 minutes, and you'll get:
\u2022 Your AEO Readiness Score (0-33)
\u2022 A breakdown across 4 key categories
\u2022 Your top 3 priorities to improve AI visibility

Pick up where you left off: {link}

The insights are worth it — 77% of people who complete it find at least one critical gap they didn't know about.

— Stefan, Founder, AEO Dashboard`,
  customFields: [],
}

// ── LAUNCH & PRODUCT (EN) ──

const productLaunch = {
  id: 'product_launch',
  name: 'Product Launch Announcement',
  icon: Rocket,
  lang: 'en',
  description: 'Announce AEO Dashboard launch to all leads.',
  recommendedAudience: ['hot', 'warm', 'cold'],
  subject: 'AEO Dashboard is live \u2014 your early access is ready, {name}',
  body: `Hi {name},

Great news \u2014 AEO Dashboard is officially live.

When you took the AEO Readiness Assessment, you scored {score}/33 ({tierLabel}). Your #1 priority was {priority1} \u2014 and AEO Dashboard now fixes that automatically.

Here's what you can do right now:
\u2192 Run a full deterministic AEO audit on any URL (no API key needed)
\u2192 Check if AI crawlers can access your site
\u2192 Generate optimized schema markup in seconds
\u2192 Track your AI citation performance over time.

Your early access is ready. Log in here: {link}

\u2014 Stefan, Founder, AEO Dashboard`,
  customFields: [],
}

const betaInvite = {
  id: 'beta_invite',
  name: 'Exclusive Beta Invite',
  icon: Ticket,
  lang: 'en',
  description: 'Invite high-value leads to beta test before public launch.',
  recommendedAudience: ['hot'],
  subject: 'You\'re in, {name} \u2014 AEO Dashboard beta access',
  body: `Hi {name},

I'm inviting a small group of agencies to beta test AEO Dashboard before public launch.

Based on your assessment ({score}/33) and the fact that you manage {websiteCount}, I think you'd be a great fit.

What you get:
\u2192 Full access to all features during beta
\u2192 Direct line to me for feedback and support
\u2192 Locked-in early adopter pricing when we launch
\u2192 Your input shapes the product roadmap.

Interested? Reply to this email and I'll set up your account today.

\u2014 Stefan, Founder, AEO Dashboard`,
  customFields: [],
}

const scoreFollowUp = {
  id: 'score_follow_up',
  name: 'Score Follow-Up',
  icon: BarChart3,
  lang: 'en',
  description: 'Personalized follow-up with action plan based on their score.',
  recommendedAudience: ['hot', 'warm'],
  subject: 'Your AEO score: {score}/33 \u2014 here\'s your action plan, {name}',
  body: `Hi {name},

A quick follow-up on your AEO Readiness Assessment.

You scored {score}/33 ({tierLabel}). Here's what I'd prioritize if I were managing your {websiteCount}:

1. {priority1}
2. {priority2}
3. {priority3}

These three changes alone could significantly improve your AI search visibility.

Want help getting started? Reply and I'll point you to the right resources.

\u2014 Stefan, Founder, AEO Dashboard`,
  customFields: [],
}

const earlyBirdPricing = {
  id: 'early_bird_pricing',
  name: 'Early Bird / Pricing',
  icon: DollarSign,
  lang: 'en',
  description: 'Urgency-driven pricing announcement with deadline.',
  recommendedAudience: ['hot', 'warm'],
  subject: 'Early bird pricing ends soon \u2014 {name}, lock in your rate',
  body: `Hi {name},

AEO Dashboard is moving to full pricing on {customField1}.

As an early assessment taker, you can lock in our founding member rate:
\u2192 {customField2}

This includes everything: unlimited URL audits, schema generation, AI crawler monitoring, citation tracking, and PDF reports for your clients.

You manage {websiteCount} \u2014 at this price, the ROI is immediate.

Lock in your rate: {link}

\u2014 Stefan, Founder, AEO Dashboard`,
  customFields: [
    { id: 'customField1', label: 'Pricing deadline date', defaultValue: 'March 31, 2026' },
    { id: 'customField2', label: 'Pricing details', defaultValue: '$49/month (regular $99/month)' },
  ],
}

// ── MARKETING & ENGAGEMENT (EN) ──

const featureUpdate = {
  id: 'feature_update',
  name: 'Feature Update / Newsletter',
  icon: Newspaper,
  lang: 'en',
  description: 'Announce new features, relevant to their weakest category.',
  recommendedAudience: ['hot', 'warm', 'cold'],
  subject: 'New in AEO Dashboard: {customField1}',
  body: `Hi {name},

Quick update \u2014 we just shipped something I think you'll find useful:

{customField2}

This is especially relevant for you because when you took the assessment, {weakestCategory} was your biggest gap. This feature directly addresses that.

Check it out: {link}

What would you like to see next? Hit reply \u2014 I read every response.

\u2014 Stefan, Founder, AEO Dashboard`,
  customFields: [
    { id: 'customField1', label: 'Feature name', defaultValue: '' },
    { id: 'customField2', label: 'Feature description (2-3 sentences)', defaultValue: '' },
  ],
}

const industryInsight = {
  id: 'industry_insight',
  name: 'Industry Insight / Educational',
  icon: TrendingUp,
  lang: 'en',
  description: 'Educational content to warm up cold/warm leads.',
  recommendedAudience: ['cold', 'warm'],
  subject: '{customField1}',
  body: `Hi {name},

{customField2}

This matters for your website because AI search engines now handle millions of queries daily \u2014 and the way they select sources is fundamentally different from traditional SEO.

When you took the AEO assessment, you scored {score}/33. The good news: even small improvements can make a big difference at this stage.

Want to see where you stand now? Retake the assessment: {link}

\u2014 Stefan, Founder, AEO Dashboard`,
  customFields: [
    { id: 'customField1', label: 'Email subject line', defaultValue: '' },
    { id: 'customField2', label: 'Opening paragraph (industry insight/stat)', defaultValue: '' },
  ],
}

const caseStudy = {
  id: 'case_study',
  name: 'Case Study / Social Proof',
  icon: Trophy,
  lang: 'en',
  description: 'Share a success story relevant to their profile.',
  recommendedAudience: ['hot', 'warm'],
  subject: 'How {customField1} improved their AEO score by {customField2} points',
  body: `Hi {name},

Quick case study I wanted to share:

{customField3}

Your current score is {score}/33 ({tierLabel}). Based on your profile \u2014 {role} managing {websiteCount} \u2014 you're in a similar position to where they started.

Want to see what similar improvements could look like for your sites? {link}

\u2014 Stefan, Founder, AEO Dashboard`,
  customFields: [
    { id: 'customField1', label: 'Company/person name', defaultValue: '' },
    { id: 'customField2', label: 'Points improved', defaultValue: '' },
    { id: 'customField3', label: 'Case study paragraph (3-4 sentences)', defaultValue: '' },
  ],
}

const reEngagement = {
  id: 're_engagement',
  name: 'Re-engagement',
  icon: RefreshCw,
  lang: 'en',
  description: 'Win back inactive leads (30+ days since signup).',
  recommendedAudience: ['hot', 'warm', 'cold'],
  subject: 'Still thinking about AEO, {name}?',
  body: `Hi {name},

It's been a while since you took the AEO Readiness Assessment (you scored {score}/33).

A lot has changed in AI search since then:
\u2192 Google AI Overviews now appear in 40%+ of searches
\u2192 ChatGPT search is growing 10x month-over-month
\u2192 Perplexity just passed 100M monthly queries

Your competitors are optimizing. Are you?

Retake your assessment to see your updated score: {link}

\u2014 Stefan, Founder, AEO Dashboard`,
  customFields: [],
}


// ═══════════════════════════════════════════════
//  GERMAN (12) — Sie form
// ═══════════════════════════════════════════════

// ── OUTREACH (DE) ──

const hotLeadOutreach_de = {
  id: 'hot_lead_outreach_de',
  name: 'Hot Lead — Personal Outreach (DE)',
  icon: Flame,
  lang: 'de',
  description: 'Direct, personal message for high-scoring leads with strong buying signals.',
  recommendedAudience: ['hot'],
  subject: '{name}, Ihr AEO Score liegt vor 95 % aller Websites',
  body: `Hallo {name},

ich habe gesehen, dass Sie gerade das AEO Readiness Assessment gemacht haben. Ihr Ergebnis: {score}/{maxScore} ({tierLabel}). Damit liegen Sie weit vor den meisten Websites, die wir sehen.

Sie verwalten {websiteCount} und Ihr schwachster Bereich war {weakestCategory}. Das ist tatsachlich einer der am einfachsten zu behebenden Punkte mit den richtigen Tools.

Ich baue AEO Dashboard speziell fur Agenturen wie Ihre. Ich wurde mich freuen, Ihr Feedback zu bekommen.

Haben Sie diese Woche 15 Minuten fur ein kurzes Gesprach?

— Stefan, Grunder, AEO Dashboard`,
  customFields: [],
}

const warmLeadNurture_de = {
  id: 'warm_lead_nurture_de',
  name: 'Warm Lead — Value + Nurture (DE)',
  icon: Circle,
  lang: 'de',
  description: 'Provide value and build trust with moderately qualified leads.',
  recommendedAudience: ['warm'],
  subject: '{name}, 3 schnelle Verbesserungen fur Ihren AEO Score von {score}',
  body: `Hallo {name},

danke, dass Sie das AEO Readiness Assessment gemacht haben. Sie haben {score}/{maxScore} ({tierLabel}) erreicht. Solide Basis, aber Luft nach oben.

Basierend auf Ihren Ergebnissen sind das Ihre Top-3-Prioritaten:

1. {priority1}
2. {priority2}
3. {priority3}

Genau solche Dinge automatisiert AEO Dashboard. Wir bauen Tools, die diese Lucken in Minuten schliessen, nicht Wochen.

Mochten Sie unter den Ersten sein, wenn wir starten? Sie stehen bereits auf der Liste. Ich benachrichtige Sie personlich.

— Stefan, Grunder, AEO Dashboard`,
  customFields: [],
}

const coldLeadEducate_de = {
  id: 'cold_lead_educate_de',
  name: 'Cold Lead — Educate (DE)',
  icon: CircleDot,
  lang: 'de',
  description: 'Educational approach for early-stage leads who need awareness.',
  recommendedAudience: ['cold'],
  subject: 'Warum AI-Suchmaschinen Ihre Website nicht finden, {name}',
  body: `Hallo {name},

Sie haben kurzlich das AEO Readiness Assessment gemacht und {score}/{maxScore} ({tierLabel}) erreicht.

Was das bedeutet: AI-Suchmaschinen wie ChatGPT, Perplexity und Google AI Overviews werden immer mehr zur Hauptquelle fur Informationen. Und aktuell konnen sie Ihre Inhalte nicht finden.

Die drei grossten Lucken, die Sie zuruckhalten:

1. {priority1}
2. {priority2}
3. {priority3}

Die gute Nachricht: Alles davon ist behebbar. Je fruher Sie anfangen, desto grosser Ihr Wettbewerbsvorteil.

Ich baue AEO Dashboard, um genau das einfach zu machen. Soll ich Ihnen einen kostenlosen Leitfaden zum Einstieg schicken?

— Stefan, Grunder, AEO Dashboard`,
  customFields: [],
}

const abandonedQuizNudge_de = {
  id: 'abandoned_quiz_nudge_de',
  name: 'Abandoned Quiz — Nudge (DE)',
  icon: Mail,
  lang: 'de',
  description: 'Re-engage leads who started but didn\'t finish the assessment.',
  recommendedAudience: ['abandoned'],
  subject: '{name}, Ihr AEO Assessment wartet auf Sie',
  body: `Hallo {name},

ich habe gesehen, dass Sie das AEO Readiness Assessment begonnen, aber nicht abgeschlossen haben. Kein Problem!

Das Assessment dauert nur 2 Minuten. Sie bekommen:
\u2022 Ihren AEO Readiness Score (0\u201333)
\u2022 Eine Aufschlusselung in 4 Kategorien
\u2022 Ihre Top-3-Prioritaten fur bessere AI-Sichtbarkeit

Machen Sie dort weiter, wo Sie aufgehort haben: {link}

Es lohnt sich. 77 % der Teilnehmer entdecken mindestens eine kritische Lucke, von der sie nichts wussten.

— Stefan, Grunder, AEO Dashboard`,
  customFields: [],
}

// ── LAUNCH & PRODUCT (DE) ──

const productLaunch_de = {
  id: 'product_launch_de',
  name: 'Product Launch Announcement (DE)',
  icon: Rocket,
  lang: 'de',
  description: 'Announce AEO Dashboard launch to all leads.',
  recommendedAudience: ['hot', 'warm', 'cold'],
  subject: 'AEO Dashboard ist live \u2014 Ihr Early Access ist bereit, {name}',
  body: `Hallo {name},

gute Neuigkeiten \u2014 AEO Dashboard ist offiziell live.

Bei Ihrem AEO Readiness Assessment haben Sie {score}/33 ({tierLabel}) erreicht. Ihre #1 Prioritat war {priority1} \u2014 und AEO Dashboard behebt das jetzt automatisch.

Was Sie jetzt tun konnen:
\u2192 Einen vollstandigen AEO-Audit fur jede URL starten (kein API-Key notig)
\u2192 Prufen, ob AI-Crawler auf Ihre Website zugreifen konnen
\u2192 Optimiertes Schema-Markup in Sekunden generieren
\u2192 Ihre AI-Zitier-Performance uber die Zeit verfolgen.

Ihr Early Access ist bereit. Hier einloggen: {link}

\u2014 Stefan, Grunder, AEO Dashboard`,
  customFields: [],
}

const betaInvite_de = {
  id: 'beta_invite_de',
  name: 'Exclusive Beta Invite (DE)',
  icon: Ticket,
  lang: 'de',
  description: 'Invite high-value leads to beta test before public launch.',
  recommendedAudience: ['hot'],
  subject: 'Sie sind dabei, {name} \u2014 AEO Dashboard Beta-Zugang',
  body: `Hallo {name},

ich lade eine kleine Gruppe von Agenturen ein, AEO Dashboard vor dem offentlichen Start zu testen.

Basierend auf Ihrem Assessment ({score}/33) und der Tatsache, dass Sie {websiteCount} verwalten, passen Sie perfekt.

Was Sie bekommen:
\u2192 Voller Zugang zu allen Features wahrend der Beta
\u2192 Direkter Draht zu mir fur Feedback und Support
\u2192 Gesicherter Early-Adopter-Preis bei Launch
\u2192 Ihr Input beeinflusst die Produkt-Roadmap.

Interesse? Antworten Sie auf diese E-Mail und ich richte Ihren Account heute noch ein.

\u2014 Stefan, Grunder, AEO Dashboard`,
  customFields: [],
}

const scoreFollowUp_de = {
  id: 'score_follow_up_de',
  name: 'Score Follow-Up (DE)',
  icon: BarChart3,
  lang: 'de',
  description: 'Personalized follow-up with action plan based on their score.',
  recommendedAudience: ['hot', 'warm'],
  subject: 'Ihr AEO Score: {score}/33 \u2014 Ihr Aktionsplan, {name}',
  body: `Hallo {name},

ein kurzes Follow-up zu Ihrem AEO Readiness Assessment.

Sie haben {score}/33 ({tierLabel}) erreicht. Was ich priorisieren wurde, wenn ich Ihre {websiteCount} verwalten wurde:

1. {priority1}
2. {priority2}
3. {priority3}

Diese drei Anderungen allein konnten Ihre AI-Suchsichtbarkeit deutlich verbessern.

Brauchen Sie Hilfe beim Einstieg? Antworten Sie und ich zeige Ihnen die richtigen Ressourcen.

\u2014 Stefan, Grunder, AEO Dashboard`,
  customFields: [],
}

const earlyBirdPricing_de = {
  id: 'early_bird_pricing_de',
  name: 'Early Bird / Pricing (DE)',
  icon: DollarSign,
  lang: 'de',
  description: 'Urgency-driven pricing announcement with deadline.',
  recommendedAudience: ['hot', 'warm'],
  subject: 'Early-Bird-Preis endet bald \u2014 {name}, sichern Sie sich Ihren Tarif',
  body: `Hallo {name},

AEO Dashboard wechselt am {customField1} zum regularen Preis.

Als fruher Assessment-Teilnehmer konnen Sie sich unseren Grunder-Tarif sichern:
\u2192 {customField2}

Alles inklusive: unbegrenzte URL-Audits, Schema-Generierung, AI-Crawler-Monitoring, Zitier-Tracking und PDF-Reports fur Ihre Kunden.

Sie verwalten {websiteCount} \u2014 bei diesem Preis ist der ROI sofort da.

Tarif sichern: {link}

\u2014 Stefan, Grunder, AEO Dashboard`,
  customFields: [
    { id: 'customField1', label: 'Pricing deadline date', defaultValue: '31. Marz 2026' },
    { id: 'customField2', label: 'Pricing details', defaultValue: '49 \u20AC/Monat (regular 99 \u20AC/Monat)' },
  ],
}

// ── MARKETING & ENGAGEMENT (DE) ──

const featureUpdate_de = {
  id: 'feature_update_de',
  name: 'Feature Update / Newsletter (DE)',
  icon: Newspaper,
  lang: 'de',
  description: 'Announce new features, relevant to their weakest category.',
  recommendedAudience: ['hot', 'warm', 'cold'],
  subject: 'Neu in AEO Dashboard: {customField1}',
  body: `Hallo {name},

kurzes Update \u2014 wir haben gerade etwas gebaut, das fur Sie nutzlich sein durfte:

{customField2}

Besonders relevant fur Sie, weil bei Ihrem Assessment {weakestCategory} Ihre grosste Lucke war. Dieses Feature adressiert genau das.

Hier ansehen: {link}

Was wurden Sie als Nachstes sehen wollen? Antworten Sie einfach \u2014 ich lese jede Antwort.

\u2014 Stefan, Grunder, AEO Dashboard`,
  customFields: [
    { id: 'customField1', label: 'Feature name', defaultValue: '' },
    { id: 'customField2', label: 'Feature description (2-3 sentences)', defaultValue: '' },
  ],
}

const industryInsight_de = {
  id: 'industry_insight_de',
  name: 'Industry Insight / Educational (DE)',
  icon: TrendingUp,
  lang: 'de',
  description: 'Educational content to warm up cold/warm leads.',
  recommendedAudience: ['cold', 'warm'],
  subject: '{customField1}',
  body: `Hallo {name},

{customField2}

Das ist fur Ihre Website relevant, weil AI-Suchmaschinen taglich Millionen von Anfragen bearbeiten \u2014 und Quellen fundamental anders auswahlen als traditionelle SEO.

Bei Ihrem AEO Assessment haben Sie {score}/33 erreicht. Die gute Nachricht: Selbst kleine Verbesserungen konnen in dieser Phase viel bewirken.

Wollen Sie sehen, wo Sie jetzt stehen? Assessment wiederholen: {link}

\u2014 Stefan, Grunder, AEO Dashboard`,
  customFields: [
    { id: 'customField1', label: 'Email subject line', defaultValue: '' },
    { id: 'customField2', label: 'Opening paragraph (industry insight/stat)', defaultValue: '' },
  ],
}

const caseStudy_de = {
  id: 'case_study_de',
  name: 'Case Study / Social Proof (DE)',
  icon: Trophy,
  lang: 'de',
  description: 'Share a success story relevant to their profile.',
  recommendedAudience: ['hot', 'warm'],
  subject: 'Wie {customField1} den AEO Score um {customField2} Punkte verbessert hat',
  body: `Hallo {name},

eine kurze Fallstudie, die ich mit Ihnen teilen wollte:

{customField3}

Ihr aktueller Score ist {score}/33 ({tierLabel}). Basierend auf Ihrem Profil \u2014 {role} mit {websiteCount} \u2014 sind Sie in einer ahnlichen Position wie der Ausgangspunkt in dieser Studie.

Wollen Sie sehen, was ahnliche Verbesserungen fur Ihre Websites bedeuten konnten? {link}

\u2014 Stefan, Grunder, AEO Dashboard`,
  customFields: [
    { id: 'customField1', label: 'Company/person name', defaultValue: '' },
    { id: 'customField2', label: 'Points improved', defaultValue: '' },
    { id: 'customField3', label: 'Case study paragraph (3-4 sentences)', defaultValue: '' },
  ],
}

const reEngagement_de = {
  id: 're_engagement_de',
  name: 'Re-engagement (DE)',
  icon: RefreshCw,
  lang: 'de',
  description: 'Win back inactive leads (30+ days since signup).',
  recommendedAudience: ['hot', 'warm', 'cold'],
  subject: 'Denken Sie noch an AEO, {name}?',
  body: `Hallo {name},

es ist eine Weile her, seit Sie das AEO Readiness Assessment gemacht haben (Sie hatten {score}/33).

Seitdem hat sich viel getan in der AI-Suche:
\u2192 Google AI Overviews erscheinen jetzt bei 40 %+ aller Suchen
\u2192 ChatGPT Search wachst 10x pro Monat
\u2192 Perplexity hat 100 Mio. monatliche Anfragen uberschritten

Ihre Wettbewerber optimieren. Und Sie?

Assessment wiederholen und Ihren aktuellen Score sehen: {link}

\u2014 Stefan, Grunder, AEO Dashboard`,
  customFields: [],
}


// ═══════════════════════════════════════════════
//  SERBIAN (12) — ti form
// ═══════════════════════════════════════════════

// ── OUTREACH (SR) ──

const hotLeadOutreach_sr = {
  id: 'hot_lead_outreach_sr',
  name: 'Hot Lead — Personal Outreach (SR)',
  icon: Flame,
  lang: 'sr',
  description: 'Direct, personal message for high-scoring leads with strong buying signals.',
  recommendedAudience: ['hot'],
  subject: '{name}, tvoj AEO Score te stavlja ispred 95% sajtova',
  body: `Zdravo {name},

video sam da si upravo zavrsio AEO Readiness Assessment i postigao {score}/{maxScore} ({tierLabel}). To te stavlja daleko ispred vecine sajtova koje vidimo.

Upravljas sa {websiteCount} i tvoja najslabija oblast je bila {weakestCategory} \u2014 sto je zapravo jedna od najlaksih stvari za popraviti sa pravim alatima.

Pravim AEO Dashboard specijalno za agencije poput tvoje. Voleo bih da cujem tvoje misljenje o onome sto gradimo.

Imas 15 minuta ove nedelje za kratak poziv?

\u2014 Stefan, Osnivac, AEO Dashboard`,
  customFields: [],
}

const warmLeadNurture_sr = {
  id: 'warm_lead_nurture_sr',
  name: 'Warm Lead — Value + Nurture (SR)',
  icon: Circle,
  lang: 'sr',
  description: 'Provide value and build trust with moderately qualified leads.',
  recommendedAudience: ['warm'],
  subject: '{name}, 3 brze pobede za poboljsanje tvog AEO Score-a od {score}',
  body: `Zdravo {name},

hvala sto si uradio AEO Readiness Assessment. Postigao si {score}/{maxScore} ({tierLabel}) \u2014 solidna osnova, ali ima prostora za rast.

Na osnovu tvojih rezultata, evo tvoja 3 glavna prioriteta:

1. {priority1}
2. {priority2}
3. {priority3}

Upravo takve stvari AEO Dashboard automatizuje. Gradimo alate koji poprave ove nedostatke za minute, ne nedelje.

Zelis da budes prvi kada lansiramo? Vec si na listi \u2014 licno cu te obavestiti.

\u2014 Stefan, Osnivac, AEO Dashboard`,
  customFields: [],
}

const coldLeadEducate_sr = {
  id: 'cold_lead_educate_sr',
  name: 'Cold Lead — Educate (SR)',
  icon: CircleDot,
  lang: 'sr',
  description: 'Educational approach for early-stage leads who need awareness.',
  recommendedAudience: ['cold'],
  subject: 'Zasto AI pretrazivaci ne mogu da pronadju tvoj sajt, {name}',
  body: `Zdravo {name},

nedavno si uradio AEO Readiness Assessment i postigao {score}/{maxScore} ({tierLabel}).

Evo sta to znaci: AI pretrazivaci poput ChatGPT, Perplexity i Google AI Overviews sve brze postaju glavni nacin na koji ljudi nalaze informacije \u2014 a trenutno ne mogu da pronadju tvoj sadrzaj.

Tri najveca nedostatka koji te koche:

1. {priority1}
2. {priority2}
3. {priority3}

Dobra vest: Sve je popravljivo. Sto ranije pocnes, to veca prednost nad konkurencijom.

Pravim AEO Dashboard da to ucini lakim. Hoces da ti posaljem besplatan vodic za pocetak?

\u2014 Stefan, Osnivac, AEO Dashboard`,
  customFields: [],
}

const abandonedQuizNudge_sr = {
  id: 'abandoned_quiz_nudge_sr',
  name: 'Abandoned Quiz — Nudge (SR)',
  icon: Mail,
  lang: 'sr',
  description: 'Re-engage leads who started but didn\'t finish the assessment.',
  recommendedAudience: ['abandoned'],
  subject: '{name}, tvoj AEO Assessment te ceka',
  body: `Zdravo {name},

video sam da si zapoceo AEO Readiness Assessment, ali ga nisi zavrsio. Nema problema!

Assessment traje samo 2 minuta. Dobices:
\u2022 Tvoj AEO Readiness Score (0\u201333)
\u2022 Pregled po 4 kljucne kategorije
\u2022 Tvoja top 3 prioriteta za bolju AI vidljivost

Nastavi gde si stao: {link}

Vredi toga \u2014 77% ljudi koji zavrse pronadju bar jednu kriticnu prazninu za koju nisu znali.

\u2014 Stefan, Osnivac, AEO Dashboard`,
  customFields: [],
}

// ── LAUNCH & PRODUCT (SR) ──

const productLaunch_sr = {
  id: 'product_launch_sr',
  name: 'Product Launch Announcement (SR)',
  icon: Rocket,
  lang: 'sr',
  description: 'Announce AEO Dashboard launch to all leads.',
  recommendedAudience: ['hot', 'warm', 'cold'],
  subject: 'AEO Dashboard je aktivan \u2014 tvoj Early Access je spreman, {name}',
  body: `Zdravo {name},

dobre vesti \u2014 AEO Dashboard je zvanicno aktivan.

Kada si radio AEO Readiness Assessment, postigao si {score}/33 ({tierLabel}). Tvoj #1 prioritet je bio {priority1} \u2014 i AEO Dashboard to sada resava automatski.

Sta mozes da uradis odmah:
\u2192 Pokreni kompletan AEO audit za bilo koji URL (bez API kljuca)
\u2192 Proveri da li AI crawleri mogu da pristupe tvom sajtu
\u2192 Generiraj optimizovano Schema-Markup za sekunde
\u2192 Prati svoje AI rezultate kroz vreme.

Tvoj Early Access je spreman. Prijavi se ovde: {link}

\u2014 Stefan, Osnivac, AEO Dashboard`,
  customFields: [],
}

const betaInvite_sr = {
  id: 'beta_invite_sr',
  name: 'Exclusive Beta Invite (SR)',
  icon: Ticket,
  lang: 'sr',
  description: 'Invite high-value leads to beta test before public launch.',
  recommendedAudience: ['hot'],
  subject: 'Primljen si, {name} \u2014 AEO Dashboard beta pristup',
  body: `Zdravo {name},

pozivam malu grupu agencija da testira AEO Dashboard pre javnog lansiranja.

Na osnovu tvog Assessment-a ({score}/33) i cinjenice da upravljas sa {websiteCount}, mislim da savrseno odgovaras.

Sta dobijas:
\u2192 Pun pristup svim funkcijama tokom bete
\u2192 Direktna linija ka meni za povratne informacije i podrsku
\u2192 Zagarantovana Early Adopter cena pri lansiranju
\u2192 Tvoj input oblikuje roadmapu proizvoda.

Zainteresovan? Odgovori na ovaj mejl i podesicu ti nalog danas.

\u2014 Stefan, Osnivac, AEO Dashboard`,
  customFields: [],
}

const scoreFollowUp_sr = {
  id: 'score_follow_up_sr',
  name: 'Score Follow-Up (SR)',
  icon: BarChart3,
  lang: 'sr',
  description: 'Personalized follow-up with action plan based on their score.',
  recommendedAudience: ['hot', 'warm'],
  subject: 'Tvoj AEO Score: {score}/33 \u2014 evo tvog akcionog plana, {name}',
  body: `Zdravo {name},

kratak follow-up na tvoj AEO Readiness Assessment.

Postigao si {score}/33 ({tierLabel}). Evo sta bih ja prioritizovao da upravljam tvojim sajtovima ({websiteCount}):

1. {priority1}
2. {priority2}
3. {priority3}

Ove tri promene same po sebi mogu znacajno poboljsati tvoju AI vidljivost u pretragama.

Treba ti pomoc za pocetak? Odgovori i ukazacu ti na prave resurse.

\u2014 Stefan, Osnivac, AEO Dashboard`,
  customFields: [],
}

const earlyBirdPricing_sr = {
  id: 'early_bird_pricing_sr',
  name: 'Early Bird / Pricing (SR)',
  icon: DollarSign,
  lang: 'sr',
  description: 'Urgency-driven pricing announcement with deadline.',
  recommendedAudience: ['hot', 'warm'],
  subject: 'Early Bird cena uskoro istice \u2014 {name}, obezbedi svoj tarif',
  body: `Zdravo {name},

AEO Dashboard prelazi na punu cenu {customField1}.

Kao rani ucesnik Assessment-a, mozes da obezbedis nas osnivacki tarif:
\u2192 {customField2}

Sve je ukljuceno: neograniceni URL auditi, generisanje schema, monitoring AI crawlera, pracenje citata i PDF izvestaji za tvoje klijente.

Upravljas sa {websiteCount} \u2014 po ovoj ceni, ROI je trenutni.

Obezbedi tarif: {link}

\u2014 Stefan, Osnivac, AEO Dashboard`,
  customFields: [
    { id: 'customField1', label: 'Pricing deadline date', defaultValue: '31. mart 2026' },
    { id: 'customField2', label: 'Pricing details', defaultValue: '49 \u20AC/mesecno (regularna cena 99 \u20AC/mesecno)' },
  ],
}

// ── MARKETING & ENGAGEMENT (SR) ──

const featureUpdate_sr = {
  id: 'feature_update_sr',
  name: 'Feature Update / Newsletter (SR)',
  icon: Newspaper,
  lang: 'sr',
  description: 'Announce new features, relevant to their weakest category.',
  recommendedAudience: ['hot', 'warm', 'cold'],
  subject: 'Novo u AEO Dashboard: {customField1}',
  body: `Zdravo {name},

kratko azuriranje \u2014 upravo smo napravili nesto sto ce ti biti korisno:

{customField2}

Ovo je posebno relevantno za tebe jer je na tvom Assessment-u {weakestCategory} bila tvoja najveca praznina. Ova funkcija direktno adresira to.

Pogledaj: {link}

Sta bi voleo da vidis sledece? Samo odgovori \u2014 citam svaki odgovor.

\u2014 Stefan, Osnivac, AEO Dashboard`,
  customFields: [
    { id: 'customField1', label: 'Feature name', defaultValue: '' },
    { id: 'customField2', label: 'Feature description (2-3 sentences)', defaultValue: '' },
  ],
}

const industryInsight_sr = {
  id: 'industry_insight_sr',
  name: 'Industry Insight / Educational (SR)',
  icon: TrendingUp,
  lang: 'sr',
  description: 'Educational content to warm up cold/warm leads.',
  recommendedAudience: ['cold', 'warm'],
  subject: '{customField1}',
  body: `Zdravo {name},

{customField2}

Ovo je vazno za tvoj sajt jer AI pretrazivaci sada obradjuju milione upita dnevno \u2014 a nacin na koji biraju izvore je fundamentalno drugaciji od tradicionalnog SEO.

Na AEO Assessment-u si postigao {score}/33. Dobra vest: cak i mala poboljsanja mogu napraviti veliku razliku u ovoj fazi.

Hoces da vidis gde si sada? Ponovi Assessment: {link}

\u2014 Stefan, Osnivac, AEO Dashboard`,
  customFields: [
    { id: 'customField1', label: 'Email subject line', defaultValue: '' },
    { id: 'customField2', label: 'Opening paragraph (industry insight/stat)', defaultValue: '' },
  ],
}

const caseStudy_sr = {
  id: 'case_study_sr',
  name: 'Case Study / Social Proof (SR)',
  icon: Trophy,
  lang: 'sr',
  description: 'Share a success story relevant to their profile.',
  recommendedAudience: ['hot', 'warm'],
  subject: 'Kako je {customField1} poboljsao AEO Score za {customField2} poena',
  body: `Zdravo {name},

kratka studija slucaja koju sam hteo da podelim:

{customField3}

Tvoj trenutni Score je {score}/33 ({tierLabel}). Na osnovu tvog profila \u2014 {role} sa {websiteCount} \u2014 u slicnoj si poziciji kao sto su oni bili na pocetku.

Hoces da vidis kako bi slicna poboljsanja izgledala za tvoje sajtove? {link}

\u2014 Stefan, Osnivac, AEO Dashboard`,
  customFields: [
    { id: 'customField1', label: 'Company/person name', defaultValue: '' },
    { id: 'customField2', label: 'Points improved', defaultValue: '' },
    { id: 'customField3', label: 'Case study paragraph (3-4 sentences)', defaultValue: '' },
  ],
}

const reEngagement_sr = {
  id: 're_engagement_sr',
  name: 'Re-engagement (SR)',
  icon: RefreshCw,
  lang: 'sr',
  description: 'Win back inactive leads (30+ days since signup).',
  recommendedAudience: ['hot', 'warm', 'cold'],
  subject: 'Jos razmisljas o AEO, {name}?',
  body: `Zdravo {name},

proslo je neko vreme otkako si uradio AEO Readiness Assessment (imao si {score}/33).

Dosta toga se promenilo u AI pretrazi od tada:
\u2192 Google AI Overviews se sada pojavljuju u 40%+ pretraga
\u2192 ChatGPT Search raste 10x mesecno
\u2192 Perplexity je presao 100M mesecnih upita

Tvoja konkurencija optimizuje. A ti?

Ponovi Assessment i pogledaj svoj azurirani Score: {link}

\u2014 Stefan, Osnivac, AEO Dashboard`,
  customFields: [],
}


// ═══════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════

export const EMAIL_TEMPLATES = [
  // English (12)
  hotLeadOutreach, warmLeadNurture, coldLeadEducate, abandonedQuizNudge,
  productLaunch, betaInvite, scoreFollowUp, earlyBirdPricing,
  featureUpdate, industryInsight, caseStudy, reEngagement,
  // German (12)
  hotLeadOutreach_de, warmLeadNurture_de, coldLeadEducate_de, abandonedQuizNudge_de,
  productLaunch_de, betaInvite_de, scoreFollowUp_de, earlyBirdPricing_de,
  featureUpdate_de, industryInsight_de, caseStudy_de, reEngagement_de,
  // Serbian (12)
  hotLeadOutreach_sr, warmLeadNurture_sr, coldLeadEducate_sr, abandonedQuizNudge_sr,
  productLaunch_sr, betaInvite_sr, scoreFollowUp_sr, earlyBirdPricing_sr,
  featureUpdate_sr, industryInsight_sr, caseStudy_sr, reEngagement_sr,
]

export const TEMPLATE_GROUPS = [
  // English
  { label: 'Outreach (EN)', ids: ['hot_lead_outreach', 'warm_lead_nurture', 'cold_lead_educate', 'abandoned_quiz_nudge'] },
  { label: 'Launch & Product (EN)', ids: ['product_launch', 'beta_invite', 'score_follow_up', 'early_bird_pricing'] },
  { label: 'Marketing (EN)', ids: ['feature_update', 'industry_insight', 'case_study', 're_engagement'] },
  // German
  { label: 'Outreach (DE)', ids: ['hot_lead_outreach_de', 'warm_lead_nurture_de', 'cold_lead_educate_de', 'abandoned_quiz_nudge_de'] },
  { label: 'Launch & Product (DE)', ids: ['product_launch_de', 'beta_invite_de', 'score_follow_up_de', 'early_bird_pricing_de'] },
  { label: 'Marketing (DE)', ids: ['feature_update_de', 'industry_insight_de', 'case_study_de', 're_engagement_de'] },
  // Serbian
  { label: 'Outreach (SR)', ids: ['hot_lead_outreach_sr', 'warm_lead_nurture_sr', 'cold_lead_educate_sr', 'abandoned_quiz_nudge_sr'] },
  { label: 'Launch & Product (SR)', ids: ['product_launch_sr', 'beta_invite_sr', 'score_follow_up_sr', 'early_bird_pricing_sr'] },
  { label: 'Marketing (SR)', ids: ['feature_update_sr', 'industry_insight_sr', 'case_study_sr', 're_engagement_sr'] },
]

export function getTemplateById(id) {
  return EMAIL_TEMPLATES.find(t => t.id === id) || null
}

export function getTemplatesForAudience(audience) {
  return EMAIL_TEMPLATES.filter(t => t.recommendedAudience.includes(audience))
}

export function getTemplatesForLanguage(lang = 'en') {
  return EMAIL_TEMPLATES.filter(t => t.lang === lang)
}

/**
 * Replace {variables} in a template string with actual values.
 * Missing variables are left as-is (e.g., {customField1} stays if not provided).
 */
export function fillTemplate(text, variables = {}) {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined && variables[key] !== null && variables[key] !== ''
      ? variables[key]
      : match
  })
}

/**
 * Build variables object from a lead document + custom overrides.
 * Accepts optional lang parameter for localized labels.
 */
export function buildLeadVariables(lead, overrides = {}, lang = 'en') {
  const scorecard = lead.scorecard || {}
  const qualification = lead.qualification || {}
  const priorities = scorecard.priorities || []

  // Determine weakest category
  const cats = scorecard.categoryScores || {}
  let weakestCategory = ''
  let lowestPct = Infinity
  for (const [catId, score] of Object.entries(cats)) {
    const maxMap = { contentStructure: 9, technicalSchema: 9, aiVisibility: 9, strategyCompetition: 6 }
    const pct = (maxMap[catId] || 1) > 0 ? score / (maxMap[catId] || 1) : 1
    if (pct < lowestPct) { lowestPct = pct; weakestCategory = catId }
  }

  const catLabelsMap = {
    en: {
      contentStructure: 'Content & Structure',
      technicalSchema: 'Technical & Schema',
      aiVisibility: 'AI Visibility',
      strategyCompetition: 'Strategy & Competition',
    },
    de: {
      contentStructure: 'Content & Struktur',
      technicalSchema: 'Technik & Schema',
      aiVisibility: 'AI-Sichtbarkeit',
      strategyCompetition: 'Strategie & Wettbewerb',
    },
    sr: {
      contentStructure: 'Sadrzaj i struktura',
      technicalSchema: 'Tehnika i schema',
      aiVisibility: 'AI vidljivost',
      strategyCompetition: 'Strategija i konkurencija',
    },
  }

  const roleLabelsMap = {
    en: {
      agency_owner: 'Agency Owner / Partner',
      seo_manager: 'SEO Manager / Director',
      inhouse: 'In-house Marketing / SEO',
      freelance: 'Freelance Consultant',
      other: 'Other',
    },
    de: {
      agency_owner: 'Agentur-Inhaber / Partner',
      seo_manager: 'SEO Manager / Direktor',
      inhouse: 'Internes Marketing / SEO',
      freelance: 'Freiberuflicher Berater',
      other: 'Sonstiges',
    },
    sr: {
      agency_owner: 'Vlasnik agencije / Partner',
      seo_manager: 'SEO Menadzer / Direktor',
      inhouse: 'Interni marketing / SEO',
      freelance: 'Freelance konsultant',
      other: 'Ostalo',
    },
  }

  const websiteLabelsMap = {
    en: {
      '10plus': '10+ client websites',
      '3to9': '3\u20139 websites',
      '1to2': '1\u20132 websites',
      just_own: 'just your own website',
    },
    de: {
      '10plus': '10+ Kunden-Websites',
      '3to9': '3\u20139 Websites',
      '1to2': '1\u20132 Websites',
      just_own: 'nur Ihre eigene Website',
    },
    sr: {
      '10plus': '10+ klijentskih sajtova',
      '3to9': '3\u20139 sajtova',
      '1to2': '1\u20132 sajta',
      just_own: 'samo svoj sajt',
    },
  }

  const tierLabelsMap = {
    en: { invisible: 'AI Invisible', starting: 'Getting Started', onTrack: 'On Track', aiReady: 'AI Ready' },
    de: { invisible: 'AI-unsichtbar', starting: 'Am Anfang', onTrack: 'Auf Kurs', aiReady: 'AI-bereit' },
    sr: { invisible: 'AI nevidljiv', starting: 'Pocetak', onTrack: 'Na dobrom putu', aiReady: 'Spreman za AI' },
  }

  const catLabels = catLabelsMap[lang] || catLabelsMap.en
  const roleLabels = roleLabelsMap[lang] || roleLabelsMap.en
  const websiteLabels = websiteLabelsMap[lang] || websiteLabelsMap.en
  const tierLabels = tierLabelsMap[lang] || tierLabelsMap.en

  const BASE_PATH = '/AEO-Dashboard/'
  const SITE_URL = `https://stefanninkov.github.io${BASE_PATH}`

  return {
    name: lead.name || 'there',
    email: lead.email || '',
    score: scorecard.totalScore ?? '\u2014',
    maxScore: '33',
    tierLabel: tierLabels[scorecard.tier] || scorecard.tier || '\u2014',
    weakestCategory: catLabels[weakestCategory] || weakestCategory || '\u2014',
    websiteCount: websiteLabels[qualification.websiteCount] || qualification.websiteCount || '\u2014',
    role: roleLabels[qualification.role] || qualification.role || '\u2014',
    priority1: priorities[0]?.title || priorities[0]?.id || '\u2014',
    priority2: priorities[1]?.title || priorities[1]?.id || '\u2014',
    priority3: priorities[2]?.title || priorities[2]?.id || '\u2014',
    link: SITE_URL,
    ...overrides,
  }
}
