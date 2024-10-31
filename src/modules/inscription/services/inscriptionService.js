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
                return {
                    status: 401,
                    message: 'Cet email est déjà utilisé ou le nom est déjà utilisé' 
                };
            }
            
            // Vérifier l'existence d'un OTP valide
            const existingOTPResult = await query(
                inscriptionQueries.checkExistingOTP,
                [email]
            );
            
            if (existingOTPResult.rowCount > 0) {
                const {code,expires_at} = existingOTPResult.rows[0];
                console.log(code);
                if (code === "FFFFFF") {
                    return {
                        status: 200,
                        isAuth : true,
                        message: "Votre email a déjà été vérifié.Veuillez entrer votre mot de passe."
                    };
                }
                if (expires_at > new Date()) {
                    return {
                        status: 200,
                        isAuth : false,
                        expires_at: expires_at,
                        message: "Un code OTP a déjà été envoyé. Veuillez vérifier votre email." 
                    };
                } else {
                    const otp = generateOTP();
                    const resultInscription = await query(inscriptionQueries.updateOTP, [email, otp]);
                    return {
                        status: 201,
                        isAuth : false,
                        expires_at: resultInscription.rows[0].expires_at,
                        message: "Le code OTP a été envoyé à votre adresse email." 
                    };
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
                    status: 201,
                    isAuth : false,
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
            const { rows } = await query(
                inscriptionQueries.validateOtp,
                [email, code]
            );
    
            // Vérifier si l'OTP existe
            if (rows.length === 0) {
                return {
                    status: 401,
                    message: 'Le code est inexistant ou invalide.'
                };
            }
    
            const otpConfig = rows[0];
    
            // Vérifier si l'OTP n'a pas expiré
            const maintenant = new Date();
            if (maintenant >= otpConfig.expires_at) {
                return {
                    status: 401,
                    message: 'Le code a expiré.'
                };
            }
            // Update l'OTP utilisé
            await query(
                inscriptionQueries.updateOTP,
                [email, "FFFFFF"]
            );
            return { status: 200,message: 'Le code correspond à celui envoyer à votre adresse email.' };
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

            if (existingOTPResult.rowCount == 0) {
                return {
                    status: 401,
                    message: "Aucun email trouvé. Veuillez reprendre l'inscription."
                };
            }

            const {expires_at} = existingOTPResult.rows[0];
            if (expires_at > new Date()) {
                return {
                    status: 401,
                    message: "Un code OTP a déjà été envoyé. Veuillez vérifier votre email."
                };
            } 

            // Générer un nouveau code OTP
            const newOTP = generateOTP();
            console.log(newOTP);

            // Sauvegarder le nouveau code
            const resultGenerate = await query(regenererOTPQueries.updateOTP,[email, newOTP]);

            // Envoi de l'email (commenté comme demandé)
            /* 
            await sendEmail(
                email,
                'Nouveau code de validation',
                `Votre nouveau code de validation est : ${newOTP}`
            );
            */

            return {
                status: 200,
                expires_at: resultGenerate.rows[0].expires_at,
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
                [identifiant]
            );

            if (existingOTPResult.rows.length === 0) {
                return {
                    status: 401,
                    message: "Code OTP invalide ou expiré"
                };
            }
            
            // Vérifier si le restaurant existe déjà
            const checkResult = await query(
                finaliserInscriptionQueries.checkExistingRestaurant,
                [identifiant, nom]
            );

            if (checkResult.rows.length > 0) {
                const existingRestaurant = checkResult.rows[0];
                if (existingRestaurant.identifiant === identifiant) {
                    return {
                        status: 401,
                        message: "Cet email est déjà enregistré."
                    };
                }
                if (existingRestaurant.nom === nom) {
                    return {
                        status: 401,
                        message: "Un restaurant avec ce nom existe déjà."
                    };
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
                message: "Votre compte a été créé avec succès"
            };

        } catch (error) {
            throw error;
        }
    }
}
