import { store } from './store.js';
import { api } from './api.js';

// ---------------------------------------------------------------------------
// SHAPE — Human Intelligence Module
//
// SHAPE is not a feature. It is what makes the app human.
//
// Architecture:
//   Every domain (vehicles, maintenance, health, calendar, team, reflecting_pool)
//   ── writes ──▶ store
//   shape.js ── reads ──▶ store (all of it)
//              ── maintains ──▶ store.shape (raw layer + interpreted layer)
//              ── provides ──▶ getShapeContext()   — ATAK brief integration
//                             getSanctuaryHandoff() — full portrait for Sanctuary AI
//
// SHAPE reads from everything. It writes to itself.
// It does not manage domain data. It does not produce the brief.
// It is not the Sanctuary. It is what makes the Sanctuary possible.
//
// The design standard: if this thing is going to work, SHAPE has to be a superhero.
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// PART 1 — STORE SHAPE
//
// store.shape is SHAPE's private store. Two layers. Append-only raw.
// Periodically rebuilt interpreted layer. Never exposed as UI data.
// ---------------------------------------------------------------------------

const SHAPE_KEY  = 'shape';
const RAW_MAX    = 500;   // max raw entries before compression
const POOL_MAX   = 90;    // max reflecting pool sessions retained (from store.js)

/**
 * Returns the current shape store, initialising defaults if absent.
 */
function _getShape() {
  const existing = store.get(SHAPE_KEY);
  if (existing && existing.raw) return existing;
  return {
    raw:         [],        // append-only event log
    interpreted: null,      // current interpreted paragraph (string | null)
    rebuilt_at:  null,      // ISO timestamp of last rebuild
    rebuild_pending: false, // flag — rebuild queued but not yet run
    convergence: {
      active:    false,
      domains:   [],        // which domains are elevated
      detected_at: null,
      threshold_crossings: 0,
    },
  };
}

function _saveShape(shape) {
  store.set(SHAPE_KEY, shape);
}


// ---------------------------------------------------------------------------
// PART 2 — RAW LAYER
//
// Append-only. Every significant event across the app writes here.
// The raw layer is never overwritten. Items are resolved, but not deleted.
//
// Event types:
//   'atak_synthesis'      — full ATAK brief as produced (summary form)
//   'domain_signal'       — signal from any domain (with pressure, status)
//   'intake'              — onboarding answer or Has something changed? submission
//   'pool_session'        — reflecting pool session processed by SHAPE
//   'pool_signal'         — specific signal extracted from a pool session
//   'domain_event'        — notable event: service done, appointment kept/missed, etc.
//   'convergence'         — convergence threshold crossed
//   'interpreted_rebuild' — interpreted layer was rebuilt (with old/new summary)
// ---------------------------------------------------------------------------

/**
 * Append a raw event. This is the only write path to the raw layer.
 * @param {string} type  — event type (see above)
 * @param {object} data  — event payload
 */
