import { getAllUsers, getAPIStats, getAvatarStat } from "../controllers/adminController.js";

import express from "express";
const router = express.Router();

router.get("/allChat", getAllUsers);
router.get("/apiStats", getAPIStats);
router.get("/avatarStats", getAvatarStat);

export default router;