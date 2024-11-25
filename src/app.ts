import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/user';
import authRoutes from './routes/auth';


const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use('/users', userRoutes);
app.use('/auth', authRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
