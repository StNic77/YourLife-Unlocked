import { store } from './store.js';

// ---------------------------------------------------------------------------
// HEALTH DOMAIN MODULE
//
// Owns all health domain logic:
//   - Brief content for the grab-and-go panel (all three sub-domains)
//   - Calendar signal writing and retirement
//   - Store shape for Medical, Physical, and Mental Well-being
//
// Architecture:
//   health.js ──reads/writes──▶ store.health
//   health.js ──writes signals──▶ store.calendar
//   home.js   ──calls──▶ getHealthBrief() for the panel
//   atak.js   ──reads──▶ store.health directly for cross-domain synthesis
//
// health.js does not import from home.js, cascade.js, or atak.js.
// The store is the only shared interface.
//
// Health Intelligence Boundary (Rules 2.13):
//   Appointment reminders, recurrence windows, age-appropriate screening
//   nudges, and broadly accepted general guidance only.
//   Never: symptoms, diagnoses, medication comments, clinical judgement.
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// STORE SHAPE — REFERENCE
//
// store.health = {
//   disclaimer_seen: false,
//
//   medical: {
//     complete: false,
//     sex_assigned_at_birth: null,      // 'male' | 'female' | 'intersex' | 'prefer_not_to_say'
//     primary_care: {
//       has_provider: null,             // true | false
//       name: null,
//       last_seen: null,                // ISO date string
//       next_due: null,                 // ISO date string — computed or user-set
//     },
//     providers: [],                    // [{ type, name, last_seen, next_due }]
//     conditions: [],                   // [{ id, label, custom: false }]
//     medications: [],                  // [{ name }] — free text, no clinical commentary
//     screenings: [],                   // [{ id, label, last_done, next_due, skipped }]
//   },
//
//   physical: {
//     complete: false,
//     activity_level: null,             // 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
//     goals: [],                        // tile-selected: ['lose_weight', 'build_strength', ...]
//     limitations: [],                  // tile-selected or free text
//     workout_note: null,               // optional free text
//   },
//
//   mental: {
//     complete: false,
//     current_state: null,              // tile: 'doing_well' | 'managing' | 'hard_season' | 'prefer_not_to_say'
//     has_provider: null,               // true | false — therapist, counsellor, psychiatrist
//     provider_name: null,
//     provider_type: null,              // 'therapist' | 'counsellor' | 'psychiatrist' | 'other'
//     last_seen: null,                  // ISO date string
//     app_holds_quietly: false,         // true when user has indicated difficulty — app waits
//   },
// }
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// THRESHOLDS
// ---------------------------------------------------------------------------

const HEALTH_SIGNAL_WARNING_DAYS  = 0;   // past due → warning
const HEALTH_SIGNAL_CAUTION_DAYS  = 30;  // within 30 days → caution
const HEALTH_SIGNAL_INFO_DAYS     = 60;  // within 60 days → info (for appointments)

// How overdue before annual physical becomes a warning vs caution
const ANNUAL_PHYSICAL_OVERDUE_DAYS = 365 + 90; // ~15 months — grace window before warning

// Default recurrence windows (days) — broadly accepted general guidance
const RECURRENCE = {
  annual_physical:    365,
  dental_cleaning:    180,
  eye_exam:           730,   // every 2 years for most adults
  skin_check:         365,
  mammogram:          365,   // age/risk dependent — ATAK can refine
  pap_smear:          1095,  // every 3 years general guidance
  colonoscopy:        3650,  // every 10 years general guidance
};


// ---------------------------------------------------------------------------
// BRIEF CONTENT
// Returns the structured content for the health grab-and-go panel.
// Three sub-domain sections: Medical, Physical, Mental Well-being.
// Sections that have nothing to say stay quiet.
// ---------------------------------------------------------------------------

