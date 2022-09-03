import { Request, Response } from "express";
import * as cardService from "../services/cardService";
import * as companyService from "../services/companyService";
import Cryptr from "cryptr";
const cryptr = new Cryptr(`${process.env.CRYPTR_KEY}`);

export async function createCard(req: Request, res: Response) {
  const API_KEY = req.headers["x-api-key"]?.toString();
  if (!req.headers["x-api-key"])
    return res.status(418).send("Please input a valid api-key");

  const { type, employeeId } = req.body;
  if (!req.body.type)
    throw {
      type: "wrong-body-format",
      message: `Body is missing property type`,
    };
  if (!req.body.employeeId)
    throw {
      type: "wrong-body-format",
      message: `Body is missing property employeeId`,
    };
  const id = Number(employeeId);

  if (
    type === "groceries" ||
    type === "restaurant" ||
    type === "transport" ||
    type === "education" ||
    type === "health"
  ) {
    await companyService.validateApiKey(API_KEY);
    await cardService.validateCardData(id, type);
    const employeeData = await cardService.GetEmployeeById(id);
    const { fullName } = employeeData;
    const cardInfo = await cardService.createCard(id, fullName, type);
    return res
      .status(201)
      .send(`Card created succesfully with the following info: ${cardInfo}`);
  } else {
    throw { type: "wrong-type", message: "wrong card type passed in body" };
  }
}

export async function activateCard(req: Request, res: Response) {
  const { securityCode, number, expirationDate, cardholderName } = req.body;
  if (!req.body.securityCode)
    throw {
      type: "wrong-body-format",
      message: "Body is missing securityCode property (CVV)",
    };
  if (!req.body.number)
    throw {
      type: "wrong-body-format",
      message: "Body is missing number property",
    };
  if (!req.body.expirationDate)
    throw {
      type: "wrong-body-format",
      message: "Body is missing expirationDate property",
    };
  if (!req.body.cardholderName)
    throw {
      type: "wrong-body-format",
      message: "Body is missing cardholderName property",
    };

  const findCard = await cardService.findByCardDetails(
    number,
    cardholderName,
    expirationDate,
    securityCode
  );
  const id = Number(findCard.id);
  if (findCard.password !== null)
    throw {
      type: "bad-request",
      message: "This card has already been activated",
    };

  const result = await cardService.updateCardPassword(id);

  return res
    .status(200)
    .send(
      `Card activated successfully, this is your new password: ${result} and cardId: ${id}`
    );
}

export async function blockCard(req: Request, res: Response) {
  const { password } = req.body;
  const id = Number(req.body.id);
  if (!req.body.id)
    throw { type: "wrong-body-format", message: "Body is missing id property" };
  if (!req.body.password)
    throw {
      type: "wrong-body-format",
      message: "Body is missing password property",
    };
  const findById = await cardService.findById(id);
  const decryptedPassword = cryptr.decrypt(`${findById.password}`);
  if (password !== decryptedPassword)
    throw {
      type: "wrong-body-format",
      message: `Password doesn't match card id`,
    };
  const checkExpiredDate = await cardService.checkExpiredDate(
    findById.expirationDate
  );
    const checkIsBlocked = await cardService.checkBlockedCard(findById.isBlocked)
    if (checkIsBlocked === true) throw {type: 'expired-card', message: "This card is already blocked"}
    const blockCard = await cardService.toggleBlockCard(id, true);

  return res.status(200).send("Card succesfully blocked");
}

export async function unblockCard (req: Request, res: Response) {
  const { password } = req.body;
  const id = Number(req.body.id);
  if (!req.body.id)
    throw { type: "wrong-body-format", message: "Body is missing id property" };
  if (!req.body.password)
    throw {
      type: "wrong-body-format",
      message: "Body is missing password property",
    };
  const findById = await cardService.findById(id);
  const decryptedPassword = cryptr.decrypt(`${findById.password}`);
  if (password !== decryptedPassword)
    throw {
      type: "wrong-body-format",
      message: `Password doesn't match card id`,
    };
  const checkExpiredDate = await cardService.checkExpiredDate(
    findById.expirationDate
  );
  const checkIsBlocked = await cardService.checkBlockedCard(findById.isBlocked)
  if (checkIsBlocked === false) throw {type: 'expired-card', message: "This card is not blocked"}
    const unblockCard = await cardService.toggleBlockCard(id, false);
  
  return res.status(200).send("Card sucessfully unblocked");
}
