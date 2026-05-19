# YOUR LIFE: UNLOCKED
## Product Development — Session 2 Handoff
*May 2026 | Confidential*

---

## 1. What This Session Accomplished

Session 1 established the vision and founding principles. Session 2 defined **scope** — what this app actually is, how big it is, and how it behaves differently for different users. This is the foundation that onboarding must be built on.

---

## 2. How the User Actually Lives With Technology

Before designing any feature, we mapped how the target user (the founder) already interacts with devices and AI — because the app must fit into real behaviour, not invent new behaviour.

| Real Behaviour | What It Tells Us |
|---|---|
| Siri voice reminders on the go | Input must be frictionless and hands-free |
| "Take a note" voice capture while driving | Thought evacuation is a genuine need — get it out of your head fast |
| Photo of a receipt as a data source | The app should accept raw, messy input and extract the intelligence itself |
| Using AI as an affordable counsellor | The tone and relationship with this app is already established — trusted, honest, useful |
| Reminders as a lifeline | This isn't a nice-to-have; it's core infrastructure for a busy life |

**Design implication:** The app never asks the user to do the thinking. It accepts what they give it — a voice note, a photo, a quick thought — and does the work quietly in the background.

---

## 3. The Oil Change Model — Core Logic Pattern

The oil change example became the template for how the entire reminder and nudge system should work. It applies to every recurring event in a user's life.

**The pattern:**
1. User provides raw input *(photo of receipt, voice note, manual entry)*
2. App extracts the intelligence *(date of service, type of service)*
3. App sits quietly with that data
4. At the right moment, app opens a small conversation: *"Hey — your oil change might be due soon. What's your mileage right now?"*
5. User responds casually
6. App updates its model and goes quiet again until the next relevant moment

**This is not a notification. It's a check-in.**

The same logic applies to: dental appointments, insurance renewals, medication refills, seasonal tasks, relationship milestones, and anything else with a natural recurrence cycle.

---

## 4. Scope Definition — What This App Is

> **A one-stop shop to manage your busy life and breathe humanity into it — feeling genuine and unobtrusive.**

This is not a reminder app with relationship features bolted on. It is not a counselling app with a calendar. It is one unified intelligence that manages the **practical** and the **human** simultaneously, treating both with the same care.

### The Four Layers

| Layer | What It Does |
|---|---|
| **Life Management** | Reminders, scheduling, recurring tasks — the practical infrastructure of a busy life |
| **Relationship Intelligence** | People, key dates, context, emotional calendar — knowing what your people need |
| **Personal Growth** | The conscience layer — honest reflection, patterns over time, without being preachy |
| **Relational Advice Engine** | Real advice for real situations — dual-perspective, counter-cultural, genuinely useful |

---

## 5. Solo vs. Relational Users — The Behavioural Split

The app adapts based on the user's life situation. This is established in onboarding and can evolve over time.

### Solo User
- Full life management layer
- Personal reminders, recurring tasks, practical nudges
- Personal growth and reflection
- Relational advice when relevant (friends, family, colleagues)

### Relational User
Everything a solo user gets, plus:

- **Partner profile** — key dates, known sensitivities, communication style
- **Emotional calendar** — not just birthdays and anniversaries, but the quiet heavy dates
- **Equipping nudges** — advice that helps the user show up for their partner before being asked
- **Dual-perspective intelligence** — the same event, understood from both sides

### The Grief Anniversary Example — The Defining Use Case

> *The death of a loved one — an anniversary that may not live in the user's consciousness but carries deep meaning for their partner. The partner may have certain needs on that day but not know how to communicate them.*

No app thinks about this. This is the moment that separates Your Life: Unlocked from everything else on the market.

The app knows. It quietly equips the user to show up. The partner feels seen without having had to ask.

**This is emotional intelligence as a service.**

---

## 6. The Core Promise — Refined

> **The app knows what your people need, sometimes before they know how to ask for it — and it quietly equips you to show up.**

---

## 7. Architecture Overview — How Complexity Becomes Simple

The app is complex in the backend. The user never feels that complexity. From their perspective:

- Tell the app about your world once
- Feed it information as life happens *(voice, photo, quick thought)*
- Receive gentle, timely, human nudges that feel like they came from someone who actually knows you

### The Four Build Layers

| Layer | Question It Answers | Build Priority |
|---|---|---|
| **Data layer** | What does the app know? | Foundation |
| **Input layer** | How does it learn more? *(voice, photo, conversation)* | Phase 1 |
| **Nudge layer** | When and how does it speak? | Phase 1 |
| **Persona layer** | How does it adapt per user? | Phase 2 |

### The Intelligence Stack

The Claude API **is** the intelligence layer. The app's job is to be an exceptional context-delivery system — gathering the right information, storing it well, and delivering it to a powerful brain at exactly the right moment.

We are not building AI. We are building the environment AI needs to be genuinely useful in someone's life.

---

## 8. Revised Development Scope by Phase

| Phase | Target | Scope |
|---|---|---|
| **Phase 1: Prototype** | Month 1 | Prove the *feeling* — human, unobtrusive, genuine. Core input (voice/text), one or two nudge types, basic onboarding |
| **Phase 2: Beta** | Month 6 | Full feature stack — photo input, relational layer, emotional calendar, dual-perspective advice |
| **Phase 3: Refinement** | Months 7–10 | Feedback from 2–3 trusted users, polish, edge cases, bug resolution |
| **Phase 4: iOS Launch** | ~Month 12 | Native iOS via Xcode/SwiftUI. Logic and prompts built now translate directly |

---

## 9. Founding Principles — Carried Forward

These were established in Session 1 and apply to every decision made from here.

**The Authenticity Standard**
> No performed depth. No facade of meaning wrapped around superficial data collection. Every question must earn its place. If the app can learn by watching, it watches. If it must ask, it asks plainly and only once.
> *Check: does this feel like something a real person would say, or an app trying to seem meaningful?*

**The Restraint Principle**
> Driving engagement is not the goal. The app succeeds when you don't need to open it. It helps you when you need it and stays out of the way when you don't.
> *Check: does this serve the user's life, or does it serve the app's metrics?*

---

## 10. Open Questions — Carried Forward

- What does the onboarding conversation look and feel like? **(Session 3 focus)**
- What are the core reminder/nudge categories at launch?
- How does relational intelligence get populated — user input, inference, or both?
- What is the notification philosophy — frequency, tone, opt-out model?
- Monetization model — subscription, freemium, or something else?
- How does voice input work in the webapp prototype vs. native iOS?
- How does photo/receipt input get processed — on device, via API?

---

## 11. Session 3 Agenda

**Onboarding Flow Design**

With scope now defined, we can design onboarding intelligently. We know:
- It needs to establish solo vs. relational context
- It must feel like a first conversation, not a form
- It captures just enough to be useful immediately
- It sets the tone for everything that follows

Session 3 maps the actual conversation — the questions, the tone, the data captured, and the experience of a first-time user meeting this app for the first time.

---

*Your Life: Unlocked | Session 2 of Many | Confidential Product Document*
