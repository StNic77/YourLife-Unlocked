# YOUR LIFE / UNLOCKED
## ATAK — Definition Document
*Session 29 | June 1, 2026 | Thinking Session | Confidential*

---

> This document is the foundational reference for the ATAK intelligence layer — what the ATAK is actually doing, how SHAPE governs it, what resource-awareness means in practice, and how prevention mode operates. The ATAK Cascade Spec covers how the brief is presented. This document covers what the brief is doing and why.
>
> Nothing about the ATAK intelligence layer is built before this document exists. Nothing about `shape.js` is written before this document is read alongside the SHAPE Definition Document.

---

## 1. What the ATAK Is

The ATAK is the intelligence fusion and presentation layer. It is the primary surface through which the app communicates with the user — the place where everything the app knows is converted into something the user can act on.

It is also the people registry. But that function is administrative. This document is about the intelligence function. That is what the ATAK is built around.

The ATAK's job is deceptively simple: surface the right things, in the right order, at the right weight. Not everything. Not the worst things. The right things. For this person. Today.

That sentence is the standard every ATAK brief is measured against. It is harder than it sounds. It requires the brief to know not just what is overdue or elevated — but who is carrying it, and how much room they have right now to receive it.

That knowledge does not come from the domains. It comes from SHAPE.

### 1.1 What the ATAK Is Not

The ATAK is not a to-do list. It is not a notification centre. It is not a summary of the store. It does not surface everything the app holds. It does not reward completeness — it rewards relevance.

A brief that surfaces six things when the user has capacity for two is not a good brief. A brief that buries the most important thing under four moderately important things is not a good brief. A brief that presents every domain with equal weight regardless of how the person is actually doing is not a good brief.

The ATAK earns trust by being right, repeatedly, about what matters most. That is the only thing it is trying to do.

### 1.2 The ATAK and the Cascade Spec

The ATAK Cascade Spec governs the presentation layer: the brief structure, tile system, cascade types, completion loops, HC and SC contracts. Everything about how the brief is rendered, how cascades open and behave, what the AI fetches and returns.

This document governs the intelligence layer: why the brief contains what it contains, how SHAPE shapes those decisions, what resource-awareness means in practice, how prevention mode works through the ATAK, and what the brief is actually doing for this person at this moment.

Both documents are required to build the ATAK well. Neither replaces the other.

---

## 2. The Brief — What It Actually Is

The ATAK brief is not the output of a database query. It is not a list of everything that crosses a threshold. It is an act of judgment.

It is the ATAK, informed by SHAPE, deciding what this specific person needs to see right now — given everything known about their load, their capacity, their pattern, their history, and the constraints on their resources today.

The brief is produced fresh each time the ATAK is opened. It is not cached from a previous state. The world changes. The person's situation changes. The brief reflects the current reality as the ATAK understands it.

### 2.1 The Brief Has a Shape

Not all items in the brief are equal. The brief has a shape — a hierarchy of weight and urgency that reflects the actual significance of each item for this person, in this moment.

This is not a simple sort by due date. A vehicle registration due in 14 days carries different weight for a person whose calendar is light and whose domains are clear than it does for a person in the middle of an elevated season with multiple things converging. The item is the same. The weight is different. SHAPE provides the context that makes the difference legible.

The brief's shape is governed by three factors working simultaneously:

**Urgency** — time-based. When something must happen. The raw signal from the domain.

**Consequence** — impact-based. What happens if this is not acted on. Not all overdue items are equally consequential. A missed oil change is not the same as a missed court date. The consequence scoring engine assigns this weight. Urgency and consequence are related but not the same.

**Capacity** — person-based. What this person can actually receive and act on right now. Provided by SHAPE. The factor that makes the brief feel known rather than mechanical.

A brief that ignores capacity surfaces everything urgent regardless of whether the person can hold it. That brief is technically correct and practically useless. The ATAK's intelligence is in integrating all three.

### 2.2 The Brief Is Not the Same Every Day

