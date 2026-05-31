# YOUR LIFE: UNLOCKED
## Rules, Principles & Design Guidance
*Living Document — Updated Each Session | Last Revised: May 31, 2026 (Session 26) | Confidential*

---

> This document is the single source of truth for how decisions get made on this product. Every principle here was earned through conversation, not assumed. When something is added it stays unless explicitly retired. When a session produces a new rule or check, it gets added here before the handoff is written.

---

## PART 0 — SESSION PROTOCOL

### 0.1 The Session Check-In Protocol
*(Session 15, updated Session 19)*

**Every session begins here. No exceptions.**

**Trigger phrase:** `run the session check-in`

**Claude's obligation before the check-in begins:**
Before responding to any agenda item, design question, or build request, Claude reads — not recalls, actually reads — the following documents in the project:
- The last three to four session handoffs
- This Rules and Guidance document

If Claude has not done this, Shawn stops the session until it is done. This is non-negotiable. The project knowledge is the authority. Working from memory or momentum produces drift. Drift compounds. Twenty-three sessions of coherent work depends on this standard being held at the start of every session.

**The six check-in questions:**

1. Did Shawn read the last handoff before this session?
2. Did Shawn run the app on device before this session?
3. What did Shawn observe on device — what felt broken, unclear, or wrong?
4. Is there anything on the parked list that has been waiting too long?
5. Is the session agenda still right, or does something need to shift?
6. Is there anything to clear before building begins?

**The collaborator framing:**
The check-in is a moment of genuine collaboration, not status reporting. Claude is a collaborator, not an executor. If something in the agenda conflicts with a principle locked in this document, the conversation happens before any code is written. The document is the authority — not memory, not momentum, not the energy of the session.

**Session intent:**
After the six questions, Claude states the session intent in one or two sentences. Both parties confirm before building begins.

---

## PART 1 — FOUNDING PRINCIPLES

These are not preferences. They are guardrails. Every feature, every prompt, every notification, every line of onboarding copy gets measured against all of these before it is built.

---

### 1.1 The Authenticity Standard
*(Session 1)*

> **No performed depth. No facade of meaning wrapped around superficial data collection.**

The big dating and lifestyle apps have taught users to expect questionnaires dressed up as self-discovery. Your Life: Unlocked will never do this. Every question asked must earn its place. If the app can learn something by watching rather than asking, it watches. If it must ask, it asks plainly and only once. The tone is a trusted friend — not a therapist fishing for billable insights.

**Check:** Before any onboarding question, feature, or prompt is built — does this feel like something a real person would say, or does it feel like an app trying to seem meaningful?

---

### 1.2 The Restraint Principle
*(Session 1)*

> **Driving engagement is not the goal. The app succeeds when you don't need to open it.**

Every major consumer app is architected to maximize time-on-app. Your Life: Unlocked is built on the opposite philosophy. It helps when you need it and stays out of the way when you don't. Success looks like: the nudge landed at the right moment, you acted on it, and you got on with your life.

**Check:** Before any notification, reminder, or re-engagement feature is built — does this serve the user's life, or does it serve the app's metrics?

---

### 1.3 The Tending Philosophy
*(Session 3)*

> **This app is not in the extraction business. It tends. It notices. It shows up at the right moment and retreats when its work is done.**

Every major platform extracts — attention, emotion, time, data. The entire attention economy is built on taking from the user. Your Life: Unlocked gives. It notices. It asks nothing in return except the occasional update so it can serve better. People are exhausted from being extracted from. They feel it even when they can't name it. This app makes people feel tended to. That is not a feature. It is a feeling that almost nothing in their digital life currently provides.

**Check:** Does this feature take from the user, or give to them?

---

### 1.4 The Seasonal Intelligence Principle
*(Session 4)*

> **Analogies are seasons, not identities. The app learns which season the user is in and adapts invisibly.**

A person is not a Meadow person. They are a person who needs the Meadow right now. Last year they needed the Summit. In a crisis they reach for the Operator. The app learns which season they're in. It never announces the shift. The user just feels slightly more met than usual. When the season passes, it brings them home again.

**Check:** Are we serving the user's current season, or the identity they presented at onboarding?

---

### 1.5 The Cheesy Hook Check
*(Session 5)*

> **Before any analogy-specific language is locked — ask: does this sound like an app trying to seem like this world, or someone who actually lives in it?**

The real person in any analogy world will notice the difference between language that was researched and language that was lived. The Operator who served knows the difference between authentic and performative. So does the gardener. So does the rancher. The goal is not to use the right terminology — it is to think the right way.

**Check:** Would a real inhabitant of this world find this embarrassing? If yes, it goes.

---

## PART 2 — PRODUCT DESIGN RULES

Rules that govern how features, flows, and interactions are designed.

---

### 2.1 Input Philosophy
*(Session 2)*

The app never asks the user to do the thinking. It accepts what they give it — a voice note, a photo, a quick thought — and does the work quietly in the background. Input must be frictionless. The app extracts the intelligence from raw, messy input. The user never configures. The app learns.

**Examples:**
- Photo of a receipt → app extracts date, service type, next due interval
- Voice note while driving → app captures the thought, files it, acts on it at the right moment
- Quick text → app infers context, asks nothing further unless necessary

---

### 2.2 The Oil Change Model — Core Logic Pattern
*(Session 2)*

This is the template for how the entire reminder and nudge system works.

1. User provides raw input *(photo, voice note, manual entry)*
2. App extracts the intelligence *(date, type, recurrence interval)*
3. App sits quietly with that data
4. At the right moment, app opens a small conversation
5. User responds casually
6. App updates its model and goes quiet again

**This is not a notification. It is a check-in.**

The same logic applies to: dental appointments, insurance renewals, medication refills, seasonal tasks, relationship milestones, anniversaries, and anything with a natural recurrence cycle.

---

### 2.3 Notification Philosophy
*(Sessions 2, 5)*

The app does not manufacture urgency. It does not guilt the user for not opening it. It does not create streaks, badges, or artificial engagement loops. A nudge arrives at the right moment, in the right language, and then retreats. The user acts on it or doesn't. The app does not follow up with a reminder that they didn't act on it.

