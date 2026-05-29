# YOUR LIFE / UNLOCKED
## Session 20 — Complete Debug & Extended Build Handoff
*May 26–28, 2026 | Post-Build Device Testing, Bug Fixes, and Extended Build | Confidential*

---

## 1. Context

Session 20 primary build happened first — vehicle intake, major systems model, delete/edit, API date fix, dev=shawn save guard. That work is documented in the Session 20 primary handoff.

This document covers everything that followed: device testing on mobile, three rounds of bug fixes, extended build work on the vehicle intelligence layer, and new process rules established during the session. The session stayed open across multiple days per the new rule: a session does not close until its features are confirmed working on device or bugs are explicitly parked.

---

## 2. New Process Rules Established This Session

**Session stays open until confirmed.** A session does not close and a new session number does not open until all features built in that session are confirmed working on device — or outstanding bugs are explicitly parked with a reason. This rule was established mid-session when bugs from the primary build required multiple debug rounds.

**Post-session checklist.** Every handoff now ends with a checklist:
- Save files locally
- Upload handoff to project
- Commit and push code changes

This was added after the Session 20 debug handoff was written but not uploaded to the project — the checklist prevents that from happening again.

**File version discipline.** Multiple iterations of scroll fixes failed because uploaded files were pre-fix versions. Rule: always download from thread outputs. Never re-upload what's on disk unless it was explicitly downloaded from the thread in the same session.

---

## 3. Bugs Fixed — Full Log

### Bug 1 — Cascade scroll broken on mobile (dev=shawn and new user)

**Symptom:** Content inside the vehicle detail cascade did not scroll on mobile. Rich Shawn data made the failure visible. New user scroll bounced back on release.

**Root cause:** The cascade `el` was mounted as a child of the home screen element (`position:absolute;inset:0;overflow:hidden`). iOS WebKit suppresses scroll on any child when an ancestor has `overflow:hidden`. CSS fixes on the cascade itself were ineffective because the constraint was in the parent chain, not the element.

**Three fix attempts before resolution:**
1. Added `height:100%` to cascade `el` — insufficient, iOS still suppressed scroll
2. Added `height:100dvh` to inner shell div with `overflow-y:auto` — worked in onboarding (different mount point) but not in vehicle intake
3. **Final fix:** Moved all six `cascadePanel.open(el)` calls in `home.js` to mount at `document.getElementById('app') || el` instead. Cascade becomes a full-viewport overlay on `#app`, outside the home screen's `overflow:hidden` chain. Inner shell div uses `position:absolute;inset:0;height:100dvh;overflow-y:auto;-webkit-overflow-scrolling:touch`. `100dvh` gives iOS a concrete pixel height. This worked.

**Files:** `cascade.js`, `home.js`

---

### Bug 2 — Scroll jump on tile tap in vehicle intake service history step

**Symptom:** Tapping a system tile or toggling a system section caused the page to jump — the selected tile snapped toward the bottom of the screen and the user had to scroll back down.

**Root cause:** `render('intake')` replaces `el.innerHTML` entirely. Browser resets scroll position to 0. The system panel re-renders open (state preserved) but scroll position is lost.

**Fix:** Added `id="cascade-scroll"` to the inner shell div. `render()` now saves `scrollEl.scrollTop` before replacing innerHTML and restores it after. One change in the render function covers all tile taps, system toggles, and custom item additions.

**Files:** `cascade.js`

---

### Bug 3 — New user can't save vehicle / nothing appears after Add Vehicle

**Root cause — AI call timing:** `fetchVehicleSchedule` was firing at `step_mileage` before oil date and mileage were entered. AI returned incomplete data. Moved call to fire at end of `step_service` when `last_oil_date`, `last_oil_mileage`, and `interval_km` are all known. User still has two steps before review — enough time for the response.

**Root cause — onComplete silent failure:** `HOTSPOT_MAPS[world.id]` called without null guard on `world`. For fresh-onboarded users, `world` was undefined in the closure at that moment, so the vehicles brief didn't reopen after save — making it appear nothing happened. Added `world?.id` null guard and a fallback that searches all hotspot maps for the vehicles domain.

**Files:** `cascade.js`, `home.js`

---

### Bug 4 — Oil change date and mileage not persisting through edit

