import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chatModel } from "./model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const server = http.createServer(async (req, res) => {
  // 1. Serve the chat UI
  if (req.method === "GET" && req.url === "/") {
    const html = fs.readFileSync(path.join(__dirname, "..", "client", "index.html"), "utf8");
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(html);
  }

  // 2. Chat endpoint wrapping your existing chatModel()
  if (req.method === "POST" && req.url === "/chat") {
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }

    try {
      const { message } = JSON.parse(body);
      if (!message || !message.trim()) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Message is required" }));
      }

      const reply = await chatModel(message);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ reply }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`Chat UI running at http://localhost:${PORT}`);
});