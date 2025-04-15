const mongoose = require('mongoose');

const CandidatureSchema = new mongoose.Schema({
  entreprise: {
    type: String,
    required: true
  },
  poste: {
    type: String,
    required: true
  },
  dateCandidate: {
    type: Date,
    default: Date.now
  },
  statut: {
    type: String,
    enum: ['En attente', 'Entretien', 'Refusé', 'Accepté', 'À relancer'],
    default: 'En attente'
  },
  contact: {
    nom: String,
    email: String,
    telephone: String
  },
  notes: String,
  lienOffre: String,
  documents: {
    cv: Boolean,
    lettreMotive: Boolean,
    portfolio: Boolean,
    autres: [String]
  },
  dateMiseAJour: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Candidature', CandidatureSchema);