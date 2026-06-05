# YOUR LIFE / UNLOCKED
## Product Development — Session 34 Handoff
*June 4, 2026 | Thinking Session | Confidential*

---

## 1. What This Session Was

No code was written. One document was produced. The thinking that had to happen before the reflecting pool domain could be built — happened.

Session 34 was the HUMINT collection principles session. It was on the horizon list from Session 32 as the most important thinking session remaining on the product. It is now complete.

The session began with Shawn's honest acknowledgement that his HUMINT operator experience — two years, twenty years ago — lives in him emotionally rather than technically. That turned out to be exactly the right starting point. The emotional memory is what the reflecting pool needs. The technical doctrine was used for its rigor, then redirected entirely toward care.

What emerged by the end of the session is a picture that has been partially visible for months — the reflecting pool, SHAPE, the ATAK, the Sanctuary, and the relationships between all of them — now clear end to end. The muddy places cleared. The architecture is coherent from collection point to intelligence output to brief to Sanctuary.

One document was produced. The build can now begin.

---

## 2. What Was Completed

### The Reflecting Pool — Collection Principles
`YourLifeUnlocked_ReflectingPool_Principles.md`

Ten sections. The governing document for the reflecting pool domain. Every design and build decision about the domain is measured against this document before it proceeds.

**The foundational statement — locked:**

The HUMINT collection discipline is borrowed for its rigor. Its purpose is completely different from the field context it comes from. The user is the commander, the source, and the beneficiary. Everything collected serves them and only them. The intelligence requirement is: what does this person need to understand about their own life right now so that the app can tend to them more accurately.

**The cascade — locked:**

> *User speaks honestly into the reflecting pool → SHAPE reads and interprets → ATAK brief becomes personal → user feels known, not monitored → trust deepens → user speaks more honestly → the picture gets more accurate.*

This is a virtuous cycle. It compounds over time. The collection discipline exists to protect it.

**The rapport question — resolved:**

The reflecting pool does not need to build rapport. There is no stranger. The user is speaking to themselves in a space that already belongs to them. What replaces rapport is inherited trust — built across every domain interaction, every accurate ATAK brief, every signal that landed correctly. The reflecting pool inherits it. Its job is not to build trust. It is to not destroy it.

**SHAPE is the file — locked:**

The reflecting pool does not discover who it is talking to. SHAPE has already read the file. The world signal, the load picture, the behavioral patterns, the avoidance signals — all of it is the source assessment. The approach is pre-selected before the first question is asked. The user never feels this calibration. They feel a conversation that seems to understand them.

**The six collection principles — locked:**

1. **Elicitation, not interrogation** — conditions for honest speech, never pressure toward it
2. **The funnel** — broad to narrow, always; the first question is never the real question
3. **One question** — hard constraint, not a guideline; one question asked well does more than five asked efficiently
4. **Silence** — after the question, the app waits; silence is not emptiness, it is the space where the user finds their own answer
5. **The significant detail** — the aside, the thing mentioned in passing; that is usually where the real intelligence lives; the app returns to it gently
6. **Follow, don't lead** — the requirement is held invisibly; the user drives; the app steers from alongside, never from in front

**The floor — locked:**

The reflecting pool has a floor. Below it — self-harm, harm to others, criminal disclosure — the app stops collecting and redirects. Clearly, immediately, without alarm, toward something equipped to help. The structure of the domain protects the floor. The reflecting pool is a guided space, not an open field.

---

## 3. New Items Surfaced This Session

These items were not previously captured and need to land in the right places.

### 3.1 Legal Review — Non-Negotiable Prerequisite
Before any real user touches the reflecting pool, legal review of mandatory reporting obligations is required. Depending on jurisdiction, certain disclosures may create obligations regardless of the medium. This is not a maybe. It is a gate before beta with real users.

### 3.2 Onboarding Redesign — Dedicated Session Required
The current onboarding was built domain by domain, session by session. It accumulated rather than being designed. Shawn's honest read: it feels like it's taking even though it's trying to give. It doesn't set the user up for the reflecting pool. It doesn't reflect the clarity the product now has about what it is and what it does.

The onboarding needs a dedicated redesign session — before any new beta user touches the product. Not before the reflecting pool is built. But before any new external user sees the app.

### 3.3 The Reflecting Pool Requires an Onboarding Invitation
The reflecting pool's value exchange is less obvious than the domain data exchanges. The user needs a genuine invitation — in the product's voice — that says: the more honestly you speak here, the more accurately the app can serve you. Not as a feature explanation. As something the app genuinely means.

This invitation and the privacy architecture behind it are developed together. The user must be told something true. The specific copy and placement belong to the onboarding redesign session.

### 3.4 The Reflecting Pool Name — Open
"Reflecting pool" is the working name used between collaborators. What it is called in the product is an open decision. It must feel like an invitation, carry no clinical weight, sit naturally alongside the eight world voices, and pass the Betty test. The name decision belongs to a dedicated copy session.

