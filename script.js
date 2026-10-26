const body = document.body;
const progressBar = document.getElementById('progressBar');
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
const mobileThemeTrigger = document.getElementById('mobileThemeTrigger');
const mobileThemeMenu = document.getElementById('mobileThemeMenu');
const themeOptions = [...document.querySelectorAll('[data-theme-choice]')];
const autoThemeOptions = [...document.querySelectorAll('[data-theme-auto]')];
const VALID_THEMES = new Set(['midnight', 'aurora', 'emerald', 'cosmic', 'light']);
const AUTO_THEME_ORDER = ['midnight', 'aurora', 'emerald', 'cosmic', 'light'];
const AUTO_THEME_INTERVAL = 30000;
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let themeMode = 'auto';
let autoThemeTimer = 0;
let autoThemeGeneration = 0;

function syncThemeOptionState(theme) {
  const autoSelected = themeMode === 'auto';
  autoThemeOptions.forEach((option) => {
    option.classList.toggle('is-selected', autoSelected);
    option.setAttribute('aria-checked', String(autoSelected));
  });
  themeOptions.forEach((option) => {
    const selected = !autoSelected && option.dataset.themeChoice === theme;
    option.classList.toggle('is-selected', selected);
    option.setAttribute('aria-checked', String(selected));
  });
}

function applyTheme(theme, { persist = true } = {}) {
  const next = VALID_THEMES.has(theme) ? theme : 'midnight';
  body.dataset.theme = next;
  document.documentElement.style.colorScheme = next === 'light' ? 'light' : 'dark';
  const meta = document.getElementById('themeColorMeta');
  if (meta) meta.setAttribute('content', THEME_META_COLORS[next]);
  syncThemeOptionState(next);
  if (persist) {
    try { sessionStorage.setItem('portfolioTheme', next); } catch (_) { /* session storage may be blocked */ }
  }
}

function stopAutoTheme() {
  window.clearTimeout(autoThemeTimer);
  autoThemeTimer = 0;
  autoThemeGeneration += 1;
}

function scheduleAutoTheme(generation) {
  if (themeMode !== 'auto' || motionPreference.matches || document.hidden) return;
  autoThemeTimer = window.setTimeout(() => {
    autoThemeTimer = 0;
    if (generation !== autoThemeGeneration || themeMode !== 'auto') return;
    const currentIndex = AUTO_THEME_ORDER.indexOf(body.dataset.theme);
    applyTheme(AUTO_THEME_ORDER[(currentIndex + 1) % AUTO_THEME_ORDER.length]);
    scheduleAutoTheme(generation);
  }, AUTO_THEME_INTERVAL);
}

function selectManualTheme(theme) {
  stopAutoTheme();
  themeMode = 'manual';
  try { sessionStorage.setItem('portfolioThemeMode', 'manual'); } catch (_) { /* session storage may be blocked */ }
  applyTheme(theme);
}

function selectAutoTheme() {
  stopAutoTheme();
  themeMode = 'auto';
  try { sessionStorage.setItem('portfolioThemeMode', 'auto'); } catch (_) { /* session storage may be blocked */ }
  applyTheme(AUTO_THEME_ORDER[0]);
  scheduleAutoTheme(autoThemeGeneration);
}

function closeThemeMenu(menu = themeMenu, trigger = themeTrigger) {
  if (!menu || !trigger) return;
  menu.hidden = true;
  trigger.setAttribute('aria-expanded', 'false');
}

function openThemeMenu(menu, trigger) {
  if (!menu || !trigger) return;
  if (themeMenu && themeMenu !== menu) closeThemeMenu(themeMenu, themeTrigger);
  if (mobileThemeMenu && mobileThemeMenu !== menu) closeThemeMenu(mobileThemeMenu, mobileThemeTrigger);
  menu.hidden = false;
  trigger.setAttribute('aria-expanded', 'true');
  menu.querySelector('[role="menuitemradio"][aria-checked="true"]')?.focus();
}

