import {createEventEngine} from "./event-engine.js";
import {generateScenario} from "../generators/procedural.js";
export function createRuntime({onUpdate=()=>{},onEvent=()=>{},onComplete=()=>{}}={}){
 const state={status:"idle",currentScenario:null,progress:0,eventCount:0,speed:1};
 const engine=createEventEngine({interval:560,onEvent(event,index,total){
  const s=state.currentScenario;if(!s)return;
  state.progress=event.progress??Math.round((index+1)/total*100);state.eventCount=index+1;
  state.status="running";
  s.metrics.progress=state.progress;s.metrics.stability=event.stability??s.metrics.stability;s.metrics.throughput=event.throughput??0;s.metrics.elapsed=index+1;s.metrics.load=event.sample??0;s.model.tick=index+1;
  s.nodes.forEach(n=>{n.status=n.id===event.nodeId?"active":n.status==="complete"?"complete":"standby";});
  onEvent({...event,index,total});onUpdate(snapshot());
 },onComplete(){
  state.status="completed";state.progress=100;
  if(state.currentScenario){state.currentScenario.metrics.progress=100;state.currentScenario.nodes.forEach(n=>n.status="complete");}
  onUpdate(snapshot());onComplete(snapshot());
 }});
 function snapshot(){return {...state,currentScenario:state.currentScenario};}
 return {
  getState:snapshot,
  run(request){engine.stop();const scenario=generateScenario(request);state.currentScenario=scenario;state.status="running";state.progress=0;state.eventCount=0;engine.load(scenario.events);onUpdate(snapshot());engine.start();return scenario;},
  pause(){engine.pause();state.status="paused";onUpdate(snapshot());return snapshot();},
  resume(){engine.resume();state.status="running";onUpdate(snapshot());return snapshot();},
  step(){engine.pause();engine.step();state.status=engine.status==="completed"?"completed":"paused";onUpdate(snapshot());return snapshot();},
  stop(){engine.stop();state.status="stopped";onUpdate(snapshot());return snapshot();},
  setSpeed(value){state.speed=engine.setSpeed(value);onUpdate(snapshot());return state.speed;},
  setParameter(name,value){const s=state.currentScenario;if(!s||!["intensity","resilience"].includes(name))return false;const v=Math.max(0,Math.min(100,Number(value)||0));s.parameters[name]=v;const remaining=s.events.slice(state.eventCount);remaining.forEach((event,i)=>{const base=event._baseStability??event.stability;event._baseStability=base;const stress=(s.parameters.intensity-50)*.16;const support=(s.parameters.resilience-70)*.12;event.stability=Math.max(35,Math.min(100,Math.round(base-stress+support)));const baseThroughput=event._baseThroughput??event.throughput;event._baseThroughput=baseThroughput;event.throughput=Math.max(10,Math.min(300,Math.round(baseThroughput*(1+(s.parameters.intensity-50)*.003))));});onUpdate(snapshot());return true;},
  reset(){engine.stop();state.status="idle";state.currentScenario=null;state.progress=0;state.eventCount=0;onUpdate(snapshot());}
 };
}
