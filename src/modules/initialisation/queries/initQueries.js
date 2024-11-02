export const villeCommuneQueries = {
    insertVille: `
        INSERT INTO configuration_ville (libelle) VALUES ($1) 
        RETURNING id
    `,
    
    insertCommune: `
        INSERT INTO configuration_commune (libelle, ville_id) 
        VALUES ($1, $2)
    `
};