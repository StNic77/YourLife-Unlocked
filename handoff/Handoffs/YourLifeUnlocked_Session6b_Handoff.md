# YOUR LIFE: UNLOCKED
## Product Development — Session 6 Handoff
*May 2026 | Confidential*

---

## 1. What This Session Accomplished

Session 5 completed the onboarding arc and established the scaffold. Session 6 moved from design into build — the first working code exists, runs on device, and the product has been seen and felt for the first time outside of a design document.

Five things of lasting significance happened this session. The gallery bridge line was locked. The visual system was completed with nine AI-generated images — eight worlds and a welcome screen — critiqued, reshooted where needed, and deployed. The codebase was architected properly as a modular ES module Progressive Web App. The app ran live on GitHub Pages and was tested on iPhone. And the product received its first external user feedback, which produced one of the most important UX insights of the project so far.

The product is no longer a concept. It is a thing that exists, runs on a phone, and has been shown to another human being.

---

## 2. Decisions Locked This Session

### The Bridge Line
*Locked — but the tone is under review. See Section 6.*

> **"Where do you feel most like yourself?"**

This is the single line that appears between the welcome screen and the gallery. It does more work than it appears to — it is the first question the app ever asks, answered without typing, and the answer tells the app something real before onboarding has technically begun. The Authenticity Standard operating at its highest level.

**What this locks in downstream:**
- World names must not appear before the user selects. The gallery presents atmosphere only on first browse. Labels appear on hover (desktop) and are always visible at the bottom (mobile). The question becomes *"where do I belong"* not *"which label fits me."*
- The imagery quality is load-bearing. The line sets an expectation that the environments must meet.

### The Terminology — "Paths"
The system-level word for the eight worlds is **Paths**. The gallery moment is *"Choose your Path."* The eight worlds keep their own names clean — Operator, Range, Garden, Journey, Playbook, Summit, Practice, Meadow — no suffix required. The four groupings (Stoic/Grounded, Nurturing/Connected, Achievement/Oriented, Spiritual/Philosophical) remain internal product architecture, never surfaced to the user.

### The Enter Button — "Start Here"
*Agreed in principle, not yet implemented.*

The current button reads "enter this world." This will be changed to **"start here"** — two words that reframe the gallery choice from a permanent identity decision to a beginning. This is the minimum intervention required to address the first external user feedback. See Section 5.

### The Nine Images — All Locked

**The Welcome Screen**
A Milky Way reflected over still open water. Shot at night, horizon barely distinguishable from sky. No landmarks, no world-specific iconography. Pure threshold — the world before a world has been chosen. Dark, still, full of quiet possibility. The text layer (*your life / unlocked / everything in its season / begin*) overlays the photograph exactly as text overlays the gallery images. Filename: `WELCOME_SCREEN.png`.

**The Eight World Images**

| World | Status | Notes |
|---|---|---|
| **The Meadow** | ✅ Locked | Best image in the set. Exactly the founder's vision — rolling hills, distant house with warm window, wildflowers in foreground, sunset sky. |
| **The Range** | ✅ Locked | Pre-dawn mist sitting low over frost-covered grass. Rocking chair, mug on railing, barn barely visible. The colour temperature is cooler than the others — correct for this world. |
| **The Summit** | ✅ Locked | Alpenglow on the peak. Tent open, sleeping bag visible, coiled rope and pack in foreground. Vast scale, intimate detail. |
| **The Practice** | ✅ Locked | Shoji screens, polished floor, folded gi, incense smoke, katana on stand. Scroll reads 武士道 (bushido) — specific but authentic, passes the Cheesy Hook Check. |
| **The Garden** | ✅ Locked | Golden hour, raised beds, trowel in terracotta pot, gloves on fence post, watering can, sunflowers. Slightly more lifestyle than the others — accepted as the character of this world. |
| **The Journey** | ✅ Locked (b) | Reshoot: readable trail sign text removed. Weathered moss-covered post retained. Light shafts through old-growth forest. |
| **The Playbook** | ✅ Locked (b) | Reshoot: all readable text removed, motivational poster gone. Chalkboard and notepad show play diagrams only. Morning light through blinds, coach's cap, plain mug. |
| **The Operator** | ✅ Locked (d) | Reshoot: firearm removed. Readable text on whiteboard retained — confirmed as evidence of operational thinking, not decoration. Passes the Cheesy Hook Check. |

**Image prompt note for the record:** The word *crampons* stalls ChatGPT image generation. Substitute *climbing rope* and *weathered pack* in any future alpine prompts.

