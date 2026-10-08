const body = document.body;
const progressBar = document.getElementById('progressBar');
const petalLayer = document.getElementById('petalLayer');
const modal = document.getElementById('greetingModal');
const nameInput = document.getElementById('visitorName');
const greetingResult = document.getElementById('greetingResult');
const loader = document.getElementById('cinematicLoader');
const nav = document.getElementById('siteNav');
const navToggle = document.getElementById('navToggle');
const navPanel = document.getElementById('primaryNav');
const heroPhoto = document.getElementById('heroPhoto');
const photoDepth = document.getElementById('photoDepth');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* —— Theme system: session-only visual preference —— */
const THEME_META_COLORS = {
  midnight: '#080b12',
  aurora: '#0b1630',
  emerald: '#09211f',
  cosmic: '#1a1230',
  light: '#d9efff'
};
const themeTrigger = document.getElementById('themeTrigger');
const themeMenu = document.getElementById('themeMenu');
const themeOptions = [...document.querySelectorAll('[data-theme-choice]')];
const VALID_THEMES = new Set(['midnight', 'aurora', 'emerald', 'cosmic', 'light']);

function applyTheme(theme, { persist = true } = {}) {
  const next = VALID_THEMES.has(theme) ? theme : 'midnight';
  body.dataset.theme = next;
  document.documentElement.style.colorScheme = next === 'light' ? 'light' : 'dark';
  const meta = document.getElementById('themeColorMeta');
  if (meta) meta.setAttribute('content', THEME_META_COLORS[next]);
  themeOptions.forEach((option) => {
    const selected = option.dataset.themeChoice === next;
    option.classList.toggle('is-selected', selected);
    option.setAttribute('aria-checked', String(selected));
  });
  if (persist) {
    try { sessionStorage.setItem('portfolioTheme', next); } catch (_) { /* session storage may be blocked */ }
  }
}

function closeThemeMenu() {
  if (!themeMenu || !themeTrigger) return;
  themeMenu.hidden = true;
  themeTrigger.setAttribute('aria-expanded', 'false');
}

function openThemeMenu() {
  if (!themeMenu || !themeTrigger) return;
  themeMenu.hidden = false;
  themeTrigger.setAttribute('aria-expanded', 'true');
}

if (themeTrigger && themeMenu) {
  let savedTheme = 'midnight';
  try {
    const sessionTheme = sessionStorage.getItem('portfolioTheme');
    if (VALID_THEMES.has(sessionTheme)) savedTheme = sessionTheme;
  } catch (_) { /* use default */ }
  applyTheme(savedTheme, { persist: false });

  themeTrigger.addEventListener('click', () => {
    if (themeMenu.hidden) openThemeMenu();
    else closeThemeMenu();
  });

  themeOptions.forEach((option) => {
    option.addEventListener('click', () => {
      applyTheme(option.dataset.themeChoice);
      closeThemeMenu();
    });
    option.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        applyTheme(option.dataset.themeChoice);
        closeThemeMenu();
      }
      if (e.key === 'Escape') closeThemeMenu();
    });
  });

  document.addEventListener('click', (e) => {
    if (!themeMenu.hidden && !themeMenu.contains(e.target) && !themeTrigger.contains(e.target)) closeThemeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeThemeMenu();
  });
}

