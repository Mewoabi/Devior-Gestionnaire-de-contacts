// Tests du composant ContactModal — modes ajout, édition et visualisation (trimode)
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

const existingContact: Contact = {
  id: '99',
  nom: 'Leroy',
  prenom: 'Claire',
  dateNaissance: new Date('1990-07-15'),
  email: 'claire.leroy@email.com',
};

type ModalMode = 'add' | 'edit' | 'view';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Contact, 'id'>) => void;
  contact?: Contact | null;
  contacts: Contact[];
  initialMode: ModalMode;
}

// Fabrique de rendu avec le fournisseur i18n — mode ajout par défaut
const renderModal = (overrides: Partial<ContactModalProps> = {}) => {
  const defaults: ContactModalProps = {
    open: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    contact: null,
    contacts: availableContacts,
    initialMode: 'add',
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

  // ─── Rendu de base ─────────────────────────────────────────────────────────

  it('should not render when open is false', () => {
    renderModal({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render the modal when open is true', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should show the "add" title in add mode', () => {
    renderModal({ initialMode: 'add', contact: null });
    expect(screen.getByText(/ajouter un contact/i)).toBeInTheDocument();
  });

  it('should show the "edit" title in edit mode', () => {
    renderModal({ initialMode: 'edit', contact: existingContact });
    expect(screen.getByText(/modifier le contact/i)).toBeInTheDocument();
  });

  it('should render all form fields', () => {
    renderModal();
    expect(screen.getByLabelText('Nom')).toBeInTheDocument();
    expect(screen.getByLabelText('Prénom')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Date de naissance')).toBeInTheDocument();
  });

  it('should render the Save and Cancel buttons in add mode', () => {
    renderModal({ initialMode: 'add' });
    expect(screen.getByRole('button', { name: /enregistrer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
  });

  // ─── Pré-remplissage en mode édition ───────────────────────────────────────

  it('should pre-fill fields when in edit mode', () => {
    renderModal({ initialMode: 'edit', contact: existingContact });
    expect(screen.getByDisplayValue('Leroy')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Claire')).toBeInTheDocument();
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
    renderModal({ initialMode: 'add' });
    fireEvent.blur(screen.getByLabelText('Nom'));
    fireEvent.blur(screen.getByLabelText('Prénom'));
    fireEvent.blur(screen.getByLabelText('Email'));

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });

  it('should disable the Save button when there are validation errors', () => {
    renderModal({ initialMode: 'add' });
    expect(screen.getByRole('button', { name: /enregistrer/i })).toBeDisabled();
  });

  it('should show an error when email is invalid', async () => {
    renderModal({ initialMode: 'add' });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'not-an-email' } });
    fireEvent.blur(screen.getByLabelText('Email'));

    await waitFor(() => {
      expect(screen.getByText(/email.*valide|valide.*email/i)).toBeInTheDocument();
    });
  });

  // ─── Soumission valide ─────────────────────────────────────────────────────

  it('should call onSave with correct data when the form is valid', async () => {
    const { props } = renderModal({ initialMode: 'add', contacts: [] });

    fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Moreau' } });
    fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'Lucas' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'lucas.moreau@email.com' } });
    fireEvent.change(screen.getByLabelText('Date de naissance'), { target: { value: '1995-03-10' } });

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
    renderModal({ initialMode: 'add' });
    expect(screen.getByLabelText(/père/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mère/i)).toBeInTheDocument();
  });

  // ─── Mode visualisation (view) ─────────────────────────────────────────────

  it('should show the "view" title in view mode', () => {
    renderModal({ initialMode: 'view', contact: existingContact });
    expect(screen.getByText(/détails du contact/i)).toBeInTheDocument();
  });

  it('should pre-fill fields in view mode', () => {
    renderModal({ initialMode: 'view', contact: existingContact });
    expect(screen.getByDisplayValue('Leroy')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Claire')).toBeInTheDocument();
  });

  it('should disable all inputs in view mode', () => {
    renderModal({ initialMode: 'view', contact: existingContact });
    expect(screen.getByLabelText('Nom')).toBeDisabled();
    expect(screen.getByLabelText('Prénom')).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });

  it('should NOT show the Save button in view mode', () => {
    renderModal({ initialMode: 'view', contact: existingContact });
    expect(screen.queryByRole('button', { name: /enregistrer/i })).not.toBeInTheDocument();
  });

  it('should show the "Modifier" button in view mode', () => {
    renderModal({ initialMode: 'view', contact: existingContact });
    expect(screen.getByRole('button', { name: /modifier/i })).toBeInTheDocument();
  });

  it('should switch to edit mode when "Modifier" is clicked in view mode', async () => {
    renderModal({ initialMode: 'view', contact: existingContact });

    // Passage en mode édition via le bouton Modifier
    fireEvent.click(screen.getByRole('button', { name: /modifier/i }));

    await waitFor(() => {
      // Le titre doit changer et les champs doivent devenir éditables
      expect(screen.getByText(/modifier le contact/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Nom')).not.toBeDisabled();
    });
  });

  it('should show the Save button after switching from view to edit mode', async () => {
    renderModal({ initialMode: 'view', contact: existingContact });
    fireEvent.click(screen.getByRole('button', { name: /modifier/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enregistrer/i })).toBeInTheDocument();
    });
  });
});