For two users with identical domain data, the ATAK brief may look different. Not different items — different weight, different order, different depth of surface. Because SHAPE has different things to say about them. One has been handling signals promptly for eight months and their brief can carry more. The other has been in an elevated season for six weeks and their brief needs to be tighter.

That difference is not a bug or a personalisation feature. It is the natural result of the brief incorporating the full intelligence picture, not just the domain signals.

### 2.3 What the Brief Holds

The brief is divided into sections. The Cascade Spec defines these sections structurally. This document defines what governs their content.

**Needs Attention** — items that require action. Time-bounded or consequence-driven. SHAPE's resource context shapes which of these appear, in what order, at what weight.

**On the Radar** — items not yet urgent but building. The horizon layer. SHAPE's trajectory read determines whether something escalates from On the Radar to Needs Attention before or after its nominal threshold.

**Domain Briefs** — the grab-and-go tiles. Domain-level intelligence. SHAPE's season read contextualises these — in a good season they are informational, in an elevated season they carry more weight.

**Team** (when populated) — relationship and coordination signals. SHAPE reads relationship engagement patterns and flags absences that have gone on longer than this person's normal.

**Transition** (when active) — posted separately above Needs Attention. SHAPE's resource read shapes how much of the transition load is surfaced at once.

Each section's content is a judgment, not a query. SHAPE makes that judgment possible.

---

## 3. SHAPE and the ATAK — The Relationship

### 3.0 The Architecture — Session 32 Correction

**The ATAK is the all-source fusion cell. SHAPE is the human intelligence operator feeding it.**

This distinction supersedes any prior framing where SHAPE and the ATAK were described as equivalent intelligence layers or where SHAPE was described as the all-source cell.

The ATAK receives everything: cold domain data from every domain file — schedule, health, vehicles, maintenance, calendar — and SHAPE's human intelligence layer on top of it. The ATAK fuses it all. The ATAK is the fusion cell. The ATAK produces the intelligence product.

SHAPE does not produce the brief. SHAPE does not manage domain signals. SHAPE is the operator in the field — watching, reading, collecting the human picture — and feeding that intelligence into the ATAK. Without SHAPE, the ATAK produces a technically accurate brief that misses the person carrying it. With SHAPE, the brief knows who it is talking to.

**SHAPE makes it human.** That is the entirety of SHAPE's job description in relation to the ATAK.

The flow:

*User speaks into the reflecting pool → SHAPE reads it → SHAPE watches all domain signals → SHAPE feeds the ATAK → ATAK fuses everything → brief is produced → Sanctuary opens when the load demands it.*

SHAPE does not tell the ATAK what to put in the brief. SHAPE provides the intelligence background that the ATAK uses to make its own judgment. The distinction matters.

The ATAK reads domain signals. It knows what is overdue, what is upcoming, what has changed. Those signals are factual. They come from the store. They are the same regardless of SHAPE.

SHAPE provides the context within which those signals should be understood — the form of this person's life right now. Their load. Their capacity. Their trajectory. The season they are in. Whether they are handling things well or have been going quiet. Whether the overall picture is steady or distorted.

The ATAK incorporates that context when assembling the brief. The same signal, seen through different SHAPE pictures, produces different brief decisions. Not different facts — different weight.

### 3.1 What SHAPE Shares with the ATAK

SHAPE shares form, not portrait. The full portrait belongs to the Sanctuary. The ATAK gets what it needs to weight the brief correctly.

**The season signal** — which world this person is currently inhabiting, based on observed behaviour. The ATAK uses this to calibrate tone and language at the brief level.

**The load picture** — overall load across domains right now. Active, elevated, or quiet. Gives the ATAK the relative weight context for surfacing decisions.

**The capacity signal** — a derived assessment of what this person can hold right now. Not a number. A read: full, manageable, constrained, critical. The ATAK's primary input for brief shaping.

**The trajectory signal** — the direction of travel. Improving, stable, declining, mixed. Affects whether On the Radar items are escalated or held.

