# YOUR LIFE / UNLOCKED
## ATAK Cascade Spec
*Session 14 | Confidential | Build Bible*

---

## What This Document Is

This is the governing specification for every cascade built into the ATAK experience. It defines the data model, the tile system, the AI contract, and the completion loop for all cascade types — hard and soft.

Nothing gets built without this document being consulted first. If a cascade decision isn't covered here, it gets added before the code is written.

---

## The Core Principle

The ATAK surfaces what needs attention. The cascade delivers everything required to act on it — without leaving the app, without switching to Google, without losing the thread.

The cascade has one job: given an item Ryan needs to act on, put everything required to act in front of him. In the right order. With no noise.

**The AI is a servant, not a performer.** It does not explain its reasoning. It does not add colour. It does not reassure. It finds the answer and puts it in front of the user. If it cannot find the answer, it says so plainly and offers the next best path.

---

## The Tile System

### First Use: Tiles Orient

The first time a user encounters a cascade type, they are offered route tiles. Plain, tappable, no explanation needed.

**Vehicle registration — first time:**
```
How do you want to handle this?
[ Online ]  [ By Mail ]  [ In Person ]
```

**Vehicle service — first time:**
```
[ Dealer ]  [ Preferred Shop ]  [ DIY ]
```

**Birthday — first time:**
```
[ Gift ]  [ Experience ]  [ Quality Time ]  [ Acts of Service ]
```

Tiles are 2–4 options maximum. One option should reflect the most likely choice for this user based on what the app already knows. It is presented first, not highlighted — just ordered.

### Repeat Use: Preference Leads

The app remembers the user's last choice per cascade type. On repeat, it leads with that route — no tiles, straight to the content. The other routes remain accessible via a quiet "other options" link at the bottom. Never prominent. Never a second question. Just there if needed.

**Preference is stored per cascade type, per item type:**
```js
cascade_preferences: {
  vehicle_registration: 'online',
  vehicle_service:      'diy',
  birthday_partner:     'experience',
  birthday_child:       'gift',
}
```

### Tile Design Rules

- Labels are plain nouns or two-word phrases. Never verbs. Never questions.
- No icons unless the world demands them (Operator can use minimal symbology)
- No descriptions under tiles — the label is sufficient
- Tap feedback: immediate, physical (scale down, scale back)
- No confirmation after selection — the cascade opens instantly

---

## The Cascade Data Model

Every urgent item carries a `cascade` object that tells the renderer what to build.

```js
{
  id: 'vehicle_reg_2',
  object: 'keys',
  domain: 'vehicles',
  title: 'Sienna — Registration expired',
  body: '3 days overdue',
  snoozable: false,
  snoozed_until: null,

  cascade: {
    type: 'vehicle_registration',   // renderer key
    context: {                       // everything the renderer needs
      vehicle_id: 'v2',
      province: 'BC',
    },
  },
}
```

If an item has no `cascade` object, it is display-only — shown in the brief, no drill-down available. This is acceptable for early items. The cascade is added when the renderer exists.

---

## Hard Cascade Types

Hard cascades are logistics. The AI fetches or reasons the missing data. The renderer assembles it. The user acts.

---

### HC-1: Vehicle Registration

**Trigger:** Registration expiry within 30 days, or overdue.

**Route tiles (first use):**
```
[ Online ]  [ By Mail ]  [ In Person ]
```

**Online route delivers:**
- Direct link to provincial registration portal (BC: ICBC online)
- What you need: insurance certificate number, credit card, plate number
- Estimated cost: [derived from vehicle year, class, province]
- Time to complete: ~10 minutes
- Mark complete → updates `registration_expiry` in store, prompts for new expiry date

**By mail route delivers:**
- Mailing address for provincial authority
- Form name and number if required
- What to include: cheque or money order amount, supporting documents
- Processing time: [province-specific]
- Mark complete → same store update

