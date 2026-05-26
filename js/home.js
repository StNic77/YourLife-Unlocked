import { store } from './store.js';
import { transitions } from './transitions.js';
import { createCascade } from './cascade.js';

// ---------------------------------------------------------------------------
// DEV MODE — Hotspot visualiser
// Add ?dev=hotspots to the URL to see all hotspot positions as coloured rings.
// Remove the param (or just navigate normally) to hide them.
// Never visible in production — URL param only.
// ---------------------------------------------------------------------------
const DEV_HOTSPOTS = new URLSearchParams(window.location.search).get('dev') === 'hotspots';

// ---------------------------------------------------------------------------
// HOME MODULE — The Room
//
// The home screen is a room. The user's world rendered as a physical space.
// Objects in the room are interactive doors to different domains.
//
// Two modes:
//   GRAB AND GO — tap any object, a focused brief fills the screen.
//                 Fast, data-only, dismissable. One domain, what you need.
//   DEPTH       — tap the primary object (ATAK / world equivalent).
//                 Full brief, cascades, urgent items, the session.
//
// Urgent items attach to their relevant object. The object signals urgency
// through its visual state. Acknowledgement required — dismiss or snooze.
//
// The room is world-specific. Hotspot positions are defined per world
// in HOTSPOT_MAPS below, as percentage positions so they scale to any screen.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// HOTSPOT MAPS
// Each world defines its interactive objects.
// x, y: percentage position of the hotspot centre in the room image.
// r: tap radius in px (before scaling — used as visual indicator size)
// id: domain key used throughout the app
// urgent: whether this object can carry an urgent indicator
// primary: the depth object — opens the full ATAK/equivalent experience
// ---------------------------------------------------------------------------

const HOTSPOT_MAPS = {
  operator: [
    {
      id: 'atak',
      label: 'Brief',
      x: 49, y: 43,   // ATAK on dock — centre of device
      r: 47,
      primary: true,
      urgent: true,
      domain: 'brief',
    },
    {
      id: 'peltors',
      label: 'Alerts',
      x: 49, y: 21,   // Peltors on hook — upper centre
      r: 45,
      primary: false,
      urgent: true,
      domain: 'alerts',
    },
    {
      id: 'keys',
      label: 'Vehicles',
      x: 65, y: 48,   // Keys — right of ATAK
      r: 32,
      primary: false,
      urgent: true,
      domain: 'vehicles',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      x: 90, y: 28,   // Calendar — upper right
      r: 45,
      primary: false,
      urgent: true,
      domain: 'calendar',
    },
    {
      id: 'notebook',
      label: 'Capture',
      x: 65, y: 85,   // Notebook on bench — foreground lower left
      r: 45,
      primary: false,
      urgent: false,
      domain: 'capture',
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      x: 70, y: 70,   // Maintenance tray — lower right
      r: 44,
      primary: false,
      urgent: true,
      domain: 'maintenance',
    },
    {
      id: 'workout',
      label: 'Health',
      x: 21, y: 77,   // Footwear — lower left shelf
      r: 44,
      primary: false,
      urgent: false,
      domain: 'health',
    },
  ],

  // Remaining worlds: hotspot maps stubbed with primary object only.
  // Populated as home images are locked and objects confirmed.
  range: [
    { id: 'field_glasses', label: 'Brief', x: 50, y: 45, r: 36, primary: true, urgent: true, domain: 'brief' },
    { id: 'keys',          label: 'Vehicles', x: 65, y: 55, r: 22, primary: false, urgent: true, domain: 'vehicles' },
    { id: 'calendar',      label: 'Calendar', x: 78, y: 25, r: 28, primary: false, urgent: true, domain: 'calendar' },
  ],
  garden: [
    { id: 'journal',   label: 'Brief',    x: 50, y: 48, r: 36, primary: true,  urgent: true,  domain: 'brief' },
    { id: 'keys',      label: 'Vehicles', x: 65, y: 40, r: 22, primary: false, urgent: true,  domain: 'vehicles' },
    { id: 'calendar',  label: 'Calendar', x: 78, y: 22, r: 28, primary: false, urgent: true,  domain: 'calendar' },
  ],
  journey: [
    { id: 'journal',   label: 'Brief',    x: 45, y: 55, r: 36, primary: true,  urgent: true,  domain: 'brief' },
    { id: 'keys',      label: 'Vehicles', x: 30, y: 40, r: 22, primary: false, urgent: true,  domain: 'vehicles' },
    { id: 'calendar',  label: 'Calendar', x: 75, y: 28, r: 28, primary: false, urgent: true,  domain: 'calendar' },
  ],
  playbook: [
    { id: 'clipboard', label: 'Brief',    x: 48, y: 50, r: 36, primary: true,  urgent: true,  domain: 'brief' },
    { id: 'keys',      label: 'Vehicles', x: 65, y: 55, r: 22, primary: false, urgent: true,  domain: 'vehicles' },
    { id: 'calendar',  label: 'Calendar', x: 78, y: 22, r: 28, primary: false, urgent: true,  domain: 'calendar' },
  ],
  summit: [
    { id: 'map',       label: 'Brief',    x: 50, y: 45, r: 36, primary: true,  urgent: true,  domain: 'brief' },
    { id: 'keys',      label: 'Vehicles', x: 65, y: 55, r: 22, primary: false, urgent: true,  domain: 'vehicles' },
    { id: 'calendar',  label: 'Calendar', x: 78, y: 25, r: 28, primary: false, urgent: true,  domain: 'calendar' },
  ],
  practice: [
    { id: 'log',       label: 'Brief',    x: 48, y: 52, r: 36, primary: true,  urgent: true,  domain: 'brief' },
    { id: 'keys',      label: 'Vehicles', x: 65, y: 45, r: 22, primary: false, urgent: true,  domain: 'vehicles' },
    { id: 'calendar',  label: 'Calendar', x: 78, y: 22, r: 28, primary: false, urgent: true,  domain: 'calendar' },
  ],
  meadow: [
    { id: 'card',      label: 'Brief',    x: 50, y: 55, r: 36, primary: true,  urgent: true,  domain: 'brief' },
    { id: 'keys',      label: 'Vehicles', x: 65, y: 60, r: 22, primary: false, urgent: true,  domain: 'vehicles' },
    { id: 'calendar',  label: 'Calendar', x: 78, y: 28, r: 28, primary: false, urgent: true,  domain: 'calendar' },
  ],
};

