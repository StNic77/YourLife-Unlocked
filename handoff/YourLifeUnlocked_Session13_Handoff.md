# YOUR LIFE / UNLOCKED
## Product Development — Session 13 Handoff
*May 2026 | Confidential*

---

## 1. What This Session Accomplished

Session 13 was a fixing and thinking session. No major new features — corrections, improvements, and a significant design conversation that sets up the next build.

The pronoun gap caught by a real user observation was closed properly across the full stack. Children's birthdays were added to the data model and wired to the calendar urgency system. The coordinate inspector was built, broke, and was fixed. And the ATAK experience — the most important remaining build — was explored deeply enough to know what it needs to be before a line of code is written.

---

## 2. Decisions Locked This Session

### ATAC → ATAK — Correction Locked

The primary object in the Operator's room has been referred to as ATAC throughout the project. This is wrong.

**The correct acronym is ATAK — Android Team Awareness Kit.**

"Android Tactical Assault Kit" is a common misremembering. The correct expansion is locked here and carries forward into all documentation and copy.

**In the code:** `id: 'atac'` in `home.js` needs to be updated to `id: 'atak'` and all related comments and labels corrected. This is a Session 14 task — flagged, not yet actioned.

**Why "Team Awareness Kit" matters beyond correctness:**
The full name is wonderfully apt. The Operator opens his ATAK and gets situational awareness on his team. The acronym earns its place conceptually in a way "Tactical Assault" never could. This framing should inform the ATAK experience design — it is a Team Awareness Kit, not a tactical interface.

---

### Partner Pronoun — Built and Committed

The app was asking "What does she do?" — a hardcoded assumption that broke for any relationship that isn't heterosexual or where the partner doesn't identify as she/her.

**Fix:** A pronoun tile step added to the partner cascade in `team.js`, immediately after the partner's name is entered. Three tiles: She / her, He / him, They / them. Required — not skippable. One tap, no friction.

Stored as `partner.pronoun` — values: `she`, `he`, `they`.

A `pronoun(entity, form)` helper function was added to `team.js`:
- Takes any object with a `.pronoun` property
- Returns the correct form: `subjective` (she/he/they), `objective` (her/him/them), `possessive` (her/his/their)
- Falls back to they/them/their if pronoun is null
- Generic — works for partner and children

All four AI reflection calls in `team.js` now pass `partnerPronoun`. The `api.js` `getTeamReflection()` function now accepts `partnerPronoun`, derives the full pronoun triple, and passes it to the AI with an explicit instruction: *"Use the partner's correct pronouns as provided in context. Never assume gender."*

**Hardcoded "she" is gone.** A codebase search for remaining gendered language (`she`, `her`, `his`, `he`) outside variable names and comments is recommended before the next beta user touches the app.

---

### Children Pronoun — Built and Committed

Same principle applied to children. Children are referred to by name most of the time — pronoun matters less than for the partner — but the question is worth asking.

**Different from partner:** Skippable. A fourth tile — **Skip** — stores `null` and continues. No escape required. One tap, the flow moves on.

Tile order: She / her, He / him, They / them, Skip.

Fires immediately after the child's name is entered, before age.

The `pronoun()` helper was made generic this session — it was already built for the partner, now works for any object with a `.pronoun` property including children.

---

### Children Birthday — Built and Committed

Age was the only data captured per child. Birthday was not collected.

**Decision:** Ask both. Age is immediate context — tells the app what stage of life the child is in. Birthday is calendar data — enables the brief to surface upcoming events and drives gift planning conversations.

**Flow per child (final):**
1. Name
2. How do you refer to [name]? — pronoun tile, skippable
3. How old is [name]? — age, required
4. When is [name]'s birthday? — skippable, same placeholder as partner: `e.g. March 14`

**Store shape per child:**
```js
{ name: 'Ella', pronoun: 'she', age: '8', birthday: 'March 14' }
{ name: 'Jack', pronoun: null,  age: '5', birthday: null }  // both skipped
```

**`home.js` updated:** Children's birthdays now surface in `getUrgentItems()` using the same logic as partner birthdays — within 14 days, amber pulse on the calendar object, snoozable.

---

### Coordinate Inspector — Built, Fixed, and Committed

Added to `home.js`. Active when `?dev=hotspots` is in the URL — same param as the existing hotspot visualiser, nothing new to remember.

**Behaviour:** Tap anywhere → readout appears at the tap point showing `x: 48, y: 46`. Auto-dismisses after 3 seconds. Replaced immediately if you tap again. Tapping a hotspot still opens the brief — inspector is additive.

**The bug and fix:** Original implementation listened on `#home-room` — the background-image div. All taps actually land on `#home-hotspots`, the transparent layer sitting on top. Fixed by moving the listener to `layer` (the hotspot layer), which is already in scope and receives every tap. Coordinates calculated against `layer.getBoundingClientRect()` — same coordinate space, correct result.

