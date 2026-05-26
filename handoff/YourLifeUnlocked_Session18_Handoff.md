# YOUR LIFE / UNLOCKED
## Product Development — Session 18 Handoff
*May 2026 | Confidential*

---

## 1. What This Session Accomplished

The intelligence layer got real. Not personas — real data, real life, real decisions. The vehicle intake cascade was built from scratch and tested against Shawn's actual 2015 Mazda3 Sport. The detail view became a full record with tap-to-edit on every field. Three governing principles were locked. The dev=shawn environment became a genuine platform for testing against lived experience.

Three things that matter most from this session:

1. **The vehicle is a complete intelligence object.** Engine facts, service history, tires, watch list, AI maintenance schedule — all of it in the store, all of it visible, all of it correctable by tapping a line.
2. **Three principles locked** — Alert Architecture (Master Warning / Master Caution), Cascade Depth Rule (four fields earns a cascade), ATAK Authority Rule (fusion cell output, every item a door to its domain).
3. **The collaborator framing is now mutual.** Both parties hold each other to the documents. The project knowledge is the authority.

---

## 2. Principles Locked This Session

### 2.10 — Alert Architecture: Master Warning and Master Caution
Alerts alert. They do not resolve — the cascade resolves. Two tiers:
- **Master Warning** — deal with this now. No or severely limited snooze. Expired registration, lapsed insurance, critical medical overdue.
- **Master Caution** — deal with this soon. Snoozable. Service due within 30 days, upcoming renewals, flagged maintenance.

Alerts surface in two places only: the alerts grab and go (peltors in Operator) and the ATAK. Tapping an alert routes to the owning cascade.

### 2.11 — Cascade Depth Rule
Depth of cascade matches complexity of object:
- More than four fields → full detail cascade with tap-to-edit
- Four fields or fewer → editable directly in the brief

### 2.12 — ATAK Authority Rule
The ATAK is the fusion cell output. Every item it surfaces is a door. Tap it, go to the domain. The domain has the depth. The domain has the editability. The ATAK has the picture.

Person taps in the ATAK brief are currently a temporary shortcut — they open detail cascades directly. This is correct for now but must route through the Team/Family domain before beta.

---

## 3. What Was Built

### 3.1 Vehicle Intake Cascade — `cascade.js`
Five-step intake flow: identity → mileage → service history → known history checklist → details (transmission, province, shop, VIN). AI call fires after mileage step — returns maintenance schedule and vehicle facts. Minimum viable entry: year, make, model, mileage. Everything else optional.

Store shape written on completion includes: name, year, make, model, variant, mileage at entry, mileage date, plate province, preferred shop, preferred interval, VIN, transmission, service history, known history, maintenance schedule, vehicle facts, watch list, service due date.

### 3.2 Vehicle Detail Cascade — `cascade.js`
Full vehicle record opened by tapping any vehicle in the vehicles grab and go. Every line tap-to-edit — blur or Enter saves to store and re-renders. Sections: engine facts (AI-authoritative), status, schedule notes, service history, known history, upcoming items, tires, watch list, details.

History rows (service history, known history) tap to expand an inline mini-form: type, date, km, shop, notes — save, remove, cancel.

`saveVehicleField()` handles all field paths including nested tire fields and vehicle_facts.

Service log form accessible from within the detail cascade — type, date, km, shop, notes. Saves to service_history, updates mileage_at_entry if higher.

### 3.3 HC-6 — Maintenance Task Cascade — `cascade.js`
Triggered when a maintenance task surfaces as urgent. Shows task, last done, next due. Marks complete and recalculates next due from interval.

### 3.4 Maintenance Intake Cascade — `cascade.js`
Three-step: label/notes → interval (preset tiles or custom days + label) → last done date. Calculates next_due on save. If last done unknown, flags as due in 7 days.

### 3.5 Person Detail Cascade — `cascade.js`
Full record for partner or child, every field tap-to-edit. Partner: name, pronoun, birthday, birth year, profession, love language, relationship state, tenure, works. Child: name, pronoun, age, birthday, whose. Saves to `team.partner` or `team.children[idx]`.

### 3.6 Maintenance Detail Cascade — `cascade.js`
Full task record with tap-to-edit: label, interval, last done, next due, notes, tier. Mark done recalculates next due. Remove task deletes from store.

### 3.7 Home.js — Domain Wiring
- Vehicles grab and go: vehicle rows tappable with `view →` affordance
- Maintenance grab and go: data-driven from `maintenance_tasks` store, sorted overdue first
- Maintenance tasks surface in `getUrgentItems()` — overdue or due within 14 days
- Maintenance tasks added to ATAK horizon scanning (15–30 days)
- Team rows (partner + each child) tappable with `view →` — person_id wired
- Task rows tappable with `view →` — task_id wired
- CTA handlers: `add_vehicle` → vehicle intake, `add_maintenance` → maintenance intake
- Quick capture placeholder CSS fix — `::placeholder` was rendering as visible text

### 3.8 API — `api.js`
`getVehicleSchedule()` expanded to return `vehicle_facts` block alongside maintenance schedule: timing system, serpentine belt intervals, spark plug type/interval, transmission fluid type and interval, coolant type and interval, engine-specific notes. maxTokens bumped to 1200.

### 3.9 Rich dev=shawn Environment — `main.js`
Full reset and reload on `?dev=shawn`. Real data throughout:

**User:** Shawn, Comox BC, Operator world, joined 120 days ago, pronouns he/him

