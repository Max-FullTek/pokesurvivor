const { test } = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const source = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

function browser(html = '', language = 'zh-TW', saved = null, url = 'https://example.test/') {
  const dom = new JSDOM(html, { url, runScripts: 'outside-only' });
  const w = dom.window;
  w.G = {};
  w.CanvasRenderingContext2D = function () {};
  for (const name of ['fillText', 'strokeText', 'measureText']) w.CanvasRenderingContext2D.prototype[name] = () => {};
  Object.defineProperty(w.navigator, 'languages', { value: [language] });
  if (saved) w.localStorage.setItem('ps.lang', saved);
  w.load = file => w.eval(source(file));
  return w;
}
function locale(w) {
  w.load('js/core/i18n.js');
  w.load('js/data/lang-en.js');
  w.load('js/data/lang-zh-hant.js');
}
test('language selection respects saved settings, Chinese browsers, and /en/', () => {
  for (const [nav, saved, url, expected] of [
    ['zh-TW', null, 'https://example.test/', 'zh-Hant'],
    ['zh-HK', null, 'https://example.test/', 'zh-Hant'],
    ['en-US', 'zh-Hant', 'https://example.test/en/', 'zh-Hant'],
    ['zh-TW', 'en', 'https://example.test/', 'en'],
    ['es', null, 'https://example.test/', 'es'],
    ['en', null, 'https://example.test/', 'en'],
    ['zh-TW', null, 'https://example.test/en/', 'en']
  ]) {
    const w = browser('', nav, saved, url); locale(w);
    assert.equal(w.G.I18n.lang, expected);
    assert.equal(w.document.documentElement.lang, expected);
    assert.equal(w.G.T('Volver'), expected === 'zh-Hant' ? '返回' : expected === 'en' ? 'Back' : 'Volver');
    w.close();
  }
});
test('translation covers upstream English dictionary and every playable Pokémon', () => {
  const w = browser(); locale(w);
  const en = {};
  const capture = browser();
  capture.G.I18n = { add: d => Object.assign(en, d) };
  capture.load('js/data/lang-en.js');
  const zh = {};
  capture.G.I18n.add = d => Object.assign(zh, d);
  capture.load('js/data/lang-zh-hant.js');
  assert.deepEqual(Object.keys(en).filter(s => !Object.hasOwn(zh, s)), []);
  const missing = Object.keys(en).filter(s => w.G.T(s) === s && !/^[\d\W]+$/.test(s));
  // Proper nouns and international labels can intentionally stay unchanged.
  const allowed = new Set(['Surf', 'Google', 'FPS', 'PokéSurvivor', 'Pokémon', 'Shiny', '(shiny)', 'shiny', 'Normal', 'Auto', 'KO']);
  assert.deepEqual(missing.filter(s => !allowed.has(s)), []);
  w.load('js/data/pokedex.js');
  const missingNames = w.G.DEX.filter(p => !/\p{Script=Han}/u.test(w.G.T(p.name))).map(p => p.name);
  assert.equal(missingNames.length, 0, missingNames.join(', '));
  assert.equal(w.G.T('Bulbasaur'), '妙蛙種子');
  assert.match(w.G.T('¡Nivel 12!'), /12/);
  w.close(); capture.close();
});
test('DOM, dynamic text, attributes and canvas translate without changing player names', async () => {
  const w = browser('<p id="label">Volver</p><span translate="no">Bulbasaur</span><input placeholder="Nombre"><div id="later"></div>');
  let drawn, measured;
  w.CanvasRenderingContext2D.prototype.fillText = function (s) { drawn = [s, this.font]; };
  w.CanvasRenderingContext2D.prototype.measureText = function (s) { measured = [s, this.font]; return { width: 10 }; };
  locale(w); w.G.I18n.startDom();
  assert.equal(w.document.querySelector('#label').textContent, '返回');
  assert.equal(w.document.querySelector('[translate=no]').textContent, 'Bulbasaur');
  assert.notEqual(w.document.querySelector('input').placeholder, 'Nombre');
  w.document.querySelector('#later').textContent = 'Bulbasaur';
  await new Promise(resolve => w.setTimeout(resolve, 0));
  assert.equal(w.document.querySelector('#later').textContent, '妙蛙種子');
  const ctx = Object.create(w.CanvasRenderingContext2D.prototype);
  ctx.font = '700 16px Pixelify,system-ui';
  ctx.fillText('Bulbasaur', 0, 0); ctx.measureText('Bulbasaur');
  assert.equal(drawn[0], '妙蛙種子'); assert.equal(measured[0], drawn[0]);
  assert.match(drawn[1], /Microsoft JhengHei/); assert.equal(measured[1], drawn[1]);
  assert.equal(ctx.font, '700 16px Pixelify,system-ui');
  w.close();
});

