import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
import gameRoutes from './routes/game';
import itemRoutes from './routes/item';

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/game', gameRoutes);
app.use('/item', itemRoutes);

app.get("/", (req, res) => res.send("HOTROGUE !!!!") as any);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
