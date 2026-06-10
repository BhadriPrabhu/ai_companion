import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import testRouter from './routes/testRoutes.js';
import adminRouter from './routes/adminRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', testRouter);
app.use('/admin', adminRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));