import { store } from './store.js';
import { createWelcome } from './welcome.js';
import { createGallery } from './gallery.js';
import { createOnboarding } from './onboarding.js';
import { createTeam } from './team.js';

const app = document.getElementById('app');

async function loadWorlds() {
  const res = await fetch('./data/worlds.json');
  if (!res.ok) throw new Error('Failed to load worlds data');
  const data = await res.json();
  return data.worlds;
}

async function boot() {
  let worlds;
  try {
    worlds = await loadWorlds();
  } catch (err) {
    console.error('Could not load worlds:', err);
    app.innerHTML = `
      <div style="
        display:flex;align-items:center;justify-content:center;
        height:100%;font-family:var(--font-sans);
        color:rgba(240,235,218,0.5);font-size:13px;letter-spacing:0.1em;
      ">something went quiet. refresh to try again.</div>
    `;
    return;
  }

  const returning = store.get('world') && store.get('onboarding')?.complete;

  if (returning) {
    await showHome(worlds);
    return;
  }

  await showWelcome(worlds);
}

async function showWelcome(worlds) {
  const welcome = createWelcome();
  await welcome.mount(app);
  await welcome.unmount();
  await showGallery(worlds);
}

async function showGallery(worlds) {
  const gallery = createGallery(worlds);
  const chosenWorld = await gallery.mount(app);
  store.set('world', chosenWorld.id);
  await gallery.unmount();
  await showOnboarding(chosenWorld, worlds);
}

async function showOnboarding(world, worlds) {
  const onboarding = createOnboarding(world, worlds);

  const result = await onboarding.mount(app, {
    onBack: async () => {
      await onboarding.unmount();
      store.set('world', null);
      await showGallery(worlds);
    },
  });
  await onboarding.unmount();

  if (result?.next === 'team') {
    const team = createTeam(result.world);
    await team.mount(app);
    await team.unmount();
  }

  await showHome(worlds);
}

async function showHome(worlds) {
  const worldId = store.get('world');
  const world   = worlds.find(w => w.id === worldId);

  // Build the home screen as a real element so the dev reset can attach to it
  const el = document.createElement('div');
  el.id = 'screen-home';
  el.style.cssText = `
    position:absolute;inset:0;
    background:#000;
    display:flex;flex-direction:column;
    align-items:center;justify-content:center;
    gap:16px;padding:40px;
  `;

  el.innerHTML = `
    <div style="
      font-family:var(--font-serif);font-style:italic;font-weight:300;
      font-size:clamp(28px,7vw,38px);
      color:rgba(240,235,218,0.9);text-align:center;
    ">welcome back</div>
    ${world ? `<div style="
      font-family:var(--font-sans);font-weight:200;
      font-size:11px;letter-spacing:0.25em;text-transform:uppercase;
      color:rgba(240,235,218,0.35);text-align:center;
    ">${world.name}</div>` : ''}
  `;

  app.innerHTML = '';
  app.appendChild(el);

  // ── Dev Reset — Hidden Long Press ─────────────────────────────────────────
  // 3-second long-press anywhere on the home/welcome-back screen.
  // No label, no visible UI. Invisible to real users.
  attachDevReset(el);
  // ─────────────────────────────────────────────────────────────────────────
}

// ─── Dev Reset Implementation ─────────────────────────────────────────────────

const RESET_HOLD_MS = 3000;

function attachDevReset(el) {
  let timer      = null;
  let holdActive = false;

  function onStart() {
    if (timer) return;
    holdActive = true;

    // Screen dims slowly over the hold duration — subtle, unannounced
    el.style.transition = `opacity ${RESET_HOLD_MS}ms linear`;
    el.style.opacity    = '0.5';

    timer = setTimeout(() => {
      timer      = null;
      holdActive = false;
      fireReset(el);
    }, RESET_HOLD_MS);
  }

  function onEnd() {
    if (!holdActive) return;
    holdActive = false;

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    // Released before threshold — restore
    el.style.transition = 'opacity 0.4s ease';
    el.style.opacity    = '1';
  }

  el.addEventListener('pointerdown',   onStart);
  el.addEventListener('pointerup',     onEnd);
  el.addEventListener('pointercancel', onEnd);
  el.addEventListener('pointerleave',  onEnd);
}

function fireReset(el) {
  // Two-flash on threshold hit: bright → dim → nuke
  el.style.transition = 'opacity 0.12s ease';
  el.style.opacity    = '1';

  setTimeout(() => {
    el.style.opacity = '0.2';
    setTimeout(() => {
      store.reset();
      location.reload();
    }, 200);
  }, 120);
}

boot();
