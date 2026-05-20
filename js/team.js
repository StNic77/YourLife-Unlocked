import { store } from './store.js';
import { api } from './api.js';
import { transitions } from './transitions.js';

// ---------------------------------------------------------------------------
// TEAM MODULE
// Runs immediately after the SMESC closeout — same visual scaffold,
// same interaction language. Builds the app's model of who the user
// is doing this for, through a vertical AI-supported cascade.
//
// Flow:
//   intro → partner cascade (AI reflections) → children → coordinating → done
//
// Escape available at every step. Saves whatever has been gathered.
// ---------------------------------------------------------------------------

const STEPS = [
  'intro',
  'partner',
  'children',
  'coordinating',
  'done',
];

export function createTeam(world) {
  const el = document.createElement('div');
  el.className = 'screen';
  el.id = 'screen-team';
  el.style.cssText = 'background:#000;overflow:hidden;';

  let currentStep = 0;
  let resolveComplete = null;

  // Accumulated data — written to store on escape or completion
  const teamData = {
    partner: {},
    children: [],
    coordinating: {},
    complete: false,
  };

  // ---------------------------------------------------------------------------
  // CONTENT SWAP — identical pattern to onboarding.js
  // ---------------------------------------------------------------------------

  function setContent(html, { fadeIn = true } = {}) {
    return new Promise(resolve => {
      const inner = el.querySelector('#team-inner');
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
  // SHARED SAVE + EXIT
  // Writes whatever has been gathered and resolves the module promise.
  // ---------------------------------------------------------------------------

  function saveAndExit() {
    store.set('team', teamData);
    if (resolveComplete) resolveComplete({ teamData });
  }

  // ---------------------------------------------------------------------------
  // HTML BUILDERS — mirror the onboarding visual language exactly
  // ---------------------------------------------------------------------------

  function statementCard({ text, sub = null, ctaLabel = null, escapeLabel = null }) {
    return `
      <div style="display:flex;flex-direction:column;gap:20px;">
        <div style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(20px,5vw,28px);line-height:1.4;
          color:var(--color-cream-90);letter-spacing:0.01em;
        ">${text}</div>
        ${sub ? `<div style="
          font-family:var(--font-sans);font-weight:200;
          font-size:11px;letter-spacing:0.2em;text-transform:uppercase;
          color:var(--color-cream-40);
        ">${sub}</div>` : ''}
        ${ctaLabel ? `<button class="team-cta" data-action="next" style="
          align-self:flex-start;margin-top:8px;
          padding:13px 32px;
          border:0.5px solid var(--color-cream-40);border-radius:2px;
          font-family:var(--font-sans);font-weight:300;
          font-size:11px;letter-spacing:0.28em;text-transform:uppercase;
          color:var(--color-cream-90);
          transition:background 0.3s ease,border-color 0.3s ease;
        ">${ctaLabel}</button>` : ''}
        ${escapeLabel ? escapeBtn(escapeLabel) : ''}
      </div>
    `;
  }

  function inputCard({ prompt, placeholder, inputId, reflection = null }) {
    return `
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(20px,5vw,26px);line-height:1.4;
          color:var(--color-cream-90);letter-spacing:0.01em;
        ">${prompt}</div>
        ${reflection ? `<div class="team-reflection" style="
          font-family:var(--font-sans);font-weight:200;
          font-size:12px;letter-spacing:0.04em;
          color:var(--color-cream-40);
          font-style:italic;
          line-height:1.6;
          padding:10px 0 2px;
          border-top:0.5px solid var(--color-cream-15);
        ">${reflection}</div>` : ''}
        <input
          id="${inputId}"
          type="text"
          placeholder="${placeholder}"
          autocomplete="off"
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
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:4px;">
          <button class="team-cta" data-action="next" disabled style="
            padding:13px 32px;
            border:0.5px solid var(--color-cream-15);border-radius:2px;
            font-family:var(--font-sans);font-weight:300;
            font-size:11px;letter-spacing:0.28em;text-transform:uppercase;
            color:var(--color-cream-40);
            transition:all 0.3s ease;cursor:default;
          ">continue</button>
          ${escapeBtn('that\'s enough for now')}
        </div>
      </div>
    `;
  }

  function tileCard({ prompt, tiles, multi = false, reflection = null }) {
    const tilesHtml = tiles.map(t => `
      <button
        class="team-tile"
        data-id="${t.id}"
        style="
          padding:14px 18px;
          border:0.5px solid var(--color-cream-25);border-radius:2px;
          text-align:left;
          font-family:var(--font-sans);font-weight:300;
          font-size:clamp(12px,3vw,13px);letter-spacing:0.08em;
          color:var(--color-cream-90);
          transition:background 0.25s ease,border-color 0.25s ease;
          cursor:pointer;
        "
      >${t.label}</button>
    `).join('');

    return `
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(20px,5vw,26px);line-height:1.4;
          color:var(--color-cream-90);letter-spacing:0.01em;
        ">${prompt}</div>
        ${reflection ? `<div class="team-reflection" style="
          font-family:var(--font-sans);font-weight:200;
          font-size:12px;letter-spacing:0.04em;
          color:var(--color-cream-40);font-style:italic;line-height:1.6;
          padding:10px 0 2px;border-top:0.5px solid var(--color-cream-15);
        ">${reflection}</div>` : ''}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">${tilesHtml}</div>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
          <button class="team-cta" data-action="confirm" disabled style="
            padding:13px 32px;
            border:0.5px solid var(--color-cream-15);border-radius:2px;
            font-family:var(--font-sans);font-weight:300;
            font-size:11px;letter-spacing:0.28em;text-transform:uppercase;
            color:var(--color-cream-40);
            transition:all 0.3s ease;cursor:default;
          ">confirm</button>
          ${escapeBtn('that\'s enough for now')}
        </div>
      </div>
    `;
  }

  function loadingCard(prompt) {
    return `
      <div style="display:flex;flex-direction:column;gap:20px;">
        <div style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(20px,5vw,26px);line-height:1.4;
          color:var(--color-cream-90);letter-spacing:0.01em;
        ">${prompt}</div>
        <div style="
          font-family:var(--font-sans);font-weight:200;
          font-size:11px;letter-spacing:0.22em;text-transform:uppercase;
          color:var(--color-cream-25);padding:8px 0;
        ">···</div>
      </div>
    `;
  }

  function escapeBtn(label) {
    return `<button class="team-escape" style="
      font-family:var(--font-sans);font-weight:200;
      font-size:10px;letter-spacing:0.22em;text-transform:uppercase;
      color:var(--color-cream-25);
      padding:8px 0;
      transition:color 0.3s ease;
      background:none;border:none;cursor:pointer;
    ">${label}</button>`;
  }

  // ---------------------------------------------------------------------------
  // AI REFLECTION HELPER
  // Injects a loading state, calls the API, returns the reflection text.
  // ---------------------------------------------------------------------------

  async function fetchReflection(context) {
    // Show loading inline — sets inner content to dots while API works
    const inner = el.querySelector('#team-inner');
    if (inner) {
      const reflEl = inner.querySelector('.team-reflection');
      if (reflEl) {
        reflEl.textContent = '···';
        reflEl.style.letterSpacing = '0.3em';
      }
    }

    try {
      return await api.getTeamReflection(context);
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // PARTNER CASCADE — vertical, AI-reflected
  // Each sub-step is a self-contained async function that resolves
  // when the user confirms or escapes.
  // ---------------------------------------------------------------------------

  async function runPartnerCascade() {
    const p = teamData.partner;

    // --- NAME ---
    await setContent(inputCard({
      prompt: 'Who\'s your partner?',
      placeholder: 'First name',
      inputId: 'team-input',
    }));

    p.name = await awaitInput('team-input');
    if (p.name === null) return; // escaped

    // --- TENURE ---
    await setContent(inputCard({
      prompt: `How long have you and ${p.name} been together?`,
      placeholder: 'e.g. 3 years, since 2019',
      inputId: 'team-input',
    }));

    p.tenure = await awaitInput('team-input');
    if (p.tenure === null) return;

    // --- STATE (tiles + AI reflection) ---
    await setContent(tileCard({
      prompt: 'How\'s that going, from your side?',
      tiles: [
        { id: 'solid',       label: 'Solid' },
        { id: 'good',        label: 'Pretty good' },
        { id: 'working',     label: 'We\'re working on things' },
        { id: 'complicated', label: 'It\'s complicated' },
        { id: 'rough',       label: 'Rough patch' },
      ],
      multi: false,
    }));

    p.state = await awaitTile({ multi: false });
    if (p.state === null) return;

    // AI reflection on relationship state — shown before next question
    const stateReflection = await api.getTeamReflection({
      type: 'state',
      partnerName: p.name,
      tenure: p.tenure,
      state: p.state,
    });

    // --- WORKS (tiles) ---
    await setContent(tileCard({
      prompt: `Does ${p.name} work?`,
      tiles: [
        { id: 'yes',          label: 'Yes' },
        { id: 'no',           label: 'No' },
        { id: 'part_time',    label: 'Part time' },
        { id: 'self_employed',label: 'Self-employed' },
      ],
      multi: false,
      reflection: stateReflection,
    }));

    p.works = await awaitTile({ multi: false });
    if (p.works === null) return;

    // --- PROFESSION (conditional) ---
    if (p.works !== 'no') {
      await setContent(inputCard({
        prompt: 'What does she do?',
        placeholder: 'Profession or role',
        inputId: 'team-input',
      }));

      p.profession = await awaitInput('team-input');
      if (p.profession === null) return;

      // AI reflection on profession — shown before birthday question
      const profReflection = await api.getTeamReflection({
        type: 'profession',
        partnerName: p.name,
        profession: p.profession,
        state: p.state,
      });

      // --- BIRTHDAY ---
      await setContent(inputCard({
        prompt: `${p.name}'s birthday?`,
        placeholder: 'e.g. March 14',
        inputId: 'team-input',
        reflection: profReflection,
      }));
    } else {
      // Still ask birthday even if not working
      await setContent(inputCard({
        prompt: `${p.name}'s birthday?`,
        placeholder: 'e.g. March 14',
        inputId: 'team-input',
      }));
    }

    p.birthday = await awaitInput('team-input');
    if (p.birthday === null) return;

    // --- LOVE LANGUAGE (tiles + AI reflection) ---
    const birthdayReflection = await api.getTeamReflection({
      type: 'birthday',
      partnerName: p.name,
      birthday: p.birthday,
    });

    await setContent(tileCard({
      prompt: `How does ${p.name} most feel taken care of?`,
      tiles: [
        { id: 'time',    label: 'Quality time' },
        { id: 'words',   label: 'Words' },
        { id: 'acts',    label: 'Acts of service' },
        { id: 'touch',   label: 'Affection' },
        { id: 'gifts',   label: 'Gifts' },
        { id: 'unsure',  label: 'Not sure yet' },
      ],
      multi: false,
      reflection: birthdayReflection,
    }));

    p.love_language = await awaitTile({ multi: false });
    if (p.love_language === null) return;

    // Final partner reflection before moving to children
    const finalReflection = await api.getTeamReflection({
      type: 'partner_complete',
      partnerName: p.name,
      state: p.state,
      love_language: p.love_language,
      profession: p.profession || null,
    });

    // Show final reflection as a brief statement before continuing
    if (finalReflection) {
      await setContent(statementCard({
        text: finalReflection,
        ctaLabel: 'continue',
        escapeLabel: 'that\'s enough for now',
      }));
      const next = await awaitCta();
      if (next === 'escape') return;
    }
  }

  // ---------------------------------------------------------------------------
  // CHILDREN CASCADE
  // ---------------------------------------------------------------------------

  async function runChildrenCascade() {
    // First — do they have kids?
    await setContent(tileCard({
      prompt: 'Any children?',
      tiles: [
        { id: 'yes', label: 'Yes' },
        { id: 'no',  label: 'No' },
      ],
      multi: false,
    }));

    const hasKids = await awaitTile({ multi: false });
    if (hasKids === null || hasKids === 'no') return;

    // Collect children — up to 6, escape exits loop cleanly
    let addingChildren = true;
    let childIndex = 0;

    while (addingChildren && childIndex < 6) {
      const ordinal = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'][childIndex] || `Child ${childIndex + 1}`;

      await setContent(inputCard({
        prompt: childIndex === 0
          ? 'What\'s your child\'s name?'
          : `${ordinal} child?`,
        placeholder: 'Name',
        inputId: 'team-input',
      }));

      const name = await awaitInput('team-input');
      if (name === null) return; // escaped

      await setContent(inputCard({
        prompt: `How old is ${name}?`,
        placeholder: 'Age',
        inputId: 'team-input',
      }));

      const age = await awaitInput('team-input');
      if (age === null) return;

      teamData.children.push({ name, age });
      childIndex++;

      // After each child — offer to add another or continue
      await setContent(tileCard({
        prompt: `Got it — ${name} is in the picture.`,
        tiles: [
          { id: 'another', label: 'Add another child' },
          { id: 'done',    label: 'That\'s everyone' },
        ],
        multi: false,
      }));

      const next = await awaitTile({ multi: false });
      if (next === null || next === 'done') addingChildren = false;
    }
  }

  // ---------------------------------------------------------------------------
  // COORDINATING INSTRUCTIONS
  // The user's standing orders to the app.
  // ---------------------------------------------------------------------------

  async function runCoordinating() {
    await setContent(statementCard({
      text: 'Last thing — how do you want this to work?',
      sub: 'your standing orders',
      ctaLabel: 'tell me',
      escapeLabel: 'skip this',
    }));

    const next = await awaitCta();
    if (next === 'escape') return;

    // Nudge frequency
    await setContent(tileCard({
      prompt: 'How often do you want to hear from this?',
      tiles: [
        { id: 'daily',   label: 'Daily check-in' },
        { id: 'few',     label: 'Few times a week' },
        { id: 'weekly',  label: 'Weekly' },
        { id: 'minimal', label: 'Only when it matters' },
      ],
      multi: false,
    }));

    const frequency = await awaitTile({ multi: false });
    if (frequency === null) return;
    teamData.coordinating.frequency = frequency;

    // Best time
    await setContent(tileCard({
      prompt: 'When do you do your best thinking?',
      tiles: [
        { id: 'early',   label: 'Early morning' },
        { id: 'morning', label: 'Mid-morning' },
        { id: 'evening', label: 'Evening' },
        { id: 'night',   label: 'Late night' },
        { id: 'varies',  label: 'It varies' },
      ],
      multi: false,
    }));

    const timing = await awaitTile({ multi: false });
    if (timing === null) return;
    teamData.coordinating.timing = timing;

    // Tone preference
    await setContent(tileCard({
      prompt: 'How direct do you want this?',
      tiles: [
        { id: 'straight', label: 'Straight — no cushion' },
        { id: 'balanced', label: 'Honest but considered' },
        { id: 'gentle',   label: 'Gentle when it\'s heavy' },
      ],
      multi: false,
    }));

    const tone = await awaitTile({ multi: false });
    if (tone === null) return;
    teamData.coordinating.tone = tone;
  }

  // ---------------------------------------------------------------------------
  // DONE SCREEN
  // ---------------------------------------------------------------------------

  async function renderDone() {
    teamData.complete = true;

    const partnerLine = teamData.partner.name
      ? `${teamData.partner.name} is in the picture.`
      : '';
    const kidsLine = teamData.children.length > 0
      ? `${teamData.children.map(c => c.name).join(', ')} too.`
      : '';

    const closingText = [partnerLine, kidsLine].filter(Boolean).join(' ')
      || 'The picture is starting to form.';

    await setContent(statementCard({
      text: closingText,
      sub: 'brief building',
      ctaLabel: 'let\'s go',
    }), { fadeIn: false });

    await new Promise(resolve => {
      const inner = el.querySelector('#team-inner');
      if (!inner) { resolve(); return; }
      const btn = inner.querySelector('.team-cta[data-action="next"]');
      if (!btn) { resolve(); return; }
      attachCtaHover(btn);
      btn.addEventListener('click', resolve, { once: true });
    });

    saveAndExit();
  }

  // ---------------------------------------------------------------------------
  // INTERACTION PRIMITIVES
  // Each returns a Promise that resolves with the user's answer,
  // or null if they escaped.
  // ---------------------------------------------------------------------------

  function awaitInput(inputId) {
    return new Promise(resolve => {
      const inner = el.querySelector('#team-inner');
      if (!inner) { resolve(null); return; }

      const input = inner.querySelector(`#${inputId}`);
      const nextBtn = inner.querySelector('.team-cta[data-action="next"]');
      const escape = inner.querySelector('.team-escape');

      if (!input || !nextBtn) { resolve(null); return; }

      input.focus();

      input.addEventListener('input', () => {
        const has = input.value.trim().length > 0;
        nextBtn.disabled = !has;
        nextBtn.style.borderColor = has ? 'var(--color-cream-40)' : 'var(--color-cream-15)';
        nextBtn.style.color = has ? 'var(--color-cream-90)' : 'var(--color-cream-40)';
        nextBtn.style.cursor = has ? 'pointer' : 'default';
      });

      input.addEventListener('focus', () => {
        input.style.borderBottomColor = 'var(--color-cream-60)';
      });
      input.addEventListener('blur', () => {
        input.style.borderBottomColor = 'var(--color-cream-25)';
      });

      const confirm = () => {
        const val = input.value.trim();
        if (val) resolve(val);
      };

      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') confirm();
      });

      attachCtaHover(nextBtn);
      nextBtn.addEventListener('click', confirm, { once: true });

      if (escape) {
        attachEscapeHover(escape);
        escape.addEventListener('click', () => resolve(null), { once: true });
      }
    });
  }

  function awaitTile({ multi }) {
    return new Promise(resolve => {
      const inner = el.querySelector('#team-inner');
      if (!inner) { resolve(null); return; }

      const tiles = inner.querySelectorAll('.team-tile');
      const confirmBtn = inner.querySelector('.team-cta[data-action="confirm"]');
      const escape = inner.querySelector('.team-escape');
      const selected = new Set();

      function updateConfirm() {
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

            // Single-select auto-confirms after brief delay
            setTimeout(() => {
              if (!confirmBtn.disabled) confirmBtn.click();
            }, 200);
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
            updateConfirm();
          }
        });
      });

      if (confirmBtn) {
        updateConfirm();
        confirmBtn.addEventListener('mouseenter', () => {
          if (!confirmBtn.disabled) confirmBtn.style.background = 'rgba(240,235,218,0.08)';
        });
        confirmBtn.addEventListener('mouseleave', () => {
          if (!confirmBtn.disabled) confirmBtn.style.background = 'transparent';
        });
        confirmBtn.addEventListener('click', () => {
          if (!confirmBtn.disabled) {
            resolve(multi ? [...selected] : [...selected][0]);
          }
        });
      }

      if (escape) {
        attachEscapeHover(escape);
        escape.addEventListener('click', () => resolve(null), { once: true });
      }
    });
  }

  function awaitCta() {
    return new Promise(resolve => {
      const inner = el.querySelector('#team-inner');
      if (!inner) { resolve('escape'); return; }

      const btn = inner.querySelector('.team-cta[data-action="next"]');
      const escape = inner.querySelector('.team-escape');

      if (btn) {
        attachCtaHover(btn);
        btn.addEventListener('click', () => resolve('continue'), { once: true });
      }
      if (escape) {
        attachEscapeHover(escape);
        escape.addEventListener('click', () => resolve('escape'), { once: true });
      }
    });
  }

  // ---------------------------------------------------------------------------
  // HOVER HELPERS
  // ---------------------------------------------------------------------------

  function attachCtaHover(btn) {
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(240,235,218,0.08)';
      btn.style.borderColor = 'var(--color-cream-60)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'transparent';
      btn.style.borderColor = 'var(--color-cream-40)';
    });
  }

  function attachEscapeHover(btn) {
    btn.addEventListener('mouseenter', () => {
      btn.style.color = 'var(--color-cream-40)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.color = 'var(--color-cream-25)';
    });
  }

  // ---------------------------------------------------------------------------
  // STEP RENDERERS
  // ---------------------------------------------------------------------------

  async function renderIntro() {
    await setContent(statementCard({
      text: 'One more thing. Tell me who you\'re doing this for.',
      sub: 'your team',
      ctaLabel: 'continue',
      escapeLabel: 'skip this for now',
    }), { fadeIn: false });

    const next = await awaitCta();
    if (next === 'escape') {
      saveAndExit();
      return;
    }
    advance();
  }

  async function renderPartner() {
    await runPartnerCascade();
    // Whether they completed or escaped, move on
    store.set('team', { ...teamData });
    advance();
  }

  async function renderChildren() {
    await runChildrenCascade();
    store.set('team', { ...teamData });
    advance();
  }

  async function renderCoordinating() {
    await runCoordinating();
    store.set('team', { ...teamData });
    advance();
  }

  // ---------------------------------------------------------------------------
  // PROGRESS DOTS
  // ---------------------------------------------------------------------------

  function updateProgressDots() {
    const dotsEl = el.querySelector('#team-dots');
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
    intro:         renderIntro,
    partner:       renderPartner,
    children:      renderChildren,
    coordinating:  renderCoordinating,
    done:          renderDone,
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
  // SCAFFOLD — mirrors onboarding.js exactly
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
          ">${world.name.toLowerCase()} · your team</div>
        </div>

        <div id="team-dots" style="
          display:flex;gap:5px;align-items:center;
          margin-bottom:40px;
          opacity:0;animation:fadeIn 0.8s ease-out 0.2s both;
        "></div>

        <div id="team-inner" style="
          flex:1;
          overflow-y:auto;
          -webkit-overflow-scrolling:touch;
        "></div>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API — matches onboarding.js shape
  // ---------------------------------------------------------------------------

  return {
    el,
    mount(container) {
      buildScaffold();
      container.appendChild(el);
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
