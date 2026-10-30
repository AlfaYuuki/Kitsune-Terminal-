// Natural-language intent parsing for simulation requests.
export function parseRequest(input) {
  return { raw: String(input ?? "").trim(), intent: "simulation_request" };
}
