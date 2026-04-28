// Tests des utilitaires de validation — couverture exhaustive des 7 règles métier
import { describe, it, expect } from 'vitest';
import {
  validateNom,
  validatePrenom,
  validateEmail,
  validateDateNaissance,
  validateDateDecès,
  validateParents,
  validateUniqueName,
  validateContact,
} from './validation';
import type { Contact } from '../types';

// Contacts de base réutilisés dans plusieurs tests
const contactA: Contact = {
  id: '1',
  nom: 'Dupont',
  prenom: 'Jean',
  dateNaissance: new Date('1980-01-01'),
  email: 'jean.dupont@email.com',
};

const contactB: Contact = {
  id: '2',
  nom: 'Martin',
  prenom: 'Sophie',
  dateNaissance: new Date('1985-05-20'),
  email: 'sophie.martin@email.com',
};

const existingContacts: Contact[] = [contactA, contactB];

// ─── Règle 1 : nom ≥ 3 caractères après trim() ───────────────────────────────
describe('validateNom', () => {
  it('should return null for a valid nom (≥ 3 chars)', () => {
    expect(validateNom('Dupont')).toBeNull();
  });

  it('should return null when nom has exactly 3 chars', () => {
    expect(validateNom('Doe')).toBeNull();
  });

  it('should return null when nom has leading/trailing spaces but ≥ 3 chars after trim', () => {
    expect(validateNom('  Dupont  ')).toBeNull();
  });

  it('should return an error key when nom is empty', () => {
    expect(validateNom('')).toBe('errors.nom.required');
  });

  it('should return an error key when nom is only whitespace', () => {
    expect(validateNom('   ')).toBe('errors.nom.required');
  });

  it('should return an error key when nom has fewer than 3 chars after trim', () => {
    expect(validateNom('Du')).toBe('errors.nom.minLength');
  });

  it('should return an error key when nom is exactly 2 chars with spaces trimmed', () => {
    expect(validateNom('  Du  ')).toBe('errors.nom.minLength');
  });
});

// ─── Règle 2 : prenom ≥ 3 caractères après trim() ────────────────────────────
describe('validatePrenom', () => {
  it('should return null for a valid prenom (≥ 3 chars)', () => {
    expect(validatePrenom('Sophie')).toBeNull();
  });

  it('should return null when prenom has exactly 3 chars', () => {
    expect(validatePrenom('Ana')).toBeNull();
  });

  it('should return null when prenom has leading/trailing spaces but ≥ 3 chars after trim', () => {
    expect(validatePrenom('  Sophie  ')).toBeNull();
  });

  it('should return an error key when prenom is empty', () => {
    expect(validatePrenom('')).toBe('errors.prenom.required');
  });

  it('should return an error key when prenom is only whitespace', () => {
    expect(validatePrenom('   ')).toBe('errors.prenom.required');
  });

  it('should return an error key when prenom has fewer than 3 chars after trim', () => {
    expect(validatePrenom('So')).toBe('errors.prenom.minLength');
  });
});

// ─── Règle 3 : email valide ───────────────────────────────────────────────────
describe('validateEmail', () => {
  it('should return null for a standard valid email', () => {
    expect(validateEmail('jean.dupont@email.com')).toBeNull();
  });

  it('should return null for an email with subdomains and tags', () => {
    expect(validateEmail('user+tag@domain.co.uk')).toBeNull();
  });

  it('should return an error key when email is empty', () => {
    expect(validateEmail('')).toBe('errors.email.required');
  });

  it('should return an error key when email has no @ symbol', () => {
    expect(validateEmail('notanemail')).toBe('errors.email.invalid');
  });

  it('should return an error key when email has no domain', () => {
    expect(validateEmail('user@')).toBe('errors.email.invalid');
  });

  it('should return an error key when email has no TLD', () => {
    expect(validateEmail('user@domain')).toBe('errors.email.invalid');
  });

  it('should return an error key when email has spaces', () => {
    expect(validateEmail('user @email.com')).toBe('errors.email.invalid');
  });
});

// ─── Règle 5 : dateNaissance obligatoire ─────────────────────────────────────
describe('validateDateNaissance', () => {
  it('should return null for a valid date', () => {
    expect(validateDateNaissance(new Date('1990-06-15'))).toBeNull();
  });

  it('should return an error key when date is null', () => {
    expect(validateDateNaissance(null)).toBe('errors.dateNaissance.required');
  });
});

// ─── Règle 6 : dateDecès optionnel mais strictement après dateNaissance ───────
describe('validateDateDecès', () => {
  const birthDate = new Date('1980-01-01');

  it('should return null when dateDecès is undefined (field is optional)', () => {
    expect(validateDateDecès(undefined, birthDate)).toBeNull();
  });

  it('should return null when dateDecès is null (field is optional)', () => {
    expect(validateDateDecès(null, birthDate)).toBeNull();
  });

  it('should return null when dateDecès is strictly after dateNaissance', () => {
    expect(validateDateDecès(new Date('2020-06-15'), birthDate)).toBeNull();
  });

  it('should return an error key when dateDecès equals dateNaissance', () => {
    expect(validateDateDecès(new Date('1980-01-01'), birthDate)).toBe(
      'errors.dateDecès.beforeNaissance'
    );
  });

  it('should return an error key when dateDecès is before dateNaissance', () => {
    expect(validateDateDecès(new Date('1970-01-01'), birthDate)).toBe(
      'errors.dateDecès.beforeNaissance'
    );
  });

  it('should return null when dateNaissance is null (cannot validate without it)', () => {
    expect(validateDateDecès(new Date('2020-01-01'), null)).toBeNull();
  });
});

