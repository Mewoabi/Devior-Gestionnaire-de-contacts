# Gestionnaire de Contacts

Application web de gestion de contacts développée en React + TypeScript dans le cadre d'un exercice technique.

---

## Description du projet

Le Gestionnaire de Contacts permet de **créer, visualiser, modifier et supprimer** des contacts. Chaque contact possède un nom, un prénom, une adresse e-mail, une date de naissance, une date de décès (optionnelle), ainsi que des références optionnelles vers d'autres contacts (père et mère).

Les données sont entièrement simulées côté frontend à l'aide de `axios-mock-adapter` — aucun backend n'est requis.

---

## Stack technique

| Rôle | Bibliothèque | Version |
|---|---|---|
| Framework UI | React + TypeScript | 19.x |
| Build tool | Vite | 8.x |
| Composants | MUI (Material UI) | 9.x |
| Tableau de données | MUI X DataGrid | 9.x |
| Client HTTP | axios | 1.x |
| Mock API | axios-mock-adapter | 2.x |
| Internationalisation | react-i18next + i18next | 17.x / 26.x |
| Tests | Vitest + Testing Library | 4.x |

---

## Prérequis

- **Node.js** ≥ 18
- **npm** ≥ 9

---

## Installation

```bash
npm install
```

---

## Lancement

```bash
npm run dev
```

L'application est accessible à l'adresse affichée dans le terminal (par défaut `http://localhost:5173`).

---

## Tests

### Lancer tous les tests

```bash
npm test
```

### Lancer les tests en mode watch

```bash
npm run test -- --watch
```

### Générer un rapport de couverture

```bash
npm run test:coverage
```

---

## Structure du projet

```
contact-manager/
├── src/
│   ├── __tests__/              # Tests d'intégration end-to-end
│   ├── components/
│   │   ├── ContactList/        # Tableau MUI DataGrid (lecture seule)
│   │   ├── ContactModal/       # Modale trimode (ajout / visualisation / édition)
│   │   └── LanguageSwitcher/   # Sélecteur de langue (FR / EN)
│   ├── hooks/
│   │   └── useContacts.ts      # Hook de gestion de l'état des contacts
│   ├── i18n/
│   │   ├── locales/
│   │   │   ├── fr.json         # Traductions françaises
│   │   │   └── en.json         # Traductions anglaises
│   │   └── index.ts            # Configuration i18next
│   ├── mocks/
│   │   ├── contactsMock.ts     # Données de démonstration initiales
│   │   └── mockAdapter.ts      # Routes API simulées (CRUD)
│   ├── services/
│   │   └── contactService.ts   # Couche d'appels HTTP (getContacts, createContact…)
│   ├── types/
│   │   └── Contact.ts          # Interface TypeScript Contact
│   ├── utils/
│   │   └── validation.ts       # Fonctions de validation pures (7 règles métier)
│   ├── App.tsx                 # Composant racine
│   ├── main.tsx                # Point d'entrée
│   ├── theme.ts                # Thème MUI personnalisé
│   └── setupTests.ts           # Configuration globale des tests
├── public/
├── vite.config.ts
└── package.json
```

---

## Fonctionnalités implémentées

### Gestion des contacts (CRUD)
- **Ajouter** un contact via une modale de formulaire
- **Visualiser** les détails d'un contact en mode lecture seule
- **Modifier** un contact de deux façons :
  - Via le bouton « Modifier » depuis le mode visualisation (transition en place)
  - Via l'icône ✏ directement dans la ligne du tableau (accès direct au mode édition)
- **Supprimer** un contact avec mise à jour immédiate de la liste

