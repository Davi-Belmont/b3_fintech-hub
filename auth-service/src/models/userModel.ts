import { pool } from '../config/database';

export const createUserTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    try {
        await pool.query(query);
        console.log(`Tabela "user" verificada/criada com sucessor.`)
    }catch (error){
        console.log(`Erro ao criar a tabela "user": `,error)
    }
};