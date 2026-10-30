// Offline procedural scenario generation.
export function generateScenario(request) {
  return { title: request?.raw || "Untitled simulation", mode: "procedural", events: [] };
}