**The disengagement signal** — if present. Not the full avoidance analysis. Just: this person has been going quieter than their baseline. The ATAK uses this to choose depth and intensity of surfacing — lighter, not heavier, when disengagement is present.

**The convergence flag** — if active. Tells the ATAK that multiple domains are simultaneously elevated beyond their normal range. The ATAK responds by tightening the brief — the person doesn't need more items, they need clarity about the most important one.

SHAPE does not share inflection points, positive arc summaries, avoidance analysis, or the interpreted layer paragraph with the ATAK. Those are for the Sanctuary. The ATAK knows enough to be useful. The Sanctuary knows everything.

### 3.2 SHAPE Whispers Through the Brief

The ATAK brief is where SHAPE whispers, every day. Not announces. Not flags. Whispers.

A user and a user of two years could have identical domain data. Their briefs will feel different. Not because different items are surfaced — but because the weighting, the order, the depth, and the tone reflect different things about who each person is and how they are doing.

The user of two years whose baseline is solid and whose trajectory has been improving gets a brief that trusts them with more. The user whose last six weeks have been fragmented and who has been going quiet gets a brief that simplifies and prioritises. Neither user knows this is happening. They just notice — if they notice anything — that the brief feels like it understands them.

That is SHAPE doing its work. Quietly, daily, invisibly.

---

## 4. Prevention Mode — How It Works Through the ATAK

The Sanctuary Addendum locked this: SHAPE's primary job is not to open the Sanctuary. It is to prevent the need for it. Prevention mode is how that job is done.

Prevention mode is continuous and invisible. The user never sees it. They do not encounter a "prevention mode" state or any indication that SHAPE is reading their resource picture. They just notice the brief is unusually right — it gave them what they needed without adding to the pile.

Prevention mode is the ATAK brief operating with full SHAPE awareness. Every brief produced in prevention mode is shaped by the current resource picture. As the resource picture shifts — for better or worse — the brief shifts with it.

### 4.1 When Time Is Constrained

Time constraint is read from: calendar density, overdue signal count, gap between committed actions and completed actions (tracked in the raw layer), and the trajectory of that gap.

When Time is constrained, the brief tightens.

**Fewer items surface.** The ATAK does not present the full Needs Attention queue. It surfaces the one or two things that are genuinely most consequential right now. The rest are held — not hidden, but not surfaced until the person has capacity for them.

**The hierarchy sharpens.** Consequence scoring is applied more aggressively. Items that are mildly overdue but low consequence are held from the brief entirely when Time is constrained. Items that are high consequence regardless of due date are elevated.

**The On the Radar section empties or compresses.** When Time is constrained, the horizon layer doesn't help — it adds load. The ATAK surfaces the present, not the future.

**The brief does not apologise for this.** It does not explain that it is simplifying. It simply is simpler. The person gets what they can act on. Everything else waits.

### 4.2 When Attention Is Fragmenting

Attention fragmentation is read from the disengagement signal: ATAK engagement latency increasing, deferral pattern increasing, session depth decreasing, response to signals going quiet. All of this measured against this person's own engagement baseline, not an abstract standard.

When Attention is fragmenting, the brief simplifies without calling attention to the simplification.

**The brief surfaces one thing clearly.** Not a list. Not a section with multiple items and sub-items. One clear place for the person's eyes to land. The most important thing. With the action attached.

**The depth within items reduces.** When Attention is fragmenting, the brief does not go deep on supporting information. Cascade tiles are still available — the person can still drill down. But the brief itself presents the surface. The information is there when they are ready for it. The brief does not impose it.

**The tone adjusts.** The seasonal language is present. The brief does not become robotic or clinical when Attention is fragmenting. It becomes quieter. Less dense. The voice is still right for this person's world. It just requires less from them to receive it.

**The brief does not ask questions.** When Attention is fragmenting, the brief is not the place for queries or prompts. It gives. It does not take.

### 4.3 When Knowledge Is Degrading

