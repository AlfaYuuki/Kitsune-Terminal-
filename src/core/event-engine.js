// Deterministic event scheduler with pause, resume, single-step and speed control.
export function createEventEngine({interval=560,onEvent=()=>{},onComplete=()=>{}}={}){
 let timer=null,cursor=0,events=[],status="idle",speed=1;
 function clear(){if(timer!==null)clearTimeout(timer);timer=null}
 function schedule(){clear();if(status!=="running")return;timer=setTimeout(step,Math.max(90,interval/speed))}
 function step(){
  if(status!=="running"&&status!=="stepping")return;
  if(cursor>=events.length){status="completed";clear();onComplete();return}
  const current=events[cursor];onEvent(current,cursor,events.length);cursor++;
  if(cursor>=events.length){status="completed";clear();onComplete();return}
  if(status==="stepping")status="paused";else schedule();
 }
 return {
  load(items=[]){clear();events=[...items];cursor=0;status="ready"},
  start(){if(!events.length){status="completed";onComplete();return}if(status==="completed")return;status="running";schedule();},
  pause(){if(status==="running"){status="paused";clear()}return status},
  resume(){if(status==="paused"||status==="ready"){status="running";schedule()}return status},
  step(){if(status==="paused"||status==="ready"){status="stepping";step()}return cursor},
  stop(){clear();status="stopped";return status},
  setSpeed(value){speed=Math.max(.5,Math.min(4,Number(value)||1));if(status==="running")schedule();return speed},
  get position(){return cursor},get status(){return status},get speed(){return speed},get total(){return events.length}
 };
}
