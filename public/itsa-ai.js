(() => {
  const categories = {
    events: {
      label: 'EVENTS & WORKSHOPS',
      color: '#00f3ff',
      intro: 'LEARN. CONNECT. EXPERIMENT.',
      items: ['AI / ML WORKSHOPS', 'WEB DEVELOPMENT SESSIONS', 'HANDS-ON PROJECT BUILDS', 'TECHNICAL COMMUNITY MEETS'],
      action: 'FIND AN EVENT FOR ME'
    },
    projects: {
      label: 'PROJECTS & INNOVATION',
      color: '#00a8ff',
      intro: 'IDEAS BECOME WORKING SYSTEMS.',
      items: ['AI / DATA PROJECTS', 'WEB AND APP BUILDS', 'CYBERSECURITY CHALLENGES', 'PROTOTYPE SPRINTS'],
      action: 'GENERATE A PROJECT IDEA'
    },
    communities: {
      label: 'TECH COMMUNITIES',
      color: '#9d63ff',
      intro: 'FIND PEOPLE WHO ARE BUILDING WHAT YOU WANT TO LEARN.',
      items: ['AI / ML', 'WEB DEVELOPMENT', 'CYBERSECURITY', 'APP DEVELOPMENT', 'DATA + CLOUD'],
      action: 'BUILD MY ITSA TECH PROFILE'
    },
    competitions: {
      label: 'COMPETITIONS & HACKATHONS',
      color: '#00ff88',
      intro: 'BUILD UNDER PRESSURE. SOLVE PROBLEMS. COMPETE.',
      items: ['HACKATHON STARTER PATH', 'TEAM-FINDING PROMPTS', 'PROBLEM-SOLVING SPRINTS', 'PITCH + DEMO PREPARATION'],
      action: 'START A 7-DAY PREP PLAN'
    },
    learning: {
      label: 'LEARNING & SKILLS',
      color: '#ff36a5',
      intro: 'BUILD SKILLS THAT EXTEND BEYOND THE CLASSROOM.',
      items: ['WEB DEVELOPMENT FOUNDATIONS', 'AI / MACHINE LEARNING BASICS', 'CYBERSECURITY PRACTICE', 'PROJECT-BASED LEARNING'],
      action: 'CREATE MY LEARNING PATH'
    }
  };

  const suggestions = ['WHAT IS ITSA?', 'I LIKE AI AND CYBERSECURITY', 'SHOW ME PROJECTS', 'I AM A FIRST YEAR STUDENT'];
  const keywordMap = {
    events: ['event', 'workshop', 'session', 'attend', 'activity', 'learn this month'],
    projects: ['project', 'build', 'idea', 'prototype', 'app', 'iot', 'dataset'],
    communities: ['team', 'community', 'join', 'people', 'connect', 'who should'],
    competitions: ['hackathon', 'competition', 'challenge', 'compete', '7-day', 'prep'],
    learning: ['learn', 'skill', 'start with', 'beginner', 'first year', 'roadmap', 'study']
  };

  const root = document.createElement('div');
  root.id = 'itsa-ai-root';
  root.innerHTML = `
    <div id="itsa-ai-backdrop" aria-hidden="true"></div>
    <section id="itsa-ai-panel" role="dialog" aria-modal="true" aria-labelledby="itsa-ai-title">
      <header class="itsa-ai-head">
        <div><div class="itsa-ai-kicker">ITSA INTELLIGENCE LAYER</div><h2 id="itsa-ai-title" class="itsa-ai-title">AI GUIDE</h2><div class="itsa-ai-subtitle">DISCOVER. BUILD. LEARN. CONNECT.</div></div>
        <button class="itsa-ai-close" type="button" aria-label="Close AI guide">×</button>
      </header>
      <div class="itsa-ai-body">
        <div class="itsa-ai-suggestions"></div>
        <div class="itsa-ai-output" aria-live="polite"><div class="itsa-ai-welcome">ASK THE ITSA GUIDE WHAT TO EXPLORE NEXT. IT CAN MATCH YOUR INTERESTS TO EVENTS, PROJECTS, COMMUNITIES, COMPETITIONS AND SKILLS.</div></div>
        <form class="itsa-ai-form"><input class="itsa-ai-input" aria-label="Ask the ITSA AI guide" autocomplete="off" placeholder="EXPLORE ITSA..." /><button class="itsa-ai-submit" type="submit">RUN</button></form>
      </div>
    </section>`;
  document.body.appendChild(root);

  const launcher = document.createElement('button');
  launcher.id = 'itsa-ai-launcher';
  launcher.type = 'button';
  launcher.innerHTML = '<i aria-hidden="true"></i><span>AI GUIDE</span>';
  document.body.appendChild(launcher);

  const output = root.querySelector('.itsa-ai-output');
  const input = root.querySelector('.itsa-ai-input');
  const chips = root.querySelector('.itsa-ai-suggestions');
  suggestions.forEach(text => {
    const chip = document.createElement('button');
    chip.type = 'button'; chip.className = 'itsa-ai-chip'; chip.textContent = text;
    chip.addEventListener('click', () => { input.value = text; respond(text); });
    chips.appendChild(chip);
  });

  function open() { root.classList.add('is-open'); input.focus(); }
  function close() { root.classList.remove('is-open'); }
  launcher.addEventListener('click', open);
  root.querySelector('.itsa-ai-close').addEventListener('click', close);
  root.querySelector('#itsa-ai-backdrop').addEventListener('click', close);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); if (event.key === '/' && document.activeElement !== input) { event.preventDefault(); open(); } });

  function detect(query) {
    const text = query.toLowerCase();
    if (/hackathon|competition|compete|challenge|7-day/.test(text)) return 'competitions';
    if (/workshop|event|session|attend/.test(text)) return 'events';
    if (/project|prototype|dataset|build an app/.test(text)) return 'projects';
    let best = 'learning'; let score = 0;
    Object.entries(keywordMap).forEach(([key, words]) => {
      const next = words.reduce((n, word) => n + (text.includes(word) ? 1 : 0), 0);
      if (next > score) { score = next; best = key; }
    });
    if (/what is itsa|about it sa|about itsa/.test(text)) return null;
    return best;
  }

  function renderCategory(key, query, result = {}) {
    const category = categories[key];
    const items = Array.isArray(result.recommendations) && result.recommendations.length ? result.recommendations : category.items;
    output.innerHTML = `<div class="itsa-ai-response-label">${result.mode === 'llm' ? 'AI MATCH' : 'MATCH FOUND'} · ${category.label}</div><div class="itsa-ai-response-title">${escapeHtml(result.title || category.intro)}</div><div style="color:rgba(233,251,255,.56);margin-bottom:8px">${escapeHtml(result.rationale || `QUERY: ${query}`).toUpperCase()}</div><ul class="itsa-ai-list">${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul><button class="itsa-ai-action" data-category="${key}" type="button">${escapeHtml(result.action || category.action)} →</button>`;
    output.querySelector('.itsa-ai-action').addEventListener('click', () => {
      const link = [...document.querySelectorAll('a')].find(a => a.textContent.toLowerCase().includes(category.label.toLowerCase().split(' ')[0]));
      if (link) link.click();
      output.insertAdjacentHTML('beforeend', `<div style="color:${category.color};margin-top:16px">ROUTE READY. CONTINUE EXPLORING THE ${category.label} CARD.</div>`);
    });
  }

  async function respond(raw) {
    const query = raw.trim();
    if (!query) return;
    input.value = '';
    output.innerHTML = '<div class="itsa-ai-response-label">READING YOUR SIGNAL...</div><div class="itsa-ai-welcome">MATCHING YOUR INTERESTS TO THE ITSA KNOWLEDGE LAYER.</div>';
    try {
      const response = await fetch('./api/itsa-guide', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ query }) });
      if (!response.ok) throw new Error('guide unavailable');
      const result = await response.json();
      if (result.category && categories[result.category]) {
        renderCategory(result.category, query, result);
      } else {
        output.innerHTML = `<div class="itsa-ai-response-label">ITSA IN ONE SIGNAL</div><div class="itsa-ai-response-title">${escapeHtml(result.title || 'A TECHNOLOGY COMMUNITY FOR YOUR NEXT STEP.')}</div><div class="itsa-ai-welcome">${escapeHtml(result.rationale || 'ITSA HELPS STUDENTS DISCOVER EVENTS, BUILD PROJECTS, FIND TECH COMMUNITIES, COMPETE AND GROW PRACTICAL SKILLS.')}</div><br><button class="itsa-ai-action" type="button">EXPLORE THE FIVE PATHS →</button>`;
      }
    } catch (_) {
      const key = detect(query);
      if (key) renderCategory(key, query);
      else output.innerHTML = '<div class="itsa-ai-response-label">ITSA IN ONE SIGNAL</div><div class="itsa-ai-response-title">A TECHNOLOGY COMMUNITY FOR YOUR NEXT STEP.</div><div class="itsa-ai-welcome">ITSA HELPS STUDENTS DISCOVER EVENTS, BUILD PROJECTS, FIND TECH COMMUNITIES, COMPETE AND GROW PRACTICAL SKILLS.</div>';
    }
  }

  root.querySelector('.itsa-ai-form').addEventListener('submit', event => { event.preventDefault(); respond(input.value); });
  function escapeHtml(value) { return value.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch])); }
  window.ITSA_AI = { open, close, respond, categories };
})();