export function getHealthBrief() {
  const health   = store.get('health') || {};
  const medical  = health.medical  || {};
  const physical = health.physical || {};
  const mental   = health.mental   || {};

  const subDomains = [];

  const medLines = _buildMedicalLines(medical);
  if (medLines.length) subDomains.push({ sub_domain: 'medical',  label: 'Medical',    lines: medLines });

  const physLines = _buildPhysicalLines(physical);
  if (physLines.length) subDomains.push({ sub_domain: 'physical', label: 'Physical',   lines: physLines });

  const mentalLines = _buildMentalLines(mental);
  if (mentalLines.length) subDomains.push({ sub_domain: 'mental',   label: 'Well-being', lines: mentalLines });

  const complete = medical.complete || physical.complete || mental.complete;

  if (!subDomains.length) {
    return {
      title:      'Health',
      sections:   [{
        label:  'Health picture not yet on file',
        value:  "Add your health information and I'll surface what needs attention",
        urgent: false,
      }],
      cta:        'Set up health',
      cta_action: 'setup_health',
    };
  }

  // Build collapsible blocks — collapsed by default, toggle via inline onclick
  const sections = subDomains.map(sd => {
    const hasUrgent = sd.lines.some(l => l.urgent);
    const uid       = `hsd-${sd.sub_domain}`;

    const linesHTML = sd.lines.map(line => {
      const hasTap = !!line.action;
      const contextAttr = hasTap
        ? `data-health-action="${line.action}" data-health-context='${JSON.stringify(line.action_context || {})}'`
        : '';
      return `
      <div
        ${contextAttr}
        class="${hasTap ? 'health-action-line' : ''}"
        style="
          padding:10px 0;
          border-bottom:0.5px solid rgba(240,235,218,0.05);
          display:flex;justify-content:space-between;align-items:flex-start;gap:12px;
          ${hasTap ? 'cursor:pointer;' : ''}
        "
        ${hasTap ? `onmouseenter="this.style.background='rgba(240,235,218,0.02)'" onmouseleave="this.style.background=''"` : ''}
      >
        <div style="
          font-family:var(--font-sans);font-weight:200;
          font-size:12px;letter-spacing:0.03em;
          color:rgba(240,235,218,0.4);
          flex:0 0 auto;max-width:45%;
        ">${line.label}</div>
        <div style="
          font-family:var(--font-sans);font-weight:300;
          font-size:12px;letter-spacing:0.02em;
          color:${line.urgent ? 'rgba(210,160,60,0.9)' : 'rgba(240,235,218,0.65)'};
          text-align:right;
          ${hasTap ? 'text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(240,235,218,0.15);' : ''}
        ">${line.value || ''}</div>
      </div>
    `}).join('');

    return {
      custom_html: `
        <div style="margin-bottom:4px;">
          <!-- Heading — toggle only, no cascade -->
          <button
            onclick="(function(){
              var items = document.getElementById('${uid}-items');
              var chev  = document.getElementById('${uid}-chev');
              if (!items) return;
              var hidden = items.style.display === 'none';
              items.style.display = hidden ? 'block' : 'none';
              if (chev) chev.textContent = hidden ? '‹' : '›';
            })()"
            style="
              display:flex;justify-content:space-between;align-items:center;
              width:100%;
              padding:14px 0;
              border-bottom:0.5px solid rgba(240,235,218,0.08);
              font-family:var(--font-sans);font-weight:200;
              font-size:10px;letter-spacing:0.25em;text-transform:uppercase;
              color:${hasUrgent ? 'rgba(210,160,60,0.7)' : 'rgba(240,235,218,0.4)'};
              cursor:pointer;
              transition:color 0.15s ease;
            "
            onmouseenter="this.style.color='rgba(240,235,218,0.85)'"
            onmouseleave="this.style.color='${hasUrgent ? 'rgba(210,160,60,0.7)' : 'rgba(240,235,218,0.4)'}'"
          >
            <span>${sd.label}</span>
            <span id="${uid}-chev" style="font-size:14px;letter-spacing:0;opacity:0.4;">›</span>
          </button>

          <!-- Expanded content — lines + edit link -->
          <div id="${uid}-items" style="display:none;padding:4px 0 8px;">
            ${linesHTML}
            <div style="margin-top:10px;text-align:right;">
              <button
                class="health-subdomain-label"
                data-sub-domain="${sd.sub_domain}"
                style="
                  font-family:var(--font-sans);font-weight:200;
                  font-size:10px;letter-spacing:0.18em;text-transform:uppercase;
                  color:rgba(240,235,218,0.25);
                  cursor:pointer;
                  background:none;border:none;padding:4px 0;
                  transition:color 0.15s ease;
                "
                onmouseenter="this.style.color='rgba(240,235,218,0.6)'"
                onmouseleave="this.style.color='rgba(240,235,218,0.25)'"
              >Edit</button>
            </div>
          </div>
        </div>
      `,
    };
  });

  return {
    title:      'Health',
    sections,
    cta:        null,
    cta_action: null,
  };
}