let savedTheme = 'midnight';
try {
  const sessionTheme = sessionStorage.getItem('portfolioTheme');
  if (VALID_THEMES.has(sessionTheme)) savedTheme = sessionTheme;
  const savedMode = sessionStorage.getItem('portfolioThemeMode');
  const defaultModeInitialized = sessionStorage.getItem('portfolioThemeDefaultInitialized') === 'true';
  if (!defaultModeInitialized) {
    themeMode = 'auto';
    savedTheme = 'midnight';
    sessionStorage.setItem('portfolioThemeMode', 'auto');
    sessionStorage.setItem('portfolioTheme', 'midnight');
    sessionStorage.setItem('portfolioThemeDefaultInitialized', 'true');
  } else {
    themeMode = savedMode === 'manual' ? 'manual' : 'auto';
    if (savedMode !== 'manual' && savedMode !== 'auto') {
      savedTheme = 'midnight';
      sessionStorage.setItem('portfolioThemeMode', 'auto');
    }
  }
} catch (_) { /* use default */ }
applyTheme(savedTheme, { persist: false });
if (themeMode === 'auto') scheduleAutoTheme(autoThemeGeneration);

motionPreference.addEventListener('change', () => {
  stopAutoTheme();
  if (themeMode === 'auto') scheduleAutoTheme(autoThemeGeneration);
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    window.clearTimeout(autoThemeTimer);
    autoThemeTimer = 0;
  } else if (themeMode === 'auto') {
    scheduleAutoTheme(autoThemeGeneration);
  }
});

