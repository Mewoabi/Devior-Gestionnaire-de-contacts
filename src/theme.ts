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
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'capitalize',
          minHeight: 36,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(21, 101, 192, 0.28)',
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 45%, ${theme.palette.primary.light} 100%)`,
          borderBottom: '1px solid rgba(255,255,255,0.15)',
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 12,
          boxShadow: theme.shadows[8],
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
          paddingBottom: theme.spacing(1.5),
        }),
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingTop: theme.spacing(1.5),
        }),
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderTop: `1px solid ${theme.palette.divider}`,
          padding: theme.spacing(1.5, 2.5),
          gap: theme.spacing(1),
        }),
      },
    },
  },
});
