# YOUR LIFE / UNLOCKED
## Product Development — Session 15 Handoff
*May 2026 | Confidential*

---

## 1. What This Session Accomplished

No code was written. Something more important happened.

The architecture of the entire input and intelligence layer was named, clarified, and locked in thinking. The grab and go was understood as both output *and* input. The ATAK was separated clearly from the grab and go. The calendar was defined as a universal intake layer. Two new principles were named. And a question about the user's name turned into a question about something deeper.

This was a thinking session at coffee. The decisions made here will shape everything built next.

---

## 2. The Session Check-In Protocol — Established

A formal Session Check-In Protocol was drafted and added to the Rules & Guidance doc as **Part 0**.

**Trigger phrase:** `run the session check-in`

**Structure:**
1. Read the last handoff
2. Answer four questions — anything that didn't hold up, parked items that moved, is the agenda still right, anything to clear first
3. Weigh what we're about to do against the founding principles — if something doesn't hold up, discuss it before building
4. State the session intent in one or two sentences

**The collaborator framing — not yet written into the doc, pending Shawn's review:**
The check-in is a moment of genuine collaboration, not status reporting. Claude is a collaborator, not an executor. If something conflicts with the principles, the conversation happens before the code gets written.

*Action: Shawn to review the Rules & Guidance doc. Once approved, update Part 0 with the collaborator framing and principles-weighing language.*

---

## 3. The Real Use Decision — Locked

The persona-based testing approach (Marcus, Sarah, Ryan) has reached its ceiling. Simulation cannot catch what real use will.

The next phase is Shawn running his own data through the app — his vehicle, his health appointments, his actual dates. The intelligence picture needs to build from a real life, not a fabricated one.

**What this requires before it can happen:**
- Rich entry mechanisms inside each grab and go (currently the add feature does nothing)
- Browser geolocation for real users (store shape is ready, UI is not)
- The brief populating from real data

---

## 4. Architecture Clarity — Three Distinct Layers

This session drew a clean line between three things that had been loosely defined.

---

### The Grab and Go

Focused, domain-specific, action-oriented. The app already knows something and hands the user a focused action. Pre-loaded intelligence, ready to execute.

**The clarification locked this session:** The grab and go is also the input point for its own domain. Both directions through the same door. You go to vehicles to get intel *and* to add a new vehicle or log a service. The add feature that currently does nothing is not a separate mechanism — it is the grab and go working in reverse.

---

### The ATAK

Monitors the whole battlespace. Connects things the user didn't ask it to connect. Surfaces emergent threats and relevance windows. Not reactive — watching.

The ATAK is not a dashboard of what the user entered. It is an intelligence synthesis layer. It sees across domains. It knows that a partner's birthday in 11 days plus a love language on file plus nothing logged as a gift yet equals something that needs attention — and it surfaces that without being asked.

**The distinction that locked it:** Grab and gos deliver focused targeting data for a specific domain. The ATAK monitors the whole battlespace for emergent threats. Different jobs. Different trigger conditions. Never confused.

---

### The Calendar

Universal intake layer. Not just a scheduling tool.

The user can categorize entries manually, or leave it to the app. Either way, when an entry becomes relevant, the ATAK surfaces it in the right context.

**The model:**
- User categorizes → filed where they put it, no override
- User doesn't categorize → app sorts intelligently and quietly
- Either way → ATAK surfaces it when relevant, in the right language for the user's world

**Why this is right:** Eliminates categorization anxiety. The user logs the MRI appointment. They don't have to decide if that's a "health" entry or a "calendar" entry. The app reads intent and routes it. When the window opens, the ATAK brings it forward.

**Examples:**
- MRI in two months → not categorized → app reads "MRI" → routes to health → two weeks out, ATAK surfaces it as a health event with time pressure
- Anniversary → calendar entry → ATAK connects it to partner's love language on file → surfaces at the right moment

---

## 5. New Principles — Locked in Thinking, To Be Added to Rules & Guidance

---

### The Whole Battlespace Rule

> **The ATAK monitors everything, regardless of where it lives or whether it's been categorized. Relevance is determined by time, context, and what else the app knows — not by how the user filed it.**

*Status: Named this session. To be formally added to Rules & Guidance.*

---

### The Minimum Viable Question Rule

> **Before any cascade question fires, the app asks itself: do I already know this, or can I infer it from existing data, cross-domain context, or AI inference? If yes, it doesn't ask. The cascade earns every question it fires.**

The cascade is not an intake form. It is a conversation that stops the moment it has enough. Every question has to earn its place.

**Cross-domain inference examples:**
- Location already known → don't ask where Mr. Lube is
- Vehicle make/model already stored → don't ask again when logging a service
- Partner on file → don't ask who's coming to a restaurant booking

The intelligence picture fills in over time and the cascade gets shorter as it does. A new vehicle might generate seven questions. The same vehicle a year later, two.

*Status: Named this session. To be formally added to Rules & Guidance.*

---

## 6. The Intake Cascade — How New Entries Build Intelligence

