# YOUR LIFE / UNLOCKED
## Session 38 — Handoff
*June 7, 2026 | Bug Fix + Build Session | Confidential*

---

## 1. What This Session Was

A focused bug-fix and tightening session. No new architecture. The Operator world is now materially cleaner — duplicate signals are gone, appointment editing is real, and maintenance quick-add tiles give new users an immediate foothold. The app is ready to be used without frustration in the domains that are built.

Partner feedback (imagery too masculine, no female perspective) was received and logged. The readability problem was confirmed and tracked. Neither is a surprise — both are known debts that have a session assigned to them.

---

## 2. Bugs Fixed

### Bug 1 — ATAK duplicate signals (maintenance and health)
**Root cause — maintenance:** `atak.js` was reading `store.maintenance_tasks` directly in two places (urgent items and horizon scan) while `maintenance.js` was also writing the same data to `store.calendar`. Double entries. Additionally, `syncMaintenanceSignals()` was never called on boot — so calendar signals weren't reliably present, making the direct reads feel necessary.

**Root cause — health:** `seenSignalIds` guard was missing. The same calendar signal could appear in both "This Week" (via `buildTemporalSection`) and "This Month" or "On the Horizon" (via the `domain_signal` loops in `buildPrimaryBrief`).

**Fix:** Removed both direct `store.maintenance_tasks` reads from `atak.js`. Added `syncMaintenanceSignals` import and boot call to `main.js`. Added `seenSignalIds` Set to `buildPrimaryBrief` — after "This Week" processes, all domain signals in the 7-day window (including overdue) are marked seen and excluded from subsequent sections.

**Files:** `atak.js`, `main.js`

---

### Bug 2 — "Dentist — overdue is overdue" label
**Root cause:** Health signal titles include a `— overdue` suffix for display in the calendar domain. `buildTemporalSection` then appended `" is overdue"` to whatever title it received — producing the double label.

**Fix:** `_cleanTitle()` function strips `— overdue`, `— today`, and `— due today` suffixes from signal titles before `buildTemporalSection` composes its prose.

**Files:** `atak.js`

---

### Bug 3 — Stale health provider signals after date edit
**Root cause:** Provider IDs were generated with `Date.now()` on every health intake save. Each re-save produced a new ID. `syncHealthSignals` wrote a new signal with the new ID; the old signal — now orphaned — stayed in `store.calendar` permanently. Result: two signals for the same appointment showing different dates.

**Fix (two parts):**
1. `cascade.js` — health intake now preserves `_existing_id` for providers loaded from the store. On re-save, uses that ID instead of generating a new one. Provider signal IDs are now stable across re-saves.
2. `health.js` — `syncHealthSignals` opens with an orphan cleanup pass. Retires any provider calendar signal whose `domain_ref` no longer matches a current provider ID. Clears stale signals on next boot.

**Files:** `cascade.js`, `health.js`

---

## 3. Build — Reschedule Appointment

A lightweight edit path for any health appointment. Previously, changing a date required going through the full health intake — producing the signal corruption described in Bug 3.

**What was built:**
- Edit button added to each appointment line in the health brief (provider, annual physical, screening). Sits left of the date value, separate tap target from the main line.
- `reschedule_appointment` cascade renderer in `cascade.js` — date picker, confirm button. On confirm: writes new `next_due` to the correct store location (provider / primary care / screening), calls `syncHealthSignals()`. Clean in, clean out.
- `home.js` — `.health-edit-btn` click handler. Opens the reschedule cascade with the appointment's context. `e.stopPropagation()` prevents the row tap from also firing.

**Confirmed flow:** Calendar → tap overdue dental → health brief opens → edit button visible → tap edit → date picker → pick June 30 → confirm → ATAK shows "Dentist in 23 days." Full cycle confirmed working on device.

**Files:** `health.js`, `cascade.js`, `home.js`

---

## 4. Build — Maintenance Quick-Add Tiles

13 pre-loaded common recurring tasks. Tap a tile, task is added with a default interval, a toast confirms what was set. No intake required.

**Tiles and default intervals:**

| Task | Interval |
|---|---|
| Furnace / heat pump filter | Every 3 months |
| Range hood filter | Every 3 months |
| Smoke detector test | Every 6 months |
| CO detector test | Every 6 months |
| Dryer vent cleaning | Every 6 months |
| Water filter | Every 6 months |
| Gutter cleaning | Every 6 months |
| HVAC service | Annually |
| Fire extinguisher inspection | Annually |
| Weatherstripping check | Annually |
| Smoke / CO battery replacement | Annually |
| Lawn fertilizer | Every 3 months |
| Exterior faucet winterization | Annually |

