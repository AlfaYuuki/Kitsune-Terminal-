const palettes = {
  cyber:{bg:"#091b20",glow:"#42e5cf",accent:"#9af5e4",horizon:"#102f38"},
  aerospace:{bg:"#10152c",glow:"#8ea8ff",accent:"#d4ddff",horizon:"#1a2850"},
  engineering:{bg:"#20180f",glow:"#f0b56d",accent:"#ffe0a8",horizon:"#3a2918"},
  science:{bg:"#1b1027",glow:"#c39aff",accent:"#ead7ff",horizon:"#302047"},
  environment:{bg:"#0c2017",glow:"#7ce0a0",accent:"#c6f5d2",horizon:"#17402c"},
  city:{bg:"#101b2a",glow:"#6bc8ff",accent:"#c5eaff",horizon:"#193753"},
  general:{bg:"#101c23",glow:"#43e0b8",accent:"#b5f5e6",horizon:"#18332f"}
};
export function applyWorldTheme(domain, root=document.documentElement) {
  const p=palettes[domain]||palettes.general;
  root.style.setProperty("--bg",p.bg);
  root.style.setProperty("--mint",p.glow);
  root.style.setProperty("--accent",p.accent);
  root.style.setProperty("--horizon",p.horizon);
  document.body.dataset.world=domain;
}
export function renderWorld(canvas, scenario) {
  if(!canvas||!scenario)return;
  const ctx=canvas.getContext("2d");
  const w=canvas.clientWidth||600,h=220,dpr=Math.min(window.devicePixelRatio||1,2);
  canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  const p=palettes[scenario.domain]||palettes.general;
  const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,p.bg);grad.addColorStop(1,p.horizon);
  ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
  for(let i=0;i<65;i++){const x=(i*83+scenario.seed)%w,y=(i*47+scenario.seed*3)%Math.floor(h*.65);ctx.fillStyle=p.accent;ctx.globalAlpha=.15+(i%5)*.1;ctx.fillRect(x,y,1.5,1.5)}
  ctx.globalAlpha=1;
  const horizon=h*.68;
  ctx.strokeStyle=p.glow;ctx.globalAlpha=.24;ctx.lineWidth=1;
  for(let i=0;i<9;i++){ctx.beginPath();ctx.moveTo(0,horizon+i*9);ctx.lineTo(w,horizon+i*9);ctx.stroke()}
  ctx.globalAlpha=1;
  if(scenario.domain==="city"){
    const count=11;
    for(let i=0;i<count;i++){const bw=18+(i*17)%35,bh=35+(i*29)%105,x=i*w/count;ctx.fillStyle="#0a111b";ctx.fillRect(x,horizon-bh,bw,bh);ctx.fillStyle=p.glow;ctx.globalAlpha=.55;for(let yy=horizon-bh+9;yy<horizon-6;yy+=12)for(let xx=x+5;xx<x+bw-3;xx+=9)ctx.fillRect(xx,yy,3,4);ctx.globalAlpha=1}
    ctx.strokeStyle=p.glow;ctx.globalAlpha=.65;ctx.beginPath();ctx.moveTo(0,horizon+20);ctx.lineTo(w,horizon+20);ctx.stroke();
  } else if(scenario.domain==="aerospace"){
    ctx.fillStyle=p.glow;ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(w*.72,h*.32,25,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    ctx.strokeStyle=p.accent;ctx.beginPath();ctx.ellipse(w*.72,h*.32,44,12,-.3,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle="#101321";ctx.beginPath();ctx.moveTo(0,horizon);ctx.lineTo(w*.22,horizon-20);ctx.lineTo(w*.48,horizon);ctx.lineTo(w*.7,horizon-12);ctx.lineTo(w,horizon);ctx.fill();
  } else if(scenario.domain==="environment"){
    for(let i=0;i<8;i++){const x=i*w/7;ctx.fillStyle="#0b1712";ctx.beginPath();ctx.moveTo(x-30,horizon);ctx.lineTo(x,horizon-35-(i%3)*18);ctx.lineTo(x+30,horizon);ctx.fill();ctx.fillStyle=p.glow;ctx.fillRect(x-2,horizon-13,4,13)}
    ctx.strokeStyle=p.accent;ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(0,horizon+22);ctx.bezierCurveTo(w*.3,horizon+5,w*.65,horizon+40,w,horizon+16);ctx.stroke();ctx.globalAlpha=1;
  } else {
    ctx.strokeStyle=p.glow;ctx.globalAlpha=.5;ctx.beginPath();ctx.arc(w*.5,h*.43,43,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(w*.5,h*.43,62,0,Math.PI*2);ctx.stroke();ctx.fillStyle=p.accent;ctx.beginPath();ctx.arc(w*.5,h*.43,5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  }
  ctx.fillStyle=p.accent;ctx.font="10px monospace";ctx.fillText((scenario.environment||"VIRTUAL ENVIRONMENT").toUpperCase(),14,20);
  ctx.fillStyle="rgba(220,240,240,.55)";ctx.fillText("PROCEDURAL SCENE · "+scenario.domain.toUpperCase(),14,h-12);
}
