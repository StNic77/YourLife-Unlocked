# YOUR LIFE / UNLOCKED
## Session 37 — Final Handoff
*June 6, 2026 | Bug Fix + Build Session | Confidential*

---

## 1. What This Session Was

A long and productive bug-fix session that also delivered two significant builds. The app is now materially more stable and more complete. The Operator world is solid. The conversation at the end of the session pointed toward the next major phase: cross-world deployment.

---

## 2. Bugs Fixed

### Bug 1 — Tap circles not clearing after mark-done
**Root cause:** `renderHotspots()` was appending new hotspot buttons without first clearing the layer. Every time the store subscription fired and called `renderHotspots()`, a new correct set of circles was appended on top of the stale red ones. The old circles remained, still pulsing. Hard reload rebuilt `el.innerHTML` from scratch, which is why it always cleared on reload.

**Fix:** `layer.innerHTML = ''` added at the top of `renderHotspots()` before the rebuild loop.

**Files:** `home.js`

---

### Bug 2 — ATAK white ring always present
**Symptom:** The primary (ATAK) hotspot had a permanent bright white glowing ring regardless of urgency state. This double-signalled alongside whatever domain dots were already firing.

**Fix:** Removed the `else if (spot.primary)` branch that applied a default box-shadow to the primary spot. The ATAK gets no ring when there's nothing urgent. It's always present — it doesn't need to announce itself.

**Files:** `home.js`

---

### Bug 3 — Mark done from maintenance domain not clearing dot
**Root cause:** Two issues compounding. First, the `onComplete` handler for maintenance cascades was calling `dismissItem(itemId)`, which only touches `urgent_items`. Derived maintenance items are never in `urgent_items` — they're computed live from `maintenance_tasks` by `getUrgentItems()`. So `dismissItem` was a no-op. Second, the old mark-done handler in the `maintenance_detail` cascade block was calling `maintenanceTaskRenderer.complete` via an assignment rather than the detail renderer's own `complete()`, which introduced timing ambiguity.

**Fix:** `onComplete` for maintenance cascades now calls `syncMaintenanceSignals()` instead of `dismissItem()`. The detail renderer's mark-done event handler writes directly to the store inline, reads the date from `readDateField`, and fires `syncMaintenanceSignals()` to update the calendar signals immediately.

**Files:** `home.js`, `cascade.js`

---

### Bug 4 — Vehicle edit not recalculating service_due
**Root cause:** The vehicle intake `complete()` in edit mode was falling back to `vehicles[idx].service_due || null` — preserving the stale stored value rather than recalculating. No new AI call fires during an edit, so `state.ai_schedule` was null, and the fallback kept the original date.

**Fix:** Edit mode now recalculates `service_due` from `last_oil_date + interval_km` using a 1,500 km/month estimate for the date projection. Also writes `next_service_km` (last oil mileage + interval) as a new field on the vehicle record.

**Files:** `cascade.js`

---

### Bug 5 — Mileage-based overdue not surfacing
**Root cause:** `service_due` was date-only. No code compared current mileage against the next service threshold.

**Fix:** `getUrgentItems()` in `atak.js` now includes a vehicle km-overdue check. When `mileage_at_entry >= next_service_km`, a warning-tier item surfaces on the vehicles hotspot with "X km past due" body copy. Routes to the vehicle service cascade.

**Files:** `atak.js`

---

### Bug 6 — ATAK duplicate vehicle signals
**Root cause:** The ATAK horizon scan was reading vehicle dates twice — once from `store.calendar` domain signals (written by `syncVehicleSignals`) and again directly from `store.vehicles`. Same data, two entries.

**Fix:** Removed the direct vehicle loop from the ATAK horizon scan. Vehicle signals surface exclusively via calendar domain signals. The calendar is the authoritative temporal layer — this is the architecture as designed.

**Files:** `atak.js`

---

### Bug 7 — Registration and insurance dates not writing to calendar
**Root cause:** `saveVehicleField` writes to the store but never called `syncVehicleSignals`. So tap-to-edit changes to registration_expiry and insurance_expiry landed in the store but never produced calendar signals.

**Fix:** `syncVehicleSignals()` called at the end of `saveVehicleField`, after every field save.

**Files:** `cascade.js`

---

### Bug 8 — NaN days in ATAK for vehicle service signal
**Root cause:** `service_due` had been stored as a display string ("August 202" — a truncated display value from an old date input path). `new Date("August 202")` returns NaN, producing a NaN days calculation in the horizon scan.

