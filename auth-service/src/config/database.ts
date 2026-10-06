import {Pool} from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// criando uma conexao
export const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'b3_fintech'
});

pool.on('connect', () => {
    console.log(`Conectado ao banco de dados PostgresSQL com sucecesso!`);
});