### Tableau de données
- Affichage via **MUI DataGrid** en mode lecture seule (pas d'édition inline)
- Sélection multiple par cases à cocher
- Pagination configurable (10 / 25 / 50 lignes par page)
- Tri par colonne et filtrage sur toutes les colonnes
- **Colonnes supplémentaires masquées par défaut** — activables via le gestionnaire de colonnes (⋮) :

| Colonne | Type | Affichage si absent |
|---|---|---|
| Date de naissance | `date` — tri chronologique | — |
| Date de décès | `date` — tri chronologique | — |
| Père | `string` — nom + prénom combinés | — |
| Mère | `string` — nom + prénom combinés | — |

- La colonne **Actions** est protégée : elle ne peut pas être masquée pour préserver l'accès aux contrôles de visualisation, édition et suppression

### Validation des données (7 règles)

| # | Règle |
|---|---|
| 1 | `nom` : minimum 3 caractères après `.trim()` |
| 2 | `prenom` : minimum 3 caractères après `.trim()` |
| 3 | `email` : format valide |
| 4 | Le nom complet (`nom` + `prenom`) doit être unique dans la liste |
| 5 | `dateNaissance` est obligatoire |
| 6 | `dateDecès` (optionnel) doit être strictement postérieure à `dateNaissance` |
| 7 | `pere` et `mere` doivent référencer deux contacts différents |

Les erreurs s'affichent en rouge sous le champ concerné dès qu'il a été quitté (blur). Le bouton **Enregistrer** reste désactivé tant qu'il y a des erreurs.

### Internationalisation
- Interface disponible en **français** (défaut) et **anglais**
- Bascule instantanée sans rechargement de la page
- Sélecteur intégré dans la barre de navigation
- Le texte interne du **MUI DataGrid** est également traduit (pagination « Lignes par page », menus de colonnes « Masquer la colonne / Gérer les colonnes », etc.) grâce à la prop `localeText` alimentée par les objets de localisation `frFR` / `enUS` fournis par `@mui/x-data-grid/locales`

---

## Approche TDD utilisée

Le projet a été développé en suivant rigoureusement le cycle **Red → Green → Refactor** :

1. **Red** - écriture du test avant toute implémentation (le test échoue)
2. **Green** - écriture du code minimal pour faire passer le test
3. **Refactor** - amélioration du code sans casser les tests
4. **Commit** - un commit par étape fonctionnelle, uniquement après que tous les tests passent

Chaque couche applicative dispose de ses propres tests :

| Couche | Fichier de test | Type |
|---|---|---|
| Type Contact | `types/Contact.test.ts` | Structurel |
| Mock adapter | `mocks/mockAdapter.test.ts` | Unitaire |
| Service CRUD | `services/contactService.test.ts` | Unitaire |
| Validation | `utils/validation.test.ts` | Unitaire (46 cas) |
| i18n | `i18n/i18n.test.ts` | Parité de clés |
| LanguageSwitcher | `components/LanguageSwitcher/…test.tsx` | Composant |
| ContactList | `components/ContactList/…test.tsx` | Composant |
| ContactModal | `components/ContactModal/…test.tsx` | Composant |
| useContacts | `hooks/useContacts.test.ts` | Hook |
| App (intégration) | `App.test.tsx` | Intégration |

---

## Décisions de conception et compromis

### Modale trimode (visualisation / édition / ajout)

La maquette du sujet montre uniquement deux icônes d'action par ligne : 👁 (visualisation) et 🗑 (suppression). Plutôt que de créer un composant `ContactDetails` séparé qui dupliquerait toutes les définitions de champs, la modale d'ajout/édition a été étendue avec un `mode` interne (`'add' | 'view' | 'edit'`).

- En mode **view** : les champs sont désactivés, un bouton « Modifier » permet de basculer en mode édition sans fermer la modale.
- En modes **add / edit** : les champs sont éditables et le bouton « Enregistrer » est actif.

Cette approche réduit la duplication de code et offre une expérience utilisateur cohérente.

### Champs `pere` et `mere` optionnels

Le sujet définit `pere: Contact` et `mere: Contact` sans le modificateur `?`. Rendre ces champs obligatoires créerait une impossibilité logique : pour créer le premier contact, il faudrait que son père existe déjà, qui lui-même aurait besoin d'un père, à l'infini. Les champs sont donc traités comme optionnels (`pere?: Contact | null`), ce qui est cohérent avec la règle de validation n°7 (« ils doivent être différents si les deux sont renseignés ») et avec l'interface Autocomplete qui permet de vider la sélection.

### Exclusion du contact édité des options Autocomplete

Lorsqu'un contact est en cours d'édition, son propre identifiant est exclu des listes déroulantes père/mère. L'impossibilité est préventive (le choix n'existe pas dans la liste) plutôt que curative (message d'erreur après sélection).

### Mise à jour optimiste de l'état

Après chaque opération CRUD (ajout, modification, suppression), l'état local est mis à jour directement sans re-fetch complet. Cela rend l'interface réactive et évite un appel réseau redondant puisque la réponse de l'API simulée contient déjà les données finales.

### Gestion des dates JSON

`axios-mock-adapter v2` effectue une sérialisation JSON des réponses, convertissant les objets `Date` en chaînes ISO 8601. La fonction `formatDateForInput` a été rendue robuste pour gérer les deux formes afin que les champs de date soient correctement pré-remplis en mode édition.

---

## Internationalisation

Les traductions sont chargées depuis deux fichiers JSON :

- `src/i18n/locales/fr.json` — français (langue par défaut)
- `src/i18n/locales/en.json` — anglais

Un test de parité de clés (`i18n.test.ts`) garantit qu'aucune clé n'est manquante dans l'une des deux langues.

Les fonctions de validation retournent des **clés de traduction** (ex : `'errors.nom.minLength'`) plutôt que des chaînes de texte, ce qui permet à l'interface d'afficher les messages d'erreur dans la langue active sans aucune modification de la logique métier.
