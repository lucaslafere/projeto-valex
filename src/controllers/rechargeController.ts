import { Request, Response } from "express";
import * as cardService from "../services/cardService";
import * as companyService from "../services/companyService";
import * as rechargeService from "../services/rechargeService";

export async function rechargeCard (req: Request, res: Response) {
    const API_KEY = req.headers["x-api-key"]?.toString();
    if (!req.headers["x-api-key"]) return res.status(418).send("Please input a valid api-key");
      await companyService.validateApiKey(API_KEY);
    const id = Number(req.body.cardId);
    const amount = Number(req.body.amount);
    if (!req.body.cardId)
    throw { type: "wrong-body-format", message: "Body is missing cardId property" };
  if (!req.body.amount)
    throw {
      type: "wrong-body-format",
      message: "Body is missing amount property",
    };
  
    const findById = await cardService.findById(id);
    const password = findById.password;
    if (!password) throw {type: "NotFound", message: "This card isn't active"};
    await cardService.checkExpiredDate(
      findById.expirationDate
    );
    await rechargeService.rechargeCard(id, amount);
  
    return res.status(200).send("Card recharged!")
  }