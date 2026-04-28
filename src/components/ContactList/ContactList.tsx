// Composant principal de liste des contacts — DataGrid MUI en lecture seule avec actions par ligne
import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
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
  const { t } = useTranslation();

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
      width: 150,
      // Rendu personnalisé des boutons d'action pour chaque ligne
      renderCell: (params) => {
        const contact = params.row as Contact;
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              aria-label={`view-${contact.id}`}
              onClick={() => onView(contact)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label={`edit-${contact.id}`}
              onClick={() => onEdit(contact)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label={`delete-${contact.id}`}
              onClick={() => onDelete(contact.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      {/* Barre d'outils — bouton d'ajout aligné à droite */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
          {t('contacts.add')}
        </Button>
      </Box>

      {/* Grille de données en lecture seule */}
      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={contacts}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default ContactList;