// ---------------------------------------------------------------------------
// URGENT ITEMS
// In production these come from the store / AI engine.
// For now: a static set of day-one stubs so the urgent system
// can be built and tested before real data exists.
//
// object: matches a hotspot id in HOTSPOT_MAPS
// domain: the domain this item belongs to
// title: plain, short — what it is
// body: one line of relevant data
// snoozable: whether the user can defer it
// snoozed_until: null or ISO date string
// ---------------------------------------------------------------------------

function getUrgentItems() {
  const team   = store.get('team') || {};
  const stored = store.get('urgent_items') || [];
  const active = stored.filter(i => !isSnoozed(i));

  // Index stored ids so derived items don't duplicate what's already there
  const storedIds = new Set(active.map(i => i.id));
  const derived   = [];

  // Partner birthday — derived from team data, skip if already in store
  if (team?.partner?.birthday) {
    const id = 'partner_birthday';
    if (!storedIds.has(id)) {
      const daysUntil = daysUntilDate(team.partner.birthday);
      if (daysUntil !== null && daysUntil <= 14 && daysUntil >= 0) {
        derived.push({
          id,
          object: 'calendar',
          domain: 'calendar',
          title: `${team.partner.name || 'Partner'}'s birthday`,
          body: daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`,
          snoozable: true,
          snoozed_until: null,
        });
      }
    }
  }

  // Children birthdays — derived, skip any already in store
  if (Array.isArray(team?.children)) {
    team.children.forEach(child => {
      if (!child.birthday) return;
      const id = `child_birthday_${child.name}`;
      if (storedIds.has(id)) return;
      const daysUntil = daysUntilDate(child.birthday);
      if (daysUntil !== null && daysUntil <= 14 && daysUntil >= 0) {
        derived.push({
          id,
          object: 'calendar',
          domain: 'calendar',
          title: `${child.name}'s birthday`,
          body: daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`,
          snoozable: true,
          snoozed_until: null,
        });
      }
    });
  }

  // Maintenance tasks — derived from maintenance_tasks store
  // Overdue or due within 14 days surface as urgent items
  const tasks = store.get('maintenance_tasks') || [];
  const today = new Date();
  tasks.forEach(t => {
    const id = `maintenance_task_${t.id}`;
    if (storedIds.has(id)) return;
    if (!t.next_due) return;
    const due  = new Date(t.next_due);
    const days = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (days > 14) return; // not urgent yet
    const overdue = days < 0;
    derived.push({
      id,
      object: 'maintenance',
      domain: 'maintenance',
      title: t.label,
      body: overdue
        ? `Overdue by ${Math.abs(days)} days`
        : days === 0 ? 'Due today' : `Due in ${days} days`,
      snoozable: !overdue,
      snoozed_until: null,
      tier: overdue ? 'warning' : 'caution',
      cascade: {
        type: 'maintenance_task',
        context: { task_id: t.id },
      },
    });
  });

  // Stored items first (user-facing priority), then derived
  return [...active, ...derived];
}

function daysUntilDate(dateStr) {
  if (!dateStr) return null;
  try {
    const now = new Date();
    const target = new Date(dateStr);
    // Use this year's occurrence
    target.setFullYear(now.getFullYear());
    if (target < now) target.setFullYear(now.getFullYear() + 1);
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  } catch {
    return null;
  }
}

function isSnoozed(item) {
  if (!item.snoozed_until) return false;
  return new Date(item.snoozed_until) > new Date();
}

function snoozeItem(itemId, hours = 24) {
  const stored = store.get('urgent_items') || [];
  const updated = stored.map(i => {
    if (i.id !== itemId) return i;
    const until = new Date();
    until.setHours(until.getHours() + hours);
    return { ...i, snoozed_until: until.toISOString() };
  });
  store.set('urgent_items', updated);
}

function dismissItem(itemId) {
  const stored = store.get('urgent_items') || [];
  store.set('urgent_items', stored.filter(i => i.id !== itemId));
}

// ---------------------------------------------------------------------------
// DOMAIN BRIEF CONTENT
// What each object opens when tapped. Plain, data-first, no performance.
// In production: populated from store. Day-one: honest empty states.
// ---------------------------------------------------------------------------

function getDomainBrief(domain, world) {
  const team    = store.get('team')       || {};
  const onboard = store.get('onboarding') || {};

  switch (domain) {

    case 'brief':
      return buildPrimaryBrief(team, onboard, world);

    case 'calendar': {
      const items = getUrgentItems().filter(i => i.domain === 'calendar');
      return {
        title: 'Coming up',
        sections: items.length ? items.map(i => ({
          label: i.title,
          value: i.body,
          urgent: true,
          item_id: i.id,
          snoozable: i.snoozable,
        })) : [{
          label: 'Nothing on the horizon yet',
          value: 'Add dates and I\'ll keep an eye on them',
          urgent: false,
        }],
        cta: 'Add a date',
        cta_action: 'add_date',
      };
    }

    case 'vehicles': {
      const vehicles = store.get('vehicles') || [];
      return {
        title: 'Vehicles',
        sections: vehicles.length ? vehicles.map(v => ({
          label: v.name || 'Vehicle',
          value: [
            v.registration_expiry ? `Reg: ${formatDate(v.registration_expiry)}` : null,
            v.insurance_expiry    ? `Insurance: ${formatDate(v.insurance_expiry)}` : null,
            v.service_due         ? `Service: ${formatDate(v.service_due)}` : null,
          ].filter(Boolean).join(' · ') || 'No dates on file',
          urgent: isVehicleUrgent(v),
          vehicle_id: v.id,
        })) : [{
          label: 'No vehicles on file',
          value: 'Add your vehicles and I\'ll track what needs attention',
          urgent: false,
        }],
        cta: 'Add a vehicle',
        cta_action: 'add_vehicle',
      };
    }

    case 'alerts': {
      const alerts = getUrgentItems();
      return {
        title: 'Alerts',
        sections: alerts.length ? alerts.map(i => ({
          label: i.title,
          value: i.body,
          urgent: true,
          item_id: i.id,
          snoozable: i.snoozable,
        })) : [{
          label: 'All clear',
          value: 'Nothing needs your attention right now',
          urgent: false,
        }],
      };
    }

    case 'health':
      return {
        title: 'Health',
        sections: [{
          label: 'Nothing tracked yet',
          value: 'I\'ll keep an eye on what you share',
          urgent: false,
        }],
        cta: 'Add something',
        cta_action: 'add_health',
      };

    case 'maintenance': {
      const tasks = store.get('maintenance_tasks') || [];
      const today = new Date();
      const activeTasks = tasks
        .map(t => {
          const due = t.next_due ? new Date(t.next_due) : null;
          const days = due ? Math.ceil((due - today) / (1000 * 60 * 60 * 24)) : null;
          const overdue = days !== null && days < 0;
          const urgent  = days !== null && days <= 14;
          return { ...t, days, overdue, urgent };
        })
        .sort((a, b) => {
          if (a.overdue && !b.overdue) return -1;
          if (!a.overdue && b.overdue) return 1;
          return (a.days ?? 999) - (b.days ?? 999);
        });

      return {
        title: 'Maintenance',
        sections: activeTasks.length ? activeTasks.map(t => ({
          label: t.label,
          value: t.overdue
            ? `Overdue by ${Math.abs(t.days)} days`
            : t.days !== null
              ? t.days === 0 ? 'Due today' : `Due in ${t.days} days`
              : t.interval_label || 'No due date set',
          urgent: t.overdue || t.urgent,
          task_id: t.id,
        })) : [{
          label: 'Nothing scheduled',
          value: 'Add recurring tasks and I\'ll flag them before they matter',
          urgent: false,
        }],
        cta: 'Add a task',
        cta_action: 'add_maintenance',
      };
    }

    case 'capture':
      return {
        title: 'Quick capture',
        sections: [],
        input: true,
        placeholder: 'What do you need to remember?',
      };

    default:
      return {
        title: domain,
        sections: [{ label: 'Coming soon', value: '', urgent: false }],
      };
  }
}

function buildPrimaryBrief(team, onboard, world) {
  const sections = [];
  const urgent   = getUrgentItems();

  // ── Needs attention — urgent items only, no duplication ───────────────────
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
      label: team.partner.name,
      value: partnerBday
        ? `Birthday ${partnerBday.body.toLowerCase()}`
        : team.partner.love_language
          ? `Love language: ${loveLangLabel(team.partner.love_language)}`
          : team.partner.profession || '',
      urgent: !!partnerBday,
      person_id: 'partner',
    });
  }

  if (Array.isArray(team?.children) && team.children.length) {
    team.children.forEach((child, idx) => {
      const childBday = urgent.find(i => i.id === `child_birthday_${child.name}`);
      teamItems.push({
        label: child.name,
        value: childBday
          ? `Birthday ${childBday.body.toLowerCase()}`
          : child.age ? `${child.age} years old` : '',
        urgent: !!childBday,
        person_id: `child_${idx}`,
      });
    });
  }

  if (teamItems.length) {
    sections.push({
      heading: 'Your team',
      items: teamItems,
    });
  } else {
    sections.push({
      heading: 'Your team',
      items: [{ label: 'Just you for now', value: '', urgent: false }],
    });
  }

  // ── On the horizon — temporal clustering across all domains ───────────────
  // Surface upcoming items that aren't yet urgent but are worth knowing.
  // This is where the ATAK shows synthesis: things no single grab-and-go sees.
  const horizonItems = [];

  // Vehicles coming due in the next 30 days (but not already urgent / <14 days)
  const vehicles = store.get('vehicles') || [];
  vehicles.forEach(v => {
    const checks = [
      { field: v.registration_expiry, label: `${v.name || 'Vehicle'} — Reg` },
      { field: v.insurance_expiry,    label: `${v.name || 'Vehicle'} — Insurance` },
      { field: v.service_due,         label: `${v.name || 'Vehicle'} — Service` },
    ];
    checks.forEach(({ field, label }) => {
      if (!field) return;
      const days = Math.ceil((new Date(field) - new Date()) / (1000 * 60 * 60 * 24));
      if (days > 14 && days <= 30) {
        horizonItems.push({
          label,
          value: `${days} days`,
          urgent: false,
        });
      }
    });
  });

  // Maintenance tasks 15–30 days out
  const mainTasks = store.get('maintenance_tasks') || [];
  mainTasks.forEach(t => {
    if (!t.next_due) return;
    const days = Math.ceil((new Date(t.next_due) - new Date()) / (1000 * 60 * 60 * 24));
    if (days > 14 && days <= 30) {
      horizonItems.push({ label: t.label, value: `${days} days`, urgent: false });
    }
  });

  // Children birthdays 15–30 days out
  if (Array.isArray(team?.children)) {
    team.children.forEach(child => {
      if (!child.birthday) return;
      const days = daysUntilDate(child.birthday);
      if (days !== null && days > 14 && days <= 30) {
        horizonItems.push({
          label: `${child.name}'s birthday`,
          value: `${days} days`,
          urgent: false,
        });
      }
    });
  }

  // Partner birthday 15–30 days out
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
      label: 'Nothing in the next 30 days',
      value: 'Add dates and I\'ll keep watch',
      urgent: false,
    }],
  });

  // ── In focus — mission items from onboarding ───────────────────────────────
  if (onboard?.mission?.length) {
    sections.push({
      heading: 'In focus',
      items: onboard.mission.map(m => ({
        label: missionLabel(m),
        value: '',
        urgent: false,
      })),
    });
  }

  return {
    title: 'Brief',
    sections,
    is_primary: true,
  };
}

