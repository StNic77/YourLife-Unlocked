# YOUR LIFE / UNLOCKED
## Product Development — Session 28 Handoff
*May 31, 2026 | Thinking Session | Confidential*

---

## 1. What This Session Was

No code was written. The Sanctuary Definition Document was written in full, and then significantly extended.

Session 28 opened as the dedicated Sanctuary thinking session. It closed having produced the most significant architectural clarity of the project — including discoveries that reframe the ATAK, SHAPE, and the Sanctuary simultaneously.

The method was conversation before document. The hardest problems were worked through in dialogue first. The document was written from what that conversation produced. Then the conversation continued, and what emerged in the second half of the session was more important than what was planned.

---

## 2. What Was Completed

### The Sanctuary Definition Document

Written in full. Thirteen sections plus a six-part addendum. Now in outputs as `YourLifeUnlocked_Sanctuary_Definition.md`.

The main document covers: what the Sanctuary is, the two layers, the trigger (three components), the opening sequence (three moves), the Never Do list (eight entries), the interaction model, the lifecycle, the memory model, the SHAPE relationship, the intimacy gradient, the voice across all eight worlds, the Sanctuary Prompt Brief direction, and open questions.

The addendum — produced in the same session after the main spec was written — covers: the AIPA trigger model, every domain as a Knowledge signal, prevention mode and activation mode, the fortress, the governing character (caring watchful friend), and the architectural implication requiring an ATAK Definition Document.

---

## 3. What This Session Produced

### The Opening Sequence — Three Moves

**Move One — The Offer.** The subject is the app, not the user. An offer, not an observation. Shape: *"I want to sit with you for a minute."* Exact line belongs to each world's register.

**Move Two — The Glimpse.** Two things only: the trigger and the final blow. Everything else held back. The pile is not the point. The person is the point. The glimpse transfers surveillance into safety — the user feels known, not caught.

**Move Three — The Permission Ask.** Immediately after the glimpse, control is handed back. Returns agency to a person who has been feeling like they have none. If the user says no — the Sanctuary waits without guilt.

### Seen, Not Caught

The governing frame for the shame constraint. The user is carrying too much — not: the user has dropped too much. Both might be accurate. Only one is the right frame. Non-negotiable.

### The Trigger — Three Components

Accumulation, disengagement, final blow. All required. None sufficient alone. The final blow is dynamic, defined against this person's baseline, and lives in the ATAK interaction layer.

### The OODA Division

The Sanctuary handles Observe and Orient. The user owns Decide. Act belongs to life. This is the governing sentence of the interaction model.

### The Trust Boundary

The Sanctuary's memory does not bleed into the rest of the app. The user must be able to speak in the Sanctuary knowing it stays there.

### The AIPA Trigger Model

The Canadian Armed Forces HPMA program's AIPA model — Awareness, Implications, Plan, Act — manages three resources: Time, Attention, Knowledge.

**The Sanctuary trigger, precisely stated: SHAPE detects serious constraint on at least two of the three AIPA resources.**

- **Time** — calendar pressure, the widening gap between commitment and action
- **Attention** — the disengagement signal, attention fragmenting, the person going quiet
- **Knowledge** — the person's understanding of their own situation has degraded; they are inside the spiral

The one-question constraint and silence rule exist because of AIPA — they slow the jump from fractured awareness to premature action.

### Every Domain Is a Knowledge Signal

Knowledge constraint is not one input — it is everything SHAPE reads. Vehicle issues accumulating. Health signals clustering. A relationship change. A death, a birth, an adoption, a diagnosis. The list is not finite. Everything is signal. "Has something changed?" is one declared Knowledge input among many.

### Prevention Mode and Activation Mode

The most significant architectural clarification of the session.

**Prevention mode** — SHAPE's primary job. Continuous, invisible. SHAPE reads the resource picture and shapes the ATAK brief accordingly. Time constrained: brief gets tighter. Attention fragmenting: brief simplifies. Knowledge degrading: brief restores the picture without overwhelming. The user never sees this. They just notice the brief feels right.

**Activation mode** — when prevention has reached its limit. Two of three resources seriously constrained. The Sanctuary opens. Everything SHAPE has been building since day zero comes alive.

The Sanctuary is the contingency. Prevention is the goal.

### The Fortress

When the Sanctuary opens, the person walks into something built since day zero — from every domain signal, every interaction, every pattern shift, every piece of history. Filled to the ceiling. The AI walks in with a complete picture of a person, not a checklist of flags.

### The Governing Character

A caring watchful friend. Not a therapist. Not a coach. Not a service. A friend who has been watching, who cares, who knows how to help without taking over. Every decision in the Sanctuary Prompt Brief is governed by one question: would a caring watchful friend do this?

