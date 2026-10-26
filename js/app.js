// Orchestration : données, événements et rendu.
import { state } from "./state.js";
import { fetchData } from "./dataservice.js";
import {
  renderCategories,
  renderItems,
  renderStats,
  renderDetail,
  showError,
  clearError
} from "./view.js";

const today = () => new Date().toISOString().slice(0, 10);

// Calcule le statut d'un paiement à partir de ses propriétés.
const getStatus = (item) => {
  if (item.paid) return "paid";
  return item.dueDate < today() ? "late" : "pending";
};

// Partie 5-B : map() - transformer (ajout d'une propriété "status").
const withStatus = (items) => items.map((item) => ({ ...item, status: getStatus(item) }));

// Partie 5-C : filter() - recherche + catégorie + critère booléen, cumulables.
const getVisibleItems = () => {
  const search = state.search.trim().toLowerCase();

  return state.items.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search);
    const matchCategory = state.category === "all" || item.category === state.category;
    const matchPaid = !state.unpaidOnly || !item.paid;
    return matchSearch && matchCategory && matchPaid;
  });
};

// Partie 6 + 5-A : forEach() - calcul des indicateurs.
const computeStats = (items) => {
  let total = 0;
  let collected = 0;
  let lateCount = 0;

  items.forEach((item) => {
    total += item.amount;
    if (item.paid) collected += item.amount;
    if (item.status === "late") lateCount++;
  });

  const fmt = (n) => n.toLocaleString("fr-FR") + " MAD";

  return [
    { label: "Total facturé",     value: fmt(total) },
    { label: "Encaissé",          value: fmt(collected), cls: "text-success" },
    { label: "Reste à encaisser", value: fmt(total - collected), cls: "text-warning" },
    { label: "Paiements en retard", value: lateCount, cls: "text-danger" }
  ];
};

// Génère la liste des catégories à partir des données (Set + map).
const refreshCategories = () => {
  const categories = [...new Set(state.items.map((item) => item.category))];
  if (state.category !== "all" && !categories.includes(state.category)) state.category = "all";
  renderCategories(categories, state.category);
};

// Thème clair / sombre (préférence mémorisée si le navigateur l'autorise).
const setupTheme = () => {
  const root = document.documentElement;
  let theme = null;
  try { theme = localStorage.getItem("theme"); } catch (e) { /* stockage indisponible */ }
  if (!theme) theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  root.setAttribute("data-bs-theme", theme);
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const next = root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-bs-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) { /* ignoré */ }
  });
};

// Partie 8 : render() - state -> traitement -> DOM.
const render = () => {
  const visible = withStatus(getVisibleItems());

  renderItems(visible, state.selectedId);
  renderStats(computeStats(visible));

  // Partie 5-D : find() - retrouver l'élément sélectionné.
  const selected = withStatus(state.items).find((item) => item.id === state.selectedId);
  renderDetail(selected);
};

// Partie 9 : interactions (action -> modification du state -> render()).
const setupEvents = () => {
  document.getElementById("search").addEventListener("input", (e) => {
    state.search = e.target.value;
    render();
  });

  document.getElementById("category-filter").addEventListener("change", (e) => {
    state.category = e.target.value;
    render();
  });

  document.getElementById("unpaid-only").addEventListener("change", (e) => {
    state.unpaidOnly = e.target.checked;
    render();
  });

  document.getElementById("items-zone").addEventListener("click", (e) => {
    const row = e.target.closest("tr[data-id]");
    if (!row) return;
    state.selectedId = Number(row.dataset.id);
    render();
  });

  // 5e interaction : changer le statut de paiement d'un élément.
  document.getElementById("detail-zone").addEventListener("click", (e) => {
    if (!e.target.closest("#toggle-paid")) return;
    const item = state.items.find((i) => i.id === state.selectedId);
    if (!item) return;
    item.paid = !item.paid;
    render();
  });

  // Ajout d'un paiement depuis le formulaire.
  document.getElementById("payment-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const newItem = {
      id: Math.max(0, ...state.items.map((i) => i.id)) + 1,
      name: data.get("client").trim(),
      category: data.get("category").trim(),
      amount: parseFloat(data.get("amount")) || 0,
      paid: false,
      dueDate: data.get("dueDate"),
      description: data.get("description").trim()
    };
    state.items.push(newItem);
    state.selectedId = newItem.id;
    form.reset();
    refreshCategories();
    render();
  });

  // Suppression d'un paiement (filter() pour retirer l'élément).
  document.getElementById("detail-zone").addEventListener("click", (e) => {
    if (!e.target.closest("#delete-item")) return;
    if (!confirm("Supprimer ce paiement ?")) return;
    state.items = state.items.filter((i) => i.id !== state.selectedId);
    state.selectedId = null;
    refreshCategories();
    render();
  });
};

// Partie 10 : chargement initial dans try / catch.
const init = async () => {
  setupTheme();
  setupEvents();
  render(); // affichage initial avec state.items = []

  try {
    clearError();
    state.items = await fetchData();

    refreshCategories();
    render();
  } catch (error) {
    console.error("Erreur de chargement :", error);
    showError("Impossible de charger les données. Vérifiez le fichier data/data.json et lancez le site avec un serveur local (Live Server).");
  }
};

init();

