import { Router } from 'express';
import * as cardController from "../controllers/cardController";

const cardRouter = Router();

cardRouter.post("/create-card", cardController.createCard);
cardRouter.post("/activate-card", cardController.activateCard);

export default cardRouter