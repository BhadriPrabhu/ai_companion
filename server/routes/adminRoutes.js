import { getAllUsers, getAPIStats, getAvatarStat, getChatLog } from "../controllers/adminController.js";

import express from "express";
const router = express.Router();

router.get("/allChat", getAllUsers);
router.get("/apiStats", getAPIStats);
router.get("/avatarStats", getAvatarStat);
router.get("/chatLog", getChatLog);

export default router;