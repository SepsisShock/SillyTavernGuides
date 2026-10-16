/* One alphabetical guide list shared by every page. Keep page-specific nav styling intact. */
(() => {
  'use strict';
  const guides = [
    ['character-names-behavior.html', 'Character Names Behavior'],
    ['ppp.html', 'Prompt Post-Processing'],
    ['regex.html', 'Regex Basics'],
    ['sampler-settings.html', 'Sampler Settings'],
    ['seed.html', 'Seed'],
    ['tool-calls.html', 'Tool Calls'],
    ['zen-sliders-mad-lab.html', 'Zen Sliders & Mad Lab Mode']
  ];
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-guide-menu]').forEach(menu => {
    const links = guides.map(([file, title]) => {
      const link = document.createElement('a');
      link.href = './' + file;
      link.textContent = title;
      if (current === file) link.setAttribute('aria-current', 'page');
      return link;
    });
    menu.replaceChildren(...links);
  });
  document.addEventListener('pointerdown', event => {
    document.querySelectorAll('[data-guide-menu]').forEach(menu => {
      const details = menu.closest('details');
      if (details?.open && !details.contains(event.target)) details.open = false;
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('[data-guide-menu]').forEach(menu => {
      const details = menu.closest('details');
      if (!details?.open) return;
      details.open = false;
      details.querySelector('summary')?.focus();
    });
  });
})();
