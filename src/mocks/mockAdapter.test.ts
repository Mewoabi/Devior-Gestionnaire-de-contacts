// Tests du mock adapter — vérification des routes CRUD simulées
import { describe, it, expect, beforeEach } from 'vitest';
import { apiClient, resetMockData } from './mockAdapter';

describe('Mock Adapter', () => {
  // Réinitialisation des données avant chaque test pour garantir l'isolation
  beforeEach(() => {
    resetMockData();
  });

  describe('GET /contacts', () => {
    it('should return status 200 with the initial contact list', async () => {
      const response = await apiClient.get('/contacts');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should return at least 5 contacts in the initial data', async () => {
      const response = await apiClient.get('/contacts');

      expect(response.data.length).toBeGreaterThanOrEqual(5);
    });

    it('should return contacts with the required fields', async () => {
      const response = await apiClient.get('/contacts');
      const contact = response.data[0];

      expect(contact).toHaveProperty('id');
      expect(contact).toHaveProperty('nom');
      expect(contact).toHaveProperty('prenom');
      expect(contact).toHaveProperty('dateNaissance');
      expect(contact).toHaveProperty('email');
    });
  });

  describe('POST /contacts', () => {
    it('should create a new contact and return status 201', async () => {
      const newContactData = {
        nom: 'Nouveau',
        prenom: 'Contact',
        dateNaissance: new Date('1995-06-15').toISOString(),
        email: 'nouveau.contact@email.com',
      };

      const response = await apiClient.post('/contacts', newContactData);

      expect(response.status).toBe(201);
      expect(response.data.id).toBeDefined();
      expect(response.data.nom).toBe('Nouveau');
      expect(response.data.prenom).toBe('Contact');
    });

    it('should add the new contact to the list', async () => {
      const newContactData = {
        nom: 'Ajout',
        prenom: 'Liste',
        dateNaissance: new Date('1988-03-10').toISOString(),
        email: 'ajout.liste@email.com',
      };

      const postResponse = await apiClient.post('/contacts', newContactData);
      const listResponse = await apiClient.get('/contacts');

      // Vérification que le nouveau contact apparaît bien dans la liste
      const found = listResponse.data.some(
        (c: { id: string }) => c.id === postResponse.data.id
      );
      expect(found).toBe(true);
    });
  });

  describe('PUT /contacts/:id', () => {
    it('should update an existing contact and return status 200', async () => {
      // Récupération du premier contact pour l'identifier
      const listResponse = await apiClient.get('/contacts');
      const target = listResponse.data[0];

      const updateData = { ...target, nom: 'NomModifie' };
      const response = await apiClient.put(`/contacts/${target.id}`, updateData);

      expect(response.status).toBe(200);
      expect(response.data.nom).toBe('NomModifie');
      expect(response.data.id).toBe(target.id);
    });

    it('should reflect the update in subsequent GET calls', async () => {
      const listResponse = await apiClient.get('/contacts');
      const target = listResponse.data[0];

      await apiClient.put(`/contacts/${target.id}`, { ...target, email: 'maj@email.com' });

      const afterUpdate = await apiClient.get('/contacts');
      const updated = afterUpdate.data.find((c: { id: string }) => c.id === target.id);
      expect(updated.email).toBe('maj@email.com');
    });

    it('should return 404 when updating a non-existent contact', async () => {
      // Axios lance une exception pour les statuts >= 400, on l'attrape
      try {
        await apiClient.put('/contacts/id-inexistant', { nom: 'Test' });
        expect(true).toBe(false); // Ce point ne doit pas être atteint
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(404);
      }
    });
  });

  describe('DELETE /contacts/:id', () => {
    it('should delete a contact and return status 204', async () => {
      const listResponse = await apiClient.get('/contacts');
      const target = listResponse.data[0];

      const deleteResponse = await apiClient.delete(`/contacts/${target.id}`);

      expect(deleteResponse.status).toBe(204);
    });

    it('should remove the contact from subsequent GET calls', async () => {
      const listResponse = await apiClient.get('/contacts');
      const target = listResponse.data[0];
      const initialCount = listResponse.data.length;

      await apiClient.delete(`/contacts/${target.id}`);

      const afterDelete = await apiClient.get('/contacts');
      // Vérification que la liste est réduite d'un élément
      expect(afterDelete.data.length).toBe(initialCount - 1);
      expect(afterDelete.data.some((c: { id: string }) => c.id === target.id)).toBe(false);
    });

    it('should return 404 when deleting a non-existent contact', async () => {
      try {
        await apiClient.delete('/contacts/id-inexistant');
        expect(true).toBe(false); // Ce point ne doit pas être atteint
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(404);
      }
    });
  });
});
