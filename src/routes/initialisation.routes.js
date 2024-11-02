import { Router } from 'express';
import { InitController } from '../modules/initialisation/controllers/initController.js';

const router = Router();
const initController = new InitController();

router.post('/v1/ville', initController.villeCommune);

export default router;
