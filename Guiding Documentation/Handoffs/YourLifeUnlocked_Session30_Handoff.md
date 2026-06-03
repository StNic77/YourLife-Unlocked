# YOUR LIFE / UNLOCKED
## Product Development — Session 30 Handoff
*June 2, 2026 | Thinking Session | Confidential*

---

## 1. What This Session Was

No code was written. One significant document was produced as a draft.

Session 30 was the Sanctuary Prompt Brief session — but it began differently than the sessions before it. Shawn named early that the last few sessions had moved above his head. The ideas were right but they weren't his. This session slowed down deliberately, and the Prompt Brief was earned through conversation before it was written.

That matters. The Sanctuary is the most important thing this product will ever do. The person who owns the product needs to hold it — not just approve it.

---

## 2. The Conversation Before the Document

Before a word of the Brief was written, Shawn walked through the Sanctuary in his own words. What came out of that conversation is worth holding here, because it is cleaner in some ways than what the definition documents contain.

**On what the Sanctuary is:**
"A place of peace in the storm. The user feels seen and safe and supported and has an AI engine guiding them through a maze of decision making steps — but never telling them that. Your friend doesn't do that, they just bring things into focus."

**On why the offer comes before the glimpse:**
"Otherwise it's surveillance and not tending."

**On why the pile is the wrong thing to show:**
"The pile is a judgment. It serves no purpose. It brings shame. At best it feeds the spiral."

**On the user always being in command:**
"Put the user in the driver seat. Tell me what you want to say. The intelligence weighs that against SHAPE."

**On what happens if the Sanctuary isn't landing:**
"At some point it will succeed or it will be useless and the app can decide. Change tack, disengage, etc."

**On the glimpse:**
"The glimpse is the right amount of magic. Too far behind the curtain, too early isn't right either."

**On how deep the Sanctuary goes:**
"It doesn't feel thin. It feels impossibly deep."

These are the product owner's words. They govern the Brief as much as any definition document does.

---

## 3. What Was Produced

### The Sanctuary Prompt Brief — Draft

Thirteen sections. In outputs as `YourLifeUnlocked_Sanctuary_Prompt_Brief_Draft.md`. Add to project.

**What the document covers:**

1. What the Brief is for — the translation layer between definition and prompt
2. Who the AI is — a caring watchful friend; a character, not a persona
3. What the AI knows when it opens — the SHAPE handoff, what "already knowing" means in practice
4. The opening sequence — Offer, Glimpse, Permission Ask; the silence after
5. Once the user says yes — user drives, AI follows, one question, the invisible frameworks
6. The voice across all eight worlds — what changes, what doesn't; World Voice Guide dependency named
7. What the AI never does — the full Never Do list with reasoning
8. The memory model — synthesis not recitation, the trust boundary
9. The lifecycle — opening, each exchange, changing tack, stepping back, closing, recurrence
10. What success looks like — "I handled that." Not "the app helped me."
11. The ?dev=crisis environment — what it must test before the Sanctuary ships
12. Open items before the prompt is finalised
13. The document's standing

**Marked as draft.** Shawn will sit with it, simulate, expand, contract. It is not locked.

**The ?dev=crisis idea** came from Shawn in this session — a dedicated development mode to simulate the full Sanctuary experience against a constructed hard-season SHAPE picture. This is a significant addition to the build plan and needs to be scoped properly before build begins.

---

## 4. Decisions Made This Session

- The Prompt Brief exists as a draft — not locked, in active workshopping
- The conversation-before-the-document approach is confirmed as the right one for sessions at this depth
- `?dev=crisis` is confirmed as a required pre-ship test environment for the Sanctuary
- The Brief and the system prompt are the same document for this collaboration — no third party between them

---

## 5. What the Brief Still Needs

**Known gaps named in the document itself:**

- **World Voice Guide** — the world-specific language library is a hard dependency before world-specific Sanctuary copy is written. The Brief specifies the principle. The Guide supplies the words. This session confirmed the World Voice Guide can no longer be deferred.
- **The 'not ready' response** — what the app does if the user declines or closes at opening. Elastic threshold, calibrates through deployment.
- **The Sanctuary memory store** — architecture decision before build.
- **Blast radius measure** — specific signals for contraction. `shape.js` responsibility.

