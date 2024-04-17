const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Wizard API',
    version: '1.0.0',
    description: 'Wizard Board Game API',
  },
  servers: [
    {
      url: 'http://${req.hostname}:${process.env.PORT}',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