// Medical section lines — primary care, providers, upcoming screenings
function _buildMedicalLines(medical) {
  const lines  = [];
  const today  = new Date();

  // Primary care provider
  const pc = medical.primary_care || {};
  if (pc.has_provider === false) {
    lines.push({
      label:  'Primary care',
      value:  'No provider on file',
      urgent: false,
    });
  } else if (pc.name) {
    const pcLine = _dateStatusLine('Annual physical', pc.next_due, today);
    lines.push({
      label:  pc.name,
      value:  pcLine.text,
      urgent: pcLine.urgent,
      action: 'medical_appointment',
      action_context: {
        appointment_type: 'annual_physical',
        provider_name:    pc.name,
        provider_phone:   pc.phone       || null,
        provider_url:     pc.booking_url || null,
        signal_ref:       'primary',
        signal_type:      'annual_physical',
        last_seen:        pc.last_seen   || null,
        next_due:         pc.next_due    || null,
      },
    });
  }

  // Other providers — dentist, eye care, specialists
  (medical.providers || []).forEach(p => {
    if (!p.name && !p.type) return;
    const label = p.name || p.type;
    const status = p.next_due ? _dateStatusLine(label, p.next_due, today) : null;
    lines.push({
      label,
      value:  status ? status.text : 'No appointment on file',
      urgent: status ? status.urgent : false,
      action: 'medical_appointment',
      action_context: {
        appointment_type: p.type          || 'specialist',
        provider_name:    p.name          || null,
        provider_type:    _providerTypeLabel(p.type),
        provider_phone:   p.phone         || null,
        provider_url:     p.booking_url   || null,
        signal_ref:       p.id,
        signal_type:      'provider',
        last_seen:        p.last_seen     || null,
        next_due:         p.next_due      || null,
        interval_days:    p.interval_days || null,
      },
    });
  });

  // Screenings — only surface ones that are due or coming up
  (medical.screenings || []).filter(s => !s.skipped && s.next_due).forEach(s => {
    const status = _dateStatusLine(s.label, s.next_due, today);
    if (status.days <= HEALTH_SIGNAL_CAUTION_DAYS) {
      lines.push({
        label:  s.label,
        value:  status.text,
        urgent: status.urgent,
        action: 'medical_appointment',
        action_context: {
          appointment_type: 'screening',
          screening_id:     s.id,
          screening_label:  s.label,
          signal_ref:       s.id,
          signal_type:      'screening',
          last_done:        s.last_done      || null,
          next_due:         s.next_due       || null,
          recurrence_days:  s.recurrence_days || null,
        },
      });
    }
  });

  // Conditions — surfaced quietly if on file, no clinical commentary
  if ((medical.conditions || []).length) {
    const count = medical.conditions.length;
    lines.push({
      label:  'Conditions on file',
      value:  `${count} condition${count === 1 ? '' : 's'} on file`,
      urgent: false,
    });
  }

  // Medications — count only, no names or commentary in brief
  if ((medical.medications || []).length) {
    const count = medical.medications.length;
    lines.push({
      label:  'Medications',
      value:  `${count} medication${count === 1 ? '' : 's'} on file`,
      urgent: false,
    });
  }

  return lines;
}

