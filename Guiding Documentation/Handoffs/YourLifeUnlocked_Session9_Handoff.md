# YOUR LIFE / UNLOCKED
## Product Development — Session 9 Handoff
*May 2026 | Confidential*

---

## 1. What This Session Accomplished

One item. Done cleanly.

The dev reset is live and confirmed working on device. The PWA is no longer locked for development — a 3-second long-press on the welcome back screen nukes the store and reloads. The ungated `?reset` URL param is gone.

---

## 2. Decisions Locked This Session

### Dev Reset — Confirmed Working on Device

The hidden long-press reset is implemented in `main.js` and confirmed working on desktop via GitHub commit.

**Behaviour:**
- 3-second long-press anywhere on the welcome back screen (`#screen-home`)
- Screen dims slowly over the hold duration — subtle, unannounced
- Release before threshold: screen snaps back, nothing happens
- Hold to 3 seconds: two-flash (bright → dim), `store.reset()`, `location.reload()`
- No label, no visible UI — completely invisible to real users

**Implementation detail:** The welcome back screen (`showHome()` in `main.js`) was previously rendered via `app.innerHTML = ...`, which left no element reference for the gesture to attach to. It was converted to `createElement` + `appendChild`, giving `attachDevReset()` a proper handle. Rendered output is identical.

**The `?reset` URL param** is removed from `boot()` in `main.js`. The long-press supersedes it entirely. Dead code, gone.

**`welcome.js` is unchanged.** The initial assumption that the welcome back screen lived there was wrong — it lives in `main.js`. `welcome.js` is the first-time welcome screen only and was not modified.

---

## 3. Codebase — Current State

### Files Changed This Session

| File | Status | What Changed |
|---|---|---|
| `main.js` | Updated | `showHome()` converted to `createElement`, `attachDevReset()` added, `?reset` URL param removed |

### Dev Reset — How It Works

```js
// In main.js — attachDevReset(el) wires to the #screen-home element
// 3-second pointerdown anywhere on the screen
// Fires: store.reset(); location.reload();
```

The functions `attachDevReset()` and `fireReset()` live at the bottom of `main.js`. When the home screen is eventually rebuilt as its own module, these move with it or stay in `main.js` as a utility — either is fine.

---

## 4. What Was Confirmed Working

- Long-press reset fires correctly on desktop via GitHub Pages
- `?reset` URL param is gone — no regression on normal boot
- Welcome back screen renders identically before and after the refactor

**iOS PWA confirmed.** The long-press reset fires from the home screen icon on mobile — the original problem that motivated the build. Desktop and iOS both confirmed working.

---

## 5. Founding Principles — Carried Forward

**The Authenticity Standard** *(Session 1)*
> No performed depth. No facade of meaning wrapped around superficial data collection. Every question must earn its place. If the app can learn by watching, it watches. If it must ask, it asks plainly and only once.
> *Check: does this feel like something a real person would say, or an app trying to seem meaningful?*

**The Restraint Principle** *(Session 1)*
> Driving engagement is not the goal. The app succeeds when you don't need to open it.
> *Check: does this serve the user's life, or does it serve the app's metrics?*

**The Tending Philosophy** *(Session 3)*
> This app is not in the extraction business. It tends. It notices. It shows up at the right moment and retreats when its work is done.
> *Check: does this feature take from the user, or give to them?*

**The Seasonal Intelligence Principle** *(Session 4)*
> Analogies are seasons, not identities. The app learns which season the user is in and adapts invisibly.
> *Check: are we serving the user's current season, or the identity they presented at onboarding?*

**The Cheesy Hook Check** *(Session 5)*
> Before any analogy-specific language is locked — ask: does this sound like an app trying to seem like this world, or someone who actually lives in it?
> *Check: would a real inhabitant of this world find this embarrassing? If yes, it goes.*

**The Feather Rule** *(Session 7)*
> Every line of copy in this product is a feather doing the work of a hand. The weight is never felt. The effect is real.
> *Check: does this line do its work without the user feeling it land?*

---

## 5b. Mid-Session Notes — Onboarding Tiles and the Complexity Problem

### The Tiles Need Work

The current onboarding tiles and questions are placeholders and they feel like it. They're doing the structural job but not the human one. This is a known problem and it cannot be left alone.

