# YOUR LIFE / UNLOCKED
## Product Development — Session 12 Handoff
*May 2026 | Confidential*

---

## 1. What This Session Accomplished

Session 12 was the home screen. Not the brief, not the cascade — the room itself. The philosophy was locked, the imagery was generated, the interactive object system was built and tuned on device.

The product now has a home. The Operator walks into a room. Everything else follows from that.

---

## 2. Decisions Locked This Session

### The Gap Page — Revised Tile Set

The six-tile gap page was too heavy. All six tiles implied something was wrong. A person whose life is basically fine but who wants a thinking partner had no door in.

**New tile set — 11 tiles, all worlds:**

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

**Multi-select. Fits on screen without scrolling. No tile feels like a diagnosis.**

The ordering is deliberate — light to heavy top to bottom. The grid reads as a mix, not a symptom checklist.

**"Something I haven't dealt with yet"** is a high-signal tile. It is self-selected — the person choosing it has already done the work of acknowledging it. The app holds it quietly and says nothing. It surfaces later in the home screen cascade when the relationship has earned it. Option B confirmed — no light touch in onboarding, held for the home screen. Revisit if it feels thin when we build the cascade.

**worlds.json updated.** All 8 worlds now have 11 mission tiles with world-appropriate language flex. The `undealt` id is consistent across all worlds. No other files needed changes — `onboarding.js` is fully data-driven.

### The Language Decision

A significant shift, locked this session:

**The world analogies are for the architecture. The language steps back once the user is in the room.**

The onboarding needed the language — it was establishing the world, the relationship, the tone. Once the room exists, the environment carries the meaning. Objects are self-explanatory to anyone who lives in that world. Language appears only where an object alone cannot carry the weight.

This solves the Cheesy Hook Check permanently. If language is only used where it genuinely earns its place, it never becomes costume.

**Practical implication:** The brief, the grab-and-go cards, the urgent items — plain language, plain data. The world steps back. The 15th is the 15th for everybody. A birthday is a birthday. The calendar grid is universal — only the texture of the room around it changes.

### The Room — Philosophy Locked

The home screen is a room. A physical space belonging to one specific kind of person. The objects in the room are interactive doors to different domains.

**Two modes:**

**Grab and go** — tap any object. The room falls away. A tight focused brief fills the screen. One domain, what you need, dismissable. Fast.

**Depth** — tap the primary object. Full brief, cascades, urgent items, the session. Everything else lives here.

**Urgent items** — attach to their relevant object. The object signals urgency through its visual state (amber pulse). Acknowledgement required — dismiss or snooze. Snooze is data. Three snoozes on the same item is a different signal than one. The room does triage. The user never has to.

**The room changes over time.** Some hooks are empty until the app has something to hang on them. The room earns its fullness the same way the app earns trust.

### The Operator's Room — Objects Locked

| Object | Domain | Notes |
|---|---|---|
| **ATAC on dock** | Brief (depth) | Primary object. Always visible, always charged, always ready. Green indicator light on dock. |
| **Peltors on hook** | Alerts | Comms gear — nudges, people-related items, incoming alerts |
| **Keys on hook** | Vehicles | Registration, insurance, service history |
| **Calendar on wall** | Calendar | Time, relevance windows, what's coming. Universal object — only texture changes per world |
| **Notebook + pen** | Capture | Quick capture. Saves to store |
| **Maintenance tray** | Maintenance | Unglamorous recurring tasks, renewals |
| **Footwear/workout gear** | Health | Physical health domain |

Room is open to revision — principle locked, furniture isn't.

### The ATAC

The ATAC (Android Team Awareness Kit / Android Tactical Assault Kit) is the Operator's primary interface object. Always on its dock, charged, ready to grab. The dock indicator light is the app's heartbeat — normal state steady, urgent state amber pulse.

**Important authenticity note:** The founder carried before ATAK was in field use and has limited firsthand knowledge of the interface. When building the ATAC experience, reference real ATAK UI characteristics:
- Dark background, near-black
- Map or grid as the base layer — topographic or satellite style
- Dense, functional typography — built for mission use, not consumers
- Military symbology and iconography as texture, not decoration
- An unofficial ATAK Figma design system exists for reference (figma.com community)

We are not copying ATAK. We are building something an Operator would find immediately legible — that reads as *from that world* without pretending to be the real thing.

### The Calendar — Universal Object

A calendar is a calendar. The 15th is the 15th for everybody.

The world analogy informs the *texture* of the calendar object in each room — an almanac page in the Range, a planting chart in the Garden — but the underlying logic is identical across all worlds. Relevance windows, upcoming dates, the gap between when something matters and when you need to start moving — universal.

**The relevance window is the intelligence layer.** The calendar square doesn't light up on the date. It lights up when the user needs to act. The app knows that mailing a card overseas takes three weeks. A same-day restaurant booking takes an hour. As the window closes, the object's urgency state changes. The room communicates priority without text.

### The Other World Primary Objects

| World | Primary Object | Gesture |
|---|---|---|
| **Operator** | ATAC on dock | Grabs |
| **Range** | Field glasses on hook | Raises, surveys |
| **Garden** | Journal open on potting bench | Opens, reads |
| **Summit** | Topo map and route card | Unfolds |
| **Journey** | Trail journal by the door | Picks up |
| **Playbook** | Clipboard on desk dock | Picks up |
| **Practice** | Training log on mat-side shelf | Opens |
| **Meadow** | Card on stone surface | Turns over |

