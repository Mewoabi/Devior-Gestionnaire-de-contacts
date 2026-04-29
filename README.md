# Gestionnaire de Contacts

Application web de gestion de contacts développée en **React + TypeScript** (Vite). Les données sont **mockées côté frontend** avec **axios** et **axios-mock-adapter** ; aucun backend n’est requis.

Prévisualisation déployée : [https://gestionnaire-de-contacts-ct57.onrender.com/](https://gestionnaire-de-contacts-ct57.onrender.com/)

Ce document est structuré pour suivre le même ordre qu’une présentation naturelle du projet : **objectif et exigences du sujet**, **mise en route**, **parcours utilisateur et règles métier**, **architecture du code**, **données et état**, **internationalisation**, **qualité logicielle**, puis **décisions de conception** (y compris les extensions au-delà du minimum demandé).

---

## 1. Objectif et alignement avec le sujet

**Objectif :** gérer des contacts (création, consultation, modification, suppression) avec un modèle `Contact` et une UI **MUI** (notamment **MUI X DataGrid** en lecture seule et **MUI Autocomplete** pour les parents).

**Bibliothèques imposées par le sujet (résumé) :**

| Exigence | Réalisation |
|---|---|
| Appels HTTP via **axios** | `src/services/contactService.ts` |
| Données mockées via **axios-mock-adapter** | `src/mocks/mockAdapter.ts` |
| Tableau via **MUI DataGrid** | `src/components/ContactList/ContactList.tsx` |
| Sélection père / mère via **MUI Autocomplete** | `src/components/ContactModal/ContactModal.tsx` |
| **react-i18next** (FR / EN, bascule instantanée) | `src/i18n/`, `src/components/LanguageSwitcher/` |

**Modèle `Contact` (attributs principaux) :** voir `src/types/Contact.ts` — inclut notamment `dateNaissance`, `dateDecès` optionnelle, et références parentales `pere` / `mere` comme **objets** `Contact` (conformément au sujet).

---

## 2. Prérequis, installation et lancement

**Prérequis :** Node.js ≥ 18, npm ≥ 9.

**Installation :**

```bash
npm install
```

**Lancement du serveur de développement :**

```bash
npm run dev
```

L’application est disponible à l’URL affichée dans le terminal (souvent `http://localhost:5173`).

---

## 3. Parcours fonctionnel (ce que fait l’application)

### 3.1 Liste des contacts (DataGrid lecture seule)

- Grille **non éditable en ligne** : l’édition passe par la modale.
- **Pagination** configurable (par ex. 10 / 25 / 50 lignes), **tri** et **filtres** sur les colonnes exposées.
- Colonne **`#`** : numéro d’affichage **sur toute la liste** (avec la pagination contrôlée, l’index **continue** d’une page à l’autre pour rester cohérent avec la plage affichée en pied de tableau). Peut être masquée via le gestionnaire de colonnes.
- Colonnes détaillées (dates, parents) **masquées par défaut**, activables via le menu de colonnes.
- Actions par ligne : **voir**, **éditer**, **supprimer**.

### 3.2 Ajouter un contact

- Bouton **Ajouter** → ouverture d’une **modale** de formulaire.
- Sauvegarde : la ligne apparaît dans la grille avec mise à jour **immédiate** de l’état.

### 3.3 Voir et modifier un contact (même modale)

- Une **seule modale** sert à l’ajout et à l’édition (**exigence du sujet**).
- **Extension :** ajout d’un mode **visualisation** (lecture seule) depuis l’icône « œil », avec passage à l’édition sans dupliquer l’UI.
- Édition possible aussi depuis l’icône **crayon** dans la grille.

### 3.4 Supprimer un contact

- Confirmation avant suppression.

**Extensions liées aux parents :**

- Si un contact est **référencé comme père ou mère** par d’autres, le dialogue de suppression affiche un **avertissement renforcé** (avec compteur de liens le cas échéant).

### 3.5 Internationalisation

- Sélecteur **Français / English** dans l’**AppBar**.
- Changement **instantané** sans rechargement.
- Textes du **DataGrid** (pagination, menus) alignés via les objets `localeText` MUI (`frFR` / `enUS`).

### 3.6 Responsive mobile

- Mise en page **responsive** (desktop/tablette/mobile), incluant l’**AppBar** et la grille.
- Ajustements spécifiques mobile pour conserver une hiérarchie visuelle lisible (titre, icône, contrôles principaux).

---

## 4. Règles métier et validation (7 règles)

Les validations sont implémentées de façon **purement fonctionnelle** dans `src/utils/validation.ts` ; la modale consume les erreurs après **blur** et **désactive** l’enregistrement tant qu’il reste des erreurs.

| # | Règle |
|---|---|
| 1 | `nom` : minimum 3 caractères après trim |
| 2 | `prenom` : minimum 3 caractères après trim |
| 3 | `email` : format valide |
| 4 | Unicité du **couple** nom complet (`nom + prénom`) dans la liste |
| 5 | `dateNaissance` obligatoire |
| 6 | `dateDecès` optionnel ; si présent, **strictement après** la date de naissance |
| 7 | `pere` et `mere` sont des contacts **distincts** si les deux sont renseignés |

Les messages affichés proviennent des **clés i18n** retournées par la validation puis traduites dans les composants.

---

## 5. Architecture du code et responsabilités

### 5.1 Stack technique

| Rôle | Bibliothèque |
|---|---|
| UI | React + TypeScript |
| Build | Vite |
| Composants | MUI (`@mui/material`) |
| Tableau | MUI X DataGrid (`@mui/x-data-grid`) |
| HTTP | axios |
| Mock | axios-mock-adapter |
| i18n | react-i18next + i18next |
| Tests | Vitest + Testing Library |

### 5.2 Organisation des dossiers

```
contact-manager/
├── src/
│   ├── components/
│   │   ├── ContactList/        # DataGrid (liste, pagination, colonnes)
│   │   ├── ContactModal/        # Formulaire modal (modes add / edit / view)
│   │   └── LanguageSwitcher/    # Sélecteur de langue
│   ├── hooks/
│   │   └── useContacts.ts      # État des contacts et opérations CRUD
│   ├── mocks/
│   │   ├── contactsMock.ts      # Jeu de données initial
│   │   └── mockAdapter.ts      # Réponses axios mockées
│   ├── services/
│   │   └── contactService.ts   # Façade HTTP utilisée par le hook
│   ├── utils/
│   │   └── validation.ts       # Agrégateur de validation métier
│   ├── i18n/
│   │   └── locales/            # JSON FR / EN
│   ├── types/
│   │   └── Contact.ts
│   ├── theme.ts                # Thème MUI
│   ├── App.tsx                 # Composition (liste, modales, dialogue suppression)
│   └── main.tsx
├── public/
├── vite.config.ts
└── package.json
```

Flux simplifié : **UI → `useContacts` → `contactService` → `apiClient` (mock Adapter) → mise à jour d’état**.

---

## 6. Données simulées, état local et synchronisation des liens parents

### 6.1 Mock API (`mockAdapter`)

- Routes CRUD en mémoire sur l’instance axios partagée.
- Fonction utilitaire **`reconcileParentReferences`** après `PUT` / `DELETE` : met à jour les **objets** `pere`/`mere` embarqués dans tout le jeu de données lorsqu’un contact parent change ou est supprimé (évite références obsolètes).

### 6.2 Hook `useContacts`

- Même logique de **réconciliation** côté client après édition / suppression pour refléter immédiatement les changements dans la grille et la modale (**synchronisation d’état** cohérente avec un modèle en références objets).

### 6.3 Mise à jour optimiste

- Après succès mocké, la liste locale est mise à jour **sans refetch systématique** de toute la base (toujours cohérent avec la réconciliation).

---

## 7. Internationalisation — détails

- Traductions : `src/i18n/locales/fr.json` et `en.json`.
- Test de **parité des clés** entre langues (`i18n.test.ts`).
- Sélecteur de langue avec drapeaux (assets dans `public/flags/`).

---

## 8. Qualité logicielle et tests

### Commandes

```bash
npm test                  # Vitest interactif
npm run test -- --run     # exécution unique (CI / contrôle rapide)
npm run test:coverage     # couverture
npm run lint              # ESLint
npm run build             # compilation TypeScript + build Vite
```

### Stratégie

- Développement guidé par les tests (**TDD**) : tests unitaires (validation, mocks, services), tests de composants (liste, modale, sélecteur de langue), tests d’intégration sur `App`.

---

## 9. Décisions de conception, extensions UX et périmètre du sujet

### 9.1 Modale trimode (`add | view | edit`)

Le sujet imposait une modale commune pour ajout et édition ; l’extension **vue détaillée** évite une seconde page tout en gardant un seul formulaire.

### 9.2 Parents optionnels dans le typage

Les `pere` / `mere` sont typés **`Contact | null | undefined`** pour permettre des contacts sans ascendants tout en satisfaisant la règle 7 lorsque les deux champs sont remplis.

### 9.3 Réconciliation d’objets vs normalisation par identifiants

Le sujet impose des références **objet** pour les parents. La fonction `reconcileParentReferences` compense ce choix sans refonte complète vers des `*_id` séparés.

### 9.4 Dates et serialization JSON

Le mock peut renvoyer des dates en chaînes ISO ; le préremplissage du formulaire gère **`Date`** et **chaîne** pour éviter les incohérences d’édition.

### 9.5 Extensions UX au-delà de la grille « minimale »

- **Thème MUI** personnalisé et hiérarchie visuelle (AppBar / barre de liste / en-tête de grille).
- **Colonne `#`** pour un repère utilisateur lisible (les identifiants générés peuvent peupler la liste de longs numéros peu parlants).
- **Suppression avec avertissement** si le contact est parent référencé.
- **Accessibilité** : intitulés d’actions sur les boutons d’icônes, erreurs reliées aux champs.

---

## 10. Pistes de poursuite possibles

- Persistance hors session (backend réel ou `localStorage`) — hors périmètre du mock actuel.
- Édition en ligne dans le DataGrid — volontairement non retenue pour respecter « grille en lecture seule » du sujet.
