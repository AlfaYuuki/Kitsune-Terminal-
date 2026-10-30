import { parseRequest } from "./parser.js";
import { createRuntime } from "./runtime.js";
import { updateHUD } from "../visual/hud.js";
import { renderNetwork } from "../visual/network.js";

export function initializeTerminal() {
  const root = document.querySelector("#app");
  if (!root) return;
  root.innerHTML = `
    <header class="topbar"><a class="brand" href="#"><span class="brand-mark">狐</span><span>KITSUNE<span class="brand-dim"> / TERMINAL</span></span></a><div class="top-status"><span class="pulse"></span> LOCAL SIMULATION CORE <span class="version">V0.1.0</span></div></header>
    <section class="hero"><div class="eyebrow">HYBRID SIMULATION ENVIRONMENT <span>● OFFLINE READY</span></div><h1>Imagine it.<br><em>Simulate it.</em></h1><p>Describe a system, mission, experiment, or world. Kitsune will build a fictional simulation in real time.</p></section>
    <section class="workspace"><div class="section-head"><div><span class="kicker">01 / INPUT</span><h2>Scenario prompt</h2></div><span class="hint">NATURAL LANGUAGE INTERFACE</span></div>
      <form id="prompt-form" class="prompt-box"><textarea id="prompt" maxlength="420" placeholder="e.g. Simulate a lunar research station during a solar storm…" required></textarea><div class="prompt-bottom"><span id="char-count">0 / 420</span><button class="run-button" type="submit"><span>▶</span> RUN SIMULATION</button></div></form>
      <div class="suggestions"><span>TRY:</span><button type="button" data-prompt="Simulate a lunar research station preparing for a dust storm">Lunar research station</button><button type="button" data-prompt="Model a smart city managing rush-hour traffic">Smart city traffic</button><button type="button" data-prompt="Run a defensive network security training drill in a fictional sandbox">Cyber defense drill</button><button type="button" data-prompt="Simulate a solar-powered research vessel crossing the Pacific">Solar research vessel</button></div>
    </section>
    <section class="results" id="results"><div class="section-head"><div><span class="kicker">02 / LIVE OUTPUT</span><h2>Simulation console</h2></div><span id="run-status" class="status-pill">STANDBY</span></div>
      <div class="console-grid"><article class="terminal-panel"><div class="panel-bar"><span>◈ EVENT STREAM</span><span id="sim-id">NO ACTIVE SESSION</span></div><div id="logs" class="logs"><div class="welcome-line">KITSUNE CORE READY<span class="cursor">_</span></div><p class="muted">Your simulation output will appear here.</p></div></article>
      <aside class="telemetry"><div class="panel-bar">◈ SYSTEM TELEMETRY</div><div class="metric-grid"><div class="metric"><span>PROGRESS</span><strong id="metric-progress">0%</strong></div><div class="metric"><span>STABILITY</span><strong id="metric-stability">98%</strong></div><div class="metric"><span>THROUGHPUT</span><strong id="metric-throughput">0 <small>ops</small></strong></div><div class="metric"><span>EVENTS</span><strong id="metric-events">0</strong></div></div><div class="progress-track"><div id="progress-fill"></div></div><div class="panel-bar node-heading">◈ VIRTUAL NODES</div><div id="nodes" class="nodes"><span class="muted">Awaiting scenario…</span></div></aside></div>
      <div class="network-panel"><div class="panel-bar">◈ TOPOLOGY / ABSTRACT SYSTEM MAP <span>FICTIONAL DATA</span></div><canvas id="network-canvas" height="190"></canvas></div>
    </section>
    <footer><span>KITSUNE TERMINAL</span><span>ALL OUTPUT IS SIMULATED · NO EXTERNAL SYSTEMS CONNECTED</span><span>BUILT FOR CURIOSITY <b>✦</b></span></footer>`;
  const form = root.querySelector("#prompt-form");
  const input = root.querySelector("#prompt");
  const logs = root.querySelector("#logs");
  const status = root.querySelector("#run-status");
  const runtime = createRuntime({
    onUpdate: state => updateHUD(state, root),
    onEvent: (event, index) => appendLog(event, index),
    onComplete: () => { status.textContent = "COMPLETED"; status.dataset.state = "complete"; appendLog({level:"SUCCESS",message:"Simulation sequence completed. No external systems were contacted."}); }
  });
  function appendLog(event, index = 0) {
    const line = document.createElement("div");
    line.className = "log-line";
    const stamp = new Date().toLocaleTimeString([], {hour12:false});
    line.innerHTML = `<span class="log-time"></span><span class="log-level"></span><span class="log-message"></span>`;
    line.querySelector(".log-time").textContent = stamp;
    line.querySelector(".log-level").textContent = event.level || "INFO";
    line.querySelector(".log-message").textContent = event.message;
    line.querySelector(".log-level").dataset.level = event.level || "INFO";
    logs.append(line);
    logs.scrollTop = logs.scrollHeight;
  }
  input.addEventListener("input", () => root.querySelector("#char-count").textContent = input.value.length + " / 420");
  root.querySelectorAll("[data-prompt]").forEach(button => button.addEventListener("click", () => { input.value = button.dataset.prompt; input.dispatchEvent(new Event("input")); input.focus(); }));
  form.addEventListener("submit", event => {
    event.preventDefault();
    try {
      const request = parseRequest(input.value);
      logs.replaceChildren();
      status.textContent = "RUNNING"; status.dataset.state = "running";
      const scenario = runtime.run(request);
      root.querySelector("#sim-id").textContent = scenario.id + " / " + scenario.domain.toUpperCase();
      appendLog({level:"SYSTEM",message:"Request parsed · domain: " + scenario.domain + " · confidence: " + Math.round(scenario.confidence * 100) + "%"});
      renderNetwork(root.querySelector("#network-canvas"), scenario.nodes);
      root.querySelector("#results").scrollIntoView({behavior:"smooth",block:"start"});
    } catch (error) { appendLog({level:"ERROR",message:error.message}); }
  });
}
