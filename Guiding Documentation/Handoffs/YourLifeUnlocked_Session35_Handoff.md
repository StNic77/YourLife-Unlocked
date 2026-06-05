# YOUR LIFE / UNLOCKED
## Session 35 Handoff
*June 5, 2026 | Build Session | Confidential*

---

## 1. What This Session Was

A focused build session. The reflecting pool went from a working UI shell to a live AI conversation. The health domain got its teeth — every line in every sub-domain now does work when tapped. The calendar domain became the complete 365-day forward view for all temporal items across the entire product. Birthday signals joined the calendar. Person removal was wired. A SHAPE gap was identified and named clearly.

---

## 2. Code Shipped This Session

### New Files

| File | What It Owns |
|---|---|
| `reflectingpool.js` | Reflecting pool domain module — `getReflectingPoolBrief()`, `createReflectingPoolPanel()`, session store, SHAPE context builder |

### Updated Files

| File | Key Changes |
|---|---|
| `api.js` | `getReflectingPoolResponse()` added. `getMedicalCascade()` upgraded with rich patient context. `getPhysicalAdvice()` added. `getWellbeingSessionPrep()` added. Reflecting pool prompt fix — no more "I'll pass it along." |
| `store.js` | `reflecting_pool: []` added to defaults |
| `home.js` | Reflecting pool fully wired — import, `case 'capture'` replaced, `openReflectingPool()` added, CTA wired, dead capture save handler removed. `syncBirthdaySignals` imported and called on load. `openMedicalAppointment()`, `openPhysicalAdvice()`, `openWellbeingAction()` added. All three `.health-action-line` tap listeners wired. |
| `health.js` | Medical lines carry `action` + `action_context` — tappable, open appointment cascade. Physical lines carry `action: 'physical_advice'`. Mental lines carry `action: 'wellbeing_action'`. `_providerTypeLabel()` helper added. Line renderer updated — tappable lines have cursor and subtle underline affordance. |
| `cascade.js` | `markAppointmentKept` imported and used in medical appointment `complete` handler (was writing to wrong store location). Medical appointment `buildRoute` passes rich patient context. `buildMedicalRouteHTML` renders what to bring, questions to ask, screenings to request, prep notes. `physicalAdviceRenderer` added — Training + Nutrition routes. `wellbeingSessionRenderer` added — session prep cascade. `removePerson()` added with birthday signal retirement. Remove button added to person detail HTML. Remove button listener wired. Both new renderers registered. |
| `vehicles.js` | Signal window 30 → 365 days. `info` pressure tier added for 31–365 day range. |
| `maintenance.js` | Signal window 14 → 365 days. `info` pressure tier added. |
| `atak.js` | `syncBirthdaySignals()` and `retireBirthdaySignal()` exported. Birthday signals now write to `store.calendar` (365-day window, `domain: 'team'`, `signal_type: 'birthday'`). ATAK still surfaces birthdays as urgent items within 14 days — unchanged. |

---

## 3. Architecture Decisions Locked This Session

### 3.1 — 365-Day Calendar Rule
Every temporal item in the product writes to `store.calendar` up to 365 days out, rolling. The calendar domain holds the complete forward view. The ATAK surfaces pressure at its own thresholds — those haven't changed. Pressure tiers: `warning` (overdue or ≤7 days), `caution` (8–30 days), `info` (31–365 days).

### 3.2 — Health Lines Are Doors
Every line in every health sub-domain does work when tapped. Medical lines open the appointment cascade (personalised prep, questions, screenings to request). Physical lines open the physical advice cascade (Training or Nutrition routes). Well-being lines route based on state: managing/hard season with no provider → reflecting pool; has provider or doing well → session prep cascade.

### 3.3 — Reflecting Pool Does Not Promise
The pool receives. It does not confirm that the app will act on what was said. Closing language never implies updates are being made elsewhere. What the user puts here shapes the intelligence over time — invisibly, not through explicit confirmation. This is in the system prompt.

### 3.4 — The SHAPE Gap (Named This Session)
The CAF / health card incident surfaces the gap clearly. The reflecting pool collected a factual signal: "CAF member, no provincial health card." The pool did its job. But `shape.js` doesn't exist yet — nothing reads `store.reflecting_pool` and updates other domains. When SHAPE is built, it will:
- Read reflecting pool sessions for factual corrections and context signals
- Write them to the appropriate store location (e.g. `store.health.medical.coverage_type: 'CAF'`)
- Suppress incorrect assumptions in downstream cascades (health card instruction gone)

The user never had to file anything. They said it once. SHAPE does the filing. This is the governing principle from Session 33, demonstrated in production.

---

## 4. The Reflecting Pool — What Was Built

### Store Shape
```js
store.reflecting_pool = [
  {
    id: 'rp_<timestamp>',
    started_at: '<ISO>',
    ended_at: '<ISO>',
    closed: true,
    exchanges: [
      { role: 'user',      content: '...', ts: '<ISO>' },
      { role: 'assistant', content: '...', ts: '<ISO>' },
    ],
  },
  // ... up to 90 sessions retained
]
```

### Entry Model
No first question. The user arrives and the room receives them. The app's first move is always in response to what the user says. One question per exchange. Signal-based close. No summary. No homework.

### SHAPE Context (Lightweight Handoff)
Built fresh each session from: user name, world, life season, priorities, team presence, velocity signal (sessions in last 7 days), compressed recent threads (last 3 sessions, 80 chars each).

