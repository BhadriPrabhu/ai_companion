import { getAllUsers, getAPIMetrics } from "../controllers/adminController.js";

import express from "express";
const router = express.Router();

router.get("/allChat", getAllUsers);
router.get("/apiStats", getAPIMetrics);

export default router;