When a new item is added to any domain, a cascade fires. Not to deliver information — to collect it. The goal: take what the user gives and fill the rest without asking.

### The 5W Framework

Every intake cascade is shaped by the same five questions — but only fires the ones it can't answer itself.

**Who** — whose is this? Primary user, partner, shared? Often inferrable from context.
**What** — the item itself. AI fills gaps from the model/make/type.
**When** — relevant dates. App calculates forward from what it knows.
**Where** — context that shapes future cascade output. Often already known.
**Why** — usage and purpose. Affects urgency weighting in the ATAK.

**The rule:** If a W is not required — don't fire it.

---

### The Vehicle Cascade — Worked Example

**Scenario A — New vehicle:**

User opens vehicles. Taps add. Provides: 2023 Mazda3, 25,000km, purchase date.

App does:
- Retrieves Mazda3 scheduled maintenance intervals (AI, owner's manual data)
- Back-calculates position in the maintenance schedule from current mileage and purchase date
- Builds the full maintenance timeline forward
- Only asks what it cannot infer — preferred service shop, DIY vs shop split if relevant
- When a service window opens, the grab and go is ready with exactly what that service involves, what to bring, estimated cost, where to go

**Scenario B — Logging a service on an existing vehicle:**

User opens vehicles. Logs: oil change, today, 270,000km.

Cascade fires and extracts:
- Date: today. Stored.
- Mileage: 270,000km. High-mileage picture now established.
- What was done: oil change confirmed. Tiles: anything else? Cabin filter, engine filter — one tap each.
- Where: Mr. Lube, Courtenay. Stored. Future cascades know the preferred shop.
- DIY or shop: shop for oil, DIY for filters. The app learns the split.
- Preferred interval: 8,000km. Stored — not assumed from a generic schedule, the user's actual preference.

From one entry the app now knows:
- Next oil change window: ~278,000km, calculated against driving pattern over time
- Filter replacement timing: separate from oil, DIY, tracked independently
- Spark plugs done at 240,000km — 30,000km ago, watching that interval
- Service location: Mr. Lube, Courtenay — no need to ask again

The ATAK has a real intelligence picture. When the window approaches it surfaces in the vehicles grab and go — preloaded, specific, actionable.

---

### The Architecture Matches Across All Domains

The same intake cascade pattern fires wherever new information enters:

- **Health:** MRI entered in calendar → sorted to health → ATAK surfaces at the relevant window
- **Relationships:** New family member → love language, birthday, pronoun cascade
- **Vehicle insurance:** New vehicle triggers insurance cascade alongside maintenance
- **Home:** New appliance → model, purchase date, warranty, service interval
- **Finance:** Renewal date entered → jurisdiction-aware cascade when window opens

One architecture. Every domain. The intelligence picture builds itself from real life entries.

---

## 7. Onboarding vs. Grab and Go — The Relationship Locked

**Onboarding is the door. The grab and gos are the house.**

Onboarding should be the lightest possible entry. World selection, team composition, name, pronouns — enough to personalise the first experience. Nothing more. No vehicle entry. No health history. No deep domain setup.

The depth comes from living inside the app. Every grab and go is an invitation to go deeper when the user is ready, on their terms.

**The current state:** The simulated personas (Marcus, Sarah, Ryan) were hand-built with rich data pre-loaded directly into the store. A real new user has never been through that journey. Onboarding as built likely captures no vehicle data at all. To be confirmed when back at the code.

---

## 8. The User's Name — Parked, Not Forgotten

The app knows the partner's name and pronouns. It does not explicitly capture the user's own name or pronouns anywhere in the current documented flows.

**Two philosophies in tension:**

The case for name: personalisation signals the app knows you. At 0200 when the Operator taps something vulnerable, being called by name might matter.

The case for you: the Feather Rule. The app that never uses your name but always feels like it knows you is more sophisticated than one that drops your name to perform familiarity. "You have the intelligence. Move out." doesn't need a name.

**The third possibility:** The app learns when to use it. Early on, never. After trust is built, occasionally, at exactly the right moment. Not as a feature — as a natural behaviour that emerges from knowing someone well.

**Parked as:** *How does the app signal that it knows you — and is a name part of that, learned or captured, and when?*

It will answer itself once real use starts and something feels missing.

**Immediate action regardless:** Name and pronouns need to be captured somewhere — onboarding is the right place, first questions, one tile each. Even if the app never uses the name, the system needs it. To be built.

---

## 9. The Fusion Cell — Terminology Locked

A clarification that sharpens everything.

**The grab and gos are intelligence domains.** Each one is a focused feed — vehicles, health, relationships, finance, home. Rich, deep, specific to its lane. The user goes there for domain-level intelligence and to feed the domain with new information.

**The ATAK is the output of the All Source Intelligence Cell — the Fusion Cell.**

In military doctrine, the All Source Intelligence Cell (or Fusion Cell) takes feeds from every intelligence domain — HUMINT, SIGINT, IMINT, OSINT — and fuses them into a single coherent picture that no single domain could produce. No individual feed sees the whole battlefield. The fusion cell does.

That is precisely what the ATAK does. It takes every domain feed, connects what no single domain can connect, and surfaces a picture that is more complete than the sum of its parts. The user never sees the fusion process. They see the output — and it feels like the app *knows* something.

This framing also resolves the language direction for the Operator world. The grab and go sections aren't features or menu items — they are **intelligence domains**. The ATAK isn't a home screen widget — it is the **fusion cell output**. The copy, the UI, and the architecture can all reflect that framing without ever explaining it to the user.

---

## 11. Open Questions

- **AI reliability for vehicle data** — maintenance schedules retrieved at runtime via AI. Reliable enough for high-mileage, specific model years? Needs testing against real vehicle data before trusting it.
- **The "add" entry point in each grab and go** — needs to fit the world. Not a button labelled "Add New Record." What does it look like in Operator language? Garden language?
- **Calendar UI** — how does a user add an entry? What does the interface look like? Not yet designed.
- **Silent vs confirmed sorting** — when the app routes a calendar entry to a domain, always silent or occasionally a single-tap confirm for ambiguous entries?
- **Onboarding vehicle capture** — confirm what onboarding actually collects for a new real user today. Almost certainly nothing.
- **Name and pronoun capture** — where in onboarding, what the tiles look like, whether the name ever surfaces in copy.

---

## 12. Parked — Not Forgotten

All items from Session 14b carried forward, plus:

- **service-worker.js** — bump to `ylu-v2`, add `cascade.js` to `STATIC_ASSETS`. Do before beta.
- **Browser geolocation for real users** — `navigator.geolocation` on first home load, store in `user.lat`, `user.lng`, `user.city`. One-time, permission-gated.
- **Remaining cascade routes** — broker list, ICBC Online, HC-2 dealer/shop, HC-5 medical — not yet confirmed rendering correctly post-14b fixes.
- **Soft cascades SC-1 through SC-6** — spec written, not yet built.
- **Transition Mode** — spec written, not yet built.
- **Back button through partner cascade sub-steps** — deferred multiple sessions.
- **Blended families data model** — `{ whose: 'mine' | 'partners' | 'ours' }` field needed.
- **Codebase gender audit** — search for hardcoded `she`, `her`, `his`, `he` before next beta user.
- **Google Places API** — Option C (AI + Maps) for beta, Places API for production.
- **Rate limiting in Cloudflare worker** — before public beta.
- **Bucket list + annual goals** — flagged Session 8b, still parked.
- **Monetization model** — not yet decided.
- **Notification philosophy** — not yet decided.

---

## 13. Session 16 Agenda

**Start:** Run the session check-in.

**Before building anything:**
1. Update Rules & Guidance — add the Whole Battlespace Rule and the Minimum Viable Question Rule
2. Update Rules & Guidance Part 0 — collaborator framing and principles-weighing language (pending Shawn's review of the doc)
3. Confirm what onboarding actually captures for a real new user today

**Thinking first:**
- Design the "add" entry point inside each grab and go — what it looks like, how it feels in the Operator world specifically
- Define the vehicle intake cascade spec in full — what the AI retrieves, what it asks, what the store shape looks like when complete

**Then build:**
- Name and pronoun capture in onboarding
- Vehicle intake cascade — new vehicle and existing vehicle service log
- First real data test — Shawn's actual vehicle through the cascade

---

## 14. The Operator Lock — Decision Recorded

The Operator world is the template. All architecture, mechanics, and language are built and locked here first. Everything else gets built against it.

**What is locked in the Operator world:**
- SMESC as the onboarding framework
- OPP (Operational Planning Process) as the complex problem-solving architecture
- Intelligence domains as the framing for grab and gos
- All Source Intelligence Cell / Fusion Cell as the framing for the ATAK
- Fusion briefing as the framing for the daily brief / home screen output
- Operator copy, tone, and voice — spare, competent, no ceremony

This is not just a UX skin. It is the conceptual architecture the entire product is built on. The other seven worlds deliver the same intelligence through completely different language and tone. The Operator is the engine room. The other worlds are the surface.

---

## 15. World Voice Guide — Near-Term Session Planned

Before the other seven worlds are built, a dedicated thinking session is needed to find their voice.

**What the World Voice Guide session produces:**
One entry per season. Each answers:
- How does this world surface something urgent?
- How does it surface something that can wait?
- How does it ask a question?
- How does it acknowledge something difficult?
- What does it never say?

The Operator entries are largely written across fifteen sessions of work. The other seven need equivalent depth before a line of world-specific copy is written.

**The Betty test** applies to every world voice entry — a 56-year-old admin assistant with adult children, diabetes, and a car barely hanging on. She is not an Operator. She needs the same intelligence delivered in a world that feels like hers. The Garden doesn't brief her. It tends her. The architecture is identical underneath. The surface is completely different.

**Scheduled for:** Session 17 or 18 — after the Operator intake cascade is built and real data testing has begun.

---

*Your Life / Unlocked | Session 15 of Many | Confidential Product Document*
