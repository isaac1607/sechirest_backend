// Importation des dépendances avec la syntaxe ES moderne
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { WebSocketServer } from 'ws';
import http from 'http';
import dotenv from 'dotenv';
import { runMigrations } from './config/migrations/index.js';
import inscriptionRoutes from './routes/inscription.routes.js'; 
import initRoutes from './routes/initialisation.routes.js'; 

// Configuration des variables d'environnement
dotenv.config();

// Création de l'application Express
const app = express();

// Création du serveur HTTP
const server = http.createServer(app);

// Configuration du serveur WebSocket avec la bonne syntaxe
const wss = new WebSocketServer({ server });

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour parser les données encodées dans l'URL
app.use(express.urlencoded({ extended: true }));

// Activation de CORS pour permettre les requêtes cross-origin
app.use(cors());

// Middleware de sécurité
app.use(helmet());

// Logger des requêtes HTTP en mode développement
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Exécuter les migrations avant de démarrer le serveur

try {
    await runMigrations();
} catch (error) {
    console.error('Erreur fatale lors des migrations:', error);
    process.exit(1);
}

// Gestion des WebSocket connections
wss.on('connection', (ws) => {
    console.log('Nouveau client WebSocket connecté');

    // Gestion des messages reçus
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Message reçu:', data);
            
            // Ici vous pouvez ajouter la logique de traitement des messages
            // Par exemple, diffuser les nouvelles commandes aux clients connectés
        } catch (error) {
            console.error('Erreur lors du traitement du message:', error);
        }
    });

    // Gestion de la déconnexion
    ws.on('close', () => {
        console.log('Client WebSocket déconnecté');
    });
});

// Route de test pour vérifier que le serveur fonctionne
app.get('/api/test', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API SechiRest!' });
});

// Ajout des routes
app.use('/initialisation', initRoutes);
app.use('/restaurant/inscription', inscriptionRoutes);


// Middleware pour gérer les routes non trouvées
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Route non trouvée'
    });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Erreur serveur',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Définition du port
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
// Démarrage du serveur
server.listen(PORT, HOST, () => {
    console.log(`Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV}`);
    console.log(`Test l'API: http://${HOST}:${PORT}/api/test`);
});

// Gestion de l'arrêt propre du serveur
process.on('SIGTERM', () => {
    console.info('SIGTERM signal reçu. Fermeture du serveur HTTP...');
    server.close(() => {
        console.log('Serveur HTTP fermé');
        process.exit(0);
    });
});