### Architecture Decision — ES Modules
The codebase is built as ES modules, not a monolithic HTML file. This decision was made with the long-term product in mind: connected app, Claude API as intelligence layer, Service Worker for offline nudge delivery, future SwiftUI translation. The module structure maps cleanly to native when that time comes.

---

## 3. The Codebase — What Was Built

The project is a properly architected Progressive Web App. Every file has a single job.

```
yourlife-unlocked/
  index.html              — shell only. ~20 lines. one div, meta tags, one import.
  service-worker.js       — caches static assets. stubs push notification delivery.
  css/
    global.css            — variables, reset, shared animations. one source of truth.
  js/
    main.js               — the router. boots the app, sequences screens.
    welcome.js            — welcome screen module.
    gallery.js            — gallery screen. scroll/swipe/dissolve engine.
    transitions.js        — shared dissolve engine. used by all screens.
    store.js              — app state. persists to localStorage.
    api.js                — all Claude API calls. one place, nowhere else.
  data/
    worlds.json           — single source of truth for all eight worlds.
  images/
    WELCOME_SCREEN.png
    THE_OPERATORd.png
    THE_RANGE.png
    THE_GARDEN.png
    THE_JOURNEYb.png
    THE_PLAYBOOKb.png
    THE_SUMMIT.png
    THE_PRACTICE.png
    THE_MEADOW.png
```

### worlds.json
The most important file in the project. Every world's identity, image path, onboarding tone, complete SMESC structure with all tiles, hidden tiles, statements, and close-out lines — all eight worlds, fully stubbed and ready for the onboarding build. When anything about a world changes, one file changes. Nothing else touches it.

### The Gallery — Input Intelligence
The gallery responds to every input method across every device:
- **Mouse scroll** — wheel up/down navigates worlds
- **Touch** — swipe up/down or left/right, 40px threshold
- **Keyboard** — arrow keys
- **Gyroscope** — gentle phone tilt triggers navigation (subtle, can be tuned or removed)
- **Dot navigation** — always-visible, tappable
- **Enter button** — always-visible, always one tap from commitment

Scroll throttling prevents accidental multi-world skips. The scroll hint disappears the moment the user first navigates — the app stops explaining itself once the user demonstrates understanding.

### The Dissolve
All world images cross-dissolve at 900ms with `cubic-bezier(0.4, 0, 0.2, 1)`. The incoming world fades up while the outgoing world is still visible underneath — no black flash, no hard cut. World names fade out briefly during the transition and return with the new name. The feeling is drift, not click.

### The Store
`store.js` persists user state to localStorage. World choice survives a browser close. Returning users will eventually bypass the welcome and gallery and arrive directly in their world. The state shape is established and ready for onboarding data.

### The API Module
`api.js` is stubbed with the correct endpoint, model (`claude-sonnet-4-20250514`), and a `getMissionTiles()` function that will drive the AI-generated tile expansion in onboarding. No other file in the project will ever touch the API directly.

### The Service Worker
Registers on first load, caches all static assets immediately, images cache on first visit. Push notification delivery is stubbed for when nudges are built. Cache version is `ylu-v2` — bump to `ylu-v3` on the next significant deploy to force fresh files on device.

---

## 4. What Is Running on Device

The app is live on GitHub Pages. The welcome screen loads with the Milky Way photograph, text fades in sequentially, "begin" button appears. Tapping begin transitions to the gallery. All eight worlds dissolve through scroll, swipe, keyboard, and gyro. Tapping "enter this world" on any world commits the choice and reaches a holding screen that displays the world name and arrival line. The holding screen is the onboarding placeholder — Session 7 replaces it with the real SMESC conversation.

Tested on desktop via VS Code Live Server and on iPhone via GitHub Pages as a home screen web app.

---

## 5. First External User Feedback — The Girlfriend Test

The welcome screen and gallery were shown to an external user with no prior context for the product. This is the first human outside the development process to see and interact with Your Life: Unlocked.

**Her response to the imagery:** Genuine impression. The images landed. Atmosphere communicated before any explanation was offered. This validates the visual system entirely — the gallery is doing its job.

**Her response to the choice:** She knew immediately which images were a hard no. But she hesitated to commit. Her stated reason: she felt she needed more information to make the right choice. Her instinct was toward a short quiz.

**The insight:** She wasn't lacking information. She was feeling pressure to choose correctly. Those are different problems with different solutions. A quiz addresses the first. Reducing the stakes addresses the second.

The gallery currently presents the choice as permanent-feeling. Eight worlds, a world name that appears, a button that says "enter this world." That reads as a commitment. The app knows the choice isn't permanent — the user doesn't yet. That gap is causing the hesitation.

**This is the Everyman response.** Not someone who already thinks the way the product thinks, but someone who will interact with it the way most people will. This feedback is more valuable at this stage than any internal review.

