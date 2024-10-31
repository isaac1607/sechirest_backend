import { InscriptionService } from '../services/inscriptionService.js';
import { phase1Schema, validateOtpSchema } from '../validators/inscriptionValidator.js';
import { regenererOTPSchema, finaliserInscriptionSchema } from '../validators/inscriptionValidator.js';

export class InscriptionController {
    constructor() {
        this.inscriptionService = new InscriptionService();
    }
    
    phase1 = async (req, res, next) =>{
        try {
            // Validation des données
            const { error, value } = phase1Schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    message: `Champs requis manquants : ${error.details[0].message}`
                });
            }
            
            const { nom, contact, email } = value;
            
            const result = await this.inscriptionService.initierInscription(
                nom, 
                contact, 
                email
            );

            if(result.status === 200 || result.status === 201){
                return res.status(result.status).json({ 
                    message: result.message,
                    isAuth : result.isAuth,
                    expires_at: result.expires_at
                });
            } else{
                return res.status(result.status).json({ 
                    message: result.message
                });
            }
            
        } catch (error) {
            console.log(error);
            // Remplacer next(error) par une réponse d'erreur 500
            return res.status(500).json({ 
                message: "Une erreur interne est survenue" 
            });
        }
    }

    validateOtp = async (req, res) => {
        try {
            // Validation des données
            const { error, value } = validateOtpSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    message: `Champs requis manquants : ${error.details[0].message}`
                });
            }
            
            // Récupération des données
            const { email, code } = value;

            const result = await this.inscriptionService.validerOtp(email, code);
            return res.status(result.status).json({ message: result.message });
        } catch (error) {
            return res.status(500).json({ 
                message: "Une erreur interne est survenue" 
            });
        }
    }

    regenererOTP = async (req, res, next) => {
        try {
            // Validation des données
            const { error, value } = regenererOTPSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    message: "Le champ email est requis."
                });
            }

            const { email } = value;
            const result = await this.inscriptionService.regenererOTP(email);

            if(result.status !== 200){
                return res.status(result.status).json({ 
                    message: result.message
                });
            }

            return res.status(result.status).json({ 
                message: result.message,
                expires_at: result.expires_at
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ 
                message: "Une erreur interne est survenue" 
            });
        }
    }

    finaliserInscription = async (req, res, next) => {
        try {
            // Validation des données
            const { error, value } = finaliserInscriptionSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    message: "Champ obligatoire requis."
                });
            }

            const { identifiant, nom, contact, password } = value;
            
            const result = await this.inscriptionService.finaliserInscription(
                identifiant,
                nom,
                contact,
                password
            );

            return res.status(result.status).json({ 
                message: result.message 
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                message: "Une erreur est survenue lors du traitement de votre demande." 
            });
        }
    }
}
