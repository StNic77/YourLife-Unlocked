# YOUR LIFE: UNLOCKED
## Product Development — Session 6 Handoff
*May 2026 | Confidential*

---

## 1. What This Session Accomplished

Session 5 completed the onboarding arc and established the scaffold. Session 6 moved from design into build — the first working code exists, runs on device, and the product has been seen and felt for the first time outside of a design document.

Four things of lasting significance happened this session. The gallery bridge line was locked. The visual system was completed with eight AI-generated world images, critiqued, and three reshoots executed. The codebase was architected properly as a modular ES module project — not a prototype, a foundation. And the app ran on desktop via Live Server and was pushed to GitHub for mobile testing.

The product is no longer a concept. It is a thing that exists.

---

## 2. Decisions Locked This Session

### The Bridge Line
*Locked permanently.*

> **"Where do you feel most like yourself?"**

This is the single line that appears between the welcome screen and the gallery. It does more work than it appears to — it is the first question the app ever asks, answered without typing, and the answer tells the app something real before onboarding has technically begun. The Authenticity Standard operating at its highest level.

**What this locks in downstream:**
- World names must not appear before the user selects — the gallery presents atmosphere only on first browse. Labels appear on hover (desktop) and are always visible at the bottom (mobile). The question becomes *"where do I belong"* not *"which label fits me."*
- The imagery quality is load-bearing. The line sets an expectation that the environments must meet.

### The Terminology — "Paths"
The system-level word for the eight worlds is **Paths**. The gallery moment is *"Choose your Path."* The eight worlds keep their own names clean — Operator, Range, Garden, Journey, Playbook, Summit, Practice, Meadow — with no suffix required. The four groupings (Stoic/Grounded, Nurturing/Connected, Achievement/Oriented, Spiritual/Philosophical) remain internal product architecture, never surfaced to the user.

### The Eight World Images — Locked
All eight AI-generated world images were reviewed, critiqued, and locked after reshoots where needed.

| World | Status | Notes |
|---|---|---|
| **The Meadow** | ✅ Locked | Best image in the set. Exactly the founder's vision. |
| **The Range** | ✅ Locked | Pre-dawn mist, rocking chair, barn in distance. Perfect. |
| **The Summit** | ✅ Locked | Alpenglow on the peak. Vast scale, intimate foreground. |
| **The Practice** | ✅ Locked | Shoji light, folded gi, incense, katana on stand. Note: scroll reads 武士道 (bushido) — specific but authentic. |
| **The Garden** | ✅ Locked | Golden hour, tools resting, watering can. Slightly more lifestyle than the others — accepted as the character of this world. |
| **The Journey** | ✅ Locked (b) | Reshoot: readable trail sign removed. Weathered post retained. |
| **The Playbook** | ✅ Locked (b) | Reshoot: all readable text removed, motivational poster gone. Play diagrams only on chalkboard and notepad. |
| **The Operator** | ✅ Locked (d) | Reshoot: firearm removed. Readable text on whiteboard retained — confirmed as evidence of operational thinking, not decoration. Passes the Cheesy Hook Check. |

**Image prompt note for the record:** The word *crampons* stalls ChatGPT image generation. Remove from any future alpine prompts and substitute *climbing rope* and *weathered pack*.

### Architecture Decision — ES Modules
The codebase is built as ES modules, not a monolithic HTML file. This decision was made with the long-term product in mind: connected app, Claude API as intelligence layer, Service Worker for offline nudge delivery, future SwiftUI translation. The module structure maps cleanly to native when that time comes.

---

## 3. The Codebase — What Was Built

The project is a properly architected Progressive Web App. Every file has a single job.

```
yourlife-unlocked/
  index.html              — shell only. 20 lines. one div, meta tags, one import.
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
    (eight world images)
```

### worlds.json
The most important file in the project. Every world's identity, image path, onboarding tone, complete SMESC structure with all tiles, hidden tiles, statements, and close-out lines — all eight worlds, fully stubbed and ready for the onboarding build. When anything about a world changes, one file changes.

### The Gallery — Input Intelligence
The gallery responds to every input method across every device:
- **Mouse scroll** — wheel up/down navigates worlds
- **Touch** — swipe up/down or left/right, 40px threshold
- **Keyboard** — arrow keys
- **Gyroscope** — gentle phone tilt triggers navigation (subtle, can be tuned)
- **Dot navigation** — always-visible tappable dots
- **Enter button** — always-visible, always one tap from commitment

Scroll throttling prevents accidental multi-world skips. The hint ("scroll") disappears the moment the user first navigates — the app stops explaining itself once the user demonstrates understanding.