const PROJECTS = Object.freeze([
  Object.freeze({
    id: '01',
    slug: 'healthcare',
    type: 'PREDICTIVE / DIAGNOSTIC ANALYTICS',
    title: 'Healthcare Re-Admission Analysis',
    description: '30-day readmission patterns, risk factors and discharge-planning insights.',
    tags: ['Python', 'SQL Server', 'Tableau'],
    image: 'assets/project-01-healthcare.png',
    imageAlt: 'Healthcare Readmission dashboard',
    liveUrl: 'https://mohammedmanzoor1.github.io/healthcare-re-admission-analysis/',
    githubUrl: 'https://github.com/mohammedmanzoor1/healthcare-re-admission-analysis',
    caseStudyUrl: 'projects/healthcare.html'
  }),
  Object.freeze({
    id: '02',
    slug: 'loan',
    type: 'RISK ANALYTICS',
    title: 'Bank Loan Default Risk Analysis',
    description: 'Borrower risk, credit profiles, DTI and employment stability.',
    tags: ['SQL Server', 'Tableau'],
    image: 'assets/project-02-loan.png',
    imageAlt: 'Bank Loan Default dashboard',
    liveUrl: 'https://mohammedmanzoor1.github.io/bank-loan-default-risk-analysis/',
    githubUrl: 'https://github.com/mohammedmanzoor1/bank-loan-default-risk-analysis',
    caseStudyUrl: 'projects/loan-default.html'
  }),
  Object.freeze({
    id: '03',
    slug: 'retail-customer',
    type: 'SALES & CUSTOMER ANALYTICS',
    title: 'Online Retail Sales & Customer Insights',
    description: 'Revenue, customers, products and geographic sales performance.',
    tags: ['Python', 'SQL Server', 'Excel', 'Tableau'],
    image: 'assets/project-03-retail-customer.png',
    imageAlt: 'Online Retail Sales and Customer Insights dashboard',
    liveUrl: 'https://mohammedmanzoor1.github.io/Retail-revenue-customer-insights/',
    githubUrl: 'https://github.com/mohammedmanzoor1/Retail-revenue-customer-insights',
    caseStudyUrl: 'projects/online-retail.html'
  }),
  Object.freeze({
    id: '04',
    slug: 'google-play',
    type: 'BUSINESS INTELLIGENCE',
    title: 'Google Play Store Analytics',
    description: 'App volume, installs, ratings, reviews, pricing and sentiment.',
    tags: ['Power BI', 'DAX', 'Data Modeling'],
    image: 'assets/project-04-google-play-01.png',
    imageAlt: 'Google Play Store Analytics dashboard',
    liveUrl: 'https://mohammedmanzoor1.github.io/app-category-installs-sentiment-analysis/',
    githubUrl: 'https://github.com/mohammedmanzoor1/app-category-installs-sentiment-analysis',
    caseStudyUrl: 'projects/google-play.html'
  }),
  Object.freeze({
    id: '05',
    slug: 'retail-profit',
    type: 'DATA CLEANING + BI',
    title: 'Retail Sales & Profit Performance',
    description: 'SQL-based cleaning and analytics for sales, profit, customers and discounts.',
    tags: ['SQL Server', 'Tableau'],
    image: 'assets/project-05-retail-profit.png',
    imageAlt: 'Retail Sales and Profit Performance dashboard',
    liveUrl: 'https://mohammedmanzoor1.github.io/superstore-sales-analytics/',
    githubUrl: 'https://github.com/mohammedmanzoor1/superstore-sales-analytics',
    caseStudyUrl: 'projects/retail-profit.html'
  })
]);