---

## 4. The Picture as It Now Stands

This is the clearest statement of the full architecture as of Session 34.

**The reflecting pool** — collects. A guided, bounded space. The user speaks. The collection discipline creates conditions for honest speech without the user feeling steered. SHAPE has already read the file before the first question is asked.

**SHAPE** — interprets. Reads the reflecting pool. Watches all domain signals. Holds the accumulated human picture — positive, negative, neutral — from day zero. Feeds the human intelligence layer into the ATAK. Makes the fused picture personal.

**The ATAK** — fuses. Receives cold domain data from every domain and SHAPE's human intelligence layer. Produces the brief. Knows what is happening and who it is happening to.

**The Sanctuary** — waits. Opens when the fused picture exceeds what data and intelligence alone can address. The Sanctuary is the last resort, not the destination. The reflecting pool feeding SHAPE feeding the ATAK is the system that ideally means the Sanctuary never needs to open — because the load has been tended accurately enough all along.

Shawn's words from this session, which belong in the record:

> *"The ATAK is giving a diffused intelligence picture of the battlespace, which is the person's lived life. And SHAPE is providing the humanness to make that experience personal, real, and engageable."*

That is the architecture in one sentence.

---

## 5. Document Status

| Document | Status |
|---|---|
| `YourLifeUnlocked_ReflectingPool_Principles.md` | ✅ Complete — Session 34 |
| `YourLifeUnlocked_Sanctuary_Prompt_Brief.md` | ✅ Final — Session 32 |
| `YourLifeUnlocked_WorldVoiceGuide.md` | ✅ Complete — Session 31 |
| `YourLifeUnlocked_SHAPE_Definition.md` | ✅ Updated — Session 32 |
| `YourLifeUnlocked_ATAK_Definition.md` | ✅ Updated — Session 32 |
| `YourLifeUnlocked_Rules_and_Guidance.md` | ⏳ Needs Session 34 entry added |
| `shape.js` | ⏳ After reflecting pool build is stable |
| Reflecting pool domain build | ⏳ Ready — principles locked, build next |

---

## 6. Next Session Priorities

### Shawn's Stated Intent
Build. The thinking is done. The principles document gives the build session its authority. Code that makes the magic real.

### Build Queue — In Order

1. **Reflecting pool domain build** — `reflectingpool.js` (or equivalent), store shape, collection interface, SHAPE write model. Built from the Collection Principles document. Do not begin without reading that document first.
2. **Health domain depth** — sub-domain edit flows, appointment marking, screening completion
3. **ATAK cross-domain conflict naming**
4. **Team birthday signals** — move from `atak.js` to `team.js`

### Before Any New Beta User
- Legal review — mandatory reporting obligations
- Onboarding redesign session
- Codebase gender audit

---

## 7. Parked — Unchanged

- Share extension (dev phase)
- Notification layer (dev phase)
- Recurring events — stored, logic waits
- Back button improvement — needs polish
- Manufacturer interval vs user preference — flag not yet surfaced
- Team onboarding redesign — back button, escape relabel, question consolidation
- Visual contrast and font size — UX debt, before wider beta
- Female perspective — dedicated session, before any real user sees this product
- Bucket list / annual goals — directionally interesting, not yet scoped
- Sanctuary system prompt — written from the Brief, after shape.js is built
- Operator copy polish pass — all existing copy measured against the Voice Guide
- Onboarding copy audit — measured against each world entry before next beta user
- World Voice Guide — reflecting pool name decision belongs here when ready
- OPP five-stage problem-solving architecture — future design component

---

## 8. Post-Session Checklist

- [ ] Save Reflecting Pool Collection Principles locally
- [ ] Save Session 34 Handoff locally
- [ ] Upload both to project
- [ ] Commit and push

---

## 9. Claude — Reading This at the Start of the Next Session

The reflecting pool principles are locked. The build is next.

Before any code is written, read:

- This handoff in full
- `YourLifeUnlocked_ReflectingPool_Principles.md` — all ten sections
- `YourLifeUnlocked_SHAPE_Definition.md` — architecture correction and reflecting pool section
- `YourLifeUnlocked_Rules_and_Guidance.md` — Part 0 and current session entry

The principle that governs the build above all others: the reflecting pool is a guided space, not an open field. The structure of collection shapes the territory. The user never feels the structure. They feel a conversation that understands them.

If anything in the build creates a moment where the user might feel monitored, extracted from, or clinically assessed — stop. Return to the principles document. Fix it before proceeding.

The design standard that has not changed:

> *If this thing is going to work, SHAPE has to be a superhero.*

The reflecting pool is where SHAPE gets its most important intelligence. Build it at that standard.

---

*Your Life / Unlocked | Session 34 Handoff | June 4, 2026 | Confidential*
