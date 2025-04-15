const express = require('express');
const router = express.Router();
const Candidature = require('../models/Candidature');

// Récupérer toutes les candidatures
router.get('/', async (req, res) => {
  try {
    const candidatures = await Candidature.find().sort({ dateMiseAJour: -1 });
    res.json(candidatures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer une candidature spécifique
router.get('/:id', async (req, res) => {
  try {
    const candidature = await Candidature.findById(req.params.id);
    if (!candidature) {
      return res.status(404).json({ message: 'Candidature non trouvée' });
    }
    res.json(candidature);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer une nouvelle candidature
router.post('/', async (req, res) => {
  const candidature = new Candidature({
    entreprise: req.body.entreprise,
    poste: req.body.poste,
    dateCandidate: req.body.dateCandidate,
    statut: req.body.statut,
    contact: req.body.contact,
    notes: req.body.notes,
    lienOffre: req.body.lienOffre,
    documents: req.body.documents
  });

  try {
    const nouvelleCandidature = await candidature.save();
    res.status(201).json(nouvelleCandidature);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mettre à jour une candidature
router.put('/:id', async (req, res) => {
  try {
    // Mettre à jour la date de mise à jour
    req.body.dateMiseAJour = Date.now();
    
    const candidatureModifiee = await Candidature.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!candidatureModifiee) {
      return res.status(404).json({ message: 'Candidature non trouvée' });
    }
    
    res.json(candidatureModifiee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer une candidature
router.delete('/:id', async (req, res) => {
  try {
    const candidatureSupprimee = await Candidature.findByIdAndDelete(req.params.id);
    
    if (!candidatureSupprimee) {
      return res.status(404).json({ message: 'Candidature non trouvée' });
    }
    
    res.json({ message: 'Candidature supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;