### API Method
`getReflectingPoolResponse({ messages, shapeContext, world, exchangeCount })` — `MODEL_RICH`. Returns `{ response, close_session, floor_triggered }`. System prompt holds all six constraints from the Session 34 addendum.

---

## 5. Physical Advice Cascade

Two routes: Training and Nutrition. Both personalised to `activity_level`, `goals`, `limitations`, `workout_note`.

**Training returns:** summary, weekly structure, recommended activity types, intensity guidance, limitations note, progression tip.

**Nutrition returns:** summary, eating pattern, goal alignment priorities, foods to prioritise, timing note, limitations note.

`MODEL_RICH`. Health Intelligence Boundary stated explicitly in system prompt.

---

## 6. Well-being Session Prep Cascade

Single route. Returns: what to bring, themes to raise, 3 questions to consider before the session, between-sessions note. Calibrated to provider type, last seen, and current state. `MODEL_RICH`.

---

## 7. Document Status

| Document | Status |
|---|---|
| `YourLifeUnlocked_ReflectingPool_Principles.md` | ✅ Complete — Session 34 |
| `YourLifeUnlocked_Sanctuary_Prompt_Brief.md` | ✅ Final — Session 32 |
| `YourLifeUnlocked_WorldVoiceGuide.md` | ✅ Complete — Session 31 |
| `YourLifeUnlocked_SHAPE_Definition.md` | ✅ Current — Session 32 |
| `YourLifeUnlocked_ATAK_Definition.md` | ✅ Current — Session 32 |
| `YourLifeUnlocked_Rules_and_Guidance.md` | ⏳ Needs Session 35 entry |
| `shape.js` | ⏳ Next build — principles complete, HUMINT session complete |
| `reflectingpool.js` | ✅ Shipped — Session 35 |

---

## 8. Build Queue

### Immediate Priority
**`shape.js`** — the remaining build. All thinking dependencies are complete. The HUMINT Collection Principles (Session 34) and the Reflecting Pool Collection Principles are the governing documents. The CAF/health card incident from this session is a concrete illustration of exactly what SHAPE needs to do.

Before the shape.js build session, read:
- `YourLifeUnlocked_SHAPE_Definition.md` — complete architecture
- `YourLifeUnlocked_ReflectingPool_Principles.md` — collection discipline
- Session 33 handoff — governing principle (user never files)
- Session 34 handoff and addendum — HUMINT principles, build brief
- This handoff — specifically 3.4

### Following
- Health domain depth — appointment marking UI, screening completion
- ATAK cross-domain conflict naming
- Team birthday signals (already writing to calendar — ATAK surface is the remaining piece)

### Before Any New Beta User
- Legal review — mandatory reporting obligations (reflecting pool floor)
- Onboarding redesign session
- Codebase gender audit
- Female perspective dedicated session

---

## 9. Parked — Unchanged

- Share extension (dev phase)
- Notification layer (dev phase)
- Recurring events — stored, logic waits
- Back button improvement — needs polish
- Manufacturer interval vs user preference — flag not yet surfaced
- Team onboarding redesign — back button, escape relabel, question consolidation
- Visual contrast and font size — UX debt, before wider beta
- Bucket list / annual goals — directionally interesting, not yet scoped
- Sanctuary system prompt — written from the Brief, after shape.js is built
- Operator copy polish pass — all existing copy measured against the Voice Guide
- Onboarding copy audit — measured against each world entry before next beta user
- OPP five-stage problem-solving architecture — future design component
- `?dev=crisis` test mode — before Sanctuary ships

---

## 10. Rules and Guidance — Session 35 Entry

Add to revision log:

**Session 35:**
Reflecting pool domain built and live — `reflectingpool.js`, `store.reflecting_pool`, AI exchange working. 365-Day Calendar Rule locked: every temporal item across all domains writes to `store.calendar` up to 12 months out, rolling; `info` pressure tier added for 31–365 day range. Health lines are doors — every sub-domain line tappable, opens appropriate cascade or reflecting pool based on state. Physical advice cascade added (Training + Nutrition routes). Well-being session prep cascade added. Well-being routing locked: managing/hard season + no provider → reflecting pool; has provider → session prep. Reflecting pool prompt constraint added: the pool receives, never promises. SHAPE gap named and documented: reflecting pool collects correctly; shape.js is what closes the loop between what was said and what the app knows.

---

## 11. Post-Session Checklist

- [ ] Save all output files locally (`reflectingpool.js`, `api.js`, `store.js`, `home.js`, `health.js`, `cascade.js`, `vehicles.js`, `maintenance.js`, `atak.js`)
- [ ] Upload all to project
- [ ] Update Rules and Guidance — Session 35 entry
- [ ] Commit and push

---

## 12. Claude — Reading This at the Start of the Next Session

The next session is `shape.js`. Everything else is downstream of that build.

The CAF incident from this session is the clearest possible statement of what SHAPE needs to do. The user said something true about themselves. The pool heard it. Nothing acted on it. SHAPE is what acts on it — reads the session, identifies the signal, writes it to the right place, and the product gets smarter without the user having to do anything twice.

Read the SHAPE Definition Document before writing a line. Then read the Reflecting Pool Collection Principles. Then read Section 3.4 of this handoff. Then build.

The design standard has not changed:

> *If this thing is going to work, SHAPE has to be a superhero.*

---

*Your Life / Unlocked | Session 35 Handoff | June 5, 2026 | Confidential*
