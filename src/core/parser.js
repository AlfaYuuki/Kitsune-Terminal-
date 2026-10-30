// Broad, keyword-scored intent detection. Unknown prompts still receive a useful general simulation.
const DOMAINS = {
  cyber: ["cyber","network","server","firewall","packet","router","database","security","encryption","protocol","intrusion","malware","hijack","hacking"],
  aerospace: ["space","rocket","satellite","orbit","launch"," spacecraft","mars","lunar","astronaut","mission","telescope"],
  engineering: ["bridge","engine","robot","factory"," turbine","circuit","power","solar","mechanical","structure","vehicle","automation"],
  science: ["atom","molecule","physics","chemistry","biology","climate","experiment","quantum","laboratory","ecosystem","gene"],
  environment: ["ocean","forest","weather","climate","earthquake","volcano","ecosystem","wildlife","river","storm"],
  city: ["city","traffic","urban","transport","building","metro","population","infrastructure"]
};

const stopWords = new Set(["the","a","an","and","or","to","of","in","on","for","with","simulate","simulation","create","run","show","me","please","what","how","would","could"]);

export function parseRequest(input) {
  const raw = String(input ?? "").trim().replace(/\s+/g, " ");
  if (!raw) throw new Error("Enter a scenario to simulate.");
  const normalized = raw.toLowerCase();
  const tokens = normalized.match(/[a-z0-9-]+/g) || [];
  const scores = Object.fromEntries(Object.entries(DOMAINS).map(([domain, words]) => [
    domain, words.reduce((score, word) => score + (tokens.includes(word.trim()) ? 1 : 0), 0)
  ]));
  const ranked = Object.entries(scores).sort((a,b) => b[1] - a[1]);
  const domain = ranked[0][1] ? ranked[0][0] : "general";
  const keywords = [...new Set(tokens.filter(token => token.length > 3 && !stopWords.has(token)))].slice(0, 12);
  const title = raw.length > 62 ? raw.slice(0, 59) + "…" : raw;
  return { raw, normalized, domain, title, keywords, intent: "simulation_request", confidence: ranked[0][1] ? Math.min(.96, .58 + ranked[0][1] * .1) : .42 };
}
