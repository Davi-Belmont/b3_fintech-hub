import {Response} from 'express';
import {pool} from '../config/database';
import {AuthRequest} from '../middlewares/authMiddleware';

// cria categoria
export const createCategory = async (req:AuthRequest, res: Response):Promise <void> => {
    try{
        const userId = req.user?.userId;
        const {name,type} = req.body; // type: income ou expense

        if(!name || !type){
            res.status(400).json({error:'Nome e Tipo de categoria são obrigatórios.'});
            return;
        };

        const newCategory = await pool.query('INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) RETURNING *',[userId,name,type]);
        res.status(201).json({
            message: 'Categoria criada com sucesso!',
            category: newCategory.rows[0]
        });
    }catch(error){
        console.error('Erro ao criar a categoria: ',error);
        res.status(500).json({erro:'Erro interno no servidor.'})
    };
};

// lista de categoria do user
export const getCategories = async (req:AuthRequest, res:Response):Promise <void> => {
    try{
        const userId = req.user?.userId;
        const categories = await pool.query('SELECT * FROM categories WHERE user_id = $1 ', [userId]);

        res.json(categories.rows[0]);
    }catch(error){
        console.error('Erro ao buscar o categoria: ',error);
        res.status(500).json({error: 'Erro interno no servidor.'});
    };
};

// transacoes (receita e despesa)
export const createTransaction = async (req:AuthRequest, res:Response):Promise <void> => {
    try{
        const userId = req.user?.userId;
        const {category_id, description, amount, type, date} = req.body;

        if(!description || !amount || !type || !date){
          res.status(400).json({error: 'Preencha todos os campos obrigatórios de transação.'});
          return;  
        };

        const newTransaction = await pool.query(
`       INSERT INTO transactions (user_id, category_id, description, amount, type, date) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, category_id || null, description, amount, type, date]
        );

        res.status(201).json({
            message: 'Transação registrada com sucesso!',
            transaction: newTransaction.rows[0]
        });
    }catch(error){
        console.error('Erro ao registrar transação: ',error);
        res.status(500).json('Erro interno no servidor.');
    }
}

// lista transacoes com saldo consolidade
export const getTransactions = async(req:AuthRequest,res:Response) => {
    try{
        const userId = req.user?.userId;

        //buscar
        const transactions = await pool.query(
            `SELECT t.*, c.name as category_name
            FROM transactions t 
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = $1
            ORDER BY t.date DESC`,[userId]   
        );

        // calcular total Entrada vs total Saida
        const sumary = await pool.query(
            `SELECT 
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
            FROM transactions WHERE user_id = $1`,
        [userId]
        );

        const income = Number(sumary.rows[0].total_income);
        const expense = Number(sumary.rows[0].total_expense);
        const balance = income - expense;

        res.json({
            sumary:{
                totalIncome: income,
                totalExpense: expense,
                balance: balance,
            },
            transations: transactions.rows[0]
        });
    } catch(error){
        console.error('Erro ao buscar transações: ',error);
        res.status(500).json({error: 'Erro interno no servidor.'})
    }
}
