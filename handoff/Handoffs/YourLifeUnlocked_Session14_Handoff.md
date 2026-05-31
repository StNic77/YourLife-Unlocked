# YOUR LIFE / UNLOCKED
## Product Development — Session 14 Handoff
*May 2026 | Confidential*

---

## 1. What This Session Accomplished

Session 14 was the biggest build session to date. Three major tracks completed: the ATAK rename, the persona dev tools, and the cascade architecture — spec, AI contracts, and first three working cascade types. The product crossed a threshold this session: it now delivers actionable intelligence, not just a brief.

---

## 2. Decisions Locked This Session

### ATAK Rename — Done
All five `ATAC` references in `home.js` replaced with `ATAK`. Zero remaining. The correct acronym is locked across code, comments, and documentation. Android Team Awareness Kit. The name earns its place conceptually — the Operator opens his ATAK and gets situational awareness on his team.

---

### Persona Dev Tools — Built and Committed

Three simulated users loadable via URL param. Load with `?dev=single`, `?dev=married`, or `?dev=blended` — clears localStorage, loads the persona, skips onboarding, goes straight to home.

| Param | Persona | World | Key data |
|---|---|---|---|
| `?dev=single` | Marcus Webb | Operator | Ram reg due 6 days, oil change 8 days overdue, annual physical overdue, undealt mission |
| `?dev=married` | Sarah Chen | Garden | Daniel's birthday 9 days, Owen's birthday 4 days, Honda insurance approaching |
| `?dev=blended` | Ryan Torres | Playbook | Theo's birthday 8 days, Caleb's 12 days, F-150 insurance 12 days, Sienna reg expired 3 days ago |

All dates compute dynamically from today — urgency is always live, no hardcoded dates that go stale.

**To reset a persona to its original state:** add `?dev=blended` (or single/married) to the URL and hit Enter. The store resets and reloads fresh.

**Files changed:** `main.js`

---

### Duplicate Urgent Items — Fixed

Birthday items were appearing twice — once derived from `team.children` and once from the persona's `urgent_items` array. Fixed in `getUrgentItems()`: stored IDs are indexed first, derived items are skipped if already present. One source of truth per item.

Birthday items removed from persona `urgent_items` arrays entirely — the calculation owns birthdays, the store owns everything else.

**Files changed:** `home.js`, `main.js`

---

### ATAK Synthesis Upgrade

`buildPrimaryBrief()` now delivers real synthesis — not just a list of what grab-and-go would show:

- **Your team** connects people to what's relevant right now — Theo's name next to "birthday 8 days", partner's love language surfaced when no birthday is urgent
- **On the horizon** scans across vehicles, children, and partner for the 15–30 day window — things that aren't urgent yet but worth seeing together
- `loveLangLabel()` helper added for clean love language display

**Files changed:** `home.js`

---

### Model Split — Implemented

Cloudflare worker confirmed as pure passthrough — forwards the entire request body to Anthropic unchanged. No model hardcoded in the worker.

`api.js` updated with two model constants:

```js
const MODEL_FAST = 'claude-sonnet-4-6';  // hard cascades — speed, structured JSON
const MODEL_RICH = 'claude-opus-4-6';    // soft cascades — contextual reasoning, quality
```

`send()` now accepts `model` as a parameter. Every API method explicitly declares which model it uses. Hard cascades use Sonnet. Soft cascades and team reflections use Opus.

**Files changed:** `api.js`

---

### Cascade Architecture — Spec Written and First Three Built

#### The Spec

`YourLifeUnlocked_ATAK_Cascade_Spec.md` is now the governing document for all cascade builds. It defines:

- The tile system — first use orients, repeat use leads with preference
- The cascade data model — every urgent item carries a `cascade` object
- AI contracts for hard and soft cascades — different standards, different models
- 28 hard cascade types across vehicles, health, home, financial, kids, and documents
- 6 soft cascade types — acts of service, quality time, birthday (partner + child), relationship check-in, the undealt thread
- Transition Mode — a first-class app state for military postings and civilian moves
- Jurisdiction-first rendering — BC/AB/generic registration handled correctly
- The completion loop — every cascade updates the store when done
- Build priority order — 13 items, SC-6 Undealt Thread is always last

Add this file to the project. It governs every cascade build from here forward.

#### The Build

Three cascade types implemented and wired:

**HC-1: Vehicle Registration**
- BC: ICBC Online / Autoplan Broker (combined reg + insurance, no shop-around option)
- AB: Online / Registry Agent
- Generic: Online / By Mail / In Person
- Jurisdiction resolved from `plate_province` on the vehicle object

**HC-2: Vehicle Service**
- DIY: full parts list, oil spec, filter OEM part number, drain plug washer, tools, torque spec, maintenance light reset, disposal search link
- Dealer: nearest dealer, hours, phone, booking link
- Preferred Shop: shop on file or find nearby