**Workflow for mapping remaining worlds:**
1. Load the world with `?dev=hotspots`
2. Tap the object to position
3. Read coordinates from the readout
4. Type into `HOTSPOT_MAPS`

---

### Object Glow — Parked with Full Instructions

Your girlfriend's observation: "Will there be words to let you know the item is clickable?"

**Decision:** A permanent subtle glow on each interactive object — shaped to the object, not a generic circle. Always present, always reminding the user the room is alive without breaking the space with labels.

**Why parked:** Requires cutting each interactive object out of the room image as a transparent PNG and layering it back over the base image. The glow is then applied via CSS `filter: drop-shadow` to the PNG — the shape is inherently correct because it is the object.

**Tool needed:** Photopea (photopea.com) — free, browser-based, full Photoshop equivalent. No install required.

**Workflow per world:**
1. Open room image in Photopea
2. Select each interactive object with lasso or magic wand
3. Cut to its own layer
4. Export as transparent PNG
5. Position over base image in `home.js`
6. Apply CSS glow filter

**This is a near-term fix, not a Session 14 item.** It requires image editing work outside the code sessions. Once PNGs are ready, the code work is straightforward. Flagged here so it doesn't get lost.

**Interim state:** The room is functional without it. Discoverability is the open question — the glow is the intended solution, pending execution.

---

### The ATAK Experience — Design Explored, Not Yet Built

The most important remaining build was not built this session — deliberately. The design conversation was the necessary precursor.

**The core question answered:** What does the ATAK add that grab-and-go doesn't?

Grab-and-go gives you one domain, fast. You knew what you wanted before you tapped. The ATAK gives you synthesis — what the data means *together*, across all domains, in a single read.

**What only synthesis can produce:**
- **Temporal clustering** — three things due in the same 5-day window. No single card sees that. The ATAK does.
- **Person-event connections** — partner's birthday in 11 days + love language on file + no gift logged = this needs attention and here's why it matters. Calendar knows the date. Team model knows the love language. Only the ATAK connects them.
- **Load reading** — is this a heavy week or a quiet one? The ATAK gives that read without the Operator opening five cards and doing the math himself.
- **The undealt thread** — surfaces here, when earned. Never in grab-and-go.
- **Seasonal drift** — over time, what the user engages with and ignores. The ATAK is where that intelligence eventually appears.

**The frame that locked it:**

> **The 5Ws of today, this week, and my team.**

Three sections. Each answering who, what, when, where, why for its horizon:
- **Today** — tight, actionable, honest about what's thin on day one
- **This week** — the shape, the clusters, the relevance windows closing
- **My team** — the human intelligence layer. The one no other app has.

The ATAK doesn't show more data. It shows what the data means together.

---

### The Undealt Trust Principle — Locked

The `undealt` tile ("Something I haven't dealt with yet") is not a trigger. It is an acknowledgement. The user has already done the hard work of naming that something exists. The app receives it quietly.

**What the app does not do:**
- Confirm receipt
- Ask what it is
- Set a timer
- Surface it on a schedule

**What the app does:**
Watch. Build the picture. The AI accumulates signal — what the user engages with, what they skip, what they snooze, what they return to.

**What "earned" means in practice:**
- The user has returned enough times that the app knows their rhythm
- They have engaged with at least one emotionally weighted domain
- They have shown they trust the brief — they act on what it surfaces
- They are not currently in a heavy urgent-item period

When those things are true, the ATAK opens a door. Quietly. In the language of that world. No announcement. No "you mentioned something." Just a new presence in the brief where there wasn't one before.

**This is one of the most significant AI design challenges in the product.** It needs to play out against a simulated user before it can be built. That is what the persona dev tools are for.

---

## 3. Session Check-In — Scope and Principles

*This section is a permanent fixture from Session 13 forward. Answered honestly at the end of every session before the handoff is written.*

**Did everything built this session serve the user's current experience?**
Yes. Pronouns serve the user immediately — the app no longer assumes. Children's birthdays serve the calendar immediately. The coordinate inspector serves the build process. Nothing built for a future feature that doesn't exist yet.

**Did anything get added because it seemed smart rather than because it was needed?**
Children's pronouns were builder instinct, not a reported user problem. The call was right — the principle applies equally to children — but worth naming. The trigger was logic, not observation. Watch this pattern.

**Is the core loop stronger than it was at the start of the session?**
Yes, modestly. The data model is more honest. The AI reflections are more accurate. The dev tooling is more useful. No dramatic forward movement on the primary experience — that's Session 14's job.

**What was deferred, and was deferring it the right call?**
The ATAK experience was deferred in favour of understanding it first. Right call — the design conversation was necessary and the thinking is now locked. The remaining world hotspot maps were deferred by choice — tools are ready, execution can happen any time. Both deferrals were intentional.

