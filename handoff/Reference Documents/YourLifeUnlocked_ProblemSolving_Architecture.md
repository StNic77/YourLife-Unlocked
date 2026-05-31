# THE PROBLEM-SOLVING ARCHITECTURE
## Your Life / Unlocked — Reference & Design Document
*Developed: Session 10 (inter-session) | Confidential*

---

> This document captures the full problem-solving architecture derived from the OPP (Canadian Army Operational Planning Process) and its translation into the app's eight seasons. It is a future-facing document — the framework is not a current build item. It is logged here because it will be a significant component and the thinking should not have to be reconstructed when the time comes.
>
> Read alongside: `YourLifeUnlocked_AspirationGap_Principles.md` and `YourLifeUnlocked_OPP_Extract.md`

---

## PART 1 — THE SOURCE ARCHITECTURE

The OPP is a five-stage process for moving from a complex problem to an executing plan. It was developed for military operations but the handbook itself notes that its principles are not restricted to combat — they are equally applicable to any complex problem in any environment.

The five stages pose five sequential questions:

| Stage | The Question | What It Does |
|---|---|---|
| **1 — Initiation** | *What is happening?* | Names the problem. Stops the spiral. Establishes that something real needs to be resolved. |
| **2 — Orientation** | *Do I understand the problem and what a solution requires?* | Builds shared understanding before any solution is attempted. Identifies the end state — what does success actually look like? |
| **3 — COA Development** | *What are my options and which is best?* | Generates possible courses of action, compares them, selects the most viable one. |
| **4 — Plan Development** | *How exactly do I execute?* | Turns the chosen option into a concrete plan — steps, resources, timeline, who does what. |
| **5 — Plan Review* | *Is this still working? Do I need to change?* | Monitors progress against reality. Adjusts without treating adjustment as failure. |

### Why This Architecture Works

It works because it is psychologically sound before it is procedurally sound. Each stage addresses a specific failure mode that humans fall into when facing hard problems:

- **Initiation** prevents the failure mode of *denial* — the refusal to acknowledge that something is actually wrong
- **Orientation** prevents the failure mode of *premature solution* — acting before you understand what you're actually solving
- **COA Development** prevents the failure mode of *tunnel vision* — committing to the first option that appears rather than considering alternatives
- **Plan Development** prevents the failure mode of *vague intention* — knowing what you want to do but never actually deciding how
- **Plan Review** prevents the failure mode of *sunk cost* — continuing a plan that isn't working because you've already committed to it

Most people, facing a hard thing, skip stages or collapse them. They jump from "this is terrible" (Initiation) straight to "here is what I'm going to do" (Plan Development) without ever passing through Orientation or COA Development. The plan fails. They spiral back to the start. Nothing changes.

The framework doesn't prevent hard things. It prevents the ways people make hard things harder.

### The Critical Doctrine Note

The OPP handbook explicitly warns: *"Orientation must not be reduced to a mere mechanical checklist process."*

This is the Authenticity Standard in military language. The same instinct. The framework is meant to generate genuine understanding, not the appearance of having gone through a process. When it becomes mechanical, it fails — not because the steps are wrong but because the thinking behind them has been bypassed.

This warning applies directly to how the app deploys the framework. It must never feel like a process. It must feel like a conversation that happens to move somewhere useful.

---

## PART 2 — THE TRANSLATION PRINCIPLE

The OPP is not an Operator framework. It lives underneath all eight worlds. Every person who uses this app, regardless of season, is capable of moving through these five stages. The difference is not the stages — it is the language, pace, and mechanism through which the app carries them.

**The framework is the same. The season is the translation.**

A Meadow person and an Operator person working through the same problem are doing identical cognitive work. The Operator experiences it as a brief — sparse, purposeful, moving fast toward a plan. The Meadow person experiences it as a slow unfolding — one thing at a time, nothing forced, arriving at clarity the way weather changes.

Neither knows they are working through a framework. Both feel met.

---

## PART 3 — THE FRAMEWORK BY SEASON

What follows is the five-stage framework translated into each world's language. These are working translations — the right direction, not finished copy. Every line will need to survive the Cheesy Hook Check before anything is built.

The questions are not asked sequentially in a visible flow. The AI carries the user through them conversationally — the structure is invisible, the season is all they feel.

---

### OPERATOR
*Fast. Sparse. No wasted motion. The app is a capable asset, not a therapist.*

