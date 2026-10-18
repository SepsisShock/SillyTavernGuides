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

  let guideTextPromise;
  function loadGuideText(guides) {
    if (guideTextPromise) return guideTextPromise;
    guideTextPromise = (async () => {
      const texts = new Map();
      let next = 0;
      async function worker() {
        while (next < guides.length) {
          const guide = guides[next++];
          try {
            let root;
            if (current === guide.href.split('/').pop()) {
              root = document.cloneNode(true);
            } else {
              const response = await fetch(guide.href);
              if (!response.ok) throw new Error('Guide unavailable');
              root = new DOMParser().parseFromString(await response.text(), 'text/html');
            }
            root.querySelectorAll('script, style, nav, footer, .guide-toc, [data-guide-search]')
              .forEach(element => element.remove());
            const content = root.querySelector('main') || root.body;
            content.querySelectorAll('br').forEach(element => element.replaceWith(' '));
            content.querySelectorAll('p, li, h1, h2, h3, h4, pre, td, th, summary, div')
              .forEach(element => element.append(' '));
            texts.set(guide.href, content.textContent.replace(/\s+/g, ' ').trim());
          } catch (_) {
            texts.set(guide.href, null);
          }
        }
      }
      await Promise.all(Array.from({length: Math.min(4, guides.length)}, worker));
      return texts;
    })();
    return guideTextPromise;
  }

  function addSearch(actions, guides, index) {
    const isPageSearch = actions.matches('[data-guide-search]');
    const form = isPageSearch ? actions : document.createElement('form');
    form.classList.add('st-guide-search');
    form.setAttribute('role', 'search');
    if (!form.hasAttribute('aria-label')) form.setAttribute('aria-label', 'Guides');
    form.action = './guides.html';
    form.method = 'get';

    const label = form.querySelector('label') || document.createElement('label');
    const input = form.querySelector('input[type="search"]') || document.createElement('input');
    if (!input.id) input.id = 'st-guide-query-' + index;
    label.htmlFor = input.id;
    if (!isPageSearch) {
      label.className = 'st-visually-hidden';
      label.textContent = 'Search guides';
    }
    input.type = 'search';
    input.name = 'q';
    input.classList.add('st-search-input');
    if (!input.placeholder) input.placeholder = 'Search guides…';
    input.autocomplete = 'off';

    const panel = form.querySelector('[data-guide-search-results]') || document.createElement('div');
    if (!panel.id) panel.id = 'st-guide-results-' + index;
    panel.classList.add('st-search-results');
    panel.hidden = true;
    input.setAttribute('aria-controls', panel.id);
    input.setAttribute('aria-expanded', 'false');
    const status = panel.querySelector('[role="status"]') || document.createElement('p');
    status.className = 'st-search-status';
    status.setAttribute('role', 'status');
    const results = panel.querySelector('ul') || document.createElement('ul');
    panel.replaceChildren(status, results);
    if (!isPageSearch) {
      form.append(label, input, panel);
      actions.append(form);
    }

    const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('en').replace(/[^a-z0-9]+/g, ' ').trim();
    const searchable = guides.map(guide => ({
      guide,
      title: normalize(guide.title),
      metadata: normalize([guide.title, guide.heading, guide.description, guide.keywords].join(' ')),
      text: '',
      raw: ''
    }));
    let ready = false;
    let loading = false;
    let unavailable = 0;
    const close = () => {
      panel.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    };
    const excerpt = (text, terms) => {
      const lower = text.toLocaleLowerCase('en');
      const found = terms.map(term => lower.indexOf(term)).filter(position => position >= 0);
      const start = Math.max(0, (found.length ? Math.min(...found) : 0) - 55);
      const snippet = text.slice(start, start + 180).trim();
      return (start ? '…' : '') + snippet + (start + 180 < text.length ? '…' : '');
    };
    const render = () => {
      const query = normalize(input.value);
      if (!query) { close(); return; }
      const terms = query.split(/\s+/);
      const matches = searchable.filter(item =>
        terms.every(term => (item.metadata + ' ' + item.text).includes(term))
      ).map(item => ({
        ...item,
        rank: terms.every(term => item.title.includes(term)) ? 0
          : terms.every(term => item.metadata.includes(term)) ? 1 : 2
      })).sort((a, b) => a.rank - b.rank || a.guide.title.localeCompare(b.guide.title, 'en'));
      const focusedHref = results.contains(document.activeElement)
        ? document.activeElement.closest('a')?.getAttribute('href') : null;
      const links = matches.map(item => {
        const element = document.createElement('li');
        const link = makeLink(item.guide);
        const title = document.createElement('strong');
        title.textContent = item.guide.title;
        const description = document.createElement('span');
        description.textContent = item.rank === 2
          ? excerpt(item.raw, terms) : item.guide.description;
        link.replaceChildren(title, description);
        element.append(link);
        return element;
      });
      results.replaceChildren(...links);
      const count = matches.length + (matches.length === 1 ? ' guide found' : ' guides found');
      status.textContent = ready
        ? (matches.length ? count : 'No guides found. Try another term.')
          + (unavailable ? ' Some guide text could not be searched.' : '')
        : 'Searching guide text…';
      panel.setAttribute('aria-busy', String(!ready));
      panel.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      closeMenus();
      if (focusedHref) {
        const replacement = [...results.querySelectorAll('a')]
          .find(link => link.getAttribute('href') === focusedHref);
        (replacement || input).focus();
      }
      if (!ready && !loading) {
        loading = true;
        loadGuideText(guides).then(texts => {
          searchable.forEach(item => {
            const raw = texts.get(item.guide.href);
            if (raw === null) unavailable++;
            item.raw = raw || '';
            item.text = normalize(item.raw);
          });
          ready = true;
          if (!panel.hidden) render();
        });
      }
    };

    input.addEventListener('input', render);
    input.addEventListener('focus', () => { closeMenus(); render(); });
    form.addEventListener('submit', event => {
      event.preventDefault();
      render();
      if (!isPageSearch && !panel.hidden) results.querySelector('a')?.click();
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
    if (!isPageSearch) {
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
    const initialQuery = new URLSearchParams(window.location.search).get('q');
    if (initialQuery && (isPageSearch || current === 'guides.html')) {
      input.value = initialQuery;
      render();
    }
  }

  catalog.then(guides => {
    if (!guides.length) return;
    menus.forEach(menu => {
      const all = makeLink({href: './guides.html', title: 'Browse all guides'});
      all.className = 'st-menu-all';
      menu.replaceChildren(all, ...guides.map(makeLink));
    });
    showFeatured(guides);
    document.querySelectorAll('.st-site-actions, [data-guide-search]').forEach((actions, index) => {
      addSearch(actions, guides, index);
    });
  }).catch(() => {
    // The static form can still submit to the complete catalog.
    document.querySelectorAll('[data-guide-search-results]').forEach(panel => {
      panel.hidden = false;
      panel.querySelector('[role="status"]').textContent =
        'Search is temporarily unavailable. Press Search to try the guide list.';
    });
  });
})();
