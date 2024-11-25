import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/user';

const app = express();
const PORT = 3000;

app.use(express.json());

// Middleware to handle URL-encoded form requests
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/users', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
