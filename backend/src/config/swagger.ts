import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Atlas Global Logistics API',
            version: '1.0.0',
            description: 'Type-safe logistics backend for freight matching and settlement',
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}/api/${env.API_VERSION}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
