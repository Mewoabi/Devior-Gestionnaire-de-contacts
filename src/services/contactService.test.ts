// Tests du service de contacts — vérification des appels API CRUD via le mock adapter
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
} from './contactService';
import { resetMockData } from '../mocks/mockAdapter';
import type { Contact } from '../types';

describe('Contact Service', () => {
  // Réinitialisation de l'état du mock avant chaque test
  beforeEach(() => {
    resetMockData();
  });

  describe('getContacts', () => {
    it('should return an array of contacts', async () => {
      const contacts = await getContacts();

      expect(Array.isArray(contacts)).toBe(true);
    });

    it('should return at least 5 contacts from the initial data', async () => {
      const contacts = await getContacts();

      expect(contacts.length).toBeGreaterThanOrEqual(5);
    });

    it('should return contacts with all required fields', async () => {
      const contacts = await getContacts();
      const first = contacts[0];

      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('nom');
      expect(first).toHaveProperty('prenom');
      expect(first).toHaveProperty('dateNaissance');
      expect(first).toHaveProperty('email');
    });
  });

  describe('createContact', () => {
    it('should create a new contact and return it with a generated id', async () => {
      const newData: Omit<Contact, 'id'> = {
        nom: 'Leroy',
        prenom: 'Sophie',
        dateNaissance: new Date('1993-07-21'),
        email: 'sophie.leroy@email.com',
      };

      const created = await createContact(newData);

      expect(created.id).toBeDefined();
      expect(created.nom).toBe('Leroy');
      expect(created.prenom).toBe('Sophie');
      expect(created.email).toBe('sophie.leroy@email.com');
    });

    it('should add the new contact to the list after creation', async () => {
      const newData: Omit<Contact, 'id'> = {
        nom: 'Moreau',
        prenom: 'Claire',
        dateNaissance: new Date('1988-03-14'),
        email: 'claire.moreau@email.com',
      };

      const created = await createContact(newData);
      const contacts = await getContacts();

      // Vérification que le contact créé est bien présent dans la liste
      expect(contacts.some((c) => c.id === created.id)).toBe(true);
    });

    it('should correctly persist optional fields (pere, mere, dateDecès)', async () => {
      const parent: Contact = {
        id: '1',
        nom: 'Temgoua',
        prenom: 'Giovanny',
        dateNaissance: new Date('1992-03-15'),
        email: 'giovanny.temgoua@mail.me',
      };

      const newData: Omit<Contact, 'id'> = {
        nom: 'Enfant',
        prenom: 'Test',
        dateNaissance: new Date('2010-01-01'),
        email: 'enfant.test@email.com',
        pere: parent,
      };

      const created = await createContact(newData);

      expect(created.pere).toBeDefined();
    });
  });

  describe('updateContact', () => {
    it('should update a contact and return the updated version', async () => {
      const contacts = await getContacts();
      const target = contacts[0];

      const updated = await updateContact(target.id, { ...target, nom: 'NomUpdated' });

      expect(updated.id).toBe(target.id);
      expect(updated.nom).toBe('NomUpdated');
    });

    it('should reflect the update when fetching the list again', async () => {
      const contacts = await getContacts();
      const target = contacts[0];

      await updateContact(target.id, { ...target, email: 'updated@email.com' });

      const refreshed = await getContacts();
      const found = refreshed.find((c) => c.id === target.id);
      expect(found?.email).toBe('updated@email.com');
    });

    it('should throw an error when updating a non-existent contact', async () => {
      // Vérification de la propagation des erreurs pour un id invalide
      await expect(
        updateContact('non-existent-id', { nom: 'Ghost' })
      ).rejects.toThrow();
    });
  });

  describe('deleteContact', () => {
    it('should delete a contact without throwing', async () => {
      const contacts = await getContacts();
      const target = contacts[0];

      await expect(deleteContact(target.id)).resolves.toBeUndefined();
    });

    it('should remove the contact from the list after deletion', async () => {
      const contacts = await getContacts();
      const target = contacts[0];
      const initialCount = contacts.length;

      await deleteContact(target.id);

      const remaining = await getContacts();
      expect(remaining.length).toBe(initialCount - 1);
      expect(remaining.some((c) => c.id === target.id)).toBe(false);
    });

    it('should throw an error when deleting a non-existent contact', async () => {
      // Vérification de la propagation des erreurs pour un id invalide
      await expect(deleteContact('non-existent-id')).rejects.toThrow();
    });
  });
});
