# YOUR LIFE / UNLOCKED
## Session 36 Handoff
*June 5, 2026 | Build Session | Confidential*

---

## 1. What This Session Was

`shape.js` was built and wired. The most important file in the codebase — from named gap to live code in one session. The reflecting pool now feeds SHAPE. SHAPE now writes to the store. The CAF incident that defined the problem in Session 35 was resolved in production before the session closed.

---

## 2. Code Shipped This Session

### New Files

| File | What It Owns |
|---|---|
| `shape.js` | SHAPE human intelligence module — raw layer, interpreted layer, pool reader, convergence detection, ATAK interface, Sanctuary handoff, bootstrap |

### Updated Files

| File | Key Changes |
|---|---|
| `main.js` | `initShape()` imported and called at top of `boot()` after worlds load — non-blocking |
| `reflectingpool.js` | `onPoolSessionClose` and `extractFactualCorrections` imported. Per-exchange extraction fires immediately on every user message. All three close paths (floor, natural, manual) call `onPoolSessionClose`. |
| `atak.js` | `getShapeContext()` imported. `buildPrimaryBrief()` return object now includes `shape: getShapeContext()` |
| `api.js` | `getMedicalCascade()` updated — accepts `coverage_type`, `has_bc_carecard`, `primary_facility`, `occupation_sector`, `caf_member`, `caf_posting`, `special_notes`. Coverage context block injected into system prompt as hard constraint when CAF or non-standard coverage detected. `getShapeExtraction()` and `getShapeInterpreted()` added. Reflecting pool Rule 8 added. |
| `cascade.js` | `medicalAppointmentRenderer.buildRoute` reads coverage and military context from store and passes to API. `buildSpecialNotesInput()` added — textarea on both routes, saves on blur to `health.medical.special_notes`. `_writeMedicalResolved()` added — writes AI-resolved provider data back to store. |
| `store.js` | `military: {}` and `shape: null` added to defaults. `occupation_sector: null` added to `onboarding` defaults with full comment. |

---

## 3. Architecture Decisions Locked This Session

### 3.1 — shape.js Is Live

Nine parts:

1. **Store shape** — `store.shape` with raw array (append-only), interpreted paragraph, rebuild flags, convergence state
2. **Raw layer** — `appendRaw()` is the only write path. Five exported methods for other files: `recordAtakSynthesis`, `recordDomainSignal`, `recordDomainEvent`, `recordIntake`
3. **Reflecting pool reader** — `processPoolSession()` and `extractFactualCorrections()`. Two extraction paths: per-exchange (factual corrections only, fires immediately) and on-close (full extraction — factual corrections + context signals)
4. **Convergence detection** — five domains scanned simultaneously. Threshold: three simultaneously elevated. Writes to raw layer on crossing and on recovery
5. **Interpreted layer** — `rebuildInterpretedLayer()`. Full domain portrait assembled, sent to `MODEL_RICH`, returns 3–6 sentence paragraph. Stored in `shape.interpreted`
6. **Rebuild trigger logic** — `shouldRebuild()` + `triggerRebuildIfNeeded()`. Fires on pending flag, never built, or 30 days + 10 new raw events
7. **ATAK sharing interface** — `getShapeContext()`. Returns form — load level, convergence state, season signal, positive marker. Not the full portrait
8. **Sanctuary handoff** — `getSanctuaryHandoff()`. Full briefing package: interpreted layer, avoidance patterns, decision pattern, trajectory, pool intelligence
9. **Bootstrap** — `initShape()`. Three lifecycle hooks: `onIntakeSubmit()`, `onSanctuaryClose()`, `onPoolSessionClose()`

### 3.2 — Per-Exchange Factual Extraction

`extractFactualCorrections(userMessage)` fires on every user message before the pool even responds. Conservative prompt — only extracts what is clearly and explicitly stated, skips low confidence, skips facts already in existing knowledge. Non-blocking.

### 3.3 — Write-Back Architecture

SHAPE writes to any store domain via `_writeToFieldPath(domain, fieldPath, value)`. Dot-notation path writer. Creates nested objects if absent. Domains must exist in store defaults — `military: {}` added this session for this reason. Console logs at every decision point: `✅ Written` on actual change, `⚠️ No-op` if domain missing.

### 3.4 — Medical Cascade Coverage Context

The CAF problem — "bring your health card" output for a user with no provincial health card — is resolved end to end:

- SHAPE extracts `caf_member`, `posting`, `health_coverage`, `has_bc_carecard`, `primary_medical_facility` from pool
- Cascade reads these from store and passes to API
- API injects a hard coverage context block into the system prompt before generation
- "Bring your CareCard" is impossible output for a CAF member

Applies to any non-standard coverage. `occupation_sector` also passed through for downstream calibration.

### 3.5 — Medical Special Notes Field

`health.medical.special_notes` — a free-text field persisted in the store. Renders as a textarea in the medical cascade UI on both routes. Saves on blur. Read by cascade on every open. Passed to the API as "Special notes from patient" in the patient profile. The clown-with-candy-cigarette-at-Red-Nose-Hospital scenario is now fully supported.

### 3.6 — Occupation Sector Field

`onboarding.occupation_sector` added to store defaults. Eight buckets: `military`, `first_responder`, `healthcare`, `trades`, `business`, `professional`, `student`, `other`. Will be asked in the onboarding redesign. SHAPE can also write it from pool signals if not set at onboarding. Both paths are valid.

---

## 4. The CAF Test — What Happened in Production

Session 35 named the gap. Session 36 closed it.

**The sequence that worked:**