function renderProjects() {
  const grid = document.getElementById('projectGrid');
  if (!grid) return;
  const doc = document;
  const frag = doc.createDocumentFragment();
  for (const project of PROJECTS) {
    const article = doc.createElement('article');
    article.className = 'project-card reveal';
    article.id = `project-${project.slug}`;
    article.dataset.project = project.slug;
    article.dataset.projectId = project.id;

    const projectIndex = doc.createElement('div');
    projectIndex.className = 'project-index';
    projectIndex.setAttribute('aria-hidden', 'true');
    projectIndex.innerHTML = `<span>${project.id}</span><i></i>`;
    article.appendChild(projectIndex);

    const imageWrap = doc.createElement('div');
    imageWrap.className = 'project-image';
    const img = doc.createElement('img');
    img.src = project.image;
    img.alt = project.imageAlt;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => { img.closest('.project-image')?.classList.add('image-error'); }, { once: true });
    const numBadge = doc.createElement('span');
    numBadge.textContent = project.id;
    const imageOverlay = doc.createElement('div');
    imageOverlay.className = 'project-image-overlay';
    imageOverlay.innerHTML = '<span>Dashboard preview</span><strong>Explore case study ↗</strong>';
    imageWrap.appendChild(img);
    imageWrap.appendChild(imageOverlay);
    imageWrap.appendChild(numBadge);
    article.appendChild(imageWrap);

    const body = doc.createElement('div');
    body.className = 'project-body';

    const type = doc.createElement('p');
    type.className = 'project-type';
    type.textContent = project.type;
    body.appendChild(type);

    const h3 = doc.createElement('h3');
    h3.textContent = project.title;
    body.appendChild(h3);

    const desc = doc.createElement('p');
    desc.textContent = project.description;
    body.appendChild(desc);

    const tags = doc.createElement('div');
    tags.className = 'tags';
    for (const t of project.tags) {
      const b = doc.createElement('b');
      b.textContent = t;
      tags.appendChild(b);
    }
    body.appendChild(tags);

    const actions = doc.createElement('div');
    actions.className = 'project-actions';

    const caseA = doc.createElement('a');
    caseA.className = 'project-case-link';
    caseA.href = project.caseStudyUrl;
    caseA.setAttribute('aria-label', `View case study: ${project.title}`);

    const caseLabel = doc.createElement('span');
    caseLabel.className = 'case-link-label';
    caseLabel.textContent = 'View Case Study';

    const caseArrow = doc.createElement('span');
    caseArrow.className = 'case-link-arrow';
    caseArrow.setAttribute('aria-hidden', 'true');
    caseArrow.textContent = '↗';

    caseA.appendChild(caseLabel);
    caseA.appendChild(caseArrow);
    caseA.addEventListener('click', () => {
      // Preserve the exact project-list position so the case-study back link
      // returns the viewer to the same place instead of the top of Projects.
      try {
        sessionStorage.setItem('portfolioReturn', JSON.stringify({
          scrollY: window.scrollY,
          projectId: project.slug,
          hash: '#projects'
        }));
      } catch (_) { /* Storage may be unavailable; normal navigation still works. */ }
    });
    actions.appendChild(caseA);

    const liveA = doc.createElement('a');
    liveA.className = 'project-secondary-link';
    liveA.href = project.liveUrl;
    liveA.target = '_blank';
    liveA.rel = 'noopener noreferrer';
    liveA.textContent = 'Dashboard ↗';
    actions.appendChild(liveA);

    const ghA = doc.createElement('a');
    ghA.className = 'project-secondary-link';
    ghA.href = project.githubUrl;
    ghA.target = '_blank';
    ghA.rel = 'noopener noreferrer';
    ghA.textContent = 'GitHub ↗';
    actions.appendChild(ghA);

    body.appendChild(actions);
    article.appendChild(body);
    frag.appendChild(article);
  }
  grid.appendChild(frag);
}

renderProjects();

const SKILLSETS = {
  data: {
    name: 'Data Analytics',
    eyebrow: 'Data Analytics Skills',
    title: 'Tools I use to work with, analyze, and communicate data.',
    badge: 'DATA TOOLKIT',
    skills: [
      ['Advanced Excel', 'Used for practical data preparation, analysis, formulas, pivot tables, and reporting.'],
      ['SQL Server', 'Used to query, transform, aggregate, clean, and analyze structured business data.'],
      ['Tableau', 'Used to build interactive dashboards and communicate analytical stories visually.'],
      ['Google Looker Studio', 'Used to create interactive reports and connect data into shareable business dashboards.'],
      ['Power BI', 'Used to create business intelligence reports, data models, and interactive views.'],
      ['Python', 'Used to automate analysis workflows, preprocess datasets, and support exploratory analysis.']
    ]
  },
  ai: {
    name: 'AI Specialist',
    eyebrow: 'AI Specialist Skills',
    title: 'A learning path from data-science foundations to production-oriented AI systems.',
    badge: 'IN PROGRESS',
    skills: [
      ['Python & DS Foundations', 'Used to build programming and data-science foundations for AI work.'],
      ['Data Analysis', 'Used to clean, explore, interpret, and communicate data for AI workflows.'],
      ['Stats & ML', 'Used to understand uncertainty, relationships, prediction, and machine-learning workflows.'],
      ['Deep Learning', 'Used to learn neural-network approaches for complex pattern recognition and prediction.'],
      ['NLP', 'Used to process and understand language for text-based analysis and applications.'],
      ['Transformers & LLMs', 'Used to understand modern language models, attention, and generative AI systems.'],
      ['Prompt Eng. & LLM APIs', 'Used to design effective instructions and interact with LLMs programmatically.'],
      ['LLM API Integration', 'Used to connect LLM capabilities to applications, workflows, and structured outputs.'],
      ['Agentic AI & RAG', 'Used to build AI systems that retrieve relevant knowledge and use tools to act.'],
      ['LangChain', 'Used to compose LLM workflows with prompts, retrievers, tools, memory, and application logic.'],
      ['AI Agents & MCP', 'Used to build tool-using agents and connect AI systems with external tools and context.'],
      ['Multi-Agent Systems & Production', 'Used to coordinate specialized agents and move AI solutions toward reliable production workflows.']
    ]
  }
};

