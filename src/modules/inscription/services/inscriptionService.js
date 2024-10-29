import { query } from '../../../config/db.js';
import { inscriptionQueries } from '../queries/inscriptionQueries.js';
import { finaliserInscriptionQueries } from '../queries/inscriptionQueries.js';
import { regenererOTPQueries } from '../queries/inscriptionQueries.js';
import { generateOTP } from '../../../utils/codeGenerator.js';
import { hashPassword } from '../../../utils/crypt.js';

export class InscriptionService {
    async initierInscription(nom, contact, email) {
        try {
            // Vérifier si l'email existe déjà
            const emailExistsResult = await query(
                inscriptionQueries.checkEmailExists, 
                [email,nom]
            );
            
            if (emailExistsResult.rows[0].exists) {
                throw new Error('Cet email est déjà utilisé ou le nom est déjà utilisé');
            }
            
            // Vérifier l'existence d'un OTP valide
            const existingOTPResult = await query(
                inscriptionQueries.checkExistingOTP,
                [email]
            );
            
            if (existingOTPResult.rowCount > 0) {
                if (existingOTPResult.rows[0].expires_at > new Date()) {
                    return { 
                        message: "Un code OTP a déjà été envoyé. Veuillez vérifier votre email." 
                    };
                } else {
                    const otp = generateOTP();
                    console.log(otp);
                    await query(inscriptionQueries.updateOTP, [email, otp]);
                }
            } else{
                // Générer et sauvegarder un nouveau OTP
                const otp = generateOTP();
                await query(
                    inscriptionQueries.insertOTP,
                    [email, otp]
                );
                console.log(otp);
                // Envoyer l'email
                //await sendEmail(email, 'Code de validation', `Votre code de validation est : ${otp}`);
                
                return { 
                    message: "Le code OTP a été envoyé à votre adresse email." 
                };
            }            
            
        } catch (error) {
            console.error('Erreur dans initierInscription:', error);
            throw error;
        }
    }

    async validerOtp(email, code) {
        try {
            // Rechercher l'OTP dans la base de données
            const { rows } = await pool.query(
                inscriptionQueries.validateOtp,
                [email, code]
            );
    
            // Vérifier si l'OTP existe
            if (rows.length === 0) {
                throw new Error('Code OTP inexistant ou invalide');
            }
    
            const otpConfig = rows[0];
    
            // Vérifier si l'OTP n'a pas expiré
            const maintenant = new Date();
            if (maintenant >= otpConfig.expires_at) {
                throw new Error('Code OTP invalide ou expiré');
            }
    
            // Update l'OTP utilisé
            await pool.query(
                inscriptionQueries.updateOTP,
                [email, "FFFFFF"]
            );
            return { message: 'Code OTP validé avec succès' };
        } catch (error) {
            console.error('Erreur dans validerOtp:', error);
            throw error;
        }
    }

    async regenererOTP(email) {
        try {
            // Vérifier l'existence d'un OTP valide
            const existingOTPResult = await query(
                regenererOTPQueries.checkExistingOTP,
                [email]
            );

            if (existingOTPResult.rows.length > 0) {
                return {
                    status: 200,
                    message: "Un code OTP valide est déjà actif. Veuillez vérifier votre email."
                };
            }

            // Générer un nouveau code OTP
            const newOTP = generateOTP();
            console.log(newOTP);
            // Sauvegarder le nouveau code
            await query(regenererOTPQueries.createNewOTP,[email, newOTP]);

            // Envoi de l'email (commenté comme demandé)
            /* 
            await sendEmail(
                email,
                'Nouveau code de validation',
                `Votre nouveau code de validation est : ${newOTP}`
            );
            */

            return {
                status: 201,
                message: "Un nouveau code OTP a été envoyé à votre adresse email."
            };

        } catch (error) {
            console.error('Erreur dans regenererOTP:', error);
            throw error;
        }
    }

    async finaliserInscription(identifiant, nom, contact, password) {
        try {
            // Vérifier si l'OTP est valide
            const existingOTPResult = await query(
                finaliserInscriptionQueries.checkExistingOTP,
                [email]
            );

            if (existingOTPResult.rows.length === 0) {
                throw new Error('OTP_INVALID');
            }
            
            // Vérifier si le restaurant existe déjà
            const checkResult = await query(
                finaliserInscriptionQueries.checkExistingRestaurant,
                [identifiant, nom]
            );

            if (checkResult.rows.length > 0) {
                const existingRestaurant = checkResult.rows[0];
                if (existingRestaurant.identifiant === identifiant) {
                    throw new Error('EMAIL_EXISTS');
                }
                if (existingRestaurant.nom === nom) {
                    throw new Error('NAME_EXISTS');
                }
            }

            // Hacher le mot de passe et créer le restaurant
            const hashedPassword = hashPassword(password);
            
            await query(
                finaliserInscriptionQueries.createRestaurant,
                [
                    identifiant,
                    hashedPassword,
                    nom,
                    contact,
                    null, // description
                    true, // first_create
                    true, // actif
                    false, // abonne
                    null, // type_abonnement_id
                    null // fin_abonnement
                ]
            );

            return {
                status: 201,
                message: "Restaurant créé avec succès"
            };

        } catch (error) {
            throw error;
        }
    }
}
