import { Request, Response, NextFunction } from 'express';

export function requireRole(rolesPermitidos: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.user || !rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Não tem permissão para esta acção.' }
      });
    }
    next();
  };
}