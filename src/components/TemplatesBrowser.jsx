import { useState, useCallback, useMemo, memo } from 'react'
import {
  X, FileText, Code2, HelpCircle, Package, PenTool, Layout,
  BookOpen, Search, Star, StarOff, Plus, Copy,
} from 'lucide-react'

/* ── Built-in Templates ── */
const BUILTIN_TEMPLATES = [
  // Content templates
  {
    id: 'tpl-blog-post',
    category: 'content',
    i18nKey: 'templates.blogPost',
    fallbackName: 'Blog Post',
    icon: 'FileText',
    description: 'templates.blogPostDesc',
    fallbackDesc: 'Structured blog post optimized for AI citations with FAQ section, key takeaways, and structured data.',
    fields: {
      schemaType: 'Article',
      title: 'Blog Post', topic: '', targetKeywords: '', tone: 'informative',
      sections: ['Introduction', 'Key Points', 'Deep Dive', 'FAQ', 'Conclusion'],
      includeFaq: true, includeSchema: true,
    },
  },
  {
    id: 'tpl-faq-page',
    category: 'content',
    i18nKey: 'templates.faqPage',
    fallbackName: 'FAQ Page',
    icon: 'HelpCircle',
    fields: {
      title: 'Frequently Asked Questions', questions: [],
      includeSchema: true, schemaType: 'FAQPage',
    },
    description: 'templates.faqPageDesc',
    fallbackDesc: 'FAQ page with automatic FAQPage schema markup generation.',
  },
  {
    id: 'tpl-product-page',
    category: 'content',
    i18nKey: 'templates.productPage',
    fallbackName: 'Product Page',
    icon: 'Package',
    fields: {
      schemaType: 'Product',
      productName: 'Product Page', description: '', features: [], pricing: '',
      includeSchema: true,
    },
    description: 'templates.productPageDesc',
    fallbackDesc: 'Product landing page with Product schema and review snippets.',
  },
  {
    id: 'tpl-landing-page',
    category: 'content',
    i18nKey: 'templates.landingPage',
    fallbackName: 'Landing Page',
    icon: 'Layout',
    fields: {
      schemaType: 'Organization',
      headline: 'Landing Page', subheadline: '', cta: '', features: [],
      testimonials: [], faq: [],
    },
    description: 'templates.landingPageDesc',
    fallbackDesc: 'Conversion-optimized landing page with hero, features, social proof, and CTA.',
  },
  // Schema templates
  {
    id: 'tpl-schema-org',
    category: 'schema',
    i18nKey: 'templates.organizationSchema',
    fallbackName: 'Organization Schema',
    icon: 'Code2',
    fields: {
      type: 'Organization', name: '', url: '', logo: '',
      sameAs: [], contactPoint: {},
    },
    description: 'templates.orgSchemaDesc',
    fallbackDesc: 'Organization structured data for brand knowledge panel.',
  },
  {
    id: 'tpl-schema-article',
    category: 'schema',
    i18nKey: 'templates.articleSchema',
    fallbackName: 'Article Schema',
    icon: 'BookOpen',
    fields: {
      type: 'Article', headline: '', author: '', datePublished: '',
      image: '', publisher: {},
    },
    description: 'templates.articleSchemaDesc',
    fallbackDesc: 'Article structured data for news and blog posts.',
  },
  {
    id: 'tpl-schema-howto',
    category: 'schema',
    i18nKey: 'templates.howToSchema',
    fallbackName: 'HowTo Schema',
    icon: 'Code2',
    fields: {
      type: 'HowTo', name: '', steps: [], totalTime: '',
      estimatedCost: '',
    },
    description: 'templates.howToSchemaDesc',
    fallbackDesc: 'HowTo structured data for step-by-step guides.',
  },
  // Analysis templates
  {
    id: 'tpl-analysis-full',
    category: 'analysis',
    i18nKey: 'templates.fullAnalysis',
    fallbackName: 'Full SEO + AEO Analysis',
    icon: 'Search',
    fields: {
      checkTechnical: true, checkContent: true, checkSchema: true,
      checkAuthority: true, checkCitations: true, depth: 'deep',
    },
    description: 'templates.fullAnalysisDesc',
    fallbackDesc: 'Complete analysis covering all SEO and AEO dimensions.',
  },
  {
    id: 'tpl-analysis-quick',
    category: 'analysis',
    i18nKey: 'templates.quickAudit',
    fallbackName: 'Quick Audit',
    icon: 'Search',
    fields: {
      checkTechnical: true, checkContent: true, checkSchema: false,
      checkAuthority: false, checkCitations: false, depth: 'shallow',
    },
    description: 'templates.quickAuditDesc',
    fallbackDesc: 'Fast technical and content check for quick wins.',
  },
]

const ICON_MAP = {
  FileText, Code2, HelpCircle, Package, PenTool, Layout, BookOpen, Search,
}

