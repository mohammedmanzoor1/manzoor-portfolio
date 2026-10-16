(() => {
  const body = document.body;
  const trigger = document.getElementById('themeTrigger');
  const menu = document.getElementById('themeMenu');
  const options = [...document.querySelectorAll('[data-theme-choice]')];
  const autoOptions = [...document.querySelectorAll('[data-theme-auto]')];
  const modeLabel = document.getElementById('themeModeLabel');
  const meta = document.getElementById('themeColorMeta');
  const VALID = new Set(['midnight', 'aurora', 'emerald', 'cosmic', 'light']);
  const ORDER = ['midnight', 'aurora', 'emerald', 'cosmic', 'light'];
  const INTERVAL = 30000;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const META = {
    midnight: '#080b12',
    aurora: '#0b1630',
    emerald: '#09211f',
    cosmic: '#1a1230',
    light: '#d9efff'
  };
  let themeMode = 'auto';
  let timer = 0;
  let generation = 0;

  const syncOptionState = (theme) => {
    const autoSelected = themeMode === 'auto';
    autoOptions.forEach((option) => {
      option.classList.toggle('is-selected', autoSelected);
      option.setAttribute('aria-checked', String(autoSelected));
    });
    options.forEach((option) => {
      const selected = !autoSelected && option.dataset.themeChoice === theme;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-checked', String(selected));
    });
    const control = trigger?.closest('.case-theme-control');
    if (control) control.dataset.mode = themeMode;
    if (modeLabel) modeLabel.textContent = themeMode === 'auto' ? 'AUTO' : 'MANUAL';
  };

  const applyTheme = (theme, persist = true) => {
    const next = VALID.has(theme) ? theme : 'midnight';
    body.dataset.theme = next;
    document.documentElement.style.colorScheme = next === 'light' ? 'light' : 'dark';
    if (meta) meta.setAttribute('content', META[next]);
    syncOptionState(next);
    if (persist) {
      try { sessionStorage.setItem('portfolioTheme', next); } catch (_) { /* storage may be blocked */ }
    }
  };

  const stopAutoTheme = () => {
    window.clearTimeout(timer);
    timer = 0;
    generation += 1;
  };

  const scheduleAutoTheme = (activeGeneration) => {
    if (themeMode !== 'auto' || motionPreference.matches || document.hidden || timer) return;
    timer = window.setTimeout(() => {
      timer = 0;
      if (activeGeneration !== generation || themeMode !== 'auto') return;
      const currentIndex = ORDER.indexOf(body.dataset.theme);
      applyTheme(ORDER[(currentIndex + 1) % ORDER.length]);
      scheduleAutoTheme(activeGeneration);
    }, INTERVAL);
  };

  const selectManualTheme = (theme) => {
    stopAutoTheme();
    themeMode = 'manual';
    try { sessionStorage.setItem('portfolioThemeMode', 'manual'); } catch (_) { /* storage may be blocked */ }
    applyTheme(theme);
  };

  const selectAutoTheme = () => {
    stopAutoTheme();
    themeMode = 'auto';
    try { sessionStorage.setItem('portfolioThemeMode', 'auto'); } catch (_) { /* storage may be blocked */ }
    applyTheme(ORDER[0]);
    scheduleAutoTheme(generation);
  };

  let savedTheme = 'midnight';
  try {
    const storedTheme = sessionStorage.getItem('portfolioTheme');
    if (VALID.has(storedTheme)) savedTheme = storedTheme;
    const initialized = sessionStorage.getItem('portfolioThemeDefaultInitialized') === 'true';
    const savedMode = sessionStorage.getItem('portfolioThemeMode');
    if (!initialized) {
      themeMode = 'auto';
      savedTheme = ORDER[0];
      sessionStorage.setItem('portfolioThemeMode', 'auto');
      sessionStorage.setItem('portfolioTheme', savedTheme);
      sessionStorage.setItem('portfolioThemeDefaultInitialized', 'true');
    } else {
      themeMode = savedMode === 'manual' ? 'manual' : 'auto';
      if (savedMode !== 'manual' && savedMode !== 'auto') {
        savedTheme = ORDER[0];
        sessionStorage.setItem('portfolioThemeMode', 'auto');
        sessionStorage.setItem('portfolioTheme', savedTheme);
      }
    }
  } catch (_) {
    themeMode = 'auto';
    savedTheme = ORDER[0];
  }
  applyTheme(savedTheme, false);
  if (themeMode === 'auto') scheduleAutoTheme(generation);

  if (!trigger || !menu) return;

  const closeMenu = () => {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  };
  const openMenu = () => {
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
  };

  trigger.addEventListener('click', () => menu.hidden ? openMenu() : closeMenu());
  [...autoOptions, ...options].forEach((option) => {
    const choose = () => {
      if (option.hasAttribute('data-theme-auto')) selectAutoTheme();
      else selectManualTheme(option.dataset.themeChoice);
      closeMenu();
    };
    option.addEventListener('click', choose);
    option.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        choose();
      } else if (event.key === 'Escape') {
        closeMenu();
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (!menu.hidden && !menu.contains(event.target) && !trigger.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.clearTimeout(timer);
      timer = 0;
    } else if (themeMode === 'auto') {
      scheduleAutoTheme(generation);
    }
  });
  motionPreference.addEventListener('change', () => {
    stopAutoTheme();
    if (themeMode === 'auto') scheduleAutoTheme(generation);
  });
})();