function initSkillToolkit() {
  const toolkit = document.getElementById('skillToolkit');
  const orbit = toolkit?.querySelector('.skill-orbit');
  const chipLayer = document.getElementById('skillChipLayer');
  const grid = document.getElementById('skillsetGrid');
  const eyebrow = document.getElementById('skillsetEyebrow');
  const title = document.getElementById('skillsetTitle');
  const badge = document.getElementById('skillsetBadge');
  const modeName = document.getElementById('skillModeName');
  const buttons = [...document.querySelectorAll('[data-skill-mode]')];
  if (!toolkit || !orbit || !chipLayer || !grid || !buttons.length) return;

  let chips = [];
  let currentMode = 'data';
  let flowSvg = null;

  const ensureFlowSvg = () => {
    if (flowSvg) return flowSvg;
    flowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    flowSvg.classList.add('skill-flow-arrows');
    flowSvg.setAttribute('aria-hidden', 'true');
    flowSvg.setAttribute('focusable', 'false');
    orbit.insertBefore(flowSvg, chipLayer);
    return flowSvg;
  };

  const layoutChips = () => {
    const rect = orbit.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    // The viewer's choice controls the scale of the circular flow.
    // Data Analytics stays compact; the 12-step AI Specialist path gets a
    // wider ring so every skill has readable breathing room.
    const radius = (() => {
      if (size <= 420) {
        return currentMode === 'ai'
          ? Math.min(size * 0.38, size / 2 - 34)
          : Math.min(size * 0.36, size / 2 - 30);
      }
      if (size <= 620) {
        return currentMode === 'ai'
          ? Math.min(size * 0.38, size / 2 - 42)
          : Math.min(size * 0.36, size / 2 - 36);
      }
      if (size <= 760) {
        return currentMode === 'ai'
          ? Math.min(size * 0.37, size / 2 - 86)
          : Math.min(size * 0.34, size / 2 - 72);
      }
      return currentMode === 'ai'
        ? Math.max(155, size * 0.40)
        : Math.max(120, size * 0.34);
    })();
    chips.forEach((chip) => {
      chip.radius = radius;
    });
    return { size, radius };
  };

  const placeChip = (chip) => {
    const x = Math.cos(chip.angle) * chip.radius;
    const y = Math.sin(chip.angle) * chip.radius;
    chip.element.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px), 0)`;
  };

  const renderFlowArrows = (count, radius) => {
    const svg = ensureFlowSvg();
    const size = Math.min(orbit.clientWidth, orbit.clientHeight);
    const center = size / 2;
    const r = Math.min(radius + 4, center - 12);
    svg.replaceChildren();
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.style.width = `${size}px`;
    svg.style.height = `${size}px`;

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'skillFlowArrow');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '8.5');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '5');
    marker.setAttribute('markerHeight', '5');
    marker.setAttribute('orient', 'auto-start-reverse');
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrow.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    arrow.setAttribute('fill', 'currentColor');
    marker.appendChild(arrow);
    defs.appendChild(marker);
    svg.appendChild(defs);

    // Short clockwise arc between every adjacent skill, matching the
    // reference image's circular process-flow language without crossing labels.
    const step = (Math.PI * 2) / count;
    for (let i = 0; i < count; i += 1) {
      const a1 = -Math.PI / 2 + i * step + step * 0.18;
      const a2 = -Math.PI / 2 + (i + 1) * step - step * 0.18;
      const x1 = center + Math.cos(a1) * r;
      const y1 = center + Math.sin(a1) * r;
      const x2 = center + Math.cos(a2) * r;
      const y2 = center + Math.sin(a2) * r;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'rgba(115,216,199,.46)');
      path.setAttribute('stroke-width', '1.4');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('marker-end', 'url(#skillFlowArrow)');
      path.style.color = 'rgba(115,216,199,.78)';
      svg.appendChild(path);
    }
  };

  const renderMode = (mode) => {
    const set = SKILLSETS[mode] || SKILLSETS.data;
    currentMode = mode;
    toolkit.dataset.mode = mode;
    modeName.textContent = set.name;
    eyebrow.textContent = set.eyebrow;
    title.textContent = set.title;
    badge.textContent = set.badge;

    buttons.forEach((button) => {
      const active = button.dataset.skillMode === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    chipLayer.replaceChildren();
    chips = [];
    const count = set.skills.length;

    // Every toolkit now follows one clockwise circular sequence, exactly like
    // a process-flow diagram: 1 → 2 → 3 → ... → last → 1.
    set.skills.forEach(([name, use], index) => {
      const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
      const chip = document.createElement('span');
      chip.className = 'skill-chip skill-chip-outer';
      chip.textContent = name;
      chip.title = use;
      chip.setAttribute('aria-label', `${name}: ${use}`);
      chip.dataset.skill = name;
      chip.dataset.step = String(index + 1);
      chipLayer.appendChild(chip);
      chips.push({ element: chip, angle, radius: 0 });
    });

    grid.replaceChildren();
    set.skills.forEach(([name, use], index) => {
      const item = document.createElement('article');
      item.className = 'skillset-item';
      item.style.setProperty('--skill-delay', `${index * 35}ms`);
      item.innerHTML = `<div class="skillset-item-number">${String(index + 1).padStart(2, '0')}</div><div><h4>${name}</h4><p>${use}</p></div>`;
      grid.appendChild(item);
    });

    const { radius } = layoutChips();
    chips.forEach(placeChip);
    renderFlowArrows(count, radius);
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => renderMode(button.dataset.skillMode));
  });

  const resizeObserver = new ResizeObserver(() => {
    const { radius } = layoutChips();
    chips.forEach(placeChip);
    if (chips.length) renderFlowArrows(chips.length, radius);
  });
  resizeObserver.observe(orbit);

  renderMode(currentMode);
}

initSkillToolkit();

let lastFocused = null;

function finishLoader() {
  body.classList.remove('is-loading');
  body.classList.add('is-ready');
  if (loader) {
    loader.classList.add('is-done');
    loader.setAttribute('aria-hidden', 'true');
  }
}

if (reduceMotion) {
  finishLoader();
} else {
  window.setTimeout(finishLoader, 1050);
}

// Welcome appears automatically only once per browsing session.
// It must never reopen when the viewer returns from a case-study page.
window.setTimeout(() => {
  const welcomeCompleted = sessionStorage.getItem('welcomeCompleted') === 'true';
  if (!welcomeCompleted && !greetingHasOpened && !modal.classList.contains('open')) {
    openGreeting({ auto: true });
  }
}, reduceMotion ? 250 : 1250);

function createPetal(delay = 0) {
  if (!petalLayer) return;
  const p = document.createElement('span');
  p.className = 'petal';
  p.style.left = Math.random() * 100 + 'vw';
  p.style.setProperty('--drift', ((Math.random() - 0.5) * 260) + 'px');
  p.style.animationDuration = (8 + Math.random() * 10) + 's';
  p.style.animationDelay = delay + 's';
  p.style.transform = `rotate(${Math.random() * 360}deg)`;
  petalLayer.appendChild(p);
  window.setTimeout(() => p.remove(), 20000);
}

if (!reduceMotion) {
  for (let i = 0; i < 22; i++) createPetal(-Math.random() * 15);
  window.setInterval(() => createPetal(), 650);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => {
  if (reduceMotion) el.classList.add('visible');
  else revealObserver.observe(el);
});

const sections = [...document.querySelectorAll('section[data-bg]')];
const navLinks = [...document.querySelectorAll('[data-nav]')];

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) body.dataset.scene = entry.target.dataset.bg;
  });
}, { threshold: 0.45 });
sections.forEach((s) => sectionObserver.observe(s));

// Navigation scroll-spy: calculate the active section from the current scroll
// position instead of relying on IntersectionObserver entry order. This keeps
// the underline/glow reliable for every navigation item, including short or
// unusually tall sections.
const sectionIds = ['about', 'skills', 'learning', 'certificate', 'projects', 'journey', 'interests', 'contact'];
const observedNavSections = sectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);

function updateActiveNav() {
  if (!navLinks.length || !observedNavSections.length) return;

  const navHeight = nav ? nav.getBoundingClientRect().height : 76;
  const marker = window.scrollY + navHeight + Math.min(window.innerHeight * 0.18, 150);
  let activeSection = observedNavSections[0];

  for (const section of observedNavSections) {
    if (section.offsetTop <= marker) activeSection = section;
    else break;
  }

  // Near the very bottom, make Contact the active destination even if the
  // final section is shorter than the marker zone.
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
    activeSection = observedNavSections[observedNavSections.length - 1];
  }

  navLinks.forEach((link) => {
    const active = link.dataset.nav === activeSection.id;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

updateActiveNav();
let navSpyFrame = 0;
window.addEventListener('scroll', () => {
  if (navSpyFrame) return;
  navSpyFrame = requestAnimationFrame(() => {
    navSpyFrame = 0;
    updateActiveNav();
  });
}, { passive: true });
window.addEventListener('resize', updateActiveNav);

function closeMenu() {
  nav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open menu');
  body.classList.remove('menu-open');
}

function openMenu() {
  nav.classList.add('is-open');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Close menu');
  body.classList.add('menu-open');
  const first = navPanel.querySelector('a');
  if (first) first.focus();
}

navToggle.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  if (expanded) closeMenu();
  else openMenu();
});

window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const y = scrollY;
  if (progressBar) progressBar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
  nav.classList.toggle('is-scrolled', y > 24);


  }, { passive: true });


function getFocusable(container) {
  return [...container.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])')]
    .filter((el) => !el.hasAttribute('disabled') && el.getClientRects().length > 0);
}

function trapFocus(e, container) {
  if (e.key !== 'Tab') return;
  const items = getFocusable(container);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

let greetingAutoCloseTimer = null;
let greetingHasOpened = false;

function openGreeting({ auto = false } = {}) {
  greetingHasOpened = true;
  lastFocused = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  if (greetingAutoCloseTimer) window.clearTimeout(greetingAutoCloseTimer);
  greetingAutoCloseTimer = auto ? window.setTimeout(() => {
    if (modal.classList.contains('open')) closeGreeting();
  }, 15000) : null;
  window.setTimeout(() => nameInput.focus(), 160);
}

function closeGreeting() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  sessionStorage.setItem('welcomeCompleted', 'true');
  if (greetingAutoCloseTimer) {
    window.clearTimeout(greetingAutoCloseTimer);
    greetingAutoCloseTimer = null;
  }
  if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
}

document.getElementById('closeGreeting').addEventListener('click', closeGreeting);
modal.addEventListener('click', (e) => { if (e.target === modal) closeGreeting(); });
modal.addEventListener('keydown', (e) => trapFocus(e, modal));

document.getElementById('greetVisitor').addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (name) {
    greetingResult.textContent = `Hello, ${name} 👋 Welcome to Mohammed's digital portfolio.`;
    // Keep the name only for this browsing session; never persist it beyond the visit.
    sessionStorage.setItem('visitorName', name);
  } else {
    greetingResult.textContent = "Welcome 👋 Thanks for visiting Mohammed's digital portfolio.";
    sessionStorage.removeItem('visitorName');
  }
  const delay = reduceMotion ? 0 : 850;
  window.setTimeout(() => {
    // Greeting only welcomes the viewer; it must not redirect them to Projects.
    closeGreeting();
  }, delay);
});

nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('greetVisitor').click();
});

const certModal = document.getElementById('certModal');
const openCert = document.getElementById('openCert');
const closeCert = document.getElementById('closeCert');

function openCertificate() {
  lastFocused = document.activeElement;
  certModal.classList.add('open');
  certModal.setAttribute('aria-hidden', 'false');
  closeCert.focus();
}

function closeCertificate() {
  certModal.classList.remove('open');
  certModal.setAttribute('aria-hidden', 'true');
  if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
}

openCert.addEventListener('click', openCertificate);
closeCert.addEventListener('click', closeCertificate);
certModal.addEventListener('click', (e) => { if (e.target === certModal) closeCertificate(); });
certModal.addEventListener('keydown', (e) => trapFocus(e, certModal));

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (nav.classList.contains('is-open')) closeMenu();
  if (modal.classList.contains('open')) closeGreeting();
  if (certModal.classList.contains('open')) closeCertificate();
});

// sessionStorage is intentionally used for visitorName/welcomeCompleted so the
// values survive navigation within this site but are discarded when the browsing
// session/tab ends. The visitor name is optional and is never permanently persisted.

/* Profile card: cursor-reactive photo + true 3D flip to the video side. */
const profileCard = document.getElementById('profileCard');
const profileDepth = document.getElementById('photoDepth');
const profileVideo = document.getElementById('profileVideo');
const profileVideoBg = document.getElementById('profileVideoBg');
if (profileDepth && profileCard && profileVideo) {
  const videoCard = profileVideo.closest('[data-video-src]');
  const videoSrc = videoCard?.dataset.videoSrc || 'assets/profile-video.mp4';
  let lastTouchTap = 0;
  let suppressNextClick = false;
  let videoWired = false;
  let videoRunToken = 0;

  function resetProfileMotion() {
    profileDepth.style.transform = '';
    profileDepth.style.setProperty('--mx', '50%');
    profileDepth.style.setProperty('--my', '50%');
  }

  function setFlipped(flipped) {
    profileDepth.classList.toggle('is-flipped', flipped);
    profileDepth.setAttribute('aria-pressed', String(flipped));
    profileDepth.setAttribute('aria-label', flipped
      ? 'Profile video of Mohammed Manzoor Ul Hassan. Click to return to the profile photo.'
      : 'Profile photo of Mohammed Manzoor Ul Hassan, Data Analyst. Click to flip and play the profile video on desktop or double-tap on touch devices.');
  }

  function stopProfileVideo({returnToFront = true} = {}) {
    videoRunToken += 1;
    try { profileVideo.pause(); } catch (_) {}
    try { if (profileVideoBg) profileVideoBg.pause(); } catch (_) {}
    try { profileVideo.currentTime = 0; } catch (_) {}
    try { if (profileVideoBg) profileVideoBg.currentTime = 0; } catch (_) {}
    if (returnToFront) setFlipped(false);
  }

  function wireProfileVideo() {
    if (videoWired) return true;
    if (!videoSrc) return false;
    profileVideo.src = videoSrc;
    profileVideo.load();
    if (profileVideoBg) {
      profileVideoBg.src = videoSrc;
      profileVideoBg.load();
    }
    videoWired = true;
    return true;
  }

  async function playProfileVideo() {
    if (!wireProfileVideo()) return;
    const runToken = ++videoRunToken;
    setFlipped(true);
    try { profileVideo.pause(); } catch (_) {}
    try { if (profileVideoBg) profileVideoBg.pause(); } catch (_) {}
    try { profileVideo.currentTime = 0; } catch (_) {}
    try { if (profileVideoBg) profileVideoBg.currentTime = 0; } catch (_) {}

    try {
      const bgPromise = profileVideoBg?.play();
      const fgPromise = profileVideo.play();
      if (bgPromise && typeof bgPromise.catch === 'function') bgPromise.catch(() => {});
      if (fgPromise && typeof fgPromise.catch === 'function') {
        await fgPromise;
      }
    } catch (_) {
      if (runToken !== videoRunToken) return;
      stopProfileVideo();
    }
  }

  function toggleProfileCard() {
    if (profileDepth.classList.contains('is-flipped')) {
      stopProfileVideo({returnToFront: true});
    } else {
      playProfileVideo();
    }
  }

  profileVideo.addEventListener('timeupdate', () => {
    if (!profileVideoBg || !videoWired || profileVideoBg.seeking) return;
    if (Math.abs(profileVideoBg.currentTime - profileVideo.currentTime) > 0.08) {
      try { profileVideoBg.currentTime = profileVideo.currentTime; } catch (_) {}
    }
  });
  profileVideo.addEventListener('ended', () => stopProfileVideo({returnToFront: true}));
  profileVideo.addEventListener('error', () => stopProfileVideo({returnToFront: true}));
  profileVideoBg?.addEventListener('error', () => {});

  profileDepth.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
      toggleProfileCard();
      return;
    }
    if (e.pointerType === 'touch') {
      const now = performance.now();
      if (now - lastTouchTap < 520) {
        lastTouchTap = 0;
        suppressNextClick = true;
        toggleProfileCard();
      } else {
        lastTouchTap = now;
        suppressNextClick = false;
      }
    }
  });

  profileDepth.addEventListener('click', () => {
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
    /* Mouse/pen pointerup already handles desktop; touch requires double-tap. */
  });

  profileDepth.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    toggleProfileCard();
  });

  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    profileDepth.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = profileDepth.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      profileDepth.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
      profileDepth.style.setProperty('--my', `${(y + 0.5) * 100}%`);
      profileDepth.style.transform = `perspective(1200px) rotateX(${y * -4.2}deg) rotateY(${x * 4.2}deg) translateY(-7px) scale(1.012)`;
    });
    profileDepth.addEventListener('pointerleave', resetProfileMotion);
  }
}

