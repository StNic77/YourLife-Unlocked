import { store } from './store.js';
import { createWelcome } from './welcome.js';
import { createGallery } from './gallery.js';
import { createOnboarding } from './onboarding.js';
import { createTeam } from './team.js';
import { createHome } from './home.js';

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
  if (!world) return;

  const home = createHome(world);
  home.mount(app);
}

boot();
