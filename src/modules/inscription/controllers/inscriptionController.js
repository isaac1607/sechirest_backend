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
            return res.status(201).json(result);
            
        } catch (error) {
            if (error.message === 'Cet email est déjà utilisé ou le nom est déjà utilisé') {
                return res.status(409).json({ message: error.message });
            }
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
            return res.status(200).json(result);

        } catch (error) {
            if (error.message === 'Code OTP inexistant ou invalide') {
                return res.status(401).json({ message: error.message });
            }

            if (error.message === 'Code OTP invalide ou expiré') {
                return res.status(401).json({ message: error.message });
            }
            
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
            
            return res.status(result.status).json({
                message: result.message
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
                    erreur: "Champ obligatoire requis."
                });
            }

            const { identifiant, nom, contact, password } = value;
            
            const result = await this.inscriptionService.finaliserInscription(
                identifiant,
                nom,
                contact,
                password
            );
            
            if (result.status === 201) {
                return res.status(201).json({});
            }

            return res.status(result.status).json({ 
                erreur: result.message 
            });

        } catch (error) {
            console.error(error);
            if(error.message === 'OTP_INVALID') {
                return res.status(401).json({ message: "Code OTP invalide ou expiré" });

            }
            if (error.message === 'EMAIL_EXISTS') {
                return res.status(401).json({ message: "Cet email est déjà enregistré." });

            }
            if (error.message === 'NAME_EXISTS') {
                return res.status(401).json({ message: "Un restaurant avec ce nom existe déjà."});
            }

            return res.status(500).json({ 
                erreur: "Une erreur est survenue lors du traitement de votre demande." 
            });
        }
    }
}
