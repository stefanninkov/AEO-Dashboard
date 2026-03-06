import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * useSeoStore — SEO analysis state, API keys, cached results
 *
 * Manages:
 * - SEO API key configuration (SEMrush, Ahrefs, Moz)
 * - Cached analysis results
 * - Active analysis state
 * - Recommendations
 */
export const useSeoStore = create(
  persist(
    (set, get) => ({
      // ── API Key Configuration ──
      apiKeys: {
        semrush: '',
        ahrefs: '',
        moz: '',
      },
      setApiKey: (provider, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        })),
      hasAnyApiKey: () => {
        const { apiKeys } = get()
        return Object.values(apiKeys).some((k) => k.length > 0)
      },

      // ── Proxy configuration ──
      useProxy: false,
      setUseProxy: (val) => set({ useProxy: val }),

      // ── Analysis cache ──
      analysisCache: {},
      setCachedAnalysis: (url, provider, data) =>
        set((state) => ({
          analysisCache: {
            ...state.analysisCache,
            [`${provider}:${url}`]: {
              data,
              cachedAt: new Date().toISOString(),
            },
          },
        })),
      getCachedAnalysis: (url, provider, maxAgeMs = 3600000) => {
        const entry = get().analysisCache[`${provider}:${url}`]
        if (!entry) return null
        const age = Date.now() - new Date(entry.cachedAt).getTime()
        if (age > maxAgeMs) return null
        return entry.data
      },
      clearCache: () => set({ analysisCache: {} }),

      // ── Active analysis ──
      analyzing: false,
      analysisProgress: 0,
      setAnalyzing: (val) => set({ analyzing: val }),
      setAnalysisProgress: (val) => set({ analysisProgress: val }),

      // ── Recommendations (Phase 1.5) ──
      recommendations: [],
      setRecommendations: (recs) => set({ recommendations: recs }),
      dismissRecommendation: (id) =>
        set((state) => ({
          recommendations: state.recommendations.filter((r) => r.id !== id),
        })),
    }),
    {
      name: 'aeo-seo-store',
      // Only persist API keys and proxy config — not cache or transient state
      partialize: (state) => ({
        apiKeys: state.apiKeys,
        useProxy: state.useProxy,
      }),
    }
  )
)
