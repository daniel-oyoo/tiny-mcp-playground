import { toolsList } from "../tools/tools.js";
import { buildToolPrompt } from "../tools/prompt.js";
import { loadEnvFile } from "node:process";
import { join } from "node:path";

// Goes up: model -> tests -> mcp -> ml/.env
loadEnvFile(join(import.meta.dirname, "..", "..", "..", ".env"));

const API_KEY = process.env.GROQ_API_KEY || 
"your-grok-api-key-here";
const API_BASE_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "openai/gpt-oss-120b";
const TEST_SERVER_URL = "http://localhost:8080/ping";

async function callLlm(messages) {
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq request failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

function extractToolCall(rawText) {
  if (!rawText) return null;

  // Strip optional ```json ... ``` fences just in case
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed.name === "string" && parsed.payload && typeof parsed.payload === "object") {
      return parsed;
    }
  } catch {
    // Not JSON -> normal assistant reply
  }
  return null;
}

async function callTool(toolPayload) {
  if (toolPayload.name !== "ping_api") {
    throw new Error(`Unknown tool: ${toolPayload.name}`);
  }

  const agentName = toolPayload.payload.agentName || "unknown-agent";

  const res = await fetch(TEST_SERVER_URL, {
    method: "GET",
    headers: {
      "X-Agent-Name": String(agentName)
    }
  });

  if (!res.ok) {
    throw new Error(`Ping failed (${res.status}): ${await res.text()}`);
  }

  return await res.json();
}

export async function chatModel(userQuery) {
  const systemPrompt = buildToolPrompt(toolsList);
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userQuery }
  ];

  const firstReply = await callLlm(messages);
  const toolCall = extractToolCall(firstReply);

  // No tool requested -> return normal response directly
  if (!toolCall) {
    return firstReply;
  }

  const toolResult = await callTool(toolCall);

  // Feed the assistant's tool request and the tool's output back into the conversation
  messages.push({ role: "assistant", content: firstReply });
  messages.push({
    role: "user",
    content: `Tool "${toolCall.name}" returned:\n${JSON.stringify(toolResult)}\n\nNow answer the user's original request clearly.`
  });

  return await callLlm(messages);
}

//const answer = await chatModel("Help me ping my server as 'punge-bot'");
const answer = await chatModel("What tools can you reach to assist me");
console.log(answer);

