# YOUR LIFE / UNLOCKED
## Product Development — Session 10c Handoff
*May 2026 | Confidential*

---

## 1. What This Session Accomplished

No code was written. Something more important happened.

The home screen got its philosophy. The product got its promise. And a few things that had quietly drifted got named and corrected.

This was a thinking session. The decisions made here will shape everything that gets built next.

---

## 2. Bugs Logged — To Fix in Session 11

Two new bugs identified from a sober review of the app as it stands:

**Bug: Partner name prompt fires when no partner was selected**
If the user indicates they don't have a partner during onboarding (situation tile: "just me" or similar), the team cascade must not ask for a partner name. Currently it does. The conditional logic isn't reading the situation answer and branching correctly.

Fix: `team.js` — read `store.get('onboarding')?.answers?.situation` before mounting the partner cascade. If no partner is indicated, skip the partner cascade entirely.

**Bug: Children copy assumes a partner is present**
When children are added, the language implies a partner was already named — phrasing like "kids names… too." If there is no partner, the children section copy must stand independently without referencing one.

Fix: `team.js` — children cascade copy needs a partner/no-partner conditional. Two copy variants. The "too" pattern is the tell — find and remove it for the no-partner path.

---

## 3. The Home Screen — Philosophy Locked

### The State That Triggers It

When the user has completed onboarding but the app has no tracked events, no check-ins, no logged data beyond the team model — the home screen is in its **day one state**. This is not an empty state. It is an opening state. The distinction matters.

The app isn't waiting to be useful. It's beginning to be.

### The Brief — Day One

The home screen is a briefing. On day one, the brief has nothing to brief yet — but it shows honestly what it will become. Each section of the brief is present but quietly unpopulated, with a single plain line explaining what arrives there when the app knows enough.

Not tutorial copy. Not feature promotion. Just honest.

*"Nothing on the horizon yet. Add something and I'll keep an eye on it."*

The empty state communicates capability without performing it. The brief fills itself in over time. The user barely notices it happening.

### One Cascade Per Opening

**This is locked.**

The home screen offers one cascade per session opening. One door. Not a dashboard of options. Not a list of features. One thing, offered quietly, that the user can walk through or walk past.

- If he engages — the app learns something.
- If he escapes — the app learns something different, but something.
- If he keeps coming back — that frequency is itself signal.
- If he consistently skips a category — that silence is data too.

Return behaviour, escape behaviour, depth of engagement — all of it feeds the intelligence model invisibly. The user never feels studied. He just feels that the app gets better over time.

### The AMPOCC Model — The Invisible Engine

The home screen cascade is driven by **AMPOCC** — the HUMINT framework for source assessment:

- **Access** — what can this person actually observe about their own life?
- **Motivation** — why are they engaging with this right now?
- **Profile** — who are they, what patterns are emerging?
- **Opportunity** — how often are they in a position to report?
- **Capability** — can they accurately relay what they're experiencing?
- **Corroboration** — does what they're sharing match other signals?

The user never sees AMPOCC. The app uses it to decide which door to offer next. The door that gets offered always feels like it was chosen for him — because it was.

**Important:** AMPOCC is architecture, not costume. The user never encounters this language. It informs the engineering logic, not the copy.

### Tiles on the Home Screen — Guarded Magic

AI-generated tiles were the right call for onboarding — the app was making a first impression, showing what it could do. On the home screen, that approach has diminishing returns. Used daily, precious AI tiles become a trick he's seen before.

**Home screen tiles are plain. Quiet. Almost ordinary.**

The intelligence isn't in the tile. It's in *which* tile gets offered, and *when*. The user doesn't see the reasoning. He just sees a door that happens to be the right one.

A therapist who asks the right question at the right moment feels more perceptive than one who explains why they're asking. Same principle.

### The First Door — "Things I Can Keep Track of For You"

On day one, after the brief, one tile is offered. Something like:

*"Things I can keep track of for you"*

He taps it. A short cascade — clean, simple, non-AI tiles. Not a feature tour. A genuine offer of custody. Birthdays. Upcoming appointments. Vehicle registration. School events. Whatever fits his world. He picks what he wants handed off. The app takes custody.

Double duty: immediately useful, and it tells the app which domains he actually wants help with.

If he doesn't tap it — it'll be there next time. No badge. No nudge. No guilt.

---

## 4. The Trackable Items Model — Architecture Decision

### The Master List

An exhaustive list of trackable items exists in the codebase — categorised, sub-listed, comprehensive. Everything that a person might want an intelligent assistant to hold for them.

**It is never shown all at once.**

The list is the warehouse. The home screen shows him one shelf at a time, when the timing is right.

### The Relationship Arc — Locked as Product Philosophy

The app builds trust the way trust actually works between people. You don't hand everything to someone you just met. You watch how they handle the small things first.

**Early days:** Small things. Easy wins. The app remembers his wife's birthday when he would have forgotten it. Flags that his car registration is due. Nothing heavy. Nothing that requires trust he hasn't given yet.

**Because it gets the small things right** — quietly, without making a fuss — he starts to trust it with more. A few weeks in he's telling it things he wouldn't have on day one. Not because the app asked. Because it earned it.

**The sequencing logic:** What's offered next is always adjacent to what he last opened. Someone who logged his car gets offered home maintenance next. Someone who logged his partner's birthday gets offered the kids' school events. The next door is always one step deeper into territory he's already entered.