// ─── Règle 7 : pere et mere doivent être des contacts différents ──────────────
describe('validateParents', () => {
  it('should return null when both pere and mere are null', () => {
    expect(validateParents(null, null)).toBeNull();
  });

  it('should return null when both pere and mere are undefined', () => {
    expect(validateParents(undefined, undefined)).toBeNull();
  });

  it('should return null when only pere is provided', () => {
    expect(validateParents(contactA, null)).toBeNull();
  });

  it('should return null when only mere is provided', () => {
    expect(validateParents(null, contactB)).toBeNull();
  });

  it('should return null when pere and mere are different contacts', () => {
    expect(validateParents(contactA, contactB)).toBeNull();
  });

  it('should return an error key when pere and mere point to the same contact', () => {
    expect(validateParents(contactA, contactA)).toBe('errors.parents.identical');
  });
});

// ─── Règle 4 : nom complet unique dans la liste ───────────────────────────────
describe('validateUniqueName', () => {
  it('should return null when the name does not exist in the contacts list', () => {
    expect(validateUniqueName('Leroy', 'Claire', existingContacts)).toBeNull();
  });

  it('should return an error key when nom + prenom already exists', () => {
    expect(validateUniqueName('Dupont', 'Jean', existingContacts)).toBe(
      'errors.name.duplicate'
    );
  });

  it('should be case-insensitive when checking duplicates', () => {
    expect(validateUniqueName('dupont', 'jean', existingContacts)).toBe(
      'errors.name.duplicate'
    );
  });

  it('should ignore leading/trailing spaces when checking duplicates', () => {
    expect(validateUniqueName('  Dupont  ', '  Jean  ', existingContacts)).toBe(
      'errors.name.duplicate'
    );
  });

  it('should return null when the matching contact is the one being edited (excludeId)', () => {
    // Lors de l'édition, on exclut le contact courant de la vérification de doublon
    expect(validateUniqueName('Dupont', 'Jean', existingContacts, '1')).toBeNull();
  });

  it('should still detect duplicates with a different excludeId', () => {
    expect(validateUniqueName('Dupont', 'Jean', existingContacts, '99')).toBe(
      'errors.name.duplicate'
    );
  });
});

// ─── validateContact : agrégateur de toutes les règles ───────────────────────
describe('validateContact', () => {
  it('should return an empty object for fully valid contact data', () => {
    const validData: Partial<Contact> = {
      nom: 'Leroy',
      prenom: 'Claire',
      dateNaissance: new Date('1990-01-01'),
      email: 'claire.leroy@email.com',
    };
    expect(validateContact(validData, existingContacts)).toEqual({});
  });

  it('should return errors for all invalid fields at once', () => {
    const invalidData: Partial<Contact> = {
      nom: 'Du',
      prenom: '',
      dateNaissance: null as unknown as Date,
      email: 'not-an-email',
    };
    const errors = validateContact(invalidData, existingContacts);

    expect(errors).toHaveProperty('nom');
    expect(errors).toHaveProperty('prenom');
    expect(errors).toHaveProperty('email');
    expect(errors).toHaveProperty('dateNaissance');
  });

  it('should include a duplicate name error on the nom field', () => {
    const duplicateData: Partial<Contact> = {
      nom: 'Dupont',
      prenom: 'Jean',
      dateNaissance: new Date('1990-01-01'),
      email: 'autre@email.com',
    };
    const errors = validateContact(duplicateData, existingContacts);

    expect(errors.nom).toBe('errors.name.duplicate');
  });

  it('should include a dateDecès error when death date is before birth date', () => {
    const data: Partial<Contact> = {
      nom: 'Nouveau',
      prenom: 'Test',
      dateNaissance: new Date('1990-01-01'),
      dateDecès: new Date('1980-01-01'),
      email: 'nouveau.test@email.com',
    };
    const errors = validateContact(data, existingContacts);

    expect(errors).toHaveProperty('dateDecès');
  });

  it('should include a parents error when pere and mere are the same contact', () => {
    const data: Partial<Contact> = {
      nom: 'Enfant',
      prenom: 'Test',
      dateNaissance: new Date('2000-01-01'),
      email: 'enfant.test@email.com',
      pere: contactA,
      mere: contactA,
    };
    const errors = validateContact(data, existingContacts);

    expect(errors).toHaveProperty('parents');
  });

  it('should skip the duplicate check when excludeId matches the existing contact', () => {
    const data: Partial<Contact> = {
      nom: 'Dupont',
      prenom: 'Jean',
      dateNaissance: new Date('1980-01-01'),
      email: 'jean.dupont@email.com',
    };
    // Édition du contact existant — pas d'erreur de doublon attendue
    const errors = validateContact(data, existingContacts, '1');

    expect(errors.nom).toBeUndefined();
  });
});
