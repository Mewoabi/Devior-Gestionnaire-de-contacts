// Composant principal de liste des contacts — DataGrid MUI en lecture seule
// Actions par ligne : 👁 visualisation (ouvre la modale trimode) + 🗑 suppression
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import type { GridPaginationModel } from '@mui/x-data-grid';
// Textes internes du DataGrid traduits selon la langue active (pagination, menus de colonnes…)
import { frFR, enUS } from '@mui/x-data-grid/locales';
import type { Contact } from '../../types';

// ─── Interface des props ──────────────────────────────────────────────────────

interface ContactListProps {
  contacts: Contact[];
  onAdd: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onView: (contact: Contact) => void;
  loading: boolean;
}

// ─── Composant ───────────────────────────────────────────────────────────────

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  onAdd,
  onEdit,
  onDelete,
  onView,
  loading,
}) => {
  const { t, i18n } = useTranslation();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  // Sélection du texte de localisation du DataGrid selon la langue active
  const dataGridLocaleText =
    i18n.language === 'fr'
      ? frFR.components.MuiDataGrid.defaultProps.localeText
      : enUS.components.MuiDataGrid.defaultProps.localeText;

  // Locale BCP-47 utilisée pour le formatage des dates selon la langue active
  const dateLocale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';

  // Convertit une valeur brute (Date ou chaîne ISO après sérialisation JSON) en objet Date ou null
  const toDate = (value: unknown): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    const parsed = new Date(value as string);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  // Définition des colonnes — headerName traduit via i18n, édition désactivée sur toutes
  const columns: GridColDef[] = [
    {
      field: 'rowNumber',
      headerName: '#',
      type: 'number',
      width: 84,
      editable: false,
      sortable: false,
      filterable: false,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams<Contact>) => (
        <Box sx={{ width: '100%', pl: 1 }}>
          {paginationModel.page * paginationModel.pageSize +
            params.api.getRowIndexRelativeToVisibleRows(params.id) +
            1}
        </Box>
      ),
    },
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
    // ─── Colonnes masquées par défaut — activables via le gestionnaire de colonnes ──
    {
      field: 'dateNaissance',
      headerName: t('contacts.columns.dateNaissance'),
      type: 'date',
      width: 160,
      editable: false,
      // valueGetter : renvoie un objet Date pour que le tri et le filtre soient chronologiques
      valueGetter: (value: unknown) => toDate(value),
      // valueFormatter : affichage localisé selon la langue active
      valueFormatter: (value: Date | null) =>
        value ? value.toLocaleDateString(dateLocale) : '—',
    },
    {
      field: 'dateDecès',
      headerName: t('contacts.columns.dateDecès'),
      type: 'date',
      width: 160,
      editable: false,
      valueGetter: (value: unknown) => toDate(value),
      // Affiche « — » si le champ optionnel est absent
      valueFormatter: (value: Date | null) =>
        value ? value.toLocaleDateString(dateLocale) : '—',
    },
    {
      field: 'pere',
      headerName: t('contacts.columns.pere'),
      type: 'string',
      width: 180,
      editable: false,
      // Combine nom + prénom du père pour le tri alphabétique et l'affichage
      valueGetter: (value: Contact | null | undefined) =>
        value ? `${value.nom} ${value.prenom}` : '—',
    },
    {
      field: 'mere',
      headerName: t('contacts.columns.mere'),
      type: 'string',
      width: 180,
      editable: false,
      valueGetter: (value: Contact | null | undefined) =>
        value ? `${value.nom} ${value.prenom}` : '—',
    },
    // ─── Colonne Actions — non masquable pour préserver les contrôles de la grille ──
    {
      field: 'actions',
      headerName: t('contacts.columns.actions'),
      sortable: false,
      filterable: false,
      hideable: false,
      disableColumnMenu: true,
      width: 150,
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
            {/* Raccourci édition directe — ouvre la modale en mode édition sans passer par la vue */}
            <Tooltip title={t('contacts.edit')}>
              <IconButton
                size="small"
                aria-label={`edit-${contact.id}`}
                onClick={() => onEdit(contact)}
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                <EditIcon fontSize="small" />
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
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Barre d'outils — bouton d'ajout aligné à droite */}
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 1.5,
          py: 1.5,
          backgroundColor: 'rgba(21, 101, 192, 0.06)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t('contacts.title')}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{
            fontWeight: 600,
            px: 2.5,
            borderWidth: 1.5,
            backgroundColor: 'rgba(21, 101, 192, 0.08)',
            '&:hover': {
              borderWidth: 1.5,
              backgroundColor: 'rgba(21, 101, 192, 0.14)',
            },
          }}
        >
          {t('contacts.add')}
        </Button>
      </Box>

      {/* Grille : hauteur fixe dans la colonne flex — scroll interne, pas de scroll page */}
      <Box sx={{ flex: 1, minHeight: 0, width: '100%' }}>
        <DataGrid
          rows={contacts}
          columns={columns}
          loading={loading}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? 'contact-row-even' : 'contact-row-odd'
          }
          density="standard"
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          initialState={{
            columns: {
              // Colonnes supplémentaires masquées par défaut — activables via le gestionnaire
              columnVisibilityModel: {
                dateNaissance: false,
                dateDecès: false,
                pere: false,
                mere: false,
              },
            },
          }}
          localeText={dataGridLocaleText}
          disableRowSelectionOnClick
          sx={{
            height: '100%',
            border: 'none',
            borderTopRightRadius: 0,
            borderTopLeftRadius: 0,
            '& .MuiDataGrid-footerContainer': {
              px: 5,
            },
            // En-têtes de colonnes : fond bleu primaire avec texte blanc
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: 'primary.dark',
              color: 'primary.contrastText',
              fontWeight: 600,
              '& .MuiDataGrid-columnHeaderTitle': {
                textTransform: 'none',
                // fontSize: '1.25rem',
                letterSpacing: '0.04em',
                fontWeight: 700,
              },
              '& .MuiDataGrid-iconButtonContainer .MuiButtonBase-root': {
                color: 'rgba(255,255,255,0.8)',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  color: '#ffffff',
                },
                '& .MuiSvgIcon-root': {
                  opacity: '1 !important',
                  color: 'rgba(255,255,255,0.8)',
                },
                '&:hover .MuiSvgIcon-root': {
                  color: '#ffffff',
                },
              },
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
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .contact-row-even': {
              backgroundColor: '#ffffff',
            },
            '& .contact-row-odd': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(21, 101, 192, 0.04)',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default ContactList;
