// Éléments DOM
const candidaturesContainer = document.getElementById('candidatures-container');
const candidatureForm = document.getElementById('candidature-form');
const candidatureModal = document.getElementById('candidature-modal');
const confirmDeleteModal = document.getElementById('confirm-delete-modal');
const modalTitle = document.getElementById('modal-title');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('filter-status');
const dateFilter = document.getElementById('filter-date');
const addCandidatureBtn = document.getElementById('btn-add-candidature');

// État de l'application
let candidatures = [];
let currentCandidatureId = null;

// Configuration de l'API
const API_URL = '/api/candidatures';

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Charger les candidatures
  fetchCandidatures();
  
  // Gestionnaires d'événements
  addCandidatureBtn.addEventListener('click', openAddCandidatureModal);
  candidatureForm.addEventListener('submit', handleFormSubmit);
  
  // Fermeture des modals
  document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', closeModals);
  });
  
  // Filtres
  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  dateFilter.addEventListener('change', applyFilters);
  
  // Bouton de confirmation de suppression
  document.getElementById('confirm-delete').addEventListener('click', deleteCurrentCandidature);
  
  // Fermer les modals en cliquant en dehors
  window.addEventListener('click', (e) => {
    if (e.target === candidatureModal) {
      closeModals();
    }
    if (e.target === confirmDeleteModal) {
      closeModals();
    }
  });
});

// Fonctions pour gérer les candidatures
async function fetchCandidatures() {
  try {
    showLoading();
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des candidatures');
    }
    
    candidatures = await response.json();
    renderCandidatures();
  } catch (error) {
    console.error('Erreur:', error);
    showError('Impossible de charger les candidatures. Veuillez réessayer plus tard.');
  }
}