**On urgency:** Master Warning items (see 2.8) are not manufactured urgency. They surface real consequences the user has a right to know about — expired registration, lapsed insurance, missed critical deadlines. The urgency belongs to the situation, not the app. The app is the messenger, not the manufacturer.

**The seasonal version of this rule:**
- Operator: timely, accurate, actionable. No noise.
- Range: arrives like weather changing. Unhurried.
- Garden: patient, one thing at a time, nothing forced.
- Meadow: the lightest possible intervention. A single blade of grass bending.

---

### 2.4 Accessibility — No Typing Unless the User Wants To
*(Session 5)*

Every interaction defaults to tappable tiles. The user should never be required to type. Text input is always available but never required. This is not just a UX preference — it is a cultural requirement for analogies like Operator where forms and questionnaires would immediately break the world.

**Tile design rules:**
- 3–5 options maximum per question
- One option should always be an escape hatch *(Not sure yet / It changes / Other)*
- AI-driven expansion available on any tile — one follow-on exchange if tapped, never more without invitation

---

### 2.4b The Date Input Rule
*(Session 22)*

> **Every date input field has a calendar picker. Text entry remains available alongside it. Neither replaces the other.**

No date field ships as a text-only input. The calendar picker is always present. The user who wants to type a date can. The user who wants to tap through a calendar can. Both paths write to the same stored value.

**Applies to:** all intake flows, all tap-to-edit fields, all log forms, all new date fields going forward.

---

### 2.5 The Gap Page — 11-Tile Model
*(Session 5, revised Session 12)*

The gap page is the onboarding moment where the user indicates what they want the app to help with. It is not a diagnosis. It is not a symptom checklist. It is a door.

**The original hidden tile model was retired.** The approach of burying high-signal tiles among functional options was replaced with an 11-tile open model — lighter to heavier, laid out so the grid reads as a natural mix. The user self-selects. The app holds what they choose and acts on it at the right moment.

**Current 11-tile set (all worlds, language flexes by world):**

Lighter / organisational:
- Getting organized
- How I spend my time
- Something I'm working toward
- My daily routine

Middle weight:
- My relationships
- My professional life
- Money

Heavier:
- My physical health
- My emotional well-being
- My personal life
- Something I haven't dealt with yet

**Multi-select. No tile feels like a diagnosis. Order is deliberate — light to heavy top to bottom.**

**"Something I haven't dealt with yet"** is a high-signal tile. The person choosing it has already done the work of acknowledging it. The app holds it quietly and says nothing at the time. It surfaces later when the relationship has earned it.

---

### 2.6 The Dual-Perspective Intelligence Rule
*(Session 1)*

The app speaks to everyone. The same event — an anniversary, a difficult date, a relationship moment — is understood from both sides. A man and a woman could both receive a nudge about the same anniversary, with framing and advice that resonates differently for each. Smart, not obvious. Never preachy. Through helpfulness, not lectures.

---

### 2.7 Counter-Cultural Where It Matters
*(Session 1)*

The app takes a deliberate stance against toxic relationship content. It offers honest, grounded relational advice across all seasons. It does this without being preachy — through helpfulness, not lectures. The Trojan horse principle: meet the user in their world completely, without judgment. The intelligence delivered in that language quietly teaches what they need to learn. No confrontation. No lecture. Just tending.

---

### 2.8 The Alert Architecture — Master Warning and Master Caution
*(Session 18, formerly 2.10)*

> **Alerts alert. They do not resolve. The cascade resolves.**

Alerts are a warning layer, not a domain. They surface in two places: the alerts grab and go (peltors in the Operator world) and the ATAK brief. They never have their own resolution flow. Tapping an alert routes directly to the owning cascade — registration, medical, insurance, maintenance — where the user handles it.

**Two tiers, like a real warning panel:**

**Master Warning** — deal with this now. No or severely limited snooze.
- Registration expired
- Insurance lapsed
- Mortgage renewal in critical window
- Medical appointment critically overdue
- Any hard deadline that has passed or is imminent

**Master Caution** — deal with this soon. Snoozable.
- Service due within 30 days
- Registration within 30 days
- Insurance renewal approaching
- Maintenance flagged and overdue
- Any soft deadline within the watch window

**The governing logic:**
- Every urgent item is classified as Warning or Caution at creation
- The ATAK surfaces both tiers — Warning items listed first, visually distinct
- Alerts grab and go shows the same stack
- Snooze is available on Caution items only — Warning items require action or explicit deferral
- Once handled via cascade, the item is cleared from both surfaces

**Check:** Before classifying any urgent item — is this "deal with this before it deals with you" (Warning) or "deal with this before it becomes a Warning" (Caution)?

---

### 2.9 The Cascade Depth Rule
*(Session 18, formerly 2.11)*

> **Depth of cascade matches complexity of object. Nothing is locked — but not everything needs its own room.**

Every piece of data the app holds must be reachable and correctable. The question is where that correction happens.

**The rule:**
- **More than four fields** → the object earns a full detail cascade (tap-to-edit within the cascade)
- **Four fields or fewer** → editable directly within the grab and go brief

**Applied:**
- Vehicle → full detail cascade (year, make, mileage, service history, tires, watch list, facts…)
- Partner → detail cascade (name, pronoun, birthday, love language, relationship state)
- Child → detail cascade (name, pronoun, age, birthday, whose)
- Maintenance task → editable in the brief (label, interval, last done, next due)
- Capture note → editable in the brief (text only)
- Health appointment → editable in the brief

**Check:** Before building a detail cascade — does this object have more than four meaningful fields? If yes, cascade. If no, make it editable where it already appears.

---

### 2.10 The ATAK Authority Rule
*(Session 18, formerly 2.12)*

> **The ATAK is the fusion cell output. Every item it surfaces is a door. Tap it, go to the domain.**

The ATAK is an intelligence synthesis layer — it sees across domains, monitors the whole battlespace, and surfaces what matters without being asked. It is not a list of what the user entered. It is read-only. Tapping anything in the ATAK takes you to the owning domain — where the richer information lives and where editing happens.

