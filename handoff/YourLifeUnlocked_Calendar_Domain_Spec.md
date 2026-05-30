# YOUR LIFE / UNLOCKED
## Calendar Domain Spec
*Session 23 | Confidential | Build Bible*

---

## What This Document Is

The governing specification for the calendar domain — its store shape, its role in the app architecture, the signal contract between domains and the calendar, and how the ATAK reads it.

Nothing gets built without this document being consulted first.

---

## 1. What the Calendar Is

The calendar is the **authoritative temporal domain**. It owns time.

Everything with a time dimension lives here — whether the user entered it directly, a domain wrote a signal to it, or the ATAK derived it. The calendar is not a scheduling tool. It is the temporal intelligence layer that makes the ATAK's fused picture possible.

**What makes this different from a standard calendar:**
A standard calendar only knows what the user put in it. This calendar also knows what the app knows — oil change overdue, annual physical due, Sophie's birthday in 16 days. The user sees a coherent picture of their time. The ATAK sees signal density across days and weeks, and reasons from it.

---

## 2. Architecture Position

```
vehicles.js  ──owns──▶  store.vehicles
health.js    ──owns──▶  store.health
team.js      ──owns──▶  store.team

Each domain ──signals──▶  store.calendar  (temporal layer)

calendar.js  ──owns──▶  store.calendar (reads + writes + presents)

atak.js  ──reads──▶  store.calendar  (what does the day look like?)
         ──reads──▶  store.vehicles, store.health, etc. (what's behind each signal?)
         ──produces──▶  fused intelligence picture
```

**The calendar does not call into domain files.**
**Domain files do not call into the calendar.**
**The store is the shared memory. Signals are written to it.**

---

## 3. Entry Types

The calendar holds two fundamentally different types of entry. The UI presents them differently. The ATAK reads them differently.

### Type 1 — User Entry
The user added this. Has a date. Optionally a time or a window.

```js
{
  id:         'evt_abc123',
  type:       'user_entry',
  title:      'Heat pump repair',
  date:       '2026-06-03',          // ISO date — always present
  time_start: '11:00',               // optional — null if no time
  time_end:   '16:00',               // optional — null if point-in-time
  all_day:    false,
  notes:      '',                    // optional free text
  source:     'user',
  domain:     null,                  // no owning domain — user created it
  created_at: '2026-05-29T10:00:00Z',
}
```

### Type 2 — Domain Signal
A domain wrote this. The calendar surfaces it temporally. The user did not schedule it — the app surfaced it.

```js
{
  id:         'sig_vehicle_oil_abc',
  type:       'domain_signal',
  title:      'Mazda3 — Oil change overdue',
  date:       '2026-05-15',          // the date it became relevant (overdue date, due date, birthday)
  time_start: null,                  // signals rarely have a specific time
  time_end:   null,
  all_day:    true,
  notes:      '',
  source:     'domain',
  domain:     'vehicles',            // owning domain — tap routes here
  domain_ref: 'vehicle_abc123',      // ID of the object in the domain store
  signal_type: 'overdue',            // 'overdue' | 'upcoming' | 'birthday' | 'anniversary' | 'appointment'
  pressure:   'warning',             // 'warning' | 'caution' | 'info'
  created_at: '2026-05-29T10:00:00Z',
  expires_at: null,                  // optional — signal auto-removes after this date
}
```

---

## 4. The Signal Contract

How domains write to the calendar. This is the protocol every domain follows.

### Writing a signal
Domains write signals to `store.calendar` directly. A domain never calls into `calendar.js`. It writes a well-formed signal object to the store array.

```js
// Inside vehicles.js, when a vehicle's oil change becomes overdue:
const calendar = store.get('calendar') || [];
const existing = calendar.find(e => e.id === signalId);
if (!existing) {
  store.set('calendar', [...calendar, {
    id:          `sig_vehicle_oil_${vehicle.id}`,
    type:        'domain_signal',
    title:       `${vehicle.name} — Oil change overdue`,
    date:        overdueDate,
    all_day:     true,
    source:      'domain',
    domain:      'vehicles',
    domain_ref:  vehicle.id,
    signal_type: 'overdue',
    pressure:    'warning',
    created_at:  new Date().toISOString(),
  }]);
}
```

