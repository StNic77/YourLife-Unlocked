# YOUR LIFE / UNLOCKED
## Product Development — Session 27 Handoff
*May 31, 2026 | Thinking Session | Confidential*

---

## 1. What This Session Was

No code was written. Two significant documents were completed and one important insight was confirmed.

Session 27 was a short, focused session that closed the most immediate open item from Session 26 — the SHAPE Definition Document — and consolidated the Rules and Guidance into a single authoritative version. It also produced a clarity about SHAPE's relationship to the ATAK that hadn't been stated cleanly before.

The thread closes here. The next session opens fresh for the Sanctuary thinking session and definition document.

---

## 2. What Was Completed

### The SHAPE Definition Document

Written in full. Thirteen sections. Now in the project as `YourLifeUnlocked_SHAPE_Definition.md`.

The document covers:
- What SHAPE is — the accumulated intelligence picture of a person's life, not a score or alert system
- What it holds — positive, negative, and neutral; the whole person, not a list of problems
- The closest analogy: this project itself — handoffs as the raw layer, R&G as the interpreted layer, specific documents as inflection points. The person who built this could disappear for a year and come back, read the documents, and be up to speed in minutes. That is exactly what SHAPE does for the user.
- Pattern vs state — baseline, trajectory, inflection points
- The two layers — raw (append-only, everything witnessed) and interpreted (a living paragraph, periodically rebuilt by AI, SHAPE's primary output)
- The four simultaneous roles — signal, intelligence background, guidance framework, exit trigger
- How SHAPE grows and calibrates over time
- SHAPE across seasons — good, elevated, hard
- The interpreted layer structure — what always appears, what appears when earned, what never appears
- The ATAK relationship — SHAPE shares form, not portrait; the full depth belongs to the Sanctuary
- The `shape.js` architecture — constitutive, not functional; owns the raw layer, interpreted layer, convergence detection, Sanctuary handoff
- The Sanctuary handoff — a briefing, not a data dump; the AI opens knowing
- Section 11: SHAPE is not alarming. Surveillance vs care. That distinction governs every implementation decision.

After the document was written, an addition was made to Section 1: the project-as-analogy passage. This was not an illustration added for clarity — it is the clearest available model for how SHAPE works. It belongs near the top of the document because it makes everything that follows easier to hold.

### Rules and Guidance — Consolidated

All previous versions of the R&G reviewed (original undated, May 26, May 28, May 29, May 31 v2). Nothing was lost. The May 31 v2 was confirmed as the most complete version and used as the base.

The consolidated version is now in outputs as `YourLifeUnlocked_Rules_and_Guidance.md`. Changes from v2:

- Header updated: "Authoritative Consolidated Version"
- Session count in Part 0 updated to 27
- 2.23 SHAPE: updated from "must be written" to "has been written (Session 27) — read it before any Sanctuary build"
- 2.24 Sanctuary: updated to note the SHAPE Definition Document exists and the Sanctuary Spec is next
- Revision log: Session 27 entry added
- Footer: notes this supersedes all previous versions

**All prior dated R&G versions should now be removed from the project.** This file is the single source of truth going forward.

---

## 3. The Insight That Was Confirmed

During the session, an observation was made that hadn't been stated this cleanly before:

**SHAPE is always putting in work.**

Not just when the Sanctuary opens. Every ATAK brief that feels like it knows you rather than just listing your overdue items — that's SHAPE in the background. A new user and a user of two years could have identical domain data and get a meaningfully different brief, because SHAPE has learned the pattern of the second person and the brief reflects it.

The Sanctuary is the moment SHAPE speaks loudly. The ATAK is where SHAPE whispers, every single day.

This distinction needs to be captured in the Sanctuary Spec as a governing principle — not a footnote. SHAPE's influence on the ATAK is continuous and quiet. The Sanctuary is the exception, not the primary expression.

---

## 4. The Decision on Project Instructions

A conversation was had about whether to add standing project instructions to tailor Claude's responses. The decision was not to.

The reason: the instructions that matter are already in the documents, and they were earned through real situations, not assumed in advance. The R&G, the session handoffs, the definition documents — these are a more precise and more powerful calibration than any generic instruction. The collaboration works because the documents are the instructions. Adding a separate layer risks artificially influencing interactions that are already working.

This decision is final. It does not need to be revisited.

---

## 5. Next Session — The Sanctuary

The next session is a dedicated thinking session for the Sanctuary Definition Document. It opens in a fresh thread.

**What that session needs to produce:**

A full Sanctuary Spec — written with the same rigour and depth as the SHAPE Definition Document and the Calendar Domain Spec. Not a feature list. A definition of what the Sanctuary is, how it behaves, and what governs every decision about how it is built.

**The spec must cover:**

- Trigger conditions — what combination of SHAPE signals is sufficient to open the Sanctuary; convergence defined precisely
- The opening moment — what the AI sees, what it says, why it cannot ask what's wrong
- The lifecycle — how the Sanctuary persists across days and weeks; memory model; what it holds between conversations
- The OODA arc in full — Observe, Orient, Decide, Act, as the invisible scaffold of every exchange
- The OPP and AIPA roles — how they operate underneath without ever being named
- Blast radius measurement — how the Sanctuary tracks recovery; what contraction looks like
- The exit condition — how the door closes; why it cannot close on a timer or dismissal
- The intimacy gradient — what inner circle depth means in copy and AI behaviour; what disqualifies a response
- SHAPE's role throughout — the handoff, the ongoing read, the recovery signal
- The Sanctuary and the ATAK — how they relate during an open Sanctuary season
- What the Sanctuary will never do — its own Never Do list, as precise as the product-level one
- The voice across all eight worlds — how the Sanctuary speaks differently in each world without changing what it is
- The Sanctuary Prompt Brief direction — enough to brief a writer on what the system prompt needs to accomplish

**What comes after the spec:**

1. Sanctuary Prompt Brief — the AI system prompt document
2. `shape.js` — built from the SHAPE Definition Document plus what the spec reveals about handoff requirements
3. Back to build — health domain depth, ATAK cross-domain conflict naming, team birthday signal migration

---

## 6. Priorities — Full Picture

### Immediate — Thinking Before Build

1. **Sanctuary Definition Document** — next session, fresh thread
2. **Sanctuary Prompt Brief** — follows the spec, cannot precede it
3. **`shape.js`** — built after the spec clarifies the handoff requirements

### Following — Language and Worlds

4. **World Voice Guide session** — the most overdue thinking session on the project; every world needs the depth the Operator has
5. **Language audit** — every domain, every world, every generated sentence; three tests, no exceptions
6. **Female perspective** — dedicated session; before any real user sees this product

### Build — When Thinking Is Complete

7. **Health domain depth** — individual sub-domain edit flows, appointment marking, screening completion
8. **ATAK cross-domain conflict naming** — when a range entry overlaps a health signal, name both explicitly
9. **Team birthday signals** — move from `atak.js` to `team.js`, write to `store.calendar` as domain signals

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

---

## 7. Document Status

| Document | Status |
|---|---|
| `YourLifeUnlocked_SHAPE_Definition.md` | ✅ Complete — Session 27 |
| `YourLifeUnlocked_Rules_and_Guidance.md` | ✅ Consolidated — Session 27 — supersedes all dated versions |
| Sanctuary Definition Document | 🔜 Next session |
| Sanctuary Prompt Brief | ⏳ After spec |
| `shape.js` | ⏳ After spec |

**Previous R&G versions to remove from project:**
- `YourLifeUnlocked_Rules_and_Guidance.md` (original undated)
- `YourLifeUnlocked_Rules_and_Guidance_May26_2026.md`
- `YourLifeUnlocked_Rules_and_Guidance_May28_2026.md`
- `YourLifeUnlocked_Rules_and_Guidance_May29_2026.md`
- `YourLifeUnlocked_Rules_and_Guidance_May31_2026_v2.md`

---

## 8. Claude — Reading This at the Start of a Session

The next session is the Sanctuary thinking session. Before anything is written, read:
- This handoff
- The Session 26 handoff (for the full Sanctuary concept as it was first named)
- The Session 26 addendum (for the deeper SHAPE architecture thinking)
- The SHAPE Definition Document (the Sanctuary cannot be specified without understanding what SHAPE produces and hands off)
- The Rules and Guidance — specifically 2.22, 2.23, 2.24, and Part 6B

The Sanctuary is the most significant thing this product will build. The spec that governs it must be written at the same standard as the product it describes. That standard is human. Not close. Human.

Do not write the spec until you have read all of the above. Do not let the session drift into build before the spec is complete. The thinking comes before the code. That has been true for twenty-seven sessions. It remains true.

---

*Your Life / Unlocked | Session 27 Handoff | May 31, 2026 | Confidential*
