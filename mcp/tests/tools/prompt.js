export function buildToolPrompt(tools) {
  return `
You are a helpful AI assistant that can call tools when needed.

Available tools (JSON):
${JSON.stringify(tools, null, 2)}

When you need to call a tool, respond ONLY with valid JSON in this exact shape (no markdown fences, no extra text):
{
  "name": "<toolName>",
  "payload": {
    "agentName": "<value>"
  }
}

Make sure all required fields from inputSchema are included.
If no tool is needed, respond normally in plain text.
`.trim();
}