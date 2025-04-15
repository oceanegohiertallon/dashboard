const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Import des routes
const candidaturesRoutes = require('./routes/candidatures');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3336;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Connexion à MongoDB (à configurer selon votre environnement)
mongoose.connect('mongodb://localhost:27017/dashboard-candidatures', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connexion à MongoDB réussie'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Routes
app.use('/api/candidatures', candidaturesRoutes);

// Route principale pour servir l'interface utilisateur
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});