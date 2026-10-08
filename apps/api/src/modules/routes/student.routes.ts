import { Router, Request, Response } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { checkOwnership } from '../../middlewares/checkOwnership';

const router = Router();

/**
 * @openapi
 * /students/{studentId}/profile:
 *   get:
 *     summary: Obtém o perfil de um estudante específico (Proteção Anti-BOLA)
 *     tags: [Estudantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do estudante
 *     responses:
 *       200:
 *         description: Perfil obtido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado a recursos de terceiros (BOLA/IDOR)
 */
router.get(
  '/:studentId/profile',
  authenticate,
  checkOwnership('studentId'),
  (req: Request, res: Response) => {
    res.status(200).json({
      data: {
        studentId: req.params.studentId,
        message: 'Acesso ao perfil concedido com sucesso'
      }
    });
  }
);

/**
 * @openapi
 * /students/{studentId}/profile:
 *   put:
 *     summary: Atualiza o perfil de um estudante específico (Proteção Anti-BOLA)
 *     tags: [Estudantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do estudante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado a recursos de terceiros (BOLA/IDOR)
 */
router.put(
  '/:studentId/profile',
  authenticate,
  checkOwnership('studentId'),
  (req: Request, res: Response) => {
    res.status(200).json({
      data: {
        studentId: req.params.studentId,
        message: 'Perfil atualizado com sucesso'
      }
    });
  }
);

export default router;