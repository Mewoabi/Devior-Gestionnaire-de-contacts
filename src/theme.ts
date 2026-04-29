// Thème MUI personnalisé — couleur primaire bleue correspondant à la maquette du projet
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      // Bleu principal visible dans les en-têtes du DataGrid et les boutons de la maquette
      main: '#1565c0',
      light: '#1976d2',
      dark: '#003c8f',
      contrastText: '#ffffff',
    },
    background: {
      // Fond légèrement bleuté pour un rendu dashboard professionnel
      default: '#f0f4f8',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(21, 101, 192, 0.3)',
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          // Légère ombre sous la barre de navigation
          borderBottom: '1px solid rgba(255,255,255,0.15)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
  },
});