/* —— Theme-aware neural network background —— */
(() => {
  const canvas = document.getElementById('neuralNetworkCanvas');
  if (!canvas || canvas.dataset.initialized === 'true') return;
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;
  canvas.dataset.initialized = 'true';

  const palettes = {
    midnight: { rgb: '115,216,199', line: .18, nodeAlpha: .64, glowAlpha: .34, glowBlur: 8 },
    aurora: { rgb: '102,231,239', line: .19, nodeAlpha: .64, glowAlpha: .34, glowBlur: 8 },
    emerald: { rgb: '85,224,193', line: .18, nodeAlpha: .64, glowAlpha: .34, glowBlur: 8 },
    cosmic: { rgb: '160,157,255', line: .19, nodeAlpha: .64, glowAlpha: .34, glowBlur: 8 },
    light: { rgb: '24,95,208', lineRgb: '0,155,224', line: .30, nodeAlpha: .94, glowAlpha: .78, glowBlur: 10 }
  };
  const mobileQuery = window.matchMedia('(max-width: 700px)');
  const tabletQuery = window.matchMedia('(min-width: 701px) and (max-width: 1024px)');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointerQuery = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
  let motionReduced = motionQuery.matches;
  let width = 0;
  let height = 0;
  let particles = [];
  let frameId = 0;
  let resizeFrameId = 0;
  let lastFrame = 0;
  const pointer = { x: 0, y: 0, active: false };

  const getNetworkProfile = () => {
    const compactViewport = mobileQuery.matches || (width <= 900 && height <= 500);
    if (compactViewport) return { count: 25, connection: 135, nodeRadius: 1.9, lineWidth: 1.1 };
    if (tabletQuery.matches) return { count: 42, connection: 160, nodeRadius: 2, lineWidth: 1.15 };
    return { count: 60, connection: 192, nodeRadius: 2.1, lineWidth: 1.2 };
  };

  const createParticles = (count) => {
    const rows = Math.max(1, Math.round(Math.sqrt(count * height / Math.max(width, 1))));
    const basePerRow = Math.floor(count / rows);
    const extraRows = count % rows;
    const result = [];
    for (let row = 0; row < rows; row += 1) {
      const rowCount = basePerRow + (row < extraRows ? 1 : 0);
      for (let column = 0; column < rowCount; column += 1) {
        const cellWidth = width / rowCount;
        const cellHeight = height / rows;
        result.push({
          x: (column + .25 + Math.random() * .5) * cellWidth,
          y: (row + .25 + Math.random() * .5) * cellHeight,
          vx: (Math.random() - .5) * .012,
          vy: (Math.random() - .5) * .012
        });
      }
    }
    return result;
  };

  const resizeCanvas = () => {
    const previousWidth = width;
    const previousHeight = height;
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { count } = getNetworkProfile();
    if (particles.length === count && previousWidth > 0 && previousHeight > 0) {
      const scaleX = width / previousWidth;
      const scaleY = height / previousHeight;
      particles.forEach((particle) => {
        particle.x *= scaleX;
        particle.y *= scaleY;
      });
    } else {
      particles = createParticles(count);
    }
    drawNetwork(0, false);
  };

  const scheduleResize = () => {
    if (resizeFrameId) return;
    resizeFrameId = window.requestAnimationFrame(() => {
      resizeFrameId = 0;
      resizeCanvas();
    });
  };

  let dprQuery;
  const refreshDprQuery = () => {
    if (dprQuery) dprQuery.removeEventListener('change', onDprChange);
    dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    dprQuery.addEventListener('change', onDprChange);
  };
  const onDprChange = () => {
    scheduleResize();
    refreshDprQuery();
  };
  refreshDprQuery();

  const drawNetwork = (time, animate) => {
    context.clearRect(0, 0, width, height);
    const palette = palettes[body.dataset.theme] || palettes.midnight;
    const profile = getNetworkProfile();
    const maxDistance = profile.connection;
    const delta = lastFrame ? Math.min(time - lastFrame, 32) : 16.7;
    if (animate) lastFrame = time;

    const points = particles.map((particle) => {
      if (animate) {
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;
        particle.x = Math.max(0, Math.min(width, particle.x));
        particle.y = Math.max(0, Math.min(height, particle.y));
      }

      let x = particle.x;
      let y = particle.y;
      if (!motionReduced && pointer.active) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < 150) {
          const shift = ((150 - distance) / 150) * 7;
          x += (dx / distance) * shift;
          y += (dy / distance) * shift;
        }
      }
      return { x, y };
    });

    context.lineWidth = profile.lineWidth + (body.dataset.theme === 'light' ? .15 : 0);
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const distance = Math.hypot(dx, dy);
        if (distance >= maxDistance) continue;
        context.strokeStyle = `rgba(${palette.lineRgb || palette.rgb}, ${(1 - distance / maxDistance) * palette.line})`;
        context.beginPath();
        context.moveTo(points[i].x, points[i].y);
        context.lineTo(points[j].x, points[j].y);
        context.stroke();
      }
    }

    context.fillStyle = `rgba(${palette.rgb}, ${palette.nodeAlpha})`;
    context.shadowColor = `rgba(${palette.rgb}, ${palette.glowAlpha})`;
    context.shadowBlur = palette.glowBlur;
    points.forEach(({ x, y }) => {
      context.beginPath();
      context.arc(x, y, profile.nodeRadius, 0, Math.PI * 2);
      context.fill();
    });
    context.shadowBlur = 0;
  };

  const animate = (time) => {
    frameId = 0;
    if (document.hidden || motionReduced) return;
    drawNetwork(time, true);
    frameId = window.requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    if (!motionReduced && !document.hidden && !frameId) {
      lastFrame = 0;
      frameId = window.requestAnimationFrame(animate);
    }
  };

  const stopAnimation = () => {
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    lastFrame = 0;
  };

  window.addEventListener('resize', scheduleResize, { passive: true });
  window.addEventListener('orientationchange', scheduleResize, { passive: true });
  window.visualViewport?.addEventListener('resize', scheduleResize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAnimation();
    else {
      scheduleResize();
      startAnimation();
    }
  });
  window.addEventListener('pageshow', scheduleResize, { passive: true });
  motionQuery.addEventListener('change', (event) => {
    motionReduced = event.matches;
    if (motionReduced) {
      stopAnimation();
      drawNetwork(0, false);
    } else {
      startAnimation();
    }
  });
  mobileQuery.addEventListener('change', scheduleResize);
  tabletQuery.addEventListener('change', scheduleResize);
  new MutationObserver(() => {
    if (motionReduced) drawNetwork(0, false);
  }).observe(body, { attributes: true, attributeFilter: ['data-theme'] });

  const onPointerMove = (event) => {
      if (event.pointerType === 'touch') return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
  };
  const onPointerLeave = () => { pointer.active = false; };
  let pointerListenersActive = false;
  const syncPointerListeners = () => {
    if (pointerQuery.matches && !pointerListenersActive) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerleave', onPointerLeave, { passive: true });
      pointerListenersActive = true;
    } else if (!pointerQuery.matches && pointerListenersActive) {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      pointer.active = false;
      pointerListenersActive = false;
    }
  };
  pointerQuery.addEventListener('change', syncPointerListeners);
  syncPointerListeners();

  resizeCanvas();
  startAnimation();
})();