| Stage | Translation |
|---|---|
| **Initiation** | *What's the situation?* |
| **Orientation** | *What does mission success look like here?* |
| **COA Development** | *What are your options? Which one do you execute?* |
| **Plan Development** | *What's the plan. Steps, timeline, resources.* |
| **Plan Review** | *When do we reassess? What tells you it's working?* |

**The Operator close-out:** *You have the plan. Execute and report back.*

**Aspiration gap note:** The aspirational Operator may have no instinct for COA Development — he reaches for the first option and commits. The app holds the space for alternatives without ever naming what it's doing. *"What else could you do here?"* in Operator language is not therapy. It is good tactics.

---

### THE RANGE
*Unhurried. Plain. The framework arrives like the seasons — you don't notice it changing until it already has.*

| Stage | Translation |
|---|---|
| **Initiation** | *Something's not right. What is it?* |
| **Orientation** | *What does it look like when this is tended to properly?* |
| **COA Development** | *What could you do? What have you tried before?* |
| **Plan Development** | *What's the first thing. Then the next.* |
| **Plan Review** | *How will you know it's taking?* |

**The Range close-out:** *Good land doesn't fix itself. But it responds to steady work.*

---

### GARDEN
*Patient. Warm. One question at a time. The framework is tending — the user never feels assessed.*

| Stage | Translation |
|---|---|
| **Initiation** | *What's not getting the light it needs right now?* |
| **Orientation** | *What would it look like if this were growing the way it should?* |
| **COA Development** | *What have you already tried? What else might help it?* |
| **Plan Development** | *What's the one thing you tend to first?* |
| **Plan Review** | *How will you know something has shifted?* |

**The Garden close-out:** *Everything you've planted is already being tended. You don't have to do it all today.*

**Shadow note:** The Garden person may resist Plan Development — committing to a specific action feels like forcing growth. The app holds the space gently: *"Not a full plan. Just the first thing."*

---

### JOURNEY
*Forward-moving. Purposeful. The framework is the path itself — each stage is the next stretch of trail.*

| Stage | Translation |
|---|---|
| **Initiation** | *Where are you stuck on the path right now?* |
| **Orientation** | *What does it look like when you've moved through this?* |
| **COA Development** | *What routes are available from here?* |
| **Plan Development** | *Which way do you go? What do you need for the next stretch?* |
| **Plan Review** | *When do you stop and check your bearings?* |

**The Journey close-out:** *You've already started. This is just the next step.*

**Shadow note:** The Journey person may resist Orientation — they prefer movement to reflection. The app names the end state in motion-language: *"Where does this trail lead when you've worked through it?"* Not a destination. A direction.

---

### PLAYBOOK
*Sharp. Strategic. The framework is preparation — this is film study before game day.*

| Stage | Translation |
|---|---|
| **Initiation** | *What's the problem you're actually trying to solve?* |
| **Orientation** | *What does winning look like here?* |
| **COA Development** | *What plays do you have available? Which one fits this situation?* |
| **Plan Development** | *What's the game plan. Walk me through it.* |
| **Plan Review** | *At what point do you know if it's working? What's the adjustment?* |

**The Playbook close-out:** *Good preparation. Now execute.*

**Shadow note:** The Playbook person may over-invest in COA Development — they love the strategy more than the execution. The app moves them forward: *"You have a good play. Time to run it."*

---

### SUMMIT
*Focused. The framework is the climb — each stage is the next pitch.*

| Stage | Translation |
|---|---|
| **Initiation** | *What's the obstacle in front of you right now?* |
| **Orientation** | *What does the summit look like from here? What does getting there actually require?* |
| **COA Development** | *What routes are available? Which one do you take?* |
| **Plan Development** | *What's your sequence. Pitch by pitch.* |
| **Plan Review** | *What's your checkpoint? What tells you to adjust the route?* |

**The Summit close-out:** *The summit is earned at base camp. You've done the work. Start the climb.*

**Shadow note:** The Summit person may skip Orientation entirely — they see the peak and move. The app holds them at base camp long enough to ask: *"What does getting there actually cost? Is that cost right?"* Not to stop them. To ensure they summit with something still intact.

---

### PRACTICE
*Still. Deliberate. The framework is a form — each stage is an element of the sequence.*

