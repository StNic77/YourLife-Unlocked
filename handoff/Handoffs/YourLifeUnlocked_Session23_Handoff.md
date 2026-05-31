# YOUR LIFE / UNLOCKED
## Product Development — Session 23 Handoff
*May 29, 2026 | Architecture + Thinking Session | Confidential*

---

## 1. What This Session Was

A session that started as a refactor and became something more significant.

The ATAK extraction was the stated agenda. It was completed cleanly. But the conversation that followed — about what the calendar is, what the ATAK is, and how they relate — produced the clearest architectural statement the project has made since the ATAK was first defined.

The ATAK is the All Source Intelligence Cell. That is not a metaphor. That is a job description. And the calendar is the temporal layer that makes it possible. These two things were understood today in a way they weren't at the start of the session.

No health code was written. That was the right call. The architecture had to be settled first.

---

## 2. Code Shipped This Session

### `atak.js` — New File

Extracted from `home.js`. Self-contained. Four clearly named parts:

**Part 1 — Utilities:** `computeAge`, `resolveAge`, `daysUntilDate`, `formatDate`, `formatBriefDate` — date math and age resolution used throughout the intelligence layer.

**Part 2 — Display label helpers:** `loveLangLabel`, `missionLabel` — ATAK presentation concerns, owned here and nowhere else.

**Part 3 — Urgency engine:** `getUrgentItems`, `buildUrgentByObject`, `snoozeItem`, `dismissItem`, `isVehicleUrgent` — reads across all domains in the store, produces the unified urgent signal. First layer of cross-domain synthesis.

**Part 4 — Intelligence assembly:** `buildPrimaryBrief` — reads the store, finds the meaningful intersections, assembles the fused brief. The ATAK's primary output.

All functions exported. `store.js` is the only dependency. `atak.js` does not import from any domain file.

### `home.js` — Updated

381 lines lighter. Imports everything it needs from `atak.js`. The room, the renderer, the brief panel, the interaction layer — all still here. No intelligence. `home.js` is now purely the host.

**`main.js` — unchanged.** It still imports only `createHome` from `home.js`. It never needs to know `atak.js` exists.

### Files Changed

| File | Change |
|---|---|
| `atak.js` | New file — 420 lines. All ATAK intelligence extracted and owned here. |
| `home.js` | Updated — 1,202 lines. Intelligence removed, imports from atak.js added. |

---

## 3. Decisions Locked This Session

### 3.1 The ATAK — All Source Intelligence Cell (2.14)

The ATAK is the only place in the app where cross-domain fusion happens. Every domain is a source. The ATAK is the analyst. It reads everything, owns the synthesis, produces the brief.

No domain synthesises. No domain produces cross-domain intelligence. If a feature requires knowing what two domains mean together — that feature belongs in the ATAK.

The name is now architecturally precise. This is what an ATAK does. It is what `atak.js` does.

### 3.2 The Calendar — Authoritative Temporal Layer (2.15)

The calendar is not a scheduling tool. It is the temporal intelligence layer that makes the ATAK's fused picture possible.

Every domain writes its time-sensitive signals to the calendar — giving them a position on a shared timeline. The ATAK reads the calendar as its primary temporal input. It does not reach into each domain and do its own date math. It reads one unified temporal layer and reasons from it.

The calendar temporalizes. The ATAK analyzes. Together they produce something neither could alone.

### 3.3 The Domain Signal Contract (2.16)

Domains write signals to `store.calendar`. They never call into `calendar.js`. The store is the only shared interface.

Signal rules locked: deterministic IDs, deduplication, retirement when condition resolves, pressure classification consistent with 2.8. Domain signal registry established — grows as domains are built.

### 3.4 The Pipeline — Confirmed Working in Principle

Three examples were run through the full pipeline during the session:

**Example 1 — The Busy Tuesday:** Heat pump window 11am–4pm + medical appointment 1:30pm + oil change overdue + Sophie's birthday 9 days out. The ATAK reads the calendar and surfaces: *Tuesday is committed. Wednesday is the window for the oil change.* No other app produces that sentence.

**Example 2 — The Clean Week That Isn't:** Nothing in Apple Calendar. Three domain signals converging in 10–14 days — insurance, birthday, registration. The ATAK sees the cluster. Apple Calendar sees nothing.

**Example 3 — Signal Retirement:** Oil change logged. Vehicle domain removes its signal from the calendar store. ATAK opens, signal is gone. Calendar honest. No stale noise.

All three examples held up under the architecture. The design is real and buildable.

---

## 4. Documents Produced This Session

**`atak.js`** — New module. Add to repo alongside `home.js`.

**`home.js`** — Updated. Replace existing file in repo.

**`YourLifeUnlocked_Calendar_Domain_Spec.md`** — Full calendar domain spec: architecture position, entry types, signal contract, store shape, what the ATAK reads, what the calendar UI shows, domain signal registry, files, what is not in scope. Add to project.

**`YourLifeUnlocked_Rules_and_Guidance_May29_2026.md`** — Full revision. Changes from May 28 version:
- Session count updated in Part 0
- 2.14 added — ATAK as All Source Intelligence Cell
- 2.15 added — Calendar as Authoritative Temporal Layer
- 2.16 added — Domain Signal Contract
- Revision log updated through Session 23

Add to project. May 28 version can be retained or retired — Shawn's call.

---

## 5. Parked — Not Forgotten

**Carry to next build session:**
- Calendar domain build — spec is locked, ready to build
- Health domain build — thinking complete (Session 22), spec ready, build when calendar is stable
- Any bugs surfaced during device testing before next build begins

**Carry from prior sessions:**
- renderPartner world audit — situation tile IDs vary across worlds
- Blended family `whose` field — confirmed missing, not fixed
- Codebase gender audit — hardcoded she/her/his/he before next beta user
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
- Team onboarding redesign — back button, escape relabel, confirm button fix
- Confirm button inconsistency in team onboarding

**Parked indefinitely:**
- Family domain
- Finances domain
- Life Events layer (absorbed by Has something changed?)
- Team domain home screen tile (absorbed by ATAK + Has something changed?)

---

## 6. Collaborator Note

The architecture settled today into something that has been earned, not assumed. The ATAK as All Source Intelligence Cell and the calendar as the temporal layer that feeds it — these are not abstractions. They are precise descriptions of what the code does and what the code will do.

The pipeline examples confirmed it. The reasoning holds. The design is buildable.

Both parties hold each other to the documents. The project knowledge is the authority.

The check-in runs at the start of every session. No exceptions.

---

## 7. Session 24 Agenda

**Start:** Run the session check-in. Shawn confirms device test of Session 23 code (atak.js extraction). Any regressions fixed first.

**Primary track:**
- Calendar domain build — `calendar.js`, `store.calendar`, user entry intake, day view
- Domain signal writing from vehicles and maintenance — first live signals on the timeline

**Secondary track (if time):**
- ATAK temporal analysis layer — teach the ATAK to read the calendar and reason across the day
- First pipeline test with real data — Shawn's actual week through the full system

---

*Your Life / Unlocked | Session 23 | May 29, 2026 | Confidential Product Document*
