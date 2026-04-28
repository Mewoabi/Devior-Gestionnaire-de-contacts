// Définition du type principal de l'application — représente un contact dans le gestionnaire
export interface Contact {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  // Date de décès optionnelle — doit être strictement après dateNaissance si renseignée
  dateDecès?: Date;
  email: string;
  // Références optionnelles à d'autres contacts (peuvent être null si non sélectionnés)
  pere?: Contact | null;
  mere?: Contact | null;
}
