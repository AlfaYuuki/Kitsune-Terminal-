import { createEventEngine } from "./event-engine.js";
import { generateScenario } from "../generators/procedural.js";

export function createRuntime({ onUpdate = () => {}, onEvent = () => {}, onComplete = () => {} } = {}) {
  const state = { status: "idle", currentScenario: null, progress: 0, eventCount: 0 };
  const engine = createEventEngine({
    interval: 820,
    onEvent(event, index, total) {
      state.progress = Math.round(((index + 1) / total) * 100);
      state.eventCount = index + 1;
      if (state.currentScenario) {
        state.currentScenario.nodes.forEach((node, i) => { node.status = i <= index % 6 ? "active" : "standby"; });
        state.currentScenario.metrics.progress = state.progress;
        state.currentScenario.metrics.throughput = 120 + index * 37;
        state.currentScenario.metrics.elapsed = index + 1;
      }
      onEvent(event, index, total);
      onUpdate({ ...state });
    },
    onComplete() {
      state.status = "completed";
      if (state.currentScenario) state.currentScenario.nodes.forEach(node => node.status = "complete");
      onUpdate({ ...state });
      onComplete({ ...state });
    }
  });
  return {
    getState: () => ({ ...state }),
    run(request) {
      engine.stop();
      const scenario = generateScenario(request);
      state.currentScenario = scenario;
      state.status = "running";
      state.progress = 0;
      state.eventCount = 0;
      engine.load(scenario.events);
      onUpdate({ ...state });
      engine.start();
      return scenario;
    },
    stop() { engine.stop(); if (state.status === "running") state.status = "paused"; onUpdate({ ...state }); },
    reset() { engine.stop(); state.status = "idle"; state.currentScenario = null; state.progress = 0; state.eventCount = 0; onUpdate({ ...state }); }
  };
}
