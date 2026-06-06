# YOUR LIFE / UNLOCKED
## Session 36 — Debug Handoff
*June 6, 2026 | Bug Fix Session | Confidential*

---

## 1. What This Session Was

A dedicated debug pass following the shape.js build session. Six bugs identified by Shawn from device testing. All six resolved. Significant scope additions emerged naturally during the fixes — all shipped.

---

## 2. Bugs Fixed

### Bug 1 — Recurring Calendar Events Not Working
**Root cause:** The recurring toggle stored `recurring: true` but `recurring_frequency` was never set — no frequency selector existed. And even if it had been set, `getEntriesForDay` had no logic to expand recurring entries onto matching dates.

**Fix:**
- `isRecurringOccurrence(entry, dateStr)` — new function. Reads `recurring_frequency` and checks whether the target date matches the pattern from the origin date.
- `getEntriesForDay` — now calls `isRecurringOccurrence` for any entry with `recurring: true` and a frequency set.
- Frequency selector added to the entry form — toggle reveals five buttons: Daily, Weekly, Biweekly, Monthly, Annually. Discussion held on Weekdays — excluded. Daily covers medication; Biweekly covers therapy and pay cycles; Weekdays adds rendering complexity for a pattern the app shouldn't be tracking.
- Save payloads updated to include `recurring_frequency`.

**Files:** `calendar.js`

---

### Bug 2 — Birthday Not in Onboarding
**Decision:** Held for onboarding redesign session. Birthday field exists in `store.user.birthday` and is accessible via the profile editor (Bug 5) and via the reflecting pool (Bug 3). Onboarding redesign will add it to the intake flow properly.

---

### Bug 3 — Birthday from Pool Not Writing to Store
**Root cause:** `store.user` had no `birthday` field. The extraction prompts had no field path reference table — the AI was collecting correctly but guessing where things landed, and with no `birthday` key in the store, the write was either going to the wrong path or silently dropping.

**Fix:**
- `birthday: null` added to `store.user` defaults.
- Both extraction prompts (`extractFactualCorrections` per-exchange and `processPoolSession` full session) now include a field path reference table. Explicit paths for: birthday → `user.birthday` (ISO format, full date required), CAF member → `military.caf_member`, occupation sector → `onboarding.occupation_sector`, and other common facts.
- Birthday rule: full date required — month and day alone is insufficient, no extraction.

**Files:** `store.js`, `shape.js`

---

### Bug 4 — Calendar Items Not Selectable to Edit
**Root cause:** User entry rows only had a "remove" button. No edit path existed. `updateUserEntry` didn't exist.

**Fix:**
- `updateUserEntry(entryId, updates)` — new exported function. Maps over calendar array, replaces matching entry, adds `updated_at` timestamp.
- `editingEntry` state variable added alongside `addingEntry`.
- `buildEntryForm(dateStr, existingEntry = null)` — now accepts optional existing entry. All fields pre-populate: title, date range, end date, time start/end, notes, recurring toggle and frequency.
- Form heading changes from "Add to [date]" to "Edit entry" when editing.
- Save calls `updateUserEntry` when editing, `addUserEntry` when adding.
- Each user entry row now shows "edit" and "remove" side by side.
- `_buildFormField` updated to accept and set a `value` param.

**Additional improvements during this fix:**
- End date text input replaced with inline mini calendar picker. Tap a day, done. Days before start date are non-tappable. Pre-populates from `existingEntry.date_end` when editing.
- Remove button now requires confirmation — first tap shows "sure?", second tap deletes, auto-resets after 3 seconds.
- Save explicitly calls `render()` — form collapses immediately rather than waiting for store subscription.
- Notes displayed inline in day view without needing to open edit.
- Recurring badge (`↻ weekly`) shown on recurring entries in day view.

**Files:** `calendar.js`

---

### Bug 5 — No In-App Profile Editor
**Decision:** Dedicated editor screen accessible from ATAK. Profile-level fields only — name, pronouns, country, province, birthday, occupation sector, partner name, children. Vehicles and health have their own edit paths. Situation and mission held for onboarding redesign.

