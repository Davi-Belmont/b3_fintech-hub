import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createFinanceTables } from './models/financeModel';
import financeRoutes  from './routes/financeRoutes';
import { consumeUserCreatedQueue } from './rabbitmq';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

// Rota de teste
app.get('/health', (req, res) => {
  res.json({ status: 'Finance Service está rodando perfeitamente! ' });
});

// Rotas Finance
app.use('/finance',financeRoutes);

// Inicializando o servidor e criando as tabelas
app.listen(PORT, async () => {
  console.log(` Finance Service rodando na porta ${PORT}`);
  await createFinanceTables();
  await consumeUserCreatedQueue();
});