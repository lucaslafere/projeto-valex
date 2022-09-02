import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import "express-async-errors";
import errorHandler from "./middlewares/errorHandler";
import cardRouter from './routers/cardRoutes'

dotenv.config();

const app = express();
app.use(json());
app.use(cors());
app.use(cardRouter)
app.use(errorHandler);


const PORT = Number(process.env.PORT);

app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));