**Fix:**
- `profileeditor.js` — new standalone module. Opens full screen. Loads current store values into a draft object. Nothing writes until Save. Two sections: About you, Your team.
- Fields: name (text), pronouns (tile), country (tile), province/state (text, conditional on country), birthday (text with auto-format), occupation sector (tile), partner name (text), children (name + age rows, add/remove).
- Save writes to `store.user`, `store.onboarding`, and `store.team` in one pass.
- Cancel discards all changes.
- ATAK entry point — "Profile" section at the bottom of the brief with "Edit profile" button. Section heading shows user's name when set.
- `buildSectionHTML` in `home.js` updated to respect `custom_html` on items — was previously ignoring it in the primary brief renderer.
- Birthday field is a text input for now. Will upgrade to the shared date picker component (`datepicker.js`) once that module is extracted.

**Files:** `profileeditor.js`, `atak.js`, `home.js`

---

### Bug 6 — Reflecting Pool Back Button / User Trapped
**Root cause:** PWA standalone mode — the reflecting pool panel fills `inset: 0` (top: 0) which starts behind the iPhone status bar / dynamic island. `env(safe-area-inset-top)` was applied to the header padding but the panel container itself started at the top of the screen, so the background extended behind the status bar and the header was invisible and untappable.

**Fix:**
- `padding-top: var(--safe-top)` applied to the outermost `#rp-panel` div rather than the header padding. Pushes all content — header, conversation, input — below the status bar.
- Bottom safe area (`max(28px, env(safe-area-inset-bottom))`) applied to input area.
- Close button opacity bumped from 0.25 to 0.45.

**Note:** `viewport-fit=cover` and `apple-mobile-web-app-status-bar-style: black-translucent` were already correctly set in `index.html`. The fix was in the panel layout, not the HTML.

**Files:** `reflectingpool.js`

---

## 3. Scope Additions — Shipped This Session

These weren't in the original bug list but emerged naturally and were completed.

**Calendar jump picker — decade accordion**
Tapping the month/year label ("June 2026") opens a full-screen jump picker. Month grid (4 columns) at top. Decade accordion below — tap a decade to expand its year grid, tap a year to select. Current decade open by default, current year highlighted. Go button jumps directly. Cancel returns without change. Getting to 1985 is four taps from anywhere.

**Date picker design rule locked**
All date fields across the app must use the shared picker component. No date field ships as a text input. `datepicker.js` extraction is a queued build task — to be done before the next domain that needs a date field is built. Current places that need it: health appointment dates, vehicle expiry dates, cascade forms, profile editor birthday.

**CAF / medical cascade fix**
`health.medical.special_notes` — free-text field in the medical cascade UI. Saves on blur. Persists in store. Read by cascade and passed to the API as "Special notes from patient." The cascade now reads CAF status, coverage type, primary facility, and occupation sector from the store and passes all of it to the API. CAF member flag suppresses provincial health card output in the system prompt as a hard constraint.

**Medical signal window widened**
Appointment signals (primary care, providers) now write to `store.calendar` for dates up to 365 days out, not 30. A known upcoming appointment always appears on the calendar. Screenings remain at 30 days — they're due-date nudges, not known appointments.

**`pc_next_due` recalculation fixed**
Editing last visit date now correctly recalculates next due date. Previously the stale stored `next_due` took priority via `||`, so correcting a last seen date had no effect on the overdue signal.

**`syncHealthSignals` on boot**
Now called in `boot()` alongside `initShape()`. Health signals sync on every app load — the calendar reflects current health data without requiring the user to re-save anything.

**Occupation sector / country-aware intelligence — design principle locked**
`occupation_sector` is a category, not a full profile. What it means varies by country. A Canadian CAF member and a US military member have completely different healthcare systems, benefit structures, and terminology. The governing rule: **occupation sector + country + province/state is the full context. The AI reads all three before producing any occupation-aware output. No single-country assumptions baked into prompts.** This applies to medical cascade, SHAPE extraction, and any future financial/benefit signals. `military.caf_member: true` is a CAF-specific field — US equivalent would be `military.branch` or `military.country_force`. Downstream inference must be country-derived, not assumed.

---

## 4. Files Changed This Session

| File | Changes |
|---|---|
| `calendar.js` | Recurring expansion, frequency selector, edit flow, mini date picker, remove confirmation, jump picker, notes in day view |
| `reflectingpool.js` | Safe area fix — panel container padding |
| `profileeditor.js` | New file — full profile editor |
| `atak.js` | Profile section added to brief, `user` scope fix |
| `home.js` | `custom_html` fix in `buildSectionHTML`, `openProfileEditor` wired |
| `shape.js` | Field path reference table in both extraction prompts |
| `store.js` | `birthday` added to `store.user` |
| `health.js` | Appointment signal window widened to 365 days |
| `cascade.js` | `pc_next_due` always recomputed from `last_seen` |
| `main.js` | `syncHealthSignals` called on boot |

