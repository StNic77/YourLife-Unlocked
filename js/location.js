import { store } from './store.js';
import { api } from './api.js';
import { transitions } from './transitions.js';

// ---------------------------------------------------------------------------
// LOCATION MODULE
// Runs once between gallery selection and onboarding.
//
// Flow:
//   1. Permission request screen — world-voiced, single CTA + skip
//   2. If granted → browser geolocation → AI reverse-geocode
//   3. Home/away confirmation — "Is [City, Province] home?"
//      → home: store full home base + current position, set location_confirmed
//      → away: store current lat/lng only, province step in onboarding handles home
//   4. If denied/skipped → advance, province step in onboarding stays active
//
// Result written to store.user:
//   lat, lng              — current position (always, if granted)
//   home_lat, home_lng    — only if confirmed as home
//   home_city             — only if confirmed as home
//   province, province_name, country — only if confirmed as home
//   location_confirmed    — true once home/away answered
// ---------------------------------------------------------------------------

// World-specific copy for the permission request screen
const LOCATION_COPY = {
  operator: {
    prompt:    'One thing before we start.',
    body:      'Location lets me route you to the right places — nearest shop, closest broker, services in your area. Better intel, faster.',
    allow:     'Allow location',
    skip:      'continue without',
  },
  range: {
    prompt:    'One thing first.',
    body:      'Knowing your territory helps me point you to the right resources when you need them.',
    allow:     'Allow location',
    skip:      'continue without',
  },
  garden: {
    prompt:    'Before we begin.',
    body:      'If I know where you are, I can point you toward the right services and support close to home.',
    allow:     'Allow location',
    skip:      'continue without',
  },
  journey: {
    prompt:    'One thing before we set out.',
    body:      'Knowing where you are helps me point you toward the right stops along the way.',
    allow:     'Allow location',
    skip:      'continue without',
  },
  playbook: {
    prompt:    'Before the first play.',
    body:      'Home field matters. Location lets me route you to the right services in your area.',
    allow:     'Allow location',
    skip:      'continue without',
  },
  summit: {
    prompt:    'Before we start the climb.',
    body:      'Knowing your location helps me point you to the right resources when conditions demand it.',
    allow:     'Allow location',
    skip:      'continue without',
  },
  practice: {
    prompt:    'One thing before the practice begins.',
    body:      'Location helps me direct you to the right services when practical needs arise.',
    allow:     'Allow location',
    skip:      'continue without',
  },
  meadow: {
    prompt:    'Just one thing.',
    body:      'If I know where you are, I can quietly point you toward what you need, close to home.',
    allow:     'Allow location',
    skip:      'continue without',
  },
};

const DEFAULT_COPY = LOCATION_COPY.operator;