[[themeTrigger, themeMenu]].forEach(([trigger, menu]) => {
  if (!trigger || !menu) return;
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (menu.hidden) openThemeMenu(menu, trigger);
    else closeThemeMenu(menu, trigger);
  });
});

const activateThemeOption = (option) => {
  if (option.hasAttribute('data-theme-auto')) selectAutoTheme();
  else selectManualTheme(option.dataset.themeChoice);
  closeThemeMenu(themeMenu, themeTrigger);
  closeThemeMenu(mobileThemeMenu, mobileThemeTrigger);
};

[...themeOptions, ...autoThemeOptions].forEach((option) => {
  option.addEventListener('click', () => activateThemeOption(option));
  option.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const menu = option.closest('[role="menu"]');
      const trigger = menu === mobileThemeMenu ? mobileThemeTrigger : themeTrigger;
      closeThemeMenu(menu, trigger);
      trigger?.focus();
      return;
    }

    const menu = option.closest('[role="menu"]');
    const items = menu ? [...menu.querySelectorAll('[role="menuitemradio"]')] : [];
    const index = items.indexOf(option);
    if (index < 0) return;

    let nextIndex;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % items.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + items.length) % items.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = items.length - 1;
    else return;

    event.preventDefault();
    items[nextIndex].focus();
  });
});

