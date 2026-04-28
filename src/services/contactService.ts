// Couche service — encapsule tous les appels HTTP vers l'API des contacts
import { apiClient } from '../mocks/mockAdapter';
import type { Contact } from '../types';

// Récupère la liste complète des contacts depuis l'API
export const getContacts = async (): Promise<Contact[]> => {
  const response = await apiClient.get<Contact[]>('/contacts');
  return response.data;
};

// Crée un nouveau contact et retourne le contact créé avec son id généré
export const createContact = async (data: Omit<Contact, 'id'>): Promise<Contact> => {
  const response = await apiClient.post<Contact>('/contacts', data);
  return response.data;
};

// Met à jour un contact existant identifié par son id et retourne la version mise à jour
export const updateContact = async (
  id: string,
  data: Partial<Contact>
): Promise<Contact> => {
  const response = await apiClient.put<Contact>(`/contacts/${id}`, data);
  return response.data;
};

// Supprime un contact identifié par son id — retourne void en cas de succès
export const deleteContact = async (id: string): Promise<void> => {
  await apiClient.delete(`/contacts/${id}`);
};
