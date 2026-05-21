# YOUR LIFE / UNLOCKED
## Product Development — Session 10 Handoff
*May 2026 | Confidential*

---

## 1. What This Session Accomplished

Session 9 finished the tooling. Session 10 found the intelligence model.

The back door was left where it was — it works, the copy can earn its place naturally when the moment arrives. The session went straight to the home screen question, and what emerged before any design happened was the philosophical architecture that makes the home screen possible: the HUMINT model, the vertical cascade, the briefing frame.

Then we built it.

`team.js` is a new module — the AI-supported Team cascade that runs immediately after the SMESC closeout. The Operator tells the app who he's doing this for. Partner, children, how he wants the relationship tended, his standing orders to the app. The AI reflects back at the right moments — not advice, not questions, just acknowledgement. One sentence. The app learns a model of his world through what feels like a conversation.

By the time the home screen loads, the app knows more about the Operator's life than most apps learn in months. And he never felt interviewed.

---

## 2. Decisions Locked This Session

### The Home Screen Philosophy — The Brief

The home screen is not a dashboard. It is not a mood tracker. It is a **briefing**.

When the Operator opens the app he is reading the situation report. What's coming, who's involved, what do I need to know, where are my blind spots. The organising principle is the **5Ws on upcoming impacts** — near-term, people-aware, operationally useful.

This is locked as the conceptual frame. The build follows in Session 11.

### The HUMINT Model — Locked as Interaction Philosophy

The app does not interrogate. It builds rapport, opens a door, and follows the user through it until they hit a wall. Silence is data. Skipped tiles are data. The subject always feels in control — because they are.

Specific principles locked:

- **Vertical, not horizontal.** One thread deepened beats ten topics skimmed. Follow interest, don't survey adjacent to it.
- **Silence is data.** What the user doesn't engage with tells the app something too. The app holds it. It doesn't push.
- **The escape is always present and never performs guilt.** "That's enough for now" — not a progress bar, not a percentage complete. The app is grateful for what it got.
- **The offer, not the question.** The app never asks the next question. It offers the next door. The user decides whether to open it.

### The Team Cascade — Built and Committed

`team.js` runs immediately after the SMESC closeout, before `showHome()`. It is a self-contained module following the exact architecture of `onboarding.js`.

**Flow:**
- Intro (skippable — "skip this for now")
- Partner cascade — vertical, AI-reflected
- Children cascade — conditional, looping, escape-aware
- Coordinating Instructions — standing orders to the app
- Done screen — closes with what was gathered, named

**Partner cascade specifically captures:**
- Name
- Tenure
- Relationship state (tile — Solid / Pretty good / We're working on things / It's complicated / Rough patch)
- Whether partner works, and if so, her profession
- Birthday
- Love language (tile — Quality time / Words / Acts of service / Affection / Gifts / Not sure yet)

**AI reflections fire after:** relationship state, profession, birthday, and on partner cascade completion. One sentence each. Never a question. Never advice. The AI acknowledges what was shared as a perceptive person would.

