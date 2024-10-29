export const inscriptionQueries = {
    checkEmailExists: `
        SELECT EXISTS (
            SELECT 1 FROM restaurant_restaurant 
            WHERE identifiant = $1 or LOWER(UNACCENT(nom)) = LOWER(UNACCENT($2))
        ) as exists
    `,
    
    checkExistingOTP: `
        SELECT id, code, expires_at 
        FROM configuration_otp 
        WHERE email = $1
        LIMIT 1
    `,
    
    insertOTP: `
        INSERT INTO configuration_otp (email, code, expires_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '5 minutes')
        RETURNING id, code, expires_at
    `,
    
    updateOTP: `
        UPDATE configuration_otp 
        SET code = $2, 
            expires_at = CURRENT_TIMESTAMP + INTERVAL '5 minutes',
            update_at = CURRENT_TIMESTAMP
        WHERE email = $1
        RETURNING id, code, expires_at
    `,
    validateOtp: `
        SELECT id, code, expires_at 
        FROM configuration_otp 
        WHERE email = $1 AND code = $2
    `,

};

export const regenererOTPQueries = {
    checkExistingOTP: `
        SELECT id, code, expires_at 
        FROM configuration_otp 
        WHERE email = $1 AND expires_at > CURRENT_TIMESTAMP
    `,
    
    createNewOTP: `
        INSERT INTO configuration_otp (email, code, expires_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '5 minutes')
        ON CONFLICT (email) 
        DO UPDATE SET 
            code = EXCLUDED.code,
            expires_at = EXCLUDED.expires_at,
            update_at = CURRENT_TIMESTAMP
        RETURNING id, code, expires_at
    `
};

export const finaliserInscriptionQueries = {
    checkExistingOTP: `
        SELECT id 
        FROM configuration_otp 
        WHERE email = $1 AND code = 'FFFFFF'
    `,

    checkExistingRestaurant: `
        SELECT identifiant, nom
        FROM restaurant_restaurant
        WHERE identifiant = $1 OR nom = $2
        LIMIT 1
    `,
    
    createRestaurant: `
        INSERT INTO restaurant_restaurant 
        (identifiant, password, nom, contact, description,
        first_create, actif, abonne, type_abonnement_id, fin_abonnement, create_at, update_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
    `
};
