// Composant racine — orchestre tous les composants et la gestion d'état de l'application
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
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

  // Ouvre la modale en mode ajout — formulaire vide
  const handleAdd = () => {
    setSelectedContact(null);
    setInitialMode('add');
    setModalOpen(true);
  };

  // Ouvre la modale en mode visualisation avec le contact de la ligne cliquée
  const handleView = (contact: Contact) => {
    setSelectedContact(contact);
    setInitialMode('view');
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

      {/* Barre de navigation avec titre et sélecteur de langue */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            {t('app.title')}
          </Typography>
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>

      {/* Zone de contenu principale */}
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <ContactList
            contacts={contacts}
            onAdd={handleAdd}
            onView={handleView}
            onDelete={handleDelete}
            loading={loading}
          />

          {/* Modale trimode — partagée pour l'ajout, la visualisation et l'édition */}
          <ContactModal
            open={modalOpen}
            onClose={handleClose}
            onSave={handleSave}
            contact={selectedContact}
            contacts={contacts}
            initialMode={initialMode}
          />
        </Box>
      </Container>
    </>
  );
}

export default App;
