import { NextFunction, Request, Response } from 'express';

export default function errorHandler (error: any, req: Request, res: Response, next: NextFunction) {
    console.log(error);
    if (error.type === 'wrong-type') {
      return res.status(400).send(error.message);
    }
    if (error.type === 'Not-Found') {
      return res.status(404).send(error.message);
    }
    if (error.type === 'Existing-Card') {
      return res.status(400).send(error.message);
    }
    res.sendStatus(500);
  }