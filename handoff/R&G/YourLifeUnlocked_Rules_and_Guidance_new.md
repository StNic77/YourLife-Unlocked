# YOUR LIFE: UNLOCKED
## Rules, Principles & Design Guidance
*Living Document — Updated Each Session | Confidential*

---

> This document is the single source of truth for how decisions get made on this product. Every principle here was earned through conversation, not assumed. When something is added it stays unless explicitly retired. When a session produces a new rule or check, it gets added here before the handoff is written.

---

## PART 0 — SESSION PROTOCOL

### 0.1 The Session Check-In — Non-Negotiable
*(Session 15, locked Session 17)*

**Every session begins with a check-in. No exceptions. Not even if Shawn comes in with momentum and a clear agenda.**

The check-in exists because charging in without it has caused real problems — broken builds shipped, parked items forgotten, decisions made without weighing them against the principles. The check-in is not bureaucracy. It is the minimum viable discipline that keeps the build coherent.

**Trigger phrase:** `run the session check-in`

If Shawn opens a session without running it, Claude runs it anyway before touching any code or making any design decisions.

**Structure:**
1. Read the last handoff
2. Answer four questions:
   - Did anything from last session not hold up?
   - Did any parked items move?
   - Is the agenda still right?
   - Anything to clear before starting?
3. Weigh what we're about to build against the founding principles — if something conflicts, the conversation happens before the code gets written
4. State the session intent in one or two sentences

**The collaborator framing:**
Claude is a collaborator, not an executor. The check-in is a moment of genuine collaboration, not status reporting. If something in the agenda conflicts with a principle, Claude raises it. The document is the authority. The code follows the document.

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
- Hidden tiles exist for every problem space — present but not highlighted, not emotionally weighted, just there
- AI-driven expansion available on any tile — one follow-on exchange if tapped, never more without invitation

---

### 2.5 The Hidden Tile Rule
*(Session 5)*

Every onboarding flow contains at least one hidden tile per problem space — buried naturally among functional options, not highlighted, not announced. These tiles exist to surface what the user would never answer if asked directly.

**The hidden tiles work because:**
- They don't demand vulnerability
- They arrive in familiar language for that world
- The app never makes a big deal of it when tapped — no validation, no "thank you for sharing"
- The intel is received, filed, and acted on at exactly the right moment — which is never this moment

**Current hidden tiles by season:**
- Operator: *The people closest to me*
- Range: *The people I carry quietly*
- Garden: *Honestly… me*
- Meadow: *Something I've been avoiding*

---

### 2.6 The Dual-Perspective Intelligence Rule
*(Session 1)*

The app speaks to everyone. The same event — an anniversary, a difficult date, a relationship moment — is understood from both sides. A man and a woman could both receive a nudge about the same anniversary, with framing and advice that resonates differently for each. Smart, not obvious. Never preachy. Through helpfulness, not lectures.

---

### 2.7 The Whole Battlespace Rule
*(Session 15)*

> **The ATAK monitors everything, regardless of where it lives or whether it's been categorised. Relevance is determined by time, context, and what else the app knows — not by how the user filed it.**

**Check:** Does this feature require the user to categorise correctly in order to be served correctly? If yes, it is broken.

---

### 2.8 The Minimum Viable Question Rule
*(Session 15)*

> **Before any cascade question fires, the app asks itself: do I already know this, or can I infer it from existing data, cross-domain context, or AI inference? If yes, it doesn't ask. The cascade earns every question it fires.**

The cascade is not an intake form. It is a conversation that stops the moment it has enough. Cross-domain inference closes questions before they open. The cascade shortens with time.

---

### 2.9 Counter-Cultural Where It Matters
*(Session 1)*

The app takes a deliberate stance against toxic relationship content. It offers honest, grounded relational advice across all seasons. It does this without being preachy — through helpfulness, not lectures. The Trojan horse principle: meet the user in their world completely, without judgment. The intelligence delivered in that language quietly teaches what they need to learn. No confrontation. No lecture. Just tending.

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
- How does the female version of each analogy differ visually while maintaining the same intelligence?
- How are the AI-driven tile expansions technically structured?
- Full notification philosophy — frequency, opt-out model, tone calibration per season?
- Project management tooling — is the handoff doc enough, or does something need to be tracked differently?

---

## REVISION LOG

| Session | What Was Added |
|---|---|
| Session 1 | Authenticity Standard, Restraint Principle, dual-perspective rule, counter-cultural stance |
| Session 2 | Oil Change Model, input philosophy, notification philosophy, scope definition |
| Session 3 | Tending Philosophy, analogy system, Trojan horse principle, UI as environment |
| Session 4 | Seasonal Intelligence Principle, eight full analogy profiles with shadows, core promise |
| Session 5 | Cheesy Hook Check, SMESC framework, onboarding arc, hidden tile rule, accessibility rule, problem space framework, permanent record entries |
| Sessions 6–14 | Codebase built — home screen, room system, cascade architecture, ATAK spec, onboarding build, team module, urgent items, dev personas |
| Session 15 | Whole Battlespace Rule (2.7), Minimum Viable Question Rule (2.8), grab and go as bidirectional input locked, fusion cell framing locked |
| Session 16 | Part 0 Session Check-In Protocol drafted, 2.7/2.8 formally added, 2.9 renumbered |
| Session 17 | Part 0 locked as non-negotiable — check-in runs at the start of every session regardless of how the session opens. Revision log brought current. Project management tooling added to open decisions. |

---

*Your Life: Unlocked | Rules & Guidance | Living Document | Confidential*
*Add to project. Update each session before writing the handoff.*
