import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Setup
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API route
  app.post("/api/summarize", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt" });
      }

      const systemInstructions = `你是一位專業的會議記錄生成與翻譯助理。請根據使用者提供的會議逐字稿，整理出結構化的會議紀錄。

請務必遵守以下輸出格式要求（請使用 Markdown 格式）：

### 1. 會議主題與時間
（擷取會議的主題與時間）

### 2. 與會者
（列出參與會議的人員）

### 3. 會議重點總結
（用 3 到 5 個重點總結會議內容）

### 4. Action Items (待辦事項)
（明確列出接下來的待辦事項與負責人）

### 5. English Translation
（將上述 1~4 點的內容完整翻譯成專業的英文）`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstructions,
        },
      });

      res.json({ result: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