**This is also the retention model.** Not streaks. Not notifications. Not engagement loops. Just quiet, compounding usefulness. The app gets more valuable the longer he uses it — because it actually knows more about his life.

---

## 5. Language and Costume — A Correction

### What Was Said

The Operator world, HUMINT, SMESC, AMPOCC — these are the *architecture*. The bones. The philosophy. They do not need to colonise the copy.

If every surface of the app speaks in military metaphor, it becomes a theme park. The costume exhausts the user. Worse — it starts to feel like something researched rather than something lived.

### What Is Locked

**The metaphors inform the thinking. They do not own the language.**

Most of the time, the copy is just clean. Direct. Human. The Operator framing gives the interaction philosophy — vertical depth, one cascade, silence as data, earned trust. The user doesn't need to see that scaffolding to benefit from it.

*"I've got you."* does more work than *"your intelligence asset is now active."*

The costume is for the product team. The user just gets the experience.

**Check:** Before any line of copy is written — is this the language of someone who lives in this world, or the language of an app that researched it? And: does this line need the costume at all, or is plain better?

---

## 6. Privacy — The Promise

### What Was Decided

The app makes a plain, direct commitment to the user about their data. Not a policy page. Not legal hedging. A promise.

**The commitment:**
> *"What you share here is yours. We use it to make the app more useful to you. That's it. We don't sell it, share it, or use it to build a profile for anyone else."*

Said once, early, without belabour. Not defensive — stated as what the product *does do*, not what it doesn't.

The "within bounds" reality — legal limits, safety limits — exists but is not led with. The principle is stated. People understand the world has edges.

### Why This Matters Commercially

If data isn't the business model, the business model is subscription. Which *reinforces* the trust — the user is paying for something, not being monetised as something. The privacy commitment and the revenue model point in the same direction. That is unusual. It is worth saying plainly.

### Where It Lives in the Product

Not a modal. Not a terms screen. A single honest line somewhere in the early experience — stated as a relationship agreement, not a legal disclaimer. Timing and placement to be determined in Session 11.

---

## 7. The Vision — Said Plainly

This emerged in conversation and belongs in the record.

Everything that would make someone's life easier already exists — AI, calendars, reminders, tracking, notes. But it's fragmented across a dozen apps that don't talk to each other and don't know the user. The user is the integration layer. They're doing the work of connecting it all in their head every day.

**What doesn't exist yet:** one thing that holds it all. That knows the partner's name and the car registration and the kid's school concert and the thing being avoided and the state of a relationship — and connects those dots *before the user has to ask.*

That isn't a productivity app. It isn't a journal. It isn't a life coach.

**It's an intelligence layer over an actual life.**

The reason it doesn't exist isn't technical. The technology is all there. It's because nobody has built it with the right philosophy. Every attempt has been too clinical, too gamified, too extractive, or too shallow to earn the trust it would need to be genuinely useful.

Ten sessions have been spent building the philosophy first. That's why this one might actually work.

---

## 8. Principles — New Additions

### The Plain Language Rule
*(Session 10c)*

> **The metaphors are for the architecture. The copy is for the person.**

The world analogies — Operator, Meadow, Summit, and the rest — inform how the app thinks and what intelligence it gathers. They do not require the user to wear the costume too. Most copy should be plain, direct, and human. Analogy-specific language is used where it genuinely earns its place. Everywhere else: say the plain thing.

**Check:** Does this line need the costume, or is the plain version better? Would someone outside the analogy understand it immediately? If not, rewrite it.

---

### The Trust Ladder Principle
*(Session 10c)*

> **The app earns access. It does not assume it.**

The trackable items list is exhaustive. The app reveals it slowly. Early interactions are small, low-stakes, easy to hand off. As the app proves it can hold small things well, the user hands it bigger things. The depth of the relationship at any point in time reflects the trust that has been earned — not the trust that was assumed at onboarding.

**Check:** Is this feature being offered at the right point in the relationship? Has the app earned the right to ask for this yet?

---

### The Privacy Promise
*(Session 10c)*

> **What the user shares is theirs. The app uses it to serve them. Nothing else.**

The product does not sell user data, share it with third parties, or use it to build profiles for anyone other than the user themselves. This is not a policy position. It is a product identity. The business model is subscription — the user pays for a service, and the service serves them.

**Check:** Does this data use serve the user, or does it serve someone else? If someone else benefits from this data more than the user does, it doesn't happen.

---

## 9. Updated Session 11 Agenda

### Track One — Bug Fixes (Before Anything Else)

- Fix partner name prompt firing when no partner selected (`team.js` conditional on situation answer)
- Fix children copy assuming partner presence (`team.js` copy variants for partner / no-partner paths)
- Lock gap tiles in `worlds.json` — remove AI generation variability
- Fix children entry UX — signalling for multiple children one at a time
- AI reflection latency — advance screen first, inject reflection async
- Confirm back button behaviour through partner cascade sub-steps on device

### Track Two — The Home Screen

- Build `home.js` — the briefing screen
- Day one state design — brief present but honest about being empty, one door offered
- The "things I can keep track of for you" cascade — clean tiles, no AI generation, genuine offer of custody
- Trackable items master list — build the warehouse, decide the initial reveal set
- The privacy line — where does it live, what does it say exactly
- AMPOCC-driven tile selection logic — rule-based to start, smarter over time
- Brief sections — what are the named sections of the brief, what populates each one

---

*Your Life / Unlocked | Session 10c of Many | Confidential Product Document*
