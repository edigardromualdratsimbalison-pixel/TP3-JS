// Partie 7 - Fonctions responsables du DOM (aucune logique métier ici).
const $ = (id) => document.getElementById(id);

const money = (n) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " MAD";

const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR");

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const STATUS = {
  paid:    { label: "Payé",       cls: "text-bg-success" },
  pending: { label: "En attente", cls: "text-bg-warning" },
  late:    { label: "En retard",  cls: "text-bg-danger" }
};

const badge = (status) => `<span class="badge ${STATUS[status].cls}">${STATUS[status].label}</span>`;

// Remplit la liste déroulante des catégories (map pour produire le HTML).
export const renderCategories = (categories, selected = "all") => {
  const options = categories
    .map((c) => `<option value="${esc(c)}"${c === selected ? " selected" : ""}>${esc(c)}</option>`)
    .join("");
  $("category-filter").innerHTML = `<option value="all">Toutes les catégories</option>${options}`;
  // Suggestions pour le champ "Type de prestation" du formulaire d'ajout.
  $("category-list").innerHTML = categories.map((c) => `<option value="${esc(c)}"></option>`).join("");
};

// Affiche les éléments (tableau) ou un message si aucun résultat.
export const renderItems = (items, selectedId) => {
  if (items.length === 0) {
    $("items-zone").innerHTML =
      `<div class="alert alert-info mb-0">Aucun paiement ne correspond à vos critères.</div>`;
    return;
  }

  const rows = items
    .map(
      (item) => `
      <tr data-id="${item.id}" class="${item.id === selectedId ? "table-active" : ""}">
        <td class="fw-semibold">${esc(item.name)}</td>
        <td>${esc(item.category)}</td>
        <td class="text-end">${money(item.amount)}</td>
        <td>${formatDate(item.dueDate)}</td>
        <td>${badge(item.status)}</td>
      </tr>`
    )
    .join("");

  $("items-zone").innerHTML = `
    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr><th>Client</th><th>Type</th><th class="text-end">Montant</th><th>Échéance</th><th>Statut</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
};

// Affiche les indicateurs : [{ label, value, cls }]
export const renderStats = (stats) => {
  $("stats-zone").innerHTML = stats
    .map(
      (s) => `
      <div class="col-6 col-lg-3">
        <div class="card card-body h-100">
          <small class="text-muted">${s.label}</small>
          <span class="stat-value ${s.cls || ""}">${s.value}</span>
        </div>
      </div>`
    )
    .join("");
};

// Affiche le détail d'un élément (ou un texte d'invitation si aucun n'est choisi).
export const renderDetail = (item) => {
  if (!item) {
    $("detail-zone").innerHTML =
      `<p class="text-muted mb-0">Cliquez sur une ligne pour voir le détail d'un paiement.</p>`;
    return;
  }

  $("detail-zone").innerHTML = `
    <h2 class="h5">${esc(item.name)}</h2>
    <p class="mb-3">${badge(item.status)}</p>
    <dl class="mb-3">
      <dt>Description</dt><dd>${esc(item.description)}</dd>
      <dt>Type de prestation</dt><dd>${esc(item.category)}</dd>
      <dt>Montant</dt><dd>${money(item.amount)}</dd>
      <dt>Échéance</dt><dd>${formatDate(item.dueDate)}</dd>
      <dt>Référence</dt><dd>FAC-${String(item.id).padStart(4, "0")}</dd>
    </dl>
    <div class="d-grid gap-2">
      <button id="toggle-paid" class="btn ${item.paid ? "btn-outline-secondary" : "btn-success"}">
        ${item.paid ? "Marquer comme non payé" : "Marquer comme payé"}
      </button>
      <button id="delete-item" class="btn btn-outline-danger">Supprimer</button>
    </div>`;
};

// Partie 10 : messages d'erreur dans l'interface.
export const showError = (message) => {
  $("error-zone").innerHTML = `<div class="alert alert-danger" role="alert">${esc(message)}</div>`;
};

export const clearError = () => {
  $("error-zone").innerHTML = "";
};
