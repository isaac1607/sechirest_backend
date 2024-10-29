import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

// Configuration de la connexion à la base de données
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // Paramètres de configuration supplémentaires
    max: 20, // Nombre maximum de clients dans le pool
    idleTimeoutMillis: 30000, // Temps maximum d'inactivité d'un client
    connectionTimeoutMillis: 2000, // Temps maximum pour établir une connexion
});

// Tester la connexion au démarrage
pool.connect((err, client, release) => {
    if (err) {
        console.error('Erreur lors de la connexion à la base de données:', err.stack);
        return;
    }
    console.log('Connexion à la base de données établie avec succès');
    release(); // Libérer le client
});

// Fonction utilitaire pour exécuter des requêtes
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Temps d\'exécution de la requête:', duration, 'ms');
        return res;
    } catch (err) {
        console.error('Erreur lors de l\'exécution de la requête:', err.stack);
        throw err;
    }
};

export { pool, query };