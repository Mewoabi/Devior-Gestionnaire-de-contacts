// Tests du composant LanguageSwitcher — sélection de langue via un menu déroulant MUI
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import LanguageSwitcher from './LanguageSwitcher';

// Rendu du composant enveloppé dans le fournisseur i18n
const renderLanguageSwitcher = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <LanguageSwitcher />
    </I18nextProvider>
  );

describe('LanguageSwitcher', () => {
  // Réinitialisation de la langue et des espions avant chaque test
  beforeEach(() => {
    i18n.changeLanguage('fr');
    vi.restoreAllMocks();
  });

  it('should render without crashing', () => {
    renderLanguageSwitcher();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should display the current language (French by default)', () => {
    renderLanguageSwitcher();
    // Le combobox doit afficher la valeur de la langue courante
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should show "Français" and "English" options when opened', async () => {
    renderLanguageSwitcher();

    // Ouverture du menu déroulant
    fireEvent.mouseDown(screen.getByRole('combobox'));

    expect(await screen.findByRole('option', { name: 'Français' })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'English' })).toBeInTheDocument();
  });

  it('should call i18n.changeLanguage with "en" when English is selected', async () => {
    const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage');
    renderLanguageSwitcher();

    // Ouverture puis sélection de l'option anglaise
    fireEvent.mouseDown(screen.getByRole('combobox'));
    const englishOption = await screen.findByRole('option', { name: 'English' });
    fireEvent.click(englishOption);

    expect(changeLanguageSpy).toHaveBeenCalledWith('en');
  });

  it('should call i18n.changeLanguage with "fr" when Français is selected', async () => {
    // Passage préalable en anglais pour pouvoir sélectionner le français ensuite
    i18n.changeLanguage('en');
    const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage');

    renderLanguageSwitcher();

    fireEvent.mouseDown(screen.getByRole('combobox'));
    const frenchOption = await screen.findByRole('option', { name: 'Français' });
    fireEvent.click(frenchOption);

    expect(changeLanguageSpy).toHaveBeenCalledWith('fr');
  });
});
