import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// English namespaces — loaded eagerly (default language)
import commonEn from './locales/en/common.json'
import appEn from './locales/en/app.json'
import checklistEn from './locales/en/checklist.json'
import landingEn from './locales/en/landing.json'
import waitlistEn from './locales/en/waitlist.json'
import docsEn from './locales/en/docs.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'sr', label: 'Serbian', nativeLabel: 'Српски' },
]

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: commonEn,
        app: appEn,
        checklist: checklistEn,
        landing: landingEn,
        waitlist: waitlistEn,
        docs: docsEn,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'app', 'checklist', 'landing', 'waitlist', 'docs'],
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'aeo-language',
      caches: ['localStorage'],
    },
    // Only match exact supported languages (en, de, sr)
    supportedLngs: ['en', 'de', 'sr'],
    // Don't load region-specific variants (e.g. en-US → en)
    nonExplicitSupportedLngs: true,
  })

// Keep <html lang> in sync
i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('lang', lng)
})

// Lazy-load German and Serbian bundles on demand
const lazyBundles = {
  de: () =>
    Promise.all([
      import('./locales/de/common.json'),
      import('./locales/de/app.json'),
      import('./locales/de/checklist.json'),
      import('./locales/de/landing.json'),
      import('./locales/de/waitlist.json'),
      import('./locales/de/docs.json'),
    ]).then(([common, app, checklist, landing, waitlist, docs]) => ({
      common: common.default,
      app: app.default,
      checklist: checklist.default,
      landing: landing.default,
      waitlist: waitlist.default,
      docs: docs.default,
    })),
  sr: () =>
    Promise.all([
      import('./locales/sr/common.json'),
      import('./locales/sr/app.json'),
      import('./locales/sr/checklist.json'),
      import('./locales/sr/landing.json'),
      import('./locales/sr/waitlist.json'),
      import('./locales/sr/docs.json'),
    ]).then(([common, app, checklist, landing, waitlist, docs]) => ({
      common: common.default,
      app: app.default,
      checklist: checklist.default,
      landing: landing.default,
      waitlist: waitlist.default,
      docs: docs.default,
    })),
}

/**
 * Switch language, lazy-loading the bundle if needed.
 * @param {string} lng - Language code ('en', 'de', or 'sr')
 */
export async function loadLanguage(lng) {
  // English is already loaded
  if (lng === 'en') {
    return i18n.changeLanguage(lng)
  }

  // Already loaded this language's bundles
  if (i18n.hasResourceBundle(lng, 'common')) {
    return i18n.changeLanguage(lng)
  }

  // Lazy-load
  const loader = lazyBundles[lng]
  if (!loader) {
    return i18n.changeLanguage('en')
  }

  const bundles = await loader()
  Object.entries(bundles).forEach(([ns, data]) => {
    i18n.addResourceBundle(lng, ns, data, true, true)
  })

  return i18n.changeLanguage(lng)
}

// Auto-restore persisted non-English language on startup
const persistedLang = localStorage.getItem('aeo-language')
if (persistedLang && persistedLang !== 'en' && lazyBundles[persistedLang]) {
  loadLanguage(persistedLang)
}

export default i18n