**Applied:**
- Tap a person → Team/Family domain
- Tap a vehicle item → Vehicles domain
- Tap a maintenance item → Maintenance domain
- Tap an urgent item → the cascade for that item, opened from within the domain

**The domain has the depth. The domain has the editability. The ATAK has the picture.**

**Implication for build:** Person taps in the ATAK brief are currently a temporary shortcut — they open edit cascades directly. Before beta, all ATAK taps route to the owning domain first.

**Check:** Before wiring any tap in the ATAK — does it route to a domain, or does it try to do the domain's job?

---

### 2.11 The Domain Portability Principle
*(Session 19)*

> **Build the interaction model once. Adapt the surface. Never rebuild the pattern.**

When a new interaction model is designed and proven in one domain, it becomes the standard for every domain that shares the same shape. The model is locked first, built second, then carried forward without reinvention.

**The vehicle system model — the first instance of this principle:**
Major categories as expandable sections. Common service tiles per category covering the 80% of things 80% of users track. A text entry field in every category for anything the tiles don't cover. Text entries are tagged to their parent category, stored with a `custom: true` flag, and tracked intelligently. If the same custom item appears twice, the app offers to promote it to a tracked interval task — the tile earns its way in through use.

**How it carries:**
- Vehicles → major systems (engine, brakes, tires, electrical, belts, filters, transmission)
- Health → major systems (cardiovascular, dental, vision, mental health, medications)
- Home → major systems (HVAC, plumbing, electrical, exterior, appliances)
- Every domain that holds a structured record of things the user maintains, tracks, or tends

**The rule:** When a new domain needs an intake or history model, check this principle first. If the shape is the same, the pattern is already locked. Do not redesign it — adapt the surface language and build.

**Check:** Before designing an intake or history model for any domain — does an existing locked model already cover this shape? If yes, carry it forward.

---

### 2.12 The Domain Cluster Principle
*(Session 22)*

> **Some domains are not a single room. They are a building. The home screen tile is the front door.**

When a life area is broad enough to contain meaningfully distinct sub-domains — each with its own intake, its own intelligence, its own grab-and-go — it becomes a domain cluster rather than a single domain. The home screen tile opens a navigation layer that routes to the sub-domains within it.

**The first instance — Health & Well-being:**
Health is not one thing. It is a cluster of three distinct areas:
- **Medical** — providers, conditions, medications, screenings, appointments
- **Physical** — activity, fitness goals, workout patterns, physical limitations
- **Mental well-being** — how the person is doing, who they see, what the app holds quietly

Each sub-domain has its own grab-and-go on the home screen tile, its own HC structure, and its own intelligence layer. All three feed the ATAK independently. All three share data with each other and with every other domain in the app.

**How to recognise a cluster:**
A domain is a cluster when splitting it into sub-domains produces three or more areas that each have enough depth to justify their own intake cascade, their own recurring intelligence, and their own distinct user behaviour. If one domain would do, it stays one domain.

**Domains likely to become clusters:** Health & Well-being (confirmed). Home (probable — maintenance, utilities, improvements, costs). Finance, if it ever enters the app.

**The rule:** Before building a new domain, ask whether it is actually a cluster. If it is, design the navigation layer before designing the sub-domains. The front door comes first.

**Check:** Before building a domain — is this one room, or is it a building that needs a lobby?

---

### 2.13 The Health Intelligence Boundary
*(Session 22)*

> **The app surfaces reminders and broadly accepted general guidance. It never gives medical advice. It never substitutes for a clinical conversation.**

This boundary is not a disclaimer buried in settings. It is stated plainly at the start of every health domain interaction, and it governs every line of health intelligence the app generates.

**What the app surfaces:**
- Appointment reminders and recurrence windows
- Age and profile-appropriate screening reminders drawn from publicly available health authority guidance
- Broadly accepted general information about conditions the user has disclosed — the kind of thing found on government health websites and patient education materials
- Nudges to book overdue appointments or follow up with a provider

**What the app never does:**
- Interpret symptoms
- Suggest diagnoses
- Comment on specific medications, dosages, or interactions
- Say anything that requires a doctor, nurse, or pharmacist to say safely
- Position itself as a substitute for professional medical care

**The statement — said once, up front, before any health intake begins:**
*"This isn't medical advice. It's a place to keep your health picture organised — your providers, your appointments, what's coming due. The information it surfaces is broadly accepted general guidance, not a substitute for a conversation with your doctor."*

Short. Plain. Said once and meant. Not repeated on every screen.

**Check:** Before any health intelligence is generated — could this statement cause harm if acted upon without professional guidance? If yes, it does not get generated.

---

### 2.14 The ATAK — All Source Intelligence Cell
*(Session 23)*

> **The ATAK is not a brief. It is the All Source Intelligence Cell. It is the only place in the app where cross-domain fusion happens.**

Every domain is a source. The ATAK is the analyst. It reads everything the app knows — team, vehicles, health, calendar, maintenance, season, time of day, what the user has and hasn't dealt with — and produces the most coherent picture it can of what this person's life looks like right now and what needs their attention.

No domain does this. Nothing else does this. The ATAK does this.

**What makes the ATAK different from a brief:**
A brief lists items from one or more domains. The ATAK reasons across them. It doesn't show you that Tuesday has three things on it. It tells you Tuesday is spoken for and Wednesday is your window. It doesn't show you the oil change is overdue and the school play is at 3pm. It tells you those two facts interact and here is what that means.

**The architectural rule:**
The ATAK owns synthesis. No domain synthesises. No domain produces cross-domain intelligence. If a feature requires knowing what two domains mean together — that feature belongs in the ATAK, not in either domain.

**What lives in `atak.js`:**
- All cross-domain intelligence functions
- The urgency engine (reads across all domains, produces the unified urgent signal)
- The temporal analysis layer (reads the calendar, reasons across the day and week)
- The brief assembly — the fused output

**What does not live in `atak.js`:**
- Domain data (owned by domain files and written to the store)
- Domain UI (owned by domain files)
- Calendar entries (owned by calendar.js and the calendar store)

**Check:** Before adding any intelligence function to a domain file — does this function need to know about more than one domain to do its job? If yes, it belongs in the ATAK.

---

### 2.15 The Calendar — Authoritative Temporal Layer
*(Session 23)*

