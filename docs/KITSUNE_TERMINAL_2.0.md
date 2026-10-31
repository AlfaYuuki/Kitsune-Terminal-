# KITSUNE TERMINAL 2.0

**Command Your Virtual World.**

Kitsune Terminal 2.0 is a fictional, offline-ready simulation RPG. It combines natural-language scenario generation with command-launched missions, a live event stream, a procedural world canvas, telemetry, and a local operator progression profile.

## Included features

- Command engine: natural-language scenario requests and .kfz mission commands.
- Mission library: Ghost Archive, Lost Signal, and Night Watch.
- Scenario presets: Lunar Base, Bridge Test, Smart City, Cyber Defense, Deep Ocean, and mission launches.
- Live dashboard: animated environment, event stream, telemetry, node topology, and runtime controls.
- Progression: local credits, reputation, mission clears, and operator ranks.
- Dual engine: offline procedural generation plus optional Gemini generation controlled by AUTO / ON / OFF.
- Responsive workspace: desktop dashboard and compact mobile layout.

## Quick start

1. Open the GitHub Pages site.
2. Choose a scenario preset or enter a natural-language scenario.
3. Use Pause, Step, Stop, speed, and load controls to manage a simulation.
4. Launch a game mission with /hijack.kfz, /recover.kfz, or /defend.kfz.
5. Use /missions, /profile, /help, and /exit in the command field.

## Safety model

All mission targets, nodes, traffic, and events are fictional and simulated. The RPG uses documentation-only IP address ranges (192.0.2.0/24, 198.51.100.0/24, and 203.0.113.0/24). It does not connect to or operate external targets. Cyber missions are abstract puzzle/defensive game scenarios, not real-world intrusion workflows.

## AI and offline behavior

The local procedural engine remains available without an internet connection. The optional remote AI adapter is controlled by AUTO / ON / OFF. The Gemini API key remains server-side in the Cloudflare Worker and must never be placed in frontend code or committed to the repository.

## Project structure

- src/core/ — parser, runtime, event engine, command and mission logic.
- src/generators/ — local procedural generator and optional AI adapter.
- src/visual/ — world, network, HUD, charts, and ambient effects.
- src/interface/ — dashboard startup and settings.
- workers/ai-gateway/ — optional Cloudflare AI gateway.

## Release note

Version 2.0 is developed on the v2.0 branch so the existing default branch remains recoverable. This branch is ready for review and browser QA before it is merged or published as the production release.