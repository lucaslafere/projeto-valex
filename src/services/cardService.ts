import * as cardRepository from "../repositories/cardRepository";
import * as employeeRepository from "../repositories/employeeRepository";
import * as rechargeRepository from '../repositories/rechargeRepository';
import * as paymentRepository from '../repositories/paymentRepository';
import * as businessRepository from '../repositories/businessRepository';
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";
import Cryptr from "cryptr";
import dotenv from "dotenv";
import { connection } from "../config/database";

dotenv.config();

const cryptr = new Cryptr(`${process.env.CRYPTR_KEY}`);
dayjs.locale("pt-br");

const randomName = faker.name.fullName(); // Rowan Nikolaus
const randomEmail = faker.internet.email(); // Kassandra.Haley@erich.biz

export async function validateCardData(
  employeeId: number,
  type: cardRepository.TransactionTypes
) {
  const findExistingCard = await cardRepository.findByTypeAndEmployeeId(
    type,
    employeeId
  );
  if (findExistingCard)
    throw {
      type: "Existing-Card",
      message: `This employee already has a card of ${type} type`,
    };
}

export async function GetEmployeeById(employeeId: number) {
  const result = await employeeRepository.findById(employeeId);
  if (!result)
    throw {
      type: "Not-Found",
      message: `No employee with the id ${employeeId} was found`,
    };
  return result;
}

export async function createCard(
  employeeId: number,
  employeeFullName: string,
  type: cardRepository.TransactionTypes
) {
  const cardFullName = await formatCardName(employeeFullName);
  const cardholderName = cardFullName.toUpperCase();
  const number = faker.finance.creditCardNumber("####-####-####-####");
  const expirationDate = dayjs().add(5, "year").format("MM-YY");
  const securityCodeNoCrypt = faker.finance.creditCardCVV();
  const securityCode = cryptr.encrypt(securityCodeNoCrypt);

  const result = await cardRepository.insert({
    employeeId,
    cardholderName,
    type,
    number,
    expirationDate,
    securityCode,
    isVirtual: false,
    isBlocked: false,
  });
  return `{securityCode: ${securityCodeNoCrypt}}, {number: ${number}}, {expirationDate: ${expirationDate}}, {cardHolderName: ${cardholderName}}`;
}

function formatCardName(employeeFullName: string) {
  const splitName = employeeFullName.split(" ");
  let cardFullName = [];
  let finalName = [];
  for (let i = 0; i < splitName.length; i++) {
    if (splitName[i].length >= 3) {
      cardFullName.push(splitName[i]);
    }
  }
  finalName.push(cardFullName[0]);

  for (let j = 1; j < cardFullName.length - 1; j++) {
    finalName.push(cardFullName[j][0]);
  }
  finalName.push(cardFullName[cardFullName.length - 1]);
  const result = finalName.join(" ");
  return result;
}

export async function findByCardDetails(
  number: string,
  cardholderName: string,
  expirationDate: string,
  securityCode: string
) {
  checkExpiredDate(expirationDate);
  const findCard = await cardRepository.findByCardDetails(
    number,
    cardholderName,
    expirationDate,
    securityCode
  );
  return findCard;
}

export async function updateCardPassword(id: number) {
  const newPassword = faker.finance.pin();
  const password = cryptr.encrypt(newPassword);

  const result = await cardRepository.update(id, { password });
  return newPassword;
}

export async function findById(id: number) {
  const result = await cardRepository.findById(id);

  return { password: result.password, expirationDate: result.expirationDate, isBlocked: result.isBlocked, type: result.type };
}

export async function checkExpiredDate(expirationDate: string) {
  const splitDate = expirationDate.split("-");
  const today = dayjs().format("MM-YY");
  const splitToday = today.split("-");
  if (splitDate[1] < splitToday[1]) {
    throw { type: "expired-card", message: "This card date has expired" };
  }
  if (splitDate[1] === splitToday[1]) {
    if (splitDate[0] < splitToday[0]) {
      throw { type: "expired-card", message: "This card date has expired" };
    }
  }
}

export async function checkBlockedCard (isBlocked: boolean) {
  if (isBlocked) return true
  if (!isBlocked) return false
}

export async function toggleBlockCard(id: number, isBlocked: boolean) {
  const result = await cardRepository.update(id, {isBlocked})

}
export async function rechargeCard (cardId: number, amount: number){
  if (amount <= 0)
  throw {
    type: "wrong-body-format",
    message: "Amount must be > 0",
  };
  const result = await rechargeRepository.insert({cardId, amount});
  return result
}

export async function payment (cardId: number, businessId: number, amount: number) {
  if (amount <= 0)
  throw {
    type: "wrong-body-format",
    message: "Amount must be > 0",
  };
  const result = await paymentRepository.insert({cardId, businessId, amount});
  return result
}

export async function findBusinessById(id: number) {
  const result = await businessRepository.findById(id)
  return result
}

export async function checkCardPositiveBalance(id: number){
  const result = await rechargeRepository.findByCardId(id);
  return result;
}
export async function checkCardNegativeBalance(id: number) {
  const result = await paymentRepository.findByCardId(id);
  return result;
}