# YOUR LIFE / UNLOCKED
## Commercial Guidance, IP Protection & Exit Strategy
*Living Document — Referenced When Relevant | Confidential*

---

> This document does not front-load everything at once. Like the product it supports, it shows up when needed and stays out of the way when it doesn't. Each section is tagged with the trigger that makes it relevant. When a session or decision reaches that trigger, this document gets pulled.
>
> Read alongside: `YourLifeUnlocked_Rules_and_Guidance.md`

---

## HOW TO USE THIS DOCUMENT

Each section carries a **WHEN THIS MATTERS** tag. That tag tells you the moment — a build milestone, a decision point, a conversation — at which that section becomes the relevant one to read. Before that moment, it doesn't need to be open.

Nothing here is urgent until its trigger arrives. When a trigger arrives, it becomes the most important thing on the table.

---

## SECTION 1 — CODE PROTECTION & SECURITY
**WHEN THIS MATTERS:** Before any external user touches the app. Any beta tester, friend, or acquaintance who is not you.

---

### 1.1 The API Key Problem

This is the one that cannot wait.

If the Claude API key lives anywhere in the client-side codebase — in `api.js`, in `worlds.json`, in any file that ships to the browser — any user with DevTools open can find it in under a minute. An exposed API key means someone else can run up charges on your account, clone your AI behaviour, or understand your prompt architecture.

**The fix:** A lightweight backend proxy. The client calls your server. Your server holds the key and calls the Claude API. The key never leaves the server.

For the current webapp on GitHub Pages, this requires a small hosted backend — something like a Cloudflare Worker, a Vercel serverless function, or a simple Node/Express server. The cost is minimal. The risk of not doing it is real.

**Do this before beta. No exceptions.**

---

### 1.2 Code Obfuscation

Obfuscation makes your code unreadable to casual inspection. It does not make it impossible to reverse-engineer — a determined developer with time can work through obfuscated code. But it raises the cost of casual theft significantly and removes the "I just opened DevTools" problem.

**Tools:**
- **Terser** — the standard for JavaScript minification and obfuscation. Renames variables to single characters, compresses logic, removes comments and whitespace. Can be added to the build process.
- **Vite or Webpack** — a proper build pipeline handles Terser automatically, manages environment variables cleanly, and prepares the codebase for the iOS build when that time comes. Worth introducing before beta.

**What obfuscation does not protect:** The concept, the UX, the philosophy, the copy. Those live in the experience, not the code. A user can reverse-engineer the product by using it. That is a different problem with a different solution — see Section 3.

---

### 1.3 Environment Variables

API keys, any future database credentials, and any service tokens belong in environment variables — never in code that ships to a browser.

In a Vite project, environment variables live in a `.env` file that is excluded from the GitHub repository via `.gitignore`. The variable is referenced in code as `import.meta.env.VITE_VARIABLE_NAME` and never appears in the committed codebase.

**Check your `.gitignore` now.** If `.env` is not in it, add it before the next commit.

---

### 1.4 GitHub Visibility

The current repository on GitHub Pages is presumably public — that is how it serves the app. Public means the code is readable by anyone who finds the URL.

Before beta:
- Confirm no credentials exist anywhere in the committed codebase
- Consider whether the repository should move to private, with GitHub Pages served from a private repo (available on paid GitHub plans)
- Review commit history — credentials accidentally committed in an earlier commit remain in the history even after deletion. If this has happened, the key must be rotated immediately and the history cleaned.

---

## SECTION 2 — INTELLECTUAL PROPERTY
**WHEN THIS MATTERS:** Before the product is shown to anyone outside a circle of complete trust. Before any press, any public mention, any pitch.

---

### 2.1 What You Actually Own

IP in a software product lives in several places. Understanding which you have — and which you don't — matters before any commercial conversation.

**What is protectable:**
- **Copyright** — the specific expression of your code, copy, and design. This exists automatically the moment something is created. You own the words in the onboarding flows, the specific copy of the arrival lines, the structure of the worlds.json architecture.
- **Trade secrets** — confidential business information that gives you a competitive advantage. The SMESC onboarding architecture, the hidden tile logic, the aspiration gap framework, the problem-solving translation by season — these are trade secrets as long as they remain confidential. The moment they are public, they are no longer trade secrets.
- **Trademark** — the name "Your Life / Unlocked" and any logo or visual identity can be registered as a trademark. This protects the brand, not the concept.
- **Patents** — software patents are possible but expensive, slow, and of variable enforceability. A provisional patent application is relatively cheap and buys 12 months of "patent pending" status. Worth a conversation with a patent lawyer at the right moment — not now.

**What is not protectable:**
- The general concept of a life companion app
- The idea of analogy-based onboarding
- The philosophy of restraint over engagement

