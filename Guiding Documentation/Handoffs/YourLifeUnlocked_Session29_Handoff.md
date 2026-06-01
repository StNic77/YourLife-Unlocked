# YOUR LIFE / UNLOCKED
## Product Development — Session 29 Handoff
*June 1, 2026 | Thinking Session | Confidential*

---

## 1. What This Session Was

No code was written. One significant document was completed and five implementation variables were resolved.

Session 29 was the ATAK Definition Document session — the final piece of foundational architecture required before the Sanctuary Prompt Brief can be written. The document was produced in full, then the open questions it surfaced were worked through immediately in the same session, leaving the document complete with no outstanding items.

---

## 2. What Was Completed

### The ATAK Definition Document

Written in full. Fourteen sections. Now in outputs as `YourLifeUnlocked_ATAK_Definition.md`. Add to project.

The document covers the intelligence layer of the ATAK — what it is actually doing, how SHAPE governs it, what resource-awareness means in practice, and how prevention mode operates. It does not duplicate the Cascade Spec, which covers the presentation layer. The two documents together are the complete ATAK reference.

**What the document establishes:**

- The brief as an act of judgment, not a database query — three governing factors working simultaneously: urgency, consequence, capacity
- Why two users with identical domain data can receive different briefs
- The SHAPE-ATAK relationship precisely stated: SHAPE provides form, not portrait. Six signals defined (Section 11.2) — this is the interface `shape.js` will expose to `atak.js`
- Prevention mode mechanics for all three AIPA resources in full — what the brief does differently when Time is constrained, Attention is fragmenting, Knowledge is degrading, and when multiple resources are constrained simultaneously
- The consequence scoring engine — categories, the 2–5 scale, the working table
- The seasonal voice model — confidence gradient, the silent switch, the Feather Rule applied
- What SHAPE reads from the ATAK interaction layer — response latency, deferral, session depth, engagement patterns, absence
- The consequence radius — what makes it real, how SHAPE affects surfacing
- Where the final blow signal lives and what "lives in the ATAK interaction layer" actually means
- ATAK behaviour during an open Sanctuary season — what changes and what doesn't
- The store interface (Section 11.1) and the SHAPE interface (Section 11.2)

---

## 3. The Five Implementation Variables — All Resolved

### 3.1 Capacity Signal Thresholds

Each AIPA resource carries a state: green / amber / red. The composite determines the capacity signal:

- 0 red → Full
- 1 red, 0–1 amber → Manageable
- 1 red + 1 amber, or 2 amber → Constrained
- 2 red → Critical
- 3 red → Critical + convergence flag fires

Thresholds measured against the person's own rolling 90-day baseline.

### 3.2 Consequence Weight Table

Scale 2–5. No 1 — if it doesn't warrant a 2, it doesn't surface. Full table in Section 13.2 of the ATAK Definition Document. Living document — weights adjust as deployment reveals miscalibration. SHAPE cannot change the table; it can only affect how a weight is presented.

### 3.3 Season Signal Confidence Threshold

The stated world is a declaration the person made. It is respected, not rushed past. The app and the user try on the world together.

- 0–9 sessions: stated world governs, no observed signal used
- 10–19 sessions: stated world governs, observed signal begins informing tone at the edges
- 20+ sessions, 70%+ alignment: observed world takes over — silently
- 20+ sessions, under 70%: stated world holds, re-evaluated every 10 sessions
- Declared update resets the stated world and restarts the confidence window

### 3.4 Disengagement Baseline Window

- Minimum 15 sessions before disengagement signal is trusted
- Meaningful deviation: 3 consecutive sessions below baseline on 2+ engagement measures
- Rolling 30-session window, most recent 10 sessions weighted 2x

### 3.5 Convergence Flag Definition

All three conditions required simultaneously:
1. 3+ domains elevated (domain-level pattern, not single overdue items)
2. Elevation sustained 2+ weeks
3. 2+ of the elevated domains on a worsening trajectory

Any two conditions = elevated season, ATAK handles it. All three = convergence flag fires, brief tightens, SHAPE begins tracking toward Sanctuary threshold. Convergence flag firing is not the Sanctuary opening.

**The governing principle — stated explicitly in the document and worth holding here:**
The Sanctuary not firing is not a failure. It is the system working. A user who spends two years with this app and never sees the Sanctuary has been well served. Prevention working is the goal. The Sanctuary is the contingency.

