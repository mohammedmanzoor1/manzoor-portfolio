(() => {
  const body = document.body;
  const trigger = document.getElementById('themeTrigger');
  const menu = document.getElementById('themeMenu');
  const options = [...document.querySelectorAll('[data-theme-choice]')];
  const meta = document.getElementById('themeColorMeta');
  const VALID = new Set(['midnight', 'aurora', 'emerald', 'cosmic', 'light']);
  const META = {
    midnight: '#080b12',
    aurora: '#0b1630',
    emerald: '#09211f',
    cosmic: '#1a1230',
    light: '#d9efff'
  };

  const applyTheme = (theme, persist = true) => {
    const next = VALID.has(theme) ? theme : 'midnight';
    body.dataset.theme = next;
    document.documentElement.style.colorScheme = next === 'light' ? 'light' : 'dark';
    if (meta) meta.setAttribute('content', META[next]);
    options.forEach((option) => {
      const selected = option.dataset.themeChoice === next;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-checked', String(selected));
    });
    if (persist) {
      try { sessionStorage.setItem('portfolioTheme', next); } catch (_) {}
    }
  };

  const closeMenu = () => {
    if (!menu || !trigger) return;
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    if (!menu || !trigger) return;
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
  };

  let saved = 'midnight';
  try {
    const stored = sessionStorage.getItem('portfolioTheme');
    if (VALID.has(stored)) saved = stored;
  } catch (_) {}
  applyTheme(saved, false);

  if (!trigger || !menu) return;

  trigger.addEventListener('click', () => menu.hidden ? openMenu() : closeMenu());
  options.forEach((option) => {
    option.addEventListener('click', () => {
      applyTheme(option.dataset.themeChoice);
      closeMenu();
    });
    option.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        applyTheme(option.dataset.themeChoice);
        closeMenu();
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
})();
