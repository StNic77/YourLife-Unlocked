import { transitions } from './transitions.js';
import { store } from './store.js';
import { api } from './api.js';

// ---------------------------------------------------------------------------
// ONBOARDING MODULE
// Implements the SMESC flow for any world. The Operator is the template —
// every other world's onboarding runs through the same state machine with
// its own copy from worlds.json.
//
// Flow:
//   arrival → situation → mission (static tiles) → execution →
//   service_support → command_signals → closeout
// ---------------------------------------------------------------------------

const STEPS = [
  'arrival',
  'name',
  'pronouns',
  'country',
  'province',
  'situation',
  'mission',
  'execution',
  'service_support',
  'command_signals',
  'closeout',
];

export function createOnboarding(world, { provinceKnown = false } = {}) {
  const el = document.createElement('div');
  el.className = 'screen';
  el.id = 'screen-onboarding';
  el.style.cssText = 'background:#000;overflow:hidden;';

  let currentStep = 0;
  let resolveComplete = null;
  const answers = {};

  const smesc = world.onboarding.smesc;

  // ---------------------------------------------------------------------------
  // CONTENT SWAP
  // Returns a Promise that resolves after the new HTML is in the DOM and
  // visible. All step renderers await this before attaching listeners —
  // no setTimeout races.
  // ---------------------------------------------------------------------------

  function setContent(html, { fadeIn = true } = {}) {
    return new Promise(resolve => {
      const inner = el.querySelector('#ob-inner');
      if (!inner) { resolve(); return; }

      if (fadeIn) {
        inner.style.transition = 'opacity 0.25s ease';
        inner.style.opacity = '0';
        setTimeout(() => {
          inner.innerHTML = html;
          requestAnimationFrame(() => {
            inner.style.opacity = '1';
            setTimeout(resolve, 260);
          });
        }, 270);
      } else {
        inner.innerHTML = html;
        resolve();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // HTML BUILDERS
  // ---------------------------------------------------------------------------

  function statementCard({ text, sub = null, ctaLabel = null }) {
    return `
      <div style="display:flex;flex-direction:column;gap:20px;">
        <div style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(24px,6vw,34px);line-height:1.3;
          color:var(--color-cream-90);letter-spacing:0.01em;
        ">${text}</div>
        ${sub ? `<div style="
          font-family:var(--font-sans);font-weight:200;
          font-size:11px;letter-spacing:0.2em;text-transform:uppercase;
          color:var(--color-cream-40);
        ">${sub}</div>` : ''}
        ${ctaLabel ? `<button class="ob-cta" data-action="next" style="
          align-self:flex-start;margin-top:8px;
          padding:13px 32px;
          border:0.5px solid var(--color-cream-40);border-radius:2px;
          font-family:var(--font-sans);font-weight:300;
          font-size:11px;letter-spacing:0.28em;text-transform:uppercase;
          color:var(--color-cream-90);
          transition:background 0.3s ease,border-color 0.3s ease;
        ">${ctaLabel}</button>` : ''}
      </div>
    `;
  }

  function tileCard({ prompt, tiles, multi = false, isHidden = null }) {
    const tilesHtml = tiles.map(t => {
      const hidden = isHidden && t.id === isHidden;
      return `
        <button
          class="ob-tile"
          data-id="${t.id}"
          style="
            padding:14px 18px;
            border:0.5px solid ${hidden ? 'var(--color-cream-15)' : 'var(--color-cream-25)'};
            border-radius:2px;
            text-align:left;
            font-family:var(--font-sans);font-weight:300;
            font-size:clamp(12px,3vw,13px);letter-spacing:0.08em;
            color:${hidden ? 'var(--color-cream-40)' : 'var(--color-cream-90)'};
            transition:background 0.25s ease,border-color 0.25s ease,color 0.25s ease;
            cursor:pointer;
          "
        >${t.label}</button>
      `;
    }).join('');

    return `
      <div style="display:flex;flex-direction:column;gap:20px;">
        <div style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(20px,5vw,28px);line-height:1.3;
          color:var(--color-cream-90);letter-spacing:0.01em;
        ">${prompt}</div>
        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:10px;
        ">${tilesHtml}</div>
        <button class="ob-cta" data-action="confirm" disabled style="
          align-self:flex-start;margin-top:4px;
          padding:13px 32px;
          border:0.5px solid var(--color-cream-15);border-radius:2px;
          font-family:var(--font-sans);font-weight:300;
          font-size:11px;letter-spacing:0.28em;text-transform:uppercase;
          color:var(--color-cream-40);
          transition:all 0.3s ease;
          cursor:default;
        ">confirm</button>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // STEP RENDERERS
  // All async. All await setContent before attaching listeners.
  // ---------------------------------------------------------------------------

  async function renderArrival() {
    await setContent(statementCard({
      text: world.onboarding.arrival,
      ctaLabel: 'continue',
    }), { fadeIn: false });
    attachCtaListener(() => advance());
  }


  // ---------------------------------------------------------------------------
  // NAME
  // ---------------------------------------------------------------------------

  async function renderName() {
    const worldPrompts = {
      operator:  "What do I call you?",
      range:     "What do they call you?",
      garden:    "What's your name?",
      journey:   "What's your name?",
      playbook:  "What do I call you?",
      summit:    "What's your name?",
      practice:  "What's your name?",
      meadow:    "What would you like to be called?",
    };
    const prompt = worldPrompts[world.id] || "What's your name?";

    await setContent(`
      <div style="display:flex;flex-direction:column;gap:20px;">
        <div style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(24px,6vw,34px);line-height:1.3;
          color:var(--color-cream-90);letter-spacing:0.01em;
        ">${prompt}</div>
        <input
          id="ob-name-input"
          type="text"
          placeholder="First name"
          autocomplete="given-name"
          style="
            background:transparent;
            border:none;
            border-bottom:0.5px solid var(--color-cream-25);
            border-radius:0;
            padding:10px 0;
            font-family:var(--font-sans);font-weight:200;
            font-size:16px;letter-spacing:0.04em;
            color:var(--color-cream-90);
            outline:none;
            width:100%;
            transition:border-color 0.2s;
          "
        />
        <button class="ob-cta" data-action="confirm" disabled style="
          align-self:flex-start;margin-top:4px;
          padding:13px 32px;
          border:0.5px solid var(--color-cream-15);border-radius:2px;
          font-family:var(--font-sans);font-weight:300;
          font-size:11px;letter-spacing:0.28em;text-transform:uppercase;
          color:var(--color-cream-40);
          transition:all 0.3s ease;cursor:default;
        ">continue</button>
      </div>
    `);

    await new Promise(resolve => {
      const inner = el.querySelector('#ob-inner');
      const input = inner.querySelector('#ob-name-input');
      const btn   = inner.querySelector('.ob-cta[data-action="confirm"]');

      input.focus();

      input.addEventListener('focus', () => { input.style.borderBottomColor = 'var(--color-cream-60)'; });
      input.addEventListener('blur',  () => { input.style.borderBottomColor = 'var(--color-cream-25)'; });

      input.addEventListener('input', () => {
        const has = input.value.trim().length > 0;
        btn.disabled = !has;
        btn.style.borderColor = has ? 'var(--color-cream-40)' : 'var(--color-cream-15)';
        btn.style.color       = has ? 'var(--color-cream-90)' : 'var(--color-cream-40)';
        btn.style.cursor      = has ? 'pointer' : 'default';
      });

      const confirm = () => {
        const val = input.value.trim();
        if (!val) return;
        answers.name = val;
        resolve();
      };

      input.addEventListener('keydown', e => { if (e.key === 'Enter') confirm(); });

      btn.addEventListener('mouseenter', () => {
        if (!btn.disabled) { btn.style.background = 'rgba(240,235,218,0.08)'; btn.style.borderColor = 'var(--color-cream-60)'; }
      });
      btn.addEventListener('mouseleave', () => {
        if (!btn.disabled) { btn.style.background = 'transparent'; btn.style.borderColor = 'var(--color-cream-40)'; }
      });
      btn.addEventListener('click', confirm, { once: true });
    });

    advance();
  }

  // ---------------------------------------------------------------------------
  // PRONOUNS
  // ---------------------------------------------------------------------------

  async function renderPronouns() {
    await setContent(tileCard({
      prompt: 'How do you refer to yourself?',
      tiles: [
        { id: 'he',   label: 'He / him' },
        { id: 'she',  label: 'She / her' },
        { id: 'they', label: 'They / them' },
        { id: 'skip', label: 'Prefer not to say' },
      ],
      multi: false,
    }));

    attachTileListeners({
      multi: false,
      onConfirm: selected => {
        answers.pronouns = selected[0] === 'skip' ? null : selected[0];
        advance();
      },
    });
  }

  // ---------------------------------------------------------------------------
  // COUNTRY
  // ---------------------------------------------------------------------------

  async function renderCountry() {
    await setContent(tileCard({
      prompt: 'Where are you based?',
      tiles: [
        { id: 'CA',    label: 'Canada' },
        { id: 'US',    label: 'United States' },
        { id: 'UK',    label: 'United Kingdom' },
        { id: 'other', label: 'Somewhere else' },
      ],
      multi: false,
    }));

    attachTileListeners({
      multi: false,
      onConfirm: selected => {
        answers.country = selected[0];
        advance();
      },
    });
  }

  // ---------------------------------------------------------------------------
  // PROVINCE / STATE / REGION
  // Text input, AI-resolved. Escapable with a warning.
  // ---------------------------------------------------------------------------

  async function renderProvince() {
    // If location module already captured home province, skip this step silently
    if (provinceKnown) {
      advance();
      return;
    }

    const placeholders = {
      CA: 'e.g. BC, Alberta, Ontario',
      US: 'e.g. WA, Texas, New York',
      UK: 'e.g. ENG, Scotland, Wales',
      other: 'Province, state, or region',
    };
    const placeholder = placeholders[answers.country] || placeholders.other;

    const worldSkipWarning = {
      operator:  'Some features need your location to operate. You can add it later.',
      range:     'Some things work better when I know your territory. You can add it later.',
      garden:    "I'll be able to tend things better once I know where you are. You can add it later.",
      journey:   'Some features need your location to work fully. You can add it later.',
      playbook:  'Some plays need a home field. You can add it later.',
      summit:    'Some conditions depend on knowing your region. You can add it later.',
      practice:  'Some features need your location. You can add it later.',
      meadow:    'A few things work better when I know where you are. You can add it later.',
    };
    const skipWarning = worldSkipWarning[world.id] || 'Some features need your location to work fully. You can add it later.';

    await setContent(`
      <div style="display:flex;flex-direction:column;gap:20px;">
        <div style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(24px,6vw,34px);line-height:1.3;
          color:var(--color-cream-90);letter-spacing:0.01em;
        ">Which province or state?</div>
        <input
          id="ob-province-input"
          type="text"
          placeholder="${placeholder}"
          autocomplete="address-level1"
          style="
            background:transparent;
            border:none;
            border-bottom:0.5px solid var(--color-cream-25);
            border-radius:0;
            padding:10px 0;
            font-family:var(--font-sans);font-weight:200;
            font-size:16px;letter-spacing:0.04em;
            color:var(--color-cream-90);
            outline:none;
            width:100%;
            transition:border-color 0.2s;
          "
        />
        <div id="ob-province-status" style="
          font-family:var(--font-sans);font-weight:200;
          font-size:11px;letter-spacing:0.12em;
          color:var(--color-cream-40);
          min-height:16px;
          transition:opacity 0.2s;
        "></div>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:4px;">
          <button class="ob-cta" data-action="confirm" disabled style="
            padding:13px 32px;
            border:0.5px solid var(--color-cream-15);border-radius:2px;
            font-family:var(--font-sans);font-weight:300;
            font-size:11px;letter-spacing:0.28em;text-transform:uppercase;
            color:var(--color-cream-40);
            transition:all 0.3s ease;cursor:default;
          ">continue</button>
          <button id="ob-province-skip" style="
            font-family:var(--font-sans);font-weight:200;
            font-size:10px;letter-spacing:0.22em;text-transform:uppercase;
            color:var(--color-cream-25);
            padding:8px 0;
            transition:color 0.3s ease;
            background:none;border:none;cursor:pointer;
          ">skip for now</button>
        </div>
      </div>
    `);

    await new Promise(resolve => {
      const inner      = el.querySelector('#ob-inner');
      const input      = inner.querySelector('#ob-province-input');
      const btn        = inner.querySelector('.ob-cta[data-action="confirm"]');
      const skipBtn    = inner.querySelector('#ob-province-skip');
      const statusEl   = inner.querySelector('#ob-province-status');

      let resolveTimer  = null;
      let lastValidated = '';
      let resolvedCode  = null;
      let resolvedName  = null;

      input.focus();
      input.addEventListener('focus', () => { input.style.borderBottomColor = 'var(--color-cream-60)'; });
      input.addEventListener('blur',  () => { input.style.borderBottomColor = 'var(--color-cream-25)'; });

      // Debounced AI resolution — fires 700ms after the user stops typing
      input.addEventListener('input', () => {
        const val = input.value.trim();

        // Reset confirm state while user is typing
        btn.disabled = true;
        btn.style.borderColor = 'var(--color-cream-15)';
        btn.style.color       = 'var(--color-cream-40)';
        btn.style.cursor      = 'default';
        resolvedCode = null;
        resolvedName = null;

        if (resolveTimer) clearTimeout(resolveTimer);

        if (!val) {
          statusEl.textContent = '';
          lastValidated = '';
          return;
        }

        statusEl.textContent = '···';

        resolveTimer = setTimeout(async () => {
          if (val !== input.value.trim()) return; // stale — user kept typing
          if (val === lastValidated) return;       // already resolved this value
          lastValidated = val;

          try {
            const result = await api.resolveProvince({ input: val, country: answers.country || 'CA' });

            if (result.valid) {
              resolvedCode = result.code;
              resolvedName = result.name;
              statusEl.textContent = result.name;
              statusEl.style.color = 'var(--color-cream-60)';

              // Enable confirm
              btn.disabled = false;
              btn.style.borderColor = 'var(--color-cream-40)';
              btn.style.color       = 'var(--color-cream-90)';
              btn.style.cursor      = 'pointer';
            } else {
              resolvedCode = null;
              resolvedName = null;
              statusEl.textContent = 'Not recognised — try the full name or abbreviation';
              statusEl.style.color = 'rgba(240,235,218,0.3)';
            }
          } catch {
            statusEl.textContent = '';
          }
        }, 700);
      });

      // Confirm — only fires if AI has resolved
      btn.addEventListener('mouseenter', () => {
        if (!btn.disabled) { btn.style.background = 'rgba(240,235,218,0.08)'; btn.style.borderColor = 'var(--color-cream-60)'; }
      });
      btn.addEventListener('mouseleave', () => {
        if (!btn.disabled) { btn.style.background = 'transparent'; btn.style.borderColor = 'var(--color-cream-40)'; }
      });
      btn.addEventListener('click', () => {
        if (btn.disabled || !resolvedCode) return;
        answers.province      = resolvedCode;
        answers.province_name = resolvedName;
        resolve();
      }, { once: true });

      // Skip — show inline warning, then advance after brief pause
      skipBtn.addEventListener('mouseenter', () => { skipBtn.style.color = 'var(--color-cream-40)'; });
      skipBtn.addEventListener('mouseleave', () => { skipBtn.style.color = 'var(--color-cream-25)'; });
      skipBtn.addEventListener('click', () => {
        answers.province      = null;
        answers.province_name = null;
        skipBtn.style.display = 'none';
        btn.style.display     = 'none';
        statusEl.textContent  = skipWarning;
        statusEl.style.color  = 'rgba(240,235,218,0.35)';
        if (resolveTimer) clearTimeout(resolveTimer);
        setTimeout(() => resolve(), 1800);
      }, { once: true });
    });

    advance();
  }

  async function renderSituation() {
    const s = smesc.situation;
    await setContent(tileCard({
      prompt: s.prompt,
      tiles: s.tiles,
      multi: false,
    }));
    attachTileListeners({
      multi: false,
      onConfirm: selected => {
        answers.situation = selected[0];
        advance();
      },
    });
  }

  async function renderMission() {
    const m = smesc.mission;

    await setContent(tileCard({
      prompt: m.prompt,
      tiles: m.tiles,
      multi: true,
    }));

    attachTileListeners({
      multi: true,
      onConfirm: selected => {
        answers.mission = selected;
        advance();
      },
    });
  }

  async function renderExecution() {
    const s = smesc.execution;
    // Show the statement with a prompt for how they'll approach it
    await setContent(`
      <div style="display:flex;flex-direction:column;gap:24px;">
        <div style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(24px,6vw,34px);line-height:1.3;
          color:var(--color-cream-90);letter-spacing:0.01em;
        ">${s.statement}</div>
        <div style="
          font-family:var(--font-sans);font-weight:200;
          font-size:11px;letter-spacing:0.2em;text-transform:uppercase;
          color:var(--color-cream-40);margin-top:4px;
        ">how you'll approach it</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${[
            { id: 'steady',    label: 'Steady and consistent' },
            { id: 'aggressive',label: 'Hard and fast' },
            { id: 'adaptive',  label: 'Read and adjust' },
            { id: 'patient',   label: 'Long game' },
          ].map(t => `
            <button class="ob-tile" data-id="${t.id}" style="
              padding:14px 18px;
              border:0.5px solid var(--color-cream-25);border-radius:2px;
              text-align:left;
              font-family:var(--font-sans);font-weight:300;
              font-size:clamp(12px,3vw,13px);letter-spacing:0.08em;
              color:var(--color-cream-90);
              transition:background 0.25s ease,border-color 0.25s ease;
              cursor:pointer;
            ">${t.label}</button>
          `).join('')}
        </div>
        <button class="ob-cta" data-action="confirm" disabled style="
          align-self:flex-start;margin-top:4px;
          padding:13px 32px;
          border:0.5px solid var(--color-cream-15);border-radius:2px;
          font-family:var(--font-sans);font-weight:300;
          font-size:11px;letter-spacing:0.28em;text-transform:uppercase;
          color:var(--color-cream-40);
          transition:all 0.3s ease;cursor:default;
        ">confirmed</button>
      </div>
    `);
    attachTileListeners({
      multi: false,
      onConfirm: selected => {
        answers.execution = selected[0];
        advance();
      },
    });
  }

  async function renderServiceSupport() {
    const ss = smesc.service_support;
    await setContent(tileCard({
      prompt: ss.prompt,
      tiles: ss.tiles,
      multi: true,
    }));
    attachTileListeners({
      multi: true,
      onConfirm: selected => {
        answers.service_support = selected;
        advance();
      },
    });
  }

  async function renderCommandSignals() {
    const cs = smesc.command_signals;
    await setContent(`
      <div style="display:flex;flex-direction:column;gap:24px;">
        <div style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(24px,6vw,34px);line-height:1.3;
          color:var(--color-cream-90);letter-spacing:0.01em;
        ">${cs.statement}</div>
        <div style="
          font-family:var(--font-sans);font-weight:200;
          font-size:11px;letter-spacing:0.2em;text-transform:uppercase;
          color:var(--color-cream-40);margin-top:4px;
        ">what to watch for</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${[
            { id: 'slipping',   label: 'Things slipping through' },
            { id: 'patterns',   label: 'Patterns I\'m missing' },
            { id: 'timing',     label: 'Bad timing' },
            { id: 'blindspots', label: 'Blind spots' },
          ].map(t => `
            <button class="ob-tile" data-id="${t.id}" style="
              padding:14px 18px;
              border:0.5px solid var(--color-cream-25);border-radius:2px;
              text-align:left;
              font-family:var(--font-sans);font-weight:300;
              font-size:clamp(12px,3vw,13px);letter-spacing:0.08em;
              color:var(--color-cream-90);
              transition:background 0.25s ease,border-color 0.25s ease;
              cursor:pointer;
            ">${t.label}</button>
          `).join('')}
        </div>
        <button class="ob-cta" data-action="confirm" disabled style="
          align-self:flex-start;margin-top:4px;
          padding:13px 32px;
          border:0.5px solid var(--color-cream-15);border-radius:2px;
          font-family:var(--font-sans);font-weight:300;
          font-size:11px;letter-spacing:0.28em;text-transform:uppercase;
          color:var(--color-cream-40);
          transition:all 0.3s ease;cursor:default;
        ">confirmed</button>
      </div>
    `);
    attachTileListeners({
      multi: true,
      onConfirm: selected => {
        answers.command_signals = selected;
        advance();
      },
    });
  }

  async function renderCloseout() {
    await setContent(`
      <div style="display:flex;flex-direction:column;gap:28px;">
        <div style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(28px,7vw,42px);line-height:1.2;
          color:var(--color-cream-90);letter-spacing:0.01em;
        ">${smesc.closeout}</div>
        <button class="ob-cta" data-action="next" style="
          align-self:flex-start;margin-top:12px;
          padding:13px 32px;
          border:0.5px solid var(--color-cream-40);border-radius:2px;
          font-family:var(--font-sans);font-weight:300;
          font-size:11px;letter-spacing:0.28em;text-transform:uppercase;
          color:var(--color-cream-90);
          transition:background 0.3s ease,border-color 0.3s ease;
        ">move out</button>
      </div>
    `);
    attachCtaListener(() => {
      // Write user identity fields
      store.set('user', {
        name:          answers.name      || null,
        pronouns:      answers.pronouns  || null,
        country:       answers.country   || null,
        province:      answers.province  || null,
        province_name: answers.province_name || null,
        joined:        new Date().toISOString().split('T')[0],
      });

      store.set('onboarding', {
        complete: true,
        worldId: world.id,
        answers,
        completedAt: Date.now(),
      });
      if (resolveComplete) resolveComplete({ world, answers, next: 'team' });
    });
  }

  // ---------------------------------------------------------------------------
  // EVENT HELPERS
  // Called after setContent resolves — elements are guaranteed in the DOM.
  // ---------------------------------------------------------------------------

  function attachCtaListener(callback) {
    const inner = el.querySelector('#ob-inner');
    if (!inner) return;
    const btn = inner.querySelector('.ob-cta[data-action="next"]');
    if (!btn) return;

    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(240,235,218,0.08)';
      btn.style.borderColor = 'var(--color-cream-60)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'transparent';
      btn.style.borderColor = 'var(--color-cream-40)';
    });
    btn.addEventListener('click', callback, { once: true });
  }

  function attachTileListeners({ multi, onConfirm }) {
    const inner = el.querySelector('#ob-inner');
    if (!inner) return;

    const tiles = inner.querySelectorAll('.ob-tile');
    const confirmBtn = inner.querySelector('.ob-cta[data-action="confirm"]');
    const selected = new Set();

    function updateConfirmState() {
      const has = selected.size > 0;
      confirmBtn.disabled = !has;
      confirmBtn.style.borderColor = has ? 'var(--color-cream-40)' : 'var(--color-cream-15)';
      confirmBtn.style.color = has ? 'var(--color-cream-90)' : 'var(--color-cream-40)';
      confirmBtn.style.cursor = has ? 'pointer' : 'default';
    }

    tiles.forEach(tile => {
      tile.addEventListener('mouseenter', () => {
        if (!selected.has(tile.dataset.id)) {
          tile.style.background = 'rgba(240,235,218,0.06)';
          tile.style.borderColor = 'var(--color-cream-40)';
        }
      });
      tile.addEventListener('mouseleave', () => {
        if (!selected.has(tile.dataset.id)) {
          tile.style.background = 'transparent';
          tile.style.borderColor = 'var(--color-cream-25)';
        }
      });
      tile.addEventListener('click', () => {
        if (!multi) {
          tiles.forEach(t => {
            t.style.background = 'transparent';
            t.style.borderColor = 'var(--color-cream-25)';
          });
          selected.clear();
          selected.add(tile.dataset.id);
          tile.style.background = 'rgba(240,235,218,0.12)';
          tile.style.borderColor = 'var(--color-cream-90)';
        } else {
          if (selected.has(tile.dataset.id)) {
            selected.delete(tile.dataset.id);
            tile.style.background = 'transparent';
            tile.style.borderColor = 'var(--color-cream-25)';
          } else {
            selected.add(tile.dataset.id);
            tile.style.background = 'rgba(240,235,218,0.12)';
            tile.style.borderColor = 'var(--color-cream-90)';
          }
        }
        updateConfirmState();
      });
    });

    confirmBtn.addEventListener('mouseenter', () => {
      if (!confirmBtn.disabled) confirmBtn.style.background = 'rgba(240,235,218,0.08)';
    });
    confirmBtn.addEventListener('mouseleave', () => {
      if (!confirmBtn.disabled) confirmBtn.style.background = 'transparent';
    });
    confirmBtn.addEventListener('click', () => {
      if (!confirmBtn.disabled) onConfirm([...selected]);
    });
  }

  // ---------------------------------------------------------------------------
  // PROGRESS DOTS
  // ---------------------------------------------------------------------------

  function updateProgressDots() {
    const dotsEl = el.querySelector('#ob-dots');
    if (!dotsEl) return;
    dotsEl.innerHTML = STEPS.map((_, i) => `
      <div style="
        width:${i === currentStep ? 16 : 4}px;height:3px;
        border-radius:${i === currentStep ? 2 : 50}px;
        background:${i <= currentStep ? 'var(--color-cream-60)' : 'var(--color-cream-15)'};
        transition:all 0.4s ease;
      "></div>
    `).join('');
  }

  // ---------------------------------------------------------------------------
  // STEP MACHINE
  // ---------------------------------------------------------------------------

  const stepRenderers = {
    arrival:         renderArrival,
    name:            renderName,
    pronouns:        renderPronouns,
    country:         renderCountry,
    province:        renderProvince,
    situation:       renderSituation,
    mission:         renderMission,
    execution:       renderExecution,
    service_support: renderServiceSupport,
    command_signals: renderCommandSignals,
    closeout:        renderCloseout,
  };

  function advance() {
    currentStep = Math.min(currentStep + 1, STEPS.length - 1);
    renderStep();
  }

  function renderStep() {
    updateProgressDots();
    const renderer = stepRenderers[STEPS[currentStep]];
    if (renderer) renderer();
  }

  // ---------------------------------------------------------------------------
  // SCAFFOLD
  // ---------------------------------------------------------------------------

  function buildScaffold() {
    el.innerHTML = `
      <div style="
        position:absolute;inset:0;
        background:linear-gradient(
          to bottom,
          rgba(0,0,0,0.3) 0%,
          rgba(0,0,0,0.85) 100%
        );
      "></div>

      <div style="
        position:absolute;inset:0;
        display:flex;flex-direction:column;
        padding:
          max(52px, calc(var(--safe-top) + 28px))
          32px
          max(52px, calc(var(--safe-bottom) + 32px));
      ">
        <div style="
          display:flex;justify-content:space-between;align-items:center;
          margin-bottom:32px;
          opacity:0;animation:fadeIn 0.8s ease-out 0.1s both;
        ">
          <div style="
            font-family:var(--font-sans);font-weight:200;
            font-size:10px;letter-spacing:0.3em;text-transform:uppercase;
            color:var(--color-cream-25);
          ">${world.name.toLowerCase()}</div>

          <button id="ob-back" style="
            font-family:var(--font-sans);font-weight:200;
            font-size:10px;letter-spacing:0.22em;text-transform:uppercase;
            color:var(--color-cream-25);
            padding:8px;
            transition:color 0.3s ease;
          ">← back</button>
        </div>

        <div id="ob-dots" style="
          display:flex;gap:5px;align-items:center;
          margin-bottom:40px;
          opacity:0;animation:fadeIn 0.8s ease-out 0.2s both;
        "></div>

        <div id="ob-inner" style="
          flex:1;
          overflow-y:auto;
          -webkit-overflow-scrolling:touch;
        "></div>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // BACK BUTTON
  // Copy is a placeholder — Session 8 workshop item per the handoff.
  // Principle is locked: the person is always in command, never trapped.
  // ---------------------------------------------------------------------------

  function attachBackListener(onBack) {
    const backBtn = el.querySelector('#ob-back');
    if (!backBtn) return;
    backBtn.addEventListener('mouseenter', () => {
      backBtn.style.color = 'var(--color-cream-60)';
    });
    backBtn.addEventListener('mouseleave', () => {
      backBtn.style.color = 'var(--color-cream-25)';
    });
    backBtn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        renderStep();
      } else {
        if (onBack) onBack();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------

  return {
    el,
    mount(container, { onBack } = {}) {
      buildScaffold();
      container.appendChild(el);
      attachBackListener(onBack);
      updateProgressDots();
      renderStep();

      return new Promise(resolve => {
        resolveComplete = resolve;
      });
    },
    unmount() {
      return transitions.fadeOut(el, 700).then(() => el.remove());
    },
  };
}