// Physical section lines — activity level, goals
function _buildPhysicalLines(physical) {
  const lines = [];
  if (!physical.complete) return lines;

  // Build the shared action context once — all physical lines open the same cascade
  const physicalContext = {
    activity_level: physical.activity_level || null,
    goals:          physical.goals          || [],
    limitations:    physical.limitations    || [],
    workout_note:   physical.workout_note   || null,
  };

  if (physical.activity_level) {
    lines.push({
      label:  'Activity',
      value:  _activityLabel(physical.activity_level),
      urgent: false,
      action: 'physical_advice',
      action_context: physicalContext,
    });
  }
  if ((physical.goals || []).length) {
    lines.push({
      label:  'Goals',
      value:  physical.goals.slice(0, 2).map(_goalLabel).join(', '),
      urgent: false,
      action: 'physical_advice',
      action_context: physicalContext,
    });
  }
  if ((physical.limitations || []).length) {
    lines.push({
      label:  'Limitations on file',
      value:  `${physical.limitations.length} noted`,
      urgent: false,
      action: 'physical_advice',
      action_context: physicalContext,
    });
  }
  return lines;
}

// Mental well-being lines — current state, provider status
// Quiet by design. Never surfaces clinical content.
function _buildMentalLines(mental) {
  const lines = [];
  if (!mental.complete) return lines;

  const wellbeingContext = {
    current_state: mental.current_state  || null,
    has_provider:  mental.has_provider   || false,
    provider_name: mental.provider_name  || null,
    provider_type: mental.provider_type  || null,
    last_seen:     mental.last_seen      || null,
  };

  if (mental.current_state && mental.current_state !== 'prefer_not_to_say') {
    lines.push({
      label:  'How you\'re doing',
      value:  _mentalStateLabel(mental.current_state),
      urgent: mental.current_state === 'hard_season',
      action: 'wellbeing_action',
      action_context: wellbeingContext,
    });
  }
  if (mental.has_provider && mental.provider_name) {
    const providerLine = mental.last_seen
      ? `Last seen ${_formatDate(mental.last_seen)}`
      : 'Provider on file';
    lines.push({
      label:  mental.provider_name,
      value:  providerLine,
      urgent: false,
      action: 'wellbeing_action',
      action_context: wellbeingContext,
    });
  }
  return lines;
}


// ---------------------------------------------------------------------------
// CALENDAR SIGNAL WRITING
//
// Health writes time-sensitive signals to store.calendar.
// The ATAK reads store.calendar for temporal analysis.
// Signals use deterministic IDs — no duplicates, clean retirement.
//
// Call syncHealthSignals() after any health data change:
//   - Health intake completed
//   - Appointment date added or updated
//   - Appointment kept (retires the signal)
//   - Screening completed (retires and re-schedules)
// ---------------------------------------------------------------------------

// Deterministic signal ID for a health signal
function _signalId(type, ref) {
  return `sig_health_${type}_${ref}`;
}

// Write or update a single health signal.
// Removes any existing signal with the same ID before evaluating.
function _writeSignal(id, { title, date, signal_type, pressure, domain_ref }) {
  let calendar = store.get('calendar') || [];
  calendar = calendar.filter(e => e.id !== id);

  calendar.push({
    id,
    type:        'domain_signal',
    title,
    date:        date.slice(0, 10),
    time_start:  null,
    time_end:    null,
    all_day:     true,
    source:      'domain',
    domain:      'health',
    domain_ref,
    signal_type,
    pressure,
    created_at:  new Date().toISOString(),
    expires_at:  null,
  });

  store.set('calendar', calendar);
}

// Retire a single signal by ID.
function _retireSignal(id) {
  const calendar = store.get('calendar') || [];
  store.set('calendar', calendar.filter(e => e.id !== id));
}