---

## 5. Queued — Not Yet Built

**`datepicker.js`** — extract the jump picker into a shared component. All date fields in the app import from it. Priority: before the next domain that needs a date field is built.

**Occupation-aware cascade output** — country + occupation sector + province read together before any occupation-specific language is generated. US military sees TRICARE, not CAF. Build when health cascade or financial signals are next touched.

**Dad's birthday → calendar** — pool should be able to extract "my dad's birthday is June 26th" and write it as an annually recurring calendar entry for a team member, not just a personal fact. SHAPE currently routes facts to store fields; this requires routing to `store.calendar` as a recurring event. Queued.

**Profile editor birthday → date picker** — currently a text field with auto-format. Upgrades to the shared picker component once `datepicker.js` is extracted.

---

## 6. Build Queue (Carried Forward)

### Immediate
- Full debug run — Shawn continues testing on device over coming weeks

### Following
- `datepicker.js` extraction — shared component, all date fields
- Health domain depth — appointment marking UI, screening completion
- ATAK cross-domain conflict naming
- Sanctuary system prompt — `getSanctuaryHandoff()` is the interface
- Profile editor birthday → date picker upgrade

### Before Any New Beta User
- Legal review — mandatory reporting obligations (reflecting pool floor)
- Onboarding redesign — includes birthday, occupation sector question, back button, question consolidation
- Codebase gender audit
- Female perspective dedicated session

---

## 7. Parked — Unchanged

- Share extension (dev phase)
- Notification layer (dev phase)
- Recurring events for team birthdays — dad's birthday via pool (partially scoped above)
- Back button improvement — needs polish
- Manufacturer interval vs user preference
- Visual contrast and font size — UX debt
- Bucket list / annual goals
- Operator copy polish pass
- Onboarding copy audit
- `?dev=crisis` test mode
- OPP five-stage problem-solving architecture

---

## 8. Rules and Guidance — Session 36 Debug Entry

Add to revision log:

**Session 36 Debug:**
Six bugs fixed. Recurring calendar built end to end — five frequencies (daily, weekly, biweekly, monthly, annually), weekdays excluded by design. Calendar edit flow built — `updateUserEntry`, pre-populated form, inline notes display. Mini calendar picker replaces text input for end date. Jump picker built — decade accordion, month grid, Go button. Remove confirmation (sure?) added. Profile editor built (`profileeditor.js`) — ATAK entry point, draft state, save/cancel, team editing. Safe area fix for reflecting pool in PWA mode — `padding-top: var(--safe-top)` on panel container. `buildSectionHTML` fixed to respect `custom_html` on items. Medical appointment signal window widened to 365 days. `pc_next_due` recalculation fixed. `syncHealthSignals` on boot. Birthday field path added to SHAPE extraction prompts. Design rule locked: no date field ships as text input — `datepicker.js` extraction queued. Design rule locked: occupation sector + country + province = full context for occupation-aware output — no single-country assumptions in prompts.

---

## 9. Post-Session Checklist

- [ ] Save all output files locally
- [ ] Upload all to project
- [ ] Update Rules and Guidance — Session 36 Debug entry
- [ ] Commit and push

---

## 10. Claude — Reading This at the Start of the Next Session

The app is in active device testing. Shawn is running a rolling debug pass over the coming weeks. Sessions will likely be a mix of bug fixes and feature builds — check in at the start of each session for what's been found.

The most important queued build is `datepicker.js`. Every domain that needs a date field is blocked on it. Build it before touching any domain that needs a date input.

The occupation-aware output principle is locked but not yet implemented in code. When the health cascade or any other domain prompt is next touched, add country + occupation sector + province to the context and derive the correct system from that combination. Never assume CAF, TRICARE, NHS, or any other specific system without reading all three fields first.

The Sanctuary system prompt is the next major writing task on the horizon. `getSanctuaryHandoff()` is the interface. Read the Sanctuary Prompt Brief and the SHAPE Definition Document before that session opens.

---

*Your Life / Unlocked | Session 36 Debug Handoff | June 6, 2026 | Confidential*
