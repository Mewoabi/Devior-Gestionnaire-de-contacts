// Composant principal de liste des contacts — DataGrid MUI en lecture seule
// Actions par ligne : 👁 visualisation (ouvre la modale trimode) + 🗑 suppression
import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
// Textes internes du DataGrid traduits selon la langue active (pagination, menus de colonnes…)
import { frFR, enUS } from '@mui/x-data-grid/locales';
import type { Contact } from '../../types';

// ─── Interface des props ──────────────────────────────────────────────────────

interface ContactListProps {
  contacts: Contact[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onView: (contact: Contact) => void;
  loading: boolean;
}

// ─── Composant ───────────────────────────────────────────────────────────────

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  onAdd,
  onDelete,
  onView,
  loading,
}) => {
  const { t, i18n } = useTranslation();

  // Sélection du texte de localisation du DataGrid selon la langue active
  const dataGridLocaleText =
    i18n.language === 'fr'
      ? frFR.components.MuiDataGrid.defaultProps.localeText
      : enUS.components.MuiDataGrid.defaultProps.localeText;

  // Définition des colonnes — headerName traduit via i18n, édition désactivée sur toutes
  const columns: GridColDef[] = [
    {
      field: 'nom',
      headerName: t('contacts.columns.nom'),
      flex: 1,
      editable: false,
    },
    {
      field: 'prenom',
      headerName: t('contacts.columns.prenom'),
      flex: 1,
      editable: false,
    },
    {
      field: 'email',
      headerName: t('contacts.columns.email'),
      flex: 1.5,
      editable: false,
    },
    {
      field: 'actions',
      headerName: t('contacts.columns.actions'),
      sortable: false,
      filterable: false,
      width: 120,
      align: 'center',
      headerAlign: 'center',
      // Rendu personnalisé : icône œil (visualisation) + icône poubelle (suppression)
      renderCell: (params) => {
        const contact = params.row as Contact;
        return (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Tooltip title={t('contacts.view')}>
              <IconButton
                size="small"
                aria-label={`view-${contact.id}`}
                onClick={() => onView(contact)}
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('contacts.delete')}>
              <IconButton
                size="small"
                aria-label={`delete-${contact.id}`}
                onClick={() => onDelete(contact.id)}
                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      {/* Barre d'outils — bouton d'ajout aligné à droite avec espacement interne */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{ fontWeight: 600, px: 2.5 }}
        >
          {t('contacts.add')}
        </Button>
      </Box>

      {/* Grille de données en lecture seule avec en-têtes colorés */}
      <DataGrid
        rows={contacts}
        columns={columns}
        loading={loading}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        checkboxSelection
        localeText={dataGridLocaleText}
        disableRowSelectionOnClick
        autoHeight
        sx={{
          border: 'none',
          borderTopRightRadius: 0,
          borderTopLeftRadius: 0,
          // Colonne de cases à cocher — même fond bleu que les autres en-têtes
          '& .MuiDataGrid-columnHeaderCheckbox': {
            backgroundColor: 'primary.main',
            '& .MuiCheckbox-root': { color: 'rgba(255,255,255,0.8)' },
          },
          '& .MuiDataGrid-cellCheckbox .MuiCheckbox-root': {
            color: 'text.secondary',
          },
          // En-têtes de colonnes : fond bleu primaire avec texte blanc
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 600,
            '& .MuiDataGrid-columnHeaderTitle': {
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
            },
            // Conteneur des boutons icônes (tri, menu) — fond toujours transparent sur fond bleu
            '& .MuiDataGrid-iconButtonContainer .MuiButtonBase-root': {
              color: 'rgba(255,255,255,0.8)',
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: '#ffffff',
              },
              // Force l'icône SVG toujours visible dès que le bouton apparaît (corrige le cercle blanc vide)
              '& .MuiSvgIcon-root': {
                opacity: '1 !important',
                color: 'rgba(255,255,255,0.8)',
              },
              '&:hover .MuiSvgIcon-root': {
                color: '#ffffff',
              },
            },
            // Bouton menu colonne
            '& .MuiDataGrid-menuIconButton': {
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: '#ffffff',
              },
            },
          },
          '& .MuiDataGrid-columnSeparator': {
            color: 'rgba(255,255,255,0.2)',
          },
          // Suppression du contour bleu sur les cellules au focus
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
          // Survol de ligne discret
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(21, 101, 192, 0.04)',
          },
        }}
      />
    </Box>
  );
};

export default ContactList;