// Evaluate a date field and write or retire its signal.
// windowDays: how far out to start signalling.
function _evaluateDateSignal({ id, title, dateStr, domain_ref, windowDays, signal_type }) {
  if (!dateStr) {
    _retireSignal(id);
    return;
  }

  const today = new Date();
  const date  = new Date(dateStr);
  const days  = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

  if (days > windowDays) {
    _retireSignal(id);  // not yet in window
    return;
  }

  const overdue  = days < 0;
  const pressure = overdue ? 'warning' : days <= 7 ? 'warning' : days <= 30 ? 'caution' : 'info';

  _writeSignal(id, {
    title: overdue
      ? `${title} — overdue`
      : days === 0
        ? `${title} — today`
        : `${title} in ${days} day${days === 1 ? '' : 's'}`,
    date: dateStr,
    signal_type: overdue ? 'overdue' : signal_type,
    pressure,
    domain_ref,
  });
}

// Sync all health signals from the current store.
// Called on app load and after any health data change.
export function syncHealthSignals() {
  const health  = store.get('health') || {};
  const medical = health.medical || {};

  // ── Primary care — annual physical ─────────────────────────────────────
  const pc = medical.primary_care || {};
  _evaluateDateSignal({
    id:          _signalId('annual_physical', 'primary'),
    title:       'Annual physical',
    dateStr:     pc.next_due || null,
    domain_ref:  'primary_care',
    windowDays:  HEALTH_SIGNAL_CAUTION_DAYS,
    signal_type: 'upcoming',
  });

  // ── Other providers (dentist, eye care, specialists) ───────────────────
  (medical.providers || []).forEach(p => {
    if (!p.id) return;
    _evaluateDateSignal({
      id:          _signalId('provider', p.id),
      title:       p.name || p.type || 'Provider appointment',
      dateStr:     p.next_due || null,
      domain_ref:  p.id,
      windowDays:  HEALTH_SIGNAL_CAUTION_DAYS,
      signal_type: 'appointment',
    });
  });

  // ── Screenings ─────────────────────────────────────────────────────────
  (medical.screenings || []).filter(s => !s.skipped).forEach(s => {
    _evaluateDateSignal({
      id:          _signalId('screening', s.id),
      title:       s.label || 'Screening',
      dateStr:     s.next_due || null,
      domain_ref:  s.id,
      windowDays:  HEALTH_SIGNAL_CAUTION_DAYS,
      signal_type: 'upcoming',
    });
  });
}

// Retire all health signals — used if health data is cleared.
export function retireAllHealthSignals() {
  const calendar = store.get('calendar') || [];
  store.set('calendar', calendar.filter(e => e.domain !== 'health'));
}

// Retire a single signal by its structured type and ref.
// Called when: appointment kept, screening completed, provider removed.
export function retireHealthSignal(type, ref) {
  _retireSignal(_signalId(type, ref));
}


// ---------------------------------------------------------------------------
// INTAKE HELPERS
// Used by home.js / cascade.js when running the health intake flow.
// These write to store.health and then call syncHealthSignals().
// ---------------------------------------------------------------------------

// Initialise the health store with empty sub-domain objects.
// Called once when the user first opens the health intake.
export function initHealthStore() {
  const existing = store.get('health') || {};
  if (existing.disclaimer_seen) return; // already initialised

  store.set('health', {
    disclaimer_seen: false,
    medical: {
      complete:            false,
      sex_assigned_at_birth: null,
      primary_care: {
        has_provider: null,
        name:         null,
        last_seen:    null,
        next_due:     null,
      },
      providers:   [],
      conditions:  [],
      medications: [],
      screenings:  [],
    },
    physical: {
      complete:       false,
      activity_level: null,
      goals:          [],
      limitations:    [],
      workout_note:   null,
    },
    mental: {
      complete:           false,
      current_state:      null,
      has_provider:       null,
      provider_name:      null,
      provider_type:      null,
      last_seen:          null,
      app_holds_quietly:  false,
    },
  });
}