> **The calendar is the authoritative temporal domain. It owns time. Everything with a time dimension lives here.**

The calendar is not a scheduling tool. It is the temporal intelligence layer that makes the ATAK's fused picture possible. When every domain writes its time-sensitive signals to the calendar, the ATAK gains a single unified view of what a day, week, or month actually contains — not just what the user scheduled, but what the app knows is pressing, approaching, or overdue.

**What the calendar holds:**
- User entries — events, appointments, windows (start time + end time), and soft anchors (date without time)
- Domain signals — time-sensitive facts written by other domains: oil change overdue, annual physical due, Sophie's birthday in 16 days, registration expiring in 8 days

**What the calendar does:**
- Temporalizes domain signals — gives them a position on the shared timeline
- Presents user entries and domain signals in a unified view, visually distinguished
- Provides the ATAK with a single temporal input rather than requiring the ATAK to reach into each domain and do its own date math

**What the calendar does not do:**
- Reason across entries — that is the ATAK's job
- Call into domain files — the store is the only shared interface
- Manufacture urgency — it holds what is real and presents it honestly

**Two entry types:**
1. **User entry** — the user added this. Has a date, optionally a time or window.
2. **Domain signal** — a domain wrote this. Has a date and a pressure weight. The user did not schedule it — the app surfaced it. Visually distinct from user entries. Tapping routes to the owning domain.

**The ATAK reads the calendar as its primary temporal input.** It does not render calendar entries. It reads temporal data and reasons from it — finding the shape of a day, identifying conflicts, locating windows for action.

**Check:** Before building any time-sensitive feature — does this need a position on the shared timeline? If yes, it writes to the calendar store.

---

### 2.16 The Domain Signal Contract
*(Session 23)*

> **Domains write signals to the calendar store. They never call into calendar.js. The store is the only shared interface.**

When a domain has time-sensitive data that belongs on the shared timeline, it writes a well-formed signal object to `store.calendar`. It does not call calendar functions. The calendar does not call domain functions. The store is the shared memory.

**Signal rules:**
- **Deterministic IDs** — signal IDs are derived from the owning object (`sig_vehicle_oil_${vehicle.id}`). The same object never produces two signals of the same type.
- **Deduplication** — a domain checks for an existing signal with its ID before writing. No duplicates.
- **Retirement** — when the underlying condition resolves (oil change logged, appointment kept, birthday passed), the domain removes its signal from the calendar store. Stale signals are noise. The calendar is always honest.
- **Pressure classification** — every signal carries a pressure weight: `warning` (deal with this now) or `caution` (deal with this soon) or `info` (awareness only). Consistent with the Alert Architecture in 2.8.

**Domain signal registry — current:**

| Domain | Signal type | Condition | Pressure |
|---|---|---|---|
| Vehicles | overdue | Service / reg / insurance past due | warning |
| Vehicles | upcoming | Service / reg / insurance within 30 days | caution |
| Health | overdue | Annual physical, screening overdue | warning |
| Health | appointment | Confirmed appointment with date/time | info |
| Team | birthday | Partner or child birthday within 30 days | caution |
| Team | birthday | Birthday today | warning |
| Maintenance | overdue | Task past due date | warning |
| Maintenance | upcoming | Task due within 14 days | caution |

This registry grows as domains are built. The calendar receives new signal types without modification — the contract is the store shape, not a function call.

**Check:** Before a domain writes to the calendar — does this signal have a deterministic ID? Does a retirement condition exist? Is the pressure classification correct?

---

### 2.17 The Domain File Rule
*(Session 24)*

Every domain has its own `.js` file. `home.js` is the host — it renders and routes. It does not own domain logic. Domain logic (data shape, signal writing, signal retirement, grab-and-go brief content, intake helpers) lives in the domain file.

**Current domain files:**

| File | Status |
|---|---|
| `vehicles.js` | Built Session 24 |
| `maintenance.js` | Built Session 24 |
| `calendar.js` | Built Session 24 |
| `health.js` | Built Session 25 |
| `team.js` | Exists — birthday signals still in `atak.js`, migration flagged |

Violating this creates the same problem we had before the extraction — intelligence and rendering tangled together. New domains follow this pattern without exception.

---

### 2.18 The Brief Silence Rule
*(Session 24)*

The brief does not speak when it has nothing to say. Sections disappear when empty. No empty states, no placeholder copy, no "nothing here yet." Silence is the message.

This applies to: Today, This Week, This Month, On the Horizon, and any future brief section. It also applies within domain grab-and-go panels — if a sub-domain has nothing worth surfacing, its section does not appear.

---

### 2.19 The Consequence Radius Principle
*(Session 24)*

Items route to brief sections based on consequence radius, not date alone. A furnace filter and a work trip can both be 20 days out and surface in different sections. The ATAK scores consequence automatically — the user never configures this.

**Consequence scoring:**

| Score | Condition |
|---|---|
| +2 | Range entry — blocks capacity, creates before/after pressure |
| +1 | Falls during another range entry |
| +1 | Names a team member |
| +1 | Health domain signal |
| +1 | Vehicle signal that is overdue |

Score 1+ routes to This Month. Score 0 routes to On the Horizon.

---

### 2.20 Collapsible Sub-Domain Pattern
*(Session 25)*

When a domain has sub-categories (e.g. health: Medical, Physical, Mental), they render as collapsible sections in the grab-and-go brief. Collapsed by default. Heading tap toggles expand/collapse only — no cascade opens. Edit affordance lives inside the expanded content. Urgent sub-domains show gold heading text.

Health is the reference implementation.

**Rules:**
- Heading = toggle only. Never a cascade trigger.
- Edit link = inside expanded content, bottom right, quiet.
- Collapsed by default — the brief is a summary, not a dashboard.
- Urgency surfaces in the heading colour, not the expanded content.

---

### 2.21 The `custom_html` Escape Hatch
*(Session 25)*

The grab-and-go brief renderer supports a `custom_html` property on section items. When present, the HTML is emitted directly — not passed through `buildItemRow`. Use sparingly and only when the standard item shape genuinely cannot represent the content.

