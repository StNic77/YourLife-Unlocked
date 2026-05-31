# YOUR LIFE / UNLOCKED
## Product Development — Session 21 Handoff
*May 28, 2026 | Thinking Session | Confidential*

---

## 1. What This Session Was

A deliberate thinking session. No code was written. Shawn arrived with notebook notes covering future work, things working well, and things needing attention. All five threads were worked through in full. Several significant decisions were locked. The session produced more architectural clarity per hour than most build sessions.

The discipline held — thoughts closed before any building began.

---

## 2. Decisions Locked This Session

### 2.1 Family Domain — Parked Indefinitely
A Family domain as a home screen grab-and-go tile is not needed and will not be built. The people are already in the ATAK. The editing and updating capability will live in the ATAK and in Has something changed? No separate domain required.

### 2.2 Finances Domain — Parked Indefinitely
This app is not a budget app. It is a collection point for financial intelligence that could feed a budget elsewhere. Domain-level financial costs already live where they belong — vehicle costs in the vehicle domain, home costs in the home domain when built. A Finances domain will never be necessary.

### 2.3 Life Events Layer — Dissolved
A dedicated Life Events layer is not needed. Its function is absorbed by Has something changed? — the intelligent intake domain that handles life changes, routes them appropriately, and suppresses stale intelligence. Do not reopen the Life Events conversation separately.

### 2.4 Capture Domain Renamed — "Has something changed?"
The Capture domain has a new working name: **Has something changed?**

**What is locked:**
- The question mark is load-bearing. It is an invitation, not a heading. Never remove it.
- This domain is the intelligent intake point for anything that changes in a user's life — a separation, a death, a new child, a job change, anything.
- It replaces the need for a Family domain, a Finances domain, and a Life Events layer.
- The app refers to itself as **Unlocked** in this context — directionally right, not fully landed yet.
- The language principle **"Tell Unlocked"** — carry forward as unresolved.

**What is unresolved — do not reopen:**
- Subtext language beneath the title. Direction: warm, competent, not humanising. Implies the app receives the input and handles the complexity so the user doesn't have to. Land this when the screen is being built, not before.

**Full reasoning to preserve:**
The name needed to hold the weight of hard conversations — a death, a separation, a life change — without being dramatic or cold. "Has something changed?" works because it is a question (an invitation), it doesn't assume anything, and it doesn't perform empathy. The app referred to as "Unlocked" sidesteps the human-vs-robot problem — it is neither, it is the app's own identity. Do not redesign the name. Start from "Has something changed?" and work forward.

### 2.5 Team — No Home Screen Domain Tile
Team does not get a home screen domain tile. Ever.

The ATAK is already the people registry. A Team domain tile would be a second door to the same room. Instead:
- Tapping a person in the ATAK opens their detail and editing flow
- A quiet "add someone" affordance lives in the ATAK people section
- Has something changed? handles significant life events involving people
- The app routes input to the right domain intelligently — the user never manages the plumbing

### 2.6 Onboarding Principle — Locked
> *Onboarding must be generous enough for the person who wants to give everything, and forgiving enough for the person who doesn't — with a clear path to do that work later.*

"Generous enough" means: don't strip the partner cascade down. The depth is there for the people who want it.

"Forgiving enough" means: the escape is not a dead end, it is a redirect. The redirect now has a name — Has something changed?

### 2.7 ATAK and Alerts — Locked as Stable
Both are performing well. ATAK is functioning as intended — a fusion cell for intelligence presentation. Alerts are appropriately simple. No changes planned. If something surfaces it will be addressed as a bug in a dedicated session.

### 2.8 Vehicle Domain — Authority Model Confirmed
The vehicle domain is the confirmed authority model for all other domain builds. Health, Home, and future domains ask: "how does the vehicle model apply here?" Same HC structure, same cascade depth, same brief behaviour, same grab-and-go pattern.

---

