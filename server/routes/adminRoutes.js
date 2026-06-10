import { getAllUsers } from "../controllers/adminController";

import express from "express";
const router = express.Router();

router.get("/allChat", getAllUsers);

export default router;