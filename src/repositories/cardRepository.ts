import { connection } from "../config/database";
import { mapObjectToUpdateQuery } from "../utils/sqlUtils";
import Cryptr from 'cryptr';
import dotenv from 'dotenv';

dotenv.config();

const cryptr = new Cryptr(`${process.env.CRYPTR_KEY}`);

export type TransactionTypes =
  | "groceries"
  | "restaurant"
  | "transport"
  | "education"
  | "health";

export interface Card {
  id: number;
  employeeId: number;
  number: string;
  cardholderName: string;
  securityCode: string;
  expirationDate: string;
  password?: string;
  isVirtual: boolean;
  originalCardId?: number;
  isBlocked: boolean;
  type: TransactionTypes;
}

export type CardInsertData = Omit<Card, "id">;
export type CardUpdateData = Partial<Card>;

export async function find() {
  const result = await connection.query<Card>("SELECT * FROM cards");
  return result.rows;
}

export async function findById(id: number) {
  const result = await connection.query<Card, [number]>(
    "SELECT * FROM cards WHERE id=$1",
    [id]
  );

  return result.rows[0];
}

export async function findByTypeAndEmployeeId(
  type: TransactionTypes,
  employeeId: number
) {
  const result = await connection.query<Card, [TransactionTypes, number]>(
    `SELECT * FROM cards WHERE type=$1 AND "employeeId"=$2`,
    [type, employeeId]
  );

  return result.rows[0];
}

export async function findByCardDetails(
  number: string,
  cardholderName: string,
  expirationDate: string,
  securityCode: string
) {
  const result = await connection.query<Card, [string, string, string]>(
    ` SELECT 
        * 
      FROM cards 
      WHERE number=$1 AND "cardholderName"=$2 AND "expirationDate"=$3`,
    [number, cardholderName, expirationDate]
  );
  if (result.rowCount === 0) throw {type: 'Not-Found', message: `Could not find a card that matches the submitted data`}
  const decryptedString = cryptr.decrypt(result.rows[0].securityCode)
  if (securityCode !== decryptedString) throw {type: 'wrong-body-format', message: `CVV and Card Number don't match!`}
  if (result.rows[0].password !== null) throw {type: 'bad-request', message: 'This card has already been activated'}
  return result.rows[0];
}

export async function insert(cardData: CardInsertData) {
  const {
    employeeId,
    number,
    cardholderName,
    securityCode,
    expirationDate,
    password,
    isVirtual,
    originalCardId,
    isBlocked,
    type,
  } = cardData;

  connection.query(
    `
    INSERT INTO cards ("employeeId", number, "cardholderName", "securityCode",
      "expirationDate", password, "isVirtual", "originalCardId", "isBlocked", type)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `,
    [
      employeeId,
      number,
      cardholderName,
      securityCode,
      expirationDate,
      password,
      isVirtual,
      originalCardId,
      isBlocked,
      type,
    ]
  );
}

export async function update(id: number, cardData: CardUpdateData) {
  const { objectColumns: cardColumns, objectValues: cardValues } =
    mapObjectToUpdateQuery({
      object: cardData,
      offset: 2,
    });

  connection.query(
    `
    UPDATE cards
      SET ${cardColumns}
    WHERE $1=id
  `,
    [id, ...cardValues]
  );
}

export async function remove(id: number) {
  connection.query<any, [number]>("DELETE FROM cards WHERE id=$1", [id]);
}