All five values are launch calibrations. The intelligence engine is expected to develop toward greater determinism as real usage data accumulates.

---

## 4. Decisions Locked This Session

- Brief as act of judgment — three governing factors: urgency, consequence, capacity
- SHAPE shares form not portrait with the ATAK — six signals defined, full interface specified in Section 11.2
- Prevention mode mechanics locked for all three AIPA resources
- Consequence scale: 2–5, no 1
- Consequence weight table: working values for all HC and SC types
- Season signal: 10-session minimum, 70% alignment threshold at 20+ sessions, silent switch
- Disengagement baseline: 15-session minimum, 3 consecutive sessions on 2+ measures, 30-session rolling window weighted toward recency
- Convergence flag: 3 domains, 2-week duration, worsening trajectory on 2+
- Convergence flag ≠ Sanctuary opening
- The Sanctuary not firing is success, not failure

---

## 5. Document Status

| Document | Status |
|---|---|
| `YourLifeUnlocked_ATAK_Definition.md` | ✅ Complete — Session 29 |
| `YourLifeUnlocked_Sanctuary_Definition.md` | ✅ Complete + Addendum — Session 28 |
| `YourLifeUnlocked_SHAPE_Definition.md` | ✅ Complete — Session 27 |
| `YourLifeUnlocked_Rules_and_Guidance.md` | ✅ Updated — Session 29 |
| Sanctuary Prompt Brief | 🔜 Next thinking session — all three definition documents now in hand |
| `shape.js` | ⏳ After Prompt Brief |

---

## 6. Next Session Priorities

### Immediate — The Sanctuary Prompt Brief

All three definition documents exist. The Sanctuary Prompt Brief is the next thinking session.

Before anything is written, read:
- The ATAK Definition Document — specifically Sections 3, 4, and 9 (the SHAPE interface, prevention mode, the final blow)
- The Sanctuary Definition Document — specifically Sections 2, 3, 4, 10, and the full addendum (Section 14)
- The SHAPE Definition Document — specifically Sections 7, 8, and 10 (the interpreted layer, ATAK relationship, the Sanctuary handoff)
- The Rules and Guidance — 2.22, 2.23, 2.24

The Prompt Brief is not a system prompt. It is the document that governs what the system prompt must accomplish — the brief a writer uses to produce it. It must specify: what the AI knows when it opens, what character it holds, what it does and does not do, how it moves through the OODA arc, how it asks and how it waits, how world register governs its voice, and what success looks like across the lifecycle of a Sanctuary season.

The standard is the same as every definition document before it. Not a feature list. Not rules for an AI to follow. A character for it to hold, and the brief that makes that character legible to whoever writes the prompt.

### Following — Build

- `shape.js` — built from the complete definition set after the Prompt Brief is written
- Health domain depth — individual sub-domain edit flows, appointment marking, screening completion
- ATAK cross-domain conflict naming — when a range entry overlaps a health signal, name both explicitly
- Team birthday signals — move from `atak.js` to `team.js`, write to `store.calendar` as domain signals

### World Voice Guide

Still the most overdue thinking session on the project. More urgent now that the Sanctuary requires world-specific copy at inner circle depth. Cannot be deferred much longer. Should follow the Sanctuary Prompt Brief session.

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

## 7. Post-Session Checklist

- [ ] Save ATAK Definition Document locally
- [ ] Save updated Rules and Guidance locally
- [ ] Upload both to project
- [ ] Commit and push

---

## 8. Claude — Reading This at the Start of a Session

The next session is the Sanctuary Prompt Brief. Before anything is written, read:

- This handoff
- The ATAK Definition Document — Sections 3, 4, 9, 11, 13
- The Sanctuary Definition Document — Sections 2, 3, 4, 10, and the full addendum (Section 14)
- The SHAPE Definition Document — Sections 7, 8, 10
- The Rules and Guidance — 2.22, 2.23, 2.24

The Prompt Brief is the document that makes the Sanctuary buildable. It must be written at the standard the Sanctuary requires — which is the highest standard this product has. Everything that has been built and thought through to get here exists so that when this room opens for a real person in a hard season, it is unambiguously right.

The thinking comes before the code. That has been true for twenty-nine sessions. It remains true.

---

*Your Life / Unlocked | Session 29 Handoff | June 1, 2026 | Confidential*
