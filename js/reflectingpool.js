import { store } from './store.js';
import { api } from './api.js';
import { onPoolSessionClose, extractFactualCorrections } from './shape.js';

// ---------------------------------------------------------------------------
// REFLECTING POOL DOMAIN MODULE
//
// The reflecting pool is the primary collection point for SHAPE's human
// intelligence layer. It is a guided conversation, not a journal or blank
// field. The user arrives, speaks, and is heard. The app responds once —
// one question, earned by what was just given.
//
// Architecture:
//   reflectingpool.js ──reads──▶ store (SHAPE context, world, team)
//   reflectingpool.js ──writes──▶ store.reflecting_pool (session history)
//   reflectingpool.js ──calls──▶ api.getReflectingPoolResponse()
//   home.js ──calls──▶ getReflectingPoolBrief() for the panel
//   home.js ──calls──▶ createReflectingPoolPanel() to mount the UI
//
// reflectingpool.js does not import from home.js, cascade.js, or atak.js.
// The store is the only shared interface.
//
// Entry model:
//   - No first question. The user arrives and the room receives them.
//   - The app's first move is always in response to what the user says.
//   - One question per exchange. Hard constraint.
//   - Signal-based close — not a turn count.
//   - No summary. No homework. Quiet landing.
//
// Floor:
//   - Self-harm, intent to harm others, criminal activity.
//   - Collection stops. App redirects warmly, immediately.
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// BRIEF CONTENT
// What the notebook hotspot shows in grab-and-go mode.
// Low surface area — just an invitation. The depth is inside.
// ---------------------------------------------------------------------------

export function getReflectingPoolBrief() {
  const sessions = store.get('reflecting_pool') || [];
  const last = sessions[sessions.length - 1];

  if (!last) {
    return {
      title: 'Reflecting pool',
      sections: [{
        label: 'A quiet place to think out loud',
        value: 'What you put here changes the quality of everything else.',
        urgent: false,
      }],
      cta: 'Open',
      cta_action: 'open_reflecting_pool',
    };
  }

  // Show last session date as light context
  const lastDate = new Date(last.started_at);
  const daysAgo = Math.floor((Date.now() - lastDate) / (1000 * 60 * 60 * 24));
  const label = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;

  return {
    title: 'Reflecting pool',
    sections: [{
      label: 'Last session',
      value: label,
      urgent: false,
    }],
    cta: 'Return',
    cta_action: 'open_reflecting_pool',
  };
}


// ---------------------------------------------------------------------------
// SESSION STORE
// Each reflecting pool session is a discrete object.
// Sessions accumulate in store.reflecting_pool[].
// SHAPE reads the full array — threads, velocity, language patterns.
// ---------------------------------------------------------------------------

function _startSession() {
  const id = `rp_${Date.now()}`;
  return {
    id,
    started_at: new Date().toISOString(),
    ended_at: null,
    exchanges: [],  // { role: 'user'|'assistant', content: string, ts: string }
    closed: false,
  };
}

function _saveSession(session) {
  const sessions = store.get('reflecting_pool') || [];
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.push(session);
  }
  // Keep last 90 sessions — beyond that SHAPE has compressed the signal
  store.set('reflecting_pool', sessions.slice(-90));
}

function _closeSession(session) {
  session.ended_at = new Date().toISOString();
  session.closed = true;
  _saveSession(session);
}


// ---------------------------------------------------------------------------
// SHAPE CONTEXT BUILDER
// Assembles a lightweight SHAPE handoff for the system prompt.
// Enough for the AI to calibrate its one question.
// Not the full picture — "the pile feeds the spiral."
// ---------------------------------------------------------------------------

function _buildShapeContext() {
  const state = store.get();
  const world = state.world || 'operator';
  const user = state.user || {};
  const onboarding = state.onboarding || {};
  const team = state.team || {};

  const parts = [];

  if (user.name) parts.push(`User's name: ${user.name}.`);
  parts.push(`World: ${world}.`);

  // Situation signal — what season they're in
  if (onboarding.situation) {
    parts.push(`Life season: ${onboarding.situation}.`);
  }

  // Mission signals — what they care about
  if (onboarding.mission?.length) {
    parts.push(`Current priorities: ${onboarding.mission.slice(0, 3).join(', ')}.`);
  }

  // Team presence — important for load calibration
  const hasPartner = team.partner && Object.keys(team.partner).length > 0;
  const childCount = team.children?.length || 0;
  if (hasPartner && childCount > 0) {
    parts.push(`Has a partner and ${childCount} child${childCount > 1 ? 'ren' : ''}.`);
  } else if (hasPartner) {
    parts.push('Has a partner.');
  } else if (childCount > 0) {
    parts.push(`Has ${childCount} child${childCount > 1 ? 'ren' : ''}, no partner on file.`);
  }

  // Velocity signal — recent pool activity
  const sessions = store.get('reflecting_pool') || [];
  const recentSessions = sessions.filter(s => {
    const age = Date.now() - new Date(s.started_at).getTime();
    return age < 7 * 24 * 60 * 60 * 1000; // last 7 days
  });
  if (recentSessions.length >= 3) {
    parts.push('Has returned to the reflecting pool multiple times this week — elevated activity.');
  }

  // Threads — what has kept coming up
  // Pull last 3 sessions, surface any thread that repeated
  const recentExchanges = sessions
    .slice(-3)
    .flatMap(s => s.exchanges.filter(e => e.role === 'user').map(e => e.content));
  if (recentExchanges.length) {
    // Pass a compressed window — not the full text
    const compressed = recentExchanges
      .map(t => t.slice(0, 80))
      .join(' / ');
    parts.push(`Recent threads (compressed): ${compressed}`);
  }

  return parts.join(' ');
}


