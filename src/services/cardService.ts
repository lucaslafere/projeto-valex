import * as cardRepository from "../repositories/cardRepository";
import * as employeeRepository from "../repositories/employeeRepository";
import { faker } from "@faker-js/faker";
import dayjs from 'dayjs'
import Cryptr from 'cryptr';
import dotenv from 'dotenv';

dotenv.config();

const cryptr = new Cryptr(`${process.env.CRYPTR_KEY}`);
dayjs.locale('pt-br')

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
  const number = faker.finance.creditCardNumber('####-####-####-####');
  const expirationDate = dayjs().add(5, 'year').format('MM-YY')
  const securityCodeNoCrypt = faker.finance.creditCardCVV();
  const securityCode = cryptr.encrypt(securityCodeNoCrypt);

  const result = await cardRepository.insert({employeeId, cardholderName, type, number, expirationDate, securityCode, isVirtual: false, isBlocked: false})
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
  return result
}