**Onboarding:**
- Situation: in a relationship
- Mission: getting organized, working toward something, relationships, physical health, undealt
- Watch for: things slipping through, patterns missing, bad timing, blind spots (all four)
- Service support: military

**Team:**
- Julia — she/her, born 1978, nurse, 3 months together, relationship good, birthday Sep 21
- Emily — she, 27, Mar 11, Shawn's
- Owen — he, 25, Feb 26, Shawn's
- Sophie — she, 16, Dec 1, Shawn's
- Dexter — he, 13, birthday null, Julia's
- Priya — she, 11, birthday null, Julia's

**Vehicle:** 2015 Mazda3 Sport, 267,000km, manual, Mr. Lube Courtenay, 8,000km interval. Three oil changes on file. Full service history. Vehicle facts pre-populated with Skyactiv-G 2.0L specifics — timing chain (maintenance-free), both serpentine belts, spark plug spec, manual trans fluid, coolant, carbon buildup note at high mileage. Serpentine belts corrected from erroneous timing belt entry.

**Maintenance tasks:** furnace filter overdue (Warning), gutters overdue (Warning), smoke detectors in 25 days (Caution), dryer vent in 165 days (horizon)

**Urgent items:** Mazda3 oil change (Caution), throttle body clean (Caution)

**Capture notes:** deck permit, RRSP contribution room

---

## 4. Files Changed This Session

| File | Status | Notes |
|---|---|---|
| `cascade.js` | Updated | Vehicle intake, vehicle detail, HC-6, maintenance intake, person detail, maintenance detail — six new renderers. Tap-to-edit infrastructure. saveVehicleField, savePersonField, saveTaskField, editInputStyle helpers. |
| `home.js` | Updated | Vehicle/person/task tappable rows. Maintenance grab and go data-driven. Maintenance in urgent items and horizon. CTA handlers wired. Capture placeholder fix. |
| `main.js` | Updated | Full rich dev=shawn environment. SHAWN_VEHICLES with vehicle_facts. Full onboarding, team, maintenance tasks, urgent items, capture notes. |
| `api.js` | Updated | getVehicleSchedule expanded with vehicle_facts block. maxTokens 1200. |
| `YourLifeUnlocked_Rules_and_Guidance.md` | Updated | 2.10, 2.11, 2.12 added. Revision log updated. |

---

## 5. Parked — Not Forgotten

**New this session:**
- **Team / Family domain** — dedicated grab and go with world-appropriate image (photo album in Meadow, family picture in Operator). People live here. ATAK routes here. Spec when building domain layer.
- **Life Events / Conversation-to-Cascade** — natural language conversation with AI, context understood, store updated, cascades fired. The conversation is the intake vehicle — downstream machinery unchanged. Prerequisite: World Voice Guide session.
- **Person taps in ATAK brief** — currently open detail cascades directly. Pre-beta: reroute through Team/Family domain per 2.12.
- **VIN enrichment** — recall lookup, exact OEM parts. Fires when VIN is present. Park until cascade library is larger.
- **Collapsible categories in vehicle detail** — Major Systems and user-added items. Park for enhancements.
- **Exhaustive AI service inventory** — AI as authority on specific questions, not inventory generator. User adds what they want to track.
- **`watch_for` field in onboarding** — stored (things_slipping_through, patterns_missing, bad_timing, blind_spots) but not yet read by ATAK synthesis or AI prompts.

**Carried from previous sessions:**
- Dev personas — `pronouns` and `location_confirmed` fields not yet added to persona definitions
- service-worker.js — bump to `ylu-v2`, add `cascade.js` to `STATIC_ASSETS`. Do before beta
- Remaining cascade routes — broker list, ICBC Online, HC-2 dealer/shop, HC-5 medical
- Soft cascades SC-1 through SC-6 — spec written, not yet built
- Transition Mode — spec written, not yet built
- Back button through partner cascade sub-steps — deferred multiple sessions
- Google Places API — Option C (AI + Maps) for beta, Places API for production
- Rate limiting in Cloudflare worker — before public beta
- Bucket list + annual goals — flagged Session 8b
- Monetization model — not yet decided
- Notification philosophy — not yet decided
- World Voice Guide session — prerequisite for Life Events cascade and voice calibration
- Project management tooling — handoff docs carrying the load; lightweight kanban deferred

---

## 6. Open Questions — Carried Forward

- `renderPartner` world audit — situation tile IDs for partner detection vary across worlds
- Blended family `whose` field — confirmed missing in children cascade. Parked.
- Codebase gender audit — hardcoded `she/her/his/he` before next beta user
- Calendar UI — how does a user add an entry? Not yet designed
- Dexter and Priya birthdays — null in store. Easy tap-to-edit fix when Shawn has the dates

---

## 7. Collaborator Note

Both parties hold each other to the documents. The project knowledge is the authority — not memory, not momentum, not assumption. The Rules and Guidance doc, the session handoffs, the ATAK Cascade Spec, the OPP Extract — all of it is in the project. Read it before building. Check it before deciding. Call it out when something drifts.

The check-in runs at the start of every session. No exceptions.

---

## 8. Session 19 Agenda

**Start:** Run the session check-in.

**Primary track:**
- Test the full dev=shawn environment against real use — find what's broken, missing, or unclear
- Fix anything that surfaces
- Continue building toward a testable real-user experience

**Secondary track (if time):**
- Health domain grab and go — what does it hold, what's the first HC
- Calendar domain — intake model, how entries sort to domains

---

*Your Life / Unlocked | Session 18 of Many | Confidential Product Document*