### The Dissolve
All eight world images cross-dissolve at 900ms with `cubic-bezier(0.4, 0, 0.2, 1)`. The incoming world fades up while the outgoing world is still visible underneath — no black flash, no hard cut. World names fade out briefly during the transition and fade back in with the new name. The feeling is drift, not click.

### The Store
`store.js` persists user state to localStorage. World choice survives a browser close. Returning users will eventually bypass the welcome and gallery and go directly to their world. The state shape is established and ready for onboarding data.

### The API Module
`api.js` is stubbed with the correct endpoint, model (`claude-sonnet-4-20250514`), and a `getMissionTiles()` function that will drive the AI-generated tile expansion in onboarding. No other file in the project will ever touch the API directly.

---

## 4. What Is Running on Device

The app is live on GitHub Pages. The welcome screen animates in, the gallery loads with all eight worlds, the dissolve navigation works across scroll, swipe, keyboard, and gyro. Selecting a world and tapping "enter this world" triggers the choice and reaches a holding screen.

The welcome screen CSS animation is confirmed **unacceptable** as a substitute for the world imagery standard established by the eight gallery images. It will be replaced before the next session with a real image — see Open Questions.

---

## 5. The Welcome Screen Problem

The current welcome screen uses a CSS/SVG-drawn scene — animated stars, vector hills, a tiny house, mist effects. On desktop in development it reads as atmospheric. On a real device next to the gallery images it is immediately exposed as a lower tier of visual quality.

**The fix:** The welcome screen needs a real photographic or AI-generated image — a ninth image in the set, purpose-built for this moment. It must be:
- Tonally distinct from all eight world images — this is the *before*, the neutral arrival point
- Dark, still, atmospheric — the world before the user has chosen their world
- No specific world's iconography — not a meadow, not a mountain, not a dojo
- Portrait 9:16, same treatment as the eight worlds

**Candidate directions:**
- A night sky — stars, open darkness, the sense of infinite possibility before a choice
- A threshold — a doorway, a path fork, a shoreline at dusk, somewhere between worlds
- Abstract atmosphere — mist, light, water — nothing specific enough to belong to any one world

This is a prompt to write and generate before Session 7. The welcome screen image replaces the CSS scene entirely. The text layer (*"your life / unlocked / everything in its season / begin"*) overlays the photograph exactly as it overlays the world images in the gallery.

---

## 6. Principles Established This Session

No new founding principles were added. The following existing principles were demonstrated in working code for the first time:

**The Authenticity Standard** — the bridge line *"Where do you feel most like yourself?"* is the standard operating at its highest level. A question answered without typing, in the language of atmosphere rather than form.

**The Restraint Principle** — the scroll hint disappears the moment it is no longer needed. The app stops explaining itself. The dots persist because they serve navigation, not instruction.

**The Tending Philosophy** — the dissolve between worlds is slow enough to feel considered. The gyroscope input is the most literal expression of this principle in the codebase: the app senses the user's physical movement and responds, without being asked.

---

## 7. Open Questions — Carried Forward

- **Welcome screen image** — needs to be generated before Session 7. See Section 5.
- Desktop image zoom — the world images are cropped aggressively on wide screens. `object-position` needs tuning per image, or a max-width container needs to be introduced for desktop.
- How does the app handle the onboarding conversation technically — the SMESC flow as a real UI?
- How do AI-driven mission tiles get generated, displayed, and selected?
- How does the hidden tile appear — always present, not highlighted, just there?
- What happens after the close-out line — what does the user see first when onboarding ends?
- Monetization model — subscription, freemium, or something else?
- Voice input — how does it work in the webapp vs native iOS?
- Photo/receipt input — on device or via API?
- Notification philosophy — frequency, tone, opt-out model across worlds.

---

## 8. Session 7 Agenda

The codebase is clean and the gallery is proven on device. Session 7 has one primary objective and one prerequisite:

**Prerequisite before Session 7:**
Generate the welcome screen image. Write the prompt, generate it in the same ChatGPT project as the eight world images for visual consistency, review it against the brief in Section 5. It should be ready to drop in.

**Session 7 primary objective — The Onboarding Build:**
- Wire `showOnboarding()` in `main.js` to a new `onboarding.js` module
- Build the Operator onboarding as the first complete SMESC flow
- Tile UI — design and build the tile interaction component
- AI-driven mission tile generation via `api.js`
- Hidden tile — present, not highlighted, just there
- Close-out — the moment authority transfers back to the user
- Confirm the full Operator onboarding runs end-to-end on device

The Operator scaffold is the template. Every other world's onboarding will be built against it.

---

*Your Life: Unlocked | Session 6 of Many | Confidential Product Document*
