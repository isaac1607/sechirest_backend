// src/config/migrations/index.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Création de la table de migrations si elle n'existe pas
const createMigrationsTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version VARCHAR(255) PRIMARY KEY,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
};

// Lecture des fichiers de migration
const getMigrationFiles = async () => {
    const migrationDir = path.join(__dirname, 'sql');
    const files = await fs.readdir(migrationDir);
    return files
        .filter(f => f.endsWith('.sql'))
        .sort(); // Pour exécuter les migrations dans l'ordre
};

// Lecture du contenu d'un fichier de migration
const readMigrationFile = async (filename) => {
    const filePath = path.join(__dirname, 'sql', filename);
    return fs.readFile(filePath, 'utf8');
};

// Exécution des migrations
const runMigrations = async () => {
    console.log('Début des migrations...');
    
    try {
        await createMigrationsTable();
        
        // Récupérer les migrations déjà exécutées
        const { rows } = await pool.query('SELECT version FROM schema_migrations');
        const executedMigrations = new Set(rows.map(row => row.version));
        
        // Lire tous les fichiers de migration
        const migrationFiles = await getMigrationFiles();
        
        for (const file of migrationFiles) {
            const version = file.split('__')[0]; // Ex: V1 from V1__initial_schema.sql
            
            if (!executedMigrations.has(version)) {
                console.log(`Exécution de la migration: ${file}`);
                
                const sql = await readMigrationFile(file);
                
                // Exécuter la migration dans une transaction
                const client = await pool.connect();
                try {
                    await client.query('BEGIN');
                    await client.query(sql);
                    await client.query(
                        'INSERT INTO schema_migrations (version) VALUES ($1)',
                        [version]
                    );
                    await client.query('COMMIT');
                    console.log(`Migration ${file} exécutée avec succès`);
                } catch (error) {
                    await client.query('ROLLBACK');
                    throw error;
                } finally {
                    client.release();
                }
            }
        }
        
        console.log('Migrations terminées avec succès');
    } catch (error) {
        console.error('Erreur lors des migrations:', error);
        throw error;
    }
};

export { runMigrations };