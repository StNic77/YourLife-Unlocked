import { store } from './store.js';
import { createWelcome } from './welcome.js';
import { createGallery } from './gallery.js';
import { createOnboarding } from './onboarding.js';
import { createTeam } from './team.js';
import { createHome } from './home.js';

const app = document.getElementById('app');

// ---------------------------------------------------------------------------
// DEV PERSONAS
// Load a fully-populated store with realistic data, skipping onboarding.
// URL param: ?dev=single | ?dev=married | ?dev=blended
//
// Dates are computed relative to today so urgency is always live.
// Run once at boot — overrides any existing store state.
//
// single   — Marcus Webb, single male, Operator world
//            Heavy week. Vehicle registration due in 6 days. Partner's
//            birthday not applicable. Maintenance overdue. Undealt mission.
//
// married  — Sarah Chen, married female, Garden world
//            Partner's birthday in 9 days. Two kids. Light week building
//            to a heavy one. Love languages established. Coordinating rhythm.
//
// blended  — Ryan Torres, blended family male, Playbook world
//            His kid + her kid + one together. Busy calendar. Vehicle
//            insurance due in 12 days. Multiple urgent clusters. Snooze
//            history present — has been using the app long enough to defer.
// ---------------------------------------------------------------------------

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  // Return as "Month Day" string — same format birthday fields use
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

function isoFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function hoursAgo(n) {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

const PERSONAS = {

  single: {
    world: 'operator',
    user: { name: 'Marcus', joined: isoFromNow(-42), city: 'Courtenay', province: 'BC', lat: 49.687, lng: -124.994 },
    onboarding: {
      complete: true,
      situation: 'single',
      mission: ['getting_organized', 'physical_health', 'undealt'],
      service_support: ['military'],
    },
    team: {
      complete: true,
      partner: {},
      children: [],
      coordinating: { rhythm: null },
    },
    vehicles: [
      {
        id: 'v1',
        name: '2019 Ram 1500',
        year: '2019', make: 'Ram', model: '1500',
        plate_province: 'BC',
        registration_expiry: isoFromNow(6),
        insurance_expiry:    isoFromNow(74),
        service_due:         isoFromNow(-8),   // overdue
      },
    ],
    urgent_items: [
      {
        id: 'maintenance_1',
        object: 'maintenance',
        domain: 'maintenance',
        title: 'Ram 1500 — Oil change overdue',
        body: '8 days past due',
        snoozable: true,
        snoozed_until: null,
        cascade: {
          type: 'vehicle_service',
          context: { vehicle_id: 'v1', service_type: 'oil_change' },
        },
      },
      {
        id: 'vehicle_reg_1',
        object: 'keys',
        domain: 'vehicles',
        title: 'Ram 1500 — Registration',
        body: '6 days',
        snoozable: true,
        snoozed_until: null,
        cascade: {
          type: 'vehicle_registration',
          context: { vehicle_id: 'v1', plate_province: 'BC', province: 'BC' },
        },
      },
      {
        id: 'medical_annual_1',
        object: 'peltors',
        domain: 'alerts',
        title: 'Annual physical overdue',
        body: '14 months since last visit',
        snoozable: true,
        snoozed_until: null,
        cascade: {
          type: 'medical_appointment',
          context: {
            appointment_type: 'annual_physical',
            province: 'BC',
            provider_name: null,
            provider_phone: null,
          },
        },
      },
    ],
    capture_notes: [
      { text: 'Call dad back', ts: hoursAgo(18) },
      { text: 'Pick up meds Thursday', ts: hoursAgo(5) },
    ],
  },

  married: {
    world: 'garden',
    user: { name: 'Sarah', joined: isoFromNow(-67), city: 'Victoria', province: 'BC', lat: 48.428, lng: -123.365 },
    onboarding: {
      complete: true,
      situation: 'married',
      mission: ['relationships', 'emotional_wellbeing', 'daily_routine'],
      service_support: [],
    },
    team: {
      complete: true,
      partner: {
        name: 'Daniel',
        pronoun: 'he',
        birthday: daysFromNow(9),              // urgent — 9 days
        love_language: 'quality_time',
        relationship_state: 'good',
      },
      children: [
        {
          name: 'Mia',
          pronoun: 'she',
          age: '7',
          birthday: daysFromNow(34),           // not urgent
        },
        {
          name: 'Owen',
          pronoun: 'he',
          age: '4',
          birthday: daysFromNow(4),            // urgent — 4 days
        },
      ],
      coordinating: {
        rhythm: 'sunday_evening',
        last_checked: isoFromNow(-6),
      },
    },
    vehicles: [
      {
        id: 'v1',
        name: '2022 Honda Pilot',
        registration_expiry: isoFromNow(88),
        insurance_expiry:    isoFromNow(22),   // getting close
        service_due:         isoFromNow(14),
      },
    ],
    urgent_items: [],
    capture_notes: [
      { text: 'Gift idea for Daniel — cooking class', ts: hoursAgo(31) },
      { text: 'Owen party — confirm 6 kids coming', ts: hoursAgo(12) },
    ],
  },

  blended: {
    world: 'playbook',
    user: { name: 'Ryan', joined: isoFromNow(-98), city: 'Courtenay', province: 'BC', lat: 49.687, lng: -124.994 },
    onboarding: {
      complete: true,
      situation: 'in_relationship',
      mission: ['relationships', 'money', 'working_toward', 'undealt'],
      service_support: ['first_responder'],
    },
    team: {
      complete: true,
      partner: {
        name: 'Jess',
        pronoun: 'she',
        birthday: daysFromNow(51),             // not urgent
        love_language: 'acts_of_service',
        relationship_state: 'navigating',
      },
      children: [
        {
          name: 'Caleb',           // Ryan's
          pronoun: 'he',
          age: '11',
          whose: 'mine',
          birthday: daysFromNow(12),           // borderline — 12 days
        },
        {
          name: 'Ava',             // Jess's
          pronoun: 'she',
          age: '9',
          whose: 'partners',
          birthday: daysFromNow(63),
        },
        {
          name: 'Theo',            // theirs
          pronoun: 'he',
          age: '2',
          whose: 'ours',
          birthday: daysFromNow(8),            // urgent — 8 days
        },
      ],
      coordinating: {
        rhythm: 'wednesday_morning',
        last_checked: isoFromNow(-9),
      },
    },
    vehicles: [
      {
        id: 'v1',
        name: '2020 F-150',
        year: '2020', make: 'Ford', model: 'F-150',
        plate_province: 'BC',
        registration_expiry: isoFromNow(45),
        insurance_expiry:    isoFromNow(12),
        service_due:         isoFromNow(28),
      },
      {
        id: 'v2',
        name: '2018 Sienna',
        year: '2018', make: 'Toyota', model: 'Sienna',
        plate_province: 'BC',
        registration_expiry: isoFromNow(-3),   // overdue
        insurance_expiry:    isoFromNow(91),
        service_due:         isoFromNow(55),
      },
    ],
    urgent_items: [
      {
        id: 'vehicle_insurance_1',
        object: 'keys',
        domain: 'vehicles',
        title: 'F-150 — Insurance renewal',
        body: '12 days',
        snoozable: true,
        snoozed_until: null,
        cascade: {
          type: 'vehicle_registration',
          context: { vehicle_id: 'v1', plate_province: 'BC', province: 'BC' },
        },
      },
      {
        id: 'vehicle_reg_2',
        object: 'keys',
        domain: 'vehicles',
        title: 'Sienna — Registration expired',
        body: '3 days overdue',
        snoozable: false,
        snoozed_until: null,
        cascade: {
          type: 'vehicle_registration',
          context: { vehicle_id: 'v2', plate_province: 'BC', province: 'BC' },
        },
      },
      {
        id: 'maintenance_2',
        object: 'maintenance',
        domain: 'maintenance',
        title: 'Sienna — Tire rotation',
        body: 'Flagged last week',
        snoozable: true,
        snoozed_until: isoFromNow(-1),
        cascade: {
          type: 'vehicle_service',
          context: { vehicle_id: 'v2', service_type: 'tire_rotation' },
        },
      },
    ],
    capture_notes: [
      { text: 'Caleb needs new cleats for spring season', ts: hoursAgo(48) },
      { text: 'Jess mentioned the deck needs staining', ts: hoursAgo(20) },
      { text: 'Look into refinancing — rates dropped', ts: hoursAgo(6) },
    ],
  },
};

function loadPersona(key, worlds) {
  const persona = PERSONAS[key];
  if (!persona) return false;

  // Reset first — clean slate, no leftover state
  store.reset();

  // Load each slice
  store.set('world',       persona.world);
  store.set('user',        persona.user);
  store.set('onboarding',  persona.onboarding);
  store.set('team',        persona.team);
  store.set('vehicles',    persona.vehicles    || []);
  store.set('urgent_items', persona.urgent_items || []);
  store.set('capture_notes', persona.capture_notes || []);

  console.log(`[DEV] Persona loaded: ${key} (${persona.user.name}, ${persona.world})`);
  return true;
}

async function loadWorlds() {
  const res = await fetch('./data/worlds.json');
  if (!res.ok) throw new Error('Failed to load worlds data');
  const data = await res.json();
  return data.worlds;
}

async function boot() {
  let worlds;
  try {
    worlds = await loadWorlds();
  } catch (err) {
    console.error('Could not load worlds:', err);
    app.innerHTML = `
      <div style="
        display:flex;align-items:center;justify-content:center;
        height:100%;font-family:var(--font-sans);
        color:rgba(240,235,218,0.5);font-size:13px;letter-spacing:0.1em;
      ">something went quiet. refresh to try again.</div>
    `;
    return;
  }

  // DEV PERSONAS — checked before returning-user logic
  // ?dev=single | ?dev=married | ?dev=blended
  // Loads persona state and skips onboarding entirely.
  const devParam = new URLSearchParams(window.location.search).get('dev');
  if (devParam && PERSONAS[devParam]) {
    loadPersona(devParam, worlds);
    await showHome(worlds);
    return;
  }

  const returning = store.get('world') && store.get('onboarding')?.complete;

  if (returning) {
    await showHome(worlds);
    return;
  }

  await showWelcome(worlds);
}

async function showWelcome(worlds) {
  const welcome = createWelcome();
  await welcome.mount(app);
  await welcome.unmount();
  await showGallery(worlds);
}

async function showGallery(worlds) {
  const gallery = createGallery(worlds);
  const chosenWorld = await gallery.mount(app);
  store.set('world', chosenWorld.id);
  await gallery.unmount();
  await showOnboarding(chosenWorld, worlds);
}

async function showOnboarding(world, worlds) {
  const onboarding = createOnboarding(world, worlds);

  const result = await onboarding.mount(app, {
    onBack: async () => {
      await onboarding.unmount();
      store.set('world', null);
      await showGallery(worlds);
    },
  });
  await onboarding.unmount();

  if (result?.next === 'team') {
    const team = createTeam(result.world);
    await team.mount(app);
    await team.unmount();
  }

  await showHome(worlds);
}

async function showHome(worlds) {
  const worldId = store.get('world');
  const world   = worlds.find(w => w.id === worldId);
  if (!world) return;

  const home = createHome(world);
  home.mount(app);
}

boot();
