import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createUserTable } from './models/userModel';
import authRoutes from './routes/authRoutes';
import {connectRabbitMQ} from './rabbitmq';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// rota de teste
app.get('/health' , (req,res) => {
    res.json({
        status: 'Auth Service está rodando perfeitamento!'
    });
});

// rota autenticacao
app.use('/Auth', authRoutes);

//inic do banco e do rabbit
app.listen(PORT, async() => {
    console.log(`Auth Service está rodando na porta ${PORT}`);
    try{
    await createUserTable();
    await connectRabbitMQ();   
    }catch(error){
        console.error('Erro na inicialização dos serviços auxiliares: ',error)
    }
});