document.addEventListener('click', (e) => {
  if (nav?.classList.contains('is-open') && !navPanel?.contains(e.target) && !navToggle?.contains(e.target)) closeMenu();
  if (themeMenu && !themeMenu.hidden && !themeMenu.contains(e.target) && !themeTrigger?.contains(e.target)) closeThemeMenu(themeMenu, themeTrigger);
  if (mobileThemeMenu && !mobileThemeMenu.hidden && !mobileThemeMenu.contains(e.target) && !mobileThemeTrigger?.contains(e.target)) closeThemeMenu(mobileThemeMenu, mobileThemeTrigger);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeThemeMenu(themeMenu, themeTrigger);
    closeThemeMenu(mobileThemeMenu, mobileThemeTrigger);
  }
});

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
    name: 'Data Analysis',
    eyebrow: 'Data Analysis Skills',
    title: 'Tools I use to prepare, query, analyze, and communicate data.',
    badge: 'DATA ANALYSIS',
    skills: [
      ['Excel', 'Used for practical data preparation, analysis, formulas, pivot tables, and reporting.', 'Can demonstrate'],
      ['SQL Server', 'Used to query, transform, aggregate, clean, and analyze structured business data.', 'Can demonstrate'],
      ['Python', 'Used to automate analysis workflows and preprocess datasets.', 'Can demonstrate'],
      ['Pandas & NumPy', 'Used for data manipulation, numerical analysis, and exploratory workflows.', 'Can demonstrate'],
      ['Power BI & DAX', 'Used to create business intelligence reports, data models, measures, and interactive views.', 'Can demonstrate'],
      ['Tableau', 'Used to build interactive dashboards and communicate analytical stories visually.', 'Can demonstrate'],
      ['Google Looker Studio', 'Used to create interactive reports and connect data into shareable business dashboards.', 'Can demonstrate'],
      ['Data Cleaning', 'Used to clean and transform datasets; shown in the Retail Sales & Profit Performance project.', 'Can demonstrate'],
      ['EDA', 'Used for exploratory data analysis to explore and interpret datasets to uncover useful patterns.', 'Can demonstrate']
    ]
  },
  ai: {
    name: 'AI Specialist',
    eyebrow: 'AI Specialist Skills',
    title: 'A learning path from data-science foundations to production-oriented AI systems.',
    badge: 'CURRENTLY LEARNING',
    groups: [
      { label: 'AI & Machine Learning Foundations', status: 'Currently learning', skills: [
        ['Python & DS Foundations', 'Used to build programming and data-science foundations for AI work.'],
        ['Data Analysis', 'Used to clean, explore, interpret, and communicate data for AI workflows.'],
        ['Stats & ML', 'Used to understand uncertainty, relationships, prediction, and machine-learning workflows.'],
        ['Deep Learning', 'Used to learn neural-network approaches for complex pattern recognition and prediction.']
      ]},
      { label: 'Generative AI & LLMs', status: 'Currently learning', skills: [
        ['NLP', 'Used to process and understand language for text-based analysis and applications.'],
        ['LLMs & Transformers', 'Used to understand modern language models, transformer architectures, and generative AI systems.'],
        ['LLM API Integration', 'Used to connect LLM capabilities to applications, workflows, and structured outputs.'],
        ['Prompt Engineering', 'Used to design, test, and refine prompts to guide useful and reliable model responses.']
      ]},
      { label: 'Agentic AI & RAG', status: 'Currently learning', skills: [
        ['Agentic AI & RAG', 'Used to build AI systems that retrieve relevant knowledge and take tool-assisted actions.'],
        ['LangChain', 'Used to compose LLM workflows with prompts, retrievers, tools, memory, and application logic.'],
        ['AI Agents & MCP', 'Used to build tool-using agents and connect AI systems with external tools and context through MCP.']
      ]},
      { label: 'Multi-Agent Systems & Production', status: 'Currently learning', skills: [
        ['Multi-Agent Systems & Production', 'Used to coordinate specialized agents and move AI solutions toward reliable production workflows.'],
      ]}
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
  let currentMode = 'ai';
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
    const count = chips.length;
    if (!size || !count) return 0;
    const maxChipWidth = Math.max(42, Math.min(190, size * 0.84 * Math.sin(Math.PI / count)));
    chips.forEach((chip) => {
      chip.element.style.setProperty('--skill-chip-max-width', maxChipWidth.toFixed(1) + 'px');
    });
    const widestChip = chips.reduce((widest, chip) => Math.max(widest, chip.element.getBoundingClientRect().width), 0);
    const tallestChip = chips.reduce((tallest, chip) => Math.max(tallest, chip.element.getBoundingClientRect().height), 0);
    const safeRadius = Math.max(0, size / 2 - Math.max(widestChip, tallestChip) / 2 - 8);
    let radius = Math.min(size * 0.46, safeRadius);
    const spans = chips.map((chip) => {
      const rect = chip.element.getBoundingClientRect();
      return rect.width * Math.abs(Math.sin(chip.baseAngle)) + rect.height * Math.abs(Math.cos(chip.baseAngle)) + 6;
    });
    const totalSpan = spans.reduce((total, span) => total + span, 0);
    let angle = chips[0].baseAngle;
    chips.forEach((chip, index) => {
      chip.radius = radius;
      chip.angle = angle;
      const next = (index + 1) % chips.length;
      angle += ((spans[index] + spans[next]) / 2 / totalSpan) * Math.PI * 2;
    });
    if (toolkit.dataset.mode === 'ai' && window.matchMedia('(max-width: 600px)').matches) {
      const orbitCenterX = rect.left + size / 2;
      const maxRadius = Math.min(orbitCenterX, window.innerWidth - orbitCenterX) - widestChip / 2 - 3;
      const center = toolkit.querySelector('.skill-center').getBoundingClientRect();
      const minimumGapAt = (candidateRadius) => {
        const boxes = chips.map((chip) => {
          const box = chip.element.getBoundingClientRect();
          const x = orbitCenterX + Math.cos(chip.angle) * candidateRadius;
          const y = rect.top + size / 2 + Math.sin(chip.angle) * candidateRadius;
          return { left: x - box.width / 2, right: x + box.width / 2, top: y - box.height / 2, bottom: y + box.height / 2 };
        });
        if (boxes.some((box) => box.left < center.right && box.right > center.left && box.top < center.bottom && box.bottom > center.top)) return 0;
        let minimumGap = Infinity;
        boxes.forEach((box, index) => {
          boxes.slice(index + 1).forEach((other) => {
            const gapX = Math.max(box.left - other.right, other.left - box.right, 0);
            const gapY = Math.max(box.top - other.bottom, other.top - box.bottom, 0);
            minimumGap = Math.min(minimumGap, Math.hypot(gapX, gapY));
          });
        });
        return minimumGap;
      };
      for (let candidateRadius = radius; candidateRadius <= maxRadius; candidateRadius += 0.25) {
        const gap = minimumGapAt(candidateRadius);
        if (gap >= 5 && gap <= 6) {
          radius = candidateRadius;
          break;
        }
      }
    }
    chips.forEach((chip) => { chip.radius = radius; });
    orbit.style.setProperty('--skill-ring-diameter', (radius * 2).toFixed(1) + 'px');
    return radius;
  };

  const placeChip = (chip) => {
    const x = Math.cos(chip.angle) * chip.radius;
    const y = Math.sin(chip.angle) * chip.radius;
    chip.element.style.setProperty('transform', 'translate3d(calc(-50% + ' + x.toFixed(2) + 'px), calc(-50% + ' + y.toFixed(2) + 'px), 0)', 'important');
  };

  const renderFlowArrows = () => {
    const svg = ensureFlowSvg();
    const size = Math.min(orbit.clientWidth, orbit.clientHeight);
    if (!size) return;
    const center = size / 2;
    svg.replaceChildren();
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.style.width = size + 'px';
    svg.style.height = size + 'px';

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

    // Keep one clockwise circular flow in both toolkit modes.
    const ringRadius = chips[0]?.radius ?? 0;
    const r = Math.min(ringRadius + 4, center - 12);
    chips.forEach((_, index) => {
      const a1 = chips[index].angle;
      let a2 = chips[(index + 1) % chips.length].angle;
      if (a2 <= a1) a2 += Math.PI * 2;
      const segment = a2 - a1;
      const startAngle = a1 + segment * 0.18;
      const endAngle = a2 - segment * 0.18;
      const x1 = center + Math.cos(startAngle) * r;
      const y1 = center + Math.sin(startAngle) * r;
      const x2 = center + Math.cos(endAngle) * r;
      const y2 = center + Math.sin(endAngle) * r;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M ' + x1.toFixed(2) + ' ' + y1.toFixed(2) + ' A ' + r.toFixed(2) + ' ' + r.toFixed(2) + ' 0 0 1 ' + x2.toFixed(2) + ' ' + y2.toFixed(2));
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'rgba(115,216,199,.46)');
      path.setAttribute('stroke-width', '1.4');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('marker-end', 'url(#skillFlowArrow)');
      path.style.color = 'rgba(115,216,199,.78)';
      svg.appendChild(path);
    });
  };
  const renderMode = (mode) => {
    const set = SKILLSETS[mode] || SKILLSETS.data;
    const skillGroups = set.groups || [{ label: '', skills: set.skills || [] }];
    const skills = skillGroups.flatMap((group) => group.skills);
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
    const ringSkills = [...new Map(skills.map((skill) => [skill[0].trim().toLocaleLowerCase(), skill])).values()];
    const count = ringSkills.length;

    // Every toolkit skill appears once around one responsive circular path.
    ringSkills.forEach(([name, use], index) => {
      const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
      const chip = document.createElement('span');
      chip.className = 'skill-chip skill-chip-outer';
      chip.textContent = name;
      chip.title = use;
      chip.setAttribute('aria-label', name + ': ' + use);
      chip.dataset.skill = name;
      chip.dataset.step = String(index + 1);
      chipLayer.appendChild(chip);
      chips.push({ element: chip, angle, baseAngle: angle, radius: 0 });
    });
    grid.replaceChildren();
    let skillIndex = 0;
    skillGroups.forEach((group) => {
      if (group.label) {
        const heading = document.createElement('p');
        heading.className = 'eyebrow';
        heading.textContent = group.label;
        heading.style.gridColumn = '1 / -1';
        grid.appendChild(heading);
      }
      group.skills.forEach(([name, use, status]) => {
        const item = document.createElement('article');
        item.className = 'skillset-item';
        item.style.setProperty('--skill-delay', `${skillIndex * 35}ms`);
        skillIndex += 1;
        const itemStatus = status || group.status || "";
        const statusMarkup = itemStatus ? `<span class="skillset-status">${itemStatus}</span>` : "";
        item.innerHTML = `<div class="skillset-item-number">${String(skillIndex).padStart(2, '0')}</div><div><h4>${name}</h4>${statusMarkup}<p>${use}</p></div>`;
        grid.appendChild(item);
      });
    });
    layoutChips();
    chips.forEach(placeChip);
    renderFlowArrows();
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => renderMode(button.dataset.skillMode));
  });

  const resizeObserver = new ResizeObserver(() => {
    layoutChips();
    chips.forEach(placeChip);
    if (chips.length) renderFlowArrows();
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

const spotlight = document.getElementById('cursorSpotlight');
const canTrackSpotlight = spotlight
  && !reduceMotion
  && window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches;

if (canTrackSpotlight) {
  let pointerX = -1000;
  let pointerY = -1000;
  let spotlightFrame = 0;

  window.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (spotlightFrame) return;

    spotlightFrame = window.requestAnimationFrame(() => {
      spotlight.style.setProperty('--spotlight-x', pointerX + 'px');
      spotlight.style.setProperty('--spotlight-y', pointerY + 'px');
      spotlightFrame = 0;
    });
  }, { passive: true });
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
const sectionIds = ['about', 'learning', 'skills', 'projects', 'journey', 'interests', 'certificate', 'education', 'contact'];
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
  if (!nav || !navToggle) return;
  nav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open menu');
  body.classList.remove('menu-open');
}