### The ATAK Gap

This session revealed that the ATAK Cascade Spec covers the presentation layer but not the intelligence layer. The connection between SHAPE and the ATAK — resource-awareness, prevention mode, brief shaping — has no definition document. That gap must be closed before the Sanctuary Prompt Brief is written or `shape.js` is built.

**The ATAK Definition Document is now the next session.**

---

## 4. Decisions Locked This Session

- Opening sequence: three moves — Offer, Glimpse, Permission Ask
- The glimpse surfaces exactly two things: the trigger and the final blow
- "Seen, not caught" — governing frame for the shame constraint
- Trigger: three components — accumulation, disengagement, final blow
- Final blow: dynamic, defined against this person's baseline, lives in ATAK interaction layer
- Threshold elasticity by design — calibrates through deployment
- Sanctuary cannot open too early — conservative threshold required
- Sanctuary handles Observe and Orient; user owns Decide
- One question per exchange — hard constraint
- Silence after the question — hard constraint
- Trust boundary — Sanctuary memory does not bleed into the rest of the app
- Higher confidence seasonal signal governs at Sanctuary open
- AIPA trigger model: serious constraint on at least two of Time, Attention, Knowledge
- Every domain is a Knowledge signal — the list is not finite
- Prevention mode is SHAPE's primary mode; activation mode is the contingency
- The governing character of the Sanctuary AI: a caring watchful friend
- ATAK Definition Document is required before the Sanctuary Prompt Brief

---

## 5. Next Session Priorities

### Immediate — Thinking Before Build

1. **ATAK Definition Document** — fresh thread. The intelligence layer: what the ATAK is doing, how SHAPE governs it, resource-awareness in practice, prevention mode mechanics. The Cascade Spec covers the UI. This covers the mind behind it.

2. **SHAPE Definition Document review** — Sections 7 and 8 specifically, in light of prevention/activation mode. These were written before that distinction existed. They may need updating.

3. **Sanctuary Prompt Brief** — written with all three definition documents in hand. Not before.

### Following — Build

4. **`shape.js`** — the most important file in the codebase. Built from the complete definition set.
5. **Health domain depth** — individual sub-domain edit flows, appointment marking, screening completion
6. **ATAK cross-domain conflict naming** — when a range entry overlaps a health signal, name both explicitly
7. **Team birthday signals** — move from `atak.js` to `team.js`, write to `store.calendar` as domain signals

### World Voice Guide

The most overdue thinking session on the project. More urgent now that the Sanctuary requires world-specific copy. Cannot be deferred indefinitely. Should follow the ATAK Definition Document session.

### Parked (unchanged)

- Share extension (dev phase)
- Notification layer (dev phase)
- Recurring events — stored, logic waits
- Back button improvement — needs polish
- Codebase gender audit — before next beta user
- Manufacturer interval vs user preference — flag not yet surfaced
- Has something changed? — role defined, not ready for build
- Team onboarding redesign — back button, escape relabel, question consolidation
- Visual contrast and font size — UX debt, before wider beta
- Female perspective — dedicated session, before any real user sees this product

---

## 6. Document Status

| Document | Status |
|---|---|
| `YourLifeUnlocked_Sanctuary_Definition.md` | ✅ Complete + Addendum — Session 28 |
| `YourLifeUnlocked_SHAPE_Definition.md` | ✅ Complete — Session 27 — review Sections 7 & 8 next session |
| `YourLifeUnlocked_Rules_and_Guidance.md` | ✅ Updated — Session 28 |
| ATAK Definition Document | 🔜 Next thinking session |
| Sanctuary Prompt Brief | ⏳ After ATAK Definition Document |
| `shape.js` | ⏳ After Prompt Brief |

---

## 7. Claude — Reading This at the Start of a Session

The next session is the ATAK Definition Document. Before anything is written, read:

- This handoff — all of it, including Section 3
- The Sanctuary Definition Document — specifically the addendum (Section 14)
- The SHAPE Definition Document — specifically Sections 7 and 8
- The ATAK Cascade Spec — to understand what exists and what the gap is
- The Rules and Guidance — 2.22, 2.23, 2.24

The ATAK Definition Document is not a UI spec. It is the definition of the intelligence layer — what the ATAK is actually doing, how SHAPE governs it, how resource-awareness works in practice, how prevention mode operates. The Cascade Spec already covers how the brief is presented. This document covers what the brief is doing and why.

The standard is the same as every definition document before it. Not a feature list. A definition of what the thing is, how it behaves, and what governs every decision about how it is built.

The thinking comes before the code. That has been true for twenty-eight sessions. It remains true.

---

*Your Life / Unlocked | Session 28 Handoff | May 31, 2026 | Confidential*
