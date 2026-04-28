// Configuration du mock axios — simule une API REST pour les contacts sans backend réel
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import type { Contact } from '../types';
import { initialContacts } from './contactsMock';

// Instance axios partagée dans toute l'application
export const apiClient = axios.create({ baseURL: '/api' });

// État interne du mock — tableau de contacts manipulé en mémoire
let contactsData: Contact[] = [...initialContacts];

// Réinitialise l'état interne aux données initiales (utilisé dans les tests)
export const resetMockData = (): void => {
  contactsData = [...initialContacts];
};

// Retourne une copie de l'état courant (utilisé dans les tests)
export const getMockData = (): Contact[] => [...contactsData];

const mock = new MockAdapter(apiClient);

// Reconstitue les objets Date depuis les chaînes ISO reçues après désérialisation JSON d'axios
const hydrateDates = (data: Record<string, unknown>): Partial<Contact> => {
  return {
    ...data,
    dateNaissance: data.dateNaissance
      ? new Date(data.dateNaissance as string)
      : undefined,
    dateDecès: data.dateDecès
      ? new Date(data.dateDecès as string)
      : undefined,
  } as Partial<Contact>;
};

// GET /contacts — retourne la liste complète des contacts
mock.onGet('/contacts').reply(() => [200, contactsData]);

// POST /contacts — crée un nouveau contact avec un id unique
mock.onPost('/contacts').reply((config) => {
  const parsed = JSON.parse(config.data as string) as Record<string, unknown>;
  const newContact: Contact = {
    ...(hydrateDates(parsed) as Contact),
    id: String(Date.now()),
  };
  contactsData = [...contactsData, newContact];
  return [201, newContact];
});

// PUT /contacts/:id — met à jour un contact existant identifié par son id
mock.onPut(/\/contacts\/(.+)/).reply((config) => {
  const id = config.url?.split('/contacts/')[1];
  const parsed = JSON.parse(config.data as string) as Record<string, unknown>;
  const hydrated = hydrateDates(parsed);

  let found = false;
  contactsData = contactsData.map((c) => {
    if (c.id === id) {
      found = true;
      return { ...c, ...hydrated };
    }
    return c;
  });

  if (!found) return [404, { message: 'Contact non trouvé' }];

  const updated = contactsData.find((c) => c.id === id);
  return [200, updated];
});

// DELETE /contacts/:id — supprime un contact de la liste en mémoire
mock.onDelete(/\/contacts\/(.+)/).reply((config) => {
  const id = config.url?.split('/contacts/')[1];
  const exists = contactsData.some((c) => c.id === id);

  if (!exists) return [404, { message: 'Contact non trouvé' }];

  contactsData = contactsData.filter((c) => c.id !== id);
  return [204, null];
});

export { mock };
