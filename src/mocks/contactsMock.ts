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
  email: 'jean.dupont@gmail.com',
};

const contact3: Contact = {
  id: '3',
  nom: 'Martin',
  prenom: 'Sophie',
  dateNaissance: new Date('1963-11-10'),
  email: 'sophie.martin@yahoo.fr',
};

// Contact décédé — illustre l'utilisation du champ dateDecès optionnel
const contact4: Contact = {
  id: '4',
  nom: 'Bernard',
  prenom: 'Henri',
  dateNaissance: new Date('1945-07-30'),
  dateDecès: new Date('2020-01-15'),
  email: 'h.bernard@orange.fr',
};

// Contacts enfants — référencent d'autres contacts comme père et mère
const contact5: Contact = {
  id: '5',
  nom: 'Dupont',
  prenom: 'Lucas',
  dateNaissance: new Date('1990-04-05'),
  email: 'lucas.dupont@outlook.com',
  pere: contact2,
  mere: contact3,
};

const contact6: Contact = {
  id: '6',
  nom: 'Dupont',
  prenom: 'Emma',
  dateNaissance: new Date('1995-12-01'),
  email: 'emma.d@icloud.com',
  pere: contact2,
  mere: contact3,
};

const contact7: Contact = {
  id: '7',
  nom: 'Nguemo',
  prenom: 'Alain',
  dateNaissance: new Date('1988-02-14'),
  email: 'alain.nguemo@hotmail.fr',
};

const contact8: Contact = {
  id: '8',
  nom: 'Nana',
  prenom: 'Brigitte',
  dateNaissance: new Date('1991-09-09'),
  email: 'b.nana@sfr.fr',
};

const contact9: Contact = {
  id: '9',
  nom: 'Kouam',
  prenom: 'Paul',
  dateNaissance: new Date('1982-04-27'),
  email: 'paul.kouam@protonmail.com',
};

const contact10: Contact = {
  id: '10',
  nom: 'Mballa',
  prenom: 'Yvonne',
  dateNaissance: new Date('1998-12-19'),
  email: 'yvonne.mballa@gmail.com',
  pere: contact9,
  mere: contact8,
};

const contact11: Contact = {
  id: '11',
  nom: 'Simo',
  prenom: 'Jacques',
  dateNaissance: new Date('1975-06-02'),
  email: 'j.simo@laposte.net',
};

const contact12: Contact = {
  id: '12',
  nom: 'Tchoua',
  prenom: 'Mireille',
  dateNaissance: new Date('1987-03-30'),
  email: 'mireille.tchoua@live.fr',
};

// Liste complète exportée — point d'entrée pour le mock adapter
export const initialContacts: Contact[] = [
  contact1,
  contact2,
  contact3,
  contact4,
  contact5,
  contact6,
  contact7,
  contact8,
  contact9,
  contact10,
  contact11,
  contact12,
];
