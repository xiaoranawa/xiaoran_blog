declare global {
  interface Window {
    applyTheme?: () => void;
  }
}

const root = document.documentElement;

function setTheme(pref: string) {
  try {
    localStorage.setItem('theme', pref);
  } catch {}
  window.applyTheme?.();
}

document.addEventListener('click', (e) => {
  const target = e.target as Element;
  const themeBtn = target.closest<HTMLElement>('[data-theme-set]');
  if (themeBtn) return setTheme(themeBtn.dataset.themeSet!);
  if (target.closest('[data-theme-cycle]')) {
    const order = ['system', 'light', 'dark'];
    return setTheme(order[(order.indexOf(root.dataset.themePref || 'system') + 1) % order.length]);
  }
  if (target.closest('[data-drawer-toggle]')) {
    root.classList.toggle('drawer-open');
  } else if (target.closest('[data-drawer-close]')) {
    root.classList.remove('drawer-open');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') root.classList.remove('drawer-open');
});

// 两边的栏比屏幕高时，把吸顶位置设成负数：先跟着页面滚，滚到最底下再停住
function fitColumns() {
  for (const [selector, prop] of [
    ['.side', '--side-top'],
    ['.aside', '--aside-top'],
  ]) {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) el.style.setProperty(prop, `${Math.min(16, innerHeight - el.offsetHeight - 16)}px`);
  }
}

let columns: ResizeObserver | undefined;
document.addEventListener('astro:page-load', () => {
  columns?.disconnect();
  columns = new ResizeObserver(fitColumns);
  document.querySelectorAll('.side, .aside').forEach((el) => columns!.observe(el));
  fitColumns();
});
addEventListener('resize', fitColumns);

// 给代码块套一层，放语言标签和复制按钮
function enhanceCode() {
  const copyIcon = document.getElementById('tpl-copy') as HTMLTemplateElement | null;
  const doneIcon = document.getElementById('tpl-check') as HTMLTemplateElement | null;
  document.querySelectorAll<HTMLPreElement>('.markdown-body pre').forEach((pre) => {
    if (pre.parentElement?.classList.contains('code-wrap')) return;
    const wrap = document.createElement('div');
    wrap.className = 'code-wrap';
    if (pre.dataset.language && pre.dataset.language !== 'plaintext') wrap.dataset.lang = pre.dataset.language;
    pre.before(wrap);
    wrap.append(pre);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    btn.setAttribute('aria-label', '复制代码');
    btn.append(copyIcon?.content.cloneNode(true) ?? '复制');
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.querySelector('code')?.innerText ?? pre.innerText);
        document.dispatchEvent(new Event('copied'));
        btn.classList.add('copied');
        btn.replaceChildren(doneIcon?.content.cloneNode(true) ?? '✓');
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.replaceChildren(copyIcon?.content.cloneNode(true) ?? '复制');
        }, 1500);
      } catch {}
    });
    wrap.append(btn);
  });
}

document.addEventListener('astro:page-load', enhanceCode);

export {};
