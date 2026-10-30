// Offline procedural scenario generator. All identifiers and telemetry are synthetic.
const templates = {
 cyber:["Sandbox initialized","Virtual topology mapped","Synthetic traffic generated","Defensive rules evaluated","Anomaly analysis completed","Isolation test passed","Simulation report compiled"],
 aerospace:["Mission control synchronized","Vehicle systems modeled","Trajectory solution calculated","Telemetry stream stabilized","Mission event simulated","Navigation checks completed","Flight report compiled"],
 engineering:["Design parameters loaded","Virtual assembly created","Stress model evaluated","Control systems calibrated","Performance test completed","Safety margins reviewed","Engineering report compiled"],
 science:["Research environment prepared","Initial conditions established","Model variables sampled","Experiment cycle executed","Measurements analyzed","Results cross-checked","Research summary compiled"],
 environment:["Environmental model loaded","Regional conditions sampled","System interactions calculated","Scenario progression simulated","Impact indicators evaluated","Mitigation paths compared","Environmental report compiled"],
 city:["Urban model initialized","Infrastructure graph generated","Mobility flows simulated","Resource demand calculated","System bottlenecks evaluated","Resilience checks completed","City systems report compiled"],
 general:["Simulation environment initialized","Input parameters interpreted","Virtual model assembled","Process cycle executed","System behavior evaluated","Results validated","Simulation report compiled"]
};
const environments={cyber:"Virtual network operations center",aerospace:"Deep-space mission environment",engineering:"Advanced engineering test facility",science:"Experimental research laboratory",environment:"Living planetary ecosystem",city:"Next-generation urban simulation",general:"Adaptive virtual environment"};
const labels=["CORE","RELAY","SENSOR","ANALYZER","CONTROL","ARCHIVE"];
export function generateScenario(request) {
 const domain=templates[request.domain]?request.domain:"general",events=templates[domain];
 const seed=[...request.raw].reduce((sum,char)=>sum+char.charCodeAt(0),0);
 const nodes=Array.from({length:6},(_,i)=>({id:`NODE-${String(i+1).padStart(2,"0")}`,label:labels[(i+seed)%labels.length],status:"standby",load:12+((seed+i*17)%72)}));
 const samples=Array.from({length:18},(_,i)=>Math.max(12,Math.min(96,42+Math.sin((i+seed%9)*.72)*23+((seed+i*11)%17)-8)));
 return {id:`SIM-${Date.now().toString(36).toUpperCase()}`,title:request.title,prompt:request.raw,domain,environment:environments[domain],seed,mode:"PROCEDURAL",confidence:request.confidence,createdAt:new Date().toISOString(),duration:events.length,nodes,events:events.map((message,i)=>({at:i,level:i===0?"SYSTEM":i===events.length-1?"SUCCESS":["INFO","TRACE","INFO","PROCESS"][(i+seed)%4],message,metric:18+((seed+i*13)%79)})),samples,metrics:{progress:0,stability:98,throughput:0,elapsed:0}};
}
