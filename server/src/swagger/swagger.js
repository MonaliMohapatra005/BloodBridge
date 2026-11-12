import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load OpenAPI 3.0 specification from swagger.yml
const swaggerYamlPath = path.join(__dirname, 'swagger.yml');
export const swaggerSpec = YAML.load(swaggerYamlPath);

/**
 * Mounts Swagger UI documentation and interactive API testing on the Express app.
 * @param {import('express').Application} app
 */
export const setupSwagger = (app) => {
  const options = {
    customCss: `
      .swagger-ui .topbar { background-color: #991b1b; }
      .swagger-ui .topbar .wrapper .link span { color: #ffffff; font-weight: bold; }
    `,
    customSiteTitle: 'BloodBridge API Explorer',
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, options));
  app.get('/docs', (req, res) => res.redirect('/api-docs'));

  console.log('[Swagger] Interactive API Documentation available at /api-docs');
};

export default { swaggerSpec, setupSwagger };