**Fix:** `saveVehicleField` now normalizes all date fields to ISO `YYYY-MM-DD` before storing. Non-ISO values are parsed; unparseable values store as empty string. `_syncVehicleSignals` in `vehicles.js` also validates ISO format before writing a calendar signal — bad values skip silently rather than producing NaN entries.

**Files:** `cascade.js`, `vehicles.js`

---

### Bug 9 — Vehicle service cascade blank screen
**Root cause:** The AI correctly returns null for shop/dealer addresses and phone numbers (it won't fabricate real business details). But `buildServiceRouteHTML` only rendered content when those fields were non-null. Result: empty sections array, only a Mark done button visible.

**Fix:** Shop and dealer routes now always render something actionable. If an address is on file, show Directions. If not, show a "Find nearby" button opening a Google Maps search — using the preferred shop name, dealer name, or a generic "oil change near me" query as appropriate. `context` is now passed into `buildServiceRouteHTML` so the shop route can read `preferred_shop` even when the AI returns null for `shop_name`.

**Files:** `cascade.js`

---

### Bug 10 — Maintenance tasks had no edit path
**Symptom:** If a task label or interval was entered incorrectly, the only option was delete and re-enter.

**Fix:** Maintenance task detail cascade now shows an "edit" button alongside mark done and remove. Tap edit → maintenance intake opens pre-filled with the task's current data. Save writes back to the same task ID. `maintenanceIntakeRenderer.complete()` handles edit mode via `_editingTaskId` flag — updates existing task rather than pushing a new one.

**Files:** `cascade.js`

---

## 3. Build — `datepicker.js`

New shared date picker component. Every date field in the app now imports from one place.

**Exports:**
- `buildDateField(id, label, isoValue, opts)` — returns HTML string
- `attachDateListeners(el)` — wires all pickers within a container
- `formatDisplayDate(isoStr)` — human-readable display string
- `readDateField(container, id)` — reads canonical ISO value from hidden input
- `injectDatePickerStyles()` — injects shared CSS once on boot

**Interaction model:** Display button (no text input), "Today" shortcut, prev/next month nav, month/year label opens jump picker (month grid + decade accordion — same pattern as the calendar domain). Supports `past`, `future`, and `any` modes.

**Wired in:**
- `cascade.js` — maintenance mark done (both renderers), maintenance last done intake, vehicle last oil date, vehicle tap-to-edit date fields (reg expiry, insurance expiry, service due, mileage date, tire installed), service log date, health date fields (all existing `buildDateField` calls now import from here)
- `profileeditor.js` — birthday field
- `main.js` — `injectDatePickerStyles()` called on boot

**Local `buildDateField` and `attachCalendarListeners` removed from `cascade.js`** — ~220 lines deleted, replaced by imports.

**Note:** `calendar.js` end-date picker is its own inline component — not replaced. `datepicker.js` is for form field contexts. The rule going forward: any new date field anywhere uses `datepicker.js`.

**Files:** `datepicker.js` (new), `cascade.js`, `profileeditor.js`, `main.js`

---

## 4. Architecture Conversation — ATAK Reads Calendar, Not Domains

A question surfaced about whether ATAK should read from each domain directly or from the calendar. The answer was confirmed and locked: ATAK reads `store.calendar` for everything time-based. Domains write well-formed signals to the calendar when something becomes time-relevant. ATAK reads one unified timeline and synthesizes. Neither layer reaches into the other's territory.

For things that aren't date-driven (like mileage-based overdue), ATAK derives urgency conditions directly in `getUrgentItems()` — not by reading domains, but by computing from store fields inline.

This is the architecture as designed in Session 23. The duplicate bug fixed this session was a deviation from it. The fix restored the correct pattern.

---

## 5. Files Changed This Session

| File | Changes |
|---|---|
| `home.js` | `renderHotspots()` clears layer before rebuild. ATAK white ring removed. `onComplete` for maintenance cascades calls `syncMaintenanceSignals()` instead of `dismissItem()`. `urgentByObj` is a `let`, recomputed on store subscription. |
| `cascade.js` | All 17 fixes — see above. datepicker import, vehicle/task editable date pickers, log-date replaced, maintenance edit flow, mark-done date capture, vehicle edit recalculation, shop/dealer Find nearby fallback, ISO normalization, syncVehicleSignals call. |
| `atak.js` | Vehicle direct loop removed from horizon scan. Mileage-based overdue detection added to `getUrgentItems()`. |
| `vehicles.js` | ISO validation in `_syncVehicleSignals`. `T00:00:00` suffix on date parsing. |
| `datepicker.js` | New file — shared date picker component. |
| `profileeditor.js` | Birthday field uses `buildDateField`. |
| `main.js` | `injectDatePickerStyles()` import and boot call. |

---

## 6. Queued — Not Yet Built

### Immediate
- Maintenance quick-add tiles — common recurring tasks pre-loaded (furnace filter, smoke detector batteries, gutter cleaning, CO detectors, dryer vent, HVAC service, water heater flush, fire extinguisher). Tap to add with default interval. Custom entry still available.
- Confirm `datepicker.js` working in profile editor birthday on device

### Following
- **Cross-world deployment** — Shawn's instinct at close of session: Operator world is solid, time to start deploying to other worlds. Two tracks:
  - Functional gaps — everything built in Operator needs to exist in all eight worlds
  - Technical — tap area calibration pass for non-Operator worlds (imagery exists, tap areas missing or misplaced)
  - This needs a dedicated thinking session before any code changes. The World Voice Guide is the hard dependency for copy.
- Health domain depth — appointment marking UI, screening completion
- ATAK cross-domain conflict naming
- Sanctuary system prompt — `getSanctuaryHandoff()` is the interface; read Sanctuary Prompt Brief and SHAPE Definition Document before that session
- Profile editor birthday → date picker upgrade (text field with auto-format still in place; upgrades to `datepicker.js` once confirmed working)

### Before Any New Beta User
- Legal review — mandatory reporting obligations (reflecting pool floor)
- Onboarding redesign — birthday, occupation sector, back button, question consolidation
- Codebase gender audit
- Female perspective dedicated session

---

## 7. Parked — Unchanged

- Share extension (dev phase)
- Notification layer (dev phase)
- Dad's birthday via pool → recurring calendar entry
- Manufacturer interval vs user preference
- Visual contrast and font size — UX debt
- Bucket list / annual goals
- Operator copy polish pass
- Onboarding copy audit
- `?dev=crisis` test mode
- OPP five-stage problem-solving architecture
- ATAK cross-domain conflict naming
- Team birthday signal migration

---

## 8. Rules and Guidance — Session 37 Entry

Add to revision log:

**Session 37:** `renderHotspots()` bug fixed — layer now cleared before rebuild, tap circles update immediately on mark-done. ATAK white ring removed — primary spot gets no default glow. Maintenance mark-done now calls `syncMaintenanceSignals()` not `dismissItem()` — derived items clear correctly. Vehicle edit recalculates `service_due` from oil date + interval. `next_service_km` field added to vehicle store. Mileage-based overdue detection added to `getUrgentItems()`. ATAK duplicate vehicle signal fixed — direct vehicle loop removed, calendar is authoritative. `saveVehicleField` now calls `syncVehicleSignals()` after every save. ISO date normalization added to `saveVehicleField` and `_syncVehicleSignals`. Vehicle service cascade shop/dealer routes now show "Find nearby" fallback when AI returns null details. Maintenance edit flow built — `_editingTaskId`, edit button, pre-filled intake. `datepicker.js` built and wired — every date field in the app draws from one component; local `buildDateField` removed from `cascade.js`. Architecture confirmed: ATAK reads calendar for time-based signals, derives urgency conditions inline for non-date checks — domains never read directly by ATAK except through the calendar contract.

---

## 9. Post-Session Checklist

- [ ] Save all output files locally
- [ ] Upload all to project
- [ ] Update Rules and Guidance — Session 37 entry
- [ ] Commit and push

---

## 10. Claude — Reading This at the Start of the Next Session

The app is stable and the Operator world is solid. Shawn's instinct at close of session was to start cross-world deployment — this is the right call and the right time.

**Before any cross-world build:** Run a dedicated thinking session. The questions to answer are: what does "deploy to another world" actually mean in code terms (world-specific hotspot maps, copy, image assets, tap calibration), what's the minimal delta between Operator and each other world, and what order to tackle them in. The World Voice Guide is the hard dependency for copy — read it before any world-specific language is written.

**cascade.js discipline:** This file is long and getting longer. Every session, confirm you are working from the most recent output file — download from the thread, not from disk. The audit pattern used this session (checking all expected strings before and after) is the correct approach. Use it.

**`datepicker.js` is the date field authority.** Any new date field added anywhere uses `buildDateField` from `datepicker.js`. No exceptions.

**Maintenance quick-add tiles** are queued and bounded — a clean first task if the next session starts with a build track.

---

*Your Life / Unlocked | Session 37 Final Handoff | June 6, 2026 | Confidential*
