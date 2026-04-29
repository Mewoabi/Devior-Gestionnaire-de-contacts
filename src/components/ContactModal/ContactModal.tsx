// Composant modal trimode — ajout, édition et visualisation d'un contact dans une seule fenêtre
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import type { Contact } from '../../types';
import { validateContact } from '../../utils/validation';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModalMode = 'add' | 'edit' | 'view';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Contact, 'id'>) => void;
  contact?: Contact | null;
  contacts: Contact[];
  initialMode: ModalMode;
}

interface FormState {
  nom: string;
  prenom: string;
  email: string;
  dateNaissance: string;
  dateDecès: string;
  pere: Contact | null;
  mere: Contact | null;
}

const emptyForm: FormState = {
  nom: '',
  prenom: '',
  email: '',
  dateNaissance: '',
  dateDecès: '',
  pere: null,
  mere: null,
};

// Formate une Date (ou une chaîne ISO) en YYYY-MM-DD pour les champs <input type="date">
// axios-mock-adapter v2 sérialise les Date en chaînes ISO via JSON, donc on gère les deux formes
const formatDateForInput = (date: Date | string | undefined): string => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date as string);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

// Construit l'état initial du formulaire depuis un contact existant
const buildFormState = (contact: Contact): FormState => ({
  nom: contact.nom,
  prenom: contact.prenom,
  email: contact.email,
  dateNaissance: formatDateForInput(contact.dateNaissance),
  dateDecès: formatDateForInput(contact.dateDecès),
  pere: contact.pere ?? null,
  mere: contact.mere ?? null,
});

// Wrapper de type pour le TextField dans les Autocomplete — inputProps/InputProps sont requis
// par Autocomplete en interne mais dépréciés dans les types MUI v9
const AutocompleteTextField = TextField as React.ComponentType<
  React.ComponentProps<typeof TextField> & {
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    InputProps?: object;
  }
>;

// Extrait inputProps depuis les params de renderInput d'Autocomplete
// MUI v9 a retiré inputProps des types mais il est toujours présent à l'exécution
const getAutocompleteInputProps = (
  params: unknown
): React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement> => {
  if (typeof params !== 'object' || params === null || !('inputProps' in params)) {
    return {};
  }
  return (
    (params as { inputProps?: React.InputHTMLAttributes<HTMLInputElement> }).inputProps ?? {}
  );
};

// ─── Composant ───────────────────────────────────────────────────────────────
// Le composant est remonté à chaque ouverture via une prop key dans le parent (App.tsx),
// ce qui garantit un état initial propre sans avoir besoin d'un useEffect de réinitialisation.