**In person route delivers:**
- Nearest office: [name, address] — tap for directions
- Hours: [current day hours, including today's close time if relevant]
- What to bring: insurance certificate, payment, ID
- Wait time note if available
- Mark complete → same store update

**AI contract (hard):**
```
Given: province, vehicle year, vehicle class
Return JSON:
{
  online_url: string,
  estimated_fee: string,
  mail_address: string,
  mail_form: string | null,
  mail_processing_days: number,
  office_name: string,
  office_address: string,
  office_hours: { [day]: string },
  what_to_bring: string[]
}
No preamble. No explanation. Valid JSON only.
```

---

### HC-2: Vehicle Service

**Trigger:** Service due date within 30 days, or overdue.

**Route tiles (first use):**
```
[ Dealer ]  [ Preferred Shop ]  [ DIY ]
```

**Dealer route delivers:**
- Nearest dealer for vehicle make: [name, address, phone] — tap for directions or call
- Book online link if available
- What to mention: vehicle year, make, model, current mileage, service type
- Mark complete → updates `service_due`, sets next interval

**Preferred shop route delivers:**
- If a shop is on file: name, address, phone — tap to call or navigate
- If no shop on file: prompt to add one (one field, name or address, optional)
- Mark complete → same store update

**DIY route delivers — no preamble, straight to the list:**

*Example: 2018 Toyota Sienna, oil change*
- **Oil:** 6.4L, 0W-20 full synthetic
- **Filter:** Toyota 04152-YZZA1 or equivalent
- **Drain plug washer:** 90430-12031
- **Tools:** 14mm socket, drain pan, funnel, torque wrench
- **Torque spec:** drain plug 27 Nm / 20 ft-lb
- **Disposal:** [nearest used oil recycling depot] — tap for directions
- **Maintenance light reset:** hold trip reset button, turn key to ON (not start), hold until light flashes and resets
- Mark complete → same store update

**AI contract (hard):**
```
Given: vehicle year, make, model, service type
Return JSON:
{
  oil_volume_litres: number,
  oil_spec: string,
  filter_part_oem: string,
  filter_part_aftermarket: string | null,
  drain_plug_washer: string | null,
  tools: string[],
  torque_spec: string | null,
  maintenance_light_reset: string,
  disposal_search_query: string
}
No preamble. No explanation. Valid JSON only.
```

---

### HC-3: Vehicle Insurance Renewal

**Trigger:** Insurance expiry within 30 days.

**Route tiles (first use):**
```
[ Same Provider ]  [ Shop Around ]  [ Call My Broker ]
```

**Same provider route delivers:**
- Provider name (if on file)
- Renewal link or phone number
- Policy number reminder prompt if not on file
- Mark complete → updates `insurance_expiry`

**Shop around route delivers:**
- 3 comparison sites for province/state — tap to open each
- What to have ready: current policy, VIN, driving history
- Mark complete → same store update, prompts for new provider name

**Call my broker route delivers:**
- Broker name and number (if on file)
- If not on file: prompt to add (optional, one tap)
- Mark complete → same store update

---

### HC-4: Maintenance Task

**Trigger:** Maintenance item flagged as overdue or due within 14 days.

**Route tiles (first use):**
```
[ Do It Myself ]  [ Book a Service ]  [ Not Applicable ]
```

DIY and book routes follow the same pattern as vehicle service — specific materials, steps, nearest provider. The AI contract receives the task type and returns what's needed for that task.

**Not Applicable** dismisses and removes the item permanently.

---

## Soft Cascade Types

Soft cascades are relational intelligence. The AI does something fundamentally different here — it does not fetch data. It reasons about a person, a relationship, a season, and returns something that feels earned.

The standard for soft cascades is higher than for hard cascades. A wrong oil spec is an annoyance. A generic relationship suggestion breaks trust and the user does not come back.

**The test for every soft cascade output:**
> Would the user silently thank the app for this? Or would they roll their eyes?

If there is any doubt: do not surface it.

---

### SC-1: Acts of Service (Partner)

**Trigger:** Partner's love language is `acts_of_service`. Surfaces in the ATAK as a quiet prompt — not urgent, not pulsing. A different visual register than urgent items. Present. Unhurried.

**What the cascade is not:**
- A list of generic acts of service from the internet
- The same suggestion twice in a row
- Anything the user has already done and logged
- Anything that requires money the app doesn't know the user has
- Anything out of left field for this relationship

**What the cascade is:**
A single suggestion — or three options if the app doesn't have enough history to pick one — drawn from context the app actually holds.

Context the app holds for Ryan:
- Jess's love language: acts of service
- Relationship state: navigating
- Capture note: "Jess mentioned the deck needs staining"
- Whose children: blended — Ava is Jess's, Theo is theirs
- Ryan is a first responder — physical work is native to him
- No prior acts logged

With that context, the app doesn't offer "do the dishes." It surfaces the deck. Because Ryan already knows about the deck. The app noticed. That is the difference.

**First use — tiles (because no preference history):**
```
What feels right this week?
[ Something practical ]  [ Something with the kids ]  [ Something just for her ]
```

Ryan taps "Something practical." The cascade delivers one thing:

*The deck. She mentioned it three days ago. Staining a deck takes an afternoon — you probably have most of what you need.*

If he wants more: quiet link — "Other ideas." Not prominent. Not pushed.

**Repeat use — leads with the best option, no tiles.**

**AI contract (soft):**
```
System: You are a quiet, intelligent assistant helping a man tend his relationship.
You know the following about him and his partner:
- Partner name: [name]
- Partner love language: acts_of_service
- Relationship state: [state]
- Recent capture notes: [array]
- Children: [array with names, ages, whose]
- User occupation: [occupation]
- Prior acts logged: [array — may be empty]
- Route selected: [practical | kids | her]

Return JSON:
{
  primary: {
    suggestion: string,       // one sentence, plain, specific
    why: null                 // never explain. always null.
  },
  alternatives: [             // 2 options max, only if primary confidence is low
    { suggestion: string },
    { suggestion: string }
  ]
}

Rules:
- Never repeat a prior act
- Never suggest anything generic (doing dishes, making dinner) unless capture notes
  or history make it specifically relevant
- Never explain the suggestion
- Never mention love languages
- Never be cute
- The suggestion is a thing, not an instruction
- If confidence is low, return alternatives rather than a weak primary
- Valid JSON only. No preamble.
```

---

### SC-2: Quality Time (Partner)

**Trigger:** Partner's love language is `quality_time`.

Same architecture as SC-1. The AI has the same context. The output is a specific experience — not "go on a date" but something drawn from what the app knows about who they are.

Sarah and Daniel: he's a teacher, they have two young kids, Owen's birthday is in 4 days. The app doesn't suggest a weekend away. It might surface: *Owen's party is Sunday. The morning before is yours — two hours, no kids, just that.*

**AI contract:** identical structure to SC-1, `route` field replaced with `quality_time_context`:
```
quality_time_context: {
  kids_ages: [7, 4],
  upcoming_events: ['Owen birthday 4 days'],
  relationship_state: 'good'
}
```

---

### SC-3: Birthday — Partner

**Trigger:** Partner birthday within 14 days.

**Route tiles (first use):**
```
[ Gift ]  [ Experience ]  [ Quality Time ]  [ Acts of Service ]
```

The route aligns with the partner's love language — the app reorders tiles to lead with the love-language-aligned option. It does not announce why. It just puts it first.

Daniel's love language is quality time → Quality Time tile appears first.

Each route delivers specific, actionable content drawn from what the app knows about Daniel:

**Quality Time route for Daniel:**
- What the app knows: teacher, two young kids, relationship is good
- AI surfaces: a specific experience appropriate to who he is — not a generic restaurant suggestion
- Format: one primary suggestion, two alternatives
- Plus: practical logistics if needed (booking link, babysitter note if kids are young)

**Gift route delivers:**
- 3 specific gift suggestions — not categories, actual things
- Price range note if financial stress is detected in the store
- Where to get it: online link or local option — tap to open
- Time to arrive/ready: relevant if birthday is close

**AI contract (soft — birthday):**
```
Given: partner name, age (if known), love language, relationship state,
       days until birthday, any relevant capture notes, children ages,
       route selected

Return JSON:
{
  primary: {
    suggestion: string,
    logistics: string | null,   // booking link, where to buy, etc.
    time_note: string | null    // "ships in 2 days" or "book by Thursday"
  },
  alternatives: [
    { suggestion: string, logistics: string | null },
    { suggestion: string, logistics: string | null }
  ]
}

Rules:
- Specific, not categorical. Not "a nice dinner" — something specific.
- Aligned with who this person is, not a generic partner.
- If birthday is within 5 days: logistics are mandatory, not optional.
- Never mention love languages.
- Valid JSON only. No preamble.
```

---

### SC-4: Birthday — Child

**Trigger:** Child's birthday within 14 days.

**Route tiles (first use):**
```
[ Party ]  [ Family Day ]  [ Just the Two of You ]  [ Gift ]
```

The app knows the child's age. The content is age-appropriate without being announced as such. A suggestion for Theo (2) looks nothing like one for Caleb (11).

Caleb is 11, into sports — the app knows from Ryan's capture note ("Caleb needs new cleats for spring season"). The cascade for Caleb's birthday might surface: *New cleats are already on your list. Add the season's first game together and you've got the birthday covered.*

Theo is 2 — the cascade is practical: what to do, what a 2-year-old actually enjoys, what Ryan can make happen in a week.

**AI contract:** same structure as partner birthday, with `child_age` and `child_interests` (derived from capture notes) replacing partner context.

---

### SC-5: Relationship Check-In

**Trigger:** Not urgent. Not pulsing. This is a soft surface — appears in the ATAK's lower register when:
- Relationship state is `navigating`
- No check-in has been logged in the last 14 days
- The user has demonstrated trust in the app (engagement history)

**What it is not:**
- A prompt to "talk about your feelings"
- A therapy tool
- Anything that feels clinical or prescribed

**What it is:**
A quiet presence. One line. An open door the user can walk through or ignore.

*"How are things with Jess this week?"*

One tap: Better / About the same / Harder

The app receives the answer. Files it. Updates relationship state if warranted. Does not respond with advice. Does not ask a follow-up unless the user initiates.

If the user taps Harder — the cascade offers one thing only:

*"Is there something specific, or just the weight of it?"*

Two options: Something specific / Just the weight

If "Something specific": free text field, optional. What they write is stored. The app never references it directly unless invited.

If "Just the weight": the app says nothing more. It holds it. The Undealt Trust Principle applies.

**AI is not used in this cascade.** The prompts are fixed, human-written, world-specific. The Operator version sounds nothing like the Garden version. Both are written before they are shipped.

---

### SC-6: The Undealt Thread

**Trigger:** User selected `undealt` in onboarding mission. This is the most sensitive cascade in the product.

**This cascade does not have a trigger in the conventional sense.** It surfaces when earned — not on a schedule, not on a threshold count. The conditions are qualitative:

- The user has returned enough times that rhythm is established
- They have engaged with at least one emotionally weighted domain (relationship check-in, soft cascade)
- They have demonstrated trust — they act on what the app surfaces
- They are not in a heavy urgent-item period

When those conditions are true, the ATAK opens a door. Quietly. One line, in the language of their world.

**Operator version:**
*"You flagged something you haven't dealt with yet. Still carrying it?"*

Two options: *Yeah* / *Not ready*

*Yeah* opens a single free text field. No prompt, no question inside it. Just space. What they write is held. The app does not respond. It does not summarise. It does not offer resources unless the user asks.

*Not ready* closes the cascade. The app does not mention it again for at least 30 days. When it returns, it returns exactly the same way. No escalation.

**AI is not used in this cascade.** The language is fixed, world-specific, human-written. The stakes are too high for generation.

**The Undealt Trust Principle applies in full:**
> The app receives it quietly, holds it, and watches. It surfaces when the relationship has earned the moment — not on a schedule, not on a threshold, but when the picture is full enough and the trust is deep enough to open that door without breaking it.

---

## The Completion Loop

Every cascade that terminates in action must close the loop in the store.

| Cascade Type | Store Update |
|---|---|
| Vehicle registration | `vehicles[id].registration_expiry` → new date |
| Vehicle service | `vehicles[id].service_due` → new date based on interval |
| Vehicle insurance | `vehicles[id].insurance_expiry` → new date |
| Maintenance task | `urgent_items` → item removed or rescheduled |
| Birthday — gift/experience | `cascade_log` → entry added with date and what was done |
| Acts of service | `cascade_log` → entry added, feeds "prior acts" context |
| Relationship check-in | `team.partner.relationship_state` → updated if warranted |
| Undealt | `undealt_log` → timestamp only, no content stored in readable form |

**Completion UI:**
One tap. No ceremony. "Done" — the item leaves the brief. The store updates silently.

The app never says "Great job." It never acknowledges the completion beyond removing the item. The user did the thing. That is the point.

---

## What the AI Never Does in Any Cascade

- Summarises what the user can already see
- Adds a sentence of context before the useful information
- Presents options as a list when one is clearly right
- Confirms back what the user just did
- Uses the word "great" or any variant
- Explains why it chose something
- Mentions love languages by name to the user
- References its own reasoning
- Offers generic advice dressed as personal intelligence
- Makes the user feel like a data source

---

## Jurisdiction-First Rendering

**The AI does its homework.**

Every hard cascade that touches a government system, insurance product, licensing requirement, or regulated service must resolve jurisdiction before rendering anything. Generic options are never shown when jurisdiction-specific ones exist.

### The Rule

Jurisdiction is resolved from **plate province for vehicles**, **residential province for everything else**. When the two differ, the app asks once, stores the answer, and never asks again.

```js
user: {
  province: 'BC',              // where Ryan lives
}
vehicles[id]: {
  plate_province: 'AB',        // where the plate is registered
  insurance_provider: 'intact', // private AB insurer — not ICBC
}
```

When `plate_province !== user.province`, the cascade serves the plate jurisdiction — not the residence. It does not assume the user should change. It serves what's true right now.

### The BC Example — Why It Matters

BC combines vehicle registration and basic insurance into a single mandatory transaction through ICBC Autoplan. There is no shopping around for basic coverage. The plate is proof of both. This is fundamentally different from every other Canadian province.

An app that offers "Shop Around" for insurance to a BC driver has never been to BC. Trust gone.

**BC cascade routes:**
```
[ ICBC Online ]  [ Autoplan Broker ]
```

That is the complete option set for basic autoplan. Nothing else exists.

Optional insurance (collision, comprehensive, enhanced liability) is separate — purchased through the same broker or independently. The cascade addresses these separately and only if on file.

**Autoplan broker route delivers:**
- Nearest broker: name, address, hours — tap for directions
- What to bring: current vehicle portion, payment, odometer reading
- Estimated cost: based on vehicle class and driving record if on file
- Walk-in: no appointment needed at most locations

**ICBC online route delivers:**
- Direct link: icbc.com/autoplan
- What you need: BC driver's licence, vehicle info, payment
- Eligibility note: not all renewals can be completed online — the cascade checks and flags if in-person is required

### The Alberta Plates in BC Reality

People move. Plates don't always follow. A CAF member posted to BC from Alberta may drive Alberta-plated vehicles for months — legally, for a window, and then not. The app doesn't lecture. It doesn't flag compliance. It serves the actual situation.

If `plate_province` is AB and `user.province` is BC, the cascade asks once:

*"Your truck is registered in Alberta. Want me to track renewal the Alberta way?"*

```
[ Yes ]  [ It's complicated ]
```

*It's complicated* closes it permanently. The app files the ambiguity and serves the best information it can with what it knows. No follow-up. No judgment. No reminder that the user didn't answer.

**The governing principle:**
> The app serves the user's actual situation — not the ideal one, not the legally correct one, not the one that makes the cascade simpler to build. If the user is navigating a messy real-world situation, the app helps with the mess. Especially then.

### Jurisdiction Intelligence the AI Must Hold

The AI contract for any jurisdiction-sensitive cascade receives province/state as a required field and is expected to know:

- BC: ICBC Autoplan, combined registration + basic insurance, broker network
- AB: private competitive insurance market, separate registration through Alberta Transportation
- ON: private insurance, ServiceOntario registration, Drive Clean history
- SK, MB: government insurance monopolies similar to BC
- QC: SAAQ for registration, private insurance for civil liability
- US states: varies dramatically — the AI must know the state before rendering anything

This is not an exhaustive list. It is a signal that jurisdiction intelligence is load-bearing, not decorative.

---

## Expanded Hard Cascade Library

The following cascade types are defined and ready to build. All follow the same architecture: trigger, jurisdiction check, route tiles, AI contract, completion loop.

### Health & Body

**HC-5: Medical Appointment**
Trigger: last visit + recommended interval (GP: annual, specialist: varies). Cascade: book online via provider portal, call clinic, find nearest accepting patients if no provider on file.

**HC-6: Prescription Refill**
Trigger: days of supply remaining, estimated from fill date + quantity. Cascade: refill online via pharmacy app, call pharmacy, tap to navigate. Pharmacy name and number stored on file.

**HC-7: Dental Appointment**
Trigger: last visit + 6-month interval. Same pattern as medical, separate because booking and provider logic differs.

**HC-8: Eye Exam**
Trigger: last exam + provincial recommended interval (BC: annual for children, every 2 years for adults under 65). Optometrist on file or nearest accepting patients.

**HC-9: Annual Physical**
Trigger: date-based, annual. GP on file. Cascade leads with booking; if no GP on file, surfaces nearest clinic accepting new patients.

**HC-10: Gym / Training Routine**
Different from appointment cascades. Not a date trigger — a pattern trigger. If the store shows no logged activity in the last 7 days and a routine is on file, the cascade surfaces quietly. Not urgently. Not guiltily. One line: *"Your last logged session was 9 days ago."* Two tiles: *"Back at it"* / *"Routine's changed"*. No nagging if dismissed.

### Home

**HC-11: HVAC Filter**
Trigger: interval-based (1, 3, or 6 month filter on file). Cascade: filter size on file → tap to order (Amazon link or local hardware store nearest user). DIY install steps if requested.

**HC-12: Furnace Service**
Trigger: annual. Cascade: preferred HVAC company on file or nearest rated provider. Booking link or tap to call.

**HC-13: Smoke / CO Detector Batteries**
Trigger: annual, typically autumn before heating season. Cascade: tap to add to shopping list, or order online. Battery type derived from detector model if on file.

**HC-14: Gutter Cleaning**
Trigger: seasonal (spring + autumn). DIY checklist or nearest service provider. Weather window noted if relevant.

**HC-15: Appliance Maintenance**
Trigger: interval-based, appliance-specific. Fridge water filter (6 months), dishwasher clean cycle (monthly), washing machine drum clean (monthly), dryer vent cleaning (annual). Each has a DIY steps cascade and a service provider alternative.

**HC-16: Deck / Exterior Maintenance**
Trigger: seasonal, or explicitly flagged (capture note: "Jess mentioned the deck needs staining"). DIY route delivers: product recommendation by deck material, prep steps, weather requirements (temperature, no rain 48 hours), quantity estimate by square footage if on file. Service route: nearest exterior painting/staining company.

**HC-17: Winter Tire Swap**
Trigger: date-based (province-specific legal requirement dates) or temperature threshold if weather integration is live. Cascade: preferred shop on file or nearest tire shop with hours and tap to book. DIY route: torque specs for vehicle, remind to check pressure after first drive.

### Financial & Admin

**HC-18: Tax Filing**
Trigger: deadline-based. Canada: April 30 (June 15 if self-employed). US: April 15. Cascade: accountant on file (tap to contact) or direct link to CRA My Account / IRS Free File. What to have ready: T4s, RRSP receipts, etc.

**HC-19: Passport Renewal**
Trigger: expiry date on file. Surfaces 6 months before expiry — earlier if travel is logged in upcoming calendar. Cascade: Service Canada link, processing time (standard vs urgent), what to bring for in-person, photo requirements.

**HC-20: Driver's Licence Renewal**
Trigger: expiry date on file. Province-aware — BC: ICBC, ON: ServiceOntario, etc. Online or in-person route based on jurisdiction and renewal type.

**HC-21: Home / Tenant Insurance Renewal**
Trigger: expiry date on file. Unlike vehicle insurance, this is always shoppable. Cascade: current provider contact, plus option to compare. Does not push shopping — leads with current provider, alternative is accessible.

**HC-22: Subscription Audit**
Trigger: not date-based. Surfaces quarterly or when financial stress is detected in the store. Lists recurring charges on file. Tap any to review provider link or cancel instructions. No opinion on what to cut — just the list and the access.

### Kids

**HC-23: School Registration**
Trigger: deadline-based, school on file. Cascade: school contact, registration link if available, what documents are needed (proof of address, immunization records, etc.).

**HC-24: Vaccination Schedule**
Trigger: age-based, child's age known. Next recommended vaccine surfaced with typical timing. Cascade: family doctor on file or nearest public health clinic. Province-aware schedule.

**HC-25: Sports / Activity Registration**
Trigger: seasonal, activity on file. Registration window opens — cascade surfaces deadline, registration link or contact, cost if previously logged.

**HC-26: Pediatric Checkup**
Trigger: age-interval aware. Under 2: frequent. 2–5: annual. 5+: every 1–2 years. Pediatrician or GP on file. Same booking cascade as HC-5.

### Documents & Legal

**HC-27: Will / Estate Review**
Trigger: annual prompt, or after major life event (new child, marriage, move, posting). Cascade: lawyer on file or nearest estate lawyer. What to review: beneficiaries, executor, guardianship if children. No legal advice — just the prompt and the access.

**HC-28: Professional Licence Renewal**
Trigger: expiry date on file. Province-aware — nursing, trades, real estate, teaching credentials all have different renewal bodies and timelines. Cascade: direct link to licensing body, renewal requirements, continuing education credits if applicable.

---

## Transition Mode

### What It Is

Transition Mode is a first-class state the app enters when a move is detected. It is not a checklist. It is not a notification campaign. It is the app reorienting everything it knows about the user to serve the next chapter — surfacing what matters, in the right order, before the user knows to ask.

Every user can trigger it. For military families it is the rhythm of their life.

### The Trigger

One input. Any of:
- Photo of a posting message or move order
- Voice note: *"We're getting posted to Petawawa in August"*
- Manual entry: destination + move date

The app receives it and enters Transition Mode silently. No announcement. No "I've started your moving checklist." It just begins building the picture.

### What the App Stores

```js
transition: {
  active: true,
  type: 'posting' | 'move',          // posting = military, move = civilian
  origin: { province: 'BC', base: 'CFB Esquimalt' },
  destination: { province: 'ON', base: 'CFB Petawawa' },
  move_date: '2026-08-15',
  days_until: 83,
  completed_items: [],
  snoozed_items: [],
}
```

### The Timeline Cadence

The app does not dump everything at once. It surfaces what matters at the right distance from the move date.

**90+ days out — Horizon items, low urgency:**
- Housing: PMQ application window, waitlist reality for the destination base, private market overview for the area
- School registration: deadlines at the destination, school finder by base neighbourhood
- Begin: vehicle registration research for new province (information only — action comes closer)

**60 days out — Planning items, building urgency:**
- Driver's licence: transfer requirements for new province, timeline after arrival
- Health coverage: provincial health plan registration window (most provinces: 3-month wait, CFHIS bridges the gap for CAF)
- Partner employment: credential portability for new province if profession is on file — nursing licence transfer to CNO, trades ticket recognition, teaching certificate equivalency
- Utilities: what's standard at the destination, what to set up before arrival

**30 days out — Action items, urgent:**
- Vehicle registration: jurisdiction changes on move — new plates required within [province-specific window]. Cascade fires with destination province rules
- Service providers: GP accepting patients near the base, dentist, pediatrician for each child. Tap to see nearest, tap to call
- Schools: final registration deadline if not yet done, first day date, bus route information if available
- Change of address: federal (CRA, Service Canada, VAC), provincial, financial institutions — checklist with direct links

**Arrival week — Immediate needs:**
- The app reorients. Destination is now home. All jurisdiction cascades update silently to new province.
- Nearest essentials assembled without being asked: grocery, pharmacy, hardware, base services, urgent care
- Base-specific information: gate access, where to report, admin requirements

**30 days settled — Close the loop:**
- What transition items are still open
- Service providers: who has been confirmed, who is still needed
- The app asks once, quietly: *"How's the new posting?"* Three tiles: *Good* / *Getting there* / *Hard start*. Filed. Never referenced unless invited.
- Transition Mode closes. The app returns to its normal rhythm, now fully reoriented to the new location.

### What Makes the Military Version Different

The CAF member has done this before. He doesn't need hand-holding — he needs the app to handle what falls through the cracks while he is doing his job, managing his family, and processing a move that his partner and kids didn't choose.

**The app that shows up and says:**
*"Jess's nursing licence needs to transfer to the College of Nurses of Ontario within 30 days of establishing residency — here's the CNO application"*

— without being asked — just saved something real that real families lose in postings.

**The app that notices Caleb is changing schools mid-year and surfaces the new school's registration deadline and the hockey program at the base** — just made Caleb's transition fractionally less hard.

That is not a feature. That is why a military family keeps paying for it posting after posting.

### Civilian Move — Same Architecture, Different Content

Posting message becomes a move date. CAF-specific content does not appear. But the transition intelligence is identical:

- New province or city → jurisdiction updates, all cascades reorient
- New service providers needed → same discovery cascade
- Kids re-enrolling → same school registration cascade
- Partner employment transition → same credential portability check
- The app surfaces what matters in order, without being asked

The only difference is tone. The civilian move doesn't carry the weight of a posting. The app knows the difference and adjusts without announcing it.

### Transition Mode AI Contract

The AI does the research for the destination that the user cannot easily do themselves. For each transition item it receives: origin province, destination province, move type, family composition, professions on file, children's ages.

It returns jurisdiction-specific, destination-accurate information — not generic advice. If it does not have confident information for a specific destination (small base, unusual province combination), it says so and provides the closest accurate path.

```
Given: origin province, destination province, move type (posting/civilian),
       family: { partner profession, children ages },
       move date

Return JSON per transition phase:
{
  phase: '90_days' | '60_days' | '30_days' | 'arrival' | 'settled',
  items: [
    {
      id: string,
      title: string,
      body: string,          // one line, specific, actionable
      cascade_type: string,  // links to existing cascade renderer
      action_url: string | null,
      deadline: string | null,
      jurisdiction: string,
    }
  ]
}

Rules:
- Destination-specific, not generic
- If information is province-specific and confident: provide it
- If information is uncertain: flag it as "verify locally" — never fabricate
- Partner profession items only if profession is on file
- Children items only if children are present and ages are known
- Valid JSON only. No preamble.
```

### Transition Mode and the Store

When Transition Mode is active, the ATAK gets a new section — above Needs Attention, always visible until the transition is complete:

```
── Transition ──────────────────────
Petawawa · 83 days
3 items need attention now
```

Tap to expand. The transition cascade opens. Same visual language as the rest of the brief — no special UI, no progress bars, no gamification. Just the items, in order, with actions attached.

When all items are complete or the settled check-in fires, the section disappears. Quietly.

---

## Cascade Priority Order — Build Sequence

Build in this order. Each one is usable standalone. Each one feeds the next.

| Priority | Cascade | Why First |
|---|---|---|
| 1 | HC-1: Vehicle Registration | Concrete, testable, jurisdiction logic proven here |
| 2 | HC-2: Vehicle Service — DIY route | Rich content, proves the AI contract pattern |
| 3 | HC-2: Vehicle Service — Dealer/Shop routes | Completes the service cascade |
| 4 | SC-1: Acts of Service | First soft cascade, proves the AI soft contract |
| 5 | SC-3: Birthday — Partner | Builds on soft contract, adds logistics layer |
| 6 | SC-4: Birthday — Child | Age-aware variation of partner birthday |
| 7 | SC-2: Quality Time | Variation of SC-1 with different context shape |
| 8 | HC-3: Vehicle Insurance | Variation of HC-1 |
| 9 | HC-4: Maintenance Task | Variation of HC-2 |
| 10 | HC-5 through HC-28 | Library cascades — build as needed, architecture is proven |
| 11 | Transition Mode | Requires jurisdiction engine + multiple cascades to be live first |
| 12 | SC-5: Relationship Check-In | Fixed language, no AI, high sensitivity |
| 13 | SC-6: The Undealt Thread | Last. Only when everything before it is solid. |

---

## Principles Carried Into Every Cascade

Every cascade is checked against these before it ships:

**The Authenticity Standard** — Does this feel like something a real person would say, or does it feel like an app trying to seem meaningful?

**The Restraint Principle** — Does this serve the user's life, or does it serve the app's metrics?

**The Tending Philosophy** — Does this take from the user, or give to them?

**The AI Servant Rule** — Is the AI doing work the user cannot easily do themselves? If not, remove it.

**The Roll-Eyes Test** — Would the user silently thank the app for this, or roll their eyes? If there is any doubt: do not surface it.

---

*Your Life / Unlocked | ATAK Cascade Spec | Session 14 | Confidential*
*This document governs all cascade builds. Update before each new cascade type is built.*
