import { Router } from 'express';
import * as cardController from "../controllers/cardController";

const cardRouter = Router();

cardRouter.post("/create-card", cardController.createCard);
cardRouter.post("/activate-card", cardController.activateCard);
cardRouter.post('/block-card', cardController.blockCard);
cardRouter.post('/unblock-card', cardController.unblockCard)
cardRouter.post('/balance', cardController.checkCardBalance)

export default cardRouter