export function createLocationRequest(world) {
  const el = document.createElement('div');
  el.className = 'screen';
  el.id = 'screen-location';
  el.style.cssText = 'background:#000;overflow:hidden;';

  const copy = LOCATION_COPY[world?.id] || DEFAULT_COPY;

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------

  function setContent(html) {
    return new Promise(resolve => {
      const inner = el.querySelector('#loc-inner');
      if (!inner) { resolve(); return; }
      inner.style.transition = 'opacity 0.25s ease';
      inner.style.opacity = '0';
      setTimeout(() => {
        inner.innerHTML = html;
        requestAnimationFrame(() => {
          inner.style.opacity = '1';
          setTimeout(resolve, 260);
        });
      }, 270);
    });
  }

  function setContentImmediate(html) {
    const inner = el.querySelector('#loc-inner');
    if (inner) inner.innerHTML = html;
  }

  // ---------------------------------------------------------------------------
  // GEOLOCATION
  // ---------------------------------------------------------------------------

  function requestGeolocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ granted: false });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({
          granted: true,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
        () => resolve({ granted: false }),
        { timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  // ---------------------------------------------------------------------------
  // SCREENS
  // ---------------------------------------------------------------------------

  // Screen 1 — permission request
  function renderPermissionRequest() {
    setContentImmediate(`
      <div style="display:flex;flex-direction:column;gap:24px;">
        <div style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(24px,6vw,34px);line-height:1.3;
          color:var(--color-cream-90);letter-spacing:0.01em;
        ">${copy.prompt}</div>
        <div style="
          font-family:var(--font-sans);font-weight:200;
          font-size:13px;letter-spacing:0.06em;line-height:1.7;
          color:var(--color-cream-60);
        ">${copy.body}</div>
        <div style="display:flex;flex-direction:column;gap:12px;margin-top:8px;">
          <button id="loc-allow" style="
            align-self:flex-start;
            padding:13px 32px;
            border:0.5px solid var(--color-cream-40);border-radius:2px;
            font-family:var(--font-sans);font-weight:300;
            font-size:11px;letter-spacing:0.28em;text-transform:uppercase;
            color:var(--color-cream-90);
            transition:background 0.3s ease,border-color 0.3s ease;
            cursor:pointer;background:transparent;
          ">${copy.allow}</button>
          <button id="loc-skip" style="
            align-self:flex-start;
            font-family:var(--font-sans);font-weight:200;
            font-size:10px;letter-spacing:0.22em;text-transform:uppercase;
            color:var(--color-cream-25);
            padding:8px 0;
            transition:color 0.3s ease;
            background:none;border:none;cursor:pointer;
          ">${copy.skip}</button>
        </div>
      </div>
    `);
  }

  // Screen 2 — working / resolving
  function renderWorking() {
    setContentImmediate(`
      <div style="display:flex;flex-direction:column;gap:20px;">
        <div style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(24px,6vw,34px);line-height:1.3;
          color:var(--color-cream-90);letter-spacing:0.01em;
        ">···</div>
      </div>
    `);
  }

  // Screen 3 — home/away confirmation
  async function renderHomeConfirm({ city, province_code, province_name, country_code, lat, lng }) {
    const locationLabel = [city, province_code].filter(Boolean).join(', ');

    await setContent(`
      <div style="display:flex;flex-direction:column;gap:24px;">
        <div style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(24px,6vw,34px);line-height:1.3;
          color:var(--color-cream-90);letter-spacing:0.01em;
        ">We're seeing ${locationLabel}.</div>
        <div style="
          font-family:var(--font-sans);font-weight:200;
          font-size:13px;letter-spacing:0.06em;line-height:1.7;
          color:var(--color-cream-60);
        ">Is this home, or are you away right now?</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px;">
          <button id="loc-home" style="
            padding:14px 18px;
            border:0.5px solid var(--color-cream-25);border-radius:2px;
            text-align:left;
            font-family:var(--font-sans);font-weight:300;
            font-size:clamp(12px,3vw,13px);letter-spacing:0.08em;
            color:var(--color-cream-90);
            transition:background 0.25s ease,border-color 0.25s ease;
            cursor:pointer;background:transparent;
          ">This is home</button>
          <button id="loc-away" style="
            padding:14px 18px;
            border:0.5px solid var(--color-cream-25);border-radius:2px;
            text-align:left;
            font-family:var(--font-sans);font-weight:300;
            font-size:clamp(12px,3vw,13px);letter-spacing:0.08em;
            color:var(--color-cream-90);
            transition:background 0.25s ease,border-color 0.25s ease;
            cursor:pointer;background:transparent;
          ">I'm away right now</button>
        </div>
      </div>
    `);

    return new Promise(resolve => {
      const inner   = el.querySelector('#loc-inner');
      const homeBtn = inner.querySelector('#loc-home');
      const awayBtn = inner.querySelector('#loc-away');

      function hoverOn(btn)  { btn.style.background = 'rgba(240,235,218,0.08)'; btn.style.borderColor = 'var(--color-cream-60)'; }
      function hoverOff(btn) { btn.style.background = 'transparent'; btn.style.borderColor = 'var(--color-cream-25)'; }

      homeBtn.addEventListener('mouseenter', () => hoverOn(homeBtn));
      homeBtn.addEventListener('mouseleave', () => hoverOff(homeBtn));
      awayBtn.addEventListener('mouseenter', () => hoverOn(awayBtn));
      awayBtn.addEventListener('mouseleave', () => hoverOff(awayBtn));

      homeBtn.addEventListener('click', () => {
        // Home confirmed — store full home base + current position
        const existing = store.get('user') || {};
        store.set('user', {
          ...existing,
          lat,
          lng,
          home_lat:          lat,
          home_lng:          lng,
          home_city:         city     || null,
          province:          province_code  || existing.province  || null,
          province_name:     province_name  || existing.province_name || null,
          country:           country_code   || existing.country   || null,
          location_confirmed: true,
        });
        resolve({ isHome: true, province_known: true });
      }, { once: true });

      awayBtn.addEventListener('click', () => {
        // Away — store current lat/lng only, home province TBD via onboarding
        const existing = store.get('user') || {};
        store.set('user', {
          ...existing,
          lat,
          lng,
          location_confirmed: true,
        });
        resolve({ isHome: false, province_known: false });
      }, { once: true });
    });
  }

  // Screen 4 — denied / skipped gracefully
  async function renderDenied() {
    await setContent(`
      <div style="display:flex;flex-direction:column;gap:20px;">
        <div style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(20px,5vw,26px);line-height:1.4;
          color:var(--color-cream-90);letter-spacing:0.01em;
        ">No problem.</div>
        <div style="
          font-family:var(--font-sans);font-weight:200;
          font-size:13px;letter-spacing:0.06em;line-height:1.7;
          color:var(--color-cream-60);
        ">We'll ask where you're based as we get started.</div>
      </div>
    `);
    await new Promise(r => setTimeout(r, 1400));
  }

  // ---------------------------------------------------------------------------
  // MAIN FLOW
  // Returns { province_known: bool } so onboarding knows whether to skip
  // the province step.
  // ---------------------------------------------------------------------------

  async function run() {
    renderPermissionRequest();

    const result = await new Promise(resolve => {
      const inner    = el.querySelector('#loc-inner');
      const allowBtn = inner.querySelector('#loc-allow');
      const skipBtn  = inner.querySelector('#loc-skip');

      allowBtn.addEventListener('mouseenter', () => {
        allowBtn.style.background   = 'rgba(240,235,218,0.08)';
        allowBtn.style.borderColor  = 'var(--color-cream-60)';
      });
      allowBtn.addEventListener('mouseleave', () => {
        allowBtn.style.background  = 'transparent';
        allowBtn.style.borderColor = 'var(--color-cream-40)';
      });
      skipBtn.addEventListener('mouseenter', () => { skipBtn.style.color = 'var(--color-cream-40)'; });
      skipBtn.addEventListener('mouseleave', () => { skipBtn.style.color = 'var(--color-cream-25)'; });

      allowBtn.addEventListener('click', () => resolve('allow'), { once: true });
      skipBtn.addEventListener('click',  () => resolve('skip'),  { once: true });
    });

    if (result === 'skip') {
      await renderDenied();
      return { province_known: false };
    }

    // Fire browser permission prompt
    renderWorking();
    const geo = await requestGeolocation();

    if (!geo.granted) {
      await renderDenied();
      return { province_known: false };
    }

    // Store current lat/lng immediately — we have it regardless of home/away
    const existing = store.get('user') || {};
    store.set('user', { ...existing, lat: geo.lat, lng: geo.lng });

    // Reverse geocode
    let geocoded = { valid: false };
    try {
      geocoded = await api.reverseGeocode({ lat: geo.lat, lng: geo.lng });
    } catch { /* fall through — show home/away with coords only */ }

    if (!geocoded.valid) {
      // Couldn't name the location — still ask home/away with what we have
      geocoded = { city: null, province_code: null, province_name: null, country_code: null, valid: false };
    }

    // Home/away confirmation
    const confirmation = await renderHomeConfirm({
      city:          geocoded.city,
      province_code: geocoded.province_code,
      province_name: geocoded.province_name,
      country_code:  geocoded.country_code,
      lat:           geo.lat,
      lng:           geo.lng,
    });

    return { province_known: confirmation.province_known };
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------

  return {
    el,
    async mount(container) {
      el.innerHTML = `
        <div style="
          position:absolute;inset:0;
          background:linear-gradient(to bottom,rgba(0,0,0,0.3) 0%,rgba(0,0,0,0.85) 100%);
        "></div>
        <div style="
          position:absolute;inset:0;
          display:flex;flex-direction:column;
          padding:
            max(52px, calc(var(--safe-top) + 28px))
            32px
            max(52px, calc(var(--safe-bottom) + 32px));
          justify-content:flex-end;
        ">
          <div id="loc-inner" style="
            opacity:0;animation:fadeIn 0.8s ease-out 0.2s both;
          "></div>
        </div>
      `;
      container.appendChild(el);
      // Let the fade-in animation complete before rendering content
      await new Promise(r => setTimeout(r, 300));
      return run();
    },
    unmount() {
      return transitions.fadeOut(el, 700).then(() => el.remove());
    },
  };
}
