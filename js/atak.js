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

  // ── Needs attention — urgent items across all domains ─────────────────────
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

  // ── Your team — names + what's relevant about each person right now ───────
  const teamItems = [];

  if (team?.partner?.name) {
    const partnerBday = urgent.find(i => i.id === 'partner_birthday');
    teamItems.push({
      label:     team.partner.name,
      value:     partnerBday
        ? `Birthday ${partnerBday.body.toLowerCase()}`
        : team.partner.love_language
          ? `Love language: ${loveLangLabel(team.partner.love_language)}`
          : team.partner.profession || '',
      urgent:    !!partnerBday,
      person_id: 'partner',
    });
  }

  if (Array.isArray(team?.children) && team.children.length) {
    team.children.forEach((child, idx) => {
      const childBday = urgent.find(i => i.id === `child_birthday_${child.name}`);
      const age       = resolveAge(child.birthday, child.age);
      teamItems.push({
        label:     child.name,
        value:     childBday
          ? `Birthday ${childBday.body.toLowerCase()}`
          : age !== null ? `${age} years old` : '',
        urgent:    !!childBday,
        person_id: `child_${idx}`,
      });
    });
  }

  sections.push(
    teamItems.length
      ? { heading: 'Your team', items: teamItems }
      : { heading: 'Your team', items: [{ label: 'Just you for now', value: '', urgent: false }] }
  );

  // ── On the horizon — temporal clustering across all domains ───────────────
  // 15–30 day window. Things that aren't urgent yet but worth seeing together.
  // This is the ATAK's core synthesis — no single grab-and-go sees this window.
  const horizonItems = [];

  const vehicles = store.get('vehicles') || [];
  vehicles.forEach(v => {
    [
      { field: v.registration_expiry, label: `${v.name || 'Vehicle'} — Reg` },
      { field: v.insurance_expiry,    label: `${v.name || 'Vehicle'} — Insurance` },
      { field: v.service_due,         label: `${v.name || 'Vehicle'} — Service` },
    ].forEach(({ field, label }) => {
      if (!field) return;
      const days = Math.ceil((new Date(field) - new Date()) / (1000 * 60 * 60 * 24));
      if (days > 14 && days <= 30) horizonItems.push({ label, value: `${days} days`, urgent: false });
    });
  });

  const mainTasks = store.get('maintenance_tasks') || [];
  mainTasks.forEach(t => {
    if (!t.next_due) return;
    const days = Math.ceil((new Date(t.next_due) - new Date()) / (1000 * 60 * 60 * 24));
    if (days > 14 && days <= 30) horizonItems.push({ label: t.label, value: `${days} days`, urgent: false });
  });

  if (Array.isArray(team?.children)) {
    team.children.forEach(child => {
      if (!child.birthday) return;
      const days = daysUntilDate(child.birthday);
      if (days !== null && days > 14 && days <= 30) {
        horizonItems.push({ label: `${child.name}'s birthday`, value: `${days} days`, urgent: false });
      }
    });
  }

  if (team?.partner?.birthday) {
    const days = daysUntilDate(team.partner.birthday);
    if (days !== null && days > 14 && days <= 30) {
      horizonItems.push({
        label: `${team.partner.name || 'Partner'}'s birthday`,
        value: `${days} days`,
        urgent: false,
      });
    }
  }

  sections.push({
    heading: 'On the horizon',
    items: horizonItems.length ? horizonItems : [{
      label:  'Nothing in the next 30 days',
      value:  'Add dates and I\'ll keep watch',
      urgent: false,
    }],
  });

  // ── In focus — mission items from onboarding ──────────────────────────────
  const mission = onboard?.answers?.mission || onboard?.mission || [];
  if (mission.length) {
    sections.push({
      heading: 'In focus',
      items: mission.map(m => ({ label: missionLabel(m), value: '', urgent: false })),
    });
  }

  return {
    title:      'Brief',
    sections,
    is_primary: true,
  };
}
