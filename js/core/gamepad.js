/* Standard browser Gamepad mapping (Xbox button positions, also used by most
 * PlayStation controllers). Poll once before the game's keyboard handling.
 * Menu actions stay inside the topmost visible panel; gameplay uses Input's
 * existing shortcuts and leaves auto-targeting/combat unchanged. */
G.Gamepad = (() => {
  const DEAD = 0.2;
  let vector = [0, 0], previous = [], index = null, scope = null, focus = null;
  let direction = '', repeatAt = 0, suspended = false;
  const keys = new Set();
  const targets = 'button, a[href], input, select, textarea, .menu-item, .card, .cell:not(.locked), .tab, .chip, .gen-tab';

  function visible(el) {
    return !!el && !el.closest('.hidden, [hidden], [inert]') &&
      getComputedStyle(el).visibility !== 'hidden' && el.getClientRects().length > 0;
  }
  function setFocus(el) {
    if (focus) focus.classList.remove('pad-focus');
    focus = el || null;
    if (!focus) return;
    focus.classList.add('pad-focus');
    if (!focus.matches('input, textarea, select')) focus.tabIndex = focus.tabIndex < 0 ? 0 : focus.tabIndex;
    focus.focus({ preventScroll: true });
    focus.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function reset() {
    vector = [0, 0]; previous = []; keys.clear(); index = null;
    direction = ''; repeatAt = 0; scope = null; setFocus(null);
  }
  addEventListener('blur', () => { reset(); suspended = true; });
  document.addEventListener('visibilitychange', () => { reset(); suspended = true; });
  addEventListener('gamepaddisconnected', e => { if (e.gamepad.index === index) reset(); });
  document.addEventListener('pointerdown', () => setFocus(null));

  function panel() {
    const panels = [...document.querySelectorAll('.scr, #tap-start, #pull-fx, #invite-pop, #sound-panel')].filter(visible);
    // DOM order breaks ties, matching the browser's stacking order.
    panels.sort((a, b) => (+getComputedStyle(a).zIndex || 0) - (+getComputedStyle(b).zIndex || 0));
    return panels.at(-1) || null;
  }
  function buttons(root) {
    const list = [...root.querySelectorAll(targets)];
    if (root.id === 'scr-menu') list.push(...document.querySelectorAll('#topbar button, #topbar a[href]'));
    return list.filter(el => visible(el) && !el.disabled &&
      el.getAttribute('aria-disabled') !== 'true' && !el.closest('.cards.done') &&
      !el.matches('input[type=hidden]') && !el.closest('.cell.locked'));
  }
  function navigate(dir, list) {
    if (!list.length) return;
    if (!list.includes(focus)) { setFocus(list[0]); return; }
    if ((dir === 'left' || dir === 'right') && focus.matches('input[type=range], select')) {
      const sign = dir === 'left' ? -1 : 1;
      if (focus.matches('select')) {
        focus.selectedIndex = Math.max(0, Math.min(focus.options.length - 1, focus.selectedIndex + sign));
      } else {
        focus.value = Math.max(+(focus.min || 0), Math.min(+(focus.max || 100), +focus.value + sign * +(focus.step || 1)));
      }
      focus.dispatchEvent(new Event('input', { bubbles: true }));
      focus.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    const a = focus.getBoundingClientRect(), horizontal = dir === 'left' || dir === 'right';
    const sign = dir === 'left' || dir === 'up' ? -1 : 1;
    let best = null, score = Infinity;
    for (const el of list) {
      if (el === focus) continue;
      const b = el.getBoundingClientRect();
      const dx = (b.left + b.right - a.left - a.right) / 2;
      const dy = (b.top + b.bottom - a.top - a.bottom) / 2;
      const along = (horizontal ? dx : dy) * sign, cross = Math.abs(horizontal ? dy : dx);
      if (along <= 2) continue;
      const s = along + cross * 3;
      if (s < score) { best = el; score = s; }
    }
    // At an edge, move through DOM order so every control remains reachable.
    if (!best) best = list[(list.indexOf(focus) + sign + list.length) % list.length];
    setFocus(best);
  }
  function back(root) {
    const b = [...root.querySelectorAll('[data-back], [id$="-close"], [id$="-back"], #btn-resume, #legal-ok')]
      .find(el => visible(el) && !el.disabled);
    if (b) b.click();
  }
  function poll(now = performance.now()) {
    keys.clear(); vector = [0, 0];
    if (document.hidden || !document.hasFocus()) { reset(); suspended = true; return; }
    let pads;
    try { pads = navigator.getGamepads ? [...navigator.getGamepads()] : []; }
    catch (e) { reset(); return; } // Gamepad API unavailable/blocked by browser policy.
    const usable = pads.filter(p => p && p.connected && p.mapping === 'standard');
    const p = usable.find(p => p.index === index) || usable[0];
    if (!p) { reset(); return; }
    const held = p.buttons.map(b => !!b.pressed);
    if (p.index !== index || suspended) {
      index = p.index; previous = held; suspended = false;
      // Ignore buttons already held on connect/refocus until released.
    }
    const tap = n => held[n] && !previous[n];
    const x = Number.isFinite(p.axes[0]) ? p.axes[0] : 0;
    const y = Number.isFinite(p.axes[1]) ? p.axes[1] : 0;
    const length = Math.hypot(x, y);
    if (length > DEAD) {
      const amount = (Math.min(1, length) - DEAD) / (1 - DEAD);
      vector = [x / length * amount, y / length * amount];
    }
    const root = panel();
    const playing = G.Game && G.Game.state === 'playing' && !root;
    if (playing) {
      setFocus(null);
      // D-pad selects slots; analog stick moves. B has no destructive action.
      [12, 15, 13, 14].forEach((n, i) => { if (tap(n)) keys.add('digit' + (i + 1)); });
      if (tap(4)) keys.add('keyq');
      if (tap(5)) keys.add('keye');
      if (tap(9)) keys.add('escape');
      if (G.Judgment && G.Judgment.cinematic && tap(0)) keys.add('enter');
    } else if (root) {
      vector = [0, 0];
      const list = buttons(root);
      if (root !== scope) { setFocus(null); direction = ''; }
      if (!list.includes(focus)) setFocus(list[0]);
      if (root.id === 'tap-start') {
        if (tap(0) || tap(9)) root.click();
      } else {
        const dir = held[12] ? 'up' : held[13] ? 'down' : held[14] ? 'left' : held[15] ? 'right' :
          Math.max(Math.abs(x), Math.abs(y)) < 0.55 ? '' : Math.abs(x) > Math.abs(y) ? (x < 0 ? 'left' : 'right') : (y < 0 ? 'up' : 'down');
        if (dir && (dir !== direction || now >= repeatAt)) {
          navigate(dir, list); repeatAt = now + (dir === direction ? 130 : 350);
        }
        direction = dir;
        if (tap(0)) {
          if (!list.includes(focus)) setFocus(list[0]);
          else if (!focus.matches('input:not([type=checkbox]):not([type=radio]), textarea, select')) focus.click();
        } else if (tap(1) || tap(9)) back(root);
        else if (tap(2) && root.id === 'scr-levelup') {
          const b = root.querySelector('#lvl-reroll'); if (visible(b) && !b.disabled) b.click();
        }
      }
    }
    scope = root;
    previous = held;
  }
  return { poll, reset, axis: () => vector, tap: key => keys.has(key) };
})();
