// Composant racine — orchestre tous les composants et la gestion d'état de l'application
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ContactList from './components/ContactList';
import ContactModal, { type ModalMode } from './components/ContactModal';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useContacts } from './hooks/useContacts';
import type { Contact } from './types';

function App() {
  const { t } = useTranslation();
  const { contacts, loading, addContact, editContact, removeContact } = useContacts();

  // État de la modale — un seul composant modal gère les trois modes
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [initialMode, setInitialMode] = useState<ModalMode>('add');
  // Compteur incrémenté à chaque ouverture pour forcer le remontage de la modale (état propre)
  const [modalKey, setModalKey] = useState(0);

  // Ouvre la modale en mode ajout — formulaire vide
  const handleAdd = () => {
    setSelectedContact(null);
    setInitialMode('add');
    setModalKey((k) => k + 1);
    setModalOpen(true);
  };

  // Ouvre la modale en mode visualisation avec le contact de la ligne cliquée
  const handleView = (contact: Contact) => {
    setSelectedContact(contact);
    setInitialMode('view');
    setModalKey((k) => k + 1);
    setModalOpen(true);
  };

  // Raccourci édition directe — ouvre la modale en mode édition sans passer par la visualisation
  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setInitialMode('edit');
    setModalKey((k) => k + 1);
    setModalOpen(true);
  };

  // Supprime le contact identifié par son id — mise à jour optimiste de l'état local
  const handleDelete = async (id: string) => {
    await removeContact(id);
  };

  // Sauvegarde les données du formulaire :
  // si selectedContact est défini → édition, sinon → ajout
  const handleSave = async (data: Omit<Contact, 'id'>) => {
    if (selectedContact) {
      await editContact(selectedContact.id, data);
    } else {
      await addContact(data);
    }
    setModalOpen(false);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  return (
    <>
      <CssBaseline />

      {/* Barre de navigation principale */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1, letterSpacing: 0.5, fontWeight: 600 }}>
            {t('app.title')}
          </Typography>
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>

      {/* Fond de page légèrement coloré */}
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
        <Container maxWidth="lg">
          {/* Carte principale encapsulant la grille de contacts */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <ContactList
              contacts={contacts}
              onAdd={handleAdd}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={loading}
            />
          </Paper>
        </Container>
      </Box>

      {/* Modale trimode — key change force le remontage pour garantir un état propre à chaque ouverture */}
      <ContactModal
        key={modalKey}
        open={modalOpen}
        onClose={handleClose}
        onSave={handleSave}
        contact={selectedContact}
        contacts={contacts}
        initialMode={initialMode}
      />
    </>
  );
}

export default App;