// ---------------------------------------------------------------------------
// UI — The Room
// Mounts directly into the panel element passed from home.js.
// Manages its own state — session object lives here during the conversation.
// ---------------------------------------------------------------------------

export function createReflectingPoolPanel(container, onClose) {
  const world = store.get('world') || 'operator';
  let session = _startSession();
  let exchangeCount = 0;
  let closed = false;

  // ── Render shell ──────────────────────────────────────────────────────────

  container.innerHTML = `
    <div id="rp-panel" style="
      display:flex;flex-direction:column;height:100%;
      font-family:var(--font-sans);
      color:rgba(240,235,218,0.85);
    ">

      <!-- Header -->
      <div style="
        display:flex;align-items:center;justify-content:space-between;
        padding:max(20px, env(safe-area-inset-top)) 20px 16px;
        border-bottom:0.5px solid rgba(240,235,218,0.08);
        flex-shrink:0;
      ">
        <span style="
          font-size:10px;letter-spacing:0.22em;text-transform:uppercase;
          color:rgba(240,235,218,0.3);
        ">reflecting pool</span>
        <button id="rp-close" style="
          background:none;border:none;cursor:pointer;padding:4px 8px;
          font-family:var(--font-sans);font-weight:300;
          font-size:10px;letter-spacing:0.22em;text-transform:uppercase;
          color:rgba(240,235,218,0.45);
          transition:color 0.2s ease;
        ">close</button>
      </div>

      <!-- Conversation area -->
      <div id="rp-conversation" style="
        flex:1;overflow-y:auto;
        padding:24px 20px 16px;
        display:flex;flex-direction:column;gap:20px;
        -webkit-overflow-scrolling:touch;
      "></div>

      <!-- Thinking indicator -->
      <div id="rp-thinking" style="
        display:none;
        padding:0 20px 12px;
        font-size:12px;font-weight:300;letter-spacing:0.06em;
        color:rgba(240,235,218,0.2);
        font-style:italic;
        flex-shrink:0;
      ">...</div>

      <!-- Input area -->
      <div id="rp-input-area" style="
        flex-shrink:0;
        padding:12px 20px max(28px, env(safe-area-inset-bottom));
        border-top:0.5px solid rgba(240,235,218,0.08);
      ">
        <style>
          #rp-input::placeholder { color: rgba(240,235,218,0.2); }
          #rp-input:focus { outline: none; border-color: rgba(240,235,218,0.25); }
        </style>
        <textarea id="rp-input" rows="3" placeholder="What's on your mind." style="
          width:100%;box-sizing:border-box;
          background:rgba(240,235,218,0.04);
          border:0.5px solid rgba(240,235,218,0.12);border-radius:2px;
          padding:14px;
          font-family:var(--font-sans);font-weight:300;
          font-size:14px;letter-spacing:0.03em;line-height:1.6;
          color:rgba(240,235,218,0.85);
          resize:none;
          transition:border-color 0.2s ease;
        "></textarea>
        <div style="display:flex;justify-content:flex-end;margin-top:10px;">
          <button id="rp-send" style="
            padding:10px 24px;
            background:none;
            border:0.5px solid rgba(240,235,218,0.2);border-radius:2px;
            font-family:var(--font-sans);font-weight:300;
            font-size:10px;letter-spacing:0.28em;text-transform:uppercase;
            color:rgba(240,235,218,0.5);
            cursor:pointer;
            transition:all 0.2s ease;
          ">send</button>
        </div>
      </div>

    </div>
  `;

  const conversationEl = container.querySelector('#rp-conversation');
  const inputEl = container.querySelector('#rp-input');
  const sendBtn = container.querySelector('#rp-send');
  const thinkingEl = container.querySelector('#rp-thinking');
  const closeBtn = container.querySelector('#rp-close');
  const inputArea = container.querySelector('#rp-input-area');

  // ── Event: close ──────────────────────────────────────────────────────────

  function handleClose() {
    if (!closed) {
      _closeSession(session);
      // Only hand off to SHAPE if the session had at least one exchange
      if (session.exchanges.length > 0) {
        onPoolSessionClose(session).catch(() => {});
      }
      closed = true;
    }
    onClose?.();
  }

  closeBtn.addEventListener('click', handleClose);

  // ── Render a message bubble ───────────────────────────────────────────────

  function _appendMessage(role, text) {
    const isUser = role === 'user';
    const bubble = document.createElement('div');
    bubble.style.cssText = `
      max-width: 88%;
      align-self: ${isUser ? 'flex-end' : 'flex-start'};
      animation: rpFadeIn 0.25s ease;
    `;
    bubble.innerHTML = `
      <div style="
        padding: 12px 16px;
        border-radius: 2px;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.03em;
        line-height: 1.65;
        ${isUser
          ? 'background: rgba(240,235,218,0.07); color: rgba(240,235,218,0.85);'
          : 'background: transparent; color: rgba(240,235,218,0.6); border-left: 0.5px solid rgba(240,235,218,0.15); padding-left: 14px;'
        }
      ">${_escapeHtml(text)}</div>
    `;
    conversationEl.appendChild(bubble);
    _scrollToBottom();
  }

  function _appendClosingNote() {
    const note = document.createElement('div');
    note.style.cssText = `
      align-self: center;
      padding: 16px 0 8px;
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(240,235,218,0.18);
      animation: rpFadeIn 0.4s ease;
    `;
    note.textContent = '—';
    conversationEl.appendChild(note);
    _scrollToBottom();
  }

  function _scrollToBottom() {
    requestAnimationFrame(() => {
      conversationEl.scrollTop = conversationEl.scrollHeight;
    });
  }

  function _escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  // ── Inject keyframes once ─────────────────────────────────────────────────

  if (!document.getElementById('rp-keyframes')) {
    const style = document.createElement('style');
    style.id = 'rp-keyframes';
    style.textContent = `
      @keyframes rpFadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Send handler ──────────────────────────────────────────────────────────

  async function handleSend() {
    if (closed) return;
    const text = inputEl.value.trim();
    if (!text) return;

    // Clear input, disable while processing
    inputEl.value = '';
    inputEl.disabled = true;
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.3';

    // Record and render user message
    const userExchange = { role: 'user', content: text, ts: new Date().toISOString() };
    session.exchanges.push(userExchange);
    _appendMessage('user', text);

    // Per-exchange factual extraction — fires immediately, does not block the pool
    extractFactualCorrections(text).catch(() => {});

    // Show thinking
    thinkingEl.style.display = 'block';

    try {
      // Build message history for API (all exchanges so far)
      const messages = session.exchanges.map(e => ({
        role: e.role,
        content: e.content,
      }));

      const shapeContext = _buildShapeContext();
      const result = await api.getReflectingPoolResponse({
        messages,
        shapeContext,
        world,
        exchangeCount,
      });

      thinkingEl.style.display = 'none';
      exchangeCount++;

      if (result.floor_triggered) {
        // Floor hit — collection stops, warm redirect
        _appendMessage('assistant', result.response);
        _appendClosingNote();
        _disableInput();
        _closeSession(session);
        closed = true;
        onPoolSessionClose(session).catch(() => {});
        return;
      }

      if (result.close_session) {
        // Natural close — the session has done its work
        _appendMessage('assistant', result.response);
        _appendClosingNote();
        _disableInput();
        _closeSession(session);
        closed = true;
        onPoolSessionClose(session).catch(() => {});
        return;
      }

      // Normal exchange — render response, re-enable input
      const assistantExchange = {
        role: 'assistant',
        content: result.response,
        ts: new Date().toISOString(),
      };
      session.exchanges.push(assistantExchange);
      _saveSession(session);

      _appendMessage('assistant', result.response);

    } catch (err) {
      thinkingEl.style.display = 'none';
      console.error('Reflecting pool API error:', err);
      // Graceful failure — don't abandon the user
      _appendMessage('assistant', 'Something went quiet on my end. Take your time.');
    }

    // Re-enable input
    inputEl.disabled = false;
    sendBtn.disabled = false;
    sendBtn.style.opacity = '';
    inputEl.focus();
  }

  function _disableInput() {
    inputArea.style.display = 'none';
  }

  // Send on button click
  sendBtn.addEventListener('click', handleSend);

  // Send on Cmd/Ctrl+Enter
  inputEl.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  });

  // Focus input on mount
  requestAnimationFrame(() => inputEl.focus());
}