The stakes are high: the tiles are the first real conversation the app has with the user. They are also the primary mechanism by which the AI gets what it needs to start being useful. If that conversation feels like a form — clinical, extractive, icky — the whole premise collapses. The user has to feel understood, not processed.

**The principle that governs this work:**
The tiles must do double duty — gather signal for the AI while feeling, to the user, like the app already gets them. Not a survey. Not an intake form. A moment of recognition.

**What "icky" means here:** The current tiles are too direct about what they're collecting. They reveal their own mechanics. A good tile doesn't feel like a question — it feels like a mirror. The user taps it because it's true, not because they were asked.

**This is a Session 10 design workshop item.** The tiles stay as placeholders until that session. Do not let this slip.

---

### The Relationship Complexity Signal — A Real User, A Real Insight

A friend used the app and joked — not jokingly — that he wished he'd had the chance to say he has a wife but wished he didn't.

This is not an edge case. This is one of the most important signals a life-management app can hold.

**What it reveals:**
The current onboarding has no space for the emotional texture of a relationship — only its existence. "Partner / spouse" is a tile you tap or don't. But the reality is that relationships exist on a spectrum that includes love, ambivalence, resentment, longing, obligation, and grief — sometimes simultaneously. A man who taps "wife" and a man who taps "wife" while wishing he didn't are in completely different seasons. The app currently cannot tell them apart.

**Why it matters for the AI:**
The nudge system, the check-in model, the way the app speaks about home, time, energy, and priorities — all of it needs to land differently for these two users. If the app can't hear the subtext, it will give tone-deaf advice to one of them at exactly the wrong moment.

**This is not about collecting complaints about a partner.** It's about holding the full emotional truth of someone's life so the app can serve them in their actual season — not the one they're supposed to be in.

**Where it lives:** This is a hidden tile problem, a check-in model problem, and a product philosophy problem all at once. It touches the Dual-Perspective Intelligence Rule. It may also inform how the hidden tile is used — not just *who* is in someone's life, but *how they actually feel about it*.

**Status:** Not scoped. Flagged as a high-priority design consideration for onboarding and check-in model work. Do not let this disappear.

---

## 6. Open Questions — Carried Forward

- **Onboarding tiles redesign** — current tiles feel extractive. Must feel like recognition, not a form. Session 10 design workshop item. Do not skip
- **Relationship complexity signal** — the app needs to hold the emotional texture of a relationship, not just its existence. Hidden tile problem + check-in model problem. High priority
- **Back door copy and UI treatment** — principle locked, copy is `← back` placeholder. Session 10 workshop item
- **Home screen** — what does the user see after onboarding? This is the next major build item
- **Desktop image zoom** — `object-position` values in `gallery.js` are starting estimates, need tuning on wide screens
- **Arrival line fine-tuning** — all eight remain open to revision
- **Onboarding for remaining seven worlds** — Operator is the scaffold, others follow
- **What does the app do after the first session?** — home screen, nudge system, check-in model all unbuilt
- **Bucket list + annual goals** — flagged by external user (Session 8b). Not scoped. Revisit when home screen and check-in model are further along
- **Monetization model** — subscription, freemium, or something else?
- **Voice input** — webapp vs native iOS
- **Photo/receipt input** — on device or via API?
- **Notification philosophy** — frequency, tone, opt-out model across worlds

---

## 7. Session 10 Agenda

The dev tooling is solid. The core loop is proven. Session 10 is about what comes after.

**Track One — Back door:**
- Workshop and lock back door copy and visual treatment
- The principle is locked. The copy (`← back`) is a placeholder. It needs to earn its place — considered, not an escape hatch

**Track Two — Onboarding Tiles:**
- Redesign the Operator tiles so they feel like recognition, not extraction
- The tiles must get the AI what it needs without the user feeling interviewed
- The relationship complexity problem lives here — how does the app hold the emotional truth of someone's relationships, not just their existence?
- What is the right mechanism: a second tile layer, a hidden tile variant, a check-in model question, something else?

**Track Three — The Home Screen:**
- Decide what a returning Operator sees first
- Design and build the home screen — this becomes the template for all worlds
- What does the app already know? What does it surface first?
- What does "nothing to show yet" look like — day one after onboarding
- How does the home screen connect to the nudge and check-in model?

The home screen is the next proof of concept. Once it exists for the Operator, the product has a complete first experience from arrival to ongoing use.

---

*Your Life / Unlocked | Session 9 of Many | Confidential Product Document*