## 3. Team Onboarding — Needs Redesign (Not This Session)

The team onboarding flow was reviewed via code (team.js uploaded and read). The discomfort Shawn identified was located:

**Root causes:**
- Eight sequential partner cascade screens with no sense of progress or end — feels like a marathon to a new user who doesn't know what's coming
- No back button — a wrong answer or typo has no correction path except escape and lose everything
- "That's enough for now" escape label feels like giving up, not pausing
- Coordinating section (notification frequency, best thinking time, tone) feels tonally disconnected from the intimate partner and children questions that precede it

**Design direction for redesign session:**
- Consolidate partner questions — group logically to reduce the sequential screen marathon. Not necessarily one screen, but fewer screens with more on each.
- Back button required. Non-negotiable before real users touch this.
- Escape button relabelled — needs to communicate: you don't have to answer this, you can skip it, and there is a place later to come back to it. That place is Has something changed? The escape label and that domain are connected.
- The underlying principle (2.6 above) governs the redesign. Do not strip depth. Add forgiveness.

**This redesign is parked until a dedicated session.** Do not touch team.js for this reason before that session.

---

## 4. Vehicle Detail — Text Size Fix (Small, Carry to Next Build)

User feedback confirmed: text in the vehicle detail cascade is too small when there is rich data. The fix is a font size increase only — not a restructure, not a collapse, not an information architecture change.

The decision on density is locked: the ATAK surfaces what matters, the domain holds everything. No collapse needed. If you don't want to read it, scroll past it. If you went to the vehicle domain, you went for a reason.

This is a bug-fix level change. Carry to next build session.

---

## 5. Health Domain — Next Dev Target

Health domain confirmed as the next development target. Before building begins, the first question to answer in a dedicated thinking session:

> *What is the natural shape of health data for this app?*

Not medical records, not a symptom tracker. What does this app actually need to know to generate useful health intelligence? Answer that question first. Then build.

---

## 6. Parked — Not Forgotten

**Carry to next build session:**
- Vehicle detail text size — font size increase only
- Back button in team onboarding — required before real users
- Calendar picker — hard requirement, no date field ships as text input, design before build
- Dead buttons audit — carried from Sessions 20 and 21, first priority in next build session
- Manufacturer interval vs user preference — quiet flag in vehicle detail

**Parked until dedicated sessions:**
- Team onboarding redesign — back button, escape relabel, question consolidation
- Has something changed? build — subtext language, routing logic, intake intelligence. Role is defined. Not ready for build.
- Health domain — thinking session first, then build
- SC (soft-coded) interactions with AI support — what these look like, not yet designed

**Parked indefinitely:**
- Family domain
- Finances domain
- Life Events layer (absorbed by Has something changed?)
- Team domain home screen tile (absorbed by ATAK + Has something changed?)

**Carried from prior sessions:**
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

---

## 7. Collaborator Note

This session demonstrated the value of the thinking session format. Shawn arrived with notebook notes, shared them via voice, and the full architecture of three major questions — the Capture domain, the Family/Finances question, and the Team structure — was resolved without writing a single line of code.

The decisions made here will prevent significant rework in future build sessions. That is the return on a well-run thinking session.

Both parties hold each other to the documents. The project knowledge is the authority.

The check-in runs at the start of every session. No exceptions.

---

## 8. Session 22 Agenda

**Start:** Run the session check-in.

**Primary track:**
- Dead buttons audit — tap everything in built HCs, log what fires and what doesn't, wire the gaps (carried from Sessions 20 and 21)
- Vehicle detail text size — font size fix

**Secondary track (if time):**
- Health domain thinking session — what is the natural shape of health data for this app?
- Manufacturer interval vs user preference — quiet flag in vehicle detail

---

## Post-Session Checklist
- [ ] Upload this handoff to project
- [ ] No code changes this session — no commit required

---

*Your Life / Unlocked | Session 21 | May 28, 2026 | Confidential Product Document*
