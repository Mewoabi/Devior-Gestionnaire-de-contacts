// Composant de sélection de la langue — bascule entre le français et l'anglais sans rechargement
import React from 'react';
import { useTranslation } from 'react-i18next';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const handleChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <FormControl
      size="small"
      sx={{
        minWidth: 130,
        // Adaptation visuelle pour l'affichage dans l'AppBar bleue
        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
        '& .MuiInputLabel-root.Mui-focused': { color: '#fff' },
        '& .MuiOutlinedInput-root': {
          color: '#fff',
          '& fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.8)' },
          '&.Mui-focused fieldset': { borderColor: '#fff' },
        },
        '& .MuiSvgIcon-root': { color: '#fff' },
      }}
    >
      <InputLabel id="language-select-label">{t('nav.language')}</InputLabel>
      <Select
        labelId="language-select-label"
        value={i18n.language}
        label={t('nav.language')}
        onChange={handleChange}
      >
        <MenuItem value="fr">Français</MenuItem>
        <MenuItem value="en">English</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;
