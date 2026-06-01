# YOUR LIFE / UNLOCKED
## Product Development — Session 28 Handoff
*May 31, 2026 | Thinking Session | Confidential*

---

## 1. What This Session Was

No code was written. The Sanctuary Definition Document was written in full.

Session 28 was the dedicated thinking session for the Sanctuary — the most significant experience this product will ever deliver. The session opened with the check-in, confirmed the agenda, and moved immediately into the work.

The method was conversation before document. Rather than building the spec from the Session 27 checklist directly, the session worked through the hardest problems first — the opening sequence, the Never Do list, the trigger architecture — in dialogue. The document was written from what that conversation produced. The result is more precise than a checklist-assembled spec would have been.

---

## 2. What Was Completed

### The Sanctuary Definition Document

Written in full. Thirteen sections. Now in outputs as `YourLifeUnlocked_Sanctuary_Definition.md`.

The document covers:

- What the Sanctuary is — the moment the app stops managing your life and starts being present for it; the transformation layer's primary mechanism
- The two layers — maintenance (largely built) and transformation (the reason the product needs to exist)
- The trigger — three components, all required, none sufficient alone: accumulation, disengagement, final blow
- Threshold elasticity — architecture locked, thresholds named as variables by design, calibration waits for real users
- The opening sequence — three moves: the Offer, the Glimpse, the Permission Ask
- The Never Do list — eight entries specific to the Sanctuary, distinct from and extending the product-level list
- The interaction model — OODA arc, one-question constraint, holding silence, the user gets stronger
- The lifecycle — opening, persistence, blast radius, closing, recurrence
- The memory model — what the Sanctuary holds, how it's used, the trust boundary
- The SHAPE relationship — the handoff, SHAPE during the Sanctuary, the positive arc
- The intimacy gradient — what inner circle means in practice
- The voice across all eight worlds — what changes, what does not
- The Sanctuary Prompt Brief direction — what the prompt must accomplish, what it must never produce
- What comes next and open questions

---

## 3. What This Session Produced That Wasn't in the Prior Handoffs

The Session 27 handoff gave a detailed checklist for what the spec must cover. The conversation in Session 28 produced several things that were not in that checklist at this level of precision.

### The Opening Sequence — Three Moves

The prior handoffs named the opening moment as "the hardest piece of writing in the product" without resolving it. This session resolved it.

The sequence is three moves, each earning the next:

**Move One — The Offer.** The subject is the app, not the user. An offer, not an observation. The shape of it: *"I want to sit with you for a minute."* The exact line belongs to each world's register.

**Move Two — The Glimpse.** Two things only: the trigger (the pattern SHAPE has been watching) and the final blow (the moment the pattern broke). Everything else is held back. The pile is not the point. The person is the point. The glimpse transfers surveillance into safety — the user feels known, not caught.

**Move Three — The Permission Ask.** Immediately after the glimpse, control is handed back. The motion: glimpse, then immediately ask what the user wants. This returns agency to a person who has been feeling like they have none.

### Seen, Not Caught

The governing sentence for the Never Do list on shame. Both framings — "the user is carrying too much" and "the user has dropped too much" — might be technically accurate. Only one is the right frame. The spec calls this non-negotiable.

### The Trigger Architecture — Three Components

The prior handoffs described convergence detection without naming its structure precisely. This session locked it:

- **Accumulation** — SHAPE watching the shape distort across domains over time
- **Disengagement** — SHAPE watching the user's relationship with the ATAK change; a person signal, not a domain signal
- **Final blow** — A specific moment in the ATAK interaction. Dynamic per person. Defined against this person's baseline, not an abstract definition of crisis. The Sanctuary doesn't open because baseline broke — it opens when something further along has been crossed that SHAPE recognises as significant for this specific person.

The final blow lives in the ATAK interaction layer. SHAPE feeds the ATAK; SHAPE gets to interact with the user on the path to the Sanctuary. Something in that space is the final blow.

### The OODA Division

