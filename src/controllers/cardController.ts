import { Request, Response } from "express";
import * as cardService from "../services/cardService";
import * as companyService from "../services/companyService";

export async function createCard(req: Request, res: Response) {
  const API_KEY = req.headers["x-api-key"]?.toString();
  if (!req.headers["x-api-key"]) return res.status(418).send("Please input a valid api-key");
    
  const { type, employeeId } = req.body;
  if (!req.body.type) throw {type: 'wrong-body-format', message: `Body is missing property type`} 
  if (!req.body.employeeId) throw {type: 'wrong-body-format', message: `Body is missing property employeeId`} 
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
    const cardInfo = await cardService.createCard(id, fullName, type)
    res.status(201).send(`Card created succesfully with the following info: ${cardInfo}`);
  } else {
    throw { type: "wrong-type", message: "wrong card type passed in body" };
  }
}

export async function activateCard(req: Request, res: Response) {
  const {securityCode, number, expirationDate, cardholderName} = req.body;
  if (!req.body.securityCode) throw { type: "wrong-body-format", message: "Body is missing securityCode property (CVV)"};
  if (!req.body.number) throw { type: "wrong-body-format", message: "Body is missing number property"};
  if (!req.body.expirationDate) throw { type: "wrong-body-format", message: "Body is missing expirationDate property"};
  if (!req.body.cardholderName) throw { type: "wrong-body-format", message: "Body is missing cardholderName property"};
  
  const findCard = await cardService.findByCardDetails(number, cardholderName, expirationDate, securityCode);
  const id = Number(findCard.id);
  const result = await cardService.updateCardPassword(id)

  res.status(200).send(`Card activated successfully, this is your new password: ${result}`);
}
