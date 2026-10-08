import { Request, Response, NextFunction } from 'express';

export function checkOwnership(paramName: string = 'studentId') {
  return (req: Request, res: Response, next: NextFunction) => {
    // Usa apenas req.user?.id
    const authenticatedUserId = req.user?.id;
    const targetResourceId = req.params[paramName];

    if (!authenticatedUserId) {
      return res.status(401).json({
        code: 'UNAUTHENTICATED',
        message: 'Utilizador não autenticado'
      });
    }

    if (req.user?.role !== 'ADMIN' && authenticatedUserId !== targetResourceId) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Acesso negado a recursos de terceiros'
      });
    }

    return next();
  };
}