**Root cause:** `complete()` for both new and edit mode never wrote `last_oil_date` or `last_oil_mileage` to the vehicle record. They were used to call the AI and then discarded. On edit, pre-fill tried to read `vehicle.last_oil_change_date` and `vehicle.last_oil_change_km` — fields that don't exist.

**Fix:** `last_oil_date` and `last_oil_mileage` now written to the vehicle record in both new and edit mode `complete()`. Pre-fill reads from the correct field names (`vehicle.last_oil_date`, `vehicle.last_oil_mileage`).

**Files:** `cascade.js`

---

### Bug 5 — Vehicle facts drifting on each edit

**Symptom:** Transmission showing as automatic for a manual vehicle. Belt count dropping from 2 to 1. Spark plug gap drifting. Coolant spec suspect. Facts were accurate on first pull, degraded with each edit.

**Root cause:** Edit mode's `complete()` was overwriting `vehicle_facts` with a fresh AI response on every save. Each edit replaced confirmed data with a new non-deterministic response.

**Fix:** Reversed the precedence. Edit mode now uses `vehicles[idx].vehicle_facts` first — existing confirmed data is never overwritten. Only falls back to the fresh AI response if nothing exists yet.

**Files:** `cascade.js`

---

### Bug 6 — Transmission showing automatic for manual vehicle despite VIN

**Root cause:** VIN was stored on the vehicle but never passed to the AI prompt. The user's explicit transmission selection was also never sent to the prompt. AI pattern-matched on "Mazda3" and returned the most common configuration (automatic).

**Fix:**
- VIN now passed as first-class parameter and included in the prompt as primary identifier
- `transmission` parameter added — when present, the prompt states it is authoritative and instructs the AI not to infer or override it from the VIN or model defaults. Constrains type, fluid spec, service intervals, and upcoming items. Covers modified vehicles.

**Files:** `api.js`, `cascade.js`

---

### Bug 7 — Refresh facts returning "no data" immediately

**Root cause:** Refresh handler gated on `schedule?.vehicle_facts` being non-null. The prompt was returning null for vehicle_facts while still returning a valid schedule object. Handler discarded the whole response.

**Fix:** Handler now writes through whenever `schedule` is non-null — preserving existing `vehicle_facts` if the fresh call returns null for that field, but still updating `maintenance_schedule` and `service_due`. Added `console.log` of raw response for debugging.

**Files:** `cascade.js`

---

### Bug 8 — "Other options" button appearing dead at bottom of vehicle detail

**Root cause:** Button renders in `buildShell` whenever `hasRoute` is true — which includes vehicle detail. Intended for multi-route cascades only. Vehicle detail has one route so button was always dead.

**Fix:** Button now hidden when cascade type is `vehicle_detail`, `person_detail`, or `vehicle_intake`.

**Files:** `cascade.js`

---

### Bug 9 — Service history sort failing for undated items

**Symptom:** Custom items added during intake had null dates and sorted to 1970 — `new Date(null)` produces epoch.

**Fix:** Sort now handles null dates explicitly — items with no date sort after all dated entries, preserving their relative order.

**Files:** `cascade.js`

---

## 4. Extended Build Work

### API Prompt — Full Rebuild

The `getVehicleSchedule` prompt was rebuilt from scratch across multiple iterations. Final state:

- System prompt with explicit accuracy rules — return best confirmed knowledge, null only for genuinely conflicting or missing data
- VIN as first-class parameter and primary identifier in the prompt
- Transmission as authoritative parameter — constrains all transmission output, covers modified vehicles
- Today's date injected at call time — all date calculations forward from real current date
- Service history passed as readable summary — AI uses it to inform upcoming_items and notes. Custom repairs and modifications visible to the intelligence layer.
- `serpentine_belt` field asks for ALL drive belts by name with individual intervals — addresses the 2-belt SKYACTIV-G case (serpentine + AC compressor belt)
- `transmission_type` added as a new vehicle_facts field
- Model upgraded to `MODEL_RICH` (Opus) for vehicle schedule calls

### Refresh Vehicle Facts Button

Added to vehicle detail header alongside Edit and Delete. Amber hover. Re-fetches vehicle facts using the full current prompt with VIN, transmission, and service history. Necessary because the lock-on-first-pull fix protects correct data going forward but doesn't fix already-wrong data in existing vehicles.

### Service History Into the AI

Custom repairs and + other entries from the intake flow are now passed to the AI prompt as a readable history summary. The ignition coil wiring repair example — previously stored but invisible to the intelligence layer — now informs upcoming items and notes. Whatever the user captures is intelligently considered.

