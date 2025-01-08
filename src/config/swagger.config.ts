export default {
  openapi: '3.0.0',
  info: {
    title: 'Measured Dry Goods API Documentation', // Title of the API
    version: '1.0.0', // API version
    description:
      'Comprehensive API documentation for the Measured Dry Goods project.', // Description of the API
    contact: {
      name: process.env.CONTACT_NAME ?? 'Measured Dry Goods Support',
      email: process.env.CONTACT_EMAIL ?? 'support@measureddrygoods.com',
      url: process.env.CONTACT_URL ?? 'https://measureddrygoods.com/contact',
    },
  },
  servers: [
    {
      url: process.env.API_BASE_URL ?? 'http://localhost:3000', // Base URL from environment variables
      description: process.env.API_SERVER_DESC ?? 'Local development server', // Description from environment variables
    },
  ],

  components: {
    schemas: {}, // Schemas will be dynamically added
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT', // For JSON Web Tokens
      },
    },
  },
  paths: {}, // Paths (routes) will be dynamically added
};