**Scope creep check:**
Clean this session. The work was corrective and foundational, not additive for its own sake. The glow feature is parked rather than built — correct prioritisation.

---

## 4. Code — Files Changed This Session

| File | What Changed |
|---|---|
| `home.js` | Coordinate inspector added (and fixed); children birthday surfacing in `getUrgentItems()` |
| `team.js` | Partner pronoun tile; `pronoun()` helper (generic); children pronoun tile (skippable); children birthday capture |
| `api.js` | `partnerPronoun` accepted in `getTeamReflection()`; full pronoun triple derived and passed to AI; system prompt updated to instruct correct pronoun use |

**Pending code change — not yet actioned:**
- `home.js` — rename `id: 'atac'` to `id: 'atak'` throughout, update all related comments and labels

---

## 5. Parked — Not Forgotten

- **ATAK → ATAC rename in code** — simple find/replace, do at start of Session 14
- **Object glow** — image editing work required first (Photopea), then code. Near-term fix, not a session item
- **Remaining 7 world hotspot maps** — coordinate inspector is ready, map when convenient
- **Back button behaviour through partner cascade sub-steps** — deferred multiple sessions, still open
- **Blended families data model** — children model currently assumes all children belong to the primary user. `{ whose: 'mine' | 'partners' | 'ours' }` field needed. Home screen cascade is the right place to ask, not onboarding
- **Scheduling / calendar event entry** — the brief needs time-sensitive data to be useful
- **Bucket list + annual goals** — flagged Session 8b, still parked
- **Monetization model** — not yet decided
- **Notification philosophy** — not yet decided
- **Codebase gender audit** — search for hardcoded `she`, `her`, `his`, `he` outside variable names and comments before next beta user

---

## 6. Session 14 Agenda

### Task Zero — ATAK Rename
Find/replace `atac` → `atak` in `home.js`. Update comments and labels. Five minutes, do it first.

### Track One — Persona Dev Tools

Three simulated users loadable via URL param. Pattern consistent with existing dev tooling:
- `?dev=single` — single male, Operator world
- `?dev=married` — married female, Garden world
- `?dev=blended` — blended family male, Playbook or Range world

**Where it lives:** `boot()` in `main.js`. If a persona param is detected, load that store object, skip onboarding entirely, go straight to `showHome()`.

**What each persona needs in the store:**
A fully populated, realistic life. Rich enough that the ATAK has something to synthesize. Specifically:
- Partner with pronoun, birthday within or near 14 days, love language, relationship state
- Children with ages, birthdays at various distances, pronouns
- Vehicle with registration or insurance coming due
- Maintenance item overdue
- Calendar events at different weights across the next 14 days
- `undealt` tile selected in onboarding mission answers
- Coordinating rhythm established
- Some snooze history — items previously deferred

**Files to upload at Session 14 start:** `main.js`, `home.js`

### Track Two — ATAK Experience Design Against Simulated Data

With the three personas loaded, run the brief logic against each and see what the ATAK would actually surface. Does the 5Ws frame hold under real data weight? What does the synthesis look like when the store is full? What does day-one honest look like for a sparse user vs a rich one?

This is a design exercise before it is a build exercise. The output is a spec, not code.

### Track Three — ATAK Experience Build

Once the design is validated against simulated data, build it. The visual language: dark, map-textured, functional, ATAK-reminiscent without copying. Dense, readable, built for mission use.

Reference the real ATAK UI characteristics:
- Dark background, near-black
- Map or grid as base layer — topographic or satellite style  
- Dense, functional typography
- Military symbology as texture, not decoration

We are not copying ATAK. We are building something an Operator would find immediately legible.

---

## 7. Files to Upload at Session 14 Start

Upload these files at the beginning of Session 14 to enable immediate productive work:

| File | Why Needed |
|---|---|
| `main.js` | Persona dev tools live in `boot()` here |
| `home.js` | ATAK rename + ATAK experience build |

Optional but useful:
| File | Why |
|---|---|
| `store.js` | To understand the store API before writing persona load logic |

---

## 8. Principles — All Carried Forward

**New principle locked this session:**

**The Undealt Trust Principle** *(Session 13)*
> The `undealt` tile is not a trigger. It is an acknowledgement. The app receives it quietly, holds it, and watches. It surfaces when the relationship has earned the moment — not on a schedule, not on a threshold, but when the picture is full enough and the trust is deep enough to open that door without breaking it.
> *Check: is the app earning this moment, or manufacturing it?*

**All prior principles carried forward unchanged.** The work this session was consistent with the Authenticity Standard, the Restraint Principle, and the Tending Philosophy. The pronoun work specifically honours the principle that the app never assumes — it watches, and when it must ask, it asks plainly and only once.

---

*Your Life / Unlocked | Session 13 of Many | Confidential Product Document*
