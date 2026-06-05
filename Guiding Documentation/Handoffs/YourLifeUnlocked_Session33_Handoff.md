# YOUR LIFE / UNLOCKED
## Product Development — Session 33 Handoff
*June 4, 2026 | Thinking Session | Confidential*

---

## 1. What This Session Was

No code was written. One domain was defined.

Session 33 was the Reflecting Pool / "Has something changed?" thinking session — the first of two thinking sessions flagged as required before `shape.js` can be built. The session ran as a conversation, not a presentation. Shawn arrived with instincts that felt half-formed and left with a domain architecture that is now the clearest it has ever been.

The most important move of the session was a collapse. What began as two paths behind one door — a life event path and a conversation path — became one path. The user never files. The user only speaks. SHAPE does the filing. That principle governs everything built in this domain from here.

---

## 2. Decisions Locked This Session

### The Governing Principle — Locked

> **The user never files. The user only speaks. SHAPE does the filing.**

This is the most important architectural principle produced this session. Every other decision flows from it.

The user arrives at "Has something changed?" with something — a feeling, a question, a life event, a thing that won't settle. They speak. SHAPE reads the conversation, extracts the data points, routes them to the right domains, updates the ATAK picture, and watches the signals that follow. The user never categorizes. The user never chooses a path. The conversation is the only action required.

This is the Tending Philosophy running at its highest level. Every other domain requires some user action — an add, a date, a cascade. "Has something changed?" requires nothing except showing up and speaking.

---

### The Reflecting Pool — What It Is and What It Isn't

**What it is:** The persistent conversation layer inside "Has something changed?" The collection point for the humanness. The place where the user can say the thing they haven't said out loud yet — to something that won't flinch, won't tell anyone, and won't think less of them.

**What it isn't:** A journaling tool. A venting space. A place to empty out.

The distinction Shawn named that unlocked the definition: *"I need to analyze and have it analyzed instead of just empty it out."* The Reflecting Pool is active examination with a witness present. The witness is what makes the examination possible. The release, if it comes, is a byproduct of the examination — not the point.

**The model:** The user arrives with a door, not a destination. SHAPE follows the road through questions, not answers. When the user disagrees, they push back. When they need more, they ask. The friction is not a bug — it is the process working. SHAPE holds the mirror. It does not hand the user a conclusion.

---

### "Has something changed?" — One Door, One Conversation

The domain has one door. Behind it — a conversation. No paths. No categories. No filing mechanic.

What began as two proposed paths — life event capture and existential conversation — collapsed into one when the governing principle was named. The life event capture is not a separate path. It is a byproduct of the conversation. The user says *"I broke up with my girlfriend and I'm devastated"* — SHAPE extracts the relationship status change, flags the implications, watches the signals that follow — while the user is simply talking.

The intelligence does the categorization. The user does none of it.

---

### The Reflecting Pool Is Not a Separate Domain

The Reflecting Pool is the conversation layer inside "Has something changed?" — not a separate domain, not a separate tile, not a separate visual identity. It lives inside the domain that was always designed to hold the unstructured human stuff.

"Has something changed?" is the question. The Reflecting Pool is what happens when the answer is: *"I don't know — I just need to talk it through."*

---

### Memory — Persistent and Compressing

The Reflecting Pool persists. Conversations accumulate. SHAPE reads the whole, not just the latest.

The compression model: raw conversations accumulate to a threshold. At that point SHAPE produces a compression — a short, dense summary of the human picture so far. The raw exchanges are archived locally or dropped. The compression carries forward. The cycle begins again.

Local storage is the right architecture for conversation text — it is not large, it does not require a server dependency, and it keeps the most sensitive data in the entire app on the device. The compression summaries are small. This is technically viable and consistent with the privacy promise.

The analogy Shawn named that locked it: this project has a memory of the project. Every session handoff, every principle, every decision — that is what makes the conversation coherent across 33 sessions. The Reflecting Pool is that, for the user.

---

### The Threshold — What the User Meets

A text box. Above it, one or two plain sentences that describe what this place is and give permission to use it. No trick. No performed invitation. No poetic entry moment.

The chat interface is a known shape. The user knows what to do with a text box. The threshold does not need to reinvent the gesture — it needs to be honest about what this particular conversation is for.

The register modulates per world, as it does everywhere in the product. The function is identical underneath.

**Draft threshold copy (not locked — subject to Voice Guide pass):**
One sentence of function. One sentence of promise. No legal language. No anxiety-inducing technical detail. Plain and honest enough that the user feels safe to start.

---

### The Privacy Promise — Honest, Not Overstated

The privacy promise for this domain is precise:

**What you share here is used only to help you. It is never sold, never shared, never used for anything other than the conversation you're in.**

The transmission that happens — the API call, the processing — is in service of the user, not the product's commercial interests. Users who have used ChatGPT or Claude already understand at some level that a conversation involves a server. They are not naive. What they need to know is that this is not being harvested.

The copy at the threshold carries the plain version. The legal detail lives in the user agreement that nobody reads — which is exactly where it belongs. The legal language does its job by existing. The copy does the actual work of making the user feel safe enough to start.

