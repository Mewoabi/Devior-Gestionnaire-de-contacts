// Configuration d'i18next — initialisation avec les langues française (défaut) et anglaise
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fr from './locales/fr.json';
import en from './locales/en.json';

// Évite une double initialisation si le module est importé plusieurs fois (ex: tests)
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        fr: { translation: fr },
        en: { translation: en },
      },
      // Langue par défaut — le français selon la spécification du projet
      lng: 'fr',
      fallbackLng: 'fr',
      interpolation: {
        // React gère déjà l'échappement XSS, inutile de le doubler
        escapeValue: false,
      },
    });
}

export default i18n;
