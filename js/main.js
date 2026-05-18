import { store } from './store.js';
import { createWelcome } from './welcome.js';
import { createGallery } from './gallery.js';

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
  // Onboarding module — Session 6
  // For now: log the choice and show a holding screen
  console.log('World chosen:', world.id);

  app.innerHTML = `
    <div style="
      position:absolute;inset:0;
      background:#000;
      display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      gap:16px;
      padding:40px;
    ">
      <div style="
        font-family:var(--font-serif);font-style:italic;font-weight:300;
        font-size:clamp(28px,7vw,38px);
        color:rgba(240,235,218,0.9);text-align:center;
      ">${world.name}</div>
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:11px;letter-spacing:0.25em;text-transform:uppercase;
        color:rgba(240,235,218,0.35);text-align:center;
      ">${world.onboarding.arrival}</div>
    </div>
  `;
}

async function showHome(worlds) {
  const worldId = store.get('world');
  const world = worlds.find(w => w.id === worldId);

  app.innerHTML = `
    <div style="
      position:absolute;inset:0;
      background:#000;
      display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      gap:16px;padding:40px;
    ">
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
    </div>
  `;
}

boot();
