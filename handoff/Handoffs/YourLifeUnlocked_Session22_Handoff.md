# YOUR LIFE / UNLOCKED
## Product Development — Session 22 Handoff
*May 28, 2026 | Build + Thinking Session | Confidential*

---

## 1. What This Session Was

A mixed session — build first, thinking second. Three code changes shipped. One architectural principle locked. The health domain found its shape.

The build work was focused and productive. The thinking work produced the most significant architectural expansion since the ATAK was defined. The Domain Cluster Principle changes how every future domain gets designed.

---

## 2. Code Shipped This Session

### cascade.js — Three Changes

**Calendar picker — app-wide.**
Every date input field now has a calendar picker alongside the text input. A reusable `buildDateField()` function handles the pattern. The picker renders an inline month grid with prev/next navigation, highlights today and the selected date, and writes an ISO value to a hidden input that all save handlers read. Text entry still works — typing and blurring parses and syncs the value. Both paths write to the same stored ISO value.

Date fields converted: vehicle intake step 3 (last oil date), log service date, maintenance intake last done, and the inline tap-to-edit date fields in vehicle detail and maintenance detail.

The Date Input Rule is now locked in the Rules and Guidance doc as 2.4b. No date field ships as text-only going forward.

**Vehicle detail text size.**
All value text in editable and readonly lines bumped from 13px to 15px. Applies to vehicle detail, person detail, maintenance detail, and task detail. Font size only — no restructure.

**Back button in team.js — partner and children cascades.**
Both cascades converted from async waterfalls to step-indexed state machines — same architecture as vehicle intake. Back steps one screen at a time within each cascade. Previous text input values are restored when stepping back. Back is hidden on the first step of each cascade (partner name, "Any children?") — nowhere further back to go within the cascade. Top-level back handles everything above that level.

The children cascade additionally handles backing across child boundaries — stepping back from the first question of a second child removes the second child's draft, pops the first child out of `teamData`, and returns to the first child's confirm screen.

### Files changed this session
| File | Changes |
|---|---|
| `cascade.js` | Calendar picker (`buildDateField`, `attachCalendarListeners`). Calendar CSS injected via `injectCascadeKeyframes`. All date fields converted. Font sizes bumped in `buildEditableLine`, `buildReadonlyLine`, `buildPersonEditableLine`, `buildTaskEditableLine`. Log service date field rebuilt. History edit form date field converted to text. |
| `team.js` | `runPartnerCascade` rewritten as step-indexed state machine. `runChildrenCascade` rewritten as step-indexed state machine. Back button added to scaffold. `updateBackButton()` function added. `stepHistory` stack added for top-level back. `subStepBack` signal for cascade-level back. `inputCard` updated to support `prevalue` prop — restores entered text when stepping back. |

---

## 3. Decisions Locked This Session

### 3.1 Dead Buttons — Reframed
No longer a standing audit item. Surfaces as found, fixed as found. Removed from the agenda permanently.

### 3.2 Manufacturer Interval vs User Preference — Parked
The intelligence exists in the vehicle detail display. The quiet acknowledgement of divergence ("Manufacturer recommends X. You prefer Y. I'll track to your interval.") is the missing piece. Parked to open decisions in Rules and Guidance. Not urgent.

### 3.3 The Domain Cluster Principle — Locked as 2.12
Some domains are buildings, not rooms. When a life area is broad enough to contain meaningfully distinct sub-domains — each with its own intake, intelligence, and grab-and-go — it becomes a cluster. The home screen tile is the front door. The navigation layer routes to the sub-domains within.

Health & Well-being is the first confirmed cluster.

### 3.4 Health & Well-being — Shape Locked

**The cluster contains three sub-domains:**
- **Medical** — providers, conditions, medications, screenings
- **Physical** — activity, fitness goals, workout patterns, limitations
- **Mental well-being** — how the person is doing, who they see, what the app holds quietly

**Intake order locked:**
1. Disclaimer screen — said once, up front, before any questions
2. Primary care provider — do you have one, who, when last seen
3. Sex assigned at birth — one question, framed off their known pronoun
4. Provider roster — dentist, eye care (+ glasses/contacts), ongoing specialists as tiles with free text
5. Chronic conditions — curated tile set (~12–15 tiles), one "something else" field, skippable
6. Medications — free text, optional, skippable
7. Screening history — age and sex-appropriate tiles only (app already knows both by this point)

**The disclaimer — locked language direction:**
*"This isn't medical advice. It's a place to keep your health picture organised — your providers, your appointments, what's coming due. The information it surfaces is broadly accepted general guidance, not a substitute for a conversation with your doctor."*
Short. Plain. Said once. Not repeated.