const ContactModal: React.FC<ContactModalProps> = ({
  open,
  onClose,
  onSave,
  contact,
  contacts,
  initialMode,
}) => {
  const { t } = useTranslation();

  // État initialisé depuis les props au montage — le parent change la key pour forcer un remontage
  const [currentMode, setCurrentMode] = useState<ModalMode>(initialMode);
  const [form, setForm] = useState<FormState>(() =>
    contact ? buildFormState(contact) : emptyForm
  );
  // Ensemble des champs ayant reçu le focus puis été quittés (blur)
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Erreurs calculées en permanence depuis l'état courant du formulaire
  const currentErrors = useMemo(() => {
    if (currentMode === 'view') return {};
    const data: Partial<Contact> = {
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      dateNaissance: form.dateNaissance ? new Date(form.dateNaissance) : undefined,
      dateDecès: form.dateDecès ? new Date(form.dateDecès) : undefined,
      pere: form.pere,
      mere: form.mere,
    };
    return validateContact(data, contacts, contact?.id);
  }, [form, contacts, contact, currentMode]);

  // Retourne le message d'erreur d'un champ uniquement si ce champ a été touché
  const getFieldError = (field: string): string | undefined => {
    if (!touched.has(field)) return undefined;
    return currentErrors[field];
  };

  const handleFieldChange = (field: keyof FormState, value: string | Contact | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => new Set([...prev, field]));
  };

  const handleSubmit = () => {
    if (Object.keys(currentErrors).length > 0) return;
    onSave({
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email,
      dateNaissance: new Date(form.dateNaissance),
      dateDecès: form.dateDecès ? new Date(form.dateDecès) : undefined,
      pere: form.pere,
      mere: form.mere,
    });
  };

  // Titre de la modale selon le mode courant
  const getTitle = (): string => {
    if (currentMode === 'view') return t('form.viewTitle');
    if (currentMode === 'edit') return t('form.editTitle');
    return t('form.addTitle');
  };

  const isViewMode = currentMode === 'view';
  const getContactLabel = (c: Contact) => `${c.nom} ${c.prenom}`;

  // Exclut le contact en cours d'édition des options père/mère — un contact ne peut pas être son propre parent
  const parentOptions = contact
    ? contacts.filter((c) => c.id !== contact.id)
    : contacts;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{getTitle()}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>

          {/* Champ Nom */}
          <TextField
            label={t('form.nom')}
            value={form.nom}
            onChange={(e) => handleFieldChange('nom', e.target.value)}
            onBlur={() => handleBlur('nom')}
            error={!!getFieldError('nom')}
            helperText={getFieldError('nom') ? (
              <span role="alert">{t(getFieldError('nom')!)}</span>
            ) : undefined}
            disabled={isViewMode}
            fullWidth
            size="small"
            slotProps={{ htmlInput: { 'aria-label': t('form.nom') } }}
          />

          {/* Champ Prénom */}
          <TextField
            label={t('form.prenom')}
            value={form.prenom}
            onChange={(e) => handleFieldChange('prenom', e.target.value)}
            onBlur={() => handleBlur('prenom')}
            error={!!getFieldError('prenom')}
            helperText={getFieldError('prenom') ? (
              <span role="alert">{t(getFieldError('prenom')!)}</span>
            ) : undefined}
            disabled={isViewMode}
            fullWidth
            size="small"
            slotProps={{ htmlInput: { 'aria-label': t('form.prenom') } }}
          />

          {/* Champ Email */}
          <TextField
            label={t('form.email')}
            value={form.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            error={!!getFieldError('email')}
            helperText={getFieldError('email') ? (
              <span role="alert">{t(getFieldError('email')!)}</span>
            ) : undefined}
            disabled={isViewMode}
            fullWidth
            size="small"
            slotProps={{ htmlInput: { 'aria-label': t('form.email') } }}
          />

          {/* Champ Date de naissance — obligatoire */}
          <TextField
            label={t('form.dateNaissance')}
            type="date"
            value={form.dateNaissance}
            onChange={(e) => handleFieldChange('dateNaissance', e.target.value)}
            onBlur={() => handleBlur('dateNaissance')}
            error={!!getFieldError('dateNaissance')}
            helperText={getFieldError('dateNaissance') ? (
              <span role="alert">{t(getFieldError('dateNaissance')!)}</span>
            ) : undefined}
            disabled={isViewMode}
            fullWidth
            size="small"
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { 'aria-label': t('form.dateNaissance') },
            }}
          />

          {/* Champ Date de décès — optionnel */}
          <TextField
            label={t('form.dateDecès')}
            type="date"
            value={form.dateDecès}
            onChange={(e) => handleFieldChange('dateDecès', e.target.value)}
            onBlur={() => handleBlur('dateDecès')}
            error={!!getFieldError('dateDecès')}
            helperText={getFieldError('dateDecès') ? (
              <span role="alert">{t(getFieldError('dateDecès')!)}</span>
            ) : undefined}
            disabled={isViewMode}
            fullWidth
            size="small"
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { 'aria-label': t('form.dateDecès') },
            }}
          />

          {/* Sélection du père via Autocomplete — le contact lui-même est exclu des options */}
          <Autocomplete
            options={parentOptions}
            getOptionLabel={getContactLabel}
            value={form.pere}
            onChange={(_, value) => {
              handleFieldChange('pere', value);
              // Marque 'parents' comme touché dès qu'un parent est sélectionné pour afficher l'erreur
              handleBlur('parents');
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={isViewMode}
            size="small"
            renderInput={(params) => (
              <AutocompleteTextField
                {...params}
                label={t('form.pere')}
                error={!!getFieldError('parents')}
                helperText={getFieldError('parents') ? (
                  <span role="alert">{t(getFieldError('parents')!)}</span>
                ) : undefined}
                inputProps={{ ...getAutocompleteInputProps(params), 'aria-label': t('form.pere') }}
              />
            )}
          />

          {/* Sélection de la mère via Autocomplete — le contact lui-même est exclu des options */}
          <Autocomplete
            options={parentOptions}
            getOptionLabel={getContactLabel}
            value={form.mere}
            onChange={(_, value) => {
              handleFieldChange('mere', value);
              // Marque 'parents' comme touché dès qu'un parent est sélectionné pour afficher l'erreur
              handleBlur('parents');
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={isViewMode}
            size="small"
            renderInput={(params) => (
              <AutocompleteTextField
                {...params}
                label={t('form.mere')}
                error={!!getFieldError('parents')}
                helperText={getFieldError('parents') ? (
                  <span role="alert">{t(getFieldError('parents')!)}</span>
                ) : undefined}
                inputProps={{ ...getAutocompleteInputProps(params), 'aria-label': t('form.mere') }}
              />
            )}
          />

        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t('form.cancel')}</Button>

        {/* Mode visualisation — bouton pour basculer en mode édition sans fermer */}
        {isViewMode && (
          <Button variant="contained" onClick={() => setCurrentMode('edit')}>
            {t('form.edit')}
          </Button>
        )}

        {/* Mode ajout / édition — bouton de sauvegarde désactivé si erreurs */}
        {!isViewMode && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={Object.keys(currentErrors).length > 0}
          >
            {t('form.save')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ContactModal;
