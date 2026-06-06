import { store } from './store.js';

// ---------------------------------------------------------------------------
// VEHICLES DOMAIN MODULE
//
// Owns all vehicle domain logic:
//   - Brief content for the grab-and-go panel
//   - Urgency check (is a vehicle pressing?)
//   - Calendar signal writing and retirement
//
// Architecture:
//   vehicles.js ──reads/writes──▶ store.vehicles
//   vehicles.js ──writes signals──▶ store.calendar
//   home.js     ──calls──▶ getVehiclesBrief() for the panel
//   atak.js     ──reads──▶ store.vehicles directly for synthesis
//
// vehicles.js does not import from home.js, cascade.js, or atak.js.
// The store is the only shared interface.
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// URGENCY CHECK
// Is any trackable field on this vehicle within the alert threshold?
// Used by the brief renderer and the ATAK horizon scan.
// ---------------------------------------------------------------------------

// Days within which a vehicle date field is considered urgent.
const VEHICLE_URGENT_THRESHOLD  = 30;   // appears in grab-and-go as urgent
const VEHICLE_SIGNAL_UPCOMING   = 365;  // calendar signal — write up to 12 months out
const VEHICLE_SIGNAL_OVERDUE    = 0;    // calendar signal — warning (past due)

export function isVehicleUrgent(v) {
  return [v.registration_expiry, v.insurance_expiry, v.service_due].some(f => {
    if (!f) return false;
    return Math.ceil((new Date(f) - new Date()) / (1000 * 60 * 60 * 24)) <= VEHICLE_URGENT_THRESHOLD;
  });
}


// ---------------------------------------------------------------------------
// BRIEF CONTENT
// Returns the structured content object for the vehicles grab-and-go panel.
// home.js calls this — it owns no vehicle logic itself.
// ---------------------------------------------------------------------------

export function getVehiclesBrief() {
  const vehicles = store.get('vehicles') || [];

  return {
    title: 'Vehicles',
    sections: vehicles.length
      ? vehicles.map(v => ({
          label:      v.name || 'Vehicle',
          value:      _vehicleSummaryLine(v),
          urgent:     isVehicleUrgent(v),
          vehicle_id: v.id,
        }))
      : [{
          label:  'No vehicles on file',
          value:  "Add your vehicles and I'll track what needs attention",
          urgent: false,
        }],
    cta:        'Add a vehicle',
    cta_action: 'add_vehicle',
  };
}

// Produces the summary line shown under each vehicle in the brief.
// Reg · Insurance · Service — only fields that exist.
function _vehicleSummaryLine(v) {
  const parts = [
    v.registration_expiry ? `Reg: ${_formatDate(v.registration_expiry)}` : null,
    v.insurance_expiry    ? `Insurance: ${_formatDate(v.insurance_expiry)}` : null,
    v.service_due         ? `Service: ${_formatDate(v.service_due)}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'No dates on file';
}

function _formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-CA', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return dateStr; }
}


// ---------------------------------------------------------------------------
// CALENDAR SIGNAL WRITING
//
// Vehicles write time-sensitive signals to store.calendar.
// The ATAK reads store.calendar for temporal analysis.
// Signals use deterministic IDs — the same vehicle never produces two signals
// for the same field. Deduplication happens before every write.
//
// Call syncVehicleSignals() after any vehicle data change:
//   - Vehicle added
//   - Vehicle updated (dates changed)
//   - Service logged (retires service signal)
//   - Vehicle deleted (retires all signals)
// ---------------------------------------------------------------------------

// Signal field definitions — each trackable date field on a vehicle.
const SIGNAL_FIELDS = [
  { field: 'registration_expiry', label: 'Reg expiry',  signalKey: 'reg'  },
  { field: 'insurance_expiry',    label: 'Insurance',   signalKey: 'ins'  },
  { field: 'service_due',         label: 'Service due', signalKey: 'svc'  },
];

// Deterministic signal ID for a vehicle + field combination.
function _signalId(vehicleId, signalKey) {
  return `sig_vehicle_${signalKey}_${vehicleId}`;
}

// Write or update signals for a single vehicle.
// Reads current store.calendar, adds/removes signals as needed.
function _syncVehicleSignals(vehicle) {
  let calendar = store.get('calendar') || [];
  const today  = new Date();

  SIGNAL_FIELDS.forEach(({ field, label, signalKey }) => {
    const id    = _signalId(vehicle.id, signalKey);
    const value = vehicle[field];

    // Remove any existing signal for this field — we'll re-evaluate
    calendar = calendar.filter(e => e.id !== id);

    if (!value) return; // no date on file — no signal

    // Validate ISO format — skip bad values rather than writing NaN signals
    if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return;

    const date = new Date(value + 'T00:00:00');
    if (isNaN(date)) return;
    const days = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

    // Only write a signal if within the upcoming window or overdue
    if (days > VEHICLE_SIGNAL_UPCOMING) return;

    const overdue  = days < VEHICLE_SIGNAL_OVERDUE;
    const pressure = overdue ? 'warning' : days <= 7 ? 'warning' : days <= 30 ? 'caution' : 'info';
    const title    = overdue
      ? `${vehicle.name || 'Vehicle'} — ${label} overdue`
      : `${vehicle.name || 'Vehicle'} — ${label} in ${days} day${days === 1 ? '' : 's'}`;

    calendar.push({
      id,
      type:        'domain_signal',
      title,
      date:        value.slice(0, 10),   // ISO date string YYYY-MM-DD
      time_start:  null,
      time_end:    null,
      all_day:     true,
      source:      'domain',
      domain:      'vehicles',
      domain_ref:  vehicle.id,
      signal_type: overdue ? 'overdue' : 'upcoming',
      pressure,
      created_at:  new Date().toISOString(),
      expires_at:  null,
    });
  });

  store.set('calendar', calendar);
}

// Retire all signals for a deleted vehicle.
export function retireVehicleSignals(vehicleId) {
  const calendar = store.get('calendar') || [];
  const ids = SIGNAL_FIELDS.map(({ signalKey }) => _signalId(vehicleId, signalKey));
  store.set('calendar', calendar.filter(e => !ids.includes(e.id)));
}

// Sync signals for all vehicles currently in the store.
// Call this on app load and after any vehicle data change.
export function syncVehicleSignals() {
  const vehicles = store.get('vehicles') || [];

  // First, retire signals for vehicles that no longer exist
  const vehicleIds = new Set(vehicles.map(v => v.id));
  let calendar = store.get('calendar') || [];
  calendar = calendar.filter(e => {
    if (e.domain !== 'vehicles') return true;          // not a vehicle signal — keep
    const vid = e.domain_ref;
    return vehicleIds.has(vid);                         // keep only if vehicle still exists
  });
  store.set('calendar', calendar);

  // Then sync each vehicle
  vehicles.forEach(v => _syncVehicleSignals(v));
}