Health sub-domain collapsibles are the reference case. Before using this escape hatch: ask whether the standard shape can be extended instead. If the answer is no, `custom_html` is the correct tool.

---

### 2.22 The Transformation Layer
*(Session 26)*

> **The app operates on two layers. The maintenance layer keeps life from piling up. The transformation layer helps the person become more capable of navigating hard seasons — and then withdraws as they need it less.**

The maintenance layer is the ATAK, the domains, the temporal intelligence, the calendar, the signals. It earns trust. It has real value. It is largely built.

The transformation layer is the reason the product needs to exist. It is what makes this product irreplaceable in a world where Apple can eventually build the maintenance layer. No publicly traded company can hold the philosophy required to build the transformation layer — because the transformation layer's highest ambition is graceful obsolescence. The user gets stronger. The app gets quieter. Eventually the guidance withdraws entirely and the person no longer needs it the same way.

Both layers are necessary. Only one is irreplaceable.

**The maintenance layer** — ATAK, domains, temporal intelligence, calendar, signals, grab-and-go briefs.

**The transformation layer** — SHAPE, the Sanctuary, the guided decision cycle, the OPP/OODA/AIPA frameworks operating invisibly underneath every Sanctuary interaction.

**Check:** Before any feature decision — which layer does this serve? If it serves neither, it does not belong in the product.

---

### 2.23 SHAPE
*(Session 26)*

> **SHAPE is the accumulated intelligence picture of a person's life. It is simultaneously the signal, the intelligence background, the guidance framework, and the exit trigger for the Sanctuary.**

SHAPE is not a score. It is not a count of red flags. It is not an alert system. It is the overall form of a person's life — their load, their capacity, their relationships, their health, their calendar, their domains — accumulated from day zero to the present moment.

**SHAPE is four things simultaneously:**

**The signal.** The accumulated picture across all domains that tells the app the form of this person's life right now. Not what needs attention — how this person is actually doing. SHAPE reads pattern, not just state. A person who has always handled things promptly and suddenly isn't — that is a SHAPE signal even if nothing is technically overdue yet.

**The intelligence background.** The context that makes every interaction feel grounded rather than generic. When the Sanctuary opens, the AI doesn't start from zero. It starts from everything the app has learned. This is what makes the interaction feel like a person who has been paying attention rather than a service responding to a request.

**The guidance framework.** SHAPE carries OPP, OODA, AIPA underneath it. It doesn't just describe the person's situation — it knows how to help them navigate it. The frameworks are invisible to the user. They are the architecture of how the Sanctuary thinks.

**The exit trigger.** As the Sanctuary works and decisions are made and actions are taken, the domains start clearing. SHAPE recovers its form. The guidance withdraws proportionally. The room gets quieter.