**The fix is small.** The button copy changes from "enter this world" to "start here." One or two words beneath the bridge question may also be added — something that signals impermanence without explaining it. The bridge question itself may be softened slightly in tone.

Nothing about the imagery changes. Nothing about the concept changes. The product knows what it is. It just needs to communicate one thing it currently doesn't: *this is a beginning, not a verdict.*

---

## 6. Things Under Review — Session 7 Workshops

### The Bridge Question — Soften the Tone
*"Where do you feel most like yourself?"* is doing the right work but may be landing with slightly more weight than intended. It is a direct, personal question — some users will feel examined rather than invited. The question should feel like an open door, not an assessment.

Workshop in Session 7: how to preserve the intelligence of the question while softening the pressure. Possible directions include reframing as an observation rather than a question, or finding a line that's quieter and more atmospheric in tone.

### The Arrival Lines — Workshop All Eight
The first thing each world says when the user steps in. Some are strong:
- *"First things first."* — Operator. Correct. Sparse, competent, no ceremony.
- *"You found your way here."* — Meadow. Correct. Receives the user rather than addressing them.
- *"The mat is ready."* — Practice. Strong. The space prepared before the person arrived.
- *"The summit is earned at base camp."* — Summit. Good. Stakes established immediately.

Some need work:
- *"Good land doesn't rush."* — Range. Close but slightly performed.
- *"Everything in its season."* — Garden. Gentle but generic. Could belong to any world.
- *"Every path begins somewhere."* — Journey. Placeholder energy. Needs a real line.
- *"Game day starts the night before."* — Playbook. Works but could be sharper.

Each line must survive the Cheesy Hook Check: would a real inhabitant of this world find this embarrassing? If yes, it goes. The standard is language that was lived, not researched.

### The Enter Button
Change from *"enter this world"* to *"start here."* Low risk, high impact. Reframes the decision from identity commitment to starting point. To be implemented at the top of Session 7 before anything else.

---

## 7. Founding Principles — Carried Forward

No new founding principles were added this session. The following existing principles were demonstrated in working code for the first time:

**The Authenticity Standard** — the bridge line is the standard operating at its highest level. A question answered without typing, through atmosphere rather than form. Currently under review for tone — the intelligence stays, the weight may soften.

**The Restraint Principle** — the scroll hint disappears the moment it is no longer needed. The app stops explaining itself. The dots persist because they serve navigation, not instruction.

**The Tending Philosophy** — the dissolve is slow enough to feel considered. The gyroscope input is the most literal expression of this principle in the codebase: the app senses physical movement and responds, without being asked.

**The Cheesy Hook Check** — applied to all nine images during review. The Operator's readable whiteboard text passed. The Playbook's motivational poster did not. The distinction: evidence of real thinking versus performance of identity. Now applied to all arrival lines in the Session 7 workshop.

---

## 8. Open Questions — Carried Forward

- Bridge question tone — soften without losing the intelligence. Session 7 workshop.
- Arrival lines — workshop all eight against the Cheesy Hook Check. Session 7.
- Enter button — change to "start here." First thing Session 7.
- Desktop image zoom — world images crop aggressively on wide screens. `object-position` needs per-image tuning or a max-width container introduced for desktop.
- How does the SMESC flow work as a real UI — conversation, tiles, transitions between elements?
- How do AI-driven mission tiles get generated, displayed, and selected?
- How does the hidden tile appear — present, not highlighted, just there?
- What does the user see first when onboarding ends — what is the home screen?
- Monetization model — subscription, freemium, or something else?
- Voice input — how does it work in the webapp vs native iOS?
- Photo/receipt input — on device or via API?
- Notification philosophy — frequency, tone, opt-out model across worlds.

---

## 9. Session 7 Agenda

The codebase is clean. The gallery is proven on device. The visual system is complete. Session 7 has two phases:

**Phase One — Quick wins before the onboarding build:**
- Change enter button to "start here"
- Workshop and lock the bridge question tone
- Workshop and lock the arrival lines for all eight worlds
- Fix desktop image zoom

**Phase Two — The Onboarding Build:**
- Wire `showOnboarding()` in `main.js` to a new `onboarding.js` module
- Build the Operator onboarding as the first complete SMESC flow
- Design and build the tile interaction component
- AI-driven mission tile generation via `api.js`
- Hidden tile — present, not highlighted, just there
- Close-out line — the moment authority transfers back to the user
- Confirm the full Operator onboarding runs end-to-end on device

The Operator scaffold is the template. Every other world's onboarding is built against it.

---

*Your Life: Unlocked | Session 6 of Many | Confidential Product Document*
