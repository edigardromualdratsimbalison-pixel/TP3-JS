// Partie 4 - État courant de l'application.
// Au démarrage, items est vide : les données arrivent après le fetch().
export const state = {
  items: [],          // rempli après le chargement de data.json
  search: "",         // texte de la recherche
  category: "all",    // catégorie sélectionnée
  unpaidOnly: false,  // critère booléen : n'afficher que les impayés
  selectedId: null    // identifiant de l'élément dont on affiche le détail
};