function loveLangLabel(id) {
  const map = {
    words_of_affirmation: 'Words of affirmation',
    acts_of_service:      'Acts of service',
    receiving_gifts:      'Receiving gifts',
    quality_time:         'Quality time',
    physical_touch:       'Physical touch',
  };
  return map[id] || id;
}

function missionLabel(id) {
  const map = {
    getting_organized:  'Getting organized',
    time:               'How I spend my time',
    working_toward:     'Something I\'m working toward',
    daily_routine:      'My daily routine',
    relationships:      'My relationships',
    professional_life:  'My professional life',
    money:              'Money',
    physical_health:    'My physical health',
    emotional_wellbeing:'My emotional well-being',
    personal_life:      'My personal life',
    undealt:            'Something I haven\'t dealt with yet',
  };
  return map[id] || id;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
}

function isVehicleUrgent(v) {
  const threshold = 30; // days
  const fields = [v.registration_expiry, v.insurance_expiry, v.service_due];
  return fields.some(f => {
    if (!f) return false;
    const days = Math.ceil((new Date(f) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= threshold;
  });
}

// ---------------------------------------------------------------------------
// MAIN MODULE
// ---------------------------------------------------------------------------

export function createHome(world) {
  const el = document.createElement('div');
  el.id    = 'screen-home';
  el.style.cssText = 'position:absolute;inset:0;overflow:hidden;background:#000;';

  const urgentItems  = getUrgentItems();
  const hotspots     = HOTSPOT_MAPS[world.id] || HOTSPOT_MAPS.operator;
  const urgentByObj  = buildUrgentByObject(urgentItems, hotspots);

  let briefOpen = false;

  // ── Build the room ────────────────────────────────────────────────────────

  function render() {
    el.innerHTML = `

      <!-- Room image — full bleed -->
      <div id="home-room" style="
        position:absolute;inset:0;
        background-image:url('images/${world.id.toUpperCase()}_HOME.png');
        background-size:cover;
        background-position:center top;
        transition:filter 0.4s ease;
      "></div>

      <!-- Subtle vignette — darkens edges, keeps image legible -->
      <div style="
        position:absolute;inset:0;pointer-events:none;
        background:radial-gradient(
          ellipse 80% 90% at 50% 40%,
          transparent 40%,
          rgba(0,0,0,0.55) 100%
        );
      "></div>

      <!-- Hotspot layer -->
      <div id="home-hotspots" style="position:absolute;inset:0;"></div>

      <!-- Brief panel — slides up over the room -->
      <div id="home-brief" style="
        position:absolute;inset:0;
        display:flex;flex-direction:column;
        pointer-events:none;
        opacity:0;
        transform:translateY(100%);
        transition:opacity 0.35s ease, transform 0.35s cubic-bezier(0.2,0,0,1);
      "></div>

      <!-- World name — bottom left, quiet -->
      <div style="
        position:absolute;
        bottom:max(28px, calc(var(--safe-bottom, 0px) + 20px));
        left:28px;
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.3em;text-transform:uppercase;
        color:rgba(240,235,218,0.25);
        pointer-events:none;
        opacity:0;animation:fadeIn 1.2s ease-out 0.8s both;
      ">${world.name.toLowerCase()}</div>
    `;

    renderHotspots();
  }

  // ── Hotspots ──────────────────────────────────────────────────────────────

  function buildUrgentByObject(items, spots) {
    const map = {};
    spots.forEach(s => { map[s.id] = { items: [], tier: null }; });
    items.forEach(item => {
      const spot = spots.find(s => s.domain === item.domain || s.id === item.object);
      if (!spot) return;
      map[spot.id].items.push(item);
      // Escalate tier — warning beats caution
      const itemTier = item.tier || 'caution';
      if (map[spot.id].tier === null || itemTier === 'warning') {
        map[spot.id].tier = itemTier;
      }
    });
    return map;
  }

  function renderHotspots() {
    const layer = el.querySelector('#home-hotspots');
    if (!layer) return;

    hotspots.forEach(spot => {
      const spotUrgent = urgentByObj[spot.id];
      const hasUrgent  = spotUrgent?.items?.length > 0;
      const urgentTier  = spotUrgent?.tier || 'caution';
      const btn = document.createElement('button');

      const devStyle = DEV_HOTSPOTS ? `
        border:2px solid ${spot.primary ? 'rgba(100,200,100,0.8)' : 'rgba(100,160,220,0.8)'};
        background:${spot.primary ? 'rgba(100,200,100,0.1)' : 'rgba(100,160,220,0.08)'};
      ` : '';

      btn.style.cssText = `
        position:absolute;
        left:${spot.x}%;top:${spot.y}%;
        transform:translate(-50%, -50%);
        width:${spot.r * 2}px;height:${spot.r * 2}px;
        border-radius:50%;
        border:none;background:transparent;
        cursor:pointer;
        -webkit-tap-highlight-color:transparent;
        opacity:${DEV_HOTSPOTS ? '1' : '0'};
        animation:${DEV_HOTSPOTS ? 'none' : `fadeIn 0.6s ease-out ${spot.primary ? '1.0' : '1.3'}s both`};
        ${devStyle}
      `;

      // Dev label — shows object name and position
      if (DEV_HOTSPOTS) {
        const label = document.createElement('div');
        label.style.cssText = [
          'position:absolute;top:50%;left:50%;',
          'transform:translate(-50%,-50%);',
          'font-family:monospace;font-size:9px;',
          'color:rgba(255,255,255,0.9);',
          'text-align:center;pointer-events:none;',
          'white-space:nowrap;line-height:1.4;',
        ].join('');
        label.textContent = spot.label + '\n' + spot.x + ',' + spot.y;
        btn.appendChild(label);
      }

      // Urgent ring on the object — tier-aware
      if (hasUrgent) {
        const isWarning    = urgentTier === 'warning';
        const ringColor    = isWarning ? 'rgba(220,60,60,0.75)'   : 'rgba(210,160,60,0.7)';
        const dotColor     = isWarning ? 'rgba(220,60,60,0.95)'   : 'rgba(210,160,60,0.9)';
        const pulseAnim    = isWarning ? 'warningPulse 1.6s ease-in-out infinite' : 'urgentPulse 2.5s ease-in-out infinite';
        const glowColor    = isWarning ? 'rgba(220,60,60,0.2)'    : 'rgba(210,160,60,0.15)';
        const glowRing     = isWarning ? 'rgba(220,60,60,0.35)'   : 'rgba(210,160,60,0.3)';

        btn.innerHTML = `
          <span style="
            position:absolute;inset:0;border-radius:50%;
            border:1.5px solid ${ringColor};
            animation:${pulseAnim};
          "></span>
          <span style="
            position:absolute;top:4px;right:4px;
            width:8px;height:8px;border-radius:50%;
            background:${dotColor};
            ${isWarning ? 'animation:warningDotPulse 1.6s ease-in-out infinite;' : ''}
          "></span>
        `;

        if (spot.primary) {
          btn.style.boxShadow = `0 0 0 1px ${glowRing}, 0 0 24px ${glowColor}`;
        }
      } else if (spot.primary) {
        btn.style.boxShadow = '0 0 0 1px rgba(240,235,218,0.12), 0 0 20px rgba(240,235,218,0.06)';
      }

      btn.addEventListener('pointerdown', () => {
        btn.style.transform = 'translate(-50%, -50%) scale(0.92)';
      });
      btn.addEventListener('pointerup', () => {
        btn.style.transform = 'translate(-50%, -50%) scale(1)';
      });
      btn.addEventListener('click', () => openBrief(spot));

      layer.appendChild(btn);
    });

    // ── Coordinate inspector — DEV_HOTSPOTS only ────────────────────────────
    // Tap anywhere on the hotspot layer to read the x,y percentage at that point.
    // The hotspot layer covers the full room and receives all taps — the room
    // background-image div sits beneath it and doesn't receive pointer events.
    // Readout appears at the tap location, auto-dismisses after 3 seconds.
    // Tapping a hotspot opens the brief AND shows coordinates — both fire.
    if (DEV_HOTSPOTS) {
      let inspectorEl = null;
      let dismissTimer = null;

      layer.addEventListener('click', (e) => {
        const rect = layer.getBoundingClientRect();
        const xPct = Math.round(((e.clientX - rect.left) / rect.width)  * 100);
        const yPct = Math.round(((e.clientY - rect.top)  / rect.height) * 100);

        // Clear any existing readout + timer
        if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
        if (inspectorEl)  { inspectorEl.remove(); inspectorEl = null; }

        // Build readout — pinned to tap point
        const readout = document.createElement('div');
        readout.style.cssText = [
          'position:absolute;',
          'pointer-events:none;',
          'font-family:monospace;font-size:12px;line-height:1.5;',
          'color:#fff;background:rgba(0,0,0,0.75);',
          'padding:6px 10px;border-radius:3px;',
          'border:1px solid rgba(100,200,100,0.6);',
          'white-space:nowrap;z-index:999;',
          `left:${xPct}%;top:${yPct}%;`,
          'transform:translate(10px,-50%);',   // offset right so finger doesn't cover it
        ].join('');
        readout.textContent = `x: ${xPct}, y: ${yPct}`;

        layer.appendChild(readout);
        inspectorEl = readout;

        // Auto-dismiss after 3 s
        dismissTimer = setTimeout(() => {
          readout.remove();
          inspectorEl = null;
          dismissTimer = null;
        }, 3000);
      });
    }
  }

  // ── Brief panel ───────────────────────────────────────────────────────────

  function openBrief(spot) {
    if (briefOpen) return;
    briefOpen = true;

    const content = getDomainBrief(spot.domain, world);
    const panel   = el.querySelector('#home-brief');
    const room    = el.querySelector('#home-room');

    // Dim the room
    if (room) room.style.filter = 'brightness(0.35)';

    panel.innerHTML = buildBriefHTML(content, spot);
    panel.style.pointerEvents = 'all';

    requestAnimationFrame(() => {
      panel.style.opacity   = '1';
      panel.style.transform = 'translateY(0)';
    });

    attachBriefListeners(panel, spot, content);
  }

  function closeBrief() {
    if (!briefOpen) return;
    briefOpen = false;

    const panel = el.querySelector('#home-brief');
    const room  = el.querySelector('#home-room');

    if (room) room.style.filter = '';

    panel.style.opacity   = '0';
    panel.style.transform = 'translateY(100%)';

    setTimeout(() => {
      panel.style.pointerEvents = 'none';
      panel.innerHTML = '';
    }, 380);
  }

  function buildBriefHTML(content, spot) {
    const isPrimary = content.is_primary;

    if (isPrimary) {
      return buildPrimaryBriefHTML(content);
    } else {
      return buildDomainBriefHTML(content, spot);
    }
  }

  // Primary brief — full depth, sectioned
  function buildPrimaryBriefHTML(content) {
    const sectionsHTML = content.sections.map(section => `
      <div style="margin-bottom:28px;">
        <div style="
          font-family:var(--font-sans);font-weight:200;
          font-size:9px;letter-spacing:0.35em;text-transform:uppercase;
          color:rgba(240,235,218,0.35);margin-bottom:12px;
        ">${section.heading}</div>
        ${section.items.map(item => buildItemRow(item)).join('')}
      </div>
    `).join('');

    return `
      <div style="
        position:absolute;inset:0;
        background:linear-gradient(to top,
          rgba(0,0,0,0.97) 0%,
          rgba(0,0,0,0.92) 60%,
          rgba(0,0,0,0.75) 100%
        );
      "></div>
      <div style="
        position:absolute;inset:0;
        display:flex;flex-direction:column;
        padding:
          max(52px, calc(var(--safe-top, 0px) + 28px))
          28px
          max(48px, calc(var(--safe-bottom, 0px) + 24px));
        overflow-y:auto;-webkit-overflow-scrolling:touch;
      ">
        <!-- Header -->
        <div style="
          display:flex;justify-content:space-between;align-items:flex-start;
          margin-bottom:36px;
        ">
          <div>
            <div style="
              font-family:var(--font-serif);font-style:italic;font-weight:300;
              font-size:clamp(26px,6vw,34px);
              color:rgba(240,235,218,0.92);letter-spacing:0.01em;
              margin-bottom:4px;
            ">Brief</div>
            <div style="
              font-family:var(--font-sans);font-weight:200;
              font-size:10px;letter-spacing:0.25em;text-transform:uppercase;
              color:rgba(240,235,218,0.3);
            ">${formatBriefDate()}</div>
          </div>
          <button id="brief-close" style="
            font-family:var(--font-sans);font-weight:200;
            font-size:10px;letter-spacing:0.22em;text-transform:uppercase;
            color:rgba(240,235,218,0.3);
            padding:8px;margin-top:4px;
            transition:color 0.2s ease;
          ">close</button>
        </div>

        <!-- Sections -->
        ${sectionsHTML}
      </div>
    `;
  }

  // Domain brief — grab and go, tight card
  function buildDomainBriefHTML(content, spot) {
    const rowsHTML = (content.sections || []).map(item => buildItemRow(item)).join('');

    const inputHTML = content.input ? `
      <div style="margin-top:20px;">
        <style>#capture-input::placeholder { color: rgba(240,235,218,0.25); }</style>
        <textarea id="capture-input" rows="3" placeholder="${content.placeholder || ''}" style="
          width:100%;box-sizing:border-box;
          background:rgba(240,235,218,0.05);
          border:0.5px solid rgba(240,235,218,0.2);border-radius:2px;
          padding:14px;
          font-family:var(--font-sans);font-weight:300;
          font-size:13px;letter-spacing:0.04em;
          color:rgba(240,235,218,0.85);
          resize:none;outline:none;
        "></textarea>
        <button id="capture-save" style="
          margin-top:10px;
          padding:12px 28px;
          border:0.5px solid rgba(240,235,218,0.3);border-radius:2px;
          font-family:var(--font-sans);font-weight:300;
          font-size:11px;letter-spacing:0.28em;text-transform:uppercase;
          color:rgba(240,235,218,0.7);
          transition:all 0.2s ease;
        ">save</button>
      </div>
    ` : '';

    const ctaHTML = content.cta ? `
      <button class="brief-cta" data-action="${content.cta_action}" style="
        margin-top:20px;
        padding:12px 28px;
        border:0.5px solid rgba(240,235,218,0.25);border-radius:2px;
        font-family:var(--font-sans);font-weight:300;
        font-size:11px;letter-spacing:0.28em;text-transform:uppercase;
        color:rgba(240,235,218,0.5);
        transition:all 0.2s ease;
        align-self:flex-start;
      ">${content.cta}</button>
    ` : '';

    return `
      <!-- Backdrop -->
      <div id="brief-backdrop" style="
        position:absolute;inset:0;background:transparent;
      "></div>

      <!-- Card — slides up from bottom -->
      <div style="
        position:absolute;bottom:0;left:0;right:0;
        background:linear-gradient(to top,
          rgba(8,8,8,0.98) 0%,
          rgba(12,12,12,0.95) 100%
        );
        border-top:0.5px solid rgba(240,235,218,0.1);
        border-radius:4px 4px 0 0;
        padding:
          24px
          28px
          max(32px, calc(var(--safe-bottom, 0px) + 20px));
        display:flex;flex-direction:column;
        max-height:70vh;overflow-y:auto;-webkit-overflow-scrolling:touch;
      ">
        <!-- Drag handle -->
        <div style="
          width:36px;height:3px;border-radius:2px;
          background:rgba(240,235,218,0.15);
          margin:0 auto 20px;
        "></div>

        <!-- Title row -->
        <div style="
          display:flex;justify-content:space-between;align-items:center;
          margin-bottom:20px;
        ">
          <div style="
            font-family:var(--font-serif);font-style:italic;font-weight:300;
            font-size:clamp(20px,5vw,26px);
            color:rgba(240,235,218,0.9);
          ">${content.title}</div>
          <button id="brief-close" style="
            font-family:var(--font-sans);font-weight:200;
            font-size:10px;letter-spacing:0.22em;text-transform:uppercase;
            color:rgba(240,235,218,0.3);padding:8px;
            transition:color 0.2s ease;
          ">close</button>
        </div>

        <!-- Rows -->
        <div style="display:flex;flex-direction:column;gap:0;">
          ${rowsHTML}
        </div>

        ${inputHTML}
        ${ctaHTML}
      </div>
    `;
  }

  // Individual data row — shared between primary and domain briefs
  function buildItemRow(item) {
    const urgentAccent = item.urgent
      ? 'border-left:2px solid rgba(210,160,60,0.7);padding-left:12px;'
      : 'border-left:2px solid rgba(240,235,218,0.08);padding-left:12px;';

    const hasCascade = !!(item.cascade_type && item.item_id);
    const hasVehicle = !!item.vehicle_id;  // tappable vehicle row → detail cascade
    const hasPerson  = !!item.person_id;   // tappable person row → person detail cascade
    const hasTask    = !!item.task_id && !hasCascade; // tappable maintenance task row → inline edit

    const snoozeBtn = (item.urgent && item.snoozable && item.item_id) ? `
      <button class="snooze-btn" data-id="${item.item_id}" style="
        font-family:var(--font-sans);font-weight:200;
        font-size:9px;letter-spacing:0.2em;text-transform:uppercase;
        color:rgba(240,235,218,0.25);
        padding:4px 8px;
        border:0.5px solid rgba(240,235,218,0.1);border-radius:1px;
        transition:all 0.2s ease;white-space:nowrap;
      ">snooze</button>
    ` : '';

    const dismissBtn = (item.urgent && item.item_id && !hasCascade) ? `
      <button class="dismiss-btn" data-id="${item.item_id}" style="
        font-family:var(--font-sans);font-weight:200;
        font-size:9px;letter-spacing:0.2em;text-transform:uppercase;
        color:rgba(240,235,218,0.25);
        padding:4px 8px;
        border:0.5px solid rgba(240,235,218,0.1);border-radius:1px;
        transition:all 0.2s ease;white-space:nowrap;
      ">done</button>
    ` : '';

    // Cascade affordance — replaces dismiss, label becomes tappable
    const cascadeBtn = hasCascade ? `
      <button class="cascade-open-btn" data-id="${item.item_id}" style="
        font-family:var(--font-sans);font-weight:200;
        font-size:9px;letter-spacing:0.2em;text-transform:uppercase;
        color:rgba(210,160,60,0.6);
        padding:4px 8px;
        border:0.5px solid rgba(210,160,60,0.25);border-radius:1px;
        transition:all 0.2s ease;white-space:nowrap;
      ">handle →</button>
    ` : '';

    const labelStyle = (hasCascade || hasVehicle || hasPerson || hasTask)
      ? `cursor:pointer;transition:color 0.15s ease;`
      : '';

    const labelAttrs = hasCascade
      ? `class="cascade-label" data-id="${item.item_id}"`
      : hasVehicle
        ? `class="vehicle-detail-label" data-vehicle-id="${item.vehicle_id}"`
        : hasPerson
          ? `class="person-detail-label" data-person-id="${item.person_id}"`
          : hasTask
            ? `class="task-detail-label" data-task-id="${item.task_id}"`
            : '';

    return `
      <div style="
        padding:14px 0;
        border-bottom:0.5px solid rgba(240,235,218,0.06);
        display:flex;align-items:center;gap:12px;
      ">
        <div style="flex:1;${urgentAccent}">
          <div ${labelAttrs} style="
            font-family:var(--font-sans);font-weight:300;
            font-size:13px;letter-spacing:0.04em;
            color:${item.urgent ? 'rgba(240,235,218,0.9)' : 'rgba(240,235,218,0.65)'};
            margin-bottom:${item.value ? '4px' : '0'};
            ${labelStyle}
          ">${item.label}${(hasVehicle || hasPerson || hasTask) ? '<span style="font-size:10px;letter-spacing:0.15em;color:rgba(240,235,218,0.2);margin-left:8px;">view →</span>' : ''}</div>
          ${item.value ? `<div style="
            font-family:var(--font-sans);font-weight:200;
            font-size:11px;letter-spacing:0.06em;
            color:rgba(240,235,218,0.35);
          ">${item.value}</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          ${snoozeBtn}
          ${cascadeBtn}
          ${dismissBtn}
        </div>
      </div>
    `;
  }

  function formatBriefDate() {
    return new Date().toLocaleDateString('en-CA', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
  }

  // ── Brief listeners ───────────────────────────────────────────────────────

  function attachBriefListeners(panel, spot, content) {
    // Close button
    const closeBtn = panel.querySelector('#brief-close');
    if (closeBtn) {
      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.color = 'rgba(240,235,218,0.7)';
      });
      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.color = 'rgba(240,235,218,0.3)';
      });
      closeBtn.addEventListener('click', closeBrief);
    }

    // Backdrop tap — close domain briefs, not primary
    const backdrop = panel.querySelector('#brief-backdrop');
    if (backdrop && !content.is_primary) {
      backdrop.addEventListener('click', closeBrief);
    }

    // Snooze buttons
    panel.querySelectorAll('.snooze-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        snoozeItem(btn.dataset.id, 24);
        closeBrief();
      });
    });

    // Dismiss buttons
    panel.querySelectorAll('.dismiss-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        dismissItem(btn.dataset.id);
        closeBrief();
      });
    });

    // Cascade — "handle →" button or tappable label opens cascade panel
    const openCascade = (itemId) => {
      const allItems = getUrgentItems();
      const item     = allItems.find(i => i.id === itemId);
      if (!item?.cascade) return;

      const cascadePanel = createCascade({
        item,
        onBack: () => {
          // Brief stays open — cascade slides away
        },
        onComplete: () => {
          // Dismiss the item and refresh the brief
          dismissItem(itemId);
          closeBrief();
        },
      });
      if (cascadePanel) cascadePanel.open(el);
    };

    panel.querySelectorAll('.cascade-open-btn').forEach(btn => {
      btn.addEventListener('click', () => openCascade(btn.dataset.id));
    });

    panel.querySelectorAll('.cascade-label').forEach(label => {
      label.addEventListener('click',      () => openCascade(label.dataset.id));
      label.addEventListener('mouseenter', () => label.style.color = 'rgba(210,160,60,0.9)');
      label.addEventListener('mouseleave', () => label.style.color = 'rgba(240,235,218,0.9)');
    });

    // Person detail — opens when user taps a partner or child row
    const openPersonDetail = (personId) => {
      const team = store.get('team') || {};
      let person, personType;

      if (personId === 'partner') {
        person     = team.partner;
        personType = 'partner';
      } else if (personId.startsWith('child_')) {
        const idx  = parseInt(personId.replace('child_', ''), 10);
        person     = (team.children || [])[idx];
        personType = 'child';
      }
      if (!person) return;

      const detailItem = {
        id:    `person_detail_${personId}`,
        title: person.name || 'Person',
        body:  personType === 'partner' ? person.profession || 'Partner' : `${person.age ? person.age + ' years old' : ''}${person.whose ? ' · ' + person.whose : ''}`,
        cascade: {
          type:    'person_detail',
          context: { person_id: personId },
        },
      };

      const cascadePanel = createCascade({
        item: detailItem,
        onBack: () => {},
        onComplete: () => { closeBrief(); },
      });
      if (cascadePanel) cascadePanel.open(el);
    };

    panel.querySelectorAll('.person-detail-label').forEach(label => {
      label.addEventListener('click',      () => openPersonDetail(label.dataset.personId));
      label.addEventListener('mouseenter', () => label.style.color = 'rgba(210,160,60,0.9)');
      label.addEventListener('mouseleave', () => label.style.color = label.closest('[style*="0.9"]') ? 'rgba(240,235,218,0.9)' : 'rgba(240,235,218,0.65)');
    });

    // Vehicle detail — opens when user taps a vehicle row
    const openVehicleDetail = (vehicleId) => {
      const vehicles = store.get('vehicles') || [];
      const vehicle  = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) return;

      const detailItem = {
        id: `vehicle_detail_${vehicleId}`,
        title: vehicle.name || 'Vehicle',
        body: vehicle.mileage_at_entry
          ? `${parseInt(vehicle.mileage_at_entry).toLocaleString()} km at entry`
          : 'Full record',
        cascade: {
          type: 'vehicle_detail',
          context: { vehicle_id: vehicleId },
        },
      };
      const cascadePanel = createCascade({
        item: detailItem,
        onBack: () => {},
        onComplete: () => { closeBrief(); },
      });
      if (cascadePanel) cascadePanel.open(el);
    };

    panel.querySelectorAll('.vehicle-detail-label').forEach(label => {
      label.addEventListener('click',      () => openVehicleDetail(label.dataset.vehicleId));
      label.addEventListener('mouseenter', () => label.style.color = 'rgba(210,160,60,0.9)');
      label.addEventListener('mouseleave', () => label.style.color = 'rgba(240,235,218,0.65)');
    });

    // Task detail — opens when user taps a maintenance task row
    const openTaskDetail = (taskId) => {
      const tasks = store.get('maintenance_tasks') || [];
      const task  = tasks.find(t => t.id === taskId);
      if (!task) return;

      const detailItem = {
        id:    `task_detail_${taskId}`,
        title: task.label,
        body:  task.interval_label || '',
        cascade: {
          type:    'maintenance_detail',
          context: { task_id: taskId },
        },
      };
      const cascadePanel = createCascade({
        item: detailItem,
        onBack: () => {},
        onComplete: () => { closeBrief(); },
      });
      if (cascadePanel) cascadePanel.open(el);
    };

    panel.querySelectorAll('.task-detail-label').forEach(label => {
      label.addEventListener('click',      () => openTaskDetail(label.dataset.taskId));
      label.addEventListener('mouseenter', () => label.style.color = 'rgba(210,160,60,0.9)');
      label.addEventListener('mouseleave', () => label.style.color = 'rgba(240,235,218,0.65)');
    });

    // Maintenance intake — opens when user taps "Add a task" CTA
    const openMaintenanceIntake = () => {
      const intakeItem = {
        id: 'maintenance_intake_new',
        title: 'Add a task',
        body: "I'll flag it before it matters",
        cascade: {
          type: 'maintenance_intake',
          context: {},
        },
      };
      const cascadePanel = createCascade({
        item: intakeItem,
        onBack: () => {},
        onComplete: () => { closeBrief(); },
      });
      if (cascadePanel) cascadePanel.open(el);
    };

    // Vehicle intake — opens when user taps "Add a vehicle" CTA
    const openVehicleIntake = () => {
      const intakeItem = {
        id: 'vehicle_intake_new',
        title: 'Add a vehicle',
        body: "I'll track what needs attention",
        cascade: {
          type: 'vehicle_intake',
          context: {},
        },
      };
      const cascadePanel = createCascade({
        item: intakeItem,
        onBack: () => {},
        onComplete: () => {
          closeBrief();
          // Re-open vehicles brief so user sees their new vehicle
          setTimeout(() => {
            const spot = HOTSPOT_MAPS[world.id]?.find(h => h.domain === 'vehicles');
            if (spot) openBrief(spot);
          }, 400);
        },
      });
      if (cascadePanel) cascadePanel.open(el);
    };

    // CTA buttons
    panel.querySelectorAll('.brief-cta').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.color        = 'rgba(240,235,218,0.85)';
        btn.style.borderColor  = 'rgba(240,235,218,0.4)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.color        = 'rgba(240,235,218,0.5)';
        btn.style.borderColor  = 'rgba(240,235,218,0.25)';
      });
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'add_vehicle') {
          openVehicleIntake();
        } else if (action === 'add_maintenance') {
          openMaintenanceIntake();
        } else {
          console.log(`CTA action: ${action}`);
        }
      });
    });

    // Capture save — quick note
    const saveBtn = panel.querySelector('#capture-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const input = panel.querySelector('#capture-input');
        if (!input?.value.trim()) return;
        const notes = store.get('capture_notes') || [];
        notes.push({ text: input.value.trim(), ts: new Date().toISOString() });
        store.set('capture_notes', notes);
        closeBrief();
      });
    }
  }

  // ── Keyframe injection — once per session ─────────────────────────────────

  function injectKeyframes() {
    if (document.getElementById('home-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'home-keyframes';
    style.textContent = `
      @keyframes urgentPulse {
        0%, 100% { opacity: 0.7; transform: scale(1); }
        50%       { opacity: 0.3; transform: scale(1.12); }
      }
      @keyframes warningPulse {
        0%, 100% { opacity: 0.85; transform: scale(1); }
        50%       { opacity: 0.35; transform: scale(1.15); }
      }
      @keyframes warningDotPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.5; transform: scale(0.85); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    el,
    mount(container) {
      injectKeyframes();
      render();
      container.innerHTML = '';
      container.appendChild(el);
      attachDevReset(el);
    },
    unmount() {
      return transitions.fadeOut(el, 600).then(() => el.remove());
    },
  };
}

// ---------------------------------------------------------------------------
// DEV RESET — carried forward from main.js, attached to home screen
// 3-second long press anywhere. No UI. Invisible to real users.
// ---------------------------------------------------------------------------

const RESET_HOLD_MS = 3000;

function attachDevReset(el) {
  let timer = null;
  let active = false;

  function onStart() {
    if (timer) return;
    active = true;
    el.style.transition = `opacity ${RESET_HOLD_MS}ms linear`;
    el.style.opacity    = '0.5';
    timer = setTimeout(() => {
      timer = null; active = false;
      fireReset(el);
    }, RESET_HOLD_MS);
  }

  function onEnd() {
    if (!active) return;
    active = false;
    if (timer) { clearTimeout(timer); timer = null; }
    el.style.transition = 'opacity 0.4s ease';
    el.style.opacity    = '1';
  }

  el.addEventListener('pointerdown',   onStart);
  el.addEventListener('pointerup',     onEnd);
  el.addEventListener('pointercancel', onEnd);
  el.addEventListener('pointerleave',  onEnd);
}

function fireReset(el) {
  const { store } = window.__ylu__ || {};
  el.style.transition = 'opacity 0.12s ease';
  el.style.opacity    = '1';
  setTimeout(() => {
    el.style.opacity = '0.2';
    setTimeout(() => {
      import('./store.js').then(({ store }) => {
        store.reset();
        location.reload();
      });
    }, 200);
  }, 120);
}
