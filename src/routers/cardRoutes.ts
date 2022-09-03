import { Router } from 'express';
import * as cardController from "../controllers/cardController";

const cardRouter = Router();

cardRouter.post("/create-card", cardController.createCard);
cardRouter.post("/activate-card", cardController.activateCard);
cardRouter.post('/block-card', cardController.blockCard);
cardRouter.post('/unblock-card', cardController.unblockCard)
cardRouter.post('/recharge-card', cardController.rechargeCard)
cardRouter.post('/payment', cardController.payment)
cardRouter.post('/balance', cardController.checkBalance)

export default cardRouter