function controller(html = '') {
  const w = browser(html);
  w.G.Game = { state: 'playing' };
  w.G.U = { norm: (x, y) => { const n = Math.hypot(x, y) || 1; return [x / n, y / n]; } };
  const pad = { index: 0, mapping: 'standard', connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false })) };
  let pads = [pad], focused = true;
  w.navigator.getGamepads = () => pads;
  w.document.hasFocus = () => focused;
  Object.defineProperty(w.document, 'hidden', { value: false, configurable: true });
  w.HTMLElement.prototype.getClientRects = function () { return this.closest('.hidden') ? [] : [this.getBoundingClientRect()]; };
  w.HTMLElement.prototype.getBoundingClientRect = function () {
    const i = [...w.document.querySelectorAll('*')].indexOf(this);
    return { left: 0, right: 100, top: i * 30, bottom: i * 30 + 20 };
  };
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.load('js/core/input.js'); w.load('js/core/gamepad.js');
  const poll = () => w.G.Gamepad.poll(1000);
  poll();
  return { w, pad, poll, press(n) { pad.buttons[n].pressed = true; poll(); },
    release() { pad.buttons.forEach(b => b.pressed = false); poll(); },
    pads(v) { pads = v; }, focused(v) { focused = v; } };
}
test('analog deadzone and magnitude, shortcuts, and keyboard coexistence', () => {
  const c = controller(), { w, pad, poll } = c;
  pad.axes = [0.1, 0.1]; poll(); assert.equal(Math.hypot(...w.G.Input.axis()), 0);
  pad.axes = [0.6, 0]; poll(); assert.ok(Math.abs(w.G.Input.axis()[0] - 0.5) < 1e-6);
  pad.axes = [1, 1]; poll(); assert.ok(Math.abs(Math.hypot(...w.G.Input.axis()) - 1) < 1e-6);
  c.press(5); assert.equal(w.G.Input.tap('keye'), true);
  poll(); assert.equal(w.G.Input.tap('keye'), false);
  c.release(); c.press(12); assert.equal(w.G.Input.tap('digit1'), true);
  c.release(); c.press(9); assert.equal(w.G.Input.tap('escape'), true);
  w.dispatchEvent(new w.KeyboardEvent('keydown', { code: 'KeyA' }));
  assert.equal(w.G.Input.axis()[0], -1); assert.equal(w.G.Input.axis()[1], 0);
  w.dispatchEvent(new w.KeyboardEvent('keyup', { code: 'KeyA' }));
  w.close();
});
test('unplug, lost focus, reconnect and nonstandard pads cannot leave stuck inputs', () => {
  const c = controller(), { w, pad, poll } = c;
  pad.axes = [1, 0]; c.press(9);
  c.focused(false); poll(); assert.equal(Math.hypot(...w.G.Input.axis()), 0);
  assert.equal(w.G.Input.tap('escape'), false);
  c.focused(true); poll(); assert.equal(w.G.Input.tap('escape'), false);
  c.pads([]); poll(); assert.equal(Math.hypot(...w.G.Input.axis()), 0);
  c.pads([pad]); poll(); assert.equal(w.G.Input.tap('escape'), false);
  pad.mapping = ''; poll(); assert.equal(Math.hypot(...w.G.Input.axis()), 0);
  w.close();
});
test('topmost modal owns menu input, disabled controls are skipped, confirmation fires once', () => {
  const c = controller('<section class="scr" id="scr-menu"><button id="play">Play</button></section><section class="scr" id="scr-settings" style="z-index:60"><button disabled>Disabled</button><button id="set-close">Back</button></section>');
  const { w } = c; w.G.Game.state = 'ui';
  let plays = 0, closes = 0;
  w.document.querySelector('#play').onclick = () => plays++;
  w.document.querySelector('#set-close').onclick = () => closes++;
  c.press(0); c.poll(); assert.equal(closes, 1); assert.equal(plays, 0);
  assert.equal(w.document.querySelector('.pad-focus').id, 'set-close');
  c.release(); c.press(1); assert.equal(closes, 2);
  assert.equal(w.G.Input.tap('escape'), false);
  w.close();
});
test('menu navigation reaches cards, range/select changes, reroll, resume and start overlay', () => {
  const c = controller('<section class="scr" id="scr-levelup"><div class="card" id="card">Choice</div><button id="lvl-reroll">Reroll</button><input id="range" type="range" min="0" max="100" value="50"><select id="select"><option>A</option><option>B</option></select></section>');
  const { w } = c; w.G.Game.state = 'levelup';
  let picks = 0, rerolls = 0, changes = 0;
  w.document.querySelector('#card').onclick = () => picks++;
  w.document.querySelector('#lvl-reroll').onclick = () => rerolls++;
  w.document.querySelector('#range').onchange = () => changes++;
  c.press(0); assert.equal(picks, 1);
  c.release(); c.press(2); assert.equal(rerolls, 1);
  c.release(); c.press(13); assert.equal(w.document.querySelector('.pad-focus').id, 'lvl-reroll');
  c.release(); c.press(13); assert.equal(w.document.querySelector('.pad-focus').id, 'range');
  c.release(); c.press(15); assert.equal(w.document.querySelector('#range').value, '51'); assert.equal(changes, 1);
  c.release(); c.press(13); c.release(); c.press(15);
  assert.equal(w.document.querySelector('#select').selectedIndex, 1);
  w.document.body.innerHTML = '<section class="scr" id="scr-pause"><button id="btn-resume">Continue</button></section>';
  let resumes = 0; w.document.querySelector('#btn-resume').onclick = () => resumes++;
  c.release(); c.press(9); assert.equal(resumes, 1);
  w.document.body.innerHTML = '<div id="tap-start">Start</div>';
  let starts = 0; w.document.querySelector('#tap-start').onclick = () => starts++;
  c.release(); c.press(0); assert.equal(starts, 1);
  w.close();
});
test('the Windows entry point loads the new modules in order and uses local saves', () => {
  const html = source('dev.html');
  assert.ok(html.indexOf('js/core/i18n.js') < html.indexOf('js/data/lang-zh-hant.js'));
  assert.ok(html.indexOf('js/core/gamepad.js') < html.indexOf('js/game.js'));
  const w = browser(); w.load('js/core/firebase-config.js');
  assert.equal(w.G.FIREBASE_CONFIG, null);
  w.close();
});
