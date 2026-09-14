import express from 'express';
import { academicRouter } from './modules/academic/http/academicRouter';

const app = express();
app.use(express.json());

// Registar o router do módulo Módulo de Gestão Académica
app.use('/api/v1', academicRouter);

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const spec = YAML.load(path.resolve(process.cwd(), '..', '..', 'docs', 'openapi.yaml'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));

export default app;
