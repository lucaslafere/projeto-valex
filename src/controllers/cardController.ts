import { Request, Response} from 'express';


export async function createCard (req: Request, res: Response) {
    const API_KEY = req.headers["x-api-key"];
    const {type} = req.body;
    if (type !== 'groceries' || type !== 'restaurant' || type !== 'transport' || type !== 'education' || type !== 'education' || type !== 'health'){
        throw {type: 'wrong-type', message: 'wrong card type passed in body'}
    }
}