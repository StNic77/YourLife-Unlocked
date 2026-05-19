# YOUR LIFE / UNLOCKED
## Product Development — Session 8 Handoff
*May 2026 | Confidential*

---

## 1. What This Session Accomplished

Session 7 found the product's voice. Session 8 built the thing that voice belongs to.

The full Track One implementation is complete — the welcome screen has its final typography, layout, and tagline. The gallery speaks in the right language. All eight arrival lines are live. The SMESC onboarding flow runs end-to-end for the Operator, proven on device, with AI-driven mission tiles, the hidden tile present and correctly weighted, and the closeout line returning authority to the user.

The core loop is now real: welcome → gallery → onboarding → home. A person can arrive, choose their path, complete their onboarding, and return as a recognised user. The product works.

This session did not design the home screen. That is the next unlock.

---

## 2. Decisions Locked This Session

### Track One — All Implemented

Every item from the Session 7 Track One agenda is now in the codebase and confirmed working on device:

- **"start here"** — gallery enter button copy live
- **"Find somewhere that feels like you."** — bridge line live in `gallery.js`
- **Bottom-left text layout** — welcome screen layout locked and implemented
- **"Your Life / Unlocked"** — app name treatment live in Playfair Display, 500 weight, letter-spacing 0.05em
- **"Life, tended."** — tagline live in Lora italic, 300 weight, letter-spacing 0.06em
- **Arrival lines** — all eight wired into `worlds.json` and confirmed pulling correctly
- **Desktop image zoom** — `DESKTOP_OBJECT_POSITION` map implemented in `gallery.js`, per-image `object-position` values set as starting points for fine-tuning
- **Terminology** — "your world" → "your path" throughout the gallery UI

### Track Two — Operator Onboarding Complete

The full SMESC flow runs end-to-end:

- **Arrival** → situation tiles → mission (AI-driven) → execution statement → service/support tiles → command signals statement → closeout
- **AI mission tiles** generated via `api.js` using `getMissionTiles()`, informed by world ID and the user's situation answer
- **Hidden tile** appended after AI tiles — dimmer border, quieter text, identical tap behaviour. Present. Not highlighted. Just there.
- **Progress dots** track position through all seven steps
- **State persisted** — answers written to store mid-flow, full onboarding object written on closeout
- **Returning user detection** — `boot()` checks `store.get('world')` and `store.get('onboarding')?.complete`, routes to home screen if both present

### The Back Door — Principle Live, Copy Pending

The back button is implemented and functional — steps backward through the SMESC flow, returns to gallery from the arrival step. Current copy is `← back`, which is a placeholder. The copy and visual treatment are a Session 9 workshop item. The principle is locked and the behaviour is correct.

---

## 3. Codebase — Current State

### Files Changed This Session

| File | Status | What Changed |
|---|---|---|
| `worlds.json` | Updated | All eight arrival lines replaced with Session 7 locked versions |
| `index.html` | Updated | Title, meta description, Google Fonts (added Playfair Display, Lora) |
| `global.css` | Updated | Added `--font-display` and `--font-tagline` CSS variables |
| `welcome.js` | Rewritten | Name treatment, tagline, bottom-left layout, new typography |
| `gallery.js` | Updated | Bridge line, button copy, terminology, desktop object-position map |
| `main.js` | Updated | `showOnboarding()` wired to `onboarding.js` module, dev reset param added |
| `onboarding.js` | New | Full SMESC module — all seven steps, tile interaction, AI tiles, hidden tile, progress dots, back button, store writes |

### Known Dev Item — Remove Before External Users

`main.js` contains a dev reset triggered by `?reset` in the URL:

```js
if (new URLSearchParams(location.search).has('reset')) {
  store.reset();
}
```

This is currently unguarded. Before any external user sees the app, either:
- Gate it: `if (location.hostname === 'localhost' && ...)`, or
- Remove it entirely

Current dev reset method (console): `localStorage.clear(); location.reload();`

A text file with this command has been saved in the project folder.

---

## 4. What Was Confirmed Working

- Welcome screen → gallery → onboarding → home: full loop proven on device
- Operator SMESC flow runs all seven steps without sticking
- AI mission tiles generate, display, and confirm correctly
- Hidden tile present at correct visual weight — not highlighted, not announced
- Returning user lands on home screen, not welcome screen
- Back button steps through the flow correctly
- Store persists across sessions — `onboarding.complete` and `world` survive browser close and reopen

---

## 5. The Timing Bug — Fixed

The original `onboarding.js` used competing `setTimeout` calls to manage content swaps and listener attachment. This caused the flow to stick — most visibly at the closeout step, where the button listener was attaching before the HTML existed in the DOM.

The fix: `setContent()` now returns a Promise that resolves only after the HTML is in the DOM and the fade is complete. All step renderers are `async` and `await` it before attaching listeners. The elements are guaranteed present when listeners look for them.

---

## 6. Founding Principles — Carried Forward

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

## 7. Open Questions — Carried Forward

- **Back door copy and UI treatment** — Session 9 workshop. Principle locked, copy is `← back` placeholder
- **Home screen** — what does the user see after onboarding? This is the next major build item
- **Dev reset gate** — `?reset` param in `main.js` needs to be gated or removed before external users
- **Desktop image zoom** — `object-position` values in `gallery.js` are starting estimates, need tuning against actual images on wide screens
- **Arrival line fine-tuning** — all eight remain open to revision if something sharper surfaces
- **Onboarding for remaining seven worlds** — Operator is the scaffold, others follow the same state machine
- **What does the app do after the first session?** — the home screen, nudge system, and check-in model are all unbuilt
- **Monetization model** — subscription, freemium, or something else?
- **Voice input** — how does it work in the webapp vs native iOS?
- **Photo/receipt input** — on device or via API?
- **Notification philosophy** — frequency, tone, opt-out model across worlds

---

## 8. Session 9 Agenda

The core loop works. The Operator onboarding is proven. Session 9 has two tracks:

**Track One — Polish and back door:**
- Workshop and lock back door copy and visual treatment
- Fine-tune desktop `object-position` values per image on a wide screen
- Gate or remove the `?reset` dev param in `main.js`
- Review Operator onboarding on device for any copy, pacing, or visual issues

**Track Two — The Home Screen:**
- Decide what the user sees first when they return
- Design and build the home screen for the Operator — this becomes the template
- What intelligence is surfaced? What does the app already know? What does it show first?
- How does the home screen connect to the nudge and check-in system?
- What does "nothing to show yet" look like — the home screen on day one after onboarding

The home screen is the next proof of concept. Once it exists for the Operator, the product has a complete first experience from arrival to ongoing use.

---

*Your Life / Unlocked | Session 8 of Many | Confidential Product Document*