Each gesture is different. The Operator grabs. The Range surveys. The Garden opens. The act of accessing information is native to each world.

---

## 3. Imagery — Session 12 Status

### Operator Home Screen Image
**Filename:** `OPERATOR_HOME.png` — ✅ Locked

Three generation edits required:
1. American flags removed
2. ATAC described precisely (ruggedised Android field device, not notebook, not iPad)
3. Scaled back from iPad to mobile device; training shoes added to make health domain legible; calendar made more prominent

### Remaining Seven World Images
Generated and uploaded this session. Hotspot mapping for non-Operator worlds is stubbed in `home.js` with primary object only — to be completed as each world's room is confirmed on device.

### Image Generation Lessons — Locked in Prompt Document
Full prompt document updated: `YourLifeUnlocked_HomeScreen_ImagePrompts.md`

Key lessons:
- **Flags/insignia** — add no-flags constraint explicitly, generator adds them unprompted
- **ATAC/primary object** — describe precisely or generator substitutes generic device
- **Scale** — specify approximate size or generator gets it wrong
- **Workout gear** — needs footwear to be legible, folded clothing alone doesn't read
- **Calendar** — specify it occupies roughly upper-right quarter, or it disappears to the edge
- **Expect 2–3 edits per image** — normal, not a failure

---

## 4. Code — What Was Built and Committed

### worlds.json
- All 8 worlds updated from 6 to 11 mission tiles
- `undealt` id consistent across all worlds
- World-appropriate language flex preserved

### home.js — New Module
Full room system. Key architecture:

**HOTSPOT_MAPS** — percentage-based x,y positions per world so hotspots scale to any screen size. Operator positions tuned on device across multiple iterations.

**Operator hotspot positions — final (Session 12):**

| Object | x | y | r |
|---|---|---|---|
| ATAC (primary) | 48 | 46 | 44 |
| Peltors | 49 | 21 | 36 |
| Keys | 65 | 45 | 36 |
| Calendar | 87 | 30 | 38 |
| Notebook | 56 | 87 | 40 |
| Maintenance | 68 | 74 | 32 |
| Footwear/Health | 21 | 81 | 32 |

*Further fine-tuning likely in Session 13 — dev mode makes this fast.*

**DEV_HOTSPOTS mode** — add `?dev=hotspots` to URL. Shows coloured rings (green = primary, blue = secondary) with object name and x,y coordinates inside each ring. Invisible in normal use. URL param only.

**Domain briefs** — all seven domains have day-one honest empty states. Calendar wired to team data (partner birthdays within 14 days auto-surface). Vehicles, alerts, health, maintenance, capture all return plain empty states with a CTA stub.

**Urgent item system** — snooze (24hr default) and dismiss wired to store. Amber pulse on relevant object. Acknowledgement required.

**Quick capture** — saves to `store.get('capture_notes')`.

**Dev reset** — 3-second long press carried forward, now lives in `home.js` not `main.js`.

### main.js — Updated
- Imports `createHome` from `home.js`
- `showHome()` is now 4 lines
- Old placeholder and dev reset removed

---

## 5. Session 13 Agenda

### Track One — Dev Mode Coordinate Inspector
Add tap-to-read coordinates to dev mode. Tap anywhere on the room image and display the x,y percentage at that point. Makes hotspot positioning for remaining 7 worlds fast and precise — read the coordinate off the image, type it into the map, done. No more "a touch right."

### Track Two — Remaining World Hotspot Maps
With the coordinate inspector built, map all 7 remaining worlds. Each needs:
- Primary object position confirmed on device
- Supporting objects positioned
- Radii tuned for finger-friendly tapping

### Track Three — The ATAC Experience
The primary brief — what opens when the user taps the ATAC. This is the depth mode.

Design decisions to make before building:
- Brief sections and their day-one honest states
- The first cascade door — "Things I can keep track of for you"
- Trackable items warehouse — what the app offers to hold
- How the `undealt` tile surfaces here — when, how, what it opens
- ATAC visual language — dark, map-textured, functional, ATAK-reminiscent without copying

### Track Four — Grab-and-Go Brief Polish
The domain cards (vehicles, calendar, alerts etc.) are functional but plain. Once the ATAC experience is designed, bring the same visual language to the cards — consistent but lighter, appropriate to the fast-access mode.

### Parked — Not Forgotten
- Back button behaviour through partner cascade sub-steps
- Hotspot fine-tuning across all world rooms (ongoing, dev mode makes it fast)
- Blended families data model
- Scheduling / calendar event entry
- Bucket list + annual goals
- Monetization model
- Notification philosophy

---

## 6. Principles — All Carried Forward

No new principles added this session. The language decision reinforces existing principles rather than adding a new one.

Most relevant for Session 13:

**The Plain Language Rule** *(Session 10c)*
> The metaphors are for the architecture. The copy is for the person. Once inside the object experience, language is plain, data is universal, the world steps back.

**The Trust Ladder Principle** *(Session 10c)*
> The app earns access. It does not assume it. The `undealt` tile is held quietly until the relationship has earned the moment.

**The Tending Philosophy** *(Session 3)*
> The room does triage. The user never has to. Urgency is communicated through the state of the room, not through text or banners.

---

*Your Life / Unlocked | Session 12 of Many | Confidential Product Document*