// Compute next_due date from a last_done date and an interval in days.
// Returns an ISO date string or null.
export function computeNextDue(lastDoneISO, intervalDays) {
  if (!lastDoneISO || !intervalDays) return null;
  try {
    const d = new Date(lastDoneISO);
    d.setDate(d.getDate() + intervalDays);
    return d.toISOString().slice(0, 10);
  } catch { return null; }
}

// Compute next_due for a provider based on their type and the recurrence table.
export function computeProviderNextDue(providerType, lastSeenISO) {
  const intervals = {
    dentist:     RECURRENCE.dental_cleaning,
    eye_care:    RECURRENCE.eye_exam,
    skin:        RECURRENCE.skin_check,
    specialist:  365,  // default — user can override
  };
  const days = intervals[providerType] || 365;
  return computeNextDue(lastSeenISO, days);
}

// Return the age-and-sex appropriate screening tile set.
// age: number, sex: 'male' | 'female' | 'intersex' | 'prefer_not_to_say' | null
// Returns an array of { id, label, recurrence_days } objects.
export function getApplicableScreenings(age, sex) {
  const screenings = [];

  if (!age) return screenings;

  // Universal screenings
  if (age >= 18) {
    screenings.push({ id: 'blood_pressure', label: 'Blood pressure check', recurrence_days: 730 });
    screenings.push({ id: 'cholesterol',    label: 'Cholesterol screening', recurrence_days: 1825 });
    screenings.push({ id: 'skin_check',     label: 'Skin check',            recurrence_days: 365  });
  }
  if (age >= 40) {
    screenings.push({ id: 'blood_sugar',    label: 'Blood sugar / diabetes screening', recurrence_days: 1095 });
  }
  if (age >= 50) {
    screenings.push({ id: 'colorectal',     label: 'Colorectal cancer screening',      recurrence_days: 730  });
    screenings.push({ id: 'bone_density',   label: 'Bone density',                     recurrence_days: 3650 });
  }

  // Female-specific screenings
  if (sex === 'female' || sex === 'intersex') {
    if (age >= 21) {
      screenings.push({ id: 'pap_smear', label: 'Cervical screening (Pap)', recurrence_days: RECURRENCE.pap_smear });
    }
    if (age >= 40) {
      screenings.push({ id: 'mammogram', label: 'Mammogram', recurrence_days: RECURRENCE.mammogram });
    }
  }

  // Male-specific screenings
  if (sex === 'male') {
    if (age >= 50) {
      screenings.push({ id: 'psa', label: 'Prostate screening (PSA)', recurrence_days: 365 });
    }
  }

  return screenings;
}

// Save completed medical intake to store. Computes next_due dates where possible.
// Called by the intake flow after the user confirms.
export function saveMedicalIntake(data) {
  const health = store.get('health') || {};

  // Compute next_due for primary care if last_seen is known
  if (data.primary_care && data.primary_care.last_seen && !data.primary_care.next_due) {
    data.primary_care.next_due = computeNextDue(
      data.primary_care.last_seen,
      RECURRENCE.annual_physical
    );
  }

  // Compute next_due for providers
  (data.providers || []).forEach(p => {
    if (p.last_seen && !p.next_due) {
      p.next_due = computeProviderNextDue(p.type, p.last_seen);
    }
  });

  // Compute next_due for screenings
  (data.screenings || []).forEach(s => {
    if (s.last_done && !s.next_due && s.recurrence_days) {
      s.next_due = computeNextDue(s.last_done, s.recurrence_days);
    }
  });

  store.set('health', {
    ...health,
    medical: {
      ...health.medical,
      ...data,
      complete: true,
    },
  });

  syncHealthSignals();
}

// Save physical intake to store.
export function savePhysicalIntake(data) {
  const health = store.get('health') || {};
  store.set('health', {
    ...health,
    physical: { ...health.physical, ...data, complete: true },
  });
  // Physical data feeds ATAK directly via store — no calendar signals needed at this depth
}