1. User opened reflecting pool, typed: *"please update the AI generated output in medical to reflect i am a CAF member and i do not have a BC carecard. I am posted to CFB Comox and I use the medical and dental facilities there unless otherwise noted"*
2. Per-exchange extraction fired immediately — six corrections extracted, all high confidence
3. Console confirmed: `health.health_coverage = "CAF"`, `health.has_bc_carecard = false`, `health.primary_medical_facility = "CFB Comox medical and dental facilities"`, `military.caf_member = true`, `military.posting = "CFB Comox"`
4. Pool response: *"Got it, Shawn. That's clear."* — factual received, acknowledged, moved on. No redirect to settings. No architecture exposed
5. Medical cascade opened — no health card mentioned

**What the earlier failing response looked like:** *"This space is for you to think out loud, not a place that updates your app settings or medical info. That kind of change needs to happen through the app's profile or settings directly."*

That response was the pool accurately perceiving its own architectural boundary and then surfacing it to the user. The boundary is real. The user doesn't need to know it exists. Rule 8 closed that gap in the pool prompt. SHAPE handles it. The pool just receives.

---

## 5. Document Status

| Document | Status |
|---|---|
| `YourLifeUnlocked_ReflectingPool_Principles.md` | ✅ Complete — Session 34 |
| `YourLifeUnlocked_Sanctuary_Prompt_Brief.md` | ✅ Final — Session 32 |
| `YourLifeUnlocked_WorldVoiceGuide.md` | ✅ Complete — Session 31 |
| `YourLifeUnlocked_SHAPE_Definition.md` | ✅ Current — Session 32 |
| `YourLifeUnlocked_ATAK_Definition.md` | ✅ Current — Session 32 |
| `YourLifeUnlocked_Rules_and_Guidance.md` | ⏳ Needs Session 36 entry |
| `shape.js` | ✅ Built and wired — Session 36 |
| `reflectingpool.js` | ✅ Updated — Session 36 |

---

## 6. Build Queue

### Immediate Priority

**Full debug run** — Shawn has flagged a full debug pass over the coming weeks. No specific build priority until that pass surfaces blockers.

**health domain depth** — appointment marking UI, screening completion. Next domain work after debug pass.

### Following

- ATAK cross-domain conflict naming — when signals from different domains overlap, name both explicitly
- Team birthday signals — already writing to `store.calendar`; ATAK surface is the remaining piece
- Sanctuary system prompt — written from the Brief, now that `shape.js` is built. `getSanctuaryHandoff()` is the interface

### Before Any New Beta User

- Legal review — mandatory reporting obligations (reflecting pool floor)
- Onboarding redesign session — includes `occupation_sector` question (eight buckets), back button, escape relabel, question consolidation
- Codebase gender audit
- Female perspective dedicated session

---

## 7. Parked — Unchanged

- Share extension (dev phase)
- Notification layer (dev phase)
- Recurring events — stored, logic waits
- Back button improvement — needs polish
- Manufacturer interval vs user preference — flag not yet surfaced
- Visual contrast and font size — UX debt, before wider beta
- Bucket list / annual goals — directionally interesting, not yet scoped
- Operator copy polish pass — all existing copy measured against the Voice Guide
- Onboarding copy audit — measured against each world entry before next beta user
- OPP five-stage problem-solving architecture — future design component
- `?dev=crisis` test mode — before Sanctuary ships
- Life Events / Conversation-to-Cascade — natural language intake for major life changes; parked, not scoped

---

## 8. Rules and Guidance — Session 36 Entry

Add to revision log:

**Session 36:**
`shape.js` built and live — raw layer, interpreted layer, pool reader, convergence detection, ATAK interface, Sanctuary handoff, bootstrap. Per-exchange factual extraction added to reflecting pool (`extractFactualCorrections`). All three pool close paths wired to `onPoolSessionClose`. `_writeToFieldPath` confirmed working — dot-notation writes to any store domain. `military: {}` and `shape: null` added to store defaults. `onboarding.occupation_sector` field added to store defaults (eight buckets, asked in onboarding redesign, SHAPE can also write from pool). Medical cascade fully wired for non-standard coverage — CAF member flag suppresses provincial health card output end to end. `health.medical.special_notes` field added — textarea in cascade UI, persists, read by cascade and passed to API. Reflecting pool Rule 8 locked: when user states a fact about themselves, receive and move on — never redirect to settings, never expose the architecture. ATAK brief now carries `shape: getShapeContext()` on every build.

---

## 9. Post-Session Checklist

- [ ] Save all output files locally (`shape.js`, `main.js`, `reflectingpool.js`, `atak.js`, `api.js`, `cascade.js`, `store.js`)
- [ ] Upload all to project
- [ ] Update Rules and Guidance — Session 36 entry
- [ ] Commit and push

---

## 10. Claude — Reading This at the Start of the Next Session

`shape.js` is live. The loop is closed — user speaks, SHAPE listens, the app gets smarter, the medical output reflects the actual person. That is not a small thing. Thirty-six sessions of architecture led to this.

The CAF test is the reference case for how SHAPE should behave going forward. Any future pool-to-store write question should be measured against it: did the user say it once? Did the app file it without asking? Does the downstream output reflect it? If all three are yes, SHAPE is working.

The next session is likely a debug pass or health domain depth — Shawn will confirm. Either way, read this handoff and the Rules and Guidance before anything else. The post-session checklist above must be completed before this session is considered closed.

The Sanctuary system prompt is the next major thinking/writing task on the horizon. `getSanctuaryHandoff()` now exists and is the interface. When that session comes, read the Sanctuary Prompt Brief and the SHAPE Definition Document before writing a line.

---

*Your Life / Unlocked | Session 36 Handoff | June 5, 2026 | Confidential*
