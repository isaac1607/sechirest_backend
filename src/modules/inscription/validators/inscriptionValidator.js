import Joi from 'joi';

export const phase1Schema = Joi.object({
    nom: Joi.string().required().messages({
        'string.empty': 'Le nom est requis',
        'any.required': 'Le nom est requis'
    }),
    contact: Joi.string().required().messages({
        'string.empty': 'Le contact est requis',
        'any.required': 'Le contact est requis'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Format email invalide',
        'string.empty': 'L\'email est requis',
        'any.required': 'L\'email est requis'
    })
});

export const validateOtpSchema = Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().required()
});

export const regenererOTPSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Format email invalide',
        'string.empty': 'L\'email est requis',
        'any.required': 'L\'email est requis'
    })
});

export const finaliserInscriptionSchema = Joi.object({
    identifiant: Joi.string()
        .email()
        .pattern(/^[\w-\.]+@([\w-]+\.)+[\w]{2,4}$/)
        .required()
        .messages({
            'string.pattern.base': 'Veuillez entrer un email valide',
            'string.empty': 'L\'email est requis',
            'any.required': 'L\'email est requis'
        }),
    nom: Joi.string().required().messages({
        'string.empty': 'Le nom est requis',
        'any.required': 'Le nom est requis'
    }),
    contact: Joi.string().required().messages({
        'string.empty': 'Le contact est requis',
        'any.required': 'Le contact est requis'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Le mot de passe est requis',
        'any.required': 'Le mot de passe est requis'
    })
});