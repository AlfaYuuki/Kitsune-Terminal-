import { AI_GATEWAY_URL } from "../config/ai.js";

function validateBlueprint(data) {
  if (!data || typeof data !== "object") throw new Error("AI returned an invalid blueprint.");
  const clean = {
    title: String(data.title || "AI scenario model").slice(0, 90),
    domain: String(data.domain || "general").slice(0, 24),
    environment: String(data.environment || "AI-designed virtual environment").slice(0, 100),
    summary: String(data.summary || "Independent AI interpretation.").slice(0, 700),
    subsystems: Array.isArray(data.subsystems) ? data.subsystems.slice(0, 8).map(x => String(x).slice(0, 48)) : [],
    phases: Array.isArray(data.phases) ? data.phases.slice(0, 8).map(x => String(x).slice(0, 48)) : [],
    assumptions: Array.isArray(data.assumptions) ? data.assumptions.slice(0, 6).map(x => String(x).slice(0, 120)) : [],
    risks: Array.isArray(data.risks) ? data.risks.slice(0, 6).map(x => String(x).slice(0, 120)) : [],
    confidence: Math.max(0, Math.min(100, Number(data.confidence) || 0))
  };
  if (!clean.subsystems.length || !clean.phases.length) throw new Error("AI blueprint is missing required model details.");
  return clean;
}
export function isAIConfigured() {
  return Boolean(AI_GATEWAY_URL && /^https:\/\//i.test(AI_GATEWAY_URL));
}
export async function generateWithAI(request, options = {}) {
  if (!isAIConfigured()) throw new Error("AI gateway URL is not configured.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 25000);
  try {
    const response = await fetch(AI_GATEWAY_URL.replace(/\/$/, "") + "/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: request.raw, localModel: { domain: request.domain, title: request.title, keywords: request.keywords, conditions: request.conditions } }),
      signal: controller.signal
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "AI gateway request failed (" + response.status + ").");
    return validateBlueprint(payload.blueprint);
  } catch (error) {
    if (error.name === "AbortError") throw new Error("AI request timed out.");
    throw error;
  } finally { clearTimeout(timeout); }
}
