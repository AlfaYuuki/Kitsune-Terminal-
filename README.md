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
- `src/generators/ai-adapter.js` — browser-safe client adapter that calls the optional secure gateway and validates the independent AI blueprint.
- `src/config/ai.js` — public gateway URL configuration only; never place credentials here.
- `workers/ai-gateway/src/index.js` — Cloudflare Worker gateway. It stores the Gemini credential as a server-side secret, validates prompts, requests structured JSON, and returns a bounded blueprint.
- `workers/ai-gateway/wrangler.toml` — Worker deployment configuration.

## Dual Engine Mode

KITSUNE always builds the local procedural model first. When the secure AI gateway is configured, Gemini independently designs a second blueprint; the Dual Engine Comparison panel displays both interpretations side by side. Gemini does not control real systems or replace the local runtime. If the gateway is not configured, offline, times out, or returns an error, the local simulation continues without interruption.

### Configure the optional gateway

1. Deploy `workers/ai-gateway` as a Cloudflare Worker named `kitsune-terminal-ai-gateway`.
2. Add a Worker **Secret** named `GEMINI_API_KEY` in the Cloudflare Worker settings. Do not put the key in this repository, `wrangler.toml`, or browser files. Cloudflare documents encrypted Worker secrets at https://developers.cloudflare.com/workers/configuration/secrets/.
3. Set the Worker route/domain to the deployed Worker URL. The gateway accepts the `/generate` endpoint and only allows the configured GitHub Pages origin.
4. Set `AI_GATEWAY_URL` in `src/config/ai.js` to the Worker base URL (without `/generate`), then commit and redeploy GitHub Pages.
5. Test with a harmless fictional prompt. Without the gateway URL or server secret, the local engine remains available.

The gateway uses Gemini's `generateContent` endpoint and requests JSON output. See https://ai.google.dev/api/generate-content. Before enabling public use, configure usage limits and request-rate protections on the gateway/provider account. Do not expose the Worker secret or paste API keys into chat. Account setup, API billing, and secret configuration should be handled with a trusted adult.

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


## KITSUNE TERMINAL 2.0 — Game Mode

Version 2.0 adds a separate command-driven fictional cyber RPG alongside the natural-language simulation engine. Both modes share the terminal input but use different renderers and execution flows.

### Game commands

- `/hijack.kfz` — Ghost Archive story mission.
- `/recover.kfz` — Lost Signal restoration mission.
- `/defend.kfz` — Night Watch defensive challenge.
- `/missions` or `/help` — list available game commands.
- `/profile` — view local credits, cleared missions, and reputation.
- `/exit` — return to the simulation workspace.

Missions use scripted fictional events and synthetic addresses from documentation-only IP ranges. Progression is stored locally in the browser. Replaying a cleared mission does not award duplicate credits.

Natural-language requests continue to use the engineering/science/world simulation engine. For example, `Model a bridge engineering stress test` opens the bridge-specific animated visualization rather than the cyber RPG.

The cyber game is an abstract narrative/puzzle simulation only. It does not scan, connect to, or operate real networks, devices, organizations, or accounts.
