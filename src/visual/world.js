const palettes = {
  cyber:{bg:"#091b20",glow:"#42e5cf",accent:"#9af5e4",horizon:"#102f38"},
  aerospace:{bg:"#10152c",glow:"#8ea8ff",accent:"#d4ddff",horizon:"#1a2850"},
  engineering:{bg:"#20180f",glow:"#f0b56d",accent:"#ffe0a8",horizon:"#3a2918"},
  science:{bg:"#1b1027",glow:"#c39aff",accent:"#ead7ff",horizon:"#302047"},
  environment:{bg:"#0c2017",glow:"#7ce0a0",accent:"#c6f5d2",horizon:"#17402c"},
  city:{bg:"#101b2a",glow:"#6bc8ff",accent:"#c5eaff",horizon:"#193753"},
  general:{bg:"#101c23",glow:"#43e0b8",accent:"#b5f5e6",horizon:"#18332f"}
};
const animationHandles=new WeakMap();
const reducedMotion=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
export function applyWorldTheme(domain, root=document.documentElement) {
  const p=palettes[domain]||palettes.general;
  root.style.setProperty("--bg",p.bg);root.style.setProperty("--mint",p.glow);
  root.style.setProperty("--accent",p.accent);root.style.setProperty("--horizon",p.horizon);
  document.body.dataset.world=domain;
}
function drawBridge(ctx,w,h,p,t,scenario){
  const deckY=h*.64,span=w*.68,left=w*.16,right=w*.84;
  const waterY=h*.78;
  ctx.fillStyle="#091b22";ctx.fillRect(0,waterY,w,h-waterY);
  ctx.strokeStyle="#4e9bb0";ctx.globalAlpha=.35;ctx.lineWidth=1;
  for(let i=0;i<7;i++){const y=waterY+8+i*7,offset=(t*.035+i*17)%48;ctx.beginPath();ctx.moveTo(-offset,y);ctx.lineTo(w,y);ctx.stroke()}
  ctx.globalAlpha=1;
  // Bridge deck and structural pylons
  ctx.fillStyle="#171b20";ctx.fillRect(left,deckY,span,9);
  ctx.strokeStyle=p.glow;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(left,deckY);ctx.lineTo(right,deckY);ctx.stroke();
  for(const x of [w*.37,w*.63]){
    ctx.fillStyle="#28323a";ctx.fillRect(x-5,h*.25,10,deckY-h*.25);
    ctx.strokeStyle=p.accent;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-13,h*.25);ctx.lineTo(x+13,h*.25);ctx.stroke();
    for(let k=0;k<8;k++){const anchor=left+(k/7)*span;ctx.strokeStyle=p.glow;ctx.globalAlpha=.38+.12*Math.sin(t*.002+k);ctx.beginPath();ctx.moveTo(x,h*.29);ctx.lineTo(anchor,deckY);ctx.stroke()}
  }
  ctx.globalAlpha=1;
  // Approach spans and piers
  ctx.strokeStyle=p.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*.04,deckY+7);ctx.lineTo(left,deckY+7);ctx.moveTo(right,deckY+7);ctx.lineTo(w*.96,deckY+7);ctx.stroke();
  for(const x of [w*.25,w*.5,w*.75]){ctx.fillStyle="#39434a";ctx.fillRect(x-4,deckY+9,8,waterY-deckY-9)}
  // Moving load marker represents a synthetic test load, not a real vehicle
  const loadX=left+((t*.000055)%1)*span;
  ctx.fillStyle=p.accent;ctx.fillRect(loadX-7,deckY-8,14,7);
  ctx.fillStyle=p.glow;ctx.globalAlpha=.35+.3*Math.sin(t*.004);ctx.fillRect(loadX-12,deckY-13,24,2);ctx.globalAlpha=1;
  ctx.fillStyle=p.accent;ctx.font="10px monospace";ctx.fillText("STRUCTURAL SPAN / VIRTUAL LOAD TEST",14,20);
}
function drawScene(ctx,w,h,scenario,t){
  const p=palettes[scenario.domain]||palettes.general;
  const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,p.bg);grad.addColorStop(1,p.horizon);
  ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
  const horizon=h*.68,words=(scenario.model?.keywords||[]).join(" ").toLowerCase(),prompt=(scenario.prompt||"").toLowerCase();
  const has=s=>words.includes(s)||prompt.includes(s);
  if(scenario.domain==="engineering"&&(has("bridge")||has("overpass")||has("viaduct"))){drawBridge(ctx,w,h,p,t,scenario);return}
  // Ambient particles drift slowly to make every environment feel alive.
  for(let i=0;i<42;i++){const x=(i*83+(scenario.seed||0)+t*(.004+(i%4)*.001))%w,y=(i*47+(scenario.seed||0)*3)%Math.floor(h*.65);ctx.fillStyle=p.accent;ctx.globalAlpha=.12+(i%5)*.07;ctx.fillRect(x,y,1.5,1.5)}
  ctx.globalAlpha=1;
  if(scenario.domain==="city"){
    for(let i=0;i<11;i++){const bw=18+(i*17)%35,bh=35+(i*29)%105,x=i*w/11;ctx.fillStyle="#0a111b";ctx.fillRect(x,horizon-bh,bw,bh);ctx.fillStyle=p.glow;ctx.globalAlpha=.48;for(let yy=horizon-bh+9;yy<horizon-6;yy+=12)for(let xx=x+5;xx<x+bw-3;xx+=9)ctx.fillRect(xx,yy,3,4);ctx.globalAlpha=1}
    ctx.strokeStyle=p.glow;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,horizon+20);ctx.lineTo(w,horizon+20);ctx.stroke();
    for(let i=0;i<4;i++){const x=(t*.07+i*w/4)%(w+30)-15;ctx.fillStyle=p.accent;ctx.fillRect(x,horizon+12,13,4)}
  }else if(scenario.domain==="aerospace"){
    ctx.fillStyle=p.glow;ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(w*.72,h*.32,25,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    ctx.strokeStyle=p.accent;ctx.beginPath();ctx.ellipse(w*.72,h*.32,44,12,-.3+(t*.00008),0,Math.PI*2);ctx.stroke();
    ctx.fillStyle="#101321";ctx.beginPath();ctx.moveTo(0,horizon);ctx.lineTo(w*.22,horizon-20);ctx.lineTo(w*.48,horizon);ctx.lineTo(w*.7,horizon-12);ctx.lineTo(w,horizon);ctx.fill();
  }else if(scenario.domain==="environment"){
    for(let i=0;i<8;i++){const x=i*w/7;ctx.fillStyle="#0b1712";ctx.beginPath();ctx.moveTo(x-30,horizon);ctx.lineTo(x,horizon-35-(i%3)*18);ctx.lineTo(x+30,horizon);ctx.fill();ctx.fillStyle=p.glow;ctx.fillRect(x-2,horizon-13,4,13)}
    ctx.strokeStyle=p.accent;ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(0,horizon+22);ctx.bezierCurveTo(w*.3,horizon+5+Math.sin(t*.001)*5,w*.65,horizon+40+Math.cos(t*.001)*5,w,horizon+16);ctx.stroke();ctx.globalAlpha=1;
  }else if(scenario.domain==="science"){
    ctx.fillStyle="#171323";ctx.fillRect(w*.25,h*.48,w*.5,48);ctx.strokeStyle=p.glow;ctx.strokeRect(w*.25,h*.48,w*.5,48);
    ctx.strokeStyle=p.accent;ctx.globalAlpha=.7;const scan=w*.28+((t*.08)%(w*.44));ctx.beginPath();ctx.moveTo(scan,h*.49);ctx.lineTo(scan,h*.69);ctx.stroke();ctx.globalAlpha=1;
    for(let i=0;i<5;i++){ctx.fillStyle=p.glow;ctx.beginPath();ctx.arc(w*(.32+i*.09),h*.57,3+(i%2),0,Math.PI*2);ctx.fill()}
  }else if(scenario.domain==="cyber"){
    for(let i=0;i<7;i++){const x=w*(.12+i*.12),y=h*(.34+(i%3)*.1);ctx.strokeStyle=p.glow;ctx.globalAlpha=.35;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(w*.5,h*.55);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=p.accent;ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill()}
    const pulse=(t*.08)%w;ctx.fillStyle=p.glow;ctx.globalAlpha=.5;ctx.fillRect(pulse,h*.52,18,2);ctx.globalAlpha=1;
  }else if(scenario.domain==="engineering"){
    // Industrial test hall with a moving inspection beam, not an orbital motif.
    ctx.fillStyle="#111820";ctx.fillRect(w*.12,h*.35,w*.76,h*.34);
    ctx.strokeStyle=p.glow;ctx.lineWidth=2;ctx.strokeRect(w*.12,h*.35,w*.76,h*.34);
    for(let i=0;i<6;i++){const x=w*(.18+i*.13);ctx.strokeStyle=p.accent;ctx.beginPath();ctx.moveTo(x,h*.38);ctx.lineTo(x,h*.66);ctx.stroke()}
    const scan=w*.12+((t*.06)%(w*.76));ctx.fillStyle=p.glow;ctx.globalAlpha=.35;ctx.fillRect(scan,h*.35,5,h*.34);ctx.globalAlpha=1;
  }else{
    ctx.strokeStyle=p.glow;ctx.globalAlpha=.45;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(w*.5,h*.45,35+Math.sin(t*.001)*4,0,Math.PI*2);ctx.stroke();ctx.fillStyle=p.accent;ctx.beginPath();ctx.arc(w*.5,h*.45,5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  }
  ctx.fillStyle=p.accent;ctx.font="10px monospace";ctx.fillText((scenario.environment||"VIRTUAL ENVIRONMENT").toUpperCase(),14,20);
}
export function renderWorld(canvas,scenario){
  if(!canvas||!scenario)return;
  const old=animationHandles.get(canvas);if(old)cancelAnimationFrame(old);
  const ctx=canvas.getContext("2d");if(!ctx)return;
  let frame=0,last=0;
  const render=now=>{
    if(!canvas.isConnected)return;
    if(!document.hidden&&now-last>=32){
      last=now;const w=canvas.clientWidth||600,h=canvas.clientHeight||220,dpr=Math.min(window.devicePixelRatio||1,1.5);
      if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
      ctx.setTransform(dpr,0,0,dpr,0,0);drawScene(ctx,w,h,scenario,reducedMotion()?0:now);
    }
    frame=requestAnimationFrame(render);animationHandles.set(canvas,frame);
  };
  frame=requestAnimationFrame(render);animationHandles.set(canvas,frame);
}
