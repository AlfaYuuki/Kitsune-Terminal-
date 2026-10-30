import { parseRequest } from "./parser.js";
import { createRuntime } from "./runtime.js";
import { updateHUD } from "../visual/hud.js";
import { renderNetwork } from "../visual/network.js";
import { applyWorldTheme, renderWorld } from "../visual/world.js";
import { renderMetrics } from "../visual/charts.js";

export function initializeTerminal() {
 const root=document.querySelector("#app");if(!root)return;
 root.className="app-shell command-shell";
 root.innerHTML=`
 <header class="command-top"><a class="command-brand" href="#"><span class="brand-glyph">狐</span><span>KITSUNE <i>TERMINAL</i></span></a><div class="command-session"><span class="live-dot"></span><span id="core-state">CORE ONLINE</span><b>LOCAL / SANDBOX</b></div><button id="clear-session" class="icon-command" type="button" aria-label="Clear session">↺</button></header>
 <div class="command-layout">
  <aside class="command-rail"><div class="rail-label">SESSION</div><div class="rail-item active"><span>◈</span> LIVE SIM</div><div class="rail-item"><span>⌁</span> WORLD MODEL</div><div class="rail-item"><span>▦</span> TELEMETRY</div><div class="rail-divider"></div><div class="rail-label">ENGINE</div><div class="engine-state"><span class="live-dot"></span> PROCEDURAL</div><div class="engine-state"><span class="live-dot muted-dot"></span> AI ADAPTER OFF</div><div class="rail-foot">KITSUNE CORE<br><b>BUILD 0.3.0</b><br><small>SIMULATED DATA ONLY</small></div></aside>
  <main class="command-main">
   <section class="command-heading"><div><div class="command-eyebrow">AUTONOMOUS SCENARIO ENGINE <span> / OFFLINE MODE</span></div><h1 id="scenario-title">Awaiting <em>input</em></h1><p id="scenario-subtitle">Describe any fictional system, mission, experiment or environment.</p></div><div class="session-badge"><span>SESSION</span><b id="sim-id">NO SESSION</b><small id="run-status">IDLE</small></div></section>
   <section class="world-stage"><div class="stage-top"><span><i class="live-dot"></i> RENDERED ENVIRONMENT</span><span id="world-label">NO WORLD LOADED</span></div><canvas id="world-canvas" height="220"></canvas><div class="stage-overlay"><span>WORLD INSTANCE / 01</span><span>PROCEDURAL VISUALIZATION</span></div></section>
   <section class="instrument-grid">
    <article class="instrument main-stream"><div class="instrument-head"><span><b>01</b> SYSTEM EVENT STREAM</span><span id="stream-state">AWAITING INPUT</span></div><div id="logs" class="logs"><div class="boot-log">KITSUNE SIMULATION CORE [0.3.0]<br>Runtime initialized. Awaiting scenario input.<br><span class="log-dim">Type a scenario below to instantiate a virtual world.</span></div></div></article>
    <article class="instrument telemetry-panel"><div class="instrument-head"><span><b>02</b> LIVE TELEMETRY</span><span>SIMULATED</span></div><div class="telemetry-readout"><div><small>PROCESS</small><strong id="metric-progress">0%</strong></div><div><small>STABILITY</small><strong id="metric-stability">98%</strong></div><div><small>THROUGHPUT</small><strong id="metric-throughput">0 ops</strong></div><div><small>EVENTS</small><strong id="metric-events">0</strong></div></div><div class="telemetry-bar"><span id="progress-fill"></span></div><div class="instrument-subhead">VIRTUAL PROCESS NODES</div><div id="nodes" class="nodes"><span class="log-dim">No active processes</span></div></article>
    <article class="instrument topology-panel"><div class="instrument-head"><span><b>03</b> NETWORK TOPOLOGY</span><span>ABSTRACT / FICTIONAL</span></div><canvas id="network-canvas" height="190"></canvas></article>
    <article class="instrument signal-panel"><div class="instrument-head"><span><b>04</b> MODEL SIGNAL</span><span>INDEX / 0—100</span></div><canvas id="metrics-canvas" height="150"></canvas><div class="signal-legend"><span>◆ SYSTEM LOAD</span><span>— LIVE SAMPLE</span></div></article>
   </section>
   <div class="command-disclaimer">KITSUNE OUTPUT IS FICTIONAL · NO EXTERNAL SYSTEMS ARE ACCESSED · NO REAL NETWORK OPERATIONS</div>
  </main>
 </div>
 <form id="prompt-form" class="command-input"><div class="input-prefix"><span class="live-dot"></span> <b>SIM</b> <span>›</span></div><input id="prompt" maxlength="420" autocomplete="off" placeholder="Describe a scenario… e.g. Simulate a lunar base during a solar storm" required><button type="submit"><span>EXECUTE</span><b>↗</b></button></form>
 <div class="command-shortcuts"><span>QUICK SCENARIOS</span><button type="button" data-prompt="Simulate a lunar research base during a solar storm">LUNAR BASE</button><button type="button" data-prompt="Model a smart city at night with autonomous transport">SMART CITY</button><button type="button" data-prompt="Run a defensive cyber security exercise in an isolated fictional sandbox">CYBER DEFENSE</button><button type="button" data-prompt="Simulate a deep ocean research vessel exploring an unknown trench">DEEP OCEAN</button></div>`;
 const form=root.querySelector("#prompt-form"),input=root.querySelector("#prompt"),logs=root.querySelector("#logs"),status=root.querySelector("#run-status");
 let activeScenario=null;
 const runtime=createRuntime({onUpdate:state=>{updateHUD(state,root);if(activeScenario)renderMetrics(root.querySelector("#metrics-canvas"),activeScenario,state.progress)},onEvent:event=>appendLog(event),onComplete:()=>{status.textContent="COMPLETE";root.querySelector("#stream-state").textContent="SEQUENCE COMPLETE";appendLog({level:"SUCCESS",message:"Scenario sequence completed. Virtual environment remains isolated."})}});
 function appendLog(event){
  const line=document.createElement("div");line.className="log-line";
  const stamp=document.createElement("time");stamp.textContent=new Date().toLocaleTimeString([],{hour12:false});
  const level=document.createElement("b");level.textContent=(event.level||"INFO").toUpperCase();level.dataset.level=event.level||"INFO";
  const message=document.createElement("span");message.textContent=event.message;
  line.append(stamp,level,message);logs.append(line);logs.scrollTop=logs.scrollHeight;
 }
 function execute(prompt){
  try{
   const request=parseRequest(prompt);logs.replaceChildren();status.textContent="INITIALIZING";root.querySelector("#stream-state").textContent="BUILDING MODEL";
   const scenario=runtime.run(request);activeScenario=scenario;
   root.querySelector("#scenario-title").innerHTML="Scenario <em>active</em>";
   root.querySelector("#scenario-subtitle").textContent=scenario.title+" · "+scenario.environment;
   root.querySelector("#sim-id").textContent=scenario.id;
   root.querySelector("#world-label").textContent=scenario.environment.toUpperCase();
   root.querySelector("#core-state").textContent="CORE RUNNING";
   applyWorldTheme(scenario.domain);renderWorld(root.querySelector("#world-canvas"),scenario);
   renderNetwork(root.querySelector("#network-canvas"),scenario.nodes);renderMetrics(root.querySelector("#metrics-canvas"),scenario,0);
   appendLog({level:"SYSTEM",message:"Scenario accepted · domain="+scenario.domain+" · confidence="+Math.round(scenario.confidence*100)+"%"});
   appendLog({level:"TRACE",message:"Virtual instance "+scenario.id+" allocated in local sandbox"});
   appendLog({level:"INFO",message:"Environment: "+scenario.environment});
  }catch(error){appendLog({level:"ERROR",message:error.message});status.textContent="INPUT ERROR"}
 }
 form.addEventListener("submit",event=>{event.preventDefault();execute(input.value);input.blur()});
 root.querySelectorAll("[data-prompt]").forEach(button=>button.addEventListener("click",()=>{input.value=button.dataset.prompt;execute(input.value)}));
 root.querySelector("#clear-session").addEventListener("click",()=>{runtime.reset();activeScenario=null;logs.replaceChildren();status.textContent="IDLE";root.querySelector("#stream-state").textContent="AWAITING INPUT";root.querySelector("#scenario-title").innerHTML="Awaiting <em>input</em>";root.querySelector("#scenario-subtitle").textContent="Describe any fictional system, mission, experiment or environment.";root.querySelector("#sim-id").textContent="NO SESSION";root.querySelector("#world-label").textContent="NO WORLD LOADED";root.querySelector("#core-state").textContent="CORE ONLINE";root.querySelector("#nodes").textContent="No active processes";root.querySelector("#metric-progress").textContent="0%";root.querySelector("#metric-throughput").textContent="0 ops";root.querySelector("#metric-events").textContent="0";root.querySelector("#progress-fill").style.width="0%";});
}
