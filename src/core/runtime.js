// Coordinates simulation lifecycle and state.
export function createRuntime() {
  return { status: "idle", currentScenario: null };
}