const CATEGORIES = [
  { id: 'all', i18nKey: 'templates.allCategories', fallback: 'All' },
  { id: 'content', i18nKey: 'templates.content', fallback: 'Content' },
  { id: 'schema', i18nKey: 'templates.schema', fallback: 'Schema' },
  { id: 'analysis', i18nKey: 'templates.analysis', fallback: 'Analysis' },
  { id: 'custom', i18nKey: 'templates.custom', fallback: 'My Templates' },
]

const CUSTOM_STORAGE_KEY = 'aeo-custom-templates'

function loadCustomTemplates() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_STORAGE_KEY) || '[]') } catch { return [] }
}

function saveCustomTemplates(templates) {
  try { localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(templates)) } catch { /* non-critical */ }
}

const TemplatesBrowser = memo(function TemplatesBrowser({
  isOpen, onClose, onSelect, category: initialCategory,
}) {
const [activeCategory, setActiveCategory] = useState(initialCategory || 'all')
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aeo-template-favorites') || '[]') } catch { return [] }
  })
  const [customTemplates, setCustomTemplates] = useState(() => loadCustomTemplates())

  const allTemplates = useMemo(() => [
    ...BUILTIN_TEMPLATES,
    ...customTemplates.map(ct => ({ ...ct, category: 'custom' })),
  ], [customTemplates])

  const filtered = useMemo(() => {
    return allTemplates.filter(tpl => {
      if (activeCategory !== 'all' && tpl.category !== activeCategory) return false
      if (search) {
        const name = tpl.fallbackName.toLowerCase()
        const desc = (tpl.fallbackDesc || '').toLowerCase()
        const q = search.toLowerCase()
        return name.includes(q) || desc.includes(q)
      }
      return true
    })
  }, [allTemplates, activeCategory, search])

  const toggleFavorite = useCallback((id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      try { localStorage.setItem('aeo-template-favorites', JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const handleSaveCustom = useCallback((template) => {
    const custom = {
      ...template,
      id: `custom-${Date.now()}`,
      category: 'custom',
      i18nKey: null,
      fallbackName: template.name || 'Custom Template',
    }
    const updated = [...customTemplates, custom]
    setCustomTemplates(updated)
    saveCustomTemplates(updated)
  }, [customTemplates])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 'var(--z-modal)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-label={'Templates'}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '40rem', maxWidth: 'calc(100vw - 2rem)',
          maxHeight: 'calc(100vh - 4rem)',
          background: 'var(--bg-card)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)',
          zIndex: 'var(--z-modal)', display: 'flex', flexDirection: 'column',
          animation: 'fade-in 0.2s ease-out',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 700,
            color: 'var(--text-primary)', margin: 0,
          }}>
            {'Templates'}
          </h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Search + Categories */}
        <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            background: 'var(--bg-page)', borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-3)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 'var(--space-3)',
          }}>
            <Search size={14} style={{ color: 'var(--text-disabled)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={'Search templates...'}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 'var(--text-sm)', color: 'var(--text-primary)',
                flex: 1,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="tab-segmented"
                data-active={activeCategory === cat.id || undefined}
                style={{ fontSize: 'var(--text-2xs)', padding: '4px 10px' }}
              >
                {cat.fallback}
              </button>
            ))}
          </div>
        </div>

        {/* Template grid */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: 'var(--space-4)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))',
          gap: 'var(--space-3)', alignContent: 'start',
        }}>
          {filtered.map(tpl => {
            const IconComp = ICON_MAP[tpl.icon] || FileText
            const isFav = favorites.includes(tpl.id)
            return (
              <div
                key={tpl.id}
                className="card card-md"
                style={{
                  cursor: 'pointer', transition: 'border-color 0.15s, transform 0.15s',
                  position: 'relative',
                }}
                onClick={() => { onSelect(tpl); onClose() }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.transform = 'none'
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') { onSelect(tpl); onClose() } }}
              >
                {/* Favorite star */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(tpl.id) }}
                  style={{
                    position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                    color: isFav ? 'var(--color-warning)' : 'var(--text-disabled)',
                  }}
                  aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFav ? <Star size={12} fill="currentColor" /> : <StarOff size={12} />}
                </button>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  marginBottom: 'var(--space-2)',
                }}>
                  <div style={{
                    width: '1.75rem', height: '1.75rem', borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--accent-muted)',
                  }}>
                    <IconComp size={14} style={{ color: 'var(--accent)' }} />
                  </div>
                  <span style={{
                    fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)',
                  }}>
                    {tpl.fallbackName}
                  </span>
                </div>
                <p style={{
                  fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)',
                  lineHeight: 1.4, margin: 0,
                }}>
                  {(tpl.fallbackDesc || '')}
                </p>
                <div style={{
                  marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-1)',
                }}>
                  <span style={{
                    fontSize: 'var(--text-2xs)', padding: '1px 6px',
                    background: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-tertiary)', textTransform: 'capitalize',
                  }}>
                    {tpl.category}
                  </span>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div style={{
              gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-8)',
              color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)',
            }}>
              {'No templates found.'}
            </div>
          )}
        </div>
      </div>
    </>
  )
})

export default TemplatesBrowser
