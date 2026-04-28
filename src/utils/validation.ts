// Fonctions de validation pures — retournent une clé de traduction (string) ou null si valide
// Les clés sont résolues par i18next dans les composants via t(key)
import type { Contact } from '../types';

// Regex standard pour la validation du format email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Règle 1 : nom ≥ 3 caractères après trim() ───────────────────────────────

export const validateNom = (nom: string): string | null => {
  if (!nom || nom.trim().length === 0) return 'errors.nom.required';
  if (nom.trim().length < 3) return 'errors.nom.minLength';
  return null;
};

// ─── Règle 2 : prenom ≥ 3 caractères après trim() ────────────────────────────

export const validatePrenom = (prenom: string): string | null => {
  if (!prenom || prenom.trim().length === 0) return 'errors.prenom.required';
  if (prenom.trim().length < 3) return 'errors.prenom.minLength';
  return null;
};

// ─── Règle 3 : email au format valide ────────────────────────────────────────

export const validateEmail = (email: string): string | null => {
  if (!email || email.trim().length === 0) return 'errors.email.required';
  if (!EMAIL_REGEX.test(email)) return 'errors.email.invalid';
  return null;
};

// ─── Règle 5 : dateNaissance obligatoire ─────────────────────────────────────

export const validateDateNaissance = (dateNaissance: Date | null): string | null => {
  if (!dateNaissance) return 'errors.dateNaissance.required';
  return null;
};

// ─── Règle 6 : dateDecès optionnel mais strictement après dateNaissance ───────

export const validateDateDecès = (
  dateDecès: Date | null | undefined,
  dateNaissance: Date | null
): string | null => {
  // Champ optionnel — aucune erreur si absent
  if (!dateDecès) return null;
  // Impossible de comparer sans date de naissance
  if (!dateNaissance) return null;
  if (dateDecès <= dateNaissance) return 'errors.dateDecès.beforeNaissance';
  return null;
};

// ─── Règle 7 : pere et mere doivent référencer deux contacts différents ───────

export const validateParents = (
  pere: Contact | null | undefined,
  mere: Contact | null | undefined
): string | null => {
  // La validation ne s'applique que lorsque les deux champs sont renseignés
  if (!pere || !mere) return null;
  if (pere.id === mere.id) return 'errors.parents.identical';
  return null;
};

// ─── Règle 4 : nom complet (nom + prenom) unique dans la liste ───────────────

export const validateUniqueName = (
  nom: string,
  prenom: string,
  contacts: Contact[],
  excludeId?: string
): string | null => {
  const normalizedNom = nom.trim().toLowerCase();
  const normalizedPrenom = prenom.trim().toLowerCase();

  const isDuplicate = contacts.some(
    (c) =>
      c.nom.trim().toLowerCase() === normalizedNom &&
      c.prenom.trim().toLowerCase() === normalizedPrenom &&
      c.id !== excludeId
  );

  if (isDuplicate) return 'errors.name.duplicate';
  return null;
};

// ─── Agrégateur : valide toutes les règles et retourne une map champ → clé ───

export const validateContact = (
  data: Partial<Contact>,
  contacts: Contact[],
  excludeId?: string
): Record<string, string> => {
  const errors: Record<string, string> = {};

  const nomError = validateNom(data.nom ?? '');
  if (nomError) errors.nom = nomError;

  const prenomError = validatePrenom(data.prenom ?? '');
  if (prenomError) errors.prenom = prenomError;

  const emailError = validateEmail(data.email ?? '');
  if (emailError) errors.email = emailError;

  const dateNaissanceError = validateDateNaissance(data.dateNaissance ?? null);
  if (dateNaissanceError) errors.dateNaissance = dateNaissanceError;

  const dateDecèsError = validateDateDecès(data.dateDecès, data.dateNaissance ?? null);
  if (dateDecèsError) errors.dateDecès = dateDecèsError;

  const parentsError = validateParents(data.pere, data.mere);
  if (parentsError) errors.parents = parentsError;

  // Vérification du doublon uniquement si le nom et le prénom sont valides individuellement
  if (!nomError && !prenomError) {
    const duplicateError = validateUniqueName(
      data.nom ?? '',
      data.prenom ?? '',
      contacts,
      excludeId
    );
    if (duplicateError) errors.nom = duplicateError;
  }

  return errors;
};
