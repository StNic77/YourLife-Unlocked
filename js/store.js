const STATE_KEY = 'ylu_state';

const defaults = {
  screen: 'welcome',
  world: null,
  onboarding: {
    complete: false,
    situation: null,
    mission: [],
    service_support: [],
    occupation_sector: null,  // 'military' | 'first_responder' | 'healthcare' | 'trades' | 'business' | 'professional' | 'student' | 'other'
                              // Asked in onboarding redesign. Used by SHAPE for downstream inference.
                              // SHAPE can also write this from pool signals if not set at onboarding.
  },
  // team is written by team.js after onboarding completes
  team: {
    complete: false,
    partner: {},
    children: [],
    coordinating: {},
  },
  // domain arrays
  vehicles: [],
  maintenance: [],
  calendar: [],
  health: {},           // single object — Medical, Physical, Mental sub-domains written here
  reflecting_pool: [],  // array of sessions — each session has exchanges[], SHAPE reads the full array
  military: {},         // CAF/service member data — written by SHAPE from pool signals
  shape:    null,       // SHAPE intelligence store — raw layer + interpreted layer

  user: {
    name: null,
    pronouns: null,        // 'he' | 'she' | 'they'
    country: null,         // 'CA' | 'US' | 'UK' | 'other'

    // Home base — stable, jurisdiction-aware
    province: null,        // canonical code e.g. 'BC', 'TX'
    province_name: null,   // full display name e.g. 'British Columbia'
    home_city: null,
    home_lat: null,
    home_lng: null,

    // Current position — refreshed each session
    lat: null,
    lng: null,

    // Whether the home/away question has been answered
    location_confirmed: false,

    joined:   null,
    birthday: null,   // ISO date string e.g. '1985-03-15' — written by onboarding redesign or SHAPE from pool
  },
};

function load() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  } catch {
    return { ...defaults };
  }
}

function save(state) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — continue in memory
  }
}

let _state = load();
const _listeners = new Set();

export const store = {
  get(key) {
    return key ? _state[key] : { ..._state };
  },

  set(key, value) {
    _state = { ..._state, [key]: value };
    save(_state);
    _listeners.forEach(fn => fn(_state, key));
  },

  update(partial) {
    _state = { ..._state, ...partial };
    save(_state);
    _listeners.forEach(fn => fn(_state, Object.keys(partial)));
  },

  subscribe(fn) {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },

  reset() {
    _state = { ...defaults };
    save(_state);
    _listeners.forEach(fn => fn(_state, 'reset'));
  },
};
