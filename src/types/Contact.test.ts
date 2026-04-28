// Tests du type Contact — vérification de la forme et des contraintes de la structure
import { describe, it, expect } from 'vitest';
import type { Contact } from './Contact';

describe('Contact type', () => {
  // Vérifie qu'un contact valide avec tous les champs obligatoires peut être créé
  it('should accept a contact with required fields only', () => {
    const contact: Contact = {
      id: '1',
      nom: 'Dupont',
      prenom: 'Jean',
      dateNaissance: new Date('1990-01-15'),
      email: 'jean.dupont@email.com',
    };

    expect(contact.id).toBe('1');
    expect(contact.nom).toBe('Dupont');
    expect(contact.prenom).toBe('Jean');
    expect(contact.dateNaissance).toBeInstanceOf(Date);
    expect(contact.email).toBe('jean.dupont@email.com');
  });

  // Vérifie que les champs optionnels peuvent être omis
  it('should have dateDecès, pere and mere as optional fields', () => {
    const contact: Contact = {
      id: '2',
      nom: 'Martin',
      prenom: 'Marie',
      dateNaissance: new Date('1985-06-20'),
      email: 'marie.martin@email.com',
    };

    expect(contact.dateDecès).toBeUndefined();
    expect(contact.pere).toBeUndefined();
    expect(contact.mere).toBeUndefined();
  });

  // Vérifie qu'un contact peut référencer d'autres contacts en tant que père et mère
  it('should accept Contact references for pere and mere', () => {
    const pere: Contact = {
      id: '10',
      nom: 'Dupont',
      prenom: 'Paul',
      dateNaissance: new Date('1960-03-10'),
      email: 'paul.dupont@email.com',
    };

    const mere: Contact = {
      id: '11',
      nom: 'Dupont',
      prenom: 'Sylvie',
      dateNaissance: new Date('1962-07-25'),
      email: 'sylvie.dupont@email.com',
    };

    const enfant: Contact = {
      id: '12',
      nom: 'Dupont',
      prenom: 'Lucas',
      dateNaissance: new Date('1990-11-05'),
      email: 'lucas.dupont@email.com',
      pere,
      mere,
    };

    expect(enfant.pere?.id).toBe('10');
    expect(enfant.pere?.nom).toBe('Dupont');
    expect(enfant.mere?.id).toBe('11');
    expect(enfant.mere?.prenom).toBe('Sylvie');
  });

  // Vérifie qu'un contact peut avoir une date de décès
  it('should accept an optional dateDecès', () => {
    const contact: Contact = {
      id: '3',
      nom: 'Leroy',
      prenom: 'Henri',
      dateNaissance: new Date('1920-04-01'),
      dateDecès: new Date('2000-12-31'),
      email: 'henri.leroy@email.com',
    };

    expect(contact.dateDecès).toBeInstanceOf(Date);
    expect(contact.dateDecès?.getFullYear()).toBe(2000);
  });

  // Vérifie que pere et mere peuvent être null (sélection explicitement vide)
  it('should accept null for pere and mere', () => {
    const contact: Contact = {
      id: '4',
      nom: 'Bernard',
      prenom: 'Alice',
      dateNaissance: new Date('1995-08-14'),
      email: 'alice.bernard@email.com',
      pere: null,
      mere: null,
    };

    expect(contact.pere).toBeNull();
    expect(contact.mere).toBeNull();
  });
});
