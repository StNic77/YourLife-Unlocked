# YOUR LIFE / UNLOCKED
## Product Development — Session 11 Handoff
*May 2026 | Confidential*

---

## 1. What This Session Accomplished

A focused thinking session. No code written. Two things resolved.

The gap tile question — which had been deferred since Session 10 — was settled completely. The AI generation approach was retired on principle: the app was making choices before it had any data to support them. The tiles are now locked, plain, and universal. The hidden tile was removed from onboarding entirely. It was solving a problem that doesn't exist yet.

The Session 12 agenda is clean. The easy fixes go into Session 11 code work. The home screen gets a full deep session with nothing hanging over it.

---

## 2. Decisions Locked This Session

### Gap Tiles — Locked in worlds.json

AI-generated gap tiles are retired. The app had no meaningful data at the point of generation — world choice and one situation answer is not enough to personalise anything. Locked tiles are consistent, deliberate, and survive the Cheesy Hook Check.

**Operator gap tiles — final:**

- My physical health
- My emotional well-being
- Money
- My relationships
- My professional life
- My personal life

**Multi-select.** The user picks all that apply. The selection set is the signal.

**Why these six:**
- Physical and emotional health are separated — "staying fit" was covering physical only and missing mental/emotional entirely
- "Emotional well-being" was chosen over "mental health" — less clinical, passes the Cheesy Hook Check across all worlds
- Professional and personal life are separate tiles — one can be going well while the other is a mess, and that distinction is high-signal data
- "Money" not "finances" — plain works

**Other worlds** get the same six categories with light language flex when those worlds are built. The mechanics are identical. No redesign required.

### Hidden Tile — Removed from Onboarding

The hidden tile is retired from the onboarding flow. It was a clever solution to a problem that onboarding doesn't actually have. Vulnerability surfaces through use, not through a trick on day one. The app earns what it learns. The hidden tile concept may return elsewhere — it belongs in the home screen cascade where the relationship has had time to develop. Not here.

### Session Structure — Confirmed

Session 11 is the cleanup session. Session 12 is the home screen build.

The back button behaviour through partner cascade sub-steps is deferred to Session 12 alongside the home screen build — no point confirming back button behaviour through a flow that may change once the home screen context is clear.

---

## 3. Session 11 Build Agenda — Complete List

Everything here is decided. No design decisions required. Pure execution.

### Bug Fixes

**Bug: Partner name prompt fires when no partner selected**
`team.js` — read `store.get('onboarding')?.answers?.situation` before mounting the partner cascade. If no partner is indicated, skip the partner cascade entirely.

**Bug: Children copy assumes a partner is present**
`team.js` — children cascade copy needs a partner/no-partner conditional. The "too" pattern is the tell — find and remove it for the no-partner path. Two copy variants, one for each case.

### Gap Tiles

**Retire AI generation**
`api.js` — `getMissionTiles()` is no longer called from `onboarding.js`. Retire or stub the function. Do not delete `api.js` — `getTeamReflection()` is still active.

**Lock tiles in worlds.json**
Replace the AI-generated tile logic in `onboarding.js` with a static read from `worlds.json`. The Operator mission tiles are the six listed above. Other worlds get placeholder arrays for now.

### UX Fix

**Children entry — multiple children signalling**
The first child prompt doesn't make clear the user can add multiple children one at a time. Add copy: something like "we'll add them one at a time" or a running counter showing how many have been added. Exact copy to be workshopped in session.

### Performance Fix

**AI reflection latency**
Current behaviour: wait for the AI reflection before showing the next screen. This adds noticeable lag.

Fix: advance to the next screen immediately. Inject the reflection text asynchronously when it arrives. The screen renders at once. The reflection appears shortly after. No perception of waiting.

---

## 4. Session 12 Agenda — The Home Screen

Session 11 hands off a clean codebase. Session 12 goes deep on the home screen with nothing outstanding.

### Carry In From Session 10c — Already Decided

- The home screen is a briefing, not a dashboard
- Day one state is an opening state, not an empty state
- One cascade per session opening — one door, offered quietly
- Home screen tiles are plain — the intelligence is in which tile, not the tile itself
- The trust ladder governs what gets offered and when
- AMPOCC is the invisible engine driving tile selection

### Build Items for Session 12

- Build `home.js` — the briefing screen
- Day one state — brief present, honestly unpopulated, one door offered
- The "things I can keep track of for you" first cascade — clean tiles, genuine offer of custody
- Trackable items warehouse — the master list, never shown all at once
- Brief sections — what are they, what populates each one, what does empty look like
- AMPOCC-driven tile selection logic — rule-based to start
- Privacy line placement — one honest line, early, not a modal
- Back button behaviour through partner cascade sub-steps — confirm on device

---

## 5. Principles — Carried Forward

All principles from Sessions 1–10c remain in force. No changes this session.

The two most relevant for Session 12:

**The Plain Language Rule** *(Session 10c)*
> The metaphors are for the architecture. The copy is for the person. Most copy should be plain, direct, and human. Analogy language earns its place or it doesn't appear.

**The Trust Ladder Principle** *(Session 10c)*
> The app earns access. It does not assume it. What's offered next is always adjacent to what was last opened. The depth of the relationship reflects the trust that has been earned.

---

*Your Life / Unlocked | Session 11 of Many | Confidential Product Document*
