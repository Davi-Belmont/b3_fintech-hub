import {pool} from '../config/database';
 
export const createFinanceTables = async () => {
    const query = `
CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL,
      category_id INT REFERENCES categories(id) ON DELETE SET NULL,
      description VARCHAR(255) NOT NULL,
      amount NUMERIC(10, 2) NOT NULL,
      type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    try{
        await pool.query(query);
        console.log("Tabelas de finanças (categories e transactions) verificadas/criadas.");
    }catch(error){
        console.error('Erro ao criar as tabelas de financias: ', error);
    }
}