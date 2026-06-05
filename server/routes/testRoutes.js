import { userChat, createChat, deleteChat,
     getChatHistory, specificChatHistory,
      updateChatTitle } from "../controllers/testController.js";
import authRoutes from "./authRoutes.js";
import { verifyToken } from "../middleware/authMiddleware.js";

import express from "express";
const router = express.Router();

router.post("/chat", verifyToken, userChat);
router.get("/chats", verifyToken, getChatHistory);
router.get("/chats/:chatId/messages", verifyToken, specificChatHistory);
router.post("/chats", verifyToken, createChat);
router.put("/chats/:chatId", verifyToken, updateChatTitle);
router.delete("/chats/:chatId", verifyToken, deleteChat);
router.use("/auth", authRoutes);

export default router;