Knowledge degradation is the subtlest of the three signals. It is read from: domains accumulating signals without engagement, a pattern of not acting on known information, "Has something changed?" submissions that describe events that recontextualise previous signals, and any declared input that suggests the person's picture of their own situation has changed materially.

Knowledge degradation is not the same as having incomplete data. It is the person's understanding of their own situation becoming less accurate — either because things have changed faster than the picture has updated, or because they have been inside the situation long enough that perspective has narrowed.

When Knowledge is degrading, the brief restores the picture without overwhelming.

**It names what is actually happening.** Not a list of overdue items. A clear, specific, one-line description of what the pattern shows. Written in the brief's normal voice. Without alarm. Without drama. The Feather Rule applies — it does its work without the person feeling it land.

**It surfaces the one thing that organises everything else.** Often when Knowledge is degrading, there is a primary signal that, if understood, makes the rest of the picture legible. The brief finds that signal and names it first. Everything else is secondary.

**It does not pile on.** Restoring the picture is not the same as presenting the full load. When Knowledge is degrading, the person already knows something is wrong — the knowing hasn't helped. The brief doesn't confirm the pile. It identifies the signal that makes the pile manageable.

**It holds the trajectory.** The brief includes, where possible, the direction of travel. Not as data — as orientation. "This has been building for three weeks" is more useful than a list of the items that built it. Trajectory gives the person something to work with.

### 4.4 When Multiple Resources Are Constrained

Prevention mode is most active when two of the three AIPA resources are constrained simultaneously. This is not yet the Sanctuary threshold — that requires serious constraint on two resources, held over time, with a final blow. But simultaneous constraint on two resources is the highest level of prevention mode activity.

When two resources are constrained:

**The brief reduces to its minimum viable form.** One section. One item, possibly two if they are tightly related. An action attached. Nothing else.

**The consequence scoring engine takes over.** The brief is not shaped by what is overdue — it is shaped by what matters most regardless of timing. One overdue item of real consequence beats three mildly overdue items without it.

**The brief checks back sooner.** Not an explicit prompt — but the ATAK is aware that more needs to surface when the person has more capacity. This is not scheduled. It is responsive. When capacity returns, the queue opens.

**The app does not call attention to this.** The user is not told their brief has been simplified or that the app is in a heightened state. They receive the brief. It is right for them. That is all they need to know.

---

## 5. The Consequence Scoring Engine

Every signal that enters the ATAK carries a consequence weight. This weight determines how the signal is handled in the brief — when it surfaces, how prominently, and whether it escalates from On the Radar to Needs Attention before its nominal due date.

Consequence is not urgency. Urgency is time-based. Consequence is impact-based. Both matter. They are not the same.

### 5.1 What Consequence Reads

**Legal and jurisdictional** — expiry, registration, licence, legal document. These carry the highest consequence weights. The cost of inaction is not inconvenience — it is legal exposure, fines, inability to operate.

**Health and medical** — missed appointments, overdue screenings, unresolved health signals. Consequence weight is high. Not because the app has a view on urgency — it doesn't. Because the category is one where deferral has real costs, often invisible ones.

**Financial** — insurance lapse, contract deadlines, documents with financial consequence. High weight. The exact consequence is not always quantifiable by the app, but the category warrants high weight by default.

**Relational** — birthdays, significant dates, relationship signals. Medium-high weight. The consequence of missing these is not legal or financial — it is personal, and the person chose to put these people in the app because they matter.

**Maintenance** — vehicle service, home maintenance. Medium weight. Important. Not critical unless they have escalated into a safety or reliability issue, in which case they escalate.

**Administrative** — documents, renewals, professional tasks. Variable weight. Consequence scoring looks at category and deadline together.

### 5.2 Consequence and SHAPE Together

SHAPE does not override consequence scoring. It informs how a consequence-weighted item is presented, not whether it is consequential.

A high-consequence item surfaces in the brief regardless of the resource picture. The app does not hide consequential things from a person because they are overwhelmed. It surfaces them differently.