// Save mental well-being intake to store.
// app_holds_quietly is set when current_state is 'hard_season'.
export function saveMentalIntake(data) {
  const health = store.get('health') || {};
  const app_holds_quietly = data.current_state === 'hard_season' ? true : (health.mental?.app_holds_quietly || false);

  store.set('health', {
    ...health,
    mental: {
      ...health.mental,
      ...data,
      app_holds_quietly,
      complete: true,
    },
  });
  // Mental data feeds ATAK directly via store — no calendar signals at this depth
}

// Mark appointment as kept. Retires the signal and optionally re-schedules.
// type: 'annual_physical' | 'provider' | 'screening'
// ref:  domain_ref string (e.g. provider id, 'primary', screening id)
// nextDueISO: optional — if provided, writes updated next_due and a new signal
export function markAppointmentKept(type, ref, nextDueISO) {
  retireHealthSignal(type, ref);

  if (!nextDueISO) return;

  const health = store.get('health') || {};
  const medical = health.medical || {};

  if (type === 'annual_physical') {
    const pc = { ...medical.primary_care, last_seen: new Date().toISOString().slice(0, 10), next_due: nextDueISO };
    store.set('health', { ...health, medical: { ...medical, primary_care: pc } });

  } else if (type === 'provider') {
    const providers = (medical.providers || []).map(p => {
      if (p.id !== ref) return p;
      const today = new Date().toISOString().slice(0, 10);
      const next  = nextDueISO ||
        (p.interval_days
          ? computeNextDue(today, p.interval_days)
          : computeProviderNextDue(p.type, today));
      return { ...p, last_seen: today, next_due: next };
    });
    store.set('health', { ...health, medical: { ...medical, providers } });

  } else if (type === 'screening') {
    const screenings = (medical.screenings || []).map(s =>
      s.id === ref ? { ...s, last_done: new Date().toISOString().slice(0, 10), next_due: nextDueISO } : s
    );
    store.set('health', { ...health, medical: { ...medical, screenings } });
  }

  syncHealthSignals();
}


// ---------------------------------------------------------------------------
// LABEL HELPERS — display strings, not business logic
// ---------------------------------------------------------------------------

function _providerTypeLabel(type) {
  return {
    dentist:    'Dentist',
    eye_care:   'Eye care',
    skin:       'Dermatologist',
    specialist: 'Specialist',
  }[type] || (type ? type.replace(/_/g, ' ') : 'Provider');
}

function _activityLabel(level) {
  return {
    sedentary:   'Mostly sedentary',
    light:       'Light activity',
    moderate:    'Moderately active',
    active:      'Active',
    very_active: 'Very active',
  }[level] || level;
}

function _goalLabel(goal) {
  return {
    lose_weight:      'Weight loss',
    build_strength:   'Build strength',
    improve_cardio:   'Cardio',
    flexibility:      'Flexibility',
    stress_relief:    'Stress relief',
    general_health:   'General health',
    sport_performance:'Sport performance',
  }[goal] || goal;
}

function _mentalStateLabel(state) {
  return {
    doing_well:  'Doing well',
    managing:    'Managing',
    hard_season: 'Hard season',
  }[state] || state;
}

function _formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-CA', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return dateStr; }
}

// Returns { text, days, urgent } for a date relative to today.
function _dateStatusLine(label, dateStr, today) {
  if (!dateStr) return { text: 'No date on file', days: Infinity, urgent: false };
  const date = new Date(dateStr);
  const days = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
  const urgent = days <= 14;
  let text;
  if (days < 0)      text = `${label} overdue`;
  else if (days === 0) text = `${label} today`;
  else if (days <= 30) text = `${label} in ${days} day${days === 1 ? '' : 's'}`;
  else               text = `Next: ${_formatDate(dateStr)}`;
  return { text, days, urgent };
}
