import { store } from './store.js';
import { createWelcome } from './welcome.js';
import { createGallery } from './gallery.js';
import { createOnboarding } from './onboarding.js';
import { createTeam } from './team.js';
import { createHome } from './home.js';
import { createLocationRequest } from './location.js';
import { initShape } from './shape.js';
import { syncHealthSignals } from './health.js';

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

// ---------------------------------------------------------------------------
// REAL USER DATA — Shawn's actual vehicle, loaded via ?dev=shawn
// This is not a persona — it is real data from a real person.
// Use this to test the full intelligence picture against live information.
// ---------------------------------------------------------------------------
const SHAWN_VEHICLES = [
  {
    id: 'v_shawn_1',
    name: '2015 Mazda3 Sport',
    year: '2015',
    make: 'Mazda',
    model: 'Mazda3',
    variant: 'Sport',
    mileage_at_entry: 267000,
    mileage_date: '2026-05-25',
    plate_province: 'BC',
    preferred_shop: 'Mr. Lube',
    preferred_interval_km: 8000,
    vin: null,
    transmission: 'manual',

    // Service history — three oil changes on file
    service_history: [
      { type: 'oil_change', date: '2025-03-21', mileage: 241300, shop: 'Mr. Lube', notes: null },
      { type: 'oil_change', date: '2025-06-04', mileage: 250810, shop: 'Mr. Lube', notes: 'Cross-Canada drive inflated interval' },
      { type: 'oil_change', date: '2026-03-10', mileage: 263551, shop: 'Mr. Lube', notes: 'Stretched — acknowledged' },
    ],

    // Known maintenance history
    known_history: [
      { type: 'spark_plugs',        mileage_approx: 240000, date_approx: '2024' },
      { type: 'serpentine_belt', label: 'Serpentine belts (both)', mileage_approx: 240000, date_approx: '2024', notes: 'AC compressor belt and alternator belt replaced' },
      { type: 'struts',         mileage_approx: null,   date: '2025-08', notes: 'Struts and sway bar links' },
      { type: 'brake_caliper',  mileage_approx: null,   date: '2025-09', notes: 'RR caliper — leaky piston replaced' },
      { type: 'brake_fluid',    mileage_approx: null,   date: '2025-09', notes: 'Full bleed and refill' },
      { type: 'brakes',         mileage_approx: null,   date: '2024-09', notes: 'New rotors and pads all around' },
      { type: 'fuel_system',    mileage_approx: null,   date_approx: null, notes: 'Done' },
    ],

    // Tires
    tires: {
      summer: { brand: 'Michelin', season: 3, on: true,  installed: '2026-04-03' },
      winter: { brand: 'Michelin', season: 4, on: false, notes: 'Still good' },
    },

    // Vehicle facts — AI-authoritative for this engine
    // 2015 Mazda3 2.0L Skyactiv-G
    vehicle_facts: {
      timing_system:       'Timing chain — maintenance-free for engine life',
      serpentine_belt:     '2 belts (AC compressor + alternator/power steering) · replace every 100,000–120,000 km or on wear/cracking',
      spark_plugs:         'NGK ILKAR7L-11 iridium · gap 1.1mm · replace every 100,000–160,000 km',
      transmission_fluid:  'Manual: Mazda MTF (75W-90 GL-4) · change every 80,000 km or 5 years',
      coolant:             'Mazda FL-22 long-life coolant · flush every 200,000 km or 10 years (first interval) then every 100,000 km',
      notes:               'Skyactiv-G 2.0L is reliable at high mileage. Watch for carbon buildup on intake valves after 200,000 km. Throttle body cleaning recommended. PCV valve check at high mileage.',
    },

    // Pending / watch list
    watch_list: [
      { type: 'throttle_body', label: 'Throttle body clean', status: 'not_done' },
      { type: 'transmission_fluid', label: 'Transmission fluid check', status: 'unknown' },
    ],

    // Next service — calculated from last oil change + interval
    // Last: 2026-03-10 @ 263,551km. Interval: 8,000km. Next: ~271,551km
    service_due: '2026-08-01',   // approximate — late July / early August
    registration_expiry: null,
    insurance_expiry: null,
  },
];

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
  // SHAPE — initialise after store is loaded. Non-blocking.
  initShape();

  // Health signals — sync on every boot so calendar reflects current health data
  // without requiring the user to re-save health information.
  syncHealthSignals();

  const devParam = new URLSearchParams(window.location.search).get('dev');

  // Real user shortcut — loads Shawn's actual data
  if (devParam === 'shawn') {
    // Only reset if this is a fresh load — preserve any data the user has saved.
    // Once the shawn environment is bootstrapped, a flag is written to the store.
    // Subsequent reloads (with ?dev=shawn still in the URL) skip the reset
    // so that vehicles, edits, and any other saves survive page refresh.
    const alreadyLoaded = store.get('dev_shawn_loaded');
    if (alreadyLoaded) {
      await showHome(worlds);
      return;
    }
    store.reset();

    store.set('world', 'operator');

    store.set('user', {
      name:               'Shawn',
      joined:             isoFromNow(-120),
      city:               'Comox',
      province:           'BC',
      country:            'CA',
      lat:                49.721,
      lng:               -124.929,
      home_lat:           49.721,
      home_lng:          -124.929,
      location_confirmed: true,
      pronouns:           'he/him',
    });

    store.set('onboarding', {
      complete:        true,
      situation:       'in_relationship',
      mission: [
        'getting_organized',
        'working_toward',
        'relationships',
        'physical_health',
        'undealt',
      ],
      watch_for: [
        'things_slipping_through',
        'patterns_missing',
        'bad_timing',
        'blind_spots',
      ],
      service_support: ['military'],
    });

    store.set('team', {
      complete: true,
      partner: {
        name:               'Julia',
        pronoun:            'she',
        birthday:           'September 21',
        birth_year:         1978,
        love_language:      null,
        relationship_state: 'good',
        tenure:             '3 months',
        works:              'yes',
        profession:         'Nurse',
      },
      children: [
        {
          name:    'Emily',
          pronoun: 'she',
          age:     27,
          birthday: 'March 11',
          whose:   'mine',
        },
        {
          name:    'Owen',
          pronoun: 'he',
          age:     25,
          birthday: 'February 26',
          whose:   'mine',
        },
        {
          name:    'Sophie',
          pronoun: 'she',
          age:     16,
          birthday: 'December 1',
          whose:   'mine',
        },
        {
          name:    'Dexter',
          pronoun: 'he',
          age:     13,
          birthday: null,
          whose:   'partners',
        },
        {
          name:    'Priya',
          pronoun: 'she',
          age:     11,
          birthday: null,
          whose:   'partners',
        },
      ],
      coordinating: { rhythm: null },
    });

    store.set('vehicles', SHAWN_VEHICLES);

    // Maintenance tasks — Shawn's real recurring items
    store.set('maintenance_tasks', [
      {
        id:             'mt_furnace',
        label:          'Furnace filter',
        interval_days:  90,
        interval_label: 'Every 3 months',
        last_done:      isoFromNow(-95),   // overdue — Master Warning
        next_due:       isoFromNow(-5),
        notes:          '16x25x1 filter',
        tier:           'warning',
      },
      {
        id:             'mt_smoke',
        label:          'Smoke detector batteries',
        interval_days:  365,
        interval_label: 'Annually',
        last_done:      isoFromNow(-340),
        next_due:       isoFromNow(25),
        notes:          null,
        tier:           'caution',
      },
      {
        id:             'mt_gutters',
        label:          'Gutter cleaning',
        interval_days:  180,
        interval_label: 'Every 6 months',
        last_done:      isoFromNow(-185),
        next_due:       isoFromNow(-5),
        notes:          'Spring and fall',
        tier:           'warning',
      },
      {
        id:             'mt_dryer_vent',
        label:          'Dryer vent cleaning',
        interval_days:  365,
        interval_label: 'Annually',
        last_done:      isoFromNow(-200),
        next_due:       isoFromNow(165),
        notes:          null,
        tier:           'caution',
      },
    ]);

    // Urgent items — Master Warning and Master Caution
    // Mazda3 service is the real derived item — surface it explicitly too
    store.set('urgent_items', [
      {
        id:          'shawn_oil_change',
        object:      'maintenance',
        domain:      'maintenance',
        title:       'Mazda3 — Oil change due',
        body:        'Next at ~271,551 km · late July',
        snoozable:   true,
        snoozed_until: null,
        tier:        'caution',
        cascade: {
          type:    'vehicle_service',
          context: { vehicle_id: 'v_shawn_1', service_type: 'oil_change' },
        },
      },
      {
        id:          'shawn_throttle_body',
        object:      'maintenance',
        domain:      'maintenance',
        title:       'Mazda3 — Throttle body clean',
        body:        'Flagged — not yet done',
        snoozable:   true,
        snoozed_until: null,
        tier:        'caution',
        cascade: {
          type:    'vehicle_service',
          context: { vehicle_id: 'v_shawn_1', service_type: 'throttle_body' },
        },
      },
    ]);

    store.set('capture_notes', [
      { text: 'Call about the deck permit', ts: hoursAgo(48) },
      { text: 'Look into RRSP contribution room', ts: hoursAgo(12) },
    ]);

    store.set('dev_shawn_loaded', true);
    console.log('[DEV] Real user loaded: Shawn, Comox BC — full environment');
    await showHome(worlds);
    return;
  }

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

  // Location request — fires after world selection so we have a voice
  const locationReq = createLocationRequest(chosenWorld);
  const { province_known } = await locationReq.mount(app);
  await locationReq.unmount();

  await showOnboarding(chosenWorld, worlds, { provinceKnown: province_known });
}

async function showOnboarding(world, worlds, { provinceKnown = false } = {}) {
  const onboarding = createOnboarding(world, { provinceKnown });

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

  // Refresh current lat/lng each session — handles travel
  // Runs silently in background, does not block home render
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const existing = store.get('user') || {};
        // Only update lat/lng — never overwrite home_lat/home_lng from here
        store.set('user', {
          ...existing,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => { /* denied or unavailable — use stored values */ },
      { timeout: 8000, maximumAge: 300000 } // 5-min cache — don't hammer GPS
    );
  }

  const home = createHome(world);
  home.mount(app);
}

boot();