When capacity is constrained: one high-consequence item, clearly named, with an action attached. Nothing else until that item is either acted on or explicitly deferred.

When capacity is full: multiple items can surface together. The brief can hold depth. The consequence hierarchy still governs the order.

The consequence of an item does not change with SHAPE. The moment the item is surfaced and the form of that surfacing change.

---

## 6. The Seasonal Voice in the Brief

The ATAK brief is not written in one voice. It is written in the voice of the world this person currently inhabits.

The Cascade Spec defines the structural sections. This document governs the principle: the brief's language reflects the season.

SHAPE carries the seasonal signal — which of the eight worlds this person is currently in, based on observed behaviour, not stated preference. The ATAK uses this signal to set the register of the brief.

### 6.1 The Signal Has Confidence

The seasonal signal carries a confidence weight. A new user whose onboarding indicated Operator has a stated preference, but little observed behaviour. The signal is moderate. The brief uses Operator register but does not go deep into it.

A user of eight months whose engagement patterns, intake language, and domain focus consistently align with Operator has a high-confidence signal. The brief commits to the register. The voice is specific to that world without needing to hedge.

The confidence threshold for committing to the observed world over the onboarding-stated world is not specified here — it is an implementation variable. What is locked: the signal exists, it has confidence, the brief uses it.

### 6.2 The Voice Does Not Overpower the Content

The seasonal voice is present in the language and tone of the brief. It is not a costume. The brief does not become a performance of the world.

The Operator brief is direct, competent, spare. The Garden brief is steady, caring, unhurried. The Playbook brief is clear, action-oriented, grounded. Each has its character. None of them adds noise to the intelligence.

The Feather Rule applies to the seasonal voice as it applies to everything else in the brief: it does its work without the person feeling it land.

---

## 7. The ATAK Interaction Layer — What SHAPE Reads From It

The ATAK interaction layer is not just the brief. It is the full record of how this person has engaged with the app since day zero.

SHAPE reads from the interaction layer continuously. This is one of its primary sources of information — not what the domains say, but how the person has responded to what the domains say.

### 7.1 What SHAPE Reads

**Response latency** — the gap between a signal surfacing in the brief and the user acting on it. Not to judge the user — to understand their normal. Once the baseline is established, deviation from it is meaningful.

**Deferral pattern** — how often items are snoozed, how many times the same item recurs before action. Repeated deferral of the same item is an avoidance signal. Multiple items being deferred simultaneously is a capacity signal.

**Session depth** — how long the person engages with the ATAK. Whether they drill into cascades or stay at the brief level. Whether their sessions are getting shorter or longer over time. Trend matters more than any individual session.

**Engagement with cascade types** — which kinds of items the person engages with readily and which they avoid. This informs the consequence scoring over time — not every person weights categories the same way. The person's actual engagement pattern calibrates the abstract consequence weights.

**Absence** — sessions that should have happened and didn't. The app cannot know why someone didn't open it. SHAPE holds the gap. Duration and pattern determine whether it is meaningful.

### 7.2 What SHAPE Does Not Read From the Interaction Layer

SHAPE does not read the content of what the user types or says. The interaction layer holds structural signals — timing, deferral, engagement depth. Not content.

SHAPE does not make judgments about why the person engaged or didn't. It holds the pattern. It does not assign cause.

---

## 8. The Consequence Radius

The Cascade Spec introduces the consequence radius concept. This document governs its intelligence layer.

The consequence radius is the ATAK's awareness that signals do not exist in isolation. An unresolved vehicle signal has a consequence — but it may also have a radius. A vehicle with deferred maintenance and upcoming registration renewal and a road trip on the calendar three weeks out — those are connected. The ATAK reads that connection. The brief names it.

Not every signal has a radius. The ATAK does not manufacture connections. It recognises genuine ones.

### 8.1 What Makes a Radius

A radius exists when two or more signals share a dependency, a deadline, a person, or a consequence chain.

