// Tests du composant ContactModal — formulaire d'ajout et d'édition d'un contact
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import ContactModal from './ContactModal';
import type { Contact } from '../../types';

// Contacts de test disponibles pour les Autocomplete père/mère
const availableContacts: Contact[] = [
  {
    id: '1',
    nom: 'Dupont',
    prenom: 'Jean',
    dateNaissance: new Date('1960-01-01'),
    email: 'jean.dupont@email.com',
  },
  {
    id: '2',
    nom: 'Martin',
    prenom: 'Sophie',
    dateNaissance: new Date('1963-05-20'),
    email: 'sophie.martin@email.com',
  },
];

const editingContact: Contact = {
  id: '99',
  nom: 'Leroy',
  prenom: 'Claire',
  dateNaissance: new Date('1990-07-15'),
  email: 'claire.leroy@email.com',
};

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Contact, 'id'>) => void;
  contact?: Contact | null;
  contacts: Contact[];
}

// Fabrique de rendu avec le fournisseur i18n
const renderModal = (overrides: Partial<ContactModalProps> = {}) => {
  const defaults: ContactModalProps = {
    open: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    contact: null,
    contacts: availableContacts,
  };
  const props = { ...defaults, ...overrides };

  return {
    ...render(
      <I18nextProvider i18n={i18n}>
        <ContactModal {...props} />
      </I18nextProvider>
    ),
    props,
  };
};

describe('ContactModal', () => {
  beforeEach(() => {
    i18n.changeLanguage('fr');
    vi.clearAllMocks();
  });

  // ─── Rendu ─────────────────────────────────────────────────────────────────

  it('should not render when open is false', () => {
    renderModal({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render the modal when open is true', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should show the "add" title when no contact is provided', () => {
    renderModal({ contact: null });
    expect(screen.getByText(/ajouter un contact/i)).toBeInTheDocument();
  });

  it('should show the "edit" title when a contact is provided', () => {
    renderModal({ contact: editingContact });
    expect(screen.getByText(/modifier le contact/i)).toBeInTheDocument();
  });

  it('should render all form fields', () => {
    renderModal();
    // Utilisation de chaînes exactes — /nom/i matcherait aussi "Prénom"
    expect(screen.getByLabelText('Nom')).toBeInTheDocument();
    expect(screen.getByLabelText('Prénom')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Date de naissance')).toBeInTheDocument();
  });

  it('should render the Save and Cancel buttons', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /enregistrer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
  });

  // ─── Pré-remplissage en mode édition ───────────────────────────────────────

  it('should pre-fill nom and prenom fields when editing a contact', () => {
    renderModal({ contact: editingContact });
    expect(screen.getByDisplayValue('Leroy')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Claire')).toBeInTheDocument();
  });

  it('should pre-fill email when editing a contact', () => {
    renderModal({ contact: editingContact });
    expect(screen.getByDisplayValue('claire.leroy@email.com')).toBeInTheDocument();
  });

  // ─── Bouton Annuler ────────────────────────────────────────────────────────

  it('should call onClose when the Cancel button is clicked', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: /annuler/i }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  // ─── Validation et erreurs ─────────────────────────────────────────────────

  it('should show validation errors when required fields are touched and empty', async () => {
    renderModal();
    // Simulation du blur sur les champs obligatoires pour déclencher les erreurs
    fireEvent.blur(screen.getByLabelText('Nom'));
    fireEvent.blur(screen.getByLabelText('Prénom'));
    fireEvent.blur(screen.getByLabelText('Email'));

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });

  it('should disable the Save button when there are validation errors', () => {
    renderModal();
    // Le formulaire vide contient des erreurs dès l'ouverture → bouton désactivé d'emblée
    expect(screen.getByRole('button', { name: /enregistrer/i })).toBeDisabled();
  });

  it('should show an error when email is invalid', async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'not-an-email' },
    });
    // Blur déclenche l'affichage de l'erreur pour le champ touché
    fireEvent.blur(screen.getByLabelText('Email'));

    await waitFor(() => {
      expect(screen.getByText(/email.*valide|valide.*email/i)).toBeInTheDocument();
    });
  });

  // ─── Soumission valide ─────────────────────────────────────────────────────

  it('should call onSave with correct data when the form is valid', async () => {
    const { props } = renderModal({ contacts: [] });

    fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Moreau' } });
    fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'Lucas' } });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'lucas.moreau@email.com' },
    });
    fireEvent.change(screen.getByLabelText('Date de naissance'), {
      target: { value: '1995-03-10' },
    });

    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    await waitFor(() => {
      expect(props.onSave).toHaveBeenCalledTimes(1);
      const saved = (props.onSave as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(saved.nom).toBe('Moreau');
      expect(saved.prenom).toBe('Lucas');
      expect(saved.email).toBe('lucas.moreau@email.com');
    });
  });

  // ─── Autocomplete père/mère ────────────────────────────────────────────────

  it('should render the Autocomplete fields for pere and mere', () => {
    renderModal();
    // Les champs père et mère sont des Autocomplete avec leur label traduit
    expect(screen.getByLabelText(/père/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mère/i)).toBeInTheDocument();
  });
});
