import { Request, Response } from "express";
import * as cardService from "../services/cardService";
import * as companyService from "../services/companyService";

export async function createCard(req: Request, res: Response) {
  const API_KEY = req.headers["x-api-key"]?.toString();
  if (!req.headers["x-api-key"])
    return res.status(418).send("Please input a valid api-key");

  const { type, employeeId } = req.body;
  const id = Number(employeeId);

  if (
    type === "groceries" ||
    type === "restaurant" ||
    type === "transport" ||
    type === "education" ||
    type === "education" ||
    type === "health"
  ) {
    await companyService.validateApiKey(API_KEY);
    await cardService.validateCardData(id, type);
    const employeeData = await cardService.GetEmployeeById(id);
    const { fullName } = employeeData;
    await cardService.createCard(id, fullName, type)


    res.status(201).send("Card created succesfully");
  } else {
    throw { type: "wrong-type", message: "wrong card type passed in body" };
  }
}
