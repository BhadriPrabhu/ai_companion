import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import testRouter from './routes/testRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', testRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));