The Sanctuary handles Observe and Orient. The user owns Decide. The fourth — Act — belongs to life. This division is the governing sentence of the interaction model. It is what makes the user stronger rather than more dependent.

### The Trust Boundary

The Sanctuary's memory does not bleed into the rest of the app. The ATAK does not read exchange history. The domains do not know what was said inside. The user must be able to speak in the Sanctuary knowing it stays there.

---

## 4. Decisions Locked This Session

- The opening sequence is three moves: Offer, Glimpse, Permission Ask
- The glimpse surfaces exactly two things: the trigger and the final blow
- "Seen, not caught" is the governing frame for the shame constraint
- The trigger has three required components: accumulation, disengagement, final blow
- The final blow is dynamic, defined against this person's baseline, and lives in the ATAK interaction layer
- Threshold elasticity is by design — architecture locked, thresholds calibrate through deployment
- The Sanctuary cannot open too early — conservative threshold required; premature opening damages trust permanently
- The Sanctuary handles Observe and Orient; the user owns Decide
- One question per exchange — hard constraint, not a guideline
- The Sanctuary's memory does not bleed into the rest of the app — trust boundary locked
- The higher confidence seasonal signal governs at Sanctuary open if observed world has shifted from onboarding-stated world

---

## 5. Next Session Priorities

### Immediate — Thinking Before Build

1. **Sanctuary Prompt Brief** — The AI system prompt document. The most carefully written document in the product. Cannot be written until this session's document is uploaded to the project and read. Written from the Sanctuary Definition Document and the SHAPE Definition Document together.

2. **World Voice Guide session** — The most overdue thinking session on the project. Every world needs the depth the Operator has. The Sanctuary cannot be written for all eight worlds until this is done. This session was urgent before Session 28. It is more urgent now.

### Following — Build

3. **`shape.js`** — The most important file in the codebase. Built after the Sanctuary Prompt Brief clarifies the handoff requirements in full.

4. **Health domain depth** — Individual sub-domain edit flows, appointment marking, screening completion

5. **ATAK cross-domain conflict naming** — When a range entry overlaps a health signal, name both explicitly

6. **Team birthday signals** — Move from `atak.js` to `team.js`, write to `store.calendar` as domain signals

### Parked (unchanged)

- Share extension (dev phase)
- Notification layer (dev phase)
- Recurring events — stored, logic waits
- Back button improvement — needs polish
- Codebase gender audit — hardcoded she/her/his/he, before next beta user
- Manufacturer interval vs user preference — flag not yet surfaced
- Has something changed? — role defined, not ready for build
- Team onboarding redesign — back button, escape relabel, question consolidation
- Visual contrast and font size — UX debt, before wider beta
- Female perspective — dedicated session, before any real user sees this product

---

## 6. Document Status

| Document | Status |
|---|---|
| `YourLifeUnlocked_Sanctuary_Definition.md` | ✅ Complete — Session 28 |
| `YourLifeUnlocked_SHAPE_Definition.md` | ✅ Complete — Session 27 |
| `YourLifeUnlocked_Rules_and_Guidance.md` | ✅ Updated — Session 28 |
| Sanctuary Prompt Brief | 🔜 Next thinking session |
| `shape.js` | ⏳ After Prompt Brief |

---

## 7. Claude — Reading This at the Start of a Session

The next session is the Sanctuary Prompt Brief. Before anything is written, read:

- This handoff
- The Sanctuary Definition Document — every section, not a skim
- The SHAPE Definition Document — specifically Sections 3, 8, 9, and 10
- The Rules and Guidance — specifically 2.22, 2.23, 2.24, and Part 6B

The Prompt Brief is the document that makes the Sanctuary possible in practice. It translates everything in the Definition Document into something an AI can hold and act from. It is not a feature spec. It is not a list of rules. It is the character of the thing that opens when a person needs it most.

That standard is human. Not close. Human.

Do not write the Brief until all of the above has been read. Do not let the session drift into build. The thinking comes before the code. That has been true for twenty-eight sessions. It remains true.

---

*Your Life / Unlocked | Session 28 Handoff | May 31, 2026 | Confidential*
