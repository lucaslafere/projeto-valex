import { Request, Response } from "express";
import * as cardService from "../services/cardService";
import * as businessService from '../services/businessService'
import * as rechargeService from '../services/rechargeService'
import * as paymentService from '../services/paymentService'
import Cryptr from "cryptr";
const cryptr = new Cryptr(`${process.env.CRYPTR_KEY}`);

export async function payment (req: Request, res: Response) {
    const cardId = Number(req.body.cardId);
    const paymentPassword = req.body.password;
    const businessId = Number(req.body.businessId);
    const amount = Number(req.body.amount);
    if (isNaN(amount)) throw {type: "wrong-body-format", message: `Body 'amount' property contains non-numeric digits`};
    if (isNaN(businessId)) throw {type: "wrong-body-format", message: `Body 'businessId' property contains non-numeric digits`};
    if (isNaN(cardId)) throw {type: "wrong-body-format", message: `Body 'cardId' property contains non-numeric digits`};
    if (!req.body.cardId)
    throw { type: "wrong-body-format", message: "Body is missing cardId property" };
  if (!req.body.amount)
    throw {
      type: "wrong-body-format",
      message: "Body is missing amount property",
    };
    if (!req.body.password)
    throw { type: "wrong-body-format", message: "Body is missing password property" };
  if (!req.body.businessId)
    throw {
      type: "wrong-body-format",
      message: "Body is missing businessId property",
    };
    const findById = await cardService.findById(cardId);
    const password = findById.password;
  
    if (!password) throw {type: "NotFound", message: "This card isn't active"};
  
    await cardService.checkExpiredDate(findById.expirationDate);
  
    const checkIsBlocked = await cardService.checkBlockedCard(findById.isBlocked)
  
    if (checkIsBlocked === true) throw {type: 'expired-card', message: "This card is blocked, so it can't pay anything"}
  
    const decryptedPassword = cryptr.decrypt(`${password}`);
  
    if (Number(paymentPassword) !== Number(decryptedPassword))
      throw {
        type: "wrong-body-format",
        message: `Password doesn't match card id`,
      };
      const checkExistingBusiness = await businessService.findBusinessById(businessId);
  
      if (checkExistingBusiness.type !== findById.type) throw {type: 'wrong-type', message: 'Business type and card type dont match'};
  
      const checkCardPositiveBalance = await rechargeService.checkCardPositiveBalance(cardId);
  
      let totalBalance = 0;
      for (let i = 0; i < checkCardPositiveBalance.length; i++){
        totalBalance += checkCardPositiveBalance[i].amount;
      }
      const checkCardNegativeBalance = await paymentService.checkCardNegativeBalance(cardId);
      for (let i = 0; i < checkCardNegativeBalance.length; i++){
        totalBalance -= checkCardNegativeBalance[i].amount;
      }
      if (totalBalance < Number(amount)) throw {type: 'no-money', message: 'You dont have enough balance to buy that product'}
  
      await paymentService.payment(cardId, businessId, amount)
  
    return res.status(200).send("Payment succesfull")
  }