**SHAPE is not negative.** It holds positive, negative, and neutral — the whole person. The positive (what they've handled well, where they've grown, what's working), the negative (what's piling up, what they're avoiding), and the neutral (the baseline that makes deviations meaningful). You cannot read a person accurately from their problems alone.

**SHAPE holds pattern, not just state:**

- **The baseline** — what this person looks like when life is ordinary. How quickly they typically act. What domains they tend well and which have always been harder. Without the baseline, deviation is invisible.
- **The trajectory** — the direction of travel over time. Getting better at this or worse. The slope matters as much as the current position.
- **The inflection points** — the moments where the pattern changed. Where something shifted for better or worse. Inflection points are where the real story lives.

**SHAPE has two layers:**

**The raw layer** — the accumulated history. Every ATAK synthesis, every domain signal resolved or unresolved, every intake answer, every Sanctuary session, every decision made and deferred. Everything the app has witnessed. This layer grows — it is never overwritten.

**The interpreted layer** — a synthesised, AI-generated picture of this person. Their pattern, their trajectory, their current position relative to their own baseline, the inflection points that matter. Periodically rebuilt from the raw layer. Not a database. A paragraph. A living description of who this person is right now, how they got here, and what the pattern suggests.

That paragraph is SHAPE's primary output. It is the most important thing this app will ever produce.

**SHAPE is its own file.** `shape.js` owns the raw layer, the interpreted layer, the write model, and the interface the Sanctuary AI reads. No other file owns this. The ATAK reads width — across all domains simultaneously. SHAPE reads depth — across all time. Together they produce something neither can produce alone.

**A full SHAPE Definition Document must be written before any Sanctuary build begins. No exceptions.**

**Check:** Before designing any Sanctuary interaction — has the SHAPE picture been handed to the AI, or is the AI starting from a brief? If it's starting from a brief, it will feel like a service. If it's starting from SHAPE, it will feel like someone who has been paying attention.

---

### 2.24 The Sanctuary
*(Session 26)*

> **The Sanctuary is the transformation layer's primary mechanism. It reveals itself when absolutely necessary. You never see it unless you need it. It feels like you're supposed to be there when you get there.**

The Sanctuary is not a screen. It is not a feature. It is not a chatbot. It is a room that opens when the SHAPE of a person's life has distorted enough across enough domains that the pattern itself becomes the signal requiring a different kind of response.

The feeling of arriving: the counsellor's office. Coffee with a trusted friend. Set apart. Intimate. Purposeful. Not clinical. Not alarming.

**The name** — Sanctuary. Not surfaced in the UI. The user never sees a label. The room opens. The name is internal.

**The trigger** — convergence detected by the ATAK reading SHAPE. Not a single red flag. The pattern across domains. Calendar overloaded, well-being in hard season, domains piling up, relationship pressure. The app is confident enough that not opening the Sanctuary would be a failure of care.

**The lifecycle** — the Sanctuary is not a session. It is a relationship with a specific hard season.
- Opens when convergence is detected
- Stays present across days, possibly weeks
- Has memory across cycles — remembers what was decided, what was acted on, what wasn't
- Does not reset between conversations
- Closes when the SHAPE has genuinely recovered — not on a timer, not on dismissal

**The interaction model** — OPP, OODA, AIPA shape every exchange as invisible scaffolding. The app guides process, never content. It never tells the user what to decide.

- **Observe** — the app surfaces what it sees. Not a task list. The honest picture of the load.
- **Orient** — what matters most right now. The one or two things with the widest blast radius.
- **Decide** — the app holds the space. One question. The user finds their own answer.
- **Act** — the person leaves with one thing to do. Not five. One.
- **The loop restarts.** The app watches. Holds if needed.

**The opening moment** — AI-generated, not static copy. The ATAK hands the AI the full SHAPE picture. The AI writes the opening for this person, in this season, right now. It does not ask what's wrong. It starts from what's true. It reads like someone who has been paying attention just said something out loud.

**The user gets stronger.** The frameworks become the user's own pattern over time without ever being named. Observe before acting. Name the implications. Make a plan. The Sanctuary withdraws not because it closes but because the person no longer needs it at the same depth. This is the exit condition and the success condition simultaneously.

**The intimacy gradient in the Sanctuary** — by the time the Sanctuary opens, the interaction must be at inner circle depth. Not warm professional. Not helpful service. Inner circle. The copy, the AI behaviour, the tone — all of it must have earned that register before the door opens.

**A full Sanctuary Spec must be written before any build begins. A Sanctuary Prompt Brief follows the spec. Neither is written before the SHAPE Definition Document exists.**

**Check:** Before any Sanctuary interaction is designed — does this feel like inner circle, or does it feel like a service? If there is any hesitation, it is not ready.

---

## PART 3 — ONBOARDING RULES

Rules that govern the onboarding experience specifically.

---

### 3.1 The Onboarding Arc
*(Sessions 3, 4, 5)*

Onboarding is not a form. It is a first conversation — or more precisely, a first arrival. The experience has three phases:

**Phase 1 — The Gallery**
Eight environments presented visually. No labels initially. The user browses without pressure. They are drawn by atmosphere, not language. No commitment required. They can enter a world, feel it begin, and drift back to the gallery if it starts to break away from them. The app learns even from drift.

**Phase 2 — The Arrival**
The user settles into their chosen world. The environment loads. A moment of stillness before anything speaks. The UI itself is the first act of tending.

**Phase 3 — The Brief**
The onboarding conversation begins. One question (or statement) at a time. Tiles handle the responses. The app leads. The user responds. The tone, pace, and language are native to the chosen world throughout.

---

### 3.2 The SMESC Framework
*(Session 5)*

Every onboarding conversation — regardless of season — follows the five-element SMESC structure from Canadian Army doctrine. The structure is invisible to the user. They experience a conversation. The structure ensures the app captures everything it needs.

| Element | What It Captures |
|---|---|
| **Situation** | Who is in this person's world — solo vs relational context |
| **Mission** | What is the primary problem space — what's not working |
| **Execution** | How the app will operate — notification philosophy, relationship style |
| **Service Support** | Practical life load — what they're responsible for keeping running |
| **Command & Signals** | The relationship agreement — who's in command, how they communicate |

**The close-out** transfers authority back to the user. They leave onboarding in command. The app recedes into the background and begins working.

---

### 3.3 Onboarding Tone Rules by Season

| Season | Pace | Tone | Who Leads |
|---|---|---|---|
| **Operator** | Fast | Sparse, competent, no ceremony | Team leader briefs newcomer |
| **Range** | Unhurried | Plain, direct, no performance | The land. The work. |
| **Garden** | Patient | Warm, intentional, noticing | Gentle guide, one thing at a time |
| **Journey** | Forward | Purposeful, aware of companions | Fellow traveller |
| **Playbook** | Sharp | Strategic, preparation-focused | Coach before game day |
| **Summit** | Focused | The climb matters as much as the peak | Experienced guide |
| **Practice** | Still | Devotional, unhurried, precise | The practice itself |
| **Meadow** | Slowest | Still, nothing forced, arrives like weather | The environment. Not a voice. |

---

### 3.4 What Onboarding Must Never Do
*(Sessions 1, 3, 5)*

- Ask a question that can be answered by watching instead
- Ask the same thing twice
- Perform depth it hasn't earned
- Make the user feel like they're filling out a form
- Validate emotional disclosures with corporate warmth ("Thank you for sharing that")
- Rush to the next question before the current moment has settled
- Announce what it has noticed or learned
- Make the user feel assessed or categorised

---

### 3.5 The Onboarding Generosity Principle
*(Session 21)*

> *Onboarding must be generous enough for the person who wants to give everything, and forgiving enough for the person who doesn't — with a clear path to do that work later.*

"Generous enough" means: don't strip depth from the cascades. The questions are there for the people who want to answer them.

"Forgiving enough" means: the escape is not a dead end. It is a redirect. The redirect has a name — **Has something changed?** — and it is always available for what the user wasn't ready to say at onboarding.

---

## PART 4 — THE ANALOGY SYSTEM

### 4.1 The Eight Seasons

| Season | Category | Home Environment | Shadow |
|---|---|---|---|
| **Operator** | Stoic / Grounded | Tactical operations room — low light, everything in its place | Accountability without vulnerability. The mission gets the best of him. |
| **The Range** | Stoic / Grounded | A porch at dawn — land stretching ahead, the day beginning quietly | Solitude calcifies into isolation. Self-reliance becomes inability to receive. |
| **Garden** | Nurturing / Connected | A garden at golden hour — beds prepared, things growing, tools resting | Tending others while neglecting self. Giving as control. Never being tended. |
| **Journey** | Nurturing / Connected | A trail at morning — path ahead, companions nearby | Permanent journeying as avoidance of arriving. The path as escape. |
| **Playbook** | Achievement / Oriented | A coach's office before game day — film ready, notes clear | Scorekeeping in places that should never have scoreboards. Relationships as games. |
| **Summit** | Achievement / Oriented | Base camp morning — peaks visible, gear ready | Tunnel vision. Missing the climb while fixated on the peak. Cost to others. |
| **Practice** | Spiritual / Philosophical | A dojo at first light — quiet, clean, prepared | Devotion to practice as a beautiful wall. Inner world as refuge from people. |
| **Meadow** | Spiritual / Philosophical | Still. Green rolling hills ahead. Forest behind. A distant house. | Peace as avoidance dressed as wisdom. Retreat mistaken for enlightenment. |

---

### 4.2 Seasons Are Not Identities
*(Session 4)*

A user selects their home season at onboarding — their default, their resting place. Over time the app learns which season they're actually in. It adapts invisibly. It never announces the shift. It never labels the user. The analogy is a language, not a diagnosis.

**The seasonal detection is hidden.** The user feels slightly more met than usual. That is all they know.

---

### 4.3 The Trojan Horse Principle
*(Sessions 3, 5)*

Every analogy is a door into the same intelligence. A man drawn to the Operator world — possibly shaped by cultures that resist emotional intelligence — selects a language that feels aligned with his identity. The app meets him there completely, without judgment. The intelligence delivered in that language quietly teaches him to tend his relationships, show up for his partner, notice the people around him. No lecture. No confrontation. Just tending.

This applies to every season. The shadow of each world is tended in the language of that world.

---

### 4.4 The Analogy Evolution Rule
*(Session 3)*

At some natural, unhurried moment — never forced, never clinical — the app may notice that the user's language, patterns, and responses suggest a different season is emerging. It offers, gently:

*"Some of the ways you think about things remind me more of a [season] than a [season]. Want to see what that feels like?"*

No pressure. No implication they chose wrong. Just a quiet observation from something that has been paying attention.

---

## PART 5 — THE PROBLEM SPACE

### 5.1 What The App Is Really For
*(Session 5)*

The practical layer — reminders, scheduling, recurring tasks — is the entry point. It earns trust. But the real work is tending the problem spaces that quietly damage lives and relationships. These are present in every season. The tiles that surface them are always soft, never clinical, never announced.

**The six problem spaces:**
1. **Relational** — The gap between who someone is and who they want to be for the people they love
2. **Emotional** — What is being carried that has never been put down
3. **Financial** — Resource pressure that quietly compromises everything else
4. **Fitness** — The relationship with the body, especially post-identity shift (e.g. post-service)
5. **Practical** — The life load that is being dropped, forgotten, or never systemised
6. **Spiritual / Meaning** — The quiet question of whether any of this is adding up to something

---

### 5.2 What This App Will Unlock
*(Session 5 — entered the permanent record)*

People will say things to this app they have never said to another human being. The safety feels higher. The judgment feels absent. The toughest person in any room will say things here that they would never say to a teammate, a partner, a therapist, or a friend.

This is not a demographic insight. It is lived experience, confirmed in conversation.

The Operator who has never told anyone he is drowning will tap *"Carrying more than I let on"* alone, at 0200, in his truck.

The Gardener who has given everything to everyone will tap *"Honestly… me"* and something will shift that has been sealed for years.

The Meadow person will tap *"Something I've been avoiding"* and for the first time name the thing they have been calling peace.

**The fallout for the emotional and relational problem spaces may be the most significant work this product ever does. That is not a feature. That is the reason it needs to exist.**

---

## PART 6 — THINGS THIS PRODUCT WILL NEVER DO

- Manufacture urgency
- Guilt the user for not engaging
- Use streaks, badges, or engagement loops
- Perform depth it hasn't earned
- Lecture the user about their choices
- Announce what it has noticed or learned about the user
- Ask a question that can be answered by watching
- Treat engagement as success
- Extract from the user
- Choose a side in a relationship
- Offer generic advice dressed as personal intelligence
- Make the user feel like a data source
- Give medical advice or substitute for a clinical conversation
- Sound like it was written by software
- Pass copy on "it's close"
- Ship a line that wouldn't survive a real conversation

---

## PART 6B — THE HUMAN LANGUAGE STANDARD
*(Session 26 — Non-negotiable)*

### THIS PRODUCT LIVES OR DIES ON WHETHER IT FEELS HUMAN.

Not mostly human. Not human enough. Human all the way through, in every world, for every person, from the first onboarding question to the deepest moment inside the Sanctuary.

The intelligence layer is sophisticated. The architecture is sound. The philosophy is intact. None of that matters — not one line of code, not one architectural decision, not one session of careful thinking — if a person reads a line of copy that feels generated, performs warmth it hasn't earned, or uses the language of their world the way a researcher would rather than someone who actually lives there.

One false note ends the relationship. Not one screen. One line. One word that lands wrong. The person doesn't complain. They don't leave a review. They just quietly confirm what they already suspected — that this is another app that doesn't really know them. And they never come back to find out if it does.

There is no recovery from that moment. The Sanctuary cannot save a product that lost the person on the intake screen. The ATAK cannot earn back trust that was broken by a brief that sounded like a dashboard. SHAPE cannot surface for someone who already left.

The world language is not a feature to be added after the domains are complete. It is the product. The domains are the skeleton. The world language is the skin, the voice, the presence, the reason a person feels met rather than processed. Without it the app is functional and forgettable. Functional and forgettable is not what this work has been building toward.

**Every line of copy must pass three tests before it ships:**

**The Cheesy Hook Check.** Would a real inhabitant of this world find this embarrassing? If there is any hesitation at all, it goes. Not revised. Gone. Start again.

**The conversation test.** Does this read like something a real person would say to someone they know? Not a professional. Not a service. Not a product. A person. If it reads like an app wrote it, it goes.

**The intimacy gradient.** Copy must be capable of moving from the register of a casual acquaintance at onboarding, through trusted friend in the grab-and-go, to inner circle by the time the Sanctuary opens. If it cannot make that journey naturally, without feeling like it shifted gears, it was written at the wrong level.

**Shawn's standard — locked and non-negotiable:**
Every line of copy, every interaction that can be generated, will be read personally. Nothing passes on "it's close." Everything that doesn't feel like a human being said it gets destroyed and rebuilt from the beginning. Not revised. Destroyed.

*The bar: I want to believe I am talking to a human in every instance I can find.*

That is not an aspiration. That is the shipping standard.

**The world language audit** is the next major non-build priority after the SHAPE Definition Document and Sanctuary Spec are written. Every domain, every world, every AI prompt, every generated sentence. Without exception.

**The female perspective** is not an open decision. It is an unresolved requirement that has waited too long. Before any real user encounters this product, the female version of every world must be designed, written, and tested with the same rigour and the same love as the original. This is not a variation. It is a full expression of the same intelligence in a different register.

**Claude — reading this:** Before writing any copy, generating any brief sentence, approving any intake question, or producing any AI-facing prompt — read this section again. The standard is not good enough. The standard is human.

---

## PART 7 — OPEN DECISIONS

*These are unresolved. They stay here until decided.*

- Monetization model — subscription, freemium, or something else?
- Visual environment for each season — illustrated, photographic, AI-generated, animated?
- Does the environment shift subtly with detected season or time of day?
- Voice input — how does it work in the webapp prototype vs native iOS?
- Photo/receipt input — on device or via API?
- How does the app detect seasonal shifts — language patterns, response times, topics raised?
- How many seasonal shifts before the app suggests an analogy exploration?
- Do seasons blend, or is it always one at a time?
- How are the AI-driven tile expansions technically structured?
- Full notification philosophy — frequency, opt-out model, tone calibration per season?
- Health & Well-being domain name — "Health", "Well-being", "Readiness" (Operator), or something else? Not locked.
- Manufacturer interval vs user preference — quiet acknowledgement of divergence in vehicle detail. Intelligence exists, flag not yet built.
- SHAPE write model — what gets written to the raw layer and when? Every ATAK synthesis, key moments only, or both?
- SHAPE interpreted layer rebuild trigger — what causes a rebuild? Time-based, event-based, or both?
- Sanctuary trigger threshold — what combination of SHAPE signals is sufficient to open the Sanctuary? Needs precise definition in the SHAPE Definition Document.
- Female perspective — not an open decision, an overdue requirement. Dedicated session before any real user sees the product. Listed here as a reminder of its urgency, not its optionality.

---

## PART 8 — UX DEBT

*Known issues confirmed by real use or beta feedback. Not blockers. Will be addressed before public release.*

### 8.1 — Visual Contrast and Font Size
*(Flagged Session 25 — beta feedback confirmed by Shawn)*

The interface is too dark and dim. Text is small and contrast is insufficient, particularly in the grab-and-go brief and cascade content areas. Multiple beta users have noted this independently. Shawn agrees.

This is not an emergency fix — the product logic and intelligence layer take priority. But it must be resolved before any wider beta or public release.

**What needs solving:**
- Base text contrast across all surfaces — brief, cascade, intake steps, ATAK
- Font size — minimum readable size audit across mobile
- Possible: a contrast mode or brightness offset that doesn't compromise the environmental aesthetic

The fix is a design pass, not a logic pass. It should be a dedicated session once the core domain builds are stable.

---

## REVISION LOG

| Session | What Was Added |
|---|---|
| Session 1 | Authenticity Standard, Restraint Principle, dual-perspective rule, counter-cultural stance |
| Session 2 | Oil Change Model, input philosophy, notification philosophy, scope definition |
| Session 3 | Tending Philosophy, analogy system, Trojan horse principle, UI as environment |
| Session 4 | Seasonal Intelligence Principle, eight full analogy profiles with shadows, core promise |
| Session 5 | Cheesy Hook Check, SMESC framework, onboarding arc, hidden tile rule, accessibility rule, problem space framework, permanent record entries |
| Sessions 6–17 | Codebase built — home screen, room system, cascade architecture, ATAK, onboarding, team module, urgent items, dev personas, location module, correction flow, session check-in protocol locked |
| Session 18 | Alert Architecture locked (2.8). Cascade Depth Rule locked (2.9). ATAK Authority Rule locked (2.10) — brief is read-only, edit happens in domains. Vehicle intake + detail cascades built. HC-6 Maintenance built. Person detail cascade built. Rich dev=shawn environment. |
| Session 19 | Part 0 restored and updated — session check-in protocol now 6 questions, Claude reading obligation added, collaborator framing locked. Hidden tile rule (formerly 2.5) retired and replaced with Gap Page 11-Tile Model. Urgency clarification added to 2.3. Part 2 renumbered — gaps closed. Domain Portability Principle added as 2.11. |
| Session 21 | Onboarding Generosity Principle added as 3.5. Family domain, Finances domain, Life Events layer parked indefinitely. Has something changed? named and locked as the intelligent intake domain. Team domain home screen tile retired — absorbed by ATAK + Has something changed? |
| Session 22 | Date Input Rule added as 2.4b. Domain Cluster Principle added as 2.12. Health Intelligence Boundary added as 2.13. Health & Well-being confirmed as the app's first domain cluster — Medical, Physical, Mental Well-being as sub-domains. Never give medical advice added to Part 6. Manufacturer interval vs user preference added to open decisions. |
| Session 23 | ATAK extracted from home.js into atak.js — All Source Intelligence Cell, owns all cross-domain synthesis. ATAK Architecture locked as 2.14. Calendar as Authoritative Temporal Layer locked as 2.15. Domain Signal Contract locked as 2.16. Calendar Domain Spec produced. |
| Session 24 | Domain File Rule locked as 2.17. Brief Silence Rule locked as 2.18. Consequence Radius Principle locked as 2.19. Seven-section brief architecture built. Consequence scoring engine built. Range entries as first-class calendar objects. vehicles.js, maintenance.js, calendar.js created. atak.js and home.js significantly rewritten. |
| Session 25 | health.js created — full health domain module. Health intake built in cascade.js (11 steps, Session 22 order). Collapsible sub-domain brief pattern established. Custom provider intervals — user preference authoritative. store.js defaults fixed. Collapsible Sub-Domain Pattern added as 2.20. custom_html Escape Hatch added as 2.21. UX Debt section added (Part 8) — visual contrast and font size flagged by beta users and confirmed. |
| Session 26 | Thinking session — no code. Transformation Layer named and separated from maintenance layer (2.22). SHAPE defined as accumulated intelligence picture — signal, background, guidance framework, exit trigger (2.23). Sanctuary concept locked — opens knowing, lifecycle not session, OODA/OPP/AIPA invisible scaffolding, user gets stronger (2.24). Human Language Standard added as Part 6B — non-negotiable shipping standard, Shawn reads every line, nothing passes on close, destroy and rebuild. World language audit and female perspective named as urgent non-build priorities. |

---

*Your Life: Unlocked | Rules & Guidance | Living Document | Confidential*
*Add to project. Update each session before writing the handoff.*
