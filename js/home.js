import { store } from './store.js';
import { transitions } from './transitions.js';

// ---------------------------------------------------------------------------
// HOME MODULE — The Room
//
// The home screen is a room. The user's world rendered as a physical space.
// Objects in the room are interactive doors to different domains.
//
// Two modes:
//   GRAB AND GO — tap any object, a focused brief fills the screen.
//                 Fast, data-only, dismissable. One domain, what you need.
//   DEPTH       — tap the primary object (ATAC / world equivalent).
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
// primary: the depth object — opens the full ATAC/equivalent experience
// ---------------------------------------------------------------------------

const HOTSPOT_MAPS = {
  operator: [
    {
      id: 'atac',
      label: 'Brief',
      x: 44, y: 52,
      r: 36,
      primary: true,
      urgent: true,
      domain: 'brief',
    },
    {
      id: 'peltors',
      label: 'Alerts',
      x: 48, y: 20,
      r: 28,
      primary: false,
      urgent: true,
      domain: 'alerts',
    },
    {
      id: 'keys',
      label: 'Vehicles',
      x: 58, y: 48,
      r: 22,
      primary: false,
      urgent: true,
      domain: 'vehicles',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      x: 78, y: 22,
      r: 30,
      primary: false,
      urgent: true,
      domain: 'calendar',
    },
    {
      id: 'notebook',
      label: 'Capture',
      x: 35, y: 80,
      r: 24,
      primary: false,
      urgent: false,
      domain: 'capture',
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      x: 70, y: 72,
      r: 22,
      primary: false,
      urgent: true,
      domain: 'maintenance',
    },
    {
      id: 'workout',
      label: 'Health',
      x: 18, y: 72,
      r: 22,
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
  // Pull from store when real data exists.
  // Stub for day-one build:
  const team = store.get('team') || {};
  const items = [];

  // If a partner has a birthday on file within 14 days — flag it
  if (team?.partner?.birthday) {
    const daysUntil = daysUntilDate(team.partner.birthday);
    if (daysUntil !== null && daysUntil <= 14 && daysUntil >= 0) {
      items.push({
        id: 'partner_birthday',
        object: 'calendar',
        domain: 'calendar',
        title: `${team.partner.name || 'Partner'}'s birthday`,
        body: daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`,
        snoozable: true,
        snoozed_until: null,
      });
    }
  }

  // Check store for any saved urgent items
  const stored = store.get('urgent_items') || [];
  return [...items, ...stored.filter(i => !isSnoozed(i))];
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

    case 'maintenance':
      return {
        title: 'Maintenance',
        sections: [{
          label: 'Nothing due',
          value: 'Add recurring tasks and I\'ll flag them before they matter',
          urgent: false,
        }],
        cta: 'Add a task',
        cta_action: 'add_maintenance',
      };

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

  // Urgent — always first if present
  if (urgent.length) {
    sections.push({
      heading: 'Needs attention',
      items: urgent.map(i => ({
        label: i.title,
        value: i.body,
        urgent: true,
        item_id: i.id,
        snoozable: i.snoozable,
      })),
    });
  }

  // Team — who's in the picture today
  const teamLines = [];
  if (team?.partner?.name) teamLines.push(team.partner.name);
  if (team?.children?.length) {
    teamLines.push(
      team.children.length === 1
        ? team.children[0].name
        : `${team.children.length} kids`
    );
  }
  sections.push({
    heading: 'Your team',
    items: teamLines.length ? teamLines.map(t => ({
      label: t, value: '', urgent: false,
    })) : [{
      label: 'Just you for now',
      value: '',
      urgent: false,
    }],
  });

  // Horizon — upcoming dates
  sections.push({
    heading: 'On the horizon',
    items: [{
      label: 'Nothing scheduled yet',
      value: 'Add dates and I\'ll brief you when it matters',
      urgent: false,
    }],
  });

  // Mission gaps — what they flagged in onboarding
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
    spots.forEach(s => { map[s.id] = []; });
    items.forEach(item => {
      const spot = spots.find(s => s.domain === item.domain || s.id === item.object);
      if (spot) map[spot.id].push(item);
    });
    return map;
  }

  function renderHotspots() {
    const layer = el.querySelector('#home-hotspots');
    if (!layer) return;

    hotspots.forEach(spot => {
      const hasUrgent = urgentByObj[spot.id]?.length > 0;
      const btn = document.createElement('button');

      btn.style.cssText = `
        position:absolute;
        left:${spot.x}%;top:${spot.y}%;
        transform:translate(-50%, -50%);
        width:${spot.r * 2}px;height:${spot.r * 2}px;
        border-radius:50%;
        border:none;background:transparent;
        cursor:pointer;
        -webkit-tap-highlight-color:transparent;
        opacity:0;
        animation:fadeIn 0.6s ease-out ${spot.primary ? '1.0' : '1.3'}s both;
      `;

      // Urgent ring on the object
      if (hasUrgent) {
        btn.innerHTML = `
          <span style="
            position:absolute;inset:0;border-radius:50%;
            border:1.5px solid rgba(210,160,60,0.7);
            animation:urgentPulse 2.5s ease-in-out infinite;
          "></span>
          <span style="
            position:absolute;top:4px;right:4px;
            width:8px;height:8px;border-radius:50%;
            background:rgba(210,160,60,0.9);
          "></span>
        `;
      }

      // Primary object gets a subtle glow
      if (spot.primary) {
        btn.style.boxShadow = hasUrgent
          ? '0 0 0 1px rgba(210,160,60,0.3), 0 0 24px rgba(210,160,60,0.15)'
          : '0 0 0 1px rgba(240,235,218,0.12), 0 0 20px rgba(240,235,218,0.06)';
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
        <textarea id="capture-input" rows="3" placeholder="${content.placeholder || ''}" style="
          width:100%;box-sizing:border-box;
          background:rgba(240,235,218,0.05);
          border:0.5px solid rgba(240,235,218,0.2);border-radius:2px;
          padding:14px;
          font-family:var(--font-sans);font-weight:300;
          font-size:13px;letter-spacing:0.04em;
          color:rgba(240,235,218,0.85);
          resize:none;outline:none;
        ">::placeholder { color: rgba(240,235,218,0.25); }</textarea>
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

    const dismissBtn = (item.urgent && item.item_id) ? `
      <button class="dismiss-btn" data-id="${item.item_id}" style="
        font-family:var(--font-sans);font-weight:200;
        font-size:9px;letter-spacing:0.2em;text-transform:uppercase;
        color:rgba(240,235,218,0.25);
        padding:4px 8px;
        border:0.5px solid rgba(240,235,218,0.1);border-radius:1px;
        transition:all 0.2s ease;white-space:nowrap;
      ">done</button>
    ` : '';

    return `
      <div style="
        padding:14px 0;
        border-bottom:0.5px solid rgba(240,235,218,0.06);
        display:flex;align-items:center;gap:12px;
      ">
        <div style="flex:1;${urgentAccent}">
          <div style="
            font-family:var(--font-sans);font-weight:300;
            font-size:13px;letter-spacing:0.04em;
            color:${item.urgent ? 'rgba(240,235,218,0.9)' : 'rgba(240,235,218,0.65)'};
            margin-bottom:${item.value ? '4px' : '0'};
          ">${item.label}</div>
          ${item.value ? `<div style="
            font-family:var(--font-sans);font-weight:200;
            font-size:11px;letter-spacing:0.06em;
            color:rgba(240,235,218,0.35);
          ">${item.value}</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          ${snoozeBtn}
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

    // CTA buttons — stubbed, wired in future sessions
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
        console.log(`CTA action: ${btn.dataset.action}`);
        // Future: route to add_date, add_vehicle, etc.
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
