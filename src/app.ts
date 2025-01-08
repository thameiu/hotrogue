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
      title: 'Tosser of Coin API',
      version: '1.0.0',
      description: 'This is the API documentation for the Tosser of Coin game API. It includes endpoints for user management, authentication, game logic, and item handling. The API uses JWT for authentication and role-based access control.',
    },
    components: {
      securitySchemes: {
        jwtAuth: { 
          type: 'apiKey',
          in: 'header',
          name: 'Authorization', 
          description: 'JWT token for authentication and role checking', 
        },
      },
    },
    security: [
      {
        jwtAuth: [], 
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const PORT = 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use('/user', userRoutes);
app.use('/auth', authRoutes);
app.use('/game', gameRoutes);
app.use('/item', itemRoutes);


app.get("/", (req, res) => res.send("You are the tosser of coin. Your mission ? Toss the coin.") as any);

app.use('/api/documentation', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;