import { store } from './store.js';
import { isVehicleUrgent } from './vehicles.js';

// ---------------------------------------------------------------------------
// ATAK — Fused Intelligence Module
//
// The ATAK owns the intelligence layer. It reads from the store — which all
// domains write to — applies its own synthesis, and produces the brief.
//
// Architecture:
//   domains (vehicles, maintenance, team, health, …) ──write──▶ store
//   atak.js ──reads──▶ store (all of it)
//           ──applies──▶ intelligence layer (this file)
//           ──produces──▶ fused brief for the user
//
// The ATAK does not call into domain files. Domains do not know the ATAK
// exists. The store is the shared memory. This file is the only place
// cross-domain synthesis happens.
//
// isVehicleUrgent lives in vehicles.js — imported above.
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// PART 1 — UTILITIES
// Date math and age resolution used throughout the intelligence layer.
// ---------------------------------------------------------------------------

export function computeAge(birthday) {
  if (!birthday) return null;
  const match = birthday.match(/\b(19|20)\d{2}\b/);
  if (!match) return null;
  const birthYear = parseInt(match[0], 10);
  const now = new Date();
  let age = now.getFullYear() - birthYear;

  const parsed = new Date(birthday);
  if (!isNaN(parsed)) {
    const hadBirthdayThisYear = (
      now.getMonth() > parsed.getMonth() ||
      (now.getMonth() === parsed.getMonth() && now.getDate() >= parsed.getDate())
    );
    if (!hadBirthdayThisYear) age--;
  }

  return age > 0 && age < 120 ? age : null;
}

export function resolveAge(birthday, rawAge) {
  const fromBirthday = computeAge(birthday);
  if (fromBirthday !== null) return fromBirthday;

  if (rawAge) {
    const str = String(rawAge).trim();
    if (/^(19|20)\d{2}$/.test(str)) {
      const year = parseInt(str, 10);

      if (birthday) {
        const combined = new Date(`${birthday} ${year}`);
        if (!isNaN(combined)) {
          const now = new Date();
          let age = now.getFullYear() - year;
          const hadBirthday = (
            now.getMonth() > combined.getMonth() ||
            (now.getMonth() === combined.getMonth() && now.getDate() >= combined.getDate())
          );
          if (!hadBirthday) age--;
          return age >= 0 && age < 120 ? age : null;
        }
      }

      const age = new Date().getFullYear() - year - 1;
      return age >= 0 && age < 120 ? age : null;
    }
    const n = parseInt(str, 10);
    return (!isNaN(n) && n > 0 && n < 120) ? n : null;
  }
  return null;
}