**Dependency** — one action unlocks another. Registration cannot proceed without insurance confirmation. The ATAK holds that dependency and surfaces them in order.

**Deadline** — two signals converge on the same window. The calendar shows a departure. The vehicle registration expires the week before. Both items now have the same effective deadline. The brief names this.

**Person** — a signal involves a person in the team. A child's medical appointment, a partner's professional deadline. The signal has a person attached. The radius includes how that person is affected.

**Consequence chain** — one deferred item raises the consequence weight of another. Deferred maintenance accumulates. At some point the accumulation becomes a safety signal. The radius has widened.

### 8.2 The Radius and SHAPE

SHAPE does not produce the consequence radius. The ATAK produces it from domain signals. SHAPE provides the context that determines whether and how the radius is surfaced.

In a full-capacity brief: the radius is surfaced explicitly. The connection is named. The person can see how the signals relate.

In a constrained brief: the radius collapses to its most consequential element. The connection is not explained — the highest-consequence item from the connected cluster surfaces, and the rest follow when capacity allows.

---

## 9. The ATAK Produces the Final Blow Signal

The Sanctuary trigger has three components: accumulation, disengagement, and the final blow. The ATAK interaction layer is where the final blow lives.

The final blow is not a domain event. It is not a bill expiring or an appointment missed. It is a moment in the ATAK interaction — a signal that SHAPE surfaced through the brief, that carried real weight, and that was not met. Or a duration threshold — this person has been in this pattern longer than SHAPE has ever seen without recovery. Or a pattern completing — the third instance of something that individually meant nothing, but the third arrival tells SHAPE what the shape now is.

The ATAK is the place where the final blow becomes recognisable. Not because the ATAK identified it — because SHAPE, reading the interaction layer, recognised it. The ATAK was the medium. SHAPE read the signal.

This is what it means for the final blow to live in the ATAK interaction layer. The event happens in the ATAK. The recognition happens in SHAPE.

---

## 10. The ATAK and the Sanctuary — During an Open Sanctuary Season

When the Sanctuary is open, the ATAK does not go away. The maintenance layer continues. Life continues. Signals accumulate. The brief still produces.

What changes is the register.

### 10.1 What the ATAK Does Differently

**The brief becomes quieter.** Not because life has quieted — it hasn't. Because the Sanctuary is handling the weight that the brief was carrying alone before. The ATAK does not need to work harder than it normally does. It needs to work at the same level it would for a person in an elevated season. Clear, prioritised, light.

**Consequence scoring continues unchanged.** High-consequence items still surface. The brief does not go dark because the Sanctuary is open. The maintenance layer has not been suspended.

**The disengagement signal reads differently.** A person in an active Sanctuary season will naturally engage differently with the ATAK. Their session depth, response latency, and deferral pattern will reflect the season they are in. SHAPE reads this correctly — not as a worsening disengagement signal, but as the expected pattern of a person who has their attention elsewhere and is being appropriately supported.

**The brief does not reference the Sanctuary.** The two experiences are separate. The ATAK brief is the maintenance layer. The Sanctuary is the transformation layer. They coexist. They do not cross-reference.

### 10.2 What Does Not Change

The brief's structure is unchanged. The cascade behaviour is unchanged. The consequence scoring engine is unchanged. The seasonal voice is unchanged.

The only thing that changes is the weight the brief carries. When the Sanctuary is open and working, the brief does not need to carry the full load alone. It returns to its rightful scope: the maintenance of life. Quietly. Competently. Reliably.

---

## 11. The Store and the ATAK

`atak.js` reads from the store. It does not own domain data — the domains own their data. It reads what it needs to produce the brief.

When `shape.js` is built, `atak.js` will read from SHAPE through a defined interface. That interface is the sharing model described in Section 3.1.

### 11.1 What the ATAK Reads from the Store

