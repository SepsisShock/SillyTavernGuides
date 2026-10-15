/* Optional, dependency-free enhancements for guides that link this file. */
(() => {
  'use strict';

  const contents = document.querySelector('.toc-panel');
  const contentsLinks = [...document.querySelectorAll('.toc-links a')];
  const sections = contentsLinks.map(link => document.querySelector(link.hash));

  if (contents && sections.every(Boolean)) {
    const mobile = window.matchMedia('(max-width: 800px)');
    const setContents = () => { contents.open = !mobile.matches; };
    setContents();
    mobile.addEventListener('change', setContents);

    contentsLinks.forEach((link, index) => {
      link.addEventListener('click', () => {
        if (mobile.matches) contents.open = false;
        // Keep keyboard focus on the destination when the mobile menu closes.
        const heading = sections[index].querySelector('h2') || sections[index];
        heading.setAttribute('tabindex', '-1');
        requestAnimationFrame(() => heading.focus({ preventScroll: true }));
      });
    });

    let scheduled = false;
    const updateCurrent = () => {
      let current = 0;
      sections.forEach((section, index) => {
        if (section.getBoundingClientRect().top <= window.innerHeight * 0.28) current = index;
      });
      contentsLinks.forEach((link, index) => {
        if (index === current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      scheduled = false;
    };
    window.addEventListener('scroll', () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(updateCurrent);
      }
    }, { passive: true });
    window.addEventListener('resize', updateCurrent);
    updateCurrent();
  }

  const status = document.getElementById('copy-status');
  let announcementTimer;
  const announce = message => {
    if (!status) return;
    clearTimeout(announcementTimer);
    status.textContent = message;
    announcementTimer = setTimeout(() => { status.textContent = ''; }, 4000);
  };

  const copyText = async text => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // A denied Clipboard API can still allow copying after a user gesture.
      }
    }
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('aria-label', 'Code to copy');
    Object.assign(field.style, { position: 'fixed', left: '-9999px', top: '0' });
    document.body.append(field);
    field.focus();
    field.select();
    let copied;
    try {
      copied = document.execCommand('copy');
    } finally {
      field.remove();
    }
    if (!copied) throw new Error('Clipboard unavailable');
  };

  const copyIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="8" height="8" rx="1.5"/><path d="M10 3V2H2v8h1"/></svg>';
  document.querySelectorAll('code[data-copy]').forEach(code => {
    const label = code.dataset.copy;
    const context = code.closest('tr')?.querySelector('.cell-content')?.textContent.trim();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-button';
    button.setAttribute('aria-label', `Copy ${label}${context ? `: ${context}` : ''}`);
    button.innerHTML = copyIcon + '<span>Copy</span>';
    const unit = document.createElement('span');
    unit.className = 'copy-unit';
    code.before(unit);
    unit.append(code, button);
    let resetTimer;

    button.addEventListener('click', async () => {
      clearTimeout(resetTimer);
      try {
        // Never copy table labels, explanations, or the button's own text.
        await copyText(code.textContent);
        button.dataset.copied = '';
        button.querySelector('span').textContent = 'Copied';
        announce(`${label} copied.`);
      } catch {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(range);
        button.querySelector('span').textContent = 'Selected';
        announce('Copy unavailable. Code selected; use your browser’s Copy command.');
      }
      button.focus({ preventScroll: true });
      resetTimer = setTimeout(() => {
        button.removeAttribute('data-copied');
        button.querySelector('span').textContent = 'Copy';
      }, 2500);
    });
  });

  // Preserve the original screenshot sources and their one-time fallback.
  document.querySelectorAll('img[data-fallback]').forEach(img => {
    let failed = false;
    const onError = () => {
      if (!failed) {
        failed = true;
        img.src = img.dataset.fallback;
      } else if (!img.alt.endsWith(' (image could not load)')) {
        img.alt += ' (image could not load)';
      }
    };
    img.addEventListener('error', onError);
    // Deferred scripts can attach after an eager/cached image has already failed.
    if (img.complete && !img.naturalWidth) onError();
  });

  // Retain the existing site menu's click-outside and Escape behavior.
  document.addEventListener('pointerdown', event => {
    document.querySelectorAll('.st-site-nav details[open]').forEach(menu => {
      if (!menu.contains(event.target)) menu.open = false;
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.st-site-nav details[open]').forEach(menu => {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    });
  });
})();