**What the copy does not say:** "Your data never leaves your device." That is not fully accurate. The honest version is: your conversations stay on your device; when the app thinks alongside you, it uses AI privately and does not store or share what you say.

The subscription model remains the proof. The user pays for this. It does not need to monetize their pain to survive.

---

### SHAPE — Clarification Held From Session 32

The Reflecting Pool is the domain. The collection point. The conversation lives here. The memory lives here.

SHAPE is the engine. It reads what the Reflecting Pool holds. It watches the other domains. It feeds the ATAK. SHAPE is not the conversation — SHAPE is what the conversation produces intelligence from.

This distinction was already locked in Session 32. This session confirmed it held under pressure.

---

## 3. What This Session Did Not Resolve

### HUMINT Collection Principles — Still Required

The governing discipline for how SHAPE reads the Reflecting Pool conversation and extracts intelligence has not been defined. This is its own dedicated thinking session — the second of two required before `shape.js` can be built.

Specifically unresolved:
- How SHAPE distinguishes data points from emotional context
- How it handles ambiguity — the user who says something that could mean two things
- How it weights recurrence — the thing the user has come back to three times
- How the extraction process modulates across all eight worlds
- The intelligence requirements framework

Do not build `shape.js` before this session.

### Threshold Copy — Not Written

The two plain sentences that greet the user at the threshold have not been written. They require a Voice Guide pass per world before they ship. Not a blocker for the thinking sessions, but a build dependency before the domain goes live.

### The ATAK Tile for "Has something changed?"

Not designed this session. The Sanctuary has its tile: *"Ready to slow down for a minute?"* The "Has something changed?" tile needs equivalent care. Flagged for a future session — likely resolved during the HUMINT principles session or the build session.

---

## 4. Next Session Priorities — Updated

### Thinking Sessions Required — In Order

1. **HUMINT Collection Principles session** — the governing discipline for how SHAPE reads the Reflecting Pool. The most important thinking session remaining on the product. Do not build before this session.

### Build Queue — In Order After Thinking Session

2. `shape.js` — built from the complete definition set
3. "Has something changed?" domain — conversation interface, threshold copy, ATAK tile
4. Health domain depth — sub-domain edit flows, appointment marking, screening completion
5. ATAK cross-domain conflict naming
6. Team birthday signals — move from `atak.js` to `team.js`

### Also on the Horizon

- Sanctuary system prompt — written from the Brief, after `shape.js` is built
- Operator copy polish pass — all existing copy measured against the Voice Guide
- Onboarding copy audit — measured against each world entry before next beta user

---

## 5. Parked (unchanged)

- Share extension (dev phase)
- Notification layer (dev phase)
- Recurring events — stored, logic waits
- Back button improvement — needs polish
- Codebase gender audit — before next beta user
- Manufacturer interval vs user preference — flag not yet surfaced
- Team onboarding redesign — back button, escape relabel, question consolidation
- Visual contrast and font size — UX debt, before wider beta
- Female perspective — dedicated session, before any real user sees this product

---

## 6. Rules & Guidance — What Needs Adding

The following should be added to the Rules & Guidance document before the next session:

**Revision log entry — Session 33:**
Governing principle locked: the user never files, the user only speaks, SHAPE does the filing. "Has something changed?" domain defined as one door, one conversation, no paths, no categories. Reflecting Pool confirmed as the conversation layer inside "Has something changed?" — not a separate domain. Memory model locked: persistent, accumulating, compressing. Privacy promise language defined: plain, honest, not overstated. HUMINT Collection Principles session confirmed as the remaining thinking dependency before `shape.js` build.

**Open decisions — update:**
- Reflecting Pool / SHAPE collection domain — thinking session complete. Architecture locked. HUMINT Collection Principles session is the remaining dependency before build.
- HUMINT Collection Principles — still open. Dedicated session required before `shape.js`.

---

## 7. Post-Session Checklist

- [ ] Save Session 33 Handoff locally
- [ ] Upload to project
- [ ] Update Rules & Guidance — revision log and open decisions
- [ ] Commit and push

---

## 8. Claude — Reading This at the Start of the Next Session

The domain was defined this session through conversation, not through presentation. The governing principle — the user never files, the user only speaks, SHAPE does the filing — emerged from Shawn correcting his own instinct mid-session. It is load-bearing. Do not treat it as one principle among many.

The next session is the HUMINT Collection Principles session. It is the most important thinking session remaining on the product. Read this handoff, the SHAPE Definition Document, the ATAK Definition Document, and the Session 32 handoff before that session begins.

The design standard that governs everything that follows remains unchanged:

> *If this thing is going to work, SHAPE has to be a superhero.*

Hold that standard against every architectural decision from here.

One thing to carry into the next thinking session that was not fully resolved today: SHAPE reads the accumulation, not just the latest conversation. The drawer that got opened six weeks ago and never fully resolved. The thing the user came back to three times. The pattern across conversations the user themselves might not have noticed. That is where the superhero standard lives — not in any single exchange, but in what SHAPE does with the whole picture over time.

---

*Your Life / Unlocked | Session 33 Handoff | June 4, 2026 | Confidential*