### Signal deduplication
Signals use deterministic IDs based on the owning object. The same vehicle never produces two oil change signals. A domain checks for an existing signal with its ID before writing.

### Signal retirement
When the underlying condition resolves — oil change logged, appointment kept, birthday passed — the domain removes its signal from the calendar store. This keeps the calendar honest. Stale signals are noise.

```js
// Remove signal when condition resolves
const calendar = store.get('calendar') || [];
store.set('calendar', calendar.filter(e => e.id !== `sig_vehicle_oil_${vehicle.id}`));
```

---

## 5. Store Shape

```js
// store.calendar — flat array, all entry types mixed
store.calendar = [
  // User entries and domain signals together
  // Sorted by date at read time, not at write time
]
```

The store is a flat array. Sorting, filtering, and grouping happen at read time in `calendar.js` and `atak.js`. The store holds raw entries only.

---

## 6. What the ATAK Reads

The ATAK reads `store.calendar` and performs temporal analysis. Its questions:

**Density:** How loaded is the next 7 days? Is today spoken for?

**Conflict detection:** Do any user entries overlap with domain signals that require action? (Medical appointment at 1:30pm + heat pump window 11am–4pm = this afternoon is fully committed.)

**Window identification:** Where in the next 14 days is there room to act on overdue or upcoming items?

**Pressure weighting:** `warning` signals surface above `caution`. Multiple signals on the same day escalate the day's overall pressure.

The ATAK does not render calendar entries. It reads temporal data and produces intelligence. The calendar domain renders calendar entries.

---

## 7. What the Calendar UI Shows

The calendar view has two layers:

**The grid** — a week or month view. Days with entries show a quiet indicator. Days with `warning` signals show a more prominent indicator. The user can scroll through time.

**The day view** — tap a day, see everything on it. User entries and domain signals in the same list, visually distinguished. Domain signals show their owning domain and route there on tap.

**Entry creation** — the user taps a day and adds an entry. Simple: title, date, optional time, optional window, optional notes. That's it. No categories, no colours, no calendar accounts. One clean surface.

---

## 8. Domain Signal Registry

Which domains write signals, and what they write.

| Domain | Signal type | Condition | Pressure |
|---|---|---|---|
| Vehicles | overdue | Service/reg/insurance past due | warning |
| Vehicles | upcoming | Service/reg/insurance within 30 days | caution |
| Health | overdue | Annual physical, screening overdue | warning |
| Health | appointment | Confirmed appointment with date/time | info |
| Team | birthday | Partner or child birthday within 30 days | caution |
| Team | birthday | Birthday today | warning |
| Maintenance | overdue | Task past due date | warning |
| Maintenance | upcoming | Task due within 14 days | caution |

This registry grows as domains are built. Health signals are added when the health domain is built. The calendar is ready to receive them without modification.

---

## 9. Files

| File | Role |
|---|---|
| `calendar.js` | Domain module — UI, entry creation, day view, reading from store |
| `store.js` | `store.calendar` array — shared memory, written by all domains |
| `atak.js` | Reads `store.calendar` for temporal analysis — does not render |

No domain file imports from `calendar.js`. The store is the only shared interface.

---

## 10. What Is Not In This Spec

- Recurring events — not in scope for the first build. One-time entries only.
- Reminders and notifications — governed by the notification philosophy (parked).
- Calendar sync (Apple Calendar, Google Calendar) — post-beta consideration.
- Multi-day events — not in scope for first build. Window events (start time + end time, same day) are sufficient.

---

*Your Life / Unlocked | Calendar Domain Spec | Session 23 | Confidential*