export function daysUntilDate(dateStr) {
  if (!dateStr) return null;
  try {
    const now    = new Date();
    const target = new Date(dateStr);
    target.setFullYear(now.getFullYear());
    if (target < now) target.setFullYear(now.getFullYear() + 1);
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-CA', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return dateStr; }
}

export function formatBriefDate() {
  return new Date().toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}


// ---------------------------------------------------------------------------
// PART 2 — DISPLAY LABEL HELPERS
// Owned by the ATAK — these are brief presentation concerns.
// ---------------------------------------------------------------------------

export function loveLangLabel(id) {
  const map = {
    words_of_affirmation: 'Words of affirmation',
    acts_of_service:      'Acts of service',
    receiving_gifts:      'Receiving gifts',
    quality_time:         'Quality time',
    physical_touch:       'Physical touch',
  };
  return map[id] || id;
}

export function missionLabel(id) {
  const map = {
    getting_organized:   'Getting organized',
    time:                'How I spend my time',
    working_toward:      'Something I\'m working toward',
    daily_routine:       'My daily routine',
    relationships:       'My relationships',
    professional_life:   'My professional life',
    money:               'Money',
    physical_health:     'My physical health',
    emotional_wellbeing: 'My emotional well-being',
    personal_life:       'My personal life',
    undealt:             'Something I haven\'t dealt with yet',
  };
  return map[id] || id;
}


// ---------------------------------------------------------------------------
// PART 3 — URGENCY ENGINE
// Reads across all domains in the store and produces a unified urgent signal.
// This is the first layer of cross-domain synthesis.
//
// Priority order: stored items (user-facing) first, then derived items.
// Derived items are never duplicated if a stored item with the same id exists.
// ---------------------------------------------------------------------------

function isSnoozed(item) {
  if (!item.snoozed_until) return false;
  return new Date(item.snoozed_until) > new Date();
}

export function snoozeItem(itemId, hours = 24) {
  const stored  = store.get('urgent_items') || [];
  const until   = new Date();
  until.setHours(until.getHours() + hours);
  store.set('urgent_items', stored.map(i =>
    i.id !== itemId ? i : { ...i, snoozed_until: until.toISOString() }
  ));
}

export function dismissItem(itemId) {
  const stored = store.get('urgent_items') || [];
  store.set('urgent_items', stored.filter(i => i.id !== itemId));
}

// ---------------------------------------------------------------------------
// BIRTHDAY SIGNAL SYNC
//
// Writes birthday signals to store.calendar for the full 365-day forward view.
// Called on app load, after team member added/edited, and on team member removal.
//
// Birthday signals use a recurring annual date — the next upcoming occurrence
// of the birthday, not the birth year. Signal ID is deterministic so the same
// person never produces two signals.
//
// ATAK still surfaces birthdays as urgent items within 14 days (getUrgentItems).
// The calendar signal is the long-range view — visible 12 months out.
// ---------------------------------------------------------------------------

function _nextBirthdayISO(birthdayStr) {
  // birthdayStr may be "Month Day" (e.g. "June 15") or include a year ("June 15, 1985")
  if (!birthdayStr) return null;
  try {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Parse month and day — strip year if present
    const cleaned = birthdayStr.replace(/,?\s*(19|20)\d{2}/, '').trim();
    const attempt = new Date(`${cleaned} ${currentYear}`);
    if (isNaN(attempt.getTime())) return null;

    // If this year's birthday has passed, use next year
    const candidate = new Date(attempt);
    if (candidate < today) {
      candidate.setFullYear(currentYear + 1);
    }
    return candidate.toISOString().slice(0, 10);
  } catch { return null; }
}

function _writeBirthdaySignal(id, name, birthdayStr) {
  const nextISO = _nextBirthdayISO(birthdayStr);
  if (!nextISO) return;

  const today = new Date();
  const date  = new Date(nextISO);
  const days  = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

  // Only write if within the 365-day window
  if (days > 365 || days < 0) return;

  const pressure = days <= 7 ? 'warning' : days <= 30 ? 'caution' : 'info';

  let calendar = store.get('calendar') || [];
  calendar = calendar.filter(e => e.id !== id);

  calendar.push({
    id,
    type:        'domain_signal',
    title:       `${name}'s birthday`,
    date:        nextISO,
    time_start:  null,
    time_end:    null,
    all_day:     true,
    source:      'domain',
    domain:      'team',
    domain_ref:  id,
    signal_type: 'birthday',
    pressure,
    created_at:  new Date().toISOString(),
    expires_at:  null,
  });

  store.set('calendar', calendar);
}

// Sync all birthday signals from current store.team.
// Call on app load and after any team member add/edit.
export function syncBirthdaySignals() {
  const team = store.get('team') || {};

  // Retire any signals for people who no longer exist, then re-sync
  const validIds = new Set();

  if (team.partner?.birthday) {
    const id = 'sig_birthday_partner';
    validIds.add(id);
    _writeBirthdaySignal(id, team.partner.name || 'Partner', team.partner.birthday);
  }

  (team.children || []).forEach((child, idx) => {
    if (!child.birthday) return;
    const id = `sig_birthday_child_${idx}`;
    validIds.add(id);
    _writeBirthdaySignal(id, child.name || 'Child', child.birthday);
  });

  // Retire signals for removed team members
  const calendar = store.get('calendar') || [];
  store.set('calendar', calendar.filter(e => {
    if (e.domain !== 'team' || e.signal_type !== 'birthday') return true;
    return validIds.has(e.id);
  }));
}

// Retire the birthday signal for a specific person.
// Call immediately when a team member is removed.
export function retireBirthdaySignal(id) {
  const calendar = store.get('calendar') || [];
  store.set('calendar', calendar.filter(e => e.id !== id));
}

// Primary urgency scan — called by both the brief and the hotspot renderer.
// Returns a flat array of urgent items ordered by priority.
export function getUrgentItems() {
  const team   = store.get('team') || {};
  const stored = store.get('urgent_items') || [];
  const active = stored.filter(i => !isSnoozed(i));

  const storedIds = new Set(active.map(i => i.id));
  const derived   = [];

  // ── Partner birthday ──────────────────────────────────────────────────────
  if (team?.partner?.birthday) {
    const id = 'partner_birthday';
    if (!storedIds.has(id)) {
      const daysUntil = daysUntilDate(team.partner.birthday);
      if (daysUntil !== null && daysUntil <= 14 && daysUntil >= 0) {
        derived.push({
          id,
          object:    'calendar',
          domain:    'calendar',
          title:     `${team.partner.name || 'Partner'}'s birthday`,
          body:      daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`,
          snoozable: true,
          snoozed_until: null,
        });
      }
    }
  }

  // ── Children birthdays ────────────────────────────────────────────────────
  if (Array.isArray(team?.children)) {
    team.children.forEach(child => {
      if (!child.birthday) return;
      const id = `child_birthday_${child.name}`;
      if (storedIds.has(id)) return;
      const daysUntil = daysUntilDate(child.birthday);
      if (daysUntil !== null && daysUntil <= 14 && daysUntil >= 0) {
        derived.push({
          id,
          object:    'calendar',
          domain:    'calendar',
          title:     `${child.name}'s birthday`,
          body:      daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`,
          snoozable: true,
          snoozed_until: null,
        });
      }
    });
  }

  // ── Maintenance tasks ─────────────────────────────────────────────────────
  const tasks = store.get('maintenance_tasks') || [];
  const today = new Date();
  tasks.forEach(t => {
    const id = `maintenance_task_${t.id}`;
    if (storedIds.has(id) || !t.next_due) return;
    const days    = Math.ceil((new Date(t.next_due) - today) / (1000 * 60 * 60 * 24));
    if (days > 14) return;
    const overdue = days < 0;
    derived.push({
      id,
      object:    'maintenance',
      domain:    'maintenance',
      title:     t.label,
      body:      overdue
        ? `Overdue by ${Math.abs(days)} days`
        : days === 0 ? 'Due today' : `Due in ${days} days`,
      snoozable: !overdue,
      snoozed_until: null,
      tier:      overdue ? 'warning' : 'caution',
      cascade: {
        type:    'maintenance_task',
        context: { task_id: t.id },
      },
    });
  });

  return [...active, ...derived];
}

// Maps urgent items onto hotspot objects for the room renderer.
export function buildUrgentByObject(items, spots) {
  const map = {};
  spots.forEach(s => { map[s.id] = { items: [], tier: null }; });
  items.forEach(item => {
    const spot = spots.find(s => s.domain === item.domain || s.id === item.object);
    if (!spot) return;
    map[spot.id].items.push(item);
    const itemTier = item.tier || 'caution';
    if (map[spot.id].tier === null || itemTier === 'warning') {
      map[spot.id].tier = itemTier;
    }
  });
  return map;
}


// ---------------------------------------------------------------------------
// PART 4 — INTELLIGENCE ASSEMBLY
// The fused brief. Reads across all domains, finds the meaningful
// intersections, and produces a structured data object for the renderer.
//
// This is where the ATAK earns its name. Individual domains see one thing.
// The ATAK sees everything together and surfaces what matters.
// ---------------------------------------------------------------------------

export function buildPrimaryBrief() {
  const team    = store.get('team')       || {};
  const onboard = store.get('onboarding') || {};
  const urgent  = getUrgentItems();
  const sections = [];
  const nowMs    = new Date().setHours(0,0,0,0);
  const calAll   = store.get('calendar') || [];

  // ── CONSEQUENCE SCORING ───────────────────────────────────────────────────
  // Determines whether an item routes to "This Month" (score 1+) or
  // "On the Horizon" (score 0). The ATAK derives this — the user never sets it.
  //
  // Score 0 — self-contained, no downstream consequences (furnace filter)
  // Score 1 — mild: one thing to sort before/after
  // Score 2 — moderate: touches one other domain, or is a range entry
  // Score 3 — significant: touches multiple domains or a team member
  // Score 4 — major: wide radius across most domains
  //
  // Score 1+ → This Month (within 30 days)
  // Score 0  → On the Horizon (surfaces at 30 days, no earlier)

  function _consequenceScore(entry) {
    let score = 0;

    // Range entries start at 2 — they block capacity and create before/after pressure
    if (entry.is_range) score += 2;

    // Falls during another range entry — adds pressure to a committed window
    const rangeContext = calAll.find(e => {
      if (!e.is_range || !e.date_start || !e.date_end || e.id === entry.id) return false;
      const d     = _parseDate(entry.date || entry.date_start);
      const start = _parseDate(e.date_start);
      const end   = _parseDate(e.date_end);
      return d && start && end && d >= start && d <= end;
    });
    if (rangeContext) score += 1;

    // References a team member by name
    const teamNames = [
      team?.partner?.name,
      ...(team?.children || []).map(c => c.name),
    ].filter(Boolean).map(n => n.toLowerCase());
    const title = (entry.title || entry.label || '').toLowerCase();
    if (teamNames.some(n => n && title.includes(n))) score += 1;

    // Health domain signal — affects capacity
    if (entry.domain === 'health') score += 1;

    // Vehicle signal that is overdue — cost + logistics consequence
    if (entry.domain === 'vehicles' && entry.signal_type === 'overdue') score += 1;

    return score;
  }

  // ── 1. NEEDS ATTENTION ────────────────────────────────────────────────────
  if (urgent.length) {
    sections.push({
      heading: 'Needs attention',
      items: urgent.map(i => ({
        label:        i.title,
        value:        i.body,
        urgent:       true,
        item_id:      i.id,
        snoozable:    i.snoozable,
        cascade_type: i.cascade?.type || null,
      })),
    });
  }

  // ── 2. TODAY ──────────────────────────────────────────────────────────────
  // What is actually happening today. Not urgency — presence.
  // Disappears entirely when today is clear. No empty state.
  const todayStr   = new Date().toISOString().slice(0, 10);
  const todayItems = [];

  calAll.forEach(e => {
    // Point-in-time entries on today
    if (!e.is_range && e.date === todayStr) {
      todayItems.push({
        label:         e.title,
        value:         e.time_start
          ? e.time_start + (e.time_end ? `–${e.time_end}` : '')
          : 'All day',
        urgent:        e.pressure === 'warning',
        calendar_date: todayStr,
      });
    }
    // Range entries underway today
    if (e.is_range && e.date_start && e.date_end) {
      const start = _parseDate(e.date_start);
      const end   = _parseDate(e.date_end);
      const now   = _parseDate(todayStr);
      if (start && end && now && now >= start && now <= end) {
        const daysToEnd = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        todayItems.push({
          label:         e.title,
          value:         `Underway — ${daysToEnd} day${daysToEnd === 1 ? '' : 's'} remaining`,
          urgent:        false,
          calendar_date: e.date_start,
        });
      }
    }
  });

  if (todayItems.length > 0) {
    sections.push({ heading: 'Today', items: todayItems });
  }

  // ── 3. THIS WEEK ──────────────────────────────────────────────────────────
  // Temporal synthesis — 1–7 days. Cross-domain conflicts and density.
  const temporalSection = buildTemporalSection();
  if (temporalSection) sections.push(temporalSection);

  // ── 4. THIS MONTH ─────────────────────────────────────────────────────────
  // 8–30 days. High-consequence items that shape the month.
  // Consequence score 1+ lands here. Score 0 goes to On the Horizon.
  const monthItems = [];

  calAll.forEach(e => {
    if (e.type !== 'user_entry') return;

    if (e.is_range && e.date_start && e.date_end) {
      const startMs     = new Date(e.date_start + 'T00:00:00').setHours(0,0,0,0);
      const endMs       = new Date(e.date_end   + 'T00:00:00').setHours(0,0,0,0);
      const daysToStart = Math.ceil((startMs - nowMs) / (1000 * 60 * 60 * 24));
      const daysToEnd   = Math.ceil((endMs   - nowMs) / (1000 * 60 * 60 * 24));
      if (daysToEnd < 0 || daysToStart <= 0 || daysToStart > 30) return;
      const score = _consequenceScore(e);
      if (score < 1) return;
      monthItems.push({
        label:         e.title,
        value:         daysToStart === 1
          ? `Starts tomorrow · ${daysToEnd - daysToStart + 1} days`
          : `Starts in ${daysToStart} days · ${daysToEnd - daysToStart + 1} days`,
        urgent:        false,
        calendar_date: e.date_start,
        _score:        score,
      });
      return;
    }

    const days = Math.ceil((new Date((e.date || e.date_start) + 'T00:00:00') - nowMs) / (1000 * 60 * 60 * 24));
    if (days < 8 || days > 30) return;
    const score = _consequenceScore(e);
    if (score < 1) return;
    monthItems.push({
      label:         e.title,
      value:         `${days} days`,
      urgent:        false,
      calendar_date: e.date,
      _score:        score,
    });
  });

  // Domain signals with consequence radius also surface in This Month
  calAll.forEach(e => {
    if (e.type !== 'domain_signal') return;
    const days = Math.ceil((new Date(e.date + 'T00:00:00') - nowMs) / (1000 * 60 * 60 * 24));
    if (days < 8 || days > 30) return;
    const score = _consequenceScore(e);
    if (score < 1) return;
    monthItems.push({
      label:         e.title,
      value:         `${days} days`,
      urgent:        e.pressure === 'warning',
      calendar_date: e.date,
      _score:        score,
    });
  });

  monthItems.sort((a, b) => b._score - a._score);
  const monthItemsClean = monthItems.map(({ _score, ...rest }) => rest);
  if (monthItemsClean.length > 0) {
    sections.push({ heading: 'This month', items: monthItemsClean });
  }

  // ── 5. ON THE HORIZON ─────────────────────────────────────────────────────
  // Score 0 items — self-contained, no downstream consequences.
  // Domain signals at 15–60 days. Maintenance tasks, quiet reminders.
  // Awareness only. Nothing here requires action today.
  const horizonItems = [];

  // Score 0 point-in-time user entries at 8–60 days
  calAll.forEach(e => {
    if (e.type !== 'user_entry' || e.is_range) return;
    const days = Math.ceil((new Date((e.date || e.date_start) + 'T00:00:00') - nowMs) / (1000 * 60 * 60 * 24));
    if (days < 8 || days > 60) return;
    if (_consequenceScore(e) > 0) return;
    horizonItems.push({ label: e.title, value: `${days} days`, urgent: false, calendar_date: e.date });
  });

  // Score 0 domain signals at 15–60 days
  calAll.forEach(e => {
    if (e.type !== 'domain_signal') return;
    const days = Math.ceil((new Date(e.date + 'T00:00:00') - nowMs) / (1000 * 60 * 60 * 24));
    if (days < 15 || days > 60) return;
    if (_consequenceScore(e) > 0) return;
    horizonItems.push({ label: e.title, value: `${days} days`, urgent: false, calendar_date: e.date });
  });

  // Vehicles — upcoming (not overdue) at 15–60 days
  const vehicles = store.get('vehicles') || [];
  vehicles.forEach(v => {
    [
      { field: v.registration_expiry, label: `${v.name || 'Vehicle'} — Reg` },
      { field: v.insurance_expiry,    label: `${v.name || 'Vehicle'} — Insurance` },
      { field: v.service_due,         label: `${v.name || 'Vehicle'} — Service` },
    ].forEach(({ field, label }) => {
      if (!field) return;
      const days = Math.ceil((new Date(field) - nowMs) / (1000 * 60 * 60 * 24));
      if (days > 14 && days <= 60) horizonItems.push({ label, value: `${days} days`, urgent: false });
    });
  });

  // Maintenance tasks — 15–60 days (the furnace filter)
  const mainTasks = store.get('maintenance_tasks') || [];
  mainTasks.forEach(t => {
    if (!t.next_due) return;
    const days = Math.ceil((new Date(t.next_due) - nowMs) / (1000 * 60 * 60 * 24));
    if (days > 14 && days <= 60) horizonItems.push({ label: t.label, value: `${days} days`, urgent: false });
  });

  // Team birthdays — 15–60 days
  if (Array.isArray(team?.children)) {
    team.children.forEach(child => {
      if (!child.birthday) return;
      const days = daysUntilDate(child.birthday);
      if (days !== null && days > 14 && days <= 60) {
        horizonItems.push({ label: `${child.name}'s birthday`, value: `${days} days`, urgent: false });
      }
    });
  }
  if (team?.partner?.birthday) {
    const days = daysUntilDate(team.partner.birthday);
    if (days !== null && days > 14 && days <= 60) {
      horizonItems.push({ label: `${team.partner.name || 'Partner'}'s birthday`, value: `${days} days`, urgent: false });
    }
  }

  if (horizonItems.length > 0) {
    sections.push({ heading: 'On the horizon', items: horizonItems });
  }

  // ── 6. YOUR TEAM — collapsible ────────────────────────────────────────────
  const todayDateObj = new Date(); todayDateObj.setHours(0,0,0,0);
  const teamItems    = [];

  function _calendarEntriesForPerson(name) {
    if (!name) return [];
    const nameLower = name.toLowerCase();
    return calAll.filter(e => {
      if (!e.date) return false;
      const days = Math.ceil((_parseDate(e.date) - todayDateObj) / (1000 * 60 * 60 * 24));
      if (days < 0 || days > 14) return false;
      return e.title?.toLowerCase().includes(nameLower);
    }).slice(0, 1);
  }

  function _teamMemberValue(name, birthdayUrgentId) {
    const bday = urgent.find(i => i.id === birthdayUrgentId);
    if (bday) return { value: `Birthday ${bday.body.toLowerCase()}`, urgent: true };
    const calEntries = _calendarEntriesForPerson(name);
    if (calEntries.length > 0) {
      const e    = calEntries[0];
      const days = Math.ceil((_parseDate(e.date) - todayDateObj) / (1000 * 60 * 60 * 24));
      const when = days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`;
      return { value: `${e.title} — ${when}`, urgent: false };
    }
    return { value: '', urgent: false };
  }

  if (team?.partner?.name) {
    const { value, urgent: isUrgent } = _teamMemberValue(team.partner.name, 'partner_birthday');
    teamItems.push({ label: team.partner.name, value, urgent: isUrgent, person_id: 'partner' });
  }
  if (Array.isArray(team?.children) && team.children.length) {
    team.children.forEach((child, idx) => {
      const { value, urgent: isUrgent } = _teamMemberValue(child.name, `child_birthday_${child.name}`);
      teamItems.push({ label: child.name, value, urgent: isUrgent, person_id: `child_${idx}` });
    });
  }

  sections.push({
    heading:     'Your team',
    items:       teamItems.length ? teamItems : [{ label: 'Just you for now', value: '', urgent: false }],
    collapsible: true,
    collapsed:   true,
  });

  // ── 7. IN FOCUS — collapsible ─────────────────────────────────────────────
  const mission = onboard?.answers?.mission || onboard?.mission || [];
  if (mission.length) {
    sections.push({
      heading:     'In focus',
      items:       mission.map(m => ({ label: missionLabel(m), value: '', urgent: false })),
      collapsible: true,
      collapsed:   true,
    });
  }

  return { title: 'Brief', sections, is_primary: true };
}



// ---------------------------------------------------------------------------
// PART 5 — TEMPORAL ANALYSIS
// Reads store.calendar and reasons across the time window.
// This is where the ATAK earns its intelligence — it sees what no single
// domain can see: the shape of the user's time and where the pressure is.
//
// The ATAK does not render calendar entries. It reads temporal data and
// produces intelligence for the brief. calendar.js renders. atak.js thinks.
// ---------------------------------------------------------------------------

// Parse ISO date string to midnight local time
function _parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return isNaN(d) ? null : d;
}

// Days from today (negative = past)
function _daysFromToday(dateStr) {
  if (!dateStr) return null;
  const now    = new Date(); now.setHours(0,0,0,0);
  const target = _parseDate(dateStr);
  if (!target) return null;
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

// Pressure weight for sorting (lower = higher priority)
function _pressureWeight(entry) {
  if (entry.pressure === 'warning') return 0;
  if (entry.type === 'user_entry')  return 1;
  if (entry.pressure === 'caution') return 2;
  return 3;
}

// Primary temporal analysis function.
// Returns a structured picture of the user's time window.
export function analyseTemporalWindow() {
  const calendar = store.get('calendar') || [];
  const now      = new Date(); now.setHours(0,0,0,0);

  // Window buckets
  const today7   = [];  // 0–6 days out
  const week2    = [];  // 7–13 days out
  const week34   = [];  // 14–30 days out
  const overdue  = [];  // past due (negative days)

  const nowDate = new Date(); nowDate.setHours(0,0,0,0);

  calendar.forEach(entry => {
    if (entry.is_range && entry.date_start && entry.date_end) {
      // Range entries — place in the bucket of their start date.
      // Tag with range_context so the ATAK can say "this falls during your work trip".
      const days = _daysFromToday(entry.date_start);
      if (days === null) return;
      const enriched = { ...entry, days, is_range: true };
      if (days < 0)        overdue.push(enriched);
      else if (days <= 6)  today7.push(enriched);
      else if (days <= 13) week2.push(enriched);
      else if (days <= 30) week34.push(enriched);
      return;
    }
    const days = _daysFromToday(entry.date);
    if (days === null) return;
    if (days < 0)        overdue.push({ ...entry, days });
    else if (days <= 6)  today7.push({ ...entry, days });
    else if (days <= 13) week2.push({ ...entry, days });
    else if (days <= 30) week34.push({ ...entry, days });
  });

  // Sort each bucket by pressure then day
  const sortBucket = b => b.sort((a, z) =>
    _pressureWeight(a) - _pressureWeight(z) || a.days - z.days
  );
  sortBucket(today7);
  sortBucket(week2);
  sortBucket(week34);
  sortBucket(overdue);

  // ── Density — how loaded is the next 7 days? ─────────────────────────────
  // 'clear' | 'light' | 'moderate' | 'heavy'
  const density7 = today7.length === 0 ? 'clear'
    : today7.length <= 2              ? 'light'
    : today7.length <= 5              ? 'moderate'
    :                                   'heavy';

  // ── Compression detection ─────────────────────────────────────────────────
  // A compression is 2+ entries landing on the same day or within 48 hours.
  // Find the tightest cluster in the next 14 days.
  const near14      = [...today7, ...week2];
  const dayMap      = {};
  near14.forEach(e => {
    const key = e.date;
    if (!dayMap[key]) dayMap[key] = [];
    dayMap[key].push(e);
  });

  const compressedDays = Object.entries(dayMap)
    .filter(([, entries]) => entries.length >= 2)
    .sort(([a], [b]) => _parseDate(a) - _parseDate(b));

  const hasCompression  = compressedDays.length > 0;
  const worstCompression = hasCompression ? compressedDays[0] : null; // [dateStr, entries[]]

  // ── Conflict detection ────────────────────────────────────────────────────
  // A conflict is a warning-pressure signal and a user entry on the same day,
  // or two warning signals within 48 hours of each other.
  // This is the temporal compression + priority tension the ATAK surfaces.
  const conflicts = [];

  Object.entries(dayMap).forEach(([dateStr, entries]) => {
    const warnings     = entries.filter(e => e.pressure === 'warning');
    const userEntries  = entries.filter(e => e.type === 'user_entry');
    const cautionItems = entries.filter(e => e.pressure === 'caution');

    if (warnings.length > 0 && userEntries.length > 0) {
      conflicts.push({
        type:    'warning_vs_commitment',
        date:    dateStr,
        days:    _daysFromToday(dateStr),
        warning: warnings[0],
        commitment: userEntries[0],
        count:   entries.length,
      });
    } else if (warnings.length >= 2) {
      conflicts.push({
        type:  'multi_warning',
        date:  dateStr,
        days:  _daysFromToday(dateStr),
        items: warnings,
        count: warnings.length,
      });
    } else if (warnings.length > 0 && cautionItems.length >= 2) {
      conflicts.push({
        type:    'warning_plus_pressure',
        date:    dateStr,
        days:    _daysFromToday(dateStr),
        warning: warnings[0],
        others:  cautionItems,
        count:   entries.length,
      });
    }
  });

  // ── Overall pressure ──────────────────────────────────────────────────────
  // 'clear' | 'building' | 'elevated' | 'critical'
  const warningCount = [...today7, ...week2].filter(e => e.pressure === 'warning').length;
  const overdueCount = overdue.length;

  const pressure = (overdueCount >= 2 || warningCount >= 3 || conflicts.length >= 2) ? 'critical'
    : (overdueCount >= 1 || warningCount >= 2 || conflicts.length >= 1)              ? 'elevated'
    : (today7.length >= 3 || week2.length >= 3)                                      ? 'building'
    :                                                                                   'clear';

  return {
    today7,
    week2,
    week34,
    overdue,
    density7,
    hasCompression,
    worstCompression,
    conflicts,
    pressure,
    totalNear14: near14.length,
  };
}

// Produces the "This week" brief section from temporal analysis.
// Only included in the brief when there's something worth saying.
// Returns a section object or null.
export function buildTemporalSection() {
  const t = analyseTemporalWindow();

  // Nothing to say — don't add noise
  if (t.pressure === 'clear' && !t.hasCompression && t.today7.length === 0) {
    return null;
  }

  const items = [];

  // ── Overdue items first ───────────────────────────────────────────────────
  if (t.overdue.length > 0) {
    const labels = t.overdue.slice(0, 2).map(e => e.title).join(' and ');
    items.push({
      label:         t.overdue.length === 1
        ? `${t.overdue[0].title} is overdue`
        : `${t.overdue.length} things are overdue`,
      value:         t.overdue.length === 1
        ? `${Math.abs(t.overdue[0].days)} day${Math.abs(t.overdue[0].days) === 1 ? '' : 's'} past due`
        : labels,
      urgent:        true,
      calendar_date: t.overdue.length === 1 ? t.overdue[0].date : null,
    });
  }

  // ── Conflicts — the most important synthesis ──────────────────────────────
  t.conflicts.slice(0, 2).forEach(c => {
    const daysLabel = c.days === 0 ? 'today'
      : c.days === 1 ? 'tomorrow'
      : `in ${c.days} days`;

    if (c.type === 'warning_vs_commitment') {
      items.push({
        label:         `${c.warning.title}`,
        value:         `Conflicts with "${c.commitment.title}" — ${daysLabel}`,
        urgent:        true,
        calendar_date: c.date,
      });
    } else if (c.type === 'multi_warning') {
      items.push({
        label:         `${c.count} urgent items on the same day`,
        value:         `${_formatDateShort(c.date)} — ${c.items.map(i => i.title).slice(0,2).join(', ')}`,
        urgent:        true,
        calendar_date: c.date,
      });
    } else if (c.type === 'warning_plus_pressure') {
      items.push({
        label:         `Heavy day ${c.days === 0 ? 'today' : c.days === 1 ? 'tomorrow' : `in ${c.days} days`}`,
        value:         `${c.count} items including ${c.warning.title}`,
        urgent:        true,
        calendar_date: c.date,
      });
    }
  });

  // ── Density read — when no conflicts but still loaded ────────────────────
  if (t.conflicts.length === 0 && t.density7 !== 'clear') {
    const nextUp = t.today7[0];
    if (nextUp) {
      const daysLabel = nextUp.days === 0 ? 'today'
        : nextUp.days === 1 ? 'tomorrow'
        : `in ${nextUp.days} days`;
      items.push({
        label:         nextUp.title,
        value:         `${daysLabel}${t.today7.length > 1 ? ` · ${t.today7.length - 1} more this week` : ''}`,
        urgent:        nextUp.pressure === 'warning',
        calendar_date: nextUp.date,
      });
    }

    if (t.density7 === 'heavy') {
      items.push({
        label:  'Heavy week ahead',
        value:  `${t.today7.length} items in the next 7 days`,
        urgent: false,
      });
    }
  }

  // ── Week 2 preview — if near14 is loaded ─────────────────────────────────
  if (t.week2.length > 0 && items.length < 3) {
    const nextWeekWarnings = t.week2.filter(e => e.pressure === 'warning');
    if (nextWeekWarnings.length > 0) {
      items.push({
        label:         nextWeekWarnings[0].title,
        value:         `In ${nextWeekWarnings[0].days} days`,
        urgent:        false,
        calendar_date: nextWeekWarnings[0].date,
      });
    }
  }

  if (items.length === 0) return null;

  return {
    heading: 'This week',
    items,
  };
}

// Returns the range entry (if any) that a given date falls inside.
// Used by the brief to add context — "this falls during your work trip".
export function getRangeContextForDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d)) return null;
  const calendar = store.get('calendar') || [];
  return calendar.find(e => {
    if (!e.is_range || !e.date_start || !e.date_end) return false;
    const start = new Date(e.date_start + 'T00:00:00');
    const end   = new Date(e.date_end   + 'T00:00:00');
    return d >= start && d <= end;
  }) || null;
}

function _formatDateShort(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-CA', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  } catch { return dateStr; }
}