function renderCandidatures() {
  // Filtrer les candidatures selon les critères actuels
  const filteredCandidatures = filterCandidatures();
  
  // Vider le conteneur
  candidaturesContainer.innerHTML = '';
  
  // Afficher un message si aucune candidature
  if (filteredCandidatures.length === 0) {
    candidaturesContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <p>Aucune candidature trouvée</p>
        <button class="btn btn-primary" onclick="openAddCandidatureModal()">
          <i class="fas fa-plus"></i> Ajouter une candidature
        </button>
      </div>
    `;
    return;
  }
  
  // Créer et ajouter les cartes de candidature
  filteredCandidatures.forEach(candidature => {
    const card = createCandidatureCard(candidature);
    candidaturesContainer.appendChild(card);
  });
}

function createCandidatureCard(candidature) {
  const card = document.createElement('div');
  card.className = 'candidature-card';
  
  // Formatage de la date
  const date = new Date(candidature.dateCandidate);
  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Classe CSS pour le statut
  let statusClass = '';
  switch(candidature.statut) {
    case 'En attente':
      statusClass = 'status-waiting';
      break;
    case 'Entretien':
      statusClass = 'status-interview';
      break;
    case 'Refusé':
      statusClass = 'status-rejected';
      break;
    case 'Accepté':
      statusClass = 'status-accepted';
      break;
    case 'À relancer':
      statusClass = 'status-followup';
      break;
  }
  
  card.innerHTML = `
    <div class="entreprise-info">
      <h3>${candidature.entreprise}</h3>
      <div class="poste">${candidature.poste}</div>
      <div class="date">Candidature le ${formattedDate}</div>
    </div>
    <div class="contact-info">
      ${candidature.contact && candidature.contact.nom ? candidature.contact.nom : 'Aucun contact'}
    </div>
    <div class="status ${statusClass}">
      ${candidature.statut}
    </div>
    <div class="actions">
      <button class="action-btn view-btn" title="Voir les détails" data-id="${candidature._id}">
        <i class="fas fa-eye"></i>
      </button>
      <button class="action-btn edit-btn" title="Modifier" data-id="${candidature._id}">
        <i class="fas fa-edit"></i>
      </button>
      <button class="action-btn delete-btn" title="Supprimer" data-id="${candidature._id}">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
  
  // Ajouter les écouteurs d'événements aux boutons
  const editBtn = card.querySelector('.edit-btn');
  const deleteBtn = card.querySelector('.delete-btn');
  const viewBtn = card.querySelector('.view-btn');
  
  editBtn.addEventListener('click', () => openEditCandidatureModal(candidature._id));
  deleteBtn.addEventListener('click', () => openDeleteConfirmModal(candidature._id));
  viewBtn.addEventListener('click', () => viewCandidatureDetails(candidature._id));
  
  return card;
}

// Filtres
function filterCandidatures() {
  const searchTerm = searchInput.value.toLowerCase();
  const statusValue = statusFilter.value;
  const dateValue = dateFilter.value;
  
  return candidatures.filter(candidature => {
    // Filtre de recherche
    const matchesSearch = 
      candidature.entreprise.toLowerCase().includes(searchTerm) ||
      candidature.poste.toLowerCase().includes(searchTerm) ||
      (candidature.notes && candidature.notes.toLowerCase().includes(searchTerm));
    
    // Filtre de statut
    const matchesStatus = statusValue === '' || candidature.statut === statusValue;
    
    // Filtre de date
    let matchesDate = true;
    if (dateValue !== '') {
      const today = new Date();
      const candidatureDate = new Date(candidature.dateCandidate);
      
      switch(dateValue) {
        case 'week':
          // Cette semaine (7 derniers jours)
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(today.getDate() - 7);
          matchesDate = candidatureDate >= oneWeekAgo;
          break;
        case 'month':
          // Ce mois (30 derniers jours)
          const oneMonthAgo = new Date();
          oneMonthAgo.setDate(today.getDate() - 30);
          matchesDate = candidatureDate >= oneMonthAgo;
          break;
        case 'quarter':
          // Ce trimestre (90 derniers jours)
          const oneQuarterAgo = new Date();
          oneQuarterAgo.setDate(today.getDate() - 90);
          matchesDate = candidatureDate >= oneQuarterAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });
}

function applyFilters() {
  renderCandidatures();
}

// Gestion des modales
function openAddCandidatureModal() {
  // Réinitialiser le formulaire
  candidatureForm.reset();
  currentCandidatureId = null;
  modalTitle.textContent = 'Nouvelle candidature';
  
  // Définir la date par défaut à aujourd'hui
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date-candidate').value = today;
  
  // Ouvrir la modale
  candidatureModal.style.display = 'block';
}

async function openEditCandidatureModal(id) {
  try {
    // Récupérer les détails de la candidature
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la candidature');
    }
    
    const candidature = await response.json();
    currentCandidatureId = candidature._id;
    
    // Remplir le formulaire avec les données
    modalTitle.textContent = 'Modifier la candidature';
    document.getElementById('candidature-id').value = candidature._id;
    document.getElementById('entreprise').value = candidature.entreprise;
    document.getElementById('poste').value = candidature.poste;
    
    // Formater la date pour l'input date
    if (candidature.dateCandidate) {
      const dateObj = new Date(candidature.dateCandidate);
      const formattedDate = dateObj.toISOString().split('T')[0];
      document.getElementById('date-candidate').value = formattedDate;
    }
    
    document.getElementById('statut').value = candidature.statut;
    
    // Remplir les informations de contact
    if (candidature.contact) {
      document.getElementById('contact-nom').value = candidature.contact.nom || '';
      document.getElementById('contact-email').value = candidature.contact.email || '';
      document.getElementById('contact-telephone').value = candidature.contact.telephone || '';
    }
    
    document.getElementById('lien-offre').value = candidature.lienOffre || '';
    document.getElementById('notes').value = candidature.notes || '';
    
    // Cocher les documents
    if (candidature.documents) {
      document.getElementById('doc-cv').checked = candidature.documents.cv || false;
      document.getElementById('doc-lettre').checked = candidature.documents.lettreMotive || false;
      document.getElementById('doc-portfolio').checked = candidature.documents.portfolio || false;
    }
    
    // Ouvrir la modale
    candidatureModal.style.display = 'block';
  } catch (error) {
    console.error('Erreur:', error);
    showError('Impossible de récupérer les détails de la candidature.');
  }
}

function openDeleteConfirmModal(id) {
  currentCandidatureId = id;
  confirmDeleteModal.style.display = 'block';
}

function closeModals() {
  candidatureModal.style.display = 'none';
  confirmDeleteModal.style.display = 'none';
}

// Affichage des détails d'une candidature
function viewCandidatureDetails(id) {
  // Pour l'instant, on utilise la même modale que pour l'édition
  openEditCandidatureModal(id);
  // Éventuellement, on pourrait créer une modale spécifique pour la visualisation
}

// Gestion du formulaire
async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Récupérer les données du formulaire
  const formData = {
    entreprise: document.getElementById('entreprise').value,
    poste: document.getElementById('poste').value,
    dateCandidate: document.getElementById('date-candidate').value,
    statut: document.getElementById('statut').value,
    contact: {
      nom: document.getElementById('contact-nom').value,
      email: document.getElementById('contact-email').value,
      telephone: document.getElementById('contact-telephone').value
    },
    lienOffre: document.getElementById('lien-offre').value,
    notes: document.getElementById('notes').value,
    documents: {
      cv: document.getElementById('doc-cv').checked,
      lettreMotive: document.getElementById('doc-lettre').checked,
      portfolio: document.getElementById('doc-portfolio').checked
    }
  };
  
  try {
    let response;
    
    if (currentCandidatureId) {
      // Mise à jour d'une candidature existante
      response = await fetch(`${API_URL}/${currentCandidatureId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
    } else {
      // Création d'une nouvelle candidature
      response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
    }
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'enregistrement de la candidature');
    }
    
    // Rafraîchir les données et fermer la modale
    await fetchCandidatures();
    closeModals();
    
  } catch (error) {
    console.error('Erreur:', error);
    showError('Impossible d\'enregistrer la candidature. Veuillez réessayer.');
  }
}

// Suppression d'une candidature
async function deleteCurrentCandidature() {
  if (!currentCandidatureId) return;
  
  try {
    const response = await fetch(`${API_URL}/${currentCandidatureId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la candidature');
    }
    
    // Rafraîchir les données et fermer la modale
    await fetchCandidatures();
    closeModals();
    
    // Afficher un message de succès
    showMessage('Candidature supprimée avec succès!');
    
  } catch (error) {
    console.error('Erreur:', error);
    showError('Impossible de supprimer la candidature. Veuillez réessayer.');
  }
}

// Fonctions utilitaires
function showLoading() {
  candidaturesContainer.innerHTML = '<div class="loading">Chargement des données...</div>';
}

function showError(message) {
  // Afficher un message d'erreur temporaire
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  
  document.body.appendChild(errorElement);
  
  // Supprimer le message après 3 secondes
  setTimeout(() => {
    errorElement.remove();
  }, 3000);
}

function showMessage(message) {
  // Afficher un message temporaire
  const messageElement = document.createElement('div');
  messageElement.className = 'success-message';
  messageElement.textContent = message;
  
  document.body.appendChild(messageElement);
  
  // Supprimer le message après 3 secondes
  setTimeout(() => {
    messageElement.remove();
  }, 3000);
}