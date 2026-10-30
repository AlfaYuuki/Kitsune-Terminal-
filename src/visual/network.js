export function renderNetwork(canvas, nodes = []) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth || 600, height = 190, dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr; canvas.height = height * dpr; ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,width,height);
  const points = nodes.map((node,i) => ({...node,x:width/2 + Math.cos(i*Math.PI*2/nodes.length)*Math.min(width*.34,180),y:height/2 + Math.sin(i*Math.PI*2/nodes.length)*62}));
  ctx.strokeStyle = "rgba(68,224,184,.25)"; ctx.lineWidth = 1;
  points.forEach((p,i) => { const q = points[(i+1)%points.length]; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(width/2,height/2); ctx.lineTo(p.x,p.y); ctx.stroke(); });
  points.forEach(p => { ctx.beginPath(); ctx.arc(p.x,p.y,5,0,Math.PI*2); ctx.fillStyle = "#43e0b8"; ctx.fill(); ctx.fillStyle = "#9bb5b0"; ctx.font = "10px monospace"; ctx.textAlign = "center"; ctx.fillText(p.id,p.x,p.y+20); });
  ctx.beginPath(); ctx.arc(width/2,height/2,8,0,Math.PI*2); ctx.fillStyle = "#f2b66d"; ctx.fill();
  ctx.fillStyle = "#f2b66d"; ctx.fillText("CORE",width/2,height/2+23);
}
