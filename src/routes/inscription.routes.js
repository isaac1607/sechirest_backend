import { Router } from 'express';
import { InscriptionController } from '../modules/inscription/controllers/inscriptionController.js';

const router = Router();
const inscriptionController = new InscriptionController();

router.post('/v1/phase1', inscriptionController.phase1);
router.post('/v1/phase2', inscriptionController.validateOtp);
router.post('/v1/phase3', inscriptionController.regenererOTP);
router.post('/v1/phase4', inscriptionController.finaliserInscription);

export default router;
