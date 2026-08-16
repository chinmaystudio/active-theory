const categories = {
  events: { label: 'EVENTS & WORKSHOPS', intro: 'LEARN. CONNECT. EXPERIMENT.', recommendations: ['AI / ML WORKSHOPS', 'WEB DEVELOPMENT SESSIONS', 'HANDS-ON PROJECT BUILDS', 'TECHNICAL COMMUNITY MEETS'], action: 'FIND AN EVENT FOR ME' },
  projects: { label: 'PROJECTS & INNOVATION', intro: 'IDEAS BECOME WORKING SYSTEMS.', recommendations: ['AI / DATA PROJECTS', 'WEB AND APP BUILDS', 'CYBERSECURITY CHALLENGES', 'PROTOTYPE SPRINTS'], action: 'GENERATE A PROJECT IDEA' },
  communities: { label: 'TECH COMMUNITIES', intro: 'FIND PEOPLE WHO ARE BUILDING WHAT YOU WANT TO LEARN.', recommendations: ['AI / ML', 'WEB DEVELOPMENT', 'CYBERSECURITY', 'APP DEVELOPMENT', 'DATA + CLOUD'], action: 'BUILD MY ITSA TECH PROFILE' },
  competitions: { label: 'COMPETITIONS & HACKATHONS', intro: 'BUILD UNDER PRESSURE. SOLVE PROBLEMS. COMPETE.', recommendations: ['HACKATHON STARTER PATH', 'TEAM-FINDING PROMPTS', 'PROBLEM-SOLVING SPRINTS', 'PITCH + DEMO PREPARATION'], action: 'START A 7-DAY PREP PLAN' },
  learning: { label: 'LEARNING & SKILLS', intro: 'BUILD SKILLS THAT EXTEND BEYOND THE CLASSROOM.', recommendations: ['WEB DEVELOPMENT FOUNDATIONS', 'AI / MACHINE LEARNING BASICS', 'CYBERSECURITY PRACTICE', 'PROJECT-BASED LEARNING'], action: 'CREATE MY LEARNING PATH' }
};
const keywords = {
  events: ['event', 'workshop', 'session', 'attend', 'activity'],
  projects: ['project', 'build', 'idea', 'prototype', 'app', 'iot', 'dataset'],
  communities: ['team', 'community', 'join', 'people', 'connect'],
  competitions: ['hackathon', 'competition', 'challenge', 'compete', 'prep'],
  learning: ['learn', 'skill', 'start', 'beginner', 'first year', 'roadmap', 'study']
};

function classify(query) {
  const text = String(query || '').toLowerCase();
  if (/hackathon|competition|compete|challenge|7-day/.test(text)) return 'competitions';
  if (/workshop|event|session|attend/.test(text)) return 'events';
  if (/project|prototype|dataset|build an app/.test(text)) return 'projects';
  let best = 'learning'; let score = 0;
  for (const [key, words] of Object.entries(keywords)) {
    const current = words.reduce((n, word) => n + (text.includes(word) ? 1 : 0), 0);
    if (current > score) { score = current; best = key; }
  }
  if (/what is itsa|about it sa|about itsa/.test(text)) return null;
  return best;
}

function deterministic(query) {
  const category = classify(query);
  if (!category) return { mode: 'guide', title: 'A TECHNOLOGY COMMUNITY FOR YOUR NEXT STEP.', category: null, rationale: 'ITSA HELPS STUDENTS DISCOVER EVENTS, BUILD PROJECTS, FIND TECH COMMUNITIES, COMPETE AND GROW PRACTICAL SKILLS.', recommendations: Object.values(categories).map(item => item.label), action: 'EXPLORE THE FIVE PATHS' };
  const item = categories[category];
  return { mode: 'match', title: item.intro, category, categoryLabel: item.label, rationale: `YOUR QUERY SIGNALS AN INTEREST IN ${item.label}.`, recommendations: item.recommendations, action: item.action };
}

async function optionalLLM(query) {
  const base = process.env.BUILT_IN_FORGE_API_URL;
  const key = process.env.BUILT_IN_FORGE_API_KEY;
  if (!base || !key) return null;
  const response = await fetch(`${base.replace(/\/$/, '')}/v1/chat/completions`, {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: process.env.ITSA_GUIDE_MODEL || 'gpt-5-mini', messages: [
      { role: 'system', content: 'You are the concise ITSA technology-community guide. Return JSON only with title, category, rationale, recommendations (array of strings), and action. Use only these categories: events, projects, communities, competitions, learning.' },
      { role: 'user', content: query }
    ], response_format: { type: 'json_object' }, max_completion_tokens: 500 })
  });
  if (!response.ok) return null;
  const data = await response.json();
  try { return { ...JSON.parse(data.choices?.[0]?.message?.content || '{}'), mode: 'llm' }; } catch (_) { return null; }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  const query = typeof req.body === 'string' ? JSON.parse(req.body || '{}').query : req.body?.query;
  if (!query || String(query).trim().length < 2) return res.status(400).json({ error: 'A question is required.' });
  try {
    const result = (await optionalLLM(String(query).slice(0, 500))) || deterministic(String(query).slice(0, 500));
    return res.status(200).json({ ...result, query: String(query).slice(0, 500) });
  } catch (_) {
    return res.status(200).json({ ...deterministic(String(query).slice(0, 500)), fallback: true });
  }
};
