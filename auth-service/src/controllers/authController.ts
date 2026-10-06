import { Request , Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET

// cadastro
export const register = async (req:Request, res:Response):Promise<void> => {
 try{
    const {name, email, password, phone} = req.body;
    //verificacao
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1',[email]);
    if(userExist.rows.length>0){
        res.status(400).json({error: 'email já cadastrado no sistema!'});
        return;
    }
    // criptografar a senha (hash)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password,saltRounds);

    // inserir no banco de dados 
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone, created_at',
      [name, email, hashedPassword, phone]
    );

    res.status(201).json({
        message: 'Usuário criado com sucesso!',
        user: newUser.rows[0],
    });
    }catch(error){
        console.error('Erro no registro: ', error);

        res.status(500).json({error: 'Erro interno no servidor.'});
    }
};

// login

export const login = async (req:Request, res:Response): Promise <void> => {
    try{
        const {email,password} = req.body;
        
        // buscar user por email
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if(userResult.rows.length === 0){
            res.status(400).json({error: 'E-mail ou senha invalida.'});
            return;
        }

        const user = userResult.rows[0];

        //validar senha e comparar com hash
        const validPassword = await bcrypt.compare(password,user.password);
        if(!validPassword){
            res.status(400).json({error: 'E-mail ou senha invalida.'});
            return;
        }

        // gerar token JWT (valido 1 dia)
        const token = jwt.sign(
            {userId: user.id,email:user.email},
            JWT_SECRET as string,
            {expiresIn: '1d'}
        );
        res.json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                name : user.name,
                email: user.email,
            },
        });
    }catch(error){
        console.error('Erro no login: ', error);
        res.status(500).json({error: 'Erro interno no servidor.'});
    }
};