import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// estendendo a tipagem pra aceitar o userId no req
export interface AuthRequest extends Request {
    user?: {
        userId: number;
        email: string;
    };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token de acesso não fornecido.' });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    res.status(401).json({ error: 'Erro no formato do token.' });
    return;
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    res.status(401).json({ error: 'Token mal formatado.' });
    return;
  }

  jwt.verify(token, JWT_SECRET as string, (err, decoded) => {
    if (err) {
      console.error('❌ Erro detalhado do JWT:', err.message);
      res.status(401).json({ error: 'Token inválido ou expirado.' });
      return;
    }

    req.user = decoded as { userId: number; email: string };
    next();
  });
};