function openMenu() {
  if (!nav || !navToggle || !navPanel) return;
  closeThemeMenu(mobileThemeMenu, mobileThemeTrigger);
  nav.classList.add('is-open');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Close menu');
  body.classList.add('menu-open');
}

if (navToggle) {
  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    if (expanded) closeMenu();
    else openMenu();
  });
}

// Keep the two phone dropdowns independent. Tapping Theme closes Menu first.
if (mobileThemeTrigger) {
  mobileThemeTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenu();
    const expanded = mobileThemeTrigger.getAttribute('aria-expanded') === 'true';
    if (expanded) closeThemeMenu(mobileThemeMenu, mobileThemeTrigger);
    else openThemeMenu(mobileThemeMenu, mobileThemeTrigger);
  });
}

// Close the mobile menu when a navigation item is selected.
document.querySelectorAll('#primaryNav .nav-links a').forEach((link) => {
  link.addEventListener('click', closeMenu);
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

/* Profile card: robust single-click / double-click / tap interaction. */
const profileCard = document.getElementById('profileCard');
const profileDepth = document.getElementById('photoDepth');
const profileVideo = document.getElementById('profileVideo');
const companionTag = document.getElementById('aiCompanionTag');
const companionMessage = companionTag?.querySelector('[aria-live="polite"]');
if (profileDepth && profileCard && profileVideo) {
  const videoCard = profileVideo.closest('[data-video-src]');
  const videoSrc = videoCard?.dataset.videoSrc || 'assets/profile-video.mp4';
  let videoWired = false;
  let videoRunToken = 0;
  let interactionLockUntil = 0;

  profileVideo.muted = true;
  profileVideo.setAttribute('muted', '');
  profileVideo.playsInline = true;
  profileVideo.setAttribute('playsinline', '');

  function resetProfileMotion() {
    profileDepth.style.transform = '';
    profileDepth.style.setProperty('--mx', '50%');
    profileDepth.style.setProperty('--my', '50%');
  }

  function setFlipped(flipped) {
    profileDepth.classList.toggle('is-flipped', flipped);
    profileDepth.classList.add('is-flipping');
    profileDepth.setAttribute('aria-pressed', String(flipped));
    profileDepth.setAttribute('aria-label', flipped
      ? 'Profile video of Mohammed Manzoor Ul Hassan. Tap or click to return to the profile photo.'
      : 'Profile photo of Mohammed Manzoor Ul Hassan, Data Analyst. Tap or click to play the profile video.');
    if (companionMessage) {
      companionMessage.textContent = flipped
        ? '✨ Secret unlocked'
        : '🤖 Tap to discover';
    }
    window.clearTimeout(setFlipped._timer);
    setFlipped._timer = window.setTimeout(() => profileDepth.classList.remove('is-flipping'), 700);
  }

  function stopProfileVideo({returnToFront = true} = {}) {
    videoRunToken += 1;
    try { profileVideo.pause(); } catch (_) {}
    try { profileVideo.currentTime = 0; } catch (_) {}
    if (returnToFront) {
      setFlipped(false);
      resetProfileMotion();
    }
  }

  function wireProfileVideo() {
    if (videoWired) return true;
    if (!videoSrc) return false;
    // The source is already present in the markup. Avoid loading the media
    // during the click/flip gesture, which can compete with the 3D transition.
    if (!profileVideo.currentSrc) {
      profileVideo.src = videoSrc;
      profileVideo.load();
    }
    videoWired = true;
    return true;
  }

  async function playProfileVideo() {
    if (!wireProfileVideo()) return;
    const runToken = ++videoRunToken;
    setFlipped(true);
    resetProfileMotion();
    try { profileVideo.pause(); } catch (_) {}
    try { profileVideo.currentTime = 0; } catch (_) {}

    try {
      await profileVideo.play();
    } catch (error) {
      if (runToken !== videoRunToken) return;
      // A browser may reject playback for policy reasons. Keep the flip visible
      // rather than immediately snapping the card back and looking broken.
      profileDepth.dataset.videoState = 'blocked';
    }
  }

  function toggleProfileCard() {
    const now = performance.now();
    // A double-click/tap generates two click events. Treat the second event as
    // part of the same gesture so the card never flips twice and cancels itself.
    if (now < interactionLockUntil) return;
    interactionLockUntil = now + 380;
    if (profileDepth.classList.contains('is-flipped')) stopProfileVideo();
    else playProfileVideo();
  }

  companionTag?.addEventListener('click', toggleProfileCard);

  profileVideo.addEventListener('ended', () => stopProfileVideo({returnToFront: true}));
  profileVideo.addEventListener('error', () => {
    profileDepth.dataset.videoState = 'error';
    stopProfileVideo({returnToFront: true});
  });

  // One click handler works for mouse, pen and touch. The short interaction
  // lock above makes both single-click and double-click/tap reliable.
  profileDepth.addEventListener('click', (e) => {
    e.preventDefault();
    toggleProfileCard();
  });

  profileDepth.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    toggleProfileCard();
  });

  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    profileDepth.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || profileDepth.classList.contains('is-flipped') || profileDepth.classList.contains('is-flipping')) return;
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
