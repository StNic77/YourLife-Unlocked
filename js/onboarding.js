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
//   arrival → situation → mission (AI tiles) → execution →
//   service_support → command_signals → closeout
// ---------------------------------------------------------------------------

const STEPS = [
  'arrival',
  'situation',
  'mission',
  'execution',
  'service_support',
  'command_signals',
  'closeout',
];

export function createOnboarding(world, allWorlds) {
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

  function loadingCard(prompt) {
    return `
      <div style="display:flex;flex-direction:column;gap:20px;">
        <div style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(20px,5vw,28px);line-height:1.3;
          color:var(--color-cream-90);letter-spacing:0.01em;
        ">${prompt}</div>
        <div style="
          font-family:var(--font-sans);font-weight:200;
          font-size:11px;letter-spacing:0.22em;text-transform:uppercase;
          color:var(--color-cream-25);
          padding:8px 0;
        ">···</div>
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

    // Show loading state immediately (no await — don't block the API call)
    const inner = el.querySelector('#ob-inner');
    if (inner) {
      inner.style.transition = 'opacity 0.25s ease';
      inner.style.opacity = '0';
      setTimeout(() => {
        inner.innerHTML = loadingCard(m.prompt);
        inner.style.opacity = '1';
      }, 270);
    }

    let tiles;
    try {
      tiles = await api.getMissionTiles({
        worldId: world.id,
        worldData: allWorlds,
        situationAnswer: answers.situation || 'not specified',
      });
    } catch (err) {
      console.error('Mission tile generation failed:', err);
      tiles = [
        { id: 'health',        label: 'Health' },
        { id: 'finances',      label: 'Finances' },
        { id: 'relationships', label: 'Relationships' },
        { id: 'work',          label: 'Work and career' },
      ];
    }

    const hiddenTile = m.hidden_tile;
    const allTiles = [...tiles, hiddenTile];

    await setContent(tileCard({
      prompt: m.prompt,
      tiles: allTiles,
      multi: true,
      isHidden: hiddenTile.id,
    }));

    attachTileListeners({
      multi: true,
      onConfirm: selected => {
        answers.mission = selected;
        store.set('onboarding_mission', selected);
        advance();
      },
    });
  }

  async function renderExecution() {
    await setContent(statementCard({
      text: smesc.execution.statement,
      ctaLabel: 'understood',
    }));
    attachCtaListener(() => advance());
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
    await setContent(statementCard({
      text: smesc.command_signals.statement,
      ctaLabel: 'good',
    }));
    attachCtaListener(() => advance());
  }

  async function renderCloseout() {
    await setContent(statementCard({
      text: smesc.closeout,
      ctaLabel: 'lets go',
    }));
    attachCtaListener(() => {
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