**Sex assigned at birth — intake framing:**
*"Some health recommendations are based on sex assigned at birth. You've told us you go by [pronoun] — is that also your sex assigned at birth?"*
One tap for the majority. Tile set (male / female / intersex / prefer not to say) for those who answer no. "Prefer not to say" is valid — the app surfaces what it can without that data and stays quiet on the rest.

**Chronic conditions — first build approach:**
Capture the condition from tiles. Store it. Let the AI intelligence layer work from the condition name. Follow-on questions (insulin-dependent? medicated for it?) are useful but belong in a dedicated depth session. Simple first, proven, then deeper.

**The Health Intelligence Boundary — locked as 2.13:**
Reminders, recurrence windows, age-appropriate screening nudges, and broadly accepted general guidance only. Never symptoms, diagnoses, medication comments, or anything requiring clinical judgement. See Rules and Guidance 2.13 for the full boundary definition.

**The fusion principle — stated and locked:**
The health cluster feeds the ATAK with dramatically more signal. Physical domain data (no gym in two weeks), mental well-being data (hard season), relationship state (rough patch), and season all inform what the ATAK surfaces and when. The intelligence connections are cross-domain. This is the reason the app exists — not health tracking, but the fusion of everything the app knows about a person into the right nudge at the right moment.

**Domain name — unresolved.**
"Health" is too narrow. "Well-being" is closer. "Readiness" works in the Operator world. Not locked — goes to open decisions. Land it when the first screen is being built.

### 3.5 Confirm Button Inconsistency in Team — Parked
Some team onboarding screens show a confirm button but resolve immediately on tile tap (single-select, 220ms delay). The confirm button is vestigial in that mode. Fix belongs in the team onboarding redesign session, not as a standalone patch.

---

## 4. Parked — Not Forgotten

**Carry to next build session:**
- Any bugs surfaced during Shawn's device testing of Session 22 code — fix in this session before Session 23 begins
- Health domain build — thinking session complete, ready to build when next health session is called
- Team onboarding redesign — back button, escape relabel, question consolidation, confirm button fix

**Carry from prior sessions:**
- renderPartner world audit — situation tile IDs vary across worlds
- Blended family `whose` field — confirmed missing, not fixed
- Codebase gender audit — hardcoded she/her/his/he before next beta user
- Calendar UI — how does a user add an entry? Not yet designed
- Dexter and Priya birthdays — null in store
- VIN as prominent intake field
- CX-70 engine facts gap
- VIN enrichment via decode API
- service-worker.js cache bump before beta
- Google Places API — Option C for beta
- Rate limiting in Cloudflare worker before public beta
- Bucket list + annual goals
- Monetization model
- Notification philosophy
- World Voice Guide session
- Domain portability confirmation in spec
- Manufacturer interval vs user preference — quiet flag in vehicle detail
- Has something changed? build — role defined, not ready for build
- SC (soft-coded) interactions with AI support — not yet designed

**Parked indefinitely:**
- Family domain
- Finances domain
- Life Events layer (absorbed by Has something changed?)
- Team domain home screen tile (absorbed by ATAK + Has something changed?)

---

## 5. Documents Produced This Session

**`YourLifeUnlocked_Rules_and_Guidance_May28_2026.md`** — Full revision. Changes from prior version:
- 2.4b added — Date Input Rule
- 2.12 added — Domain Cluster Principle
- 2.13 added — Health Intelligence Boundary
- Part 6 updated — never give medical advice added
- Open decisions updated — health domain name and manufacturer interval added
- Revision log updated through Session 22

Add to project. The May 26 version can be retained or retired — Shawn's call.

---

## 6. Collaborator Note

The Domain Cluster Principle is the most significant architectural addition since the ATAK was defined. It changes how every future domain gets designed — not just health. Home will probably be a cluster. The pattern is now locked and named before it gets built, which is the right order.

Both parties hold each other to the documents. The project knowledge is the authority.

The check-in runs at the start of every session. No exceptions.

---

## 7. Session 23 Agenda

**Start:** Run the session check-in. Shawn confirms he tested Session 22 code on device. Any bugs from that testing are fixed first.

**Primary track:**
- Fix any bugs surfaced during device testing of Session 22 code (calendar picker, back buttons, text size)
- Health domain build — thinking session complete, build begins. Disclaimer screen first, then intake in the locked order.

**Secondary track (if time):**
- Physical sub-domain shape — what does the first HC look like?
- Home screen tile for the health cluster — what does it surface?

---

*Your Life / Unlocked | Session 22 | May 28, 2026 | Confidential Product Document*
