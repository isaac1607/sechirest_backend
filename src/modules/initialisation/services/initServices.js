import { query } from '../../../config/db.js';
import { villeCommuneQueries } from '../queries/initQueries.js';


export class InitService {
    async initierVille(data) {
        try {
            for (const item of data) {
                const ville = item.ville;
                const communes = item.commune;

                // Insérer la ville
                const villeResult = await query(villeCommuneQueries.insertVille, [ville]);
                const villeId = villeResult.rows[0].id;
          
                // Insérer les communes
                for (const commune of communes) {
                  await query(villeCommuneQueries.insertCommune,[commune, villeId]);
                }
            }
            return { status: 200, message: 'Villes et communes initialisées avec succès.' };
        } catch (error) {
            console.error('Erreur dans initVille:', error);
            throw error;
        }
    }

}