- `store.vehicles` — registration, service, insurance signals
- `store.maintenance` — home and property maintenance signals
- `store.calendar` — upcoming events, schedule density, deadline awareness
- `store.health` — sub-domain signals, appointment entries, screening status
- `store.team` — birthday signals, relationship entries, coordination signals
- `store.onboarding` — situation context, mission context (informs consequence weighting)
- `store.user` — province (jurisdiction-aware signals), join date (tenure-aware calibration)
- `store.transition` (when active) — transition phase and item set

### 11.2 What the ATAK Will Read from SHAPE

Through the SHAPE interface (when `shape.js` is built):

- Season signal + confidence
- Capacity signal: full / manageable / constrained / critical
- Trajectory: improving / stable / declining / mixed
- Disengagement flag: present / absent
- Convergence flag: present / absent
- Load picture: summary of which domains are active, elevated, or quiet

The ATAK does not read the raw layer. It does not read the interpreted layer paragraph. It reads the form signals that SHAPE has derived from those layers. The depth stays in SHAPE.

---

## 12. What This Document Establishes for the Build

This document is foundational for two things:

**The `shape.js` ATAK interface.** When `shape.js` is built, it needs a defined interface for what it shares with the ATAK. Section 11.2 is that definition. The interface is small. Six signals. Each one earned through this document's reasoning.

**The `atak.js` brief assembly logic.** When the intelligence layer of `atak.js` is built or rebuilt, it is built from this document. The brief assembly logic incorporates SHAPE signals to shape what surfaces, in what order, at what weight. Not as a feature — as the default behaviour of an intelligent brief.

**The Sanctuary Prompt Brief.** The Prompt Brief governs the Sanctuary AI. To write it, the writer must understand what the ATAK has been doing in prevention mode and what it hands off to the Sanctuary when activation mode opens. This document is that understanding.

---

## 13. Implementation Variables — Resolved (Session 29)

These were open at document creation. All five were worked and locked in the same session. They are launch calibrations — working values that deploy and adjust as real usage data accumulates. The intelligence engine is expected to develop toward greater determinism over time. These are starting points, not permanent answers.

---

### 13.1 Capacity Signal Thresholds

Each AIPA resource carries a state: **green** (within baseline) / **amber** (elevated) / **red** (seriously constrained).

The composite determines the capacity signal:

| Resource States | Capacity Signal |
|---|---|
| 0 red, any amber/green | Full |
| 1 red, 0–1 amber | Manageable |
| 1 red + 1 amber, or 2 amber | Constrained |
| 2 red | Critical |
| 3 red | Critical + convergence flag fires |

Thresholds are measured against the person's own rolling 90-day baseline, not an absolute value. As the baseline shifts, the thresholds shift with it.

---

### 13.2 Consequence Weight Table

Scale: **2–5**. Nothing surfaces at 1 — if it doesn't warrant a 2, it doesn't belong in the brief.

| HC / SC | Type | Baseline Weight |
|---|---|---|
| HC-1 | Vehicle Registration | 5 |
| HC-2 | Vehicle Service | 3 |
| HC-3 | Vehicle Insurance | 5 |
| HC-4 | Home Maintenance Task | 3 |
| HC-5 | GP / Annual Physical | 4 |
| HC-6 | Vehicle Maintenance Schedule | 3 |
| HC-7 | Dental Checkup | 3 |
| HC-8 | Eye Exam | 2 |
| HC-9 | Specialist Follow-up | 4 |
| HC-10 | Prescription Renewal | 4 |
| HC-11 | Vaccination / Immunisation | 3 |
| HC-12 | Mental Health Appointment | 4 |
| HC-13 | Screening (cancer, cardiac, etc.) | 4 |
| HC-14 | Emergency Preparedness | 2 |
| HC-15 | Home Insurance Renewal | 5 |
| HC-16 | Life Insurance Review | 4 |
| HC-17 | Passport Renewal | 4 |
| HC-18 | Driver's Licence Renewal | 5 |
| HC-19 | Child Health Appointment | 4 |
| HC-20 | School Enrollment Deadline | 4 |
| HC-21 | Property Tax | 5 |
| HC-22 | Tax Filing | 5 |
| HC-23 | Partner Credential / Licence Renewal | 4 |
| HC-24 | Mortgage Renewal | 5 |
| HC-25 | Utility / Service Contract | 3 |
| HC-26 | Pediatric Checkup | 4 |
| HC-27 | Will / Estate Review | 3 |
| HC-28 | Professional Licence Renewal | 4 |
| SC-1 | Acts of Service | 2 |
| SC-2 | Quality Time | 2 |
| SC-3 | Birthday — Partner | 4 |
| SC-4 | Birthday — Child | 4 |
| SC-5 | Relationship Check-In | 3 |
| SC-6 | The Undealt Thread | 5 |
| Transition | Active transition item | inherits cascade type weight |

