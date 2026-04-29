// Tests du hook useContacts — gestion de l'état des contacts (chargement, CRUD, erreurs)
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useContacts } from './useContacts';
import { resetMockData } from '../mocks/mockAdapter';
import * as contactService from '../services/contactService';

describe('useContacts', () => {
  // Réinitialisation des données mockées avant chaque test pour garantir l'isolation
  beforeEach(() => {
    resetMockData();
  });

  // Restauration des espions après chaque test pour éviter les effets de bord
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── Chargement initial ───────────────────────────────────────────────────

  it('should start with loading set to true', () => {
    const { result } = renderHook(() => useContacts());
    expect(result.current.loading).toBe(true);
  });

  it('should load contacts on mount and set loading to false', async () => {
    const { result } = renderHook(() => useContacts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.contacts.length).toBeGreaterThanOrEqual(5);
    expect(result.current.error).toBeNull();
  });

  it('should start with error set to null', async () => {
    const { result } = renderHook(() => useContacts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
  });

  // ─── addContact ───────────────────────────────────────────────────────────

  it('should add a contact and update the state', async () => {
    const { result } = renderHook(() => useContacts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const initialCount = result.current.contacts.length;

    await act(async () => {
      await result.current.addContact({
        nom: 'Nouveau',
        prenom: 'Contact',
        dateNaissance: new Date('2000-06-15'),
        email: 'nouveau.contact@email.com',
      });
    });

    expect(result.current.contacts.length).toBe(initialCount + 1);
  });

  it('should include the new contact with correct data after adding', async () => {
    const { result } = renderHook(() => useContacts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addContact({
        nom: 'Girard',
        prenom: 'Emma',
        dateNaissance: new Date('1998-03-22'),
        email: 'emma.girard@email.com',
      });
    });

    const added = result.current.contacts.find(
      (c) => c.nom === 'Girard' && c.prenom === 'Emma'
    );
    expect(added).toBeDefined();
    expect(added?.email).toBe('emma.girard@email.com');
  });

  // ─── editContact ─────────────────────────────────────────────────────────

  it('should update a contact and reflect the change in state', async () => {
    const { result } = renderHook(() => useContacts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const target = result.current.contacts[0];

    await act(async () => {
      await result.current.editContact(target.id, { ...target, nom: 'NomModifié' });
    });

    const updated = result.current.contacts.find((c) => c.id === target.id);
    expect(updated?.nom).toBe('NomModifié');
  });

  it('should not change the number of contacts after editing', async () => {
    const { result } = renderHook(() => useContacts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const initialCount = result.current.contacts.length;
    const target = result.current.contacts[0];

    await act(async () => {
      await result.current.editContact(target.id, { ...target, email: 'updated@email.com' });
    });

    expect(result.current.contacts.length).toBe(initialCount);
  });

  it('should reconcile parent object references after editing a parent contact', async () => {
    const { result } = renderHook(() => useContacts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.editContact('2', { nom: 'ParentRenamed' });
    });

    const child = result.current.contacts.find((c) => c.id === '5');
    expect(child?.pere?.id).toBe('2');
    expect(child?.pere?.nom).toBe('ParentRenamed');
  });

  // ─── removeContact ────────────────────────────────────────────────────────

  it('should remove a contact and decrease the count', async () => {
    const { result } = renderHook(() => useContacts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const initialCount = result.current.contacts.length;
    const target = result.current.contacts[0];

    await act(async () => {
      await result.current.removeContact(target.id);
    });

    expect(result.current.contacts.length).toBe(initialCount - 1);
    expect(result.current.contacts.find((c) => c.id === target.id)).toBeUndefined();
  });

  it('should clear parent references when removing a parent contact', async () => {
    const { result } = renderHook(() => useContacts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeContact('2');
    });

    const child = result.current.contacts.find((c) => c.id === '5');
    expect(child?.pere).toBeNull();
  });

  // ─── refresh ──────────────────────────────────────────────────────────────

  it('should re-fetch contacts when refresh is called', async () => {
    const { result } = renderHook(() => useContacts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const countBefore = result.current.contacts.length;

    await act(async () => {
      await result.current.refresh();
    });

    // Après un refresh les données sont rechargées depuis le mock
    expect(result.current.contacts.length).toBe(countBefore);
    expect(result.current.loading).toBe(false);
  });

  // ─── Gestion des erreurs ──────────────────────────────────────────────────

  it('should set error state when the initial fetch fails', async () => {
    // Espion sur la fonction du service pour simuler un échec réseau sans toucher au mock adapter
    vi.spyOn(contactService, 'getContacts').mockRejectedValueOnce(
      new Error('Erreur réseau simulée')
    );

    const { result } = renderHook(() => useContacts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.contacts.length).toBe(0);
  });
});
