export type AssistantLanguage = "en" | "fil";

export type PriorityIntent =
  | "emergency"
  | "security"
  | "privacy"
  | "clinic_comparison"
  | "competitor_boundary"
  | "doctor_appearance"
  | "doctor_personal_opinion"
  | "doctor_comparison"
  | "nearby_place"
  | "unverified_facility"
  | "medical"
  | "cancel_or_reschedule"
  | null;

export const normalizeAssistantText = (value: string) =>
  value.normalize("NFKC").replace(/[\u200B-\u200D\u2060\uFEFF]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

export const languageFor = (value: string): AssistantLanguage => {
  const q = normalizeAssistantText(value);
  return /\b(ako|akong|akin|aking|sakin|ko|kong|mo|ba|paano|ano|anong|saan|kailan|magkano|bakit|sino|sinong|may|meron|marami|madami|kailangan|gawin|gusto|puwede|pwede|diyan|dyan|malapit|kayo|niyo|nyo|natin|po|opo|salamat|kamusta|kumusta)\b|mag-?(?:book|schedule)|pa-?(?:book|schedule)/.test(q) ? "fil" : "en";
};

export const mentionsCompetitor = (q: string) =>
  /\b(belo|aivee|skin station|skinstation|other clinics?|another clinic|competitors?|hospital)\b|ibang\s*clinic/.test(q);

export const isClinicComparison = (q: string) => mentionsCompetitor(q) && (
  /\b(vs\.?|versus|kesa|instead|rather|over|compare|compared|comparison|better|best|mas maganda|mas okay|bakit dito|why (?:choose|book|go))\b/.test(q)
  || /\b(aesthera|dito|here|your clinic|kayo|inyo|inyong|clinic\s*niyo|clinic\s*ninyo)\b/.test(q)
);

export const isBookingIntent = (q: string) =>
  /\b(book|booking|appointment|consultation|konsultasyon|schedule)\b|(?:mag|pa|magpa)[\s-]*bo+ok|bo+book|(?:mag|pa|magpa)[\s-]*schedule/.test(q)
  && !/cancel|resched|move|lipat/.test(q);

const isSecurityManipulation = (q: string) => {
  const override = /\b(ignore|disregard|forget|override|bypass|break|remove|disable)\b.{0,45}\b(instructions?|rules?|polic(?:y|ies)|guardrails?|safety|prompts?|restrictions?|boundaries)\b/.test(q);
  const reverseOverride = /\b(system|developer|hidden|previous|original)\b.{0,30}\b(prompt|instruction|message|rule)\b.{0,35}\b(show|reveal|print|repeat|ignore|override)\b/.test(q);
  const secretRequest = /\b(show|reveal|give|send|print|dump|leak|access|extract)\b.{0,45}\b(api\s*keys?|secrets?|passwords?|credentials?|database|patient\s*(?:records?|data|list)|private\s*(?:data|records?)|environment\s*variables?)\b/.test(q);
  const hiddenPromptRequest = /\b(show|reveal|print|repeat)\b.{0,35}\b(hidden|system|developer)\b.{0,25}\b(prompts?|instructions?|messages?|rules?)\b/.test(q);
  const fakeAuthority = /\b(i am|i'm|ako ang|as the)\b.{0,30}\b(admin|owner|developer|doctor|staff|authorized|auditor)\b.{0,55}\b(show|reveal|override|bypass|access|give|send|ignore)\b/.test(q);
  const roleplay = /\b(pretend|roleplay|act as|simulate)\b.{0,45}\b(unrestricted|no rules|doctor|admin|developer|system|jailbroken)\b/.test(q);
  const encodedBlob = /(?:[a-z0-9+/]{100,}={0,2})|(?:\b[0-9a-f]{120,}\b)/i.test(q);
  return override || reverseOverride || secretRequest || hiddenPromptRequest || fakeAuthority || roleplay || encodedBlob;
};

const isEmergency = (q: string) => /can't breathe|cannot breathe|hirap huminga|chest pain|unconscious|passed out|severe bleeding|won't stop bleeding|overdose|stroke|face droop|severe allergic|anaphyl|vision loss|lost vision|biglang hindi makakita|suicid|kill (?:myself|himself|herself|themself)|emergency/.test(q);

const isPrivacyRisk = (q: string) =>
  /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|(?:\+?63|09)\d[\d\s-]{8,}|\bmy name is\b|\bako si\b/.test(q)
  || /(?:send|share|upload|ibigay|isend|i-send|ipadala|post).{0,40}(?:medical\s*(?:record|history)|lab result|prescription|photo|picture|valid id|pangalan|name|email|phone|number|address)/.test(q)
  || /(?:pwede|puwede|can i).{0,25}(?:send|share|upload).{0,30}(?:record|photo|picture|history|result)/.test(q);

const isMedical = (q: string) => /\b(diagnos\w*|symptom\w*|dose|dosage|prescri\w*|pregnan\w*|breastfeed\w*|allerg\w*|medication\w*|infection|complication\w*|anatomy|contraindication\w*|side effect\w*|aftercare|swelling|rash|bleeding|safe|safety|risk\w*)\b|buntis|gamot|masakit|namamaga|bagay.*(akin|sakin)|pwede.*(ako|ko)|puwede.*(ako|ko)|suitable|how.*(perform|administer)|paano.*(procedure|gawin|gamutin)/.test(q);

export function classifyPriorityIntent(value: string): PriorityIntent {
  const q = normalizeAssistantText(value);
  if (isEmergency(q)) return "emergency";
  if (isSecurityManipulation(q)) return "security";
  if (isPrivacyRisk(q)) return "privacy";
  if (isClinicComparison(q)) return "clinic_comparison";
  if (mentionsCompetitor(q)) return "competitor_boundary";
  if (/(?:sino|who|which).*(?:mas|more|most)?.*(?:pogi|gwapo|handsome|maganda|pretty|prettier|attractive)|(?:pogi|gwapo|handsome|maganda|pretty|prettier|attractive).*(?:doctor|doktor|doc|dr\b)|(?:doctor|doktor|doc|dr\b).*(?:pogi|gwapo|handsome|maganda|pretty|prettier|attractive)/.test(q)) return "doctor_appearance";
  if (/(?:kumanta|sing(?:er|ing)?|sumayaw|dance|dancing|mabait|kind|nice|funny|funniest|nakakatawa|personality|fashion|stylish|matalino|smart).*(?:doctor|doktor|doc|dr\b)|(?:doctor|doktor|doc|dr\b).*(?:kumanta|sing(?:er|ing)?|sumayaw|dance|dancing|mabait|kind|nice|funny|funniest|nakakatawa|personality|fashion|stylish|matalino|smart)/.test(q)) return "doctor_personal_opinion";
  if (/(?:sino|who|which).*(?:pinaka\s*magaling|best|magaling|mas\s*(?:okay|better|magaling)|preferred|doctor.*choose)|(?:choose|pick|pili|recommend|suggest).*(?:doctor|doktor|doc)|(?:doctor|doktor|doc).*(?:versus|vs\.?|\bo\b|\bor\b|choose)/.test(q)) return "doctor_comparison";
  if (/(?:malapit|nearby|nearest|closest).*(?:mcdo|mcdonald|jollibee|restaurant|kainan|cafe|coffee|mall|hotel|atm|bank|pharmacy|botika|store|shop)|(?:mcdo|mcdonald|jollibee|restaurant|kainan|cafe|coffee|mall|hotel|atm|bank|pharmacy|botika|store|shop).*(?:malapit|nearby|nearest|closest)/.test(q)) return "nearby_place";
  if (/\b(parking|park\s*space|wheelchair|pwd|accessibility|accessible|walk[\s-]?in)\b/.test(q)) return "unverified_facility";
  if (/\b(cancel|cancellation|resched\w*|move|lipat).*(?:appointment|booking|schedule)|(?:appointment|booking|schedule).*(?:cancel|resched\w*|move|lipat)|mag-?cancel|ipa-?resched|\bcancellation\s+(?:process|policy)\b/.test(q)) return "cancel_or_reschedule";
  if (isMedical(q)) return "medical";
  return null;
}

export const isAmbiguousQuestion = (q: string) => {
  const normalized = normalizeAssistantText(q);
  const meaningful = normalized.match(/[a-z0-9]{2,}/g) ?? [];
  return meaningful.length <= 3 && /^(?:how much|price|magkano|magkano treatment|treatment price|what about it|how about it|ito|iyan|yan|that one|tell me more|more info|details|available)\??$/.test(normalized);
};

export const isContextFollowUp = (q: string) => /\b(it|that|this|that one|this one|ito|iyan|yan|niyan|nito|more|details|price|magkano|available|book)\b/.test(normalizeAssistantText(q));
