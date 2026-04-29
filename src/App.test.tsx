// Tests d'intégration de App.tsx — orchestration complète des composants
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import i18n from './i18n';
import App from './App';
import { resetMockData } from './mocks/mockAdapter';

// Rendu de l'application entière avec le fournisseur i18n
const renderApp = () =>
  render(
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </LocalizationProvider>
  );

describe('App', () => {
  beforeEach(() => {
    resetMockData();
    i18n.changeLanguage('fr');
    vi.clearAllMocks();
  });

  // ─── Rendu initial ────────────────────────────────────────────────────────

  it('should render the app title in the header', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByText('Gestionnaire de Contacts')).toBeInTheDocument();
    });
  });

  it('should render the DataGrid after loading', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  it('should display contacts from the mock data after loading', async () => {
    renderApp();
    // Le contact Temgoua fait partie des données initiales du mock
    await waitFor(() => {
      expect(screen.getByText('Temgoua')).toBeInTheDocument();
    });
  });

  it('should render the language switcher in the header', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  // ─── Ouverture de la modale en mode ajout ─────────────────────────────────

  it('should open the modal in add mode when "Ajouter" is clicked', async () => {
    renderApp();
    await waitFor(() => expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/ajouter un contact/i)).toBeInTheDocument();
  });

  it('should close the modal when Cancel is clicked', async () => {
    renderApp();
    await waitFor(() => expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /annuler/i }));
    // Attente de la fin de la transition de fermeture du Dialog MUI
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  }, 30000);

  // ─── Ajout d'un contact ───────────────────────────────────────────────────

  it('should add a new contact to the list after a valid form submission', async () => {
    renderApp();
    await waitFor(() => expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument());

    // Ouverture de la modale en mode ajout
    fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));

    // Saisie des données du nouveau contact
    fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Moreau' } });
    fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'Claire' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'claire.moreau@email.com' } });
    const birthDateInput = screen.getAllByLabelText('Date de naissance').at(-1) as HTMLInputElement;
    fireEvent.change(birthDateInput, { target: { value: '1990-05-12' } });

    // Attendre que le bouton soit activé (toutes les validations passées)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enregistrer/i })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    // La modale doit se fermer et le total doit augmenter
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/sur 13/i)).toBeInTheDocument();
    });
  }, 30000);

  // ─── Suppression d'un contact ─────────────────────────────────────────────

  it('should remove a contact after delete confirmation', async () => {
    renderApp();
    // Attente de l'affichage du contact avant la suppression
    await waitFor(() => expect(screen.getByText('Temgoua')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'delete-1' }));
    expect(screen.getByText(/supprimer ce contact/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /supprimer/i }));

    await waitFor(() => {
      expect(screen.queryByText('Temgoua')).not.toBeInTheDocument();
    });
  });

  it('should show linked delete warning when contact is referenced as parent', async () => {
    renderApp();
    await waitFor(() => expect(screen.getByRole('button', { name: 'delete-2' })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'delete-2' }));

    expect(screen.getByText(/lie a d'autres contacts comme pere ou mere/i)).toBeInTheDocument();
    expect(screen.getByText(/lie a 2 contacts/i)).toBeInTheDocument();
  });

  it('should show standard delete warning when contact is not linked as parent', async () => {
    renderApp();
    await waitFor(() => expect(screen.getByRole('button', { name: 'delete-1' })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'delete-1' }));

    expect(screen.getByText(/cette action est irr/i)).toBeInTheDocument();
    expect(screen.queryByText(/lie a \d+ contact/i)).not.toBeInTheDocument();
  });

  // ─── Visualisation d'un contact ───────────────────────────────────────────

  it('should open the modal in view mode when the eye icon is clicked', async () => {
    renderApp();
    await waitFor(() => expect(screen.getByText('Temgoua')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'view-1' }));

    // La modale doit s'ouvrir avec le titre de visualisation et les données pré-remplies
    expect(screen.getByText(/détails du contact/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Temgoua')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom')).toBeDisabled();
  });

  // ─── Passage de view à edit dans la modale ────────────────────────────────

  it('should switch to edit mode when "Modifier" is clicked inside the view modal', async () => {
    renderApp();
    await waitFor(() => expect(screen.getByText('Temgoua')).toBeInTheDocument());

    // Ouverture en mode visualisation puis passage en mode édition
    fireEvent.click(screen.getByRole('button', { name: 'view-1' }));
    fireEvent.click(screen.getByRole('button', { name: /modifier/i }));

    await waitFor(() => {
      expect(screen.getByText(/modifier le contact/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Nom')).not.toBeDisabled();
    });
  });
});
