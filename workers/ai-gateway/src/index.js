const ALLOWED_ORIGIN = "https://alfayuuki.github.io";
const MODEL_POOL = ["gemini-3.5-flash-lite","gemini-3.1-flash-lite","gemini-3.6-flash","gemini-3.8-flash"];
const UPSTREAM_TIMEOUT_MS = 10000;
const SCHEMA = { type:"OBJECT", properties:{
 title:{type:"STRING"}, domain:{type:"STRING"}, environment:{type:"STRING"}, summary:{type:"STRING"},
 subsystems:{type:"ARRAY",items:{type:"STRING"}}, phases:{type:"ARRAY",items:{type:"STRING"}},
 assumptions:{type:"ARRAY",items:{type:"STRING"}}, risks:{type:"ARRAY",items:{type:"STRING"}}, confidence:{type:"INTEGER"}
}, required:["title","domain","environment","summary","subsystems","phases","assumptions","risks","confidence"] };
function reply(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":ALLOWED_ORIGIN,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Vary":"Origin","Cache-Control":"no-store"}})}
export default { async fetch(request,env) {
 const origin=request.headers.get("Origin")||"";
 if(origin!==ALLOWED_ORIGIN)return new Response("Origin not allowed",{status:403});
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":ALLOWED_ORIGIN,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Access-Control-Max-Age":"86400","Vary":"Origin"}});
 if(request.method!=="POST")return reply({error:"Method not allowed."},405);
 if(new URL(request.url).pathname!=="/generate")return reply({error:"Not found."},404);
 if(!env.GEMINI_API_KEY)return reply({error:"Server-side Gemini secret is not configured."},503);
 let body;try{body=await request.json()}catch{return reply({error:"Invalid JSON."},400)}
 const prompt=typeof body.prompt==="string"?body.prompt.trim():"";
 if(!prompt||prompt.length>420)return reply({error:"Prompt must contain 1–420 characters."},400);
 const local=body.localModel&&typeof body.localModel==="object"?body.localModel:{};
 const instruction="You are the independent AI model designer inside KITSUNE TERMINAL. Design a fictional educational simulation blueprint only. Never provide real-world intrusion, targeting, access, control, or operation instructions. Do not use tools or access external systems. Return JSON matching the schema. Domain must be cyber, aerospace, engineering, science, environment, city, or general. Cyber must be defensive and isolated. Limit arrays to 8 subsystems, 8 phases, 6 assumptions, 6 risks. State uncertainty honestly. const startedAt=Date.now();
 let lastFailure=null;
 for(let modelIndex=0;modelIndex<MODEL_POOL.length;modelIndex++){
  const model=MODEL_POOL[modelIndex];
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),UPSTREAM_TIMEOUT_MS);
  try{
   const url="https://generativelanguage.googleapis.com/v1beta/models/"+model+":generateContent";
   const upstream=await fetch(url,{
    method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},
    body:JSON.stringify({contents:[{role:"user",parts:[{text:instruction}]}],generationConfig:{responseMimeType:"application/json",responseSchema:SCHEMA,maxOutputTokens:850}}),
    signal:controller.signal
   });
   const result=await upstream.json().catch(()=>({}));
   if(!upstream.ok){
    const message=String(result.error?.message||"Gemini request failed.").slice(0,240);
    const retryable=[408,429,500,502,503,504].includes(upstream.status);
    lastFailure={message,status:upstream.status,model};
    console.warn("Gemini model attempt failed",{model,status:upstream.status,errorStatus:result.error?.status||"unknown",modelIndex,willRotate:retryable&&modelIndex<MODEL_POOL.length-1});
    if(retryable&&modelIndex<MODEL_POOL.length-1)continue;
    return reply({error:message,upstreamStatus:upstream.status,model,attemptedModels:MODEL_POOL.slice(0,modelIndex+1)},upstream.status===429?429:upstream.status===503?503:502);
   }
   const raw=result.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("");
   let blueprint;
   try{if(!raw)throw new Error("Empty response");blueprint=JSON.parse(raw)}catch{
    lastFailure={message:"Gemini returned an empty or invalid blueprint.",status:502,model};
    console.warn("Gemini response invalid; rotating model",{model,modelIndex});
    if(modelIndex<MODEL_POOL.length-1)continue;
    return reply({error:lastFailure.message,model,attemptedModels:MODEL_POOL.slice(0,modelIndex+1)},502);
   }
   console.info("Gemini model rotation succeeded",{model,modelIndex,attemptedModels:MODEL_POOL.slice(0,modelIndex+1),elapsedMs:Date.now()-startedAt});
   return reply({blueprint,provider:"Gemini",model,attemptedModels:MODEL_POOL.slice(0,modelIndex+1)});
  }catch(error){
   const timedOut=error?.name==="AbortError";
   lastFailure={message:timedOut?"Gemini model timed out.":String(error?.message||"Gemini network failure").slice(0,160),status:timedOut?504:502,model};
   console.warn(timedOut?"Gemini model timed out; rotating":"Gemini network failure; rotating",{model,modelIndex,timeoutMs:UPSTREAM_TIMEOUT_MS});
   if(modelIndex===MODEL_POOL.length-1)break;
  }finally{clearTimeout(timeout)}
 }
 return reply({error:"All configured Gemini models are currently unavailable. The local procedural engine remains available.",attemptedModels:MODEL_POOL,lastFailure:lastFailure?.message||"Unknown upstream failure.",elapsedMs:Date.now()-startedAt},lastFailure?.status===429?429:503);mains available.",model:MODEL},502);
 }finally{clearTimeout(timeout)}
}};