The table is a living document. Weights adjust as deployment reveals miscalibration. New HC/SC types are assigned a baseline weight at the point they are built. SHAPE can modify how a weight is presented — it cannot change the table.

---

### 13.3 Season Signal Confidence Threshold

The stated world is a declaration the person made. It is respected, not rushed past.

| Window | Behaviour |
|---|---|
| 0–9 sessions | Stated world governs. Observed signal not used. |
| 10–19 sessions | Stated world governs. Observed signal begins informing tone at the edges. |
| 20+ sessions, 70%+ alignment | Observed world takes over. |
| 20+ sessions, under 70% alignment | Stated world holds. Re-evaluated every 10 sessions. |

The switch, when it happens, is silent. No announcement. The brief gradually feels more like them.

A declared update through onboarding or "Has something changed?" resets the stated world. The confidence window restarts from that point.

---

### 13.4 Disengagement Baseline Window

- Minimum **15 sessions** before the disengagement signal is trusted. Before that, there is no baseline to deviate from.
- Meaningful deviation: **3 consecutive sessions below baseline on 2+ engagement measures.** Single-measure deviation is noise. Multi-measure sustained deviation is signal.
- Rolling **30-session window**, most recent 10 sessions weighted 2x. Tracks the person as they evolve without being whipsawed by short-term shifts.

---

### 13.5 Convergence Flag Definition

Convergence requires all three conditions simultaneously:

1. **Domain count** — 3+ domains elevated (domain-level pattern, not single overdue items within a domain)
2. **Duration** — elevation sustained for 2+ weeks across those domains
3. **Trajectory** — 2+ of the elevated domains on a worsening trajectory, not holding steady

Any two conditions = elevated season. The ATAK handles it through normal brief weighting.

All three conditions = convergence flag fires. The brief tightens. SHAPE begins tracking toward the Sanctuary threshold.

**The convergence flag firing is not the Sanctuary opening.** The full Sanctuary trigger still requires accumulation + disengagement + final blow with the AIPA resource constraint model on top.

The goal of this entire system — prevention mode, resource-awareness, consequence weighting, the convergence flag — is that the Sanctuary rarely needs to open. A user who never sees the Sanctuary has not been underserved. They have been well served. Prevention working is not a failure. It is the point.

---

## 14. The Document's Standing

This document governs the intelligence layer of the ATAK. The ATAK Cascade Spec governs the presentation layer. Neither supersedes the other. Both are required.

When `atak.js` is built or rebuilt with intelligence layer awareness, it is built from this document and the Cascade Spec together. When `shape.js` is built, the ATAK interface it exposes is defined by Section 11.2 of this document. When the Sanctuary Prompt Brief is written, this document is one of the three that must be in hand.

If anything written in a later document contradicts something written here, the contradiction is resolved explicitly — not assumed away. If the intelligence layer needs to evolve as the build reveals new constraints, this document is updated before implementation proceeds.

The standard for the ATAK brief is deceptively simple: surface the right things, in the right order, at the right weight, for this person, today. This document is the definition of what "right" means. Hold it there.

---

*Your Life / Unlocked | ATAK Definition Document | Session 29, updated Session 32 | June 3, 2026 | Confidential*