**HC-5: Medical Appointment**
- Book: existing provider — call or book online
- Find: nearest clinic accepting patients, search link fallback

All three cascades:
- Slide in from the right over the brief — brief stays open, back returns cleanly
- Show a loading spinner while the AI fetches data
- Render action buttons: directions, call, open link, mark done
- Update the store on completion (`vehicles`, `health`, `cascade_log`)
- Remember route preference per cascade type in `cascade_preferences`

**New file:** `cascade.js`
**Files changed:** `home.js` (import + cascade tap wiring), `api.js` (three new cascade methods), `main.js` (cascade objects on urgent items, enriched vehicle data)

#### Cascade Tap UX

In the primary brief, urgent items with a cascade attached show:
- A gold **"handle →"** button on the right
- The item label itself is tappable (turns gold on hover)
- Snooze remains available alongside the cascade button
- Dismiss is hidden when a cascade is present — "mark done" inside the cascade replaces it

---

### Vehicle Data Model — Enriched

Persona vehicles now carry `year`, `make`, `model`, and `plate_province` — required for AI contract accuracy and jurisdiction routing.

```js
{
  id: 'v2',
  name: '2018 Sienna',
  year: '2018', make: 'Toyota', model: 'Sienna',
  plate_province: 'BC',
  registration_expiry: '...',
  ...
}
```

Real user vehicles should capture these fields during onboarding or first-use vehicle setup.

---

### Jurisdiction-First Rendering — Principle Locked

BC combines registration and basic insurance into a single ICBC Autoplan transaction. There is no shopping around for basic coverage. The cascade knows this and shows only BC-appropriate routes.

The governing principle: **serve the user's actual situation, not the ideal one.** If plate province differs from user province (Alberta plates in BC), the app asks once, stores the answer, never asks again. No judgment.

---

### Transition Mode — Specced, Not Yet Built

Full specification written in `YourLifeUnlocked_ATAK_Cascade_Spec.md`. Military posting or civilian move triggers a first-class app state that reorients everything the app knows to serve the next chapter. 90-day timeline cadence, jurisdiction reorientation, partner credential portability, kids school registration, the works.

Build priority: 11 — after jurisdiction engine and multiple cascades are live.

The military use case is a retention driver unlike any other. A CAF family that posts every 3–5 years and finds this app handles the transition better than anything else they've tried — that family doesn't churn.

---

### API Cost — Confirmed Sustainable

At 25–50 beta users: approximately $5/month in API costs. $5 in test credits will last weeks at dev volumes.

Cost structure per user per month:
- Hard cascades (Sonnet 4.6): ~$0.024
- Soft cascades (Opus 4.6): ~$0.075
- **Total: ~$0.10/user/month**

At $10/month subscription: API costs are ~1% of revenue. Healthy ratio.

---

## 3. Session Check-In — Scope and Principles

**Did everything built this session serve the user's current experience?**
Yes. The cascade system delivers on the core promise — actionable intelligence, not just a brief. Every cascade terminates in action and updates the store. The personas enable real design work against simulated data.

**Did anything get added because it seemed smart rather than because it was needed?**
The model split was prompted by a direct question about capability — right call. Transition Mode was specced but not built — correct prioritisation. The expanded HC library (28 types) was identified but not built — also correct.

**Is the core loop stronger than it was at the start of the session?**
Significantly. The app now has a cascade architecture that can grow to cover every domain of a user's life. HC-1, HC-2, HC-5 are live. The spec governs everything downstream.

**What was deferred, and was deferring it the right call?**
Soft cascades deferred — the hard cascade pattern needed to be proven first. Transition Mode deferred — needs jurisdiction engine live. Rate limiting deferred — captured in todo below. All correct.

**Scope creep check:**
Clean. The session had a clear agenda and delivered it. The cascade spec expanded during the session as new domains were identified — that expansion was additive to the spec, not to the build. Right call.

---

## 4. Code — Files Changed This Session

| File | What Changed |
|---|---|
| `home.js` | ATAK rename (5 instances); duplicate fix in `getUrgentItems()`; synthesis upgrade in `buildPrimaryBrief()`; `loveLangLabel()` added; cascade import; `cascade_type` passed through item rows; `buildItemRow()` cascade affordance; cascade open handler in `attachBriefListeners()` |
| `api.js` | `MODEL_FAST` / `MODEL_RICH` constants; `send()` accepts model param; `getRegistrationCascade()`, `getServiceCascade()`, `getMedicalCascade()` added |
| `main.js` | Three persona dev tools (`single`, `married`, `blended`); `loadPersona()` function; dev param check in `boot()`; cascade objects on all urgent items; enriched vehicle data (year, make, model, plate_province) |
| `cascade.js` | **New file.** Full cascade renderer — tile system, route preference, HC-1/HC-2/HC-5 renderers, shared UI builders, completion loop |

