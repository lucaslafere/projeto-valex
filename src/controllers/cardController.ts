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
  const checkExpiredDate = await cardService.checkExpiredDate(
    findById.expirationDate
  );
    const result = await cardService.rechargeCard(id, amount);


  return res.status(200).send("Card recharged!")
}

export async function payment (req: Request, res: Response) {
  const cardId = Number(req.body.cardId);
  const paymentPassword = req.body.password;
  const businessId = Number(req.body.businessId);
  const amount = Number(req.body.amount);
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

  const checkExpiredDate = await cardService.checkExpiredDate(
    findById.expirationDate
  );
  const checkIsBlocked = await cardService.checkBlockedCard(findById.isBlocked)
  if (checkIsBlocked === true) throw {type: 'expired-card', message: "This card is blocked, so it can't pay anything"}

  const decryptedPassword = cryptr.decrypt(`${password}`);

  if (Number(paymentPassword) !== Number(decryptedPassword))
    throw {
      type: "wrong-body-format",
      message: `Password doesn't match card id`,
    };
    const checkExistingBusiness = await cardService.findBusinessById(businessId);
    if (checkExistingBusiness.type !== findById.type) throw {type: 'wrong-type', message: 'Business type and card type dont match'};
    const checkCardPositiveBalance = await cardService.checkCardPositiveBalance(cardId);
    let totalBalance = 0;
    for (let i = 0; i < checkCardPositiveBalance.length; i++){
      totalBalance += checkCardPositiveBalance[i].amount;
    }
    const checkCardNegativeBalance = await cardService.checkCardNegativeBalance(cardId);
    for (let i = 0; i < checkCardNegativeBalance.length; i++){
      totalBalance -= checkCardNegativeBalance[i].amount;
    }
    if (totalBalance < Number(amount)) throw {type: 'no-money', message: 'You dont have enough balance to buy that product'}
    const payment = await cardService.payment(cardId, businessId, amount)

  return res.status(200).send("Payment succesfull")
}

export async function checkBalance(req: Request, res: Response){
  const cardId = Number(req.body.cardId);
  if (!req.body.cardId)
  throw { type: "wrong-body-format", message: "Body is missing cardId property" };
  const findById = await cardService.findById(cardId);
  const checkCardPositiveBalance = await cardService.checkCardPositiveBalance(cardId);

  console.log(checkCardPositiveBalance)
  let balance = 0;

 
  for (let i = 0; i < checkCardPositiveBalance.length; i++){
    balance += checkCardPositiveBalance[i].amount;
  }
  const checkCardNegativeBalance = await cardService.checkCardNegativeBalance(cardId);

  console.log(checkCardNegativeBalance)

  for (let i = 0; i < checkCardNegativeBalance.length; i++){
    balance -= checkCardNegativeBalance[i].amount;
  }
  
  return res.status(200).json({balance, transactions: checkCardNegativeBalance, 
recharges: checkCardPositiveBalance})
}
