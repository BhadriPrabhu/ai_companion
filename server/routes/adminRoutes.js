import { getAllUsers } from "../controllers/adminController.js";

import express from "express";
const router = express.Router();

router.get("/allChat", getAllUsers);

export default router;