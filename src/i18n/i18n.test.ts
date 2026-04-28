// Tests de la configuration i18n — parité des clés et initialisation correcte
import { describe, it, expect, afterEach } from 'vitest';
import i18n from './index';
import fr from './locales/fr.json';
import en from './locales/en.json';

// Extrait toutes les clés d'un objet imbriqué sous forme de notation pointée (ex: "errors.nom.required")
const extractKeys = (obj: Record<string, unknown>, prefix = ''): string[] => {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return extractKeys(value as Record<string, unknown>, fullKey);
    }
    return [fullKey];
  });
};

describe('i18n configuration', () => {
  // Restaure la langue française après chaque test pour éviter les interférences
  afterEach(() => {
    i18n.changeLanguage('fr');
  });

  it('should be initialized on import', () => {
    expect(i18n.isInitialized).toBe(true);
  });

  it('should default to French', () => {
    expect(i18n.language).toBe('fr');
  });

  it('should have French and English as available languages', () => {
    const languages = Object.keys(i18n.services.resourceStore.data);
    expect(languages).toContain('fr');
    expect(languages).toContain('en');
  });

  it('should correctly resolve a French translation', () => {
    i18n.changeLanguage('fr');
    expect(i18n.t('app.title')).toBe('Gestionnaire de Contacts');
  });

  it('should correctly resolve an English translation after language change', () => {
    i18n.changeLanguage('en');
    expect(i18n.t('app.title')).toBe('Contact Manager');
  });

  it('should resolve French error keys used by the validation utilities', () => {
    i18n.changeLanguage('fr');
    expect(i18n.t('errors.nom.minLength')).toBeTruthy();
    expect(i18n.t('errors.email.invalid')).toBeTruthy();
    expect(i18n.t('errors.dateDecès.beforeNaissance')).toBeTruthy();
    expect(i18n.t('errors.parents.identical')).toBeTruthy();
    expect(i18n.t('errors.name.duplicate')).toBeTruthy();
  });
});

// Parité des clés — garantit qu'aucune traduction n'est manquante dans l'une des deux langues
describe('i18n key parity (fr ↔ en)', () => {
  it('should have the exact same keys in fr.json and en.json', () => {
    const frKeys = extractKeys(fr as unknown as Record<string, unknown>).sort();
    const enKeys = extractKeys(en as unknown as Record<string, unknown>).sort();

    expect(enKeys).toEqual(frKeys);
  });

  it('should have no empty string values in fr.json', () => {
    const frKeys = extractKeys(fr as unknown as Record<string, unknown>);
    const frFlat = fr as unknown as Record<string, unknown>;

    frKeys.forEach((key) => {
      const value = key.split('.').reduce(
        (obj, k) => (obj as Record<string, unknown>)?.[k],
        frFlat as unknown
      );
      expect(typeof value === 'string' && value.length > 0, `Key "${key}" is empty in fr.json`).toBe(true);
    });
  });

  it('should have no empty string values in en.json', () => {
    const enKeys = extractKeys(en as unknown as Record<string, unknown>);
    const enFlat = en as unknown as Record<string, unknown>;

    enKeys.forEach((key) => {
      const value = key.split('.').reduce(
        (obj, k) => (obj as Record<string, unknown>)?.[k],
        enFlat as unknown
      );
      expect(typeof value === 'string' && value.length > 0, `Key "${key}" is empty in en.json`).toBe(true);
    });
  });
});
