# YOUR LIFE / UNLOCKED
## Session 20 — Post-Build Debug Handoff
*May 26, 2026 | Device Testing & Bug Fixes | Confidential*

---

## 1. Context

This debug session ran immediately after Session 20's primary build. Three bugs were reported from device testing, plus two additional improvements surfaced during conversation. All five are resolved.

---

## 2. Bugs Fixed

### Bug 1 — Cascade scroll broken in dev=shawn
**Symptom:** Content inside the vehicle detail cascade did not scroll at all on mobile. Rich Shawn data (full vehicle_facts, service history) made the content tall enough to expose the failure — sparse new-user data did not.

**Root cause:** The cascade `el` was mounted inside the home screen element (`position:absolute;inset:0;overflow:hidden`). iOS WebKit suppresses scroll on any child when an ancestor in the chain has `overflow:hidden`. No amount of `overflow-y:auto` on the cascade itself could overcome it.

**Fix:** All six `cascadePanel.open(el)` calls in `home.js` updated to mount at `document.getElementById('app')` instead. The cascade is now a full-viewport overlay on `#app`, outside the home screen's `overflow:hidden` chain. `|| el` fallback retained in case `#app` isn't found.

Additionally, the cascade's inner shell div was restructured as the true scroll container: `position:absolute;inset:0;height:100dvh;overflow-y:auto;-webkit-overflow-scrolling:touch`. `100dvh` gives iOS WebKit a concrete pixel height — unlike `min-height:100%` or `height:100%`, this reliably triggers native scroll behaviour including momentum.

**Files:** `cascade.js`, `home.js`

---

### Bug 2 — Cascade scroll bounces back / doesn't hold on new user
**Symptom:** Scroll moved but snapped back on release for a new user (no dev=shawn data).

**Root cause:** Same as Bug 1 — the mount point and scroll container structure. Resolved by the same fix.

**Files:** `cascade.js`, `home.js`

---

### Bug 3 — New user can't save vehicle / nothing appears after tapping Add Vehicle
**Symptom:** After completing the intake flow and tapping "Add vehicle" on the review step, nothing visibly changed. Vehicle did not appear in the brief.

**Root cause — AI call timing:** `fetchVehicleSchedule` was firing at `step_mileage` before oil service data had been entered. The AI returned with incomplete data (null `last_oil_date`, null `last_oil_mileage`) and occasionally produced a null or past `next_oil_change_date`. Moved the AI call to fire at the end of `step_service` when all oil data is known. User still has two steps (history + details) before review — enough time for the response to arrive.

**Root cause — onComplete silent failure:** The `onComplete` handler called `HOTSPOT_MAPS[world.id]` without a null guard on `world`. For a fresh-onboarded user, `world` could be undefined in the closure at that moment, causing the vehicles brief not to reopen after save. Added null guard (`world?.id`) and a fallback that searches all hotspot maps for the vehicles domain if the primary lookup returns nothing.

**Files:** `cascade.js`, `home.js`

---

## 3. Improvements Made

### Child intake — age and birthday consolidated
**Before:** Two sequential questions per child — "How old is [name]?" then "When is [name]'s birthday?"

**After:** Smart single-or-two-question flow:
- Birthday entered with year (e.g. `March 14 2019`) → age question skipped, computed downstream via `computeAge()`
- Birthday entered without year (e.g. `March 14`) → age question follows: "roughly how old are they?"
- Birthday skipped → age question follows: "How old is [name]?"

This handles the specific real-world case where a step-parent knows approximate ages but not exact birthdays. Age is stored when provided. `computeAge()` utility added to `home.js` derives age from a birthday string containing a four-digit year — used in display across the app with stored `age` as fallback for existing data.

**Files:** `team.js`, `home.js`, `cascade.js`

---

### Calendar component — hard requirement, parked until built
Date fields across the app (vehicle intake, domain details, onboarding) require a calendar picker. This is a hard requirement — date fields do not ship as text inputs. No date field is considered done until the calendar component exists. Current text inputs are a temporary placeholder only. The calendar component must be designed and built as a standalone piece before any date field is marked complete.

---

## 4. Files Changed This Session

| File | Changes |
|---|---|
| `cascade.js` | Outer `el` restructured — `overflow:hidden`, no flex. Inner shell div becomes scroll container with `height:100dvh`. AI call moved from `step_mileage` to `step_service`. Age display in person detail uses `computeAge` with stored age as fallback. |
| `home.js` | All six `cascadePanel.open(el)` → `cascadePanel.open(document.getElementById('app') \|\| el)`. `onComplete` null guard on `world?.id` with hotspot fallback. `computeAge()` utility added. Child age display updated to use computed age. |
| `team.js` | Child intake rebuilt — birthday first, age only asked if birthday has no year or was skipped. Store shape: `{ name, pronoun, birthday, age }` — both fields present, age null when not needed. |

---

## 5. Still Parked — Carried to Session 21

- **Dead buttons audit** — Session 21 first priority
- **Calendar component — hard requirement** — no date field ships as text input. Design before build. Applies to all date fields across domains.
- **User birthday in onboarding** — only if it unlocks meaningful intelligence
- All other parked items from Session 20 handoff remain unchanged

---

## 6. Session 21 Agenda — Unchanged

**Start:** Run the session check-in.

**Primary track:**
- Dead buttons audit — tap everything in built HCs, log what fires and what doesn't, wire the gaps
- Manufacturer interval vs user preference — flag divergence quietly in vehicle detail

**Secondary track (if time):**
- Health domain grab and go — first look
- Domain portability — how the vehicle system model carries into health and home

---

*Your Life / Unlocked | Session 20 Debug | Confidential Product Document*
