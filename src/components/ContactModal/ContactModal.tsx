// Composant modal partagé pour l'ajout et l'édition d'un contact
import React, { useState, useEffect, useMemo } from 'react';
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

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Contact, 'id'>) => void;
  contact?: Contact | null;
  contacts: Contact[];
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

// Formate une Date en chaîne YYYY-MM-DD pour les champs <input type="date">
const formatDateForInput = (date: Date | undefined): string => {
  if (!date || !(date instanceof Date)) return '';
  return date.toISOString().split('T')[0];
};

// ─── Composant ───────────────────────────────────────────────────────────────

const ContactModal: React.FC<ContactModalProps> = ({
  open,
  onClose,
  onSave,
  contact,
  contacts,
}) => {
  const { t } = useTranslation();

  const [form, setForm] = useState<FormState>(emptyForm);
  // Ensemble des champs qui ont reçu le focus puis été quittés (blur)
  const [touched, setTouched] = useState<Set<string>>(new Set());
  // Passe à true lors du premier clic sur Enregistrer
  const [submitted, setSubmitted] = useState(false);

  // Synchronisation de l'état du formulaire avec le contact en cours d'édition
  useEffect(() => {
    if (contact) {
      setForm({
        nom: contact.nom,
        prenom: contact.prenom,
        email: contact.email,
        dateNaissance: formatDateForInput(contact.dateNaissance),
        dateDecès: formatDateForInput(contact.dateDecès),
        pere: contact.pere ?? null,
        mere: contact.mere ?? null,
      });
    } else {
      setForm(emptyForm);
    }
    setTouched(new Set());
    setSubmitted(false);
  }, [contact, open]);

  // Erreurs calculées en permanence depuis l'état courant du formulaire
  const currentErrors = useMemo(() => {
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
  }, [form, contacts, contact]);

  // Retourne le message d'erreur d'un champ uniquement s'il a été touché ou soumis
  const getFieldError = (field: string): string | undefined => {
    if (!submitted && !touched.has(field)) return undefined;
    return currentErrors[field];
  };

  const handleFieldChange = (field: keyof FormState, value: string | Contact | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => new Set([...prev, field]));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // Bloque la sauvegarde si des erreurs de validation existent
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

  const getContactLabel = (c: Contact) => `${c.nom} ${c.prenom}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {contact ? t('form.editTitle') : t('form.addTitle')}
      </DialogTitle>

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
            fullWidth
            inputProps={{ 'aria-label': t('form.nom') }}
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
            fullWidth
            inputProps={{ 'aria-label': t('form.prenom') }}
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
            fullWidth
            inputProps={{ 'aria-label': t('form.email') }}
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
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            inputProps={{ 'aria-label': t('form.dateNaissance') }}
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
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            inputProps={{ 'aria-label': t('form.dateDecès') }}
          />

          {/* Sélection du père via Autocomplete */}
          <Autocomplete
            options={contacts}
            getOptionLabel={getContactLabel}
            value={form.pere}
            onChange={(_, value) => handleFieldChange('pere', value)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('form.pere')}
                error={!!getFieldError('parents')}
                helperText={getFieldError('parents') ? (
                  <span role="alert">{t(getFieldError('parents')!)}</span>
                ) : undefined}
                inputProps={{ ...params.inputProps, 'aria-label': t('form.pere') }}
              />
            )}
          />

          {/* Sélection de la mère via Autocomplete */}
          <Autocomplete
            options={contacts}
            getOptionLabel={getContactLabel}
            value={form.mere}
            onChange={(_, value) => handleFieldChange('mere', value)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('form.mere')}
                error={!!getFieldError('parents')}
                inputProps={{ ...params.inputProps, 'aria-label': t('form.mere') }}
              />
            )}
          />

        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t('form.cancel')}</Button>
        {/* Désactivé dès qu'il y a des erreurs de validation, même avant toute soumission */}
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={Object.keys(currentErrors).length > 0}
        >
          {t('form.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactModal;
