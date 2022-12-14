import { Router } from 'express';
import * as rechargeController from '../controllers/rechargeController'

const rechargeRouter = Router();

rechargeRouter.post('/recharge', rechargeController.rechargeCard);

export default rechargeRouter;