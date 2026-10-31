import { parseRequest } from "./parser.js";
import { initializeMissionGame, getMissionHelp, getMissionProfile } from "./mission-game.js";
import { createRuntime } from "./runtime.js";
import { updateHUD } from "../visual/hud.js";
import { renderNetwork } from "../visual/network.js";
import { applyWorldTheme, renderWorld } from "../visual/world.js";
import { renderMetrics } from "../visual/charts.js";
import { generateWithAI, isAIConfigured, checkAIGateway } from "../generators/ai-adapter.js";

export function initializeTerminal() {
 const root=document.querySelector("#app");if(!root)return;
 root.className="app-shell command-shell";
 root.innerHTML=`
 <header class="command-top"><a class="command-brand" href="#"><span class="brand-glyph">狐</span><span>KITSUNE <i>TERMINAL</i></span></a><div class="command-session"><span class="live-dot"></span><span id="core-state">CORE ONLINE</span><b>LOCAL / SANDBOX</b></div><button id="clear-session" class="icon-command" type="button" aria-label="Clear session">↺</button></header>
 <div class="command-layout">
  <aside class="command-rail"><div class="rail-label">SESSION</div><button class="rail-item active" type="button" data-view="live"><span>◈</span> LIVE SIM</button><button class="rail-item" type="button" data-view="world"><span>⌁</span> WORLD MODEL</button><button class="rail-item" type="button" data-view="telemetry"><span>▦</span> TELEMETRY</button><div class="rail-divider"></div><div class="rail-label">ENGINE</div><div class="engine-state"><span class="live-dot"></span> PROCEDURAL</div><div class="engine-state" id="ai-engine-state"><span class="live-dot muted-dot"></span> AI ADAPTER OFF</div>
  <div class="ai-mode-control" role="group" aria-label="AI adapter mode"><span class="ai-mode-title">AI ADAPTER</span><div class="ai-mode-buttons"><button type="button" data-ai-mode="auto" aria-pressed="true">AUTO</button><button type="button" data-ai-mode="on" aria-pressed="false">ON</button><button type="button" data-ai-mode="off" aria-pressed="false">OFF</button></div></div>
  <small id="ai-connection-state" class="ai-connection-state">CHECKING CONNECTION…</small><div class="rail-foot">KITSUNE CORE<br><b>BUILD 0.3.0</b><br><small>SIMULATED DATA ONLY</small></div></aside>
  <main class="command-main">
   <section class="command-heading"><div><div class="command-eyebrow">AUTONOMOUS SCENARIO ENGINE <span> / OFFLINE MODE</span></div><h1 id="scenario-title">Awaiting <em>input</em></h1><p id="scenario-subtitle">Describe any fictional system, mission, experiment or environment.</p></div><div class="session-badge"><span>SESSION</span><b id="sim-id">NO SESSION</b><small id="run-status">IDLE</small></div></section>
   <section class="world-stage"><div class="stage-top"><span><i class="live-dot"></i> RENDERED ENVIRONMENT</span><span id="world-label">NO WORLD LOADED</span></div><canvas id="world-canvas" height="220"></canvas><div class="stage-overlay"><span>WORLD INSTANCE / 01</span><span>PROCEDURAL VISUALIZATION</span></div></section>
   <section class="runtime-controls"><div><span class="control-label">RUNTIME CONTROL</span><b id="phase-label">STANDBY</b></div><div class="control-buttons"><button id="pause-run" type="button">Ⅱ PAUSE</button><button id="step-run" type="button">› STEP</button><button id="stop-run" type="button">■ STOP</button><label>LOAD <input id="intensity" type="range" min="0" max="100" value="50"><b id="intensity-value">50</b></label><label>SPEED <select id="run-speed"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select></label></div></section>
   <section class="instrument-grid">
    <article class="instrument main-stream"><div class="instrument-head"><span><b>01</b> SYSTEM EVENT STREAM</span><span id="stream-state">AWAITING INPUT</span></div><div id="logs" class="logs"><div class="boot-log">KITSUNE SIMULATION CORE [0.3.0]<br>Runtime initialized. Awaiting scenario input.<br><span class="log-dim">Type a scenario below to instantiate a virtual world.</span></div></div></article>
    <article class="instrument telemetry-panel"><div class="instrument-head"><span><b>02</b> LIVE TELEMETRY</span><span>SIMULATED</span></div><div class="telemetry-readout"><div><small>PROCESS</small><strong id="metric-progress">0%</strong></div><div><small>STABILITY</small><strong id="metric-stability">98%</strong></div><div><small>THROUGHPUT</small><strong id="metric-throughput">0 ops</strong></div><div><small>EVENTS</small><strong id="metric-events">0</strong></div></div><div class="telemetry-bar"><span id="progress-fill"></span></div><div class="instrument-subhead">VIRTUAL PROCESS NODES</div><div id="nodes" class="nodes"><span class="log-dim">No active processes</span></div></article>
    <article class="instrument topology-panel"><div class="instrument-head"><span><b>03</b> NETWORK TOPOLOGY</span><span>ABSTRACT / FICTIONAL</span></div><canvas id="network-canvas" height="190"></canvas></article>
    <article class="instrument signal-panel"><div class="instrument-head"><span><b>04</b> MODEL SIGNAL</span><span>INDEX / 0—100</span></div><canvas id="metrics-canvas" height="150"></canvas><div class="signal-legend"><span>◆ SYSTEM LOAD</span><span>— LIVE SAMPLE</span></div></article>
   </section>
   <section id="ai-comparison" class="ai-comparison" hidden><div class="instrument-head"><span><b>05</b> DUAL ENGINE COMPARISON</span><span id="ai-state">AI MODEL PENDING</span></div><div class="ai-columns"><article><div class="ai-model-label">LOCAL / PROCEDURAL</div><h3 id="local-model-title">Awaiting local model</h3><p id="local-model-summary">The procedural engine builds this model offline.</p><div class="ai-model-label">SUBSYSTEMS</div><ul id="local-model-nodes"></ul><div class="ai-model-label">PHASES</div><ul id="local-model-phases"></ul></article><article><div class="ai-model-label">REMOTE / GEMINI</div><h3 id="ai-model-title">Waiting for AI</h3><p id="ai-model-summary">The independent AI model will appear here.</p><div class="ai-model-label">SUBSYSTEMS</div><ul id="ai-model-nodes"></ul><div class="ai-model-label">PHASES</div><ul id="ai-model-phases"></ul><div class="ai-model-label">ASSUMPTIONS & RISKS</div><ul id="ai-model-notes"></ul></article></div></section>
   <div class="command-disclaimer">KITSUNE OUTPUT IS FICTIONAL · NO EXTERNAL SYSTEMS ARE ACCESSED · NO REAL NETWORK OPERATIONS</div>
  </main>
 </div>
 <form id="prompt-form" class="command-input"><div class="input-prefix"><span class="live-dot"></span> <b>SIM</b> <span>›</span></div><input id="prompt" maxlength="420" autocomplete="off" placeholder="Describe a scenario… e.g. Simulate a lunar base during a solar storm" required><button type="submit"><span>EXECUTE</span><b>↗</b></button></form>
 <div class="command-shortcuts"><span>QUICK SCENARIOS</span><button type="button" data-prompt="Simulate a lunar research base during a solar storm">LUNAR BASE</button><button type="button" data-prompt="Model a smart city at night with autonomous transport">SMART CITY</button><button type="button" data-prompt="Run a defensive cyber security exercise in an isolated fictional sandbox">CYBER DEFENSE</button><button type="button" data-prompt="Simulate a deep ocean research vessel exploring an unknown trench">DEEP OCEAN</button><button type="button" data-prompt="/hijack.kfz">GHOST ARCHIVE</button><button type="button" data-prompt="/defend.kfz">NIGHT WATCH</button></div>`;
 const form=root.querySelector("#prompt-form"),input=root.querySelector("#prompt"),logs=root.querySelector("#logs"),status=root.querySelector("#run-status");
 const main=root.querySelector(".command-main");
 root.querySelectorAll("[data-view]").forEach(tab=>tab.addEventListener("click",()=>{const view=tab.dataset.view;main.dataset.view=view;root.querySelectorAll("[data-view]").forEach(item=>{const active=item===tab;item.classList.toggle("active",item.dataset.view===view);item.setAttribute("aria-current",active?"page":"false")});if(activeScenario){if(view==="world")renderWorld(root.querySelector("#world-canvas"),activeScenario);if(view==="telemetry")renderMetrics(root.querySelector("#metrics-canvas"),activeScenario,runtime.getState().progress)}}));
 let activeScenario=null;
 let requestSequence=0;
 const aiModeButtons=[...root.querySelectorAll("[data-ai-mode]")];
 const aiConnectionState=root.querySelector("#ai-connection-state");
 const aiEngineState=root.querySelector("#ai-engine-state");
 const savedMode=(()=>{try{return localStorage.getItem("kitsune-ai-mode")||"auto"}catch{return "auto"}})();
 let aiMode=["auto","on","off"].includes(savedMode)?savedMode:"auto";
 let gatewayReachable=false;
 let checkingGateway=false;
 function syncAIModeButtons(){aiModeButtons.forEach(button=>{const active=button.dataset.aiMode===aiMode;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active))})}
 syncAIModeButtons();
 function aiIsEnabled(){return aiMode!=="off" && navigator.onLine && gatewayReachable && isAIConfigured()}
 function renderAIStatus(){
  const enabled=aiIsEnabled();
  aiEngineState.innerHTML='<span class="live-dot '+(enabled?"":"muted-dot")+'"></span> AI ADAPTER '+(enabled?"READY":"OFF");
  aiConnectionState.textContent=aiMode==="off"?"USER DISABLED":!navigator.onLine?"NO INTERNET CONNECTION":!isAIConfigured()?"GATEWAY NOT CONFIGURED":gatewayReachable?(aiMode==="auto"?"AUTO · GATEWAY ONLINE":"MANUAL ON · GATEWAY ONLINE"):"GATEWAY UNAVAILABLE";
 }
 async function refreshAIStatus(){
  if(checkingGateway)return;
  checkingGateway=true;
  gatewayReachable=await checkAIGateway();
  checkingGateway=false;
  renderAIStatus();
 }
 aiModeButtons.forEach(button=>button.addEventListener("click",()=>{
  aiMode=button.dataset.aiMode;
  syncAIModeButtons();
  try{localStorage.setItem("kitsune-ai-mode",aiMode)}catch{}
  renderAIStatus();
  if(aiMode!=="off")refreshAIStatus();
 }));
 window.addEventListener("online",refreshAIStatus);
 window.addEventListener("offline",()=>{gatewayReachable=false;renderAIStatus()});
 refreshAIStatus();
 setInterval(refreshAIStatus,15000);
 const runtime=createRuntime({onUpdate:state=>{updateHUD(state,root);if(activeScenario)renderMetrics(root.querySelector("#metrics-canvas"),activeScenario,state.progress)},onEvent:event=>{appendLog(event);root.querySelector("#phase-label").textContent=event.phase||"RUNNING";if(activeScenario)renderNetwork(root.querySelector("#network-canvas"),activeScenario.nodes)},onComplete:()=>{status.textContent="COMPLETE";root.querySelector("#stream-state").textContent="SEQUENCE COMPLETE";appendLog({level:"SUCCESS",message:"Scenario sequence completed. Virtual environment remains isolated."})}});
 function appendLog(event){
  const line=document.createElement("div");line.className="log-line";
  const stamp=document.createElement("time");stamp.textContent=new Date().toLocaleTimeString([],{hour12:false});
  const level=document.createElement("b");level.textContent=(event.level||"INFO").toUpperCase();level.dataset.level=event.level||"INFO";
  const message=document.createElement("span");message.textContent=event.message;
  line.append(stamp,level,message);logs.append(line);logs.scrollTop=logs.scrollHeight;
 }
 function execute(prompt){
  const rawCommand=String(prompt||"").trim().toLowerCase();
  if(rawCommand.startsWith("/")){
   const [command]=rawCommand.split(/\s+/);root.querySelector("#mission-game")?.remove();
   if(command==="/exit"){root.querySelector("#clear-session").click();return;}
   if(command==="/help"||command==="/missions"||command==="/profile"){
    appendLog({level:"SYSTEM",message:command==="/profile"?getMissionProfile():getMissionHelp().join(" | ")});return;
   }
   if(initializeMissionGame(root,command,()=>{root.querySelector("#core-state").textContent="CORE ONLINE"})){root.querySelector("#core-state").textContent="GAME MODE";root.querySelector("#scenario-title").innerHTML="Mission <em>active</em>";root.querySelector("#scenario-subtitle").textContent="Fictional cyber RPG · local sandbox events only";return;}
   appendLog({level:"ERROR",message:"Unknown game command. Type /help for available commands."});return;
  }
  try{
   const request=parseRequest(prompt);const sequence=++requestSequence;logs.replaceChildren();status.textContent="INITIALIZING";root.querySelector("#stream-state").textContent="BUILDING MODEL";
   const scenario=runtime.run(request);activeScenario=scenario;
   root.querySelector("#scenario-title").innerHTML="Scenario <em>active</em>";
   root.querySelector("#scenario-subtitle").textContent=scenario.title+" · "+scenario.environment;
   root.querySelector("#sim-id").textContent=scenario.id;
   root.querySelector("#world-label").textContent=scenario.environment.toUpperCase();
   root.querySelector("#core-state").textContent="CORE RUNNING";
   applyWorldTheme(scenario.domain);renderWorld(root.querySelector("#world-canvas"),scenario);
   renderNetwork(root.querySelector("#network-canvas"),scenario.nodes);renderMetrics(root.querySelector("#metrics-canvas"),scenario,0);
   root.querySelector("#phase-label").textContent="INITIALIZATION";appendLog({level:"SYSTEM",message:"Scenario accepted · domain="+scenario.domain+" · confidence="+Math.round(scenario.confidence*100)+"%"});
   const compare=root.querySelector("#ai-comparison");compare.hidden=false;
   root.querySelector("#local-model-title").textContent=scenario.title;
   root.querySelector("#local-model-summary").textContent=scenario.environment+" · "+scenario.nodes.length+" virtual nodes · "+scenario.events.length+" scheduled events · confidence "+Math.round(scenario.confidence*100)+"%";
   const fillList=(id,items)=>{const list=root.querySelector("#"+id);list.replaceChildren();items.forEach(value=>{const li=document.createElement("li");li.textContent=value;list.append(li)})};
   fillList("local-model-nodes",scenario.nodes.map(n=>n.label));fillList("local-model-phases",scenario.phases);
   fillList("ai-model-nodes",["Awaiting AI blueprint"]);fillList("ai-model-phases",["Awaiting AI blueprint"]);fillList("ai-model-notes",[]);
   root.querySelector("#ai-model-title").textContent="Waiting for AI";root.querySelector("#ai-model-summary").textContent="Independent model generation pending.";
   root.querySelector("#ai-state").textContent=aiIsEnabled()?"GEMINI CONNECTING":aiMode==="off"?"AI DISABLED BY USER":!navigator.onLine?"OFFLINE · LOCAL ENGINE":gatewayReachable?"AI READY":"GATEWAY UNAVAILABLE · LOCAL ENGINE";
   if(aiIsEnabled()){
    root.querySelector("#core-state").textContent="DUAL ENGINE";
    generateWithAI(request).then(blueprint=>{if(sequence!==requestSequence)return;root.querySelector("#ai-model-title").textContent=blueprint.title+" · "+blueprint.domain.toUpperCase();root.querySelector("#ai-model-summary").textContent=blueprint.environment+" · "+blueprint.summary+" · confidence "+blueprint.confidence+"%";fillList("ai-model-nodes",blueprint.subsystems);fillList("ai-model-phases",blueprint.phases);fillList("ai-model-notes",[...blueprint.assumptions.map(x=>"ASSUMPTION · "+x),...blueprint.risks.map(x=>"RISK · "+x)]);root.querySelector("#ai-state").textContent="GEMINI MODEL RECEIVED";appendLog({level:"SUCCESS",message:"Independent Gemini model received. Local and AI blueprints are ready for comparison."})}).catch(error=>{if(sequence!==requestSequence)return;root.querySelector("#ai-state").textContent="LOCAL FALLBACK ACTIVE";root.querySelector("#ai-model-title").textContent="AI unavailable";root.querySelector("#ai-model-summary").textContent=error.message+" The procedural model continues normally.";appendLog({level:"WARN",message:"AI adapter unavailable · "+error.message+" · continuing with local procedural engine"})});
   }else{root.querySelector("#ai-model-title").textContent=aiMode==="off"?"AI adapter is off":!navigator.onLine?"Internet connection unavailable":"AI gateway unavailable";root.querySelector("#ai-model-summary").textContent="The local procedural engine is running normally. Choose AUTO to reconnect automatically, ON to request remote AI when the gateway is reachable, or OFF to keep it disabled.";}

   appendLog({level:"TRACE",message:"Virtual instance "+scenario.id+" allocated in local sandbox"});
   appendLog({level:"INFO",message:"Environment: "+scenario.environment});
  }catch(error){appendLog({level:"ERROR",message:error.message});status.textContent="INPUT ERROR"}
 }
 form.addEventListener("submit",event=>{event.preventDefault();execute(input.value);input.blur()});
 root.querySelector("#pause-run").addEventListener("click",()=>{const s=runtime.getState();if(s.status==="running"){runtime.pause();root.querySelector("#pause-run").textContent="▶ RESUME"}else if(s.status==="paused"){runtime.resume();root.querySelector("#pause-run").textContent="Ⅱ PAUSE"}});
 root.querySelector("#step-run").addEventListener("click",()=>{runtime.step();root.querySelector("#pause-run").textContent="▶ RESUME"});
 root.querySelector("#stop-run").addEventListener("click",()=>{runtime.stop();status.textContent="STOPPED";root.querySelector("#phase-label").textContent="HALTED";});
 root.querySelector("#run-speed").addEventListener("change",event=>runtime.setSpeed(event.target.value));
 root.querySelector("#intensity").addEventListener("input",event=>{const value=Number(event.target.value);root.querySelector("#intensity-value").textContent=value;runtime.setParameter("intensity",value)});
 root.querySelectorAll("[data-prompt]").forEach(button=>button.addEventListener("click",()=>{input.value=button.dataset.prompt;execute(input.value)}));
 root.querySelector("#clear-session").addEventListener("click",()=>{requestSequence++;runtime.reset();root.querySelector("#mission-game")?.remove();root.querySelector("#ai-comparison").hidden=true;root.querySelector("#ai-state").textContent="AI MODEL PENDING";root.querySelector("#pause-run").textContent="Ⅱ PAUSE";root.querySelector("#phase-label").textContent="STANDBY";activeScenario=null;logs.replaceChildren();status.textContent="IDLE";root.querySelector("#stream-state").textContent="AWAITING INPUT";root.querySelector("#scenario-title").innerHTML="Awaiting <em>input</em>";root.querySelector("#scenario-subtitle").textContent="Describe any fictional system, mission, experiment or environment.";root.querySelector("#sim-id").textContent="NO SESSION";root.querySelector("#world-label").textContent="NO WORLD LOADED";root.querySelector("#core-state").textContent="CORE ONLINE";root.querySelector("#nodes").textContent="No active processes";root.querySelector("#metric-progress").textContent="0%";root.querySelector("#metric-throughput").textContent="0 ops";root.querySelector("#metric-events").textContent="0";root.querySelector("#progress-fill").style.width="0%";});
}
