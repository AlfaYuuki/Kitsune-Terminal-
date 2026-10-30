# KITSUNE TERMINAL

A mobile-first, offline-capable procedural simulation environment. Describe a fictional system, mission, experiment, or environment and the local engine builds a synthetic model, generates a multi-phase event sequence, and streams simulated telemetry.

> **Safety and scope:** all output is fictional. The cyber domain is a defensive sandbox visualization only. The app does not connect to, scan, control, or modify external systems.

## Run it

The project is a static ES-module web app and can be hosted with GitHub Pages. Open the published Pages URL in a modern mobile or desktop browser. No build step, account, API key, or server is required for the procedural engine.

## Engine architecture

- `src/core/parser.js` — offline natural-language intent and domain scoring, keyword extraction, conditions, and scale hints.
- `src/generators/procedural.js` — seeded scenario generation, virtual subsystems, topology edges, multi-phase event plans, and synthetic signal series.
- `src/core/event-engine.js` — deterministic event scheduler with pause, resume, single-step, stop, and speed control.
- `src/core/runtime.js` — scenario lifecycle, evolving node states, telemetry, and live parameter tuning.
- `src/visual/` — world, topology, HUD, and chart rendering.
- `src/simulations/` — domain extension points.
- `src/generators/ai-adapter.js` — optional server-side AI integration boundary. It is intentionally not configured in the static client; never put provider secrets in browser code.

## Runtime controls

- **Pause / Resume** — suspend or continue the event sequence.
- **Step** — advance one event while paused.
- **Stop** — halt the current run.
- **Speed** — adjust event playback from 0.5× to 4×.
- **Load** — adjust the synthetic scenario intensity; remaining event telemetry is recalculated.

## Try these prompts

- `Simulate a lunar research station during a solar storm`
- `Model a smart city managing rush-hour traffic`
- `Simulate a rainforest ecosystem during a drought`
- `Model a bridge engineering stress test`
- `Run a defensive cyber exercise in an isolated fictional sandbox`

## Extending the engine

Add a domain profile to the procedural generator and its vocabulary to the parser. Keep scenario data in the normalized shape returned by `generateScenario`: domain, environment, nodes, edges, events, samples, metrics, parameters, and model metadata.

The procedural engine is deterministic for the same normalized prompt seed, apart from its generated creation timestamp. Its outputs are illustrative simulations, not validated engineering, scientific, medical, financial, or operational predictions.