**Architecture:** `QUICK_ADD_TILES` constant exported from `maintenance.js`. `getMaintenanceBrief()` returns `quick_add_tiles` filtered to exclude tasks whose label already exists in the store — no duplicates. `home.js` renders the tile grid and handles tap. Toast shows label and interval for 2.2 seconds then dismisses. Tile removes itself from view immediately on tap.

**Files:** `maintenance.js`, `home.js`

---

## 5. Files Changed This Session

| File | Changes |
|---|---|
| `atak.js` | Direct `store.maintenance_tasks` reads removed (both `getUrgentItems` and horizon scan). `seenSignalIds` Set added to `buildPrimaryBrief`. `_cleanTitle()` strips signal title suffixes before prose composition. |
| `main.js` | `syncMaintenanceSignals` imported and called on boot alongside `syncHealthSignals`. |
| `health.js` | Orphaned provider signal cleanup added to top of `syncHealthSignals`. Edit button added to appointment lines with `signal_type`. |
| `cascade.js` | Provider `_existing_id` preserved on intake load. Used on re-save instead of `Date.now()`. `reschedule_appointment` renderer built (resolve, buildRoute, complete). Registered in renderers map. `attachShellListeners` wires date picker and confirm for this type. `syncHealthSignals` added to health imports. |
| `home.js` | `QUICK_ADD_TILES` imported. Quick-add tile grid rendered in domain brief for maintenance. Quick-add tap handler with toast. `.health-edit-btn` handler added. |

---

## 6. Tracked — Not Fixed Today

These were raised, discussed, and deliberately parked. Each has a session assigned.

| Issue | Status |
|---|---|
| Readability — too dark, fonts too small | CSS pass — dedicated session |
| Female perspective in imagery | Dedicated session — urgent before wider beta |
| Gallery always opens on Operator | Parked — related to female perspective session |
| Reflecting pool question cadence | Thinking session required — conversation model rethink |
| "view →" inline with synthesized ATAK labels | Cosmetic — readability/polish session |
| Back button low contrast (nearly invisible) | Part of readability pass |

---

## 7. Parked — Unchanged

- Share extension (dev phase)
- Notification layer (dev phase)
- Dad's birthday via pool → recurring calendar entry
- Manufacturer interval vs user preference
- Bucket list / annual goals
- Operator copy polish pass
- Onboarding copy audit
- `?dev=crisis` test mode
- OPP five-stage problem-solving architecture
- ATAK cross-domain conflict naming
- Team birthday signal migration
- Onboarding redesign (birthday, occupation sector, back button, question consolidation)
- Legal review — mandatory reporting obligations (gate before beta)
- Codebase gender audit (before next beta user)

---

## 8. Rules and Guidance — Session 38 Entry

Add to revision log:

**Session 38:** Duplicate ATAK signals fixed — `store.maintenance_tasks` direct reads removed from `atak.js`; maintenance now surfaces exclusively via `store.calendar` (same pattern as vehicles, Session 37). `syncMaintenanceSignals` added to `main.js` boot. `seenSignalIds` Set added to `buildPrimaryBrief` — domain signals marked seen after "This Week" cannot surface again in "This Month" or "On the Horizon." `_cleanTitle()` strips signal suffixes before ATAK prose composition — "Dentist — overdue is overdue" resolved. Provider ID stability fixed — `_existing_id` preserved on health intake re-save; `Date.now()` regeneration eliminated. Orphaned provider signal cleanup added to `syncHealthSignals` boot pass. `reschedule_appointment` cascade built — lightweight date edit for any health appointment; writes to correct store location, calls `syncHealthSignals`. Appointment edit button added to health brief lines. Maintenance quick-add tiles built — 13 tasks, default intervals, toast confirmation, duplicate filtering via label match.

---

## 9. Post-Session Checklist

- [ ] Save all output files locally
- [ ] Upload all to project
- [ ] Update Rules and Guidance — Session 38 entry
- [ ] Commit and push

---

## 10. Session 39 Agenda

**This is the agenda. It is tight and focused. Start here.**

Session 39 is a single-track session: **readability**.

The interface is too dark. Text is too small. The back button is nearly invisible. These are not cosmetic complaints — they are usability failures that will stop real users from engaging with content that is otherwise working well. The female perspective session cannot happen until Shawn can actually read what he's looking at on behalf of someone else.

**What Session 39 does, in order:**

1. Audit the current CSS — identify every surface where contrast and font size fall short. Brief, cascade, intake steps, ATAK, onboarding. Make a list before touching anything.

2. Agree on the fix approach — does this mean lifting base opacity values globally, increasing font sizes at specific breakpoints, or both? Decide before writing a line of CSS.

3. Implement and test on device. Not on desktop. The problem was identified on mobile Safari. That is where it gets fixed.

4. Confirm the "view →" inline label issue is resolved as part of this pass.

5. Confirm back button is visible without hunting for it.