### Suspension, Wheels & Tires — Tile System Expanded

Renamed from "Wheels & Tires". Added: Alignment, Front struts, Rear struts, Sway bar links, CV axle / boot.

### Child Intake — Age and Birthday Consolidated

Smart flow in `team.js`:
- Birthday with year → age skipped, computed downstream
- Birthday without year → age question follows
- Birthday skipped → age question follows

Handles the case where a step-parent knows approximate ages but not exact birthdays. `computeAge()` utility added to `home.js`. Both fields stored.

### Calendar Component — Hard Requirement Locked

Date fields do not ship as text inputs. Calendar component must be designed and built as a standalone piece before any date field is marked done. Hard requirement, not a nice-to-have.

---

## 5. Vehicle Domain — State at Session Close

Tested hard across multiple rounds of real use — multiple vehicles added, deleted, re-added, edited.

**Confirmed working on device:**
- Add vehicle — all five steps, review, save ✓
- Back button steps backward through intake ✓
- Edit vehicle — pre-populated, updates existing record ✓
- Delete vehicle — confirm step, removes from store ✓
- Oil date and mileage persist through edit ✓
- Scroll on mobile ✓
- Scroll position preserved on tile tap ✓
- Service history renders including custom items ✓
- Transmission correctly identified and locked ✓
- Refresh facts button working ✓
- Vehicle facts locked after first confirmed pull ✓
- Service history passed to AI ✓

**Known limitation:** CX-70 3.3T mild hybrid Signature facts did not populate — knowledge gap on a newer/specific model. Workaround: simplify variant or use VIN. Long-term: VIN decode API.

**This domain serves as the reference implementation.** Every pattern established here — data collection, AI fact structure and locking, prompt constraints, user input overriding AI inference — carries forward to every other domain.

---

## 6. Files Changed — Complete Session

| File | Key Changes |
|---|---|
| `cascade.js` | Scroll fix (mount point + 100dvh inner div + scroll position preserved). AI call moved to step_service. Oil date/mileage written to store and pre-filled on edit. vehicle_facts lock on edit. VIN and transmission passed to AI. Service history passed through fetchVehicleSchedule and refresh handler. Refresh facts button wired. Other options button hidden on detail/intake. Service history sort null-safe. Suspension, Wheels & Tires expanded. |
| `api.js` | Full prompt rebuild — VIN, transmission authority, service_history context, all-drive-belts instruction, transmission_type field, MODEL_RICH, forward-only date calculation, 1,500 km/month default. |
| `home.js` | All six cascadePanel.open() mount at #app. onComplete null guard with hotspot fallback. computeAge() utility. Child age display uses computed age. |
| `main.js` | dev_shawn_loaded flag — reset fires once on first load only. |
| `team.js` | Child intake rebuilt — smart birthday + age flow. |

---

## 7. Parked — Not Forgotten

**Session 21 first priority:**
- Dead buttons audit — tap everything in built HCs, log what fires and what doesn't, wire the gaps

**Hard requirements:**
- Calendar component — no date field ships as text input. Design before build.

**Carried forward:**
- Manufacturer interval vs user preference — flag divergence quietly in vehicle detail
- VIN as prominent intake field — currently step 5 optional, elevate for used vehicles
- CX-70 engine facts gap — simplify variant or wait for VIN enrichment
- VIN enrichment via decode API — authoritative specs, recall lookup, OEM parts
- Health domain grab and go — first look deferred multiple sessions
- Domain portability — how vehicle system model carries into health and home
- Team / Family domain — dedicated grab and go
- User birthday in onboarding — only if it unlocks meaningful intelligence
- service-worker.js — bump cache version before beta
- All other items from Session 19 parked list

---

## 8. Session 21 Agenda

**Start:** Run the session check-in.

**Primary track:**
- Dead buttons audit — first priority
- Manufacturer interval vs user preference — quiet flag in vehicle detail

**Secondary track (if time):**
- Health domain grab and go — first look
- Domain portability confirmation

---

## Post-Session Checklist
- [ ] Save `cascade.js`, `api.js`, `home.js`, `main.js`, `team.js` locally
- [ ] Upload this handoff to project
- [ ] Commit and push all code changes

---

*Your Life / Unlocked | Session 20 Complete Debug & Extended Build | May 26–28, 2026 | Confidential*
