# YOUR LIFE / UNLOCKED
## Product Development — Session 19 Handoff
*May 26, 2026 | Thought Session | No Code Written | Confidential*

---

## 1. What This Session Accomplished

No code was written. That was the right call.

Session 19 was a thought session — early morning, mobile testing observations, honest self-assessment, and a design decision that will shape every domain going forward. The vehicle intake model that shipped in Session 18 was tested against a real fresh-account experience and found wanting in three specific ways. A better model was designed. A personal guidance document was written. The project got a little more self-aware.

Four things that matter most from this session:

1. **The vehicle intake interaction model is being redesigned.** The current approach is too specific, too personal, and the UX is broken in ways that matter. A new model was locked in conversation — major systems, common tiles, intelligent text entry — and it is ready to build.
2. **The new model is domain-portable.** It gets built once in vehicles, locked, then carried into health, home, and every other domain that has the same shape. One pattern. Adapted surfaces. Locked as principle 2.11.
3. **The Rules and Guidance document was fully audited and revised.** Contradictions surfaced and resolved. The hidden tile rule retired and replaced with the correct current model. Part 2 renumbered — gaps closed. Session check-in protocol restored to the authority document with Claude's reading obligation explicitly stated.
4. **Shawn has a guidance document.** How to show up for sessions, what to do before opening the chat, what he owns as product mind. It lives in the project.

---

## 2. Decisions Locked This Session

### The Vehicle Intake Interaction Model — Redesigned