Ideas are not protectable. Execution is. The more specifically your execution is documented — in these handoffs, in the codebase, in dated files — the stronger your position if you ever need to demonstrate prior art or originality.

---

### 2.2 The Trade Secret Window

Right now, the most valuable protection you have is confidentiality. Everything documented in this project — the aspiration gap principle, the problem-solving framework by season, the hidden tile architecture, the SMESC onboarding translation — is a trade secret as long as it stays close hold.

**The window closes the moment the product is public.** Once users can use it, the experience can be documented, the concept can be described, and the protection evaporates. This is not a reason to delay indefinitely — a product that never ships has no value. But it is a reason to be intentional about timing.

**Before going public:**
- Ensure the core architecture is documented with dates (these handoff documents serve that function — preserve them)
- Trademark the name
- Consider a provisional patent application for the most novel technical elements (the seasonal detection system, the aspiration gap reading mechanism)
- Have a brief conversation with an IP lawyer — one hour, not a retainer

---

### 2.3 Documenting Prior Art

Every session handoff in this project is a dated record of original thinking. That matters.

Keep them. Back them up in multiple locations. Do not edit them retroactively. They establish that this product, in this form, existed on these dates — and that you created it. If a dispute ever arises about who built what first, these documents are evidence.

Add a simple backup discipline now: copies of all project documents in cloud storage (iCloud, Google Drive, or similar) with automatic sync. Not because you expect a dispute. Because the cost of the habit is zero and the value in an edge case is significant.

---

### 2.4 Working with Contractors

If a developer, designer, or any other contractor is ever brought in to help build this, two things must happen before they touch the codebase:

1. **A Non-Disclosure Agreement (NDA)** — signed before any conversation about the product's architecture or philosophy. Templates exist online; a lawyer can review one inexpensively.
2. **A Work-for-Hire Agreement** — establishes that anything they build for this project belongs to you, not to them. Without this, a contractor may have a claim on code they wrote.

This applies to friends helping out informally as much as it applies to paid professionals. The relationship doesn't change the IP risk.

---

## SECTION 3 — THE ACQUISITION PATH
**WHEN THIS MATTERS:** When the product has a complete first experience, real users showing genuine retention, and a story worth telling. Not before.

---

### 3.1 What Acquirers Actually Buy

Understanding what a buyer is paying for changes how you build and how you talk about what you've built.

**They are not buying the code.** Code can be rewritten. They are buying one or more of:
- **A user base with demonstrated behaviour** — retention, depth of engagement, evidence that people return without being guilted
- **A novel technical or architectural approach** — something that would take significant time and intelligence to replicate
- **Data** — what the app has learned about users over time, at scale
- **A team** — the people who built it and understand it (acqui-hire)
- **A strategic asset** — something that fills a gap in their own product or blocks a competitor

Your Life / Unlocked's strongest acquisition case, at the right stage, is probably the first two — demonstrated retention that proves the restraint philosophy works commercially, and an AI architecture that delivers genuinely personal intelligence in a way competitors haven't built.

---

### 3.2 The Right Category of Buyer

A Big Tech acquisition (Apple, Google, Meta) is possible but unlikely at early stage. They buy at scale or for exceptional teams. The more realistic early acquisition targets are:

**Mental wellness platforms** — Headspace, Calm, BetterUp. They have users, distribution, and monetization. They lack the relational intelligence layer and the Trojan horse delivery model.

**Relationship and lifestyle apps** — any platform that understands the relational intelligence market and wants to differentiate.

**Health and behavioral platforms** — Whoop, Oura, or similar companies expanding from physical health into behavioral and emotional intelligence.

**Corporate wellness** — a growing market. The problem-solving framework and seasonal intelligence model have direct applications in workplace wellbeing.

**The pitch to any of these is not "we built a reminder app."** It is: "We built a trust layer. Users tell this product things they don't tell anyone else. That trust is the moat, and it compounds with time."

---

### 3.3 The Numbers That Matter

An acquirer will want to see:

