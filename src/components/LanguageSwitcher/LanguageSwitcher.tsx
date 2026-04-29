// Composant de sélection de la langue — bascule entre le français et l'anglais sans rechargement
import React from 'react';
import { useTranslation } from 'react-i18next';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const FLAG_SRC: Record<string, string> = {
  fr: `${base}flags/fr.svg`,
  en: `${base}flags/gb.svg`,
};

const normalizeLang = (lang: string): 'fr' | 'en' => (lang.startsWith('fr') ? 'fr' : 'en');

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const value = normalizeLang(i18n.language);

  const handleChange = (event: SelectChangeEvent<string>) => {
    i18n.changeLanguage(event.target.value);
  };

  const flagImgSx = {
    width: 22,
    height: 15,
    objectFit: 'cover' as const,
    borderRadius: 0.5,
    display: 'block',
    flexShrink: 0,
    boxShadow: '0 0 0 1px rgba(255,255,255,0.25)',
  };

  const renderTriggerValue = (selected: string) => {
    const code = normalizeLang(selected);
    const label = code === 'fr' ? 'Français' : 'English';
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 0.5 }}>
        <Box
          component="img"
          src={FLAG_SRC[code]}
          alt=""
          aria-hidden
          sx={flagImgSx}
        />
        <Typography component="span" variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <KeyboardArrowDownIcon sx={{ fontSize: 20, opacity: 0.9 }} />
      </Box>
    );
  };

  return (
    <FormControl
      size="small"
      variant="standard"
      sx={{
        minWidth: 0,
        '& .MuiInput-root': {
          marginTop: 0,
          '&:before, &:after': { display: 'none' },
        },
        '& .MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
          py: 0.5,
          pr: '0 !important',
          minHeight: 0,
        },
        '& .MuiSelect-icon': { display: 'none' },
      }}
    >
      <Select
        variant="standard"
        disableUnderline
        value={value}
        onChange={handleChange}
        renderValue={renderTriggerValue}
        inputProps={{ 'aria-label': t('nav.language') }}
        MenuProps={{
          anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          transformOrigin: { vertical: 'top', horizontal: 'right' },
          slotProps: {
            paper: {
              elevation: 3,
              sx: { mt: 1, minWidth: 180, borderRadius: 1 },
            },
          },
        }}
        sx={{
          color: 'common.white',
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
          borderRadius: 1,
          px: 0.75,
        }}
      >
        <MenuItem value="fr">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box component="img" src={FLAG_SRC.fr} alt="" aria-hidden sx={flagImgSx} />
            <Typography variant="body2">Français</Typography>
          </Box>
        </MenuItem>
        <MenuItem value="en">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box component="img" src={FLAG_SRC.en} alt="" aria-hidden sx={flagImgSx} />
            <Typography variant="body2">English</Typography>
          </Box>
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;
