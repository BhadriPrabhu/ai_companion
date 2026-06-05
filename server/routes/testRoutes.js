import { userChat, createChat, deleteChat,
     getChatHistory, specificChatHistory,
      updateChatTitle } from "../controllers/testController.js";
import authRoutes from "./authRoutes.js";

import express from "express";
const router = express.Router();

router.post("/chat", userChat);
router.get("/chats", getChatHistory);
router.get("/chats/:chatId/messages", specificChatHistory);
router.post("/chats", createChat);
router.put("/chats/:chatId", updateChatTitle);
router.delete("/chats/:chatId", deleteChat);
router.use("/auth", authRoutes);

export default router;