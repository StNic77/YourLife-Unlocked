import { store } from './store.js';

// ---------------------------------------------------------------------------
// MAINTENANCE DOMAIN MODULE
//
// Owns all maintenance domain logic:
//   - Brief content for the grab-and-go panel
//   - Calendar signal writing and retirement
//
// Architecture:
//   maintenance.js ──reads/writes──▶ store.maintenance_tasks
//   maintenance.js ──writes signals──▶ store.calendar
//   home.js        ──calls──▶ getMaintenanceBrief() for the panel
//   atak.js        ──reads──▶ store.calendar for synthesis
//
// maintenance.js does not import from home.js, cascade.js, or atak.js.
// The store is the only shared interface.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// QUICK-ADD TILES
// Common recurring tasks with sensible default intervals.
// Tiles whose label already exists in store.maintenance_tasks are filtered out
// so the user never sees a duplicate prompt.
// ---------------------------------------------------------------------------

export const QUICK_ADD_TILES = [
  { id: 'qa_furnace_filter',      label: 'Furnace / heat pump filter',       interval_days: 90,  interval_label: 'Every 3 months' },
  { id: 'qa_range_hood',          label: 'Range hood filter',                interval_days: 90,  interval_label: 'Every 3 months' },
  { id: 'qa_smoke_test',          label: 'Smoke detector test',              interval_days: 180, interval_label: 'Every 6 months' },
  { id: 'qa_co_test',             label: 'CO detector test',                 interval_days: 180, interval_label: 'Every 6 months' },
  { id: 'qa_dryer_vent',          label: 'Dryer vent cleaning',              interval_days: 180, interval_label: 'Every 6 months' },
  { id: 'qa_water_filter',        label: 'Water filter',                     interval_days: 180, interval_label: 'Every 6 months' },
  { id: 'qa_gutters',             label: 'Gutter cleaning',                  interval_days: 180, interval_label: 'Every 6 months' },
  { id: 'qa_hvac_service',        label: 'HVAC service',                     interval_days: 365, interval_label: 'Annually'       },
  { id: 'qa_fire_extinguisher',   label: 'Fire extinguisher inspection',     interval_days: 365, interval_label: 'Annually'       },
  { id: 'qa_weatherstripping',    label: 'Weatherstripping check',           interval_days: 365, interval_label: 'Annually'       },
  { id: 'qa_detector_batteries',  label: 'Smoke / CO battery replacement',   interval_days: 365, interval_label: 'Annually'       },
  { id: 'qa_lawn_fertilizer',     label: 'Lawn fertilizer',                  interval_days: 90,  interval_label: 'Every 3 months' },
  { id: 'qa_faucet_winterize',    label: 'Exterior faucet winterization',    interval_days: 365, interval_label: 'Annually'       },
];


// ---------------------------------------------------------------------------
// BRIEF CONTENT
// Returns the structured content object for the maintenance grab-and-go panel.
// ---------------------------------------------------------------------------

export function getMaintenanceBrief() {
  const tasks = store.get('maintenance_tasks') || [];
  const today = new Date();

  const activeTasks = tasks
    .map(t => {
      const due    = t.next_due ? new Date(t.next_due) : null;
      const days   = due ? Math.ceil((due - today) / (1000 * 60 * 60 * 24)) : null;
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
    sections: activeTasks.length
      ? activeTasks.map(t => ({
          label:   t.label,
          value:   t.overdue
            ? `Overdue by ${Math.abs(t.days)} days`
            : t.days !== null
              ? t.days === 0 ? 'Due today' : `Due in ${t.days} days`
              : t.interval_label || 'No due date set',
          urgent:  t.overdue || t.urgent,
          task_id: t.id,
        }))
      : [{
          label:  'Nothing scheduled',
          value:  "Add recurring tasks and I'll flag them before they matter",
          urgent: false,
        }],
    cta:        'Add a task',
    cta_action: 'add_maintenance',
    quick_add_tiles: (() => {
      const existingLabels = new Set(tasks.map(t => t.label.toLowerCase()));
      return QUICK_ADD_TILES.filter(tile => !existingLabels.has(tile.label.toLowerCase()));
    })(),
  };
}


// ---------------------------------------------------------------------------
// CALENDAR SIGNAL WRITING
//
// Maintenance tasks write time-sensitive signals to store.calendar.
// The ATAK reads store.calendar for temporal analysis.
// Signals use deterministic IDs — the same task never produces two signals.
// Deduplication happens before every write.
//
// Call syncMaintenanceSignals() after any task data change:
//   - Task added
//   - Task updated (next_due changed)
//   - Task marked done (retires signal, new next_due produces new signal)
//   - Task deleted (retires signal)
// ---------------------------------------------------------------------------

const SIGNAL_UPCOMING_DAYS = 365;  // write signals up to 12 months out

function _signalId(taskId) {
  return `sig_maintenance_${taskId}`;
}

function _syncTaskSignal(task) {
  let calendar = store.get('calendar') || [];
  const id     = _signalId(task.id);
  const today  = new Date();

  // Remove existing signal — re-evaluate from scratch
  calendar = calendar.filter(e => e.id !== id);

  if (!task.next_due) {
    store.set('calendar', calendar);
    return;
  }

  const date  = new Date(task.next_due);
  const days  = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

  // Only write a signal if within the upcoming window or overdue
  if (days > SIGNAL_UPCOMING_DAYS) {
    store.set('calendar', calendar);
    return;
  }

  const overdue  = days < 0;
  const pressure = overdue ? 'warning' : days <= 3 ? 'warning' : days <= 30 ? 'caution' : 'info';
  const title    = overdue
    ? `${task.label} — overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`
    : days === 0
      ? `${task.label} — due today`
      : `${task.label} — due in ${days} day${days === 1 ? '' : 's'}`;

  calendar.push({
    id,
    type:        'domain_signal',
    title,
    date:        task.next_due.slice(0, 10),
    time_start:  null,
    time_end:    null,
    all_day:     true,
    source:      'domain',
    domain:      'maintenance',
    domain_ref:  task.id,
    signal_type: overdue ? 'overdue' : 'upcoming',
    pressure,
    created_at:  new Date().toISOString(),
    expires_at:  null,
  });

  store.set('calendar', calendar);
}

// Retire the signal for a deleted task.
export function retireMaintenanceSignal(taskId) {
  const calendar = store.get('calendar') || [];
  store.set('calendar', calendar.filter(e => e.id !== _signalId(taskId)));
}

// Sync signals for all tasks currently in the store.
// Call on app load and after any task data change.
export function syncMaintenanceSignals() {
  const tasks = store.get('maintenance_tasks') || [];

  // Retire signals for tasks that no longer exist
  const taskIds = new Set(tasks.map(t => t.id));
  let calendar = store.get('calendar') || [];
  calendar = calendar.filter(e => {
    if (e.domain !== 'maintenance') return true;
    return taskIds.has(e.domain_ref);
  });
  store.set('calendar', calendar);

  // Sync each task
  tasks.forEach(t => _syncTaskSignal(t));
}
