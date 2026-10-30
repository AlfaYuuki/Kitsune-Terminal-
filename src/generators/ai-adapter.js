// Optional AI integration boundary. Keep provider credentials on a server, never in browser code.
export async function generateWithAI(_request) {
  throw new Error("AI adapter is not configured. Use the procedural generator instead.");
}
