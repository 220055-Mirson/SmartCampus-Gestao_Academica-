import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Tipagem para o Express reconhecer req.user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHENTICATED', message: 'Token em falta.' }
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'secret_key_default';
    const payload = jwt.verify(token, secret) as { sub: string; role: string };
    
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHENTICATED', message: 'Token inválido ou expirado.' }
    });
  }
}