import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
// Optional ICU (comment out if you don't want it)
import ICU from 'i18next-icu';

import en from './locales/en/en.common.json';
import enBudget from './locales/en/en.budget.json';
import enInsights from './locales/en/en.insights.json';
import enSettings from './locales/en/en.settings.json';
import enOnboarding from './locales/en/en.onboarding.json';
import enTaxonomy from './locales/en/en.taxonomy.json';
import enHistory from './locales/en/en.history.json';
import ro from './locales/ro/ro.common.json';
import roBudget from './locales/ro/ro.budget.json';
import roInsights from './locales/ro/ro.insights.json';
import roSettings from './locales/ro/ro.settings.json';
import roOnboarding from './locales/ro/ro.onboarding.json';
import roTaxonomy from './locales/ro/ro.taxonomy.json';
import roHistory from './locales/ro/ro.history.json';

// If you want custom number/date formats without ICU,
// you can add i18n.services.formatter?.add() in a separate file.

void i18n
  // comment out .use(ICU) if not using ICU
  .use(new ICU())
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // We bundle resources, so no HTTP backend is needed
    resources: {
      en: {
        common: en,
        budget: enBudget,
        insights: enInsights,
        settings: enSettings,
        onboarding: enOnboarding,
        taxonomy: enTaxonomy,
        history: enHistory,
      },
      ro: {
        common: ro,
        budget: roBudget,
        insights: roInsights,
        settings: roSettings,
        onboarding: roOnboarding,
        taxonomy: roTaxonomy,
        history: roHistory,
      },
    },
    ns: ['common', 'budget', 'insights', 'settings', 'onboarding', 'taxonomy', 'history'],
    defaultNS: 'common',
    fallbackLng: 'en',
    supportedLngs: ['en', 'ro'],
    detection: {
      // Order: explicit setting → localStorage → navigator language
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // react already escapes
    },
    // Keep keys in dev to spot missing ones:
    saveMissing: false,
    debug: process.env.NODE_ENV === 'development',
    returnNull: false,
  });

export default i18n;