if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
      card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
      card.style.transform = `perspective(1100px) rotateX(${y * -2.2}deg) rotateY(${x * 2.2}deg) translateY(-7px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    });
  });
}

if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.interest-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
      card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
      card.style.transform = `perspective(1100px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateY(-8px) scale(1.01)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    });
  });
}

function scrollToAnchor(target) {
  if (!target) return;
  const navHeight = nav ? nav.getBoundingClientRect().height : 0;
  const offset = Math.max(navHeight + 18, 94);
  const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
  window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
}

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    let target;
    try { target = document.querySelector(href); } catch { return; }
    if (!target) return;
    e.preventDefault();
    closeMenu();
    scrollToAnchor(target);
  });
});


const projectCards = [...document.querySelectorAll('.project-card')];

function restoreProjectPosition() {
  try {
    const raw = sessionStorage.getItem('portfolioReturn');
    if (!raw) return;
    const state = JSON.parse(raw);
    if (!Number.isFinite(state.scrollY)) return;
    sessionStorage.removeItem('portfolioReturn');

    const applyPosition = () => {
      window.scrollTo({ top: state.scrollY, behavior: 'auto' });
    };

    // Apply after fonts/layout are ready, then repeat after lazy project images
    // have had a chance to settle so the viewer lands where they left off.
    const settle = () => {
      requestAnimationFrame(() => requestAnimationFrame(applyPosition));
      window.setTimeout(applyPosition, 350);
      window.setTimeout(applyPosition, 900);
    };

    if (document.readyState === 'complete') settle();
    else window.addEventListener('load', settle, { once: true });
  } catch (_) { /* Ignore storage/parsing failures. */ }
}

if (window.location.hash === '#projects' || document.referrer.includes('/projects/')) {
  restoreProjectPosition();
}

const projectJumpLinks = [...document.querySelectorAll('.project-nav a')];
if (projectCards.length && projectJumpLinks.length) {
  const projectNavObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      projectJumpLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('is-active', active);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0.01 });
  projectCards.forEach((card) => projectNavObserver.observe(card));
}


// Phase 4 final polish: copy-to-clipboard and back-to-top.

const backToTop = document.getElementById('backToTop');
if (backToTop) {
  const updateBackToTop = () => {
    backToTop.classList.toggle('is-visible', window.scrollY > Math.max(500, innerHeight * 0.65));
  };
  updateBackToTop();
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}