export function appendRaw(type, data = {}) {
  const shape = _getShape();
  const entry = {
    id:         `raw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    ts:         new Date().toISOString(),
    ...data,
  };
  shape.raw = [...shape.raw, entry];

  // Trim if needed — keep the most recent RAW_MAX entries
  // This is a safety valve. The compression system below is the real management.
  if (shape.raw.length > RAW_MAX) {
    shape.raw = shape.raw.slice(shape.raw.length - RAW_MAX);
  }

  _saveShape(shape);
  return entry;
}

/**
 * Record an ATAK brief synthesis snapshot.
 * Called by the ATAK when it builds a primary brief.
 * Stores a reduced-fidelity summary (section headings + item count) not the full HTML.
 */
export function recordAtakSynthesis(sections = []) {
  const summary = sections.map(s => ({
    heading:   s.heading,
    itemCount: (s.items || []).length,
    hasUrgent: (s.items || []).some(i => i.urgent),
  }));
  appendRaw('atak_synthesis', { sections: summary });
}

/**
 * Record a domain signal event — called by any domain when a significant
 * signal is written, resolved, or changes pressure.
 */
export function recordDomainSignal(domain, signalType, pressure, status, label) {
  appendRaw('domain_signal', { domain, signal_type: signalType, pressure, status, label });
}

/**
 * Record a domain event — a thing that actually happened.
 * Examples: appointment kept, vehicle serviced, person added to team.
 */
export function recordDomainEvent(domain, eventType, detail = {}) {
  appendRaw('domain_event', { domain, event_type: eventType, ...detail });
}

/**
 * Record an intake submission — onboarding or Has something changed?
 */
export function recordIntake(source, answers = {}) {
  // Answers may contain sensitive fields — store keys only, not values
  const keys = Object.keys(answers);
  appendRaw('intake', { source, answer_keys: keys, answer_count: keys.length });
}


// ---------------------------------------------------------------------------
// PART 3 — REFLECTING POOL READER
//
// This is the mechanism that closes the CAF gap.
// The pool collected: "CAF member, no provincial health card."
// Nothing acted on it. SHAPE reads it and writes the correction.
//
// The reader runs when a pool session closes. It reads the exchanges,
// extracts factual corrections and context signals, and writes them
// to the appropriate store locations. The user never had to file anything.
// They said it once. SHAPE does the filing.
//
// Two categories of extraction:
//   1. Factual corrections  — things said that correct or extend domain data
//   2. Context signals      — patterns, threads, load signals for the ATAK layer
// ---------------------------------------------------------------------------

/**
 * Process a closed reflecting pool session.
 * Called after a session closes. Reads exchanges, extracts signals,
 * writes corrections to store, appends to raw layer.
 *
 * @param {object} session — the closed session object from store.reflecting_pool
 */
export async function processPoolSession(session) {
  if (!session || !session.closed) return;
  if (!Array.isArray(session.exchanges) || session.exchanges.length === 0) return;

  const shape = _getShape();

  // Build a compact representation of the conversation for extraction
  const transcript = session.exchanges
    .map(e => `${e.role === 'user' ? 'USER' : 'APP'}: ${e.content}`)
    .join('\n');

  // What we already know about the user (provides context for extraction)
  const existing = _buildExistingContext();

  let extraction = null;
  try {
    extraction = await _extractPoolSignals(transcript, existing);
  } catch (err) {
    console.warn('[SHAPE] Pool extraction failed:', err);
    // Fail silently — the pool session still gets logged to raw
  }

  // Always log the session to the raw layer (compressed — no full transcript)
  const sessionSummary = {
    session_id:     session.id,
    started_at:     session.started_at,
    ended_at:       session.ended_at,
    exchange_count: session.exchanges.length,
    extracted:      extraction !== null,
  };
  appendRaw('pool_session', sessionSummary);

  if (!extraction) return;

  // Apply factual corrections to store
  if (extraction.factual_corrections && extraction.factual_corrections.length > 0) {
    _applyFactualCorrections(extraction.factual_corrections, session.id);
  }

  // Write context signals to raw layer
  if (extraction.context_signals && extraction.context_signals.length > 0) {
    extraction.context_signals.forEach(sig => {
      appendRaw('pool_signal', {
        session_id:  session.id,
        signal_type: sig.type,
        domain:      sig.domain || 'general',
        weight:      sig.weight || 'light',
        summary:     sig.summary,
      });
    });
  }

  // Flag interpreted layer for rebuild if signals are significant
  const hasSignificant = (extraction.context_signals || []).some(s => s.weight === 'significant');
  const hasCorrections = (extraction.factual_corrections || []).length > 0;
  if (hasSignificant || hasCorrections) {
    shape.rebuild_pending = true;
    _saveShape(shape);
  }
}

/**
 * Per-exchange factual extraction — runs after each user message is saved.
 * Only looks for writeable facts (factual_corrections). Does not wait for session close.
 * Context signals and patterns still wait for full session close.
 *
 * @param {string} userMessage — the single user message just sent
 */
export async function extractFactualCorrections(userMessage) {
  if (!userMessage || !userMessage.trim()) return;

  const existing = _buildExistingContext();

  const systemPrompt = `You are SHAPE — the human intelligence layer of a personal life app. A user just sent one message in a conversation. Extract any concrete facts about themselves that should update what the app knows.

EXISTING KNOWLEDGE:
${JSON.stringify(existing, null, 2)}

EXTRACT ONLY:
Writeable facts that correct or extend existing domain data. Be conservative — only extract what is clearly and explicitly stated.
Examples: health coverage type, military/CAF membership, moved city, new job, relationship change, new child, birthday.

FIELD PATH REFERENCE — use these exact paths for common facts:
- Birthday / date of birth → domain: "user", field_path: "birthday", value: ISO date string "YYYY-MM-DD"
- Name → domain: "user", field_path: "name"
- Pronouns → domain: "user", field_path: "pronouns" (values: "he", "she", "they")
- Health coverage → domain: "health", field_path: "health_coverage"
- CAF member → domain: "military", field_path: "caf_member", value: true
- CAF posting → domain: "military", field_path: "posting"
- Primary medical facility → domain: "health", field_path: "primary_medical_facility"
- Occupation sector → domain: "onboarding", field_path: "occupation_sector"

For birthday: if the user gives a full date, convert to ISO format (YYYY-MM-DD). If only month and day are given with no year, do not extract — insufficient data.

DO NOT extract: emotions, opinions, vague impressions, anything requiring inference.
DO NOT extract facts already present in existing knowledge.

If nothing writeable was said, return: { "factual_corrections": [] }

RESPOND ONLY WITH VALID JSON — no preamble, no markdown.
{ "factual_corrections": [{ "domain": "string", "field_path": "string", "value": "any", "confidence": "high|medium|low", "evidence": "string" }] }`;

  let extraction = null;
  try {
    extraction = await api.getShapeExtraction({ systemPrompt, transcript: `USER: ${userMessage}` });
  } catch (err) {
    console.warn('[SHAPE] Per-exchange extraction failed:', err);
    return;
  }

  if (!extraction?.factual_corrections?.length) return;

  _applyFactualCorrections(extraction.factual_corrections, 'per_exchange');
}

/**
 * Calls the Anthropic API to extract signals from a pool session transcript.
 * Returns structured extraction object or throws.
 *
 * @param {string} transcript   — the session as USER:/APP: lines
 * @param {object} existingCtx  — what SHAPE already knows
 * @returns {Promise<object>}   — { factual_corrections: [], context_signals: [] }
 */
async function _extractPoolSignals(transcript, existingCtx) {
  const systemPrompt = `You are SHAPE — the human intelligence layer of a personal life management app. Your job is to read a conversation from the app's reflecting pool and extract two categories of intelligence.

EXISTING KNOWLEDGE ABOUT THIS USER:
${JSON.stringify(existingCtx, null, 2)}

EXTRACTION TASK:
Read the conversation below and extract:

1. FACTUAL CORRECTIONS — things the user said that correct, update, or extend what is known about them. These are concrete, writeable facts that belong in a domain.
   Examples:
   - User mentioned they are a CAF member → health coverage type should be 'CAF', not provincial
   - User said they moved to a new city → home location needs updating
   - User mentioned a new child → team may be incomplete
   - User said they sold their truck → vehicles may have a stale entry

2. CONTEXT SIGNALS — patterns, themes, and load signals for the intelligence layer. These are not field updates — they are human intelligence about how this person is doing.
   Examples:
   - User returns to the same unresolved work situation for the third time
   - User's language indicates high fatigue / low capacity
   - User expressed unexpected clarity about a previously avoided decision
   - A thread closed naturally — something resolved

FIELD PATH REFERENCE — use these exact paths for common factual corrections:
- Birthday / date of birth → domain: "user", field_path: "birthday", value: ISO date string "YYYY-MM-DD"
- Name → domain: "user", field_path: "name"
- Pronouns → domain: "user", field_path: "pronouns" (values: "he", "she", "they")
- Health coverage → domain: "health", field_path: "health_coverage"
- CAF member → domain: "military", field_path: "caf_member", value: true
- CAF posting → domain: "military", field_path: "posting"
- Primary medical facility → domain: "health", field_path: "primary_medical_facility"
- Occupation sector → domain: "onboarding", field_path: "occupation_sector"

For birthday: if the user gives a full date, convert to ISO format (YYYY-MM-DD). If only month and day are given with no year, do not extract — insufficient data.

RULES:
- Only extract what was actually said. Do not infer beyond what the text contains.
- Do not speculate about causes or assign clinical labels.
- Factual corrections must be specific and writeable. Vague impressions go in context signals.
- Weight context signals: 'light' (worth noting), 'moderate' (pattern forming), 'significant' (affects the load picture).
- If nothing meaningful was extracted, return empty arrays.

RESPOND ONLY WITH VALID JSON — no preamble, no markdown, no explanation.

JSON FORMAT:
{
  "factual_corrections": [
    {
      "domain": "user",
      "field_path": "birthday",
      "value": "1985-03-15",
      "confidence": "high",
      "evidence": "User stated their birthday is March 15th 1985"
    }
  ],
  "context_signals": [
    {
      "type": "recurring_thread",
      "domain": "general",
      "weight": "moderate",
      "summary": "User returned to unresolved work situation — third mention in 2 weeks"
    }
  ]
}`;

  const raw = await api.getShapeExtraction({ systemPrompt, transcript });

  // Strip markdown fences if present
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

/**
 * Returns a condensed picture of what SHAPE already knows,
 * so the extraction prompt has context.
 */
function _buildExistingContext() {
  const user    = store.get('user')    || {};
  const health  = store.get('health')  || {};
  const team    = store.get('team')    || {};
  const onboard = store.get('onboarding') || {};
  const vehicles = store.get('vehicles') || [];

  return {
    name:             user.name,
    world:            store.get('world'),
    country:          user.country,
    province:         user.province,
    life_season:      onboard.situation,
    priorities:       onboard.mission || [],
    has_partner:      !!team.partner?.name,
    child_count:      (team.children || []).length,
    vehicle_count:    vehicles.length,
    health_coverage:  health.medical?.coverage_type || null,
    has_provider:     !!(health.mental?.provider_name || health.mental?.has_provider),
  };
}

/**
 * Apply factual corrections extracted from a pool session.
 * Writes to the appropriate store location.
 * Logs each correction to the raw layer.
 *
 * @param {Array}  corrections  — array of { domain, field_path, value, confidence, evidence }
 * @param {string} sessionId    — the pool session this came from
 */
function _applyFactualCorrections(corrections, sessionId) {
  console.log(`[SHAPE] Applying ${corrections.length} factual correction(s) from session: ${sessionId}`);
  corrections.forEach(correction => {
    if (!correction.domain || !correction.field_path || correction.value === undefined) {
      console.warn('[SHAPE] Skipping malformed correction:', correction);
      return;
    }
    if (correction.confidence !== 'high' && correction.confidence !== 'medium') {
      console.log(`[SHAPE] Skipping low-confidence correction (${correction.confidence}):`, correction.field_path, '—', correction.evidence);
      return;
    }

    try {
      _writeToFieldPath(correction.domain, correction.field_path, correction.value);
      console.log(`[SHAPE] ✅ Written: ${correction.domain}.${correction.field_path} = ${JSON.stringify(correction.value)} (${correction.confidence}) — "${correction.evidence}"`);

      appendRaw('pool_signal', {
        session_id:  sessionId,
        signal_type: 'factual_correction',
        domain:      correction.domain,
        field_path:  correction.field_path,
        confidence:  correction.confidence,
        evidence:    correction.evidence,
        weight:      'significant',
      });
    } catch (err) {
      console.warn('[SHAPE] ❌ Could not apply correction:', correction, err);
    }
  });
}

/**
 * Write a value to a dot-notation field path within a store domain.
 * Handles nested paths like 'medical.coverage_type'.
 *
 * @param {string} domain     — top-level store key ('health', 'user', 'team', etc.)
 * @param {string} fieldPath  — dot-notation path within the domain object
 * @param {*}      value      — value to write
 */
function _writeToFieldPath(domain, fieldPath, value) {
  const domainData = store.get(domain);
  if (domainData === null || domainData === undefined) {
    console.warn(`[SHAPE] Domain '${domain}' not found in store`);
    return;
  }

  const parts  = fieldPath.split('.');
  const target = typeof domainData === 'object' ? { ...domainData } : domainData;

  // Navigate to the second-to-last key, then write the final key
  let cursor = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (cursor[key] === undefined || cursor[key] === null) {
      cursor[key] = {};
    } else {
      cursor[key] = { ...cursor[key] };
    }
    cursor = cursor[key];
  }

  const lastKey = parts[parts.length - 1];
  cursor[lastKey] = value;

  store.set(domain, target);
}


// ---------------------------------------------------------------------------
// PART 4 — CONVERGENCE DETECTION
//
// Reads across all domains simultaneously.
// A single elevated domain is the ATAK's territory.
// Multiple domains distorting simultaneously — that is SHAPE's territory.
//
// Convergence is not an alarm. It is a recognition.
// ---------------------------------------------------------------------------

const CONVERGENCE_THRESHOLD = 3; // domains that must be elevated to trigger

/**
 * Scan all domains for simultaneous elevation.
 * Returns a convergence object describing current state.
 * Called by checkConvergence() and by the interpreted layer rebuild.
 */
function _scanConvergence() {
  const elevated = [];
  const nowMs    = Date.now();

  // ── Vehicles ──────────────────────────────────────────────────────────────
  const vehicles = store.get('vehicles') || [];
  const overdue = vehicles.filter(v => {
    return [v.registration_expiry, v.insurance_expiry, v.service_due].some(d => {
      if (!d) return false;
      return new Date(d).getTime() < nowMs;
    });
  });
  if (overdue.length > 0) elevated.push('vehicles');

  // ── Maintenance ───────────────────────────────────────────────────────────
  const tasks = store.get('maintenance_tasks') || [];
  const overdueTasks = tasks.filter(t => {
    if (!t.next_due) return false;
    return new Date(t.next_due).getTime() < nowMs;
  });
  if (overdueTasks.length >= 2) elevated.push('maintenance');

  // ── Health ────────────────────────────────────────────────────────────────
  const health = store.get('health') || {};
  const hasOverdueHealth = _healthElevated(health);
  if (hasOverdueHealth) elevated.push('health');

  // ── Calendar pressure ─────────────────────────────────────────────────────
  const calendar = store.get('calendar') || [];
  const warningCount = calendar.filter(e => {
    if (!e.date) return false;
    const days = Math.ceil((new Date(e.date) - new Date()) / 86400000);
    return e.pressure === 'warning' && days >= 0 && days <= 7;
  }).length;
  if (warningCount >= 3) elevated.push('calendar');

  // ── Reflecting pool velocity ──────────────────────────────────────────────
  // High-frequency pool use may indicate load, not just engagement
  const pool = store.get('reflecting_pool') || [];
  const recentSessions = pool.filter(s => {
    if (!s.started_at) return false;
    const days = (Date.now() - new Date(s.started_at).getTime()) / 86400000;
    return days <= 7;
  });
  if (recentSessions.length >= 4) elevated.push('reflecting_pool');

  const active = elevated.length >= CONVERGENCE_THRESHOLD;

  return {
    active,
    domains:      elevated,
    domain_count: elevated.length,
    threshold:    CONVERGENCE_THRESHOLD,
  };
}

/**
 * Returns true if the health domain is elevated enough to count
 * toward convergence. Elevated = overdue appointment OR hard season.
 */
function _healthElevated(health) {
  if (!health || typeof health !== 'object') return false;

  const medical = health.medical || {};
  // Overdue appointment
  if (medical.next_appointment) {
    const days = Math.ceil((new Date(medical.next_appointment) - new Date()) / 86400000);
    if (days < -7) return true; // more than a week overdue
  }

  // Hard season signal from mental sub-domain
  const mental = health.mental || {};
  if (mental.current_state === 'hard_season') return true;

  // No provider and in a managing state
  if (mental.current_state === 'managing' && !mental.has_provider && !mental.provider_name) {
    return true;
  }

  return false;
}

/**
 * Run convergence detection and update the shape store.
 * Called on app load and after any significant domain change.
 * Returns the convergence result.
 */
export function checkConvergence() {
  const shape  = _getShape();
  const result = _scanConvergence();

  const wasActive = shape.convergence.active;

  shape.convergence = {
    ...shape.convergence,
    active:    result.active,
    domains:   result.domains,
    checked_at: new Date().toISOString(),
  };

  // Log threshold crossing to raw layer
  if (result.active && !wasActive) {
    shape.convergence.detected_at           = new Date().toISOString();
    shape.convergence.threshold_crossings   = (shape.convergence.threshold_crossings || 0) + 1;
    appendRaw('convergence', {
      domains:     result.domains,
      domain_count: result.domain_count,
      threshold:   result.threshold,
    });
    shape.rebuild_pending = true;
  }

  // Recovery — convergence cleared
  if (wasActive && !result.active) {
    appendRaw('convergence', {
      type:    'cleared',
      domains: result.domains,
    });
    shape.rebuild_pending = true;
  }

  _saveShape(shape);
  return result;
}


// ---------------------------------------------------------------------------
// PART 5 — INTERPRETED LAYER
//
// The living paragraph. Periodically rebuilt from the raw layer by AI.
// Not a data structure. Not a score. A written understanding of a person.
//
// The interpreted layer is SHAPE's primary output.
// It is the most important thing this app will ever produce.
// ---------------------------------------------------------------------------

/**
 * Rebuild the interpreted layer from the current state of all domains
 * and the raw event history.
 *
 * This is an async operation. It does not interrupt normal app operation.
 * It runs silently. The person never sees it happen.
 *
 * @returns {Promise<string>} — the new interpreted layer paragraph
 */
export async function rebuildInterpretedLayer() {
  const shape    = _getShape();
  const portrait = _buildPortraitInput();

  let paragraph = null;
  try {
    paragraph = await _generateInterpretedLayer(portrait);
  } catch (err) {
    console.warn('[SHAPE] Interpreted layer rebuild failed:', err);
    return null;
  }

  // Log the rebuild to raw
  appendRaw('interpreted_rebuild', {
    previous_length: shape.interpreted ? shape.interpreted.length : 0,
    new_length:      paragraph.length,
    triggered_by:    portrait.rebuild_trigger,
  });

  // Update shape
  shape.interpreted    = paragraph;
  shape.rebuilt_at     = new Date().toISOString();
  shape.rebuild_pending = false;
  _saveShape(shape);

  return paragraph;
}

/**
 * Assemble all domain state into a structured portrait for the AI rebuild prompt.
 * This is the full read-across — everything SHAPE knows, formatted for the prompt.
 */
function _buildPortraitInput() {
  const user     = store.get('user')        || {};
  const team     = store.get('team')        || {};
  const onboard  = store.get('onboarding')  || {};
  const vehicles = store.get('vehicles')    || [];
  const health   = store.get('health')      || {};
  const calendar = store.get('calendar')    || [];
  const pool     = store.get('reflecting_pool') || [];
  const shape    = _getShape();

  const nowMs    = Date.now();

  // ── User identity ──────────────────────────────────────────────────────────
  const identity = {
    name:          user.name,
    world:         store.get('world'),
    country:       user.country,
    province:      user.province,
    life_season:   onboard.situation,
    priorities:    onboard.mission || [],
    joined:        user.joined,
    days_in_app:   user.joined
      ? Math.floor((nowMs - new Date(user.joined).getTime()) / 86400000)
      : null,
  };

  // ── Team ──────────────────────────────────────────────────────────────────
  const teamPicture = {
    has_partner:   !!team.partner?.name,
    partner_name:  team.partner?.name || null,
    child_count:   (team.children || []).length,
    children:      (team.children || []).map(c => ({
      name: c.name,
      age:  c.age || null,
    })),
  };

  // ── Vehicles ──────────────────────────────────────────────────────────────
  const vehiclePicture = vehicles.map(v => {
    const signals = [];
    [
      { field: v.registration_expiry, label: 'Registration' },
      { field: v.insurance_expiry,    label: 'Insurance' },
      { field: v.service_due,         label: 'Service' },
    ].forEach(({ field, label }) => {
      if (!field) return;
      const days = Math.ceil((new Date(field) - new Date()) / 86400000);
      if (days <= 30) signals.push({ label, days, overdue: days < 0 });
    });
    return { name: v.name, signals };
  });

  // ── Health ─────────────────────────────────────────────────────────────────
  const medical = health.medical || {};
  const physical = health.physical || {};
  const mental   = health.mental   || {};
  const healthPicture = {
    coverage_type:   medical.coverage_type || null,
    next_appointment: medical.next_appointment || null,
    appointment_days: medical.next_appointment
      ? Math.ceil((new Date(medical.next_appointment) - new Date()) / 86400000)
      : null,
    activity_level:   physical.activity_level || null,
    mental_state:     mental.current_state || null,
    has_provider:     !!(mental.has_provider || mental.provider_name),
  };

  // ── Calendar summary ──────────────────────────────────────────────────────
  const upcomingWarnings = calendar.filter(e => {
    if (!e.date) return false;
    const days = Math.ceil((new Date(e.date) - new Date()) / 86400000);
    return e.pressure === 'warning' && days >= 0 && days <= 14;
  }).length;
  const totalNext30 = calendar.filter(e => {
    if (!e.date) return false;
    const days = Math.ceil((new Date(e.date) - new Date()) / 86400000);
    return days >= 0 && days <= 30;
  }).length;

  const calendarPicture = {
    warnings_next_14: upcomingWarnings,
    total_next_30:    totalNext30,
  };

  // ── Reflecting pool summary ───────────────────────────────────────────────
  const recentPool = pool
    .filter(s => s.closed && s.started_at)
    .slice(-5)
    .map(s => {
      const userExchanges = (s.exchanges || [])
        .filter(e => e.role === 'user')
        .map(e => e.content.slice(0, 80))
        .join(' | ');
      return {
        date:          s.started_at?.slice(0, 10),
        exchanges:     s.exchanges?.length || 0,
        user_summary:  userExchanges.slice(0, 200),
      };
    });

  const poolVelocity7 = pool.filter(s => {
    if (!s.started_at) return false;
    return (nowMs - new Date(s.started_at).getTime()) / 86400000 <= 7;
  }).length;

  const poolPicture = {
    total_sessions:   pool.filter(s => s.closed).length,
    velocity_7_days:  poolVelocity7,
    recent_sessions:  recentPool,
  };

  // ── Raw layer summary ─────────────────────────────────────────────────────
  // Last 20 raw events, type + domain only (no content — keeps prompt manageable)
  const recentRaw = (shape.raw || [])
    .slice(-20)
    .map(e => ({ type: e.type, domain: e.domain || null, ts: e.ts?.slice(0, 10) }));

  // ── Pool signals ──────────────────────────────────────────────────────────
  const poolSignals = (shape.raw || [])
    .filter(e => e.type === 'pool_signal' && e.signal_type !== 'factual_correction')
    .slice(-10)
    .map(e => ({
      signal_type: e.signal_type,
      domain:      e.domain,
      weight:      e.weight,
      summary:     e.summary,
      ts:          e.ts?.slice(0, 10),
    }));

  // ── Convergence ───────────────────────────────────────────────────────────
  const convergence = shape.convergence || {};

  return {
    identity,
    team:       teamPicture,
    vehicles:   vehiclePicture,
    health:     healthPicture,
    calendar:   calendarPicture,
    pool:       poolPicture,
    pool_signals: poolSignals,
    convergence,
    recent_raw: recentRaw,
    existing_interpreted: shape.interpreted,
    rebuild_trigger: 'manual',
  };
}

/**
 * Call the API to generate the interpreted layer from the portrait input.
 *
 * @param {object} portrait — structured domain picture from _buildPortraitInput()
 * @returns {Promise<string>} — the interpreted paragraph
 */
async function _generateInterpretedLayer(portrait) {
  const systemPrompt = `You are SHAPE — the human intelligence layer of a personal life management app. Your job is to produce the interpreted layer: a single, precise paragraph that describes this person — their current load, their pattern, their trajectory, and where the picture is healthy or strained.

WHAT THE INTERPRETED LAYER IS:
A written understanding of a specific human being. Not a data summary. Not a list of signals. A paragraph that, when read by the Sanctuary AI, tells it enough about this person that its first sentence does not ask what is wrong — it opens from knowing.

WHAT IT ALWAYS INCLUDES:
- Current load picture — what is active, elevated, or quiet across domains right now
- Baseline comparison — whether the current picture is above, below, or within this person's normal range
- Trajectory — improving, stable, declining, or mixed
- One positive marker — something working, cleared, or improved (always present)

WHAT IT INCLUDES WHEN EARNED (only when the data justifies it):
- A named inflection point — if a significant sustained shift has occurred
- A positive arc — if genuine sustained progress across domains
- A specific avoidance pattern — if the same domain signal has been deferred 3+ times
- A convergence note — if multiple domains are simultaneously above their elevated threshold
- A seasonal signal — which of the eight worlds (Operator, Range, Garden, Journey, Playbook, Summit, Practice, Meadow) this person is currently inhabiting based on observed behaviour

WHAT IT NEVER DOES:
- Speculate beyond what the data contains
- Guess at cause
- Apply clinical language
- Judge decisions made or deferred
- Express concern in a way that reads as alarm
- Be sycophantic or performatively warm

REGISTER:
Plain. Human. Precise. The paragraph should read the way a trusted person who has been paying attention would speak — not a clinician, not a coach, not a product. Someone who actually knows this person and is saying something true.

LENGTH: 3–6 sentences. Not longer. The paragraph earns every sentence.

RESPOND WITH THE PARAGRAPH ONLY. No preamble. No explanation. No JSON.`;

  return await api.getShapeInterpreted({ systemPrompt, portrait });
}


// ---------------------------------------------------------------------------
// PART 6 — REBUILD TRIGGER LOGIC
//
// The interpreted layer is not rebuilt constantly. It is rebuilt when
// something significant has happened that the current paragraph no longer
// captures accurately.
//
// Triggers:
//   - A Sanctuary session closes
//   - A significant positive inflection is detected
//   - A convergence threshold is crossed or clears
//   - 30 days have passed and the raw layer has grown substantially
//   - A Has something changed? submission describes a significant event
//   - A pool signal of weight 'significant' was extracted
// ---------------------------------------------------------------------------

/**
 * Evaluate whether a rebuild should run now.
 * Returns true if a rebuild is warranted.
 */
export function shouldRebuild() {
  const shape = _getShape();

  if (shape.rebuild_pending) return true;

  // Never been built
  if (!shape.interpreted || !shape.rebuilt_at) return true;

  // Time-based: 30 days + substantial raw growth
  const daysSinceRebuild = (Date.now() - new Date(shape.rebuilt_at).getTime()) / 86400000;
  const rawSinceRebuild  = (shape.raw || []).filter(e =>
    new Date(e.ts).getTime() > new Date(shape.rebuilt_at).getTime()
  ).length;

  if (daysSinceRebuild >= 30 && rawSinceRebuild >= 10) return true;

  return false;
}

/**
 * Trigger a rebuild if warranted.
 * Call this after significant events — pool session close, intake submission,
 * sanctuary session close, convergence state change.
 *
 * Runs async, does not block. Caller does not need to await.
 */
export async function triggerRebuildIfNeeded() {
  if (!shouldRebuild()) return;
  await rebuildInterpretedLayer();
}


// ---------------------------------------------------------------------------
// PART 7 — ATAK SHARING INTERFACE
//
// What SHAPE provides to the ATAK brief.
//
// The ATAK gets the form — elevated, ordinary, positive, hard season.
// It gets enough to contextualise its signals. It does not get the full
// person portrait — that belongs to the Sanctuary.
//
// The intimacy gradient governs this separation. The ATAK is a trusted
// colleague. The Sanctuary is the inner circle. SHAPE knows the difference.
// ---------------------------------------------------------------------------

/**
 * Returns a lightweight context object for use in the ATAK brief.
 * This is what the brief reads — not the full interpreted layer.
 *
 * @returns {object}
 */
export function getShapeContext() {
  const shape = _getShape();
  const conv  = shape.convergence || {};

  // Season determination — stated world vs observed
  const statedWorld    = store.get('world');
  const observedWorld  = _inferObservedWorld();

  // Load picture summary — for brief personalisation
  const loadSummary = _buildLoadSummary();

  return {
    // Season signal
    world:          statedWorld,
    observed_world: observedWorld,
    season_signal:  observedWorld !== statedWorld ? 'drift_detected' : 'consistent',

    // Load picture
    load_level:     loadSummary.level,     // 'clear' | 'elevated' | 'hard_season'
    active_domains: loadSummary.domains,   // which domains are above baseline

    // Convergence
    convergence_active:   conv.active  || false,
    convergence_domains:  conv.domains || [],

    // Pool activity — proxy for how the person is doing emotionally
    pool_velocity:  _poolVelocity(),

    // Positive signal — always present
    positive_marker: _findPositiveMarker(),

    // Whether the interpreted layer exists and is current
    has_interpreted: !!shape.interpreted,
  };
}

/**
 * Infer the observed world from behavioural signals.
 * This is the app's read of which world the person is actually in,
 * as distinct from which world they selected at onboarding.
 *
 * Early implementation — reads from pool velocity, health state, and calendar load.
 * Will deepen over time as the raw layer accumulates.
 */
function _inferObservedWorld() {
  const statedWorld = store.get('world');
  if (!statedWorld) return null;

  const health  = store.get('health') || {};
  const mental  = health.mental || {};
  const pool    = store.get('reflecting_pool') || [];
  const nowMs   = Date.now();

  // High pool velocity in a short window may indicate a season shift
  const velocity7 = pool.filter(s => {
    if (!s.started_at) return false;
    return (nowMs - new Date(s.started_at).getTime()) / 86400000 <= 7;
  }).length;

  // Hard season signal → lean toward Sanctuary-appropriate worlds
  if (mental.current_state === 'hard_season') {
    if (['Operator', 'Range', 'Playbook', 'Summit'].includes(statedWorld)) {
      return 'Sanctuary'; // person may be in harder season than their stated world suggests
    }
  }

  // High velocity pool use with hard season signal
  if (velocity7 >= 5 && mental.current_state === 'hard_season') {
    return 'Meadow'; // the Meadow person's signal: coping tools are in use
  }

  // Default: trust the stated world
  return statedWorld;
}

/**
 * Summarise the current load picture for the ATAK context.
 */
function _buildLoadSummary() {
  const result = checkConvergence();

  if (result.active) {
    return { level: 'hard_season', domains: result.domains };
  }

  if (result.domain_count >= 1) {
    return { level: 'elevated', domains: result.domains };
  }

  return { level: 'clear', domains: [] };
}

/**
 * Return the pool velocity for the last 7 days.
 */
function _poolVelocity() {
  const pool  = store.get('reflecting_pool') || [];
  const nowMs = Date.now();
  return pool.filter(s => {
    if (!s.started_at) return false;
    return (nowMs - new Date(s.started_at).getTime()) / 86400000 <= 7;
  }).length;
}

/**
 * Find a positive marker from the raw layer — something that went well recently.
 * Used in the ATAK context and the interpreted layer.
 */
function _findPositiveMarker() {
  const shape = _getShape();
  const recent = (shape.raw || [])
    .filter(e => e.type === 'domain_event')
    .slice(-20);

  // Positive event types
  const positiveTypes = ['appointment_kept', 'service_completed', 'signal_resolved', 'goal_completed'];
  const positive = recent.find(e => positiveTypes.includes(e.event_type));

  if (positive) {
    return {
      domain:     positive.domain,
      event_type: positive.event_type,
      ts:         positive.ts,
    };
  }

  // Fallback — if any domain signal was recently resolved
  const resolved = (shape.raw || [])
    .filter(e => e.type === 'domain_signal' && e.status === 'resolved')
    .slice(-5)[0];

  if (resolved) {
    return {
      domain:     resolved.domain,
      event_type: 'signal_resolved',
      label:      resolved.label,
      ts:         resolved.ts,
    };
  }

  return null;
}


// ---------------------------------------------------------------------------
// PART 8 — SANCTUARY HANDOFF
//
// When the Sanctuary opens, SHAPE produces the handoff.
// This is the full portrait — structured for the Sanctuary AI system prompt.
//
// The Sanctuary AI reads the handoff and knows this person well enough
// that its first sentence does not ask what is wrong. It opens from knowing.
// ---------------------------------------------------------------------------

/**
 * Build the Sanctuary handoff object.
 * Called by the Sanctuary module when opening a session.
 *
 * @returns {object} — structured briefing for the Sanctuary AI system prompt
 */
export function getSanctuaryHandoff() {
  const shape     = _getShape();
  const portrait  = _buildPortraitInput();
  const shapeCtx  = getShapeContext();

  // Avoidance signals — domain signals deferred 3+ times
  const avoidance = _detectAvoidancePatterns();

  // Decision pattern — how does this person move from recognition to action?
  const decisionPattern = _inferDecisionPattern();

  return {
    // The interpreted layer — the full person portrait
    interpreted_layer: shape.interpreted || null,
    interpreted_age:   shape.rebuilt_at
      ? Math.floor((Date.now() - new Date(shape.rebuilt_at).getTime()) / 86400000)
      : null,

    // Season signal
    world:            portrait.identity.world,
    observed_world:   shapeCtx.observed_world,
    season_confidence: shapeCtx.season_signal === 'consistent' ? 'high' : 'moderate',

    // Current state
    convergence_active:  shapeCtx.convergence_active,
    convergence_domains: shapeCtx.convergence_domains,
    load_level:          shapeCtx.load_level,
    active_domains:      shapeCtx.active_domains,

    // Human picture
    positive_markers: [shapeCtx.positive_marker].filter(Boolean),
    avoidance_signals: avoidance,
    decision_pattern:  decisionPattern,

    // Pool intelligence — what has the user been saying?
    pool_velocity:     shapeCtx.pool_velocity,
    recent_pool_signals: (shape.raw || [])
      .filter(e => e.type === 'pool_signal' && e.signal_type !== 'factual_correction')
      .slice(-6)
      .map(e => ({ type: e.signal_type, domain: e.domain, weight: e.weight, summary: e.summary })),

    // Trajectory
    trajectory: _inferTrajectory(),
  };
}

/**
 * Detect avoidance patterns — domain signals deferred 3+ times.
 * Returns an array of avoidance objects.
 */
function _detectAvoidancePatterns() {
  const shape    = _getShape();
  const raw      = shape.raw || [];
  const signals  = raw.filter(e => e.type === 'domain_signal');

  // Count recurrences by domain + signal_type
  const counts = {};
  signals.forEach(e => {
    const key = `${e.domain}:${e.signal_type}`;
    if (!counts[key]) counts[key] = { domain: e.domain, signal_type: e.signal_type, count: 0, label: e.label };
    counts[key].count++;
  });

  return Object.values(counts)
    .filter(c => c.count >= 3)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(c => ({
      domain:      c.domain,
      signal_type: c.signal_type,
      label:       c.label,
      recurrences: c.count,
    }));
}

/**
 * Infer trajectory from recent raw events.
 * Returns 'improving' | 'stable' | 'declining' | 'mixed' | 'unknown'
 */
function _inferTrajectory() {
  const shape   = _getShape();
  const raw     = shape.raw || [];
  const recent  = raw.slice(-30);

  const resolvedCount = recent.filter(e =>
    (e.type === 'domain_signal' && e.status === 'resolved') ||
    (e.type === 'domain_event' && ['appointment_kept', 'service_completed', 'signal_resolved'].includes(e.event_type))
  ).length;

  const newSignalCount = recent.filter(e =>
    e.type === 'domain_signal' && e.status === 'new'
  ).length;

  const convergenceCount = recent.filter(e => e.type === 'convergence').length;

  if (convergenceCount >= 2) return 'declining';
  if (resolvedCount > newSignalCount * 1.5) return 'improving';
  if (newSignalCount > resolvedCount * 1.5) return 'declining';
  if (resolvedCount > 0 && newSignalCount > 0) return 'mixed';
  if (resolvedCount === 0 && newSignalCount === 0) return 'stable';
  return 'unknown';
}

/**
 * Infer decision pattern from raw layer.
 * Returns a plain language description — for the Sanctuary AI, not the user.
 */
function _inferDecisionPattern() {
  const shape  = _getShape();
  const raw    = shape.raw || [];

  const intakes   = raw.filter(e => e.type === 'intake').length;
  const events    = raw.filter(e => e.type === 'domain_event').length;
  const velocity  = _poolVelocity();

  if (intakes === 0 && events === 0) return 'early_data'; // not enough yet to characterise

  const ratio = events / Math.max(intakes, 1);

  if (ratio >= 3)   return 'action_oriented';  // high follow-through
  if (ratio >= 1.5) return 'considered';       // thinks before acting
  if (ratio >= 0.5) return 'reflective';       // processes more than acts
  return 'deliberate';                          // moves carefully
}


// ---------------------------------------------------------------------------
// PART 9 — BOOTSTRAP AND INITIALISATION
// ---------------------------------------------------------------------------

/**
 * Initialise SHAPE on app load.
 * - Ensures store.shape exists
 * - Runs convergence check
 * - Queues interpreted layer rebuild if needed
 *
 * Called once from main.js after store is loaded.
 * Non-blocking — rebuild runs async.
 */
export function initShape() {
  // Ensure shape store is initialised
  const shape = _getShape();
  if (!store.get(SHAPE_KEY)) {
    _saveShape(shape);
  }

  // Convergence check
  checkConvergence();

  // Queue rebuild if needed — runs async, does not block boot
  triggerRebuildIfNeeded().catch(err => {
    console.warn('[SHAPE] Background rebuild failed on init:', err);
  });
}

/**
 * Called when the user submits a Has something changed? intake.
 * Records the intake, flags for rebuild.
 */
export function onIntakeSubmit(source, answers) {
  recordIntake(source, answers);

  const shape = _getShape();
  shape.rebuild_pending = true;
  _saveShape(shape);

  triggerRebuildIfNeeded().catch(() => {});
}

/**
 * Called when a Sanctuary session closes.
 * Flags a rebuild — the person's season may have shifted.
 */
export function onSanctuaryClose() {
  appendRaw('domain_event', { domain: 'sanctuary', event_type: 'session_closed' });

  const shape = _getShape();
  shape.rebuild_pending = true;
  _saveShape(shape);

  triggerRebuildIfNeeded().catch(() => {});
}

/**
 * Called after a pool session closes.
 * Runs the full extraction pipeline and queues rebuild if needed.
 *
 * @param {object} session — the closed session from store.reflecting_pool
 */
export async function onPoolSessionClose(session) {
  await processPoolSession(session);
  checkConvergence();
  await triggerRebuildIfNeeded();
}
