// Natural-language scenario understanding. Works offline; unknown subjects use the general model.
const LEXICON={
 cyber:["cyber","network","server","firewall","packet","router","database","security","encryption","protocol","intrusion","malware","hijack","hacking","cloud","data center","datacenter","computer","system admin"],
 aerospace:["space","rocket","satellite","orbit","launch","spacecraft","mars","lunar","astronaut","mission","telescope","planet","moon","starship","probe"],
 engineering:["bridge","engine","robot","factory","turbine","circuit","power","solar","mechanical","structure","vehicle","automation","machine","battery","generator","dam"],
 science:["atom","molecule","physics","chemistry","biology","experiment","quantum","laboratory","gene","particle","research","cell","medical","protein"],
 environment:["ocean","forest","weather","climate","earthquake","volcano","ecosystem","wildlife","river","storm","rainforest","trench","glacier","desert","planetary"],
 city:["city","traffic","urban","transport","building","metro","population","infrastructure","subway","district","road","smart city","airport"]
};
const stop=new Set("the a an and or to of in on for with simulate simulation create run show me please what how would could model build design a an".split(" "));
const aliases={cyber:["digital infrastructure","computer network","security operations"],aerospace:["space exploration","orbital station"],engineering:["industrial plant","renewable energy"],science:["scientific study","research station"],environment:["natural habitat","climate system"],city:["urban area","public transport"]};
function scoreText(text,terms){return terms.reduce((n,term)=>n+(text.includes(term)?(term.includes(" ")?2:1):0),0)}
export function parseRequest(input){
 const raw=String(input??"").trim().replace(/\s+/g," ");
 if(!raw)throw new Error("Enter a scenario to simulate.");
 if(raw.length>420)throw new Error("Scenario is too long. Keep it under 420 characters.");
 const normalized=raw.toLowerCase();
 const scores=Object.fromEntries(Object.entries(LEXICON).map(([key,terms])=>[key,scoreText(normalized,[...terms,...aliases[key]])]));
 const ranked=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
 const domain=ranked[0][1]?(ranked[0][1]===ranked[1][1]?"general":ranked[0][0]):"general";
 const tokens=normalized.match(/[a-z0-9-]+/g)||[];
 const keywords=[...new Set(tokens.filter(t=>t.length>2&&!stop.has(t)))].slice(0,24);
 const action=(normalized.match(/\b(launch|explore|monitor|manage|protect|design|test|study|analyze|control|operate|build|investigate|simulate|optimize|respond)\b/)||[])[0]||"simulate";
 const scale=(normalized.match(/\b(global|regional|national|citywide|large-scale|small-scale|local|micro|deep-space|orbital)\b/)||[])[0]||"standard";
 const conditions=[...new Set(["night","storm","solar storm","emergency","high traffic","low power","failure","drought","flood","unknown","extreme","peak demand"].filter(x=>normalized.includes(x)))];
 const title=raw.length>68?raw.slice(0,65)+"…":raw;
 const confidence=ranked[0][1]?Math.min(.97,.55+ranked[0][1]*.075):.38;
 return {raw,normalized,domain,title,keywords,action,scale,conditions,intent:"simulation_request",scores,confidence};
}