| Stage | Translation |
|---|---|
| **Initiation** | *What has been pulling you out of your practice?* |
| **Orientation** | *What does it look like when you are fully present with this?* |
| **COA Development** | *What approaches have you brought to this before? What does this moment call for?* |
| **Plan Development** | *What is the practice? What does showing up to it look like, concretely?* |
| **Plan Review** | *How do you know the practice is working? What does mastery look like here?* |

**The Practice close-out:** *The mat is ready. The rest is showing up.*

**Shadow note:** The Practice person may intellectualise COA Development — they have a sophisticated relationship with process but resist committing to a single approach. The app grounds it: *"Not the perfect approach. The one you begin with."*

---

### MEADOW
*Slowest of all. The framework arrives like weather — the user barely notices it until they are already through.*

| Stage | Translation |
|---|---|
| **Initiation** | *What keeps returning to you, even in the stillness?* |
| **Orientation** | *What does it look like when this has found its place?* |
| **COA Development** | *What feels right? What have you already tried, even quietly?* |
| **Plan Development** | *What's the smallest true step?* |
| **Plan Review** | *When do you look up and see if something has shifted?* |

**The Meadow close-out:** *Your peace is still there. You've just tended something that needed tending.*

**Shadow note:** The Meadow person may stay in Orientation indefinitely — understanding feels like enough. The app moves them gently: *"What's the smallest true step?"* is not pressure. It is the lightest possible invitation toward action.

---

## PART 4 — HOW THE APP DEPLOYS THIS

### The AI Enters the Mode — The User Never Does

There is no "problem solving" feature. There is no button, no flow, no announcement. The AI monitors for signals that something is circling — unresolved, recurring, getting heavier. When those signals reach a threshold it offers an entry point in the season's language. A single question. An open door.

If the user walks through it, the AI carries them through the five stages conversationally. The user experiences a conversation that happens to move somewhere useful. The framework is the skeleton. The season is the skin. The user only ever feels the skin.

### What "Circling" Looks Like

The AI watches for:
- A topic that has appeared more than once without resolution
- Language that suggests stuck rather than moving — *"I keep coming back to..."*, *"I don't know what to do about..."*, *"It's been bothering me..."*
- Emotional weight in a check-in response that is out of proportion to the practical content
- A hidden tile that was tapped but not yet acted on
- A pattern of avoidance — the same thing being not-said across multiple interactions

When the signal is strong enough, the offer comes. In the right language. At the right moment. Without announcement.

### The Offer

The offer is never *"would you like to work through a problem-solving framework?"*

It is always something like:

- Operator: *"This one's been sitting in the stack for a while. Want to work it?"*
- Garden: *"This keeps coming up. Want to give it some attention?"*
- Meadow: *"Something's been returning to you. Are you ready to look at it?"*

One sentence. The user can ignore it entirely. The app does not follow up with urgency.

### Refusal

If the user doesn't engage, the app retreats. It does not re-offer the same thing immediately. It holds the signal. It waits. The Restraint Principle applies here at its most literal — the app does not push through a door the user has not opened.

At some later moment — maybe the next check-in, maybe three weeks from now — if the signal returns, the offer can come again. Still gentle. Still one sentence. Still no pressure.

---

## PART 5 — THE BETA QUESTIONS

No amount of design thinking answers these. The users will.

- What signals reliably indicate a problem worth offering the framework for?
- How does the offer land across different seasons and aspiration levels?
- Does the aspirational user engage with the framework differently than the genuine one?
- At what point in the relationship is the offer most likely to be received?
- What does refusal look like in each season, and how does the app respond without withdrawing?
- How many stages does the average user complete before disengaging — and what does that tell us?
- Does completing the framework change behavior? Does the app need to track that?

---

## PART 6 — WHAT THIS MEANS FOR THE BUILD

This document has no immediate build consequences. It becomes relevant when:

- The **home screen** is designed — the check-in surface is where circling signals first become visible
- The **nudge system** is designed — the offer mechanism is a nudge type
- The **AI prompt architecture** is written — the framework stages need to be held in the AI's context as a mode it can enter, not a script it runs
- **Beta testing** begins — this is the primary thing to create tension around and observe

When those moments come, this document should be on the table.

---

*Your Life / Unlocked | Problem-Solving Architecture | Reference & Design Document | Confidential*
*Read alongside: YourLifeUnlocked_AspirationGap_Principles.md and YourLifeUnlocked_OPP_Extract.md*
