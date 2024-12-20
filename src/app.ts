import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
import gameRoutes from './routes/game';
import itemRoutes from './routes/item';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API',
      version: '1.0.0',
      description: 'API documentation with authentication',
    },
    components: {
      securitySchemes: {
        jwtAuth: { // Renaming to reflect the usage
          type: 'apiKey',
          in: 'header', // The JWT will be passed in the header
          name: 'Authorization', // Specify the header name
          description: 'JWT token without Bearer prefix (e.g., "Authorization: <your_token>")',
        },
      },
    },
    security: [
      {
        jwtAuth: [], // Apply the custom JWT scheme globally
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to your route files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const PORT = 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/game', gameRoutes);
app.use('/item', itemRoutes);


app.get("/", (req, res) => res.send("You are the tosser of coin. Your mission ? Toss the coin.") as any);

app.use('/api/documentation', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;