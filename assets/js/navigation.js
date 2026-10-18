/* The static catalog in guides.html supplies navigation, search, and featured cards. */
(() => {
  'use strict';

  const current = window.location.pathname.split('/').pop() || 'index.html';
  const menus = [...document.querySelectorAll('[data-guide-menu]')];

  const makeLink = (guide) => {
    const link = document.createElement('a');
    link.href = guide.href;
    link.textContent = guide.title;
    if (current === guide.href.split('/').pop()) link.setAttribute('aria-current', 'page');
    return link;
  };

  const readCatalog = (root) => [...root.querySelectorAll('[data-guide]')].map(entry => ({
    href: entry.querySelector('a').getAttribute('href'),
    title: entry.querySelector('[data-guide-title]').textContent.trim(),
    description: entry.querySelector('[data-guide-description]').textContent.trim(),
    heading: entry.dataset.heading,
    keywords: entry.dataset.keywords || '',
    featured: Number(entry.dataset.featured) || 0
  })).sort((a, b) => a.title.localeCompare(b.title, 'en'));

  const localCatalog = document.querySelector('[data-guide-catalog]');
  const catalog = localCatalog
    ? Promise.resolve(readCatalog(localCatalog))
    : fetch('./guides.html').then(response => {
      if (!response.ok) throw new Error('Catalog unavailable');
      return response.text();
    }).then(html => {
      const root = new DOMParser().parseFromString(html, 'text/html');
      if (!root.querySelector('[data-guide-catalog]')) throw new Error('Catalog unavailable');
      return readCatalog(root);
    });

  const closeMenus = () => menus.forEach(menu => {
    const details = menu.closest('details');
    if (details) details.open = false;
  });

  // Native details and static links continue to work if the catalog cannot load.
  document.addEventListener('pointerdown', event => {
    menus.forEach(menu => {
      const details = menu.closest('details');
      if (details?.open && !details.contains(event.target)) details.open = false;
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    menus.forEach(menu => {
      const details = menu.closest('details');
      if (!details?.open) return;
      details.open = false;
      details.querySelector('summary')?.focus();
    });
  });

  function showFeatured(guides) {
    const cards = document.querySelector('[data-featured-guides]');
    if (!cards) return;
    const featured = guides.filter(guide => guide.featured > 0)
      .sort((a, b) => a.featured - b.featured);
    const entries = featured.map(guide => {
      const link = makeLink(guide);
      link.className = 'guide';
      const topic = document.createElement('span');
      topic.className = 'number';
      topic.textContent = guide.title.toUpperCase();
      const heading = document.createElement('h3');
      heading.textContent = guide.heading || guide.title;
      const description = document.createElement('p');
      description.textContent = guide.description;
      link.replaceChildren(topic, heading, description);
      return link;
    });
    cards.replaceChildren(...entries);
    document.querySelector('[data-featured-section]').hidden = entries.length === 0;
  }

  function addSearch(actions, guides, index) {
    const form = document.createElement('form');
    form.className = 'st-guide-search';
    form.setAttribute('role', 'search');
    form.setAttribute('aria-label', 'Guides');
    const inputId = 'st-guide-query-' + index;
    const resultsId = 'st-guide-results-' + index;
    const label = document.createElement('label');
    label.htmlFor = inputId;
    label.className = 'st-visually-hidden';
    label.textContent = 'Search guides';
    const input = document.createElement('input');
    input.id = inputId;
    input.type = 'search';
    input.className = 'st-search-input';
    input.placeholder = 'Search guides…';
    input.autocomplete = 'off';
    input.setAttribute('aria-controls', resultsId);
    input.setAttribute('aria-expanded', 'false');
    const panel = document.createElement('div');
    panel.id = resultsId;
    panel.className = 'st-search-results';
    panel.hidden = true;
    const status = document.createElement('p');
    status.className = 'st-search-status';
    status.setAttribute('role', 'status');
    const results = document.createElement('ul');
    panel.append(status, results);
    form.append(label, input, panel);
    actions.append(form);

    const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('en').replace(/[^a-z0-9]+/g, ' ').trim();
    const searchable = guides.map(guide => ({
      guide,
      text: normalize([guide.title, guide.description, guide.keywords].join(' '))
    }));
    const close = () => {
      panel.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    };
    const render = () => {
      const query = normalize(input.value);
      if (!query) { close(); return; }
      const terms = query.split(/\s+/);
      const matches = searchable.filter(item => terms.every(term => item.text.includes(term)));
      const links = matches.map(({guide}) => {
        const item = document.createElement('li');
        const link = makeLink(guide);
        const title = document.createElement('strong');
        title.textContent = guide.title;
        const description = document.createElement('span');
        description.textContent = guide.description;
        link.replaceChildren(title, description);
        item.append(link);
        return item;
      });
      results.replaceChildren(...links);
      status.textContent = matches.length
        ? matches.length + (matches.length === 1 ? ' guide found' : ' guides found')
        : 'No guides found. Try another topic.';
      panel.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      closeMenus();
    };
    input.addEventListener('input', render);
    input.addEventListener('focus', () => { closeMenus(); render(); });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!panel.hidden) results.querySelector('a')?.click();
    });
    form.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) {
        event.preventDefault();
        input.focus();
        close();
        return;
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      if (panel.hidden) render();
      const links = [...results.querySelectorAll('a')];
      if (panel.hidden || !links.length) return;
      event.preventDefault();
      const active = links.indexOf(document.activeElement);
      if (event.key === 'ArrowDown') links[(active + 1) % links.length].focus();
      else if (active <= 0) input.focus();
      else links[active - 1].focus();
    });
    form.addEventListener('focusout', event => {
      if (!form.contains(event.relatedTarget)) close();
    });
    document.addEventListener('pointerdown', event => {
      if (!form.contains(event.target)) close();
    });
    menus.forEach(menu => menu.closest('details')?.addEventListener('toggle', () => {
      if (menu.closest('details').open) close();
    }));
  }

  catalog.then(guides => {
    if (!guides.length) return;
    menus.forEach(menu => {
      const all = makeLink({href: './guides.html', title: 'Browse all guides'});
      all.className = 'st-menu-all';
      menu.replaceChildren(all, ...guides.map(makeLink));
    });
    showFeatured(guides);
    document.querySelectorAll('.st-site-actions').forEach((actions, index) => {
      addSearch(actions, guides, index);
    });
  }).catch(() => {
    // The homepage's all-guides link leads to the complete static catalog.
  });
})();
