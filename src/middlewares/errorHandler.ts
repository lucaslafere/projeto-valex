import { NextFunction, Request, Response } from 'express';

export default function errorHandler (error: any, req: Request, res: Response, next: NextFunction) {
    console.log(error);
    if (error.type) {
      return res.sendStatus(error.message);
    }
  
    res.sendStatus(500);
  }