**What Shawn's review may surface:**
Shawn will read the Brief as a user, not a builder. Anything that feels mechanical where it should feel human. Anything missing that should be there. That review is the next step before the Brief is locked.

---

## 6. Next Session Priorities

### Immediate — Workshop the Brief

Shawn sits with the draft. Simulates. Expands where it feels thin. Contracts where it overreaches. Brings observations to the next session.

The Brief is not locked until Shawn holds it the way he held the opening sequence in this session — in his own words, without needing the document in front of him.

### Following — World Voice Guide

The most overdue thinking session on the project. Now a hard dependency for the Sanctuary. Cannot be deferred past the next one or two sessions.

The Brief specifies what changes across worlds and what doesn't. The World Voice Guide writes the actual language — opening lines, how each world names difficulty and strength, how each world orients action. All eight worlds. The Operator has the most depth. The others need to reach the same standard before any world-specific Sanctuary copy is written.

### Following That — ?dev=crisis Scoping

Before the Sanctuary is built, the test environment needs to be scoped. What the constructed SHAPE picture looks like. How the simulation runs. What passing looks like. This is a design session before it is a build session.

### Build Queue (unchanged priority order)

- `shape.js` — after the Brief is locked
- Health domain depth — individual sub-domain edit flows, appointment marking, screening completion
- ATAK cross-domain conflict naming
- Team birthday signals — move from `atak.js` to `team.js`

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

## 7. Document Status

| Document | Status |
|---|---|
| `YourLifeUnlocked_Sanctuary_Prompt_Brief_Draft.md` | 🔄 Draft — Session 30, in workshopping |
| `YourLifeUnlocked_ATAK_Definition.md` | ✅ Complete — Session 29 |
| `YourLifeUnlocked_Sanctuary_Definition.md` | ✅ Complete + Addendum — Session 28 |
| `YourLifeUnlocked_SHAPE_Definition.md` | ✅ Complete — Session 27 |
| `YourLifeUnlocked_Rules_and_Guidance.md` | ✅ Current — needs Session 30 entry |
| World Voice Guide | 🔜 Next thinking session — hard dependency for Sanctuary |
| `shape.js` | ⏳ After Brief is locked |

---

## 8. Rules and Guidance Updates

The following should be added to the Rules and Guidance revision log:

**Session 30 entry:**
Sanctuary Prompt Brief written as draft (13 sections). Brief confirmed as same document as system prompt — no third party between. `?dev=crisis` confirmed as required pre-ship test environment. World Voice Guide confirmed as hard dependency for world-specific Sanctuary copy — can no longer be deferred. Brief in active workshopping, not yet locked.

No new numbered rules this session. The conversation that preceded the Brief — Shawn's own articulation of the Sanctuary — is captured in Section 2 of this handoff and should be considered authoritative alongside the definition documents.

---

## 9. Post-Session Checklist

- [ ] Save Sanctuary Prompt Brief Draft locally
- [ ] Upload to project
- [ ] Update Rules and Guidance with Session 30 entry
- [ ] Commit and push

---

## 10. Claude — Reading This at the Start of the Next Session

The next session is either workshopping the Brief or the World Voice Guide — Shawn will decide based on where he is with the draft.

If workshopping the Brief: read the Brief draft first, then this handoff. Come in ready to interrogate every section. The standard is: does this produce the right AI, or does it produce something that sounds like it should?

If World Voice Guide: read the Sanctuary Definition Document Section 10, the Brief Section 6, and the onboarding tone rules (R&G 3.3) before anything is written. The Operator has the most depth — it is the reference. The other seven worlds need to reach the same standard. All eight must be done in the same session or the session stays open.

Either way — the conversation before the document is the right approach at this depth. Shawn earned the Brief by holding it first. That approach does not change.

---

*Your Life / Unlocked | Session 30 Handoff | June 2, 2026 | Confidential*
