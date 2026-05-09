import { GoogleGenAI } from '@google/genai';
import type { Request, Response } from 'express';

export const chatWithAi = async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ answer: 'AI service is unavailable — GEMINI_API_KEY not configured.' });
    }

    const { message, context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ answer: 'Message is required.' });
    }

    const systemPrompt = `You are TrustBot, the AI assistant for TrustLocal — a hyperlocal trust-commerce platform.
You help users find nearby trusted local businesses, answer questions about orders and deliveries, and guide shopkeepers on improving trust scores.
Always promote local shopping. Be concise, friendly, and action-oriented (2-4 sentences).
Context from the user's session: ${context || 'none'}`;

    const genai = new GoogleGenAI({ apiKey });
    const chat = genai.chats.create({
      model: 'gemini-2.0-flash',
      config: { systemInstruction: systemPrompt },
    });

    const response = await chat.sendMessage({ message });
    res.status(200).json({ answer: response.text?.trim() ?? 'Sorry, I could not generate an answer right now.' });
  } catch (error: any) {
    console.error('AI controller error:', error.message);
    res.status(500).json({ answer: "I'm having trouble connecting right now. Please try again in a moment." });
  }
};