- **Retention** — what percentage of users return after day 1, day 7, day 30. This is the primary metric for a product built on the Restraint Principle. If users return without being pushed, that is the proof of concept.
- **Depth of engagement** — not time-on-app (that's the extractive metric). Something like: percentage of users who tap a hidden tile, percentage who complete onboarding, percentage who open the app at an unusual hour (0200 in a truck is a signal, not a statistic).
- **User testimony** — qualitative evidence of what the product unlocks. Screenshot-able moments. Things users say that couldn't have been predicted.
- **Growth rate** — modest is fine early. The shape of the curve matters more than the current number.

Start tracking these from the first beta user. Not because you need them now — because reconstructing them later is impossible.

---

### 3.4 The Conversation Sequence

Acquisitions at early stage follow a relationship arc, not an auction. The sequence:

1. **Build the story** — retention data, user testimony, a clear articulation of what makes the architecture defensible
2. **Identify the right person** — not the CEO, not the business development team. The product leader or chief product officer at a strategic buyer who would personally understand what you've built
3. **Warm introduction if possible** — cold outreach works but warm is better. The network matters here
4. **The first conversation is not a pitch** — it is a conversation about the problem space. You are not selling. You are establishing whether there is a shared understanding of the problem worth solving
5. **NDA before details** — before the architecture, the data, or the philosophy is shared in any depth
6. **Engage a lawyer before any term sheet is signed** — not after. An M&A lawyer for a small transaction is expensive but not engaging one is more expensive

**Do not raise venture capital if the goal is acquisition.** VC money accelerates growth but it also creates pressure to scale, introduces investors with their own agenda, and complicates an acquisition with preference stacks and liquidation terms. Bootstrap as long as possible if the exit is the goal.

---

### 3.5 Valuation — A Realistic Range

Early-stage app acquisitions without significant revenue are valued on potential, not performance. A rough framework:

- **Pre-revenue, strong concept, small engaged user base:** acquisition value is primarily team and architecture — likely in the range of a talent acquisition plus IP, which varies enormously
- **Post-revenue, demonstrating retention at modest scale:** multiples of annual recurring revenue (ARR), typically 3–8x for a strategic buyer in this space
- **Post-revenue, clear product-market fit, growing:** higher multiples, more competitive process, more leverage

The goal is not to optimise for the highest number. It is to find the buyer for whom the value is highest — because they are the ones who will pay it and steward the product in the spirit it was built.

---

## SECTION 4 — MONETIZATION
**WHEN THIS MATTERS:** Before beta testing ends. Before any public launch. Before any acquisition conversation.

---

### 4.1 Why This Decision Matters Early

Monetization shapes everything downstream — the acquisition conversation, the user relationship, and the product philosophy. A product built on the Restraint Principle has specific monetization options that are compatible with that philosophy and others that aren't.

**Incompatible with the product's values:**
- Advertising — introduces extractive incentives into a product built on tending
- Freemium with artificial feature gates that manufacture urgency to upgrade
- Data monetization — selling user data would be the most profound betrayal of the trust model

**Compatible:**
- **Simple subscription** — a flat monthly or annual fee for full access. Honest, aligned with value, no hidden incentives. The user pays for the product. The product works for the user.
- **Freemium with a genuine free tier** — the practical layer (reminders, scheduling) is free. The deeper intelligence layer (relational, emotional, seasonal) is paid. The free tier earns trust. The paid tier rewards it.
- **One-time purchase** — less common in this category but philosophically clean. Worth considering.

The subscription model is probably right for this product. It creates a recurring revenue line that makes the acquisition math work and it aligns incentives correctly — the product succeeds when users stay because it serves them, not because they forgot to cancel.

---

### 4.2 Pricing Philosophy

Price it like you believe in it. Underpricing a product that asks to live in someone's most private moments sends the wrong signal. People pay more for things they trust.

Look at what Headspace, Calm, and BetterUp charge. Your Life / Unlocked, at full feature build, is in that category — not a utility app, a relationship. Price accordingly when the time comes.

---

## SECTION 5 — THE THINGS THAT CAN'T BE BOUGHT BACK
**WHEN THIS MATTERS:** Always. From this moment forward.

---

These are the decisions that, once made, cannot be undone. They are listed here not as restrictions but as reminders — because the pressure to compromise on them will arrive dressed as practicality.

**User trust.** The product's entire value proposition is that it is a safe place. One data breach, one discovered sale of user data, one moment where the product chooses its metrics over the user's dignity — and that trust is gone. Not diminished. Gone. Build the infrastructure that protects it accordingly.

**The philosophy.** The Restraint Principle, the Tending Philosophy, the Authenticity Standard — these are not marketing language. They are load-bearing walls. Any feature, any investor, any acquirer who requires their removal is asking you to sell the thing that makes the product worth buying.

**The founder's voice.** The product has a soul because the person who built it needed it. That is not transferable and it is not replaceable. Whatever commercial path this takes, the product should remain recognisable as something built by someone who understood the problem from the inside.

---

## REVISION LOG

| Session / Moment | What Was Added |
|---|---|
| Session 10 (inter-session) | Document created. All sections drafted. Triggers defined. |

---

*Your Life / Unlocked | Commercial Guidance, IP Protection & Exit Strategy | Living Document | Confidential*
*Add to project. Pull the relevant section when its trigger arrives.*
