import { Router } from 'express';
import { subscribe, unsubscribe } from '../controllers/subscribe.controller';

const router = Router();

router.post('/', subscribe);
router.post('/unsubscribe', unsubscribe);

export default router;
