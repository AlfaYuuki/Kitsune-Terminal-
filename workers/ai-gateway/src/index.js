const ALLOWED_ORIGIN = "https://alfayuuki.github.io";
const MODEL = "gemini-flash-latest";
const UPSTREAM_TIMEOUT_MS = 40000;
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
 const instruction="You are the independent AI model designer inside KITSUNE TERMINAL. Design a fictional educational simulation blueprint only. Never provide real-world intrusion, targeting, access, control, or operation instructions. Do not use tools or access external systems. Return JSON matching the schema. Domain must be cyber, aerospace, engineering, science, environment, city, or general. Cyber must be defensive and isolated. Limit arrays to 8 subsystems, 8 phases, 6 assumptions, 6 risks. State uncertainty honestly.\nSCENARIO: "+prompt+"\nLOCAL ENGINE MODEL: "+JSON.stringify(local);
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),UPSTREAM_TIMEOUT_MS);
 try {
  const url="https://generativelanguage.googleapis.com/v1beta/models/"+MODEL+":generateContent";
  const options={method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},body:JSON.stringify({contents:[{role:"user",parts:[{text:instruction}]}],generationConfig:{responseMimeType:"application/json",responseSchema:SCHEMA,temperature:0.45,maxOutputTokens:1200}}),signal:controller.signal};
  let upstream, result={};
  for(let attempt=0;attempt<2;attempt++){
   upstream=await fetch(url,options);
   result=await upstream.json().catch(()=>({}));
   if(upstream.ok || ![500,503].includes(upstream.status) || attempt===1)break;
   console.warn("Gemini temporarily unavailable; retrying once",{status:upstream.status,model:MODEL});
   await new Promise(resolve=>setTimeout(resolve,500));
  }
  if(!upstream.ok){
   const errorMessage=String(result.error?.message||"Gemini request failed.").slice(0,240);
   console.warn("Gemini upstream failure",{status:upstream.status,statusText:upstream.statusText,model:MODEL,errorStatus:result.error?.status||"unknown",errorMessage});
   const status=upstream.status===429?429:upstream.status===503?503:502;
   return reply({error:errorMessage,upstreamStatus:upstream.status,model:MODEL},status);
  }
  const raw=result.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("");
  if(!raw)return reply({error:"Gemini returned no blueprint."},502);
  let blueprint;try{blueprint=JSON.parse(raw)}catch{return reply({error:"Gemini returned invalid JSON."},502)}
  return reply({blueprint,provider:"Gemini",model:MODEL});
 }catch(error){
  if(error?.name==="AbortError")return reply({error:"Gemini upstream timed out after 40 seconds. Check Worker logs and Gemini API availability."},504);
  console.error("Gemini gateway network failure",{message:String(error?.message||"network error").slice(0,160),model:MODEL});
  return reply({error:"Unable to reach Gemini. Check Worker logs and Gemini API availability."},502);
 }finally{clearTimeout(timeout)}
}};
