// Procedural simulation world builder. Synthetic models only; no external targets or real systems.
const profiles={
 cyber:{environment:"Isolated cyber-defense simulation lab",systems:["GATEWAY","FIREWALL","AUTH","LOG VAULT","ANALYZER","CORE"],verbs:["Virtual subnet initialized","Synthetic traffic sampled","Access policy evaluated","Anomaly pattern classified","Containment model tested","Integrity check completed"],metrics:["traffic","risk","integrity"]},
 aerospace:{environment:"Orbital mission simulation chamber",systems:["FLIGHT CTRL","NAV ARRAY","POWER BUS","LIFE SUPPORT","SENSOR GRID","MISSION CORE"],verbs:["Mission parameters loaded","Orbital state propagated","Navigation solution updated","Power budget evaluated","Crew systems modeled","Telemetry packet reconciled"],metrics:["velocity","power","signal"]},
 engineering:{environment:"Digital engineering test facility",systems:["CONTROL PLC","POWER BUS","SENSOR BANK","ACTUATOR","COOLING","PLANT CORE"],verbs:["Design constraints parsed","Virtual assembly generated","Load envelope calculated","Control loop evaluated","Thermal model updated","Safety margins reviewed"],metrics:["load","temperature","efficiency"]},
 science:{environment:"Computational research laboratory",systems:["SAMPLE A","SPECTROMETER","DATA ARRAY","MODEL CORE","ANALYZER","LAB CTRL"],verbs:["Initial conditions established","Sample population generated","Measurement series collected","Model parameters fitted","Uncertainty evaluated","Results cross-checked"],metrics:["signal","variance","confidence"]},
 environment:{environment:"Planetary ecosystem model",systems:["ATMOSPHERE","WATERSHED","CANOPY","WILDLIFE","CLIMATE GRID","ECO CORE"],verbs:["Regional conditions sampled","Habitat state initialized","Resource flows calculated","Species response modeled","Environmental indicators updated","Mitigation paths compared"],metrics:["temperature","water","biodiversity"]},
 city:{environment:"Urban digital-twin environment",systems:["TRANSIT GRID","ROAD CTRL","POWER NET","WATER SYS","CIVIC DATA","CITY CORE"],verbs:["Urban model initialized","Mobility demand generated","Transit flows assigned","Utility load balanced","Congestion forecast updated","Resilience scenarios compared"],metrics:["mobility","demand","resilience"]},
 general:{environment:"Adaptive computational simulation space",systems:["INPUT","SENSOR","PROCESSOR","MODEL","ANALYZER","CORE"],verbs:["Scenario variables parsed","Virtual entities instantiated","Initial state calculated","System interactions evaluated","Model state reconciled","Outcome indicators compiled"],metrics:["activity","stability","confidence"]}
};
const phases=["INITIALIZATION","MODEL CONSTRUCTION","STATE PROPAGATION","SYSTEM ANALYSIS","SCENARIO RESPONSE","VALIDATION","REPORT"];
function rng(seed){let x=(seed>>>0)||1;return()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296}}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function generateScenario(request){
 const profile=profiles[request.domain]||profiles.general,seed=[...request.normalized].reduce((n,c)=>((n*31)+c.charCodeAt(0))>>>0,2166136261),random=rng(seed);
 const nodes=profile.systems.map((name,i)=>({id:"SYS-"+String(i+1).padStart(2,"0"),label:name,status:"standby",load:Math.round(18+random()*62),health:Math.round(84+random()*15),role:i===profile.systems.length-1?"coordinator":"subsystem"}));
 const count=24,events=[];
 let stability=91+random()*7,throughput=60+random()*80;
 const keywords=request.keywords.filter(x=>x.length>3);
 for(let i=0;i<count;i++){
  const phaseIndex=Math.min(phases.length-1,Math.floor(i/count*phases.length));
  const node=nodes[i%nodes.length],base=profile.verbs[i%profile.verbs.length];
  const variation=["state vector updated","simulation tick committed","cross-system dependency resolved","telemetry sample normalized","model confidence recalculated","resource allocation balanced"];
  const message=i%3===0?base:variation[Math.floor(random()*variation.length)];
  const delta=(random()-.46)*5;stability=clamp(stability+delta,72,99);throughput=clamp(throughput+(random()-.4)*22,28,240);
  const keyword=keywords.length?keywords[i%keywords.length]:request.domain+" model";
  events.push({at:i,phase:phases[phaseIndex],level:i===0?"SYSTEM":i===count-1?"SUCCESS":i%7===5?"WARN":i%4===0?"TRACE":"INFO",message:`${message} · ${node.label} · ${keyword.toUpperCase()}`,nodeId:node.id,progress:Math.round((i+1)/count*100),stability:Math.round(stability),throughput:Math.round(throughput),sample:Math.round(24+random()*72),detail:`Tick ${String(i+1).padStart(3,"0")} / ${count} · ${phaseIndex+1} of ${phases.length} phases`});
 }
 const samples=Array.from({length:48},(_,i)=>clamp(Math.round(44+Math.sin((i+seed%13)*.31)*19+(random()-.5)*20),8,96));
 const edges=nodes.map((n,i)=>({from:n.id,to:nodes[(i+1)%nodes.length].id,weight:Math.round(20+random()*80)}));
 return {id:"SIM-"+seed.toString(16).toUpperCase().slice(0,8),title:request.title,prompt:request.raw,domain:request.domain,environment:profile.environment,seed,mode:"OFFLINE PROCEDURAL",confidence:request.confidence,createdAt:new Date().toISOString(),duration:count,nodes,edges,events,samples,phases,conditions:request.conditions,metrics:{progress:0,stability:98,throughput:0,elapsed:0,load:0},model:{scale:request.scale,action:request.action,keywords:request.keywords,version:"2.0.0",tick:0,uncertainty:100-request.confidence*100}};
}
