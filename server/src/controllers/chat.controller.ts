import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export const chatWithBot = async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('❌ TrustBot Error: GEMINI_API_KEY is not set in .env');
      return res.status(500).json({ reply: 'AI chat is unavailable — GEMINI_API_KEY is not configured.' });
    }

    const { message, history, context, shops } = req.body;
    console.log(`🤖 TrustBot Request: "${message?.substring(0, 50)}"`);

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ reply: 'Message is required.' });
    }

    const systemPrompt = `You are TrustBot, the AI assistant for TrustLocal — a hyperlocal trust-commerce platform.
Context: ${context || 'Unknown'}
Nearby Shops Data: ${JSON.stringify(shops || [])}

Rules:
- Be a helpful local commerce expert.
- Use the Shops Data to recommend specific nearby businesses when available.
- Mention if a shop is OPEN or CLOSED if asked.
- Keep responses friendly, concise, and under 3 sentences.
- Always promote local, trusted shopping.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt 
    });

    // Convert history to Gemini format. 
    // IMPORTANT: Gemini requires history to start with a 'user' message.
    let chatHistory = (history || []).map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    // Find the first user message index
    const firstUserIndex = chatHistory.findIndex((m: any) => m.role === 'user');
    if (firstUserIndex !== -1) {
      chatHistory = chatHistory.slice(firstUserIndex);
    } else {
      chatHistory = []; // No user messages yet
    }

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const reply = response.text().trim();

    console.log(`✅ TrustBot responded via gemini-1.5-flash`);
    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error('❌ TrustBot Error:', error.message);
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      console.warn('⚠️ Gemini Quota Exceeded');
    }
    
    // 🚀 SMART DEMO FALLBACK
    const { shops, message: userMsg } = req.body;
    let demoReply = "I'm currently in High-Demand mode, but I can still help! ";

    if (shops && shops.length > 0) {
      const matchedShop = shops.find((s: any) => 
        userMsg?.toLowerCase().includes(s.shopName?.toLowerCase()) || 
        userMsg?.toLowerCase().includes(s.category?.toLowerCase())
      );

      if (matchedShop) {
        demoReply += `I see **${matchedShop.shopName}** is nearby! It's a verified ${matchedShop.category} shop with a **${matchedShop.trustScore}% Trust Score**. It is currently **${matchedShop.isOpen ? 'OPEN' : 'CLOSED'}** (Hours: ${matchedShop.businessHours}).`;
      } else {
        const categories = [...new Set(shops.map((s: any) => s.category))].join(', ');
        demoReply += `I can see ${shops.length} shops near you in categories like ${categories}. Which one would you like to know more about?`;
      }
    } else {
      demoReply += "TrustLocal helps you find verified neighborhood shops. Try asking about 'Grocery' or 'Pharmacy'!";
    }
    
    return res.status(200).json({ reply: demoReply });
  }
};
