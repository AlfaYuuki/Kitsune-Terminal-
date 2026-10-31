// KITSUNE TERMINAL 2.0 — fictional command-driven cyber RPG.
// All addresses use documentation-only ranges and all mission actions are abstract game events.
const missions = {
  "/hijack.kfz": {
    id:"KFZ-01",name:"GHOST ARCHIVE",rank:"A",reward:450,
    target:"ASTERION ARCHIVE",brief:"Recover a fictional data capsule from a simulated archive before the virtual session expires.",
    nodes:[["NODE-01","192.0.2.14","RELAY"],["NODE-02","198.51.100.22","ARCHIVE"],["NODE-03","203.0.113.9","SANDBOX"]],
    events:["Loading HIJACK.KFZ mission package","Fictional target profile instantiated","Synthetic network topology generated","Virtual relay nodes synchronized","Puzzle layer decoded: ORCHID-7","Archive integrity challenge passed","Data capsule reconstructed in sandbox","Mission report sealed"]
  },
  "/recover.kfz": {
    id:"KFZ-02",name:"LOST SIGNAL",rank:"B",reward:300,
    target:"POLARIS RESEARCH GRID",brief:"Restore a fictional research station's simulated telemetry chain.",
    nodes:[["NODE-01","192.0.2.31","BEACON"],["NODE-02","198.51.100.44","RELAY"],["NODE-03","203.0.113.18","STATION"]],
    events:["Loading RECOVER.KFZ mission package","Virtual station profile loaded","Synthetic signal map generated","Telemetry fragments correlated","Relay sequence restored","Station status returned to green","Mission report sealed"]
  },
  "/defend.kfz": {
    id:"KFZ-03",name:"NIGHT WATCH",rank:"S",reward:550,
    target:"EMBER CITY SANDBOX",brief:"Protect a fictional city model from a simulated anomaly wave using defensive game choices.",
    nodes:[["NODE-01","192.0.2.60","SENSOR"],["NODE-02","198.51.100.70","GATEWAY"],["NODE-03","203.0.113.80","CORE"]],
    events:["Loading DEFEND.KFZ mission package","Defensive sandbox initialized","Synthetic anomaly pattern generated","Virtual alert stream classified","Containment policy puzzle solved","Integrity score stabilized","Mission report sealed"]
  }
};
const safe=(tag,value)=>{const el=document.createElement(tag);el.textContent=value;return el};
export function initializeMissionGame(root,command,onExit=()=>{}) {
  const old=root.querySelector("#mission-game");if(old)old.remove();
  const mission=missions[String(command||"").trim().toLowerCase()];
  if(!mission) {
    const help=root.querySelector("#mission-game");
    if(help)help.remove();
    return false;
  }
  const shell=document.createElement("section");shell.id="mission-game";shell.className="mission-game";
  shell.innerHTML=`
    <header class="mission-head"><div><div class="mission-kicker">KITSUNE TERMINAL // GAME MODE 2.0</div><h2>VIRTUAL OPERATION <em>ONLINE</em></h2><p>FICTIONAL SANDBOX · NO EXTERNAL SYSTEMS</p></div><div class="mission-rank"><small>OPERATOR RANK</small><b id="mg-rank">ROOKIE</b><small id="mg-xp">0 XP</small></div></header>
    <div class="mission-grid">
      <article class="mission-panel mission-console"><div class="mission-panel-title"><span>01 / MISSION CONSOLE</span><span id="mg-state">INITIALIZING</span></div><div class="mission-brief"><small id="mg-id"></small><h3 id="mg-name"></h3><p id="mg-brief"></p><div class="mission-target">SIM TARGET <b id="mg-target"></b></div></div><div class="mission-progress"><div><span>MISSION PROGRESS</span><b id="mg-percent">0%</b></div><div class="mission-track"><i id="mg-fill"></i></div></div><div class="mission-logs" id="mg-logs" aria-live="polite"></div></article>
      <aside class="mission-side"><article class="mission-panel"><div class="mission-panel-title">02 / VIRTUAL NODE MAP</div><div class="mission-nodes" id="mg-nodes"></div><p class="mission-note">Synthetic addresses from documentation-only IP ranges.</p></article><article class="mission-panel mission-stats"><div class="mission-panel-title">03 / OPERATOR PROFILE</div><div><small>CREDITS</small><b id="mg-credits">0 KC</b></div><div><small>MISSIONS CLEARED</small><b id="mg-cleared">0</b></div><div><small>REPUTATION</small><b id="mg-rep">0 RP</b></div></article><article class="mission-panel mission-objective"><div class="mission-panel-title">04 / OBJECTIVE</div><p id="mg-objective">Awaiting mission start…</p><button type="button" id="mg-exit">RETURN TO SIMULATOR ↗</button></article></aside>
    </div>
    <div class="mission-command-hint">GAME COMMANDS: <code>/missions</code> · <code>/profile</code> · <code>/help</code> · <code>/exit</code></div>`;
  const main=root.querySelector(".command-main");main?.classList.add("mission-mode");main?.append(shell);
  const q=id=>shell.querySelector("#"+id);
  const storeKey="kitsune-rpg-profile-v2";
  let profile={credits:0,cleared:0,rep:0,missions:[]};
  try{profile={...profile,...JSON.parse(localStorage.getItem(storeKey)||"{}")}}catch{}
  const save=()=>{try{localStorage.setItem(storeKey,JSON.stringify(profile))}catch{}};
  q("mg-id").textContent=mission.id+" // "+mission.name;
  q("mg-name").textContent=mission.name;
  q("mg-brief").textContent=mission.brief;
  q("mg-target").textContent=mission.target;
  q("mg-credits").textContent=profile.credits+" KC";
  q("mg-cleared").textContent=String(profile.cleared);
  q("mg-rep").textContent=profile.rep+" RP";
  q("mg-rank").textContent=profile.rep>=1000?"VETERAN":profile.rep>=400?"SPECIALIST":"ROOKIE";
  q("mg-xp").textContent=profile.rep+" XP";
  mission.nodes.forEach(([id,address,role],i)=>{
    const row=safe("div","");row.className="mission-node";row.append(safe("b",id),safe("span",address),safe("small",role),safe("i","STANDBY"));q("mg-nodes").append(row);
  });
  const log=(level,message)=>{
    const row=document.createElement("div");row.className="mission-log";
    row.append(safe("time",new Date().toLocaleTimeString([],{hour12:false})),safe("b","["+level+"]"),safe("span",message));
    q("mg-logs").append(row);q("mg-logs").scrollTop=q("mg-logs").scrollHeight;
  };
  let index=0,finished=false,timer=null;
  const tick=()=>{
    if(index>=mission.events.length){finish();return}
    const message=mission.events[index];
    log(index===0?"BOOT":index===mission.events.length-1?"OK":"SIM",message);
    const progress=Math.round((index+1)/mission.events.length*100);
    q("mg-percent").textContent=progress+"%";q("mg-fill").style.width=progress+"%";
    const nodes=[...q("mg-nodes").children];
    if(nodes.length){const node=nodes[index%nodes.length];node.querySelector("i").textContent="ACTIVE";node.querySelector("i").dataset.state="active";if(index>=nodes.length){const prev=nodes[(index-1)%nodes.length];prev.querySelector("i").textContent="SYNCED";prev.querySelector("i").dataset.state="complete"}}
    index++;if(index<mission.events.length)timer=setTimeout(tick,850);else timer=setTimeout(finish,650);
  };
  const finish=()=>{
    if(finished)return;finished=true;
    if(!profile.missions.includes(mission.id)){profile.credits+=mission.reward;profile.cleared++;profile.rep+=mission.reward;profile.missions.push(mission.id);save()}
    q("mg-state").textContent="MISSION COMPLETE";q("mg-objective").textContent="SIMULATION COMPLETE · RANK "+mission.rank+" · REWARD +"+mission.reward+" KC";
    q("mg-credits").textContent=profile.credits+" KC";q("mg-cleared").textContent=String(profile.cleared);q("mg-rep").textContent=profile.rep+" RP";
    q("mg-rank").textContent=profile.rep>=1000?"VETERAN":profile.rep>=400?"SPECIALIST":"ROOKIE";q("mg-xp").textContent=profile.rep+" XP";
    log("SUCCESS","Mission complete · "+mission.reward+" KC reward processed to local profile.");
  };
  q("mg-exit").addEventListener("click",()=>{if(timer)clearTimeout(timer);shell.remove();main?.classList.remove("mission-mode");onExit()});
  q("mg-state").textContent="RUNNING";
  q("mg-objective").textContent=mission.brief;
  log("SYSTEM","KITSUNE game runtime 2.0 initialized · all events are simulated.");
  timer=setTimeout(tick,500);
  return {shell,stop(){if(timer)clearTimeout(timer)}};
}
export function getMissionHelp(){
 return [
  "/hijack.kfz  — Ghost Archive mission",
  "/recover.kfz  — Lost Signal mission",
  "/defend.kfz   — Night Watch defensive mission",
  "/missions     — list available missions",
  "/profile      — show local operator progression",
  "/help         — show game commands",
  "/exit         — return to simulator"
 ];
}

export function getMissionProfile(){
 let profile={credits:0,cleared:0,rep:0,missions:[]};
 try{profile={...profile,...JSON.parse(localStorage.getItem("kitsune-rpg-profile-v2")||"{}")}}catch{}
 return "OPERATOR PROFILE · "+(profile.credits||0)+" KC · "+(profile.cleared||0)+" MISSIONS · "+(profile.rep||0)+" RP · "+((profile.missions||[]).join(", ")||"NO CLEARS YET");
}
