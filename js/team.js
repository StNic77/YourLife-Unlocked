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

  // Step history for back navigation at the top-level (intro → partner → children → etc.)
  const stepHistory = [];

  // Sub-step back signal — used inside cascades to step back one sub-screen
  // Set to a function by the active cascade, cleared when cascade exits
  let subStepBack = null;

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

  function inputCard({ prompt, placeholder, inputId, reflection = null, prevalue = '' }) {
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
          value="${prevalue}"
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
          <button class="team-cta" data-action="next" ${prevalue ? '' : 'disabled'} style="
            padding:13px 32px;
            border:0.5px solid ${prevalue ? 'var(--color-cream-40)' : 'var(--color-cream-15)'};border-radius:2px;
            font-family:var(--font-sans);font-weight:300;
            font-size:11px;letter-spacing:0.28em;text-transform:uppercase;
            color:${prevalue ? 'var(--color-cream-90)' : 'var(--color-cream-40)'};
            transition:all 0.3s ease;cursor:${prevalue ? 'pointer' : 'default'};
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
  // PARTNER CASCADE — vertical, AI-reflected
  // Each sub-step is a self-contained async function that resolves
  // when the user confirms or escapes.
  // ---------------------------------------------------------------------------

  // pronoun(entity, form) — returns the correct pronoun for any person object.
  // entity: any object with a .pronoun property ('she' | 'he' | 'they' | null)
  // form: 'subjective' (she/he/they), 'objective' (her/him/them),
  //       'possessive' (her/his/their)
  // Falls back to 'they/them/their' if pronoun not set or skipped.
  function pronoun(entity, form) {
    const map = {
      she:  { subjective: 'she',  objective: 'her',  possessive: 'her'   },
      he:   { subjective: 'he',   objective: 'him',  possessive: 'his'   },
      they: { subjective: 'they', objective: 'them', possessive: 'their' },
    };
    return (map[entity.pronoun] || map.they)[form];
  }

  async function runPartnerCascade() {
    const p = teamData.partner;

    // Partner cascade step order
    // 'profession' is inserted conditionally after 'works' if works !== 'no'
    const PARTNER_STEPS = [
      'name', 'pronoun', 'tenure', 'state', 'works',
      'profession', 'birthday', 'love_language', 'closing',
    ];

    let stepIdx = 0;
    let done    = false;
    let escaped = false;

    // Pending AI reflection — injected into the next screen when ready
    let pendingReflection = null;

    // Register back handler with the scaffold
    subStepBack = () => {
      if (stepIdx > 0) {
        stepIdx--;
        updateBackButton();
        runStep();
      }
    };

    function updatePartnerBack() {
      subStepBack = stepIdx > 0 ? () => { stepIdx--; updateBackButton(); runStep(); } : null;
      updateBackButton();
    }

    function injectReflection(text) {
      if (!text) return;
      const reflEl = el.querySelector('.team-reflection');
      if (reflEl) { reflEl.textContent = text; reflEl.style.letterSpacing = '0.04em'; }
    }

    async function runStep() {
      updatePartnerBack();
      const step = PARTNER_STEPS[stepIdx];

      if (step === 'name') {
        await setContent(inputCard({
          prompt: 'Who\'s your partner?',
          placeholder: 'First name',
          inputId: 'team-input',
          prevalue: p.name || '',
        }));
        const val = await awaitInput('team-input');
        if (val === null) { escaped = true; return; }
        p.name = val;
        stepIdx++;
        runStep();

      } else if (step === 'pronoun') {
        await setContent(tileCard({
          prompt: `How do you refer to ${p.name}?`,
          tiles: [
            { id: 'she',  label: 'She / her' },
            { id: 'he',   label: 'He / him' },
            { id: 'they', label: 'They / them' },
          ],
          multi: false,
        }));
        const val = await awaitTile({ multi: false });
        if (val === null) { escaped = true; return; }
        p.pronoun = val;
        stepIdx++;
        runStep();

      } else if (step === 'tenure') {
        await setContent(inputCard({
          prompt: `How long have you and ${p.name} been together?`,
          placeholder: 'e.g. 3 years, since 2019',
          inputId: 'team-input',
          prevalue: p.tenure || '',
        }));
        const val = await awaitInput('team-input');
        if (val === null) { escaped = true; return; }
        p.tenure = val;
        stepIdx++;
        runStep();

      } else if (step === 'state') {
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
        const val = await awaitTile({ multi: false });
        if (val === null) { escaped = true; return; }
        p.state = val;
        // Fire reflection — will inject into 'works' screen
        pendingReflection = api.getTeamReflection({
          type: 'state',
          partnerName: p.name,
          partnerPronoun: p.pronoun || 'they',
          tenure: p.tenure,
          state: p.state,
        }).catch(() => null);
        stepIdx++;
        runStep();

      } else if (step === 'works') {
        await setContent(tileCard({
          prompt: `Does ${p.name} work?`,
          tiles: [
            { id: 'yes',           label: 'Yes' },
            { id: 'no',            label: 'No' },
            { id: 'part_time',     label: 'Part time' },
            { id: 'self_employed', label: 'Self-employed' },
          ],
          multi: false,
          reflection: '&nbsp;',
        }));
        // Inject state reflection when ready
        if (pendingReflection) {
          pendingReflection.then(injectReflection);
          pendingReflection = null;
        }
        const val = await awaitTile({ multi: false });
        if (val === null) { escaped = true; return; }
        p.works = val;
        // Skip profession step if not working
        if (p.works === 'no') {
          stepIdx = PARTNER_STEPS.indexOf('birthday');
        } else {
          stepIdx++;
        }
        runStep();

      } else if (step === 'profession') {
        await setContent(inputCard({
          prompt: `What does ${pronoun(p, 'subjective')} do?`,
          placeholder: 'Profession or role',
          inputId: 'team-input',
          prevalue: p.profession || '',
        }));
        const val = await awaitInput('team-input');
        if (val === null) { escaped = true; return; }
        p.profession = val;
        // Fire profession reflection — inject into birthday screen
        pendingReflection = api.getTeamReflection({
          type: 'profession',
          partnerName: p.name,
          partnerPronoun: p.pronoun || 'they',
          profession: p.profession,
          state: p.state,
        }).catch(() => null);
        stepIdx++;
        runStep();

      } else if (step === 'birthday') {
        await setContent(inputCard({
          prompt: `${p.name}'s birthday?`,
          placeholder: 'e.g. March 14',
          inputId: 'team-input',
          reflection: pendingReflection ? '&nbsp;' : null,
          prevalue: p.birthday || '',
        }));
        if (pendingReflection) {
          pendingReflection.then(injectReflection);
          pendingReflection = null;
        }
        const val = await awaitInput('team-input');
        if (val === null) { escaped = true; return; }
        p.birthday = val;
        // Fire birthday reflection — inject into love language screen
        pendingReflection = api.getTeamReflection({
          type: 'birthday',
          partnerName: p.name,
          partnerPronoun: p.pronoun || 'they',
          birthday: p.birthday,
        }).catch(() => null);
        stepIdx++;
        runStep();

      } else if (step === 'love_language') {
        await setContent(tileCard({
          prompt: `How does ${p.name} most feel taken care of?`,
          tiles: [
            { id: 'time',   label: 'Quality time' },
            { id: 'words',  label: 'Words' },
            { id: 'acts',   label: 'Acts of service' },
            { id: 'touch',  label: 'Affection' },
            { id: 'gifts',  label: 'Gifts' },
            { id: 'unsure', label: 'Not sure yet' },
          ],
          multi: false,
          reflection: '&nbsp;',
        }));
        if (pendingReflection) {
          pendingReflection.then(injectReflection);
          pendingReflection = null;
        }
        const val = await awaitTile({ multi: false });
        if (val === null) { escaped = true; return; }
        p.love_language = val;
        // Fire final reflection
        pendingReflection = api.getTeamReflection({
          type: 'partner_complete',
          partnerName: p.name,
          partnerPronoun: p.pronoun || 'they',
          state: p.state,
          love_language: p.love_language,
          profession: p.profession || null,
        }).catch(() => null);
        stepIdx++;
        runStep();

      } else if (step === 'closing') {
        await setContent(statementCard({
          text: '···',
          ctaLabel: 'continue',
          escapeLabel: 'that\'s enough for now',
        }));
        if (pendingReflection) {
          pendingReflection.then(text => {
            if (!text) return;
            const textEl = el.querySelector('#team-inner [style*="font-serif"]');
            if (textEl) textEl.textContent = text;
          });
          pendingReflection = null;
        }
        const next = await awaitCta();
        done = true;
        if (next === 'escape') escaped = true;
      }
    }

    await runStep();

    // Clean up back handler when cascade exits
    subStepBack = null;
    updateBackButton();
  }

  // ---------------------------------------------------------------------------
  // CHILDREN CASCADE
  // ---------------------------------------------------------------------------

  async function runChildrenCascade() {
    const situation = store.get('onboarding')?.answers?.situation;

    // Steps per child: name → pronoun → birthday → age (conditional) → confirm
    // Plus the opening 'has_kids' gate step.
    // State machine tracks: which gate step, which child index, which child sub-step.

    // Gate step
    const GATE  = 'has_kids';
    // Per-child steps (in order)
    const CHILD_STEPS = ['name', 'pronoun', 'birthday', 'age', 'confirm'];

    let gate        = null;   // 'yes' | 'no' | null
    let childIdx    = 0;      // which child we're currently on
    let subIdx      = 0;      // which CHILD_STEPS index within current child
    let inGate      = true;   // true until gate is answered yes

    // In-progress data for the child currently being entered
    // Committed to teamData.children when 'confirm' is reached
    let draft = { name: '', pronoun: null, birthday: null, age: null };

    const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'];

    // Register back handler
    subStepBack = () => {
      if (inGate) return; // at gate — nowhere to go back within children
      if (subIdx > 0) {
        subIdx--;
      } else if (childIdx > 0) {
        // Back across child boundary — remove last committed child, go to its confirm
        teamData.children.pop();
        childIdx--;
        subIdx = CHILD_STEPS.indexOf('confirm');
        // Restore draft from the child we're going back to
        const prev = teamData.children[childIdx];
        if (prev) {
          draft = { name: prev.name, pronoun: prev.pronoun, birthday: prev.birthday, age: prev.age };
          // Remove it from teamData — it'll be re-committed when confirm is passed again
          teamData.children.pop();
        }
      }
      updateBackButton();
      runChildStep();
    };

    function updateChildBack() {
      const canBack = !inGate && (subIdx > 0 || childIdx > 0);
      subStepBack = canBack ? () => {
        if (subIdx > 0) {
          subIdx--;
        } else if (childIdx > 0) {
          teamData.children.pop();
          childIdx--;
          subIdx = CHILD_STEPS.indexOf('confirm');
          const prev = teamData.children[childIdx];
          if (prev) {
            draft = { name: prev.name, pronoun: prev.pronoun, birthday: prev.birthday, age: prev.age };
            teamData.children.pop();
          }
        }
        updateBackButton();
        runChildStep();
      } : null;
      updateBackButton();
    }

    async function runGate() {
      inGate = true;
      updateChildBack();
      await setContent(tileCard({
        prompt: 'Any children?',
        tiles: [
          { id: 'yes', label: 'Yes' },
          { id: 'no',  label: 'No' },
        ],
        multi: false,
      }));
      const val = await awaitTile({ multi: false });
      if (val === null || val === 'no') {
        subStepBack = null; updateBackButton(); return;
      }
      gate = 'yes';
      inGate = false;
      draft = { name: '', pronoun: null, birthday: null, age: null };
      updateChildBack();
      runChildStep();
    }

    async function runChildStep() {
      updateChildBack();
      // Skip age step if birthday has a year
      const birthdayHasYear = draft.birthday && /\b(19|20)\d{2}\b/.test(draft.birthday);
      if (CHILD_STEPS[subIdx] === 'age' && birthdayHasYear) {
        subIdx++; // skip age — birthday carries the year
      }

      const step    = CHILD_STEPS[subIdx];
      const ordinal = ORDINALS[childIdx] || `Child ${childIdx + 1}`;

      if (step === 'name') {
        await setContent(inputCard({
          prompt: childIdx === 0
            ? 'What\'s your child\'s name? We\'ll add them one at a time.'
            : `${ordinal} child?`,
          placeholder: 'Name',
          inputId: 'team-input',
          prevalue: draft.name || '',
        }));
        const val = await awaitInput('team-input');
        if (val === null) { subStepBack = null; updateBackButton(); return; }
        draft.name = val;
        subIdx++;
        runChildStep();

      } else if (step === 'pronoun') {
        await setContent(tileCard({
          prompt: `How do you refer to ${draft.name}?`,
          tiles: [
            { id: 'she',  label: 'She / her' },
            { id: 'he',   label: 'He / him' },
            { id: 'they', label: 'They / them' },
            { id: 'skip', label: 'Skip' },
          ],
          multi: false,
        }));
        const val = await awaitTile({ multi: false });
        if (val === null) { subStepBack = null; updateBackButton(); return; }
        draft.pronoun = val === 'skip' ? null : val;
        subIdx++;
        runChildStep();

      } else if (step === 'birthday') {
        await setContent(inputCard({
          prompt: `When is ${draft.name}'s birthday?`,
          placeholder: 'e.g. March 14 or March 14 2019',
          inputId: 'team-input',
          prevalue: draft.birthday || '',
        }));
        const val = await awaitInput('team-input');
        // birthday is skippable — null is fine
        draft.birthday = val || null;
        subIdx++;
        runChildStep();

      } else if (step === 'age') {
        const hasPartialBirthday = draft.birthday && !/\b(19|20)\d{2}\b/.test(draft.birthday);
        await setContent(inputCard({
          prompt: hasPartialBirthday
            ? `What year was ${draft.name} born, or roughly how old are they?`
            : `How old is ${draft.name}?`,
          placeholder: 'e.g. 7',
          inputId: 'team-input',
          prevalue: draft.age ? String(draft.age) : '',
        }));
        const val = await awaitInput('team-input');
        draft.age = val || null;
        subIdx++;
        runChildStep();

      } else if (step === 'confirm') {
        // Commit this child to teamData
        const committed = { name: draft.name, pronoun: draft.pronoun, birthday: draft.birthday, age: draft.age };
        // Replace if re-confirming after back
        if (teamData.children[childIdx]) {
          teamData.children[childIdx] = committed;
        } else {
          teamData.children.push(committed);
        }

        await setContent(tileCard({
          prompt: `Got it — ${draft.name} is in the picture.`,
          tiles: [
            { id: 'another', label: 'Add another child' },
            { id: 'done',    label: 'That\'s everyone' },
          ],
          multi: false,
        }));
        const val = await awaitTile({ multi: false });
        if (val === null || val === 'done') {
          subStepBack = null; updateBackButton(); return;
        }
        // Another child
        childIdx++;
        subIdx = 0;
        draft = { name: '', pronoun: null, birthday: null, age: null };
        runChildStep();
      }
    }

    await runGate();
    subStepBack = null;
    updateBackButton();
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

    let kidsLine = '';
    if (teamData.children.length > 0) {
      const names = teamData.children.map(c => c.name).join(', ');
      kidsLine = partnerLine
        ? `${names} too.`
        : `${names} ${teamData.children.length === 1 ? 'is' : 'are'} in the picture.`;
    }

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

            // Resolve directly after visual feedback — don't rely on button click
            updateConfirm();
            setTimeout(() => resolve(tile.dataset.id), 220);
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
    // Skip partner cascade if the user indicated no partner at onboarding
    const situation = store.get('onboarding')?.answers?.situation;
    const hasPartner = situation && ['partner', 'partner_kids'].includes(situation);

    if (hasPartner) {
      await runPartnerCascade();
    }

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
    stepHistory.push(currentStep);
    currentStep = Math.min(currentStep + 1, STEPS.length - 1);
    subStepBack = null; // clear any sub-cascade back handler on step change
    renderStep();
  }

  function renderStep() {
    updateProgressDots();
    updateBackButton();
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

          <!-- Back button — shown when there is somewhere to go back to -->
          <button id="team-back" style="
            font-family:var(--font-sans);font-weight:200;
            font-size:10px;letter-spacing:0.25em;text-transform:uppercase;
            color:rgba(240,235,218,0.2);
            display:none;
            transition:color 0.2s ease;
          "
          onmouseenter="this.style.color='rgba(240,235,218,0.55)'"
          onmouseleave="this.style.color='rgba(240,235,218,0.2)'"
          >← back</button>
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

    // Wire back button after scaffold is in DOM
    const backBtn = el.querySelector('#team-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        // If a sub-cascade has registered a back handler, use it
        if (typeof subStepBack === 'function') {
          subStepBack();
          return;
        }
        // Otherwise step back through top-level steps
        if (stepHistory.length > 0) {
          currentStep = stepHistory.pop();
          updateBackButton();
          renderStep();
        }
      });
    }
  }

  function updateBackButton() {
    const backBtn = el.querySelector('#team-back');
    if (!backBtn) return;
    const canGoBack = stepHistory.length > 0 || typeof subStepBack === 'function';
    backBtn.style.display = canGoBack ? '' : 'none';
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
      updateBackButton();
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
