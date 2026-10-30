export function renderMetrics(canvas, scenario, progress=0) {
  if(!canvas||!scenario)return;
  const ctx=canvas.getContext("2d"),w=canvas.clientWidth||600,h=150,dpr=Math.min(window.devicePixelRatio||1,2);
  canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const styles=getComputedStyle(document.documentElement),line=styles.getPropertyValue("--line"),accent=styles.getPropertyValue("--mint").trim()||"#43e0b8";
  ctx.strokeStyle=line;ctx.lineWidth=1;
  for(let i=1;i<4;i++){const y=i*h/4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  const data=scenario.samples||[],visible=Math.max(2,Math.ceil(data.length*progress/100));
  const points=data.slice(0,visible);
  if(points.length<2)return;
  ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.beginPath();
  points.forEach((v,i)=>{const x=12+i*(w-24)/(data.length-1),y=h-12-(v/100)*(h-24);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});
  ctx.stroke();ctx.fillStyle=accent;points.forEach((v,i)=>{const x=12+i*(w-24)/(data.length-1),y=h-12-(v/100)*(h-24);ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill()});
}
