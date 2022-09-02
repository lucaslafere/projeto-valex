import { Router } from 'express';
import * as cardController from "../controllers/cardController";

const cardRouter = Router();

cardRouter.post("/card", cardController.createCard);

export default cardRouter