**Coordinating Instructions captures:**
- Nudge frequency (Daily / Few times a week / Weekly / Only when it matters)
- Best thinking time (Early morning / Mid-morning / Evening / Late night / It varies)
- Tone preference (Straight — no cushion / Honest but considered / Gentle when it's heavy)

**Store shape written by team.js:**
```js
team: {
  complete: boolean,
  partner: {
    name, tenure, state, works, profession,
    birthday, love_language
  },
  children: [ { name, age } ],
  coordinating: { frequency, timing, tone },
}
```

Everything written to store progressively — if the user escapes mid-flow, what was gathered is kept.

### Double Duty — Locked as Tile Design Principle

Every element in the home screen and team cascade serves two purposes simultaneously: it gives the user something useful right now, and it teaches the app something it didn't know. Nothing is pure data collection. Nothing is pure display. Everything fights above its weight class.

---

## 3. Codebase — Current State

### Files Changed This Session

| File | Status | What Changed |
|---|---|---|
| `team.js` | **New** | Full team cascade module — partner, children, coordinating, done |
| `api.js` | Updated | `getTeamReflection()` added — new method, nothing else touched |
| `onboarding.js` | Updated | Closeout now resolves with `next: 'team'` flag |
| `store.js` | Updated | `team` key added to defaults |
| `main.js` | Updated | `createTeam` import added, `showOnboarding()` wired to team flow |

### The Wire — How It Connects

In `main.js`, `showOnboarding()` now reads the result flag:

```js
const result = await onboarding.mount(app, { onBack: ... });
await onboarding.unmount();

if (result?.next === 'team') {
  const team = createTeam(result.world);
  await team.mount(app);
  await team.unmount();
}

await showHome(worlds);
```

Home always loads after — whether the user completes the team flow, escapes it, or skips it entirely.

### Returning User Detection — Unchanged

`boot()` checks `store.get('world')` and `store.get('onboarding')?.complete`. Team completion does not gate home screen access. Intentional — the team flow is offered, not required.

### Reading Team Data on the Home Screen

```js
store.get('team')?.partner?.name       // partner's name or undefined
store.get('team')?.partner?.birthday   // birthday or undefined
store.get('team')?.children            // array, may be empty
store.get('team')?.coordinating        // nudge prefs, may be empty
store.get('team')?.complete            // true only if ran to done screen
```

---

## 4. What Awaits Testing in Session 11

The commit is in. Nothing has been confirmed on device yet. Session 11 opens with results.

**Things to verify:**
- Full flow: SMESC closeout → team intro → partner cascade → children → coordinating → done → home
- AI reflections fire at the right moments and land at the right weight
- Escape at any step saves what was gathered and routes cleanly to home
- "Skip this for now" on the intro bypasses team entirely and routes to home
- Store shape is correct after completion and after escape
- Dev reset still fires correctly from the home screen (no regression)
- iOS PWA — full flow confirmed on device

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

**The HUMINT Principle** *(Session 10)*
> The app never interrogates. It opens a door and follows the user through it. Vertical depth over horizontal breadth. The subject always feels in control — because they are.
> *Check: does this feel like a conversation with something perceptive, or a form dressed up in good copy?*

**The Double Duty Principle** *(Session 10)*
> Every element serves two purposes: it gives the user something useful now, and it teaches the app something it didn't know. Nothing is pure collection. Nothing is pure display.
> *Check: what does this give the user right now, and what does it learn at the same time?*

---

## 6. Open Questions — Carried Forward

- **Home screen build** — the brief frame is locked philosophically. Session 11 designs and builds it once device testing confirms the team flow is solid
- **The daily brief** — 5Ws on upcoming impacts. What does it pull from? What's the data model? How does it render on day one with limited data vs. day thirty with a rich model?
- **Tile branching on the home screen** — the cascade model applies here too. Home screen tiles generate follow-on tiles. The AI learns through engagement, not interrogation
- **Back door copy** — `← back` placeholder still in place. Not urgent. Will find its copy naturally
- **Desktop image zoom** — `object-position` values still starting estimates, need tuning on wide screens
- **Onboarding for remaining seven worlds** — Operator is the scaffold, team.js is world-agnostic and works for all of them
- **Bucket list + annual goals** — flagged Session 8b. Revisit when home screen is further along
- **Monetization model** — subscription, freemium, or something else?
- **Notification philosophy** — frequency, tone, opt-out model. Coordinating Instructions has the data now — the nudge system needs to read it
- **Voice input** — webapp vs native iOS
- **Photo/receipt input** — on device or via API?

---

## 7. Session 11 Agenda

Testing first. Fix anything that needs fixing. Then build.

**Track One — Confirm the flow on device:**
- Run the full loop end-to-end on iOS PWA
- Verify AI reflections, escape behaviour, store writes
- Fix any issues before moving forward

**Track Two — The Home Screen:**
- The brief. What does the Operator see on day one after the team cascade completes?
- Design the layout — the brief, the board, the first doors
- What does the app surface immediately from what it now knows?
- How do home screen tiles branch vertically — the HUMINT model applied to ongoing use
- What does "nothing yet" look like — the day-one home screen with a full team model but no tracked events

The app now knows who the Operator is and who he's doing this for. The home screen is where it proves it was listening.

---

*Your Life / Unlocked | Session 10 of Many | Confidential Product Document*