---

## 5. Parked — Not Forgotten

- **Rate limiting in Cloudflare worker** — cap calls per user per day using Cloudflare KV. Protects against accidental hammering, essential before public beta. ~20 lines of code in the worker. Do before beta launch.
- **Response caching for hard cascades** — BC registration cascade for a 2019 Ram 1500 looks identical tomorrow. Cache AI response 24 hours in Cloudflare KV. Cuts API costs 40–60% at scale.
- **Persistent dev persona** — a dev identity that accumulates state across sessions like a real user. Needed once the app has enough intelligence to notice behaviour over time. Separate localStorage key, seed-once pattern.
- **Soft cascades** — SC-1 through SC-6. Spec is written. Build after hard cascade pattern is validated in testing.
- **Transition Mode** — spec written, build after jurisdiction engine and multiple cascades are live.
- **HC-3 through HC-28** — full library specced, build as needed.
- **Object glow** — image editing work required first (Photopea), then code. Near-term.
- **Remaining world hotspot maps** — coordinate inspector is ready, map when convenient.
- **Back button through partner cascade sub-steps** — deferred multiple sessions, still open.
- **Blended families data model** — `{ whose: 'mine' | 'partners' | 'ours' }` field needed. Home screen cascade is the right place to ask.
- **Scheduling / calendar event entry** — brief needs time-sensitive data to be useful.
- **Bucket list + annual goals** — flagged Session 8b, still parked.
- **Monetization model** — not yet decided.
- **Codebase gender audit** — search for hardcoded `she`, `her`, `his`, `he` outside variable names before next beta user.
- **service-worker.js** — `cascade.js` and updated `home.js`/`api.js`/`main.js` not yet in the cached asset list. Add before beta.

---

## 6. Session 15 Agenda

### Priority One — Test the Cascades
Load `?dev=single` (Marcus) and `?dev=blended` (Ryan) and exercise every cascade:
- HC-1: Sienna registration (BC → ICBC routes)
- HC-1: Ram 1500 registration (BC → ICBC routes)
- HC-2: Ram 1500 oil change (DIY route → verify specs are correct for a 2019 Ram 1500)
- HC-5: Annual physical (find clinic route)

Surface bugs, wrong data, UX friction. Fix before building more.

### Priority Two — HC-3 Vehicle Insurance
Variation of HC-1. BC is different again — optional insurance (collision, comprehensive) is separate from Autoplan. Alberta shops around. Build on the proven jurisdiction pattern.

### Priority Three — First Soft Cascade
SC-1: Acts of Service. Ryan and Jess. The app knows the capture note about the deck. This is the first test of whether the AI soft contract produces something that makes a user silently thank the app — or rolls their eyes.

Build it against the blended persona. Measure the output against the Roll-Eyes Test before shipping.

### Priority Four — service-worker.js Update
Add `cascade.js` to `STATIC_ASSETS`. Bump cache version to `ylu-v2`.

---

## 7. Files to Upload at Session 15 Start

| File | Why |
|---|---|
| `home.js` | Any changes made during testing |
| `cascade.js` | Bug fixes from testing |
| `api.js` | Any prompt adjustments from testing |

---

## 8. Principles — All Carried Forward

**New principles locked this session:**

**The Jurisdiction-First Rule** *(Session 14)*
> Every hard cascade that touches a government system, insurance product, or regulated service resolves jurisdiction before rendering anything. Generic options are never shown when jurisdiction-specific ones exist. The app serves the user's actual situation — not the ideal one, not the legally correct one. If the user is navigating a messy real-world situation, the app helps with the mess. Especially then.

**The AI Servant Rule** *(Session 14)*
> The AI is a servant, not a performer. It does not explain its reasoning. It does not add colour. It does not reassure. Hard cascade AI is a database — structured input, structured output, no preamble. Soft cascade AI is a trusted friend who has been paying attention — contextual, specific, never generic. If the output wouldn't make the user silently thank the app, it doesn't ship.

**The Roll-Eyes Test** *(Session 14)*
> Would the user silently thank the app for this, or roll their eyes? If there is any doubt: do not surface it. Applies to every soft cascade output before it ships.

**The Transition Mode Principle** *(Session 14)*
> A military posting or civilian move is not a feature — it is a first-class app state. The app reorients everything it knows to serve the next chapter. It surfaces what matters in the right order before the user knows to ask. For a CAF family that posts every 3–5 years, this is why they keep paying for it.

**All prior principles carried forward unchanged.**

---

*Your Life / Unlocked | Session 14 of Many | Confidential Product Document*
