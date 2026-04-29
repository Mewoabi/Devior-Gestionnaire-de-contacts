// Composant racine — orchestre tous les composants et la gestion d'état de l'application
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ContactsIcon from '@mui/icons-material/Contacts';
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
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [initialMode, setInitialMode] = useState<ModalMode>('add');
  const [contactToDeleteId, setContactToDeleteId] = useState<string | null>(null);
  // Compteur incrémenté à chaque ouverture pour forcer le remontage de la modale (état propre)
  const [modalKey, setModalKey] = useState(0);

  // Ouvre la modale en mode ajout — formulaire vide
  const handleAdd = () => {
    setSelectedContactId(null);
    setInitialMode('add');
    setModalKey((k) => k + 1);
    setModalOpen(true);
  };

  // Ouvre la modale en mode visualisation avec le contact de la ligne cliquée
  const handleView = (contact: Contact) => {
    setSelectedContactId(contact.id);
    setInitialMode('view');
    setModalKey((k) => k + 1);
    setModalOpen(true);
  };

  // Raccourci édition directe — ouvre la modale en mode édition sans passer par la visualisation
  const handleEdit = (contact: Contact) => {
    setSelectedContactId(contact.id);
    setInitialMode('edit');
    setModalKey((k) => k + 1);
    setModalOpen(true);
  };

  // Supprime le contact identifié par son id — mise à jour optimiste de l'état local
  const handleDelete = async (id: string) => {
    await removeContact(id);
  };

  const handleDeleteRequest = (id: string) => {
    setContactToDeleteId(id);
  };

  const handleDeleteCancel = () => {
    setContactToDeleteId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!contactToDeleteId) return;
    await handleDelete(contactToDeleteId);
    if (selectedContactId === contactToDeleteId) {
      setModalOpen(false);
      setSelectedContactId(null);
    }
    setContactToDeleteId(null);
  };

  // Sauvegarde les données du formulaire :
  // si selectedContact est défini → édition, sinon → ajout
  const handleSave = async (data: Omit<Contact, 'id'>) => {
    const selectedContact = selectedContactId
      ? contacts.find((contact) => contact.id === selectedContactId) ?? null
      : null;
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

  const selectedContact = useMemo(
    () => (selectedContactId ? contacts.find((contact) => contact.id === selectedContactId) ?? null : null),
    [contacts, selectedContactId]
  );

  const contactToDelete = useMemo(
    () => (contactToDeleteId ? contacts.find((contact) => contact.id === contactToDeleteId) ?? null : null),
    [contacts, contactToDeleteId]
  );

  const linkedContactsCount = useMemo(() => {
    if (!contactToDelete) return 0;
    return contacts.filter(
      (contact) => contact.pere?.id === contactToDelete.id || contact.mere?.id === contactToDelete.id
    ).length;
  }, [contacts, contactToDelete]);

  return (
    <>
      <CssBaseline />

      <Box
        sx={{
          height: '100dvh',
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Barre de navigation principale */}
        <AppBar position="static">
          <Toolbar>
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <ContactsIcon sx={{ opacity: 0.95, fontSize: 28 }} aria-hidden />
              <Typography variant="h6" component="h1" sx={{ letterSpacing: 0.5, fontWeight: 600 }}>
                {t('app.title')}
              </Typography>
            </Box>
            <LanguageSwitcher />
          </Toolbar>
        </AppBar>

        {/* Zone principale : marge par rapport au viewport, pas de scroll page — scroll dans le DataGrid */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            mx: 5,
            my: 2.5,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
            backgroundImage: (theme) =>
              [
                `radial-gradient(ellipse 80% 50% at 0% -10%, ${theme.palette.primary.main}14, transparent 55%)`,
                `radial-gradient(ellipse 70% 45% at 100% 100%, ${theme.palette.primary.light}18, transparent 50%)`,
              ].join(', '),
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              width: '100%',
              maxWidth: 'xl',
              mx: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
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
                onDelete={handleDeleteRequest}
                loading={loading}
              />
            </Paper>
          </Box>
        </Box>
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

      <Dialog open={!!contactToDeleteId} onClose={handleDeleteCancel}>
        <DialogTitle>{t('contacts.deleteConfirm.title')}</DialogTitle>
        <DialogContent>
          {linkedContactsCount > 0 ? (
            <>
              <DialogContentText sx={{ color: 'error.main', fontWeight: 600, mb: 1 }}>
                {t('contacts.deleteConfirm.linkedMessage')}
              </DialogContentText>
              <DialogContentText sx={{ color: 'text.secondary' }}>
                {t('contacts.deleteConfirm.linkedCount', { count: linkedContactsCount })}
              </DialogContentText>
            </>
          ) : (
            <DialogContentText>{t('contacts.deleteConfirm.message')}</DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>{t('contacts.deleteConfirm.cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            {t('contacts.deleteConfirm.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default App;