**What Session 39 does not do:** No new features. No domain work. No architecture. One problem, solved properly.

**Files likely touched:** The main CSS file or style injection in `main.js`, possibly `home.js` for brief-specific overrides, `cascade.js` for cascade content, `onboarding.js` for onboarding screens.

---

## 11. The Next Five Sessions — Where This Goes

This is a road map, not a contract. Sessions move at the speed of the work and what surfaces on device. But this is the intended shape.

---

### Session 39 — Readability Pass
*Single track. CSS. Mobile Safari. Done when Shawn can read everything comfortably on his phone.*

Fix the contrast and font size problems across all surfaces. Resolve the "view →" label issue. Make the back button findable. No new features.

---

### Session 40 — Female Perspective + Gallery Entry Point
*Thinking session first, then build.*

This session has two parts that belong together. The gallery always opening on Operator is not just a technical default — it is a framing decision that shapes the first impression every user gets. The female perspective in imagery is the same conversation: what does this product say before a word is read?

**Thinking track:**
- What does the gallery opening order actually communicate? Should it be randomised? Should it open on a world selected by the onboarding signal (occupation sector, situation)?
- What does a female perspective pass actually mean for each world? Imagery, copy, or both?
- Can imagery be addressed without a full regeneration session, or does it require one?

**Build track (if thinking is clear):**
- Gallery entry point logic — default world or randomised open
- Flag the imagery gap formally so it has a ticket, even if the fix is a future session

This session should include Shawn's partner's perspective if possible — she gave the feedback, she should be part of what the solution looks like.

---

### Session 41 — Onboarding Redesign
*Thinking session first, then build.*

Current onboarding was flagged as feeling extractive rather than generous — it asks before it gives. This session redesigns the first-time experience to feel like an invitation rather than an intake form.

**Scope:**
- Question consolidation — fewer questions, better questions
- Birthday capture — currently missing a proper path
- Occupation sector — needs to feel natural, not bureaucratic
- Back button UX — already exists but needs to be readable (done in Session 39) and feel intentional
- Reflecting pool invitation — how does the user first encounter the pool? This is the trust-building moment.
- Privacy architecture moment — when and how does the product make its privacy promise?

This session has a hard dependency on the Reflecting Pool Collection Principles document — read it before building anything. The onboarding is the first thing a real user experiences. It sets the trust tone for everything that follows.

---

### Session 42 — Cross-World Deployment, Part 1 (Thinking + Architecture)
*Thinking session only. No code.*

Operator is solid. Seven worlds exist as images and names. Nothing else is wired. This session maps the delta between Operator and everything else — not to build it, but to understand what "deploy to another world" actually means so Session 43 can move fast.

**Questions to answer:**
- What is the minimum a world needs to feel like itself? Hotspot map, tap calibration, world-specific copy in cascades and ATAK, background image. What else?
- What order do we tackle the seven remaining worlds? Which is closest to Operator in structure? Which is most different?
- What does the World Voice Guide require from each session? The guide is the authority — every piece of copy gets measured against it world by world.
- Do any worlds require new domain thinking, or do they all run on the existing eight domains?

The output of this session is a deployment spec for one or two worlds, ready to build in Session 43.

---

### Session 43 — Cross-World Deployment, Part 2 (Build)
*Build session. One or two worlds wired.*

Build from the spec produced in Session 42. At minimum: hotspot map, tap calibration, and a copy pass against the World Voice Guide for the first world tackled. The goal is one fully wired non-Operator world — a user who selects it should get the same functional experience as Operator, in that world's voice.

**Hard dependencies before this session:**
- Session 42 spec complete
- World Voice Guide re-read in full
- Readability pass complete (Session 39) — copy can't be finalised on a screen you can't read

---

### Horizon — Before Any New Beta User

These are gates, not optional polish. Nothing below goes past Shawn and his partner until each one is resolved.

- Legal review — mandatory reporting obligations (reflecting pool floor). Non-negotiable. Book this now.
- Codebase gender audit — hardcoded `she/her/his/he` across all files
- Female perspective pass — not just imagery, copy too
- Onboarding redesign complete
- Readability confirmed on device

---

## 12. Claude — Reading This at the Start of Session 39

The product is in good shape technically. The Operator world is stable, intelligent, and functional. The work now shifts toward the experience a real person has when they first encounter it.

Session 39 is not glamorous work. It is necessary work. The readability pass is what makes everything else visible. Do not let it expand into feature work. One problem. Solved properly.

Before Session 39 begins, read:
- This handoff
- The Rules and Guidance — Part 8 (UX Debt section)
- The World Voice Guide — specifically the governing principle about plain language

The instinct to add things is strong. Resist it. Session 39 ends when Shawn can read the app comfortably on his phone.

---

*Your Life / Unlocked | Session 38 Handoff | June 7, 2026 | Confidential*
