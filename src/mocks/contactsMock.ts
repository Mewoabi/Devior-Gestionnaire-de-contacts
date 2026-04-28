// Données de démonstration — contacts initiaux utilisés par le mock de l'API
import type { Contact } from '../types';

// Contacts parents (sans références père/mère)
const contact1: Contact = {
  id: '1',
  nom: 'Temgoua',
  prenom: 'Giovanny',
  dateNaissance: new Date('1992-03-15'),
  email: 'giovanny.temgoua@mail.me',
};

const contact2: Contact = {
  id: '2',
  nom: 'Dupont',
  prenom: 'Jean',
  dateNaissance: new Date('1960-08-22'),
  email: 'jean.dupont@email.com',
};

const contact3: Contact = {
  id: '3',
  nom: 'Martin',
  prenom: 'Sophie',
  dateNaissance: new Date('1963-11-10'),
  email: 'sophie.martin@email.com',
};

// Contact décédé — illustre l'utilisation du champ dateDecès optionnel
const contact4: Contact = {
  id: '4',
  nom: 'Bernard',
  prenom: 'Henri',
  dateNaissance: new Date('1945-07-30'),
  dateDecès: new Date('2020-01-15'),
  email: 'henri.bernard@email.com',
};

// Contacts enfants — référencent d'autres contacts comme père et mère
const contact5: Contact = {
  id: '5',
  nom: 'Dupont',
  prenom: 'Lucas',
  dateNaissance: new Date('1990-04-05'),
  email: 'lucas.dupont@email.com',
  pere: contact2,
  mere: contact3,
};

const contact6: Contact = {
  id: '6',
  nom: 'Dupont',
  prenom: 'Emma',
  dateNaissance: new Date('1995-12-01'),
  email: 'emma.dupont@email.com',
  pere: contact2,
  mere: contact3,
};

// Liste complète exportée — point d'entrée pour le mock adapter
export const initialContacts: Contact[] = [
  contact1,
  contact2,
  contact3,
  contact4,
  contact5,
  contact6,
];
