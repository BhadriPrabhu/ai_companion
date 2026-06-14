import { getAllUsers, getAPIStats } from "../controllers/adminController.js";

import express from "express";
const router = express.Router();

router.get("/allChat", getAllUsers);
router.get("/apiStats", getAPIStats);

export default router;