import { Router } from 'express';
import * as paymentController from '../controllers/paymentController'

const paymentRouter = Router();

paymentRouter.post('/payment', paymentController.payment);

export default paymentRouter;