// Tests du composant ContactList — DataGrid en lecture seule avec actions vue, édition, suppression
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import ContactList from './ContactList';
import type { Contact } from '../../types';

// Données de test minimales pour les assertions
const mockContacts: Contact[] = [
  {
    id: '1',
    nom: 'Dupont',
    prenom: 'Jean',
    dateNaissance: new Date('1990-01-01'),
    email: 'jean.dupont@email.com',
  },
  {
    id: '2',
    nom: 'Martin',
    prenom: 'Sophie',
    dateNaissance: new Date('1985-05-20'),
    email: 'sophie.martin@email.com',
  },
];

interface ContactListProps {
  contacts: Contact[];
  onAdd: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onView: (contact: Contact) => void;
  loading: boolean;
}

// Fabrique de rendu — évite la répétition du wrapper I18nextProvider
const renderContactList = (overrides: Partial<ContactListProps> = {}) => {
  const defaults: ContactListProps = {
    contacts: mockContacts,
    onAdd: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onView: vi.fn(),
    loading: false,
  };
  const props = { ...defaults, ...overrides };

  return {
    ...render(
      <I18nextProvider i18n={i18n}>
        <ContactList {...props} />
      </I18nextProvider>
    ),
    props,
  };
};

describe('ContactList', () => {
  beforeEach(() => {
    i18n.changeLanguage('fr');
    vi.clearAllMocks();
  });

  // ─── Rendu ────────────────────────────────────────────────────────────────

  it('should render without crashing', () => {
    renderContactList();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('should render the "Ajouter" button', () => {
    renderContactList();
    expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument();
  });

  it('should render column headers for nom, prenom, email and actions', () => {
    renderContactList();
    // MUI DataGrid duplique les headers (sticky + virtuel) — getAllByRole évite l'erreur "multiple found"
    expect(screen.getAllByRole('columnheader', { name: /nom/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('columnheader', { name: /prénom/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('columnheader', { name: /email/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('columnheader', { name: /actions/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('should render contact rows with their data', () => {
    renderContactList();
    expect(screen.getByText('Dupont')).toBeInTheDocument();
    expect(screen.getByText('Jean')).toBeInTheDocument();
    expect(screen.getByText('jean.dupont@email.com')).toBeInTheDocument();
    expect(screen.getByText('Martin')).toBeInTheDocument();
  });

  // ─── Bouton Ajouter ───────────────────────────────────────────────────────

  it('should call onAdd when the "Ajouter" button is clicked', () => {
    const { props } = renderContactList();
    fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));
    expect(props.onAdd).toHaveBeenCalledTimes(1);
  });

  // ─── Boutons d'action (👁 vue + ✏ édition directe + 🗑 suppression) ────────

  it('should call onView with the correct contact when the view button is clicked', () => {
    const { props } = renderContactList();
    fireEvent.click(screen.getByRole('button', { name: 'view-1' }));
    expect(props.onView).toHaveBeenCalledWith(mockContacts[0]);
  });

  it('should call onEdit with the correct contact when the edit button is clicked', () => {
    const { props } = renderContactList();
    fireEvent.click(screen.getByRole('button', { name: 'edit-1' }));
    expect(props.onEdit).toHaveBeenCalledWith(mockContacts[0]);
  });

  it('should call onDelete with the correct id when the delete button is clicked', () => {
    const { props } = renderContactList();
    fireEvent.click(screen.getByRole('button', { name: 'delete-1' }));
    expect(props.onDelete).toHaveBeenCalledWith('1');
  });

  // ─── État de chargement ───────────────────────────────────────────────────

  it('should render correctly when loading is true', () => {
    renderContactList({ loading: true, contacts: [] });
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('should render an empty grid when contacts list is empty', () => {
    renderContactList({ contacts: [] });
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.queryByText('Dupont')).not.toBeInTheDocument();
  });
});
