import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// English namespaces — loaded eagerly (only language)
import commonEn from './locales/en/common.json'
import appEn from './locales/en/app.json'
import checklistEn from './locales/en/checklist.json'
import landingEn from './locales/en/landing.json'
import waitlistEn from './locales/en/waitlist.json'
import docsEn from './locales/en/docs.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
]

i18n
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
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'app', 'checklist', 'landing', 'waitlist', 'docs'],
    interpolation: {
      escapeValue: false, // React already escapes
    },
    supportedLngs: ['en'],
  })

// Keep <html lang> in sync
i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('lang', lng)
})

/**
 * Switch language — currently English-only.
 * @param {string} lng - Language code
 */
export async function loadLanguage(lng) {
  return i18n.changeLanguage('en')
}

export default i18n
