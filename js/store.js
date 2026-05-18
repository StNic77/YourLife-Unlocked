const STATE_KEY = 'ylu_state';

const defaults = {
  screen: 'welcome',
  world: null,
  onboarding: {
    complete: false,
    situation: null,
    mission: [],
    service_support: [],
  },
  user: {
    name: null,
    joined: null,
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
