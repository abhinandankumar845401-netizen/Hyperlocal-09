import express from 'express';
import { chatWithAi } from '../controllers/ai.controller';

const router = express.Router();

// POST /api/ai/chat — AI query endpoint (context-aware)
router.post('/chat', chatWithAi);

export default router;
