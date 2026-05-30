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
//   atak.js        ──reads──▶ store.maintenance_tasks directly for synthesis
//
// maintenance.js does not import from home.js, cascade.js, or atak.js.
// The store is the only shared interface.
// ---------------------------------------------------------------------------


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

const SIGNAL_UPCOMING_DAYS = 14;  // write a signal when task is due within this window

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
  const pressure = overdue ? 'warning' : days <= 3 ? 'warning' : 'caution';
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
