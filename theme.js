/* Apply a saved choice before the first paint; keep the light edition as default. */
(() => {
  const root = document.documentElement;
  const key = 'steps-footguard-theme';
  let selected = 'light';
  try {
    const saved = localStorage.getItem(key);
    if (saved === 'dark' || saved === 'light') selected = saved;
  } catch {}

  function sync() {
    const dark = selected === 'dark';
    root.dataset.theme = selected;
    const button = document.getElementById('theme');
    if (button) {
      const ar = root.lang !== 'en';
      button.setAttribute('aria-label', ar ? 'الوضع الداكن' : 'Dark theme');
      button.setAttribute('aria-pressed', String(dark));
      button.title = ar
        ? (dark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن')
        : (dark ? 'Switch to light theme' : 'Switch to dark theme');
      const icon = button.querySelector('img');
      if (icon) icon.src = `assets/icons/${dark ? 'sun' : 'moon'}.svg`;
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#142b30' : '#a5d4d2');
  }
  sync();
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('theme')?.addEventListener('click', () => {
      selected = selected === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, selected); } catch {}
      sync();
    });
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['lang'] });
    sync();
  });
  window.addEventListener('storage', event => {
    if (event.key === key && (event.newValue === 'dark' || event.newValue === 'light')) {
      selected = event.newValue;
      sync();
    }
  });
})();
