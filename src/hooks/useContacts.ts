// Hook personnalisé pour la gestion de l'état des contacts — chargement, ajout, édition, suppression
import { useState, useEffect } from 'react';
import type { Contact } from '../types';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contactService';

// ─── Interface de retour du hook ──────────────────────────────────────────────

interface UseContactsReturn {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  addContact: (data: Omit<Contact, 'id'>) => Promise<void>;
  editContact: (id: string, data: Partial<Contact>) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useContacts = (): UseContactsReturn => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  // Initialisé à true — le chargement commence immédiatement au montage
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chargement initial via .then()/.catch() pour éviter tout setState synchrone dans l'effet
  // Le drapeau isMounted prévient les mises à jour d'état sur un composant démonté
  useEffect(() => {
    let isMounted = true;

    getContacts()
      .then((data) => {
        if (isMounted) {
          setContacts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Une erreur est survenue');
          setContacts([]);
          setLoading(false);
        }
      });

    // Nettoyage : annule les mises à jour si le composant est démonté avant la fin du fetch
    return () => {
      isMounted = false;
    };
  }, []);

  // Rechargement manuel depuis l'API — appelé à la demande, pas dans un effet
  const refresh = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // Crée un nouveau contact et l'ajoute à l'état local sans re-fetch complet
  const addContact = async (data: Omit<Contact, 'id'>): Promise<void> => {
    const created = await createContact(data);
    setContacts((prev) => [...prev, created]);
  };

  // Met à jour un contact existant et remplace son entrée dans l'état local
  const editContact = async (id: string, data: Partial<Contact>): Promise<void> => {
    const updated = await updateContact(id, data);
    setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  // Supprime un contact et le retire de l'état local
  const removeContact = async (id: string): Promise<void> => {
    await deleteContact(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return { contacts, loading, error, addContact, editContact, removeContact, refresh };
};