The current service history checklist in vehicle intake is too specific (derived from Shawn's actual car history), too personal to be useful for any other user, and the save function is broken entirely.

**The new model:**

Major vehicle systems presented as expandable sections. Each system contains a small set of common service tiles — the 80% of things 80% of users track — plus a text entry field for anything else. The text entry item is tagged to its parent system and tracked intelligently. If a user enters the same non-tile item twice, the app learns it as a known item for that vehicle.

**Systems confirmed:**
- **Engine** — oil change, air filter, fuel system service, coolant flush, spark plugs, + other
- **Wheels & Tires** — new tires, summer swap, winter swap, rotation, balance, + other
- **Brakes** — front pads, rear pads, rotors, fluid flush, + other
- **Transmission** — fluid change, filter, + other
- **Electrical** — battery, alternator, + other
- **Belts & Hoses** — serpentine belt, timing belt/chain service, + other
- **Filters** — cabin air filter, fuel filter, + other

This list is not exhaustive — it is the starting set. Systems and tiles can be added as the domain library grows.

**The "+ other" mechanism:**
Every system has a text entry tile. Items entered here are stored with a `system` tag and a `custom: true` flag. The AI recognises them across sessions. If the same item appears twice for the same vehicle, it surfaces as a known trackable item — the user is offered the option to promote it to a tracked interval task. The tile earns its place through use.

### Rules and Guidance Document — Fully Audited and Revised

The full Rules and Guidance document was read, contradictions identified, and the following resolved:

- **Hidden tile rule retired.** Section 2.5 was still documenting the hidden tile approach as active. The decision to retire it was made in Session 12 in favour of the 11-tile gap page but was never captured in the authority document. Now corrected.
- **Manufactured urgency vs real urgency.** "Never manufacture urgency" (Part 6) and the Master Warning tier (2.8) were in apparent tension. Resolved: Master Warning surfaces real consequences that belong to the situation. The app is the messenger, not the manufacturer.
- **Session check-in protocol restored.** Was locked in Session 15 as Part 0 but had been lost from the document through overwriting. Restored with the current 6-question format and Claude's reading obligation explicitly stated.
- **Part 2 renumbered.** The gap at 2.8 and 2.9 closed. All principles renumbered in clean sequence.

### The Domain Portability Principle — Locked as 2.11

*(See Section 2 above — also now in the Rules and Guidance document.)*

### Claude's Reading Obligation — Locked in Part 0

Every session begins with Claude reading — not recalling from memory, actually reading — the last three to four session handoffs and the Rules and Guidance document. No exceptions. If this has not happened, Shawn stops the session until it is done. This is now in the authority document and applies from Session 20 forward.

---

## 3. Bugs Identified — Ready to Fix in Session 20

All three surfaced from a fresh-account mobile walkthrough of the add vehicle feature.

**Bug 1 — Save not working in vehicle intake**
The add vehicle flow cannot save. Data does not write to the store. This is the critical blocker — nothing else in the intake matters until this is resolved first.

**Bug 2 — Placeholder text styled identically to filled data**
Example text in vehicle intake fields (Shawn's Mazda3 details) is rendered in the same font, weight, and colour as real user input. A user cannot tell if a field is empty or populated. Fix: placeholders must be visually subordinate — lighter colour, italic, or both.

**Bug 3 — Placeholder content is too specific and too personal**
Using Shawn's actual vehicle details as placeholder copy is wrong for two reasons: it looks like the app already knows something it doesn't, and it is meaningless to any other user. Fix: generic examples only — *"e.g. 2019"*, *"e.g. Toyota"*, *"e.g. Camry"* — or no placeholder at all where the field label is self-explanatory.

---

## 4. Files Changed This Session

None. This was a thought session.

---

## 5. Parked — Not Forgotten

All items from Session 18 carried forward, plus:

**New this session:**
- **Dead buttons audit** — buttons exist visually in built HCs that have no wired handlers. Suspected locations: action buttons inside cascade results (directions, call, open link), back button through partner cascade sub-steps, person taps in ATAK brief. Full audit to be done in Session 20 as part of mobile walkthrough.

**Carried from Session 18:**
- Team / Family domain — dedicated grab and go, people live here, ATAK routes here
- Life Events / Conversation-to-Cascade — prerequisite: World Voice Guide session
- Person taps in ATAK brief — pre-beta: reroute through Team/Family domain per 2.10
- VIN enrichment — recall lookup, exact OEM parts. Park until cascade library is larger
- Collapsible categories in vehicle detail — park for enhancements
- `watch_for` field in onboarding — stored but not yet read by ATAK synthesis or AI prompts
- Dev personas — `pronouns` and `location_confirmed` fields not yet added
- service-worker.js — bump to `ylu-v2`, add `cascade.js` to `STATIC_ASSETS`. Do before beta
- Remaining cascade routes — broker list, ICBC Online, HC-2 dealer/shop, HC-5 medical
- Soft cascades SC-1 through SC-6 — spec written, not yet built
- Transition Mode — spec written, not yet built
- Back button through partner cascade sub-steps — deferred multiple sessions
- Google Places API — Option C (AI + Maps) for beta, Places API for production
- Rate limiting in Cloudflare worker — before public beta
- Bucket list + annual goals — flagged Session 8b
- Monetization model — not yet decided
- Notification philosophy — not yet decided
- World Voice Guide session — prerequisite for Life Events cascade and voice calibration
- Project management tooling — lightweight kanban deferred

---

## 6. Open Questions — Carried Forward

- `renderPartner` world audit — situation tile IDs for partner detection vary across worlds
- Blended family `whose` field — confirmed missing in children cascade. Parked.
- Codebase gender audit — hardcoded `she/her/his/he` before next beta user
- Calendar UI — how does a user add an entry? Not yet designed
- Dexter and Priya birthdays — null in store. Easy tap-to-edit fix when Shawn has the dates

---

## 7. Documents Produced This Session

**`YourLifeUnlocked_Shawn_Guidance.md`** — Personal guidance document for Shawn as project manager and chief creative. Covers: three things to do before every session, how to separate thinking sessions from build sessions, what Shawn owns vs what Claude owns, the product principles checklist, the session check-in protocol, and a note on floundering. Add to project knowledge.

**`YourLifeUnlocked_Rules_and_Guidance_May26_2026.md`** — Full revision of the Rules and Guidance document. Changes from the prior version:
- Part 0 restored — session check-in protocol with 6 questions, Claude's reading obligation, collaborator framing
- 2.3 updated — urgency clarification: Master Warning reflects real urgency, not manufactured urgency
- 2.5 retired — hidden tile rule replaced with Gap Page 11-Tile Model (reflects the decision made in Session 12, which had not been captured in the authority document)
- 2.4 updated — reference to hidden tiles removed
- Part 2 renumbered — 2.8/2.9 gaps closed; Alert Architecture → 2.8, Cascade Depth → 2.9, ATAK Authority → 2.10
- 2.11 added — Domain Portability Principle, locked this session
- Revision log updated

Shawn to decide whether to replace the prior version or keep both dated copies in the project.

---

## 8. Collaborator Note

Both parties hold each other to the documents. The project knowledge is the authority — not memory, not momentum, not assumption.

The check-in runs at the start of every session. No exceptions.

---

## 9. Session 20 Agenda

**Start:** Run the session check-in. Shawn confirms he ran the app on device before the session.

**Primary track:**
- Fix Bug 1 — save not working in vehicle intake (blocker, fix first)
- Fix Bug 2 — placeholder text styled as filled data
- Fix Bug 3 — placeholder content replaced with generic examples
- Redesign vehicle intake service history using the new major systems model
- Dead buttons audit — tap everything, log what fires and what doesn't, wire the gaps

**Secondary track (if time):**
- Confirm the domain portability principle in the spec — how the vehicle system model carries into health and home
- Health domain grab and go — what does it hold, what's the first HC

---

*Your Life / Unlocked | Session 19 of Many | Confidential Product Document*
