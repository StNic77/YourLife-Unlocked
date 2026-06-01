# YOUR LIFE / UNLOCKED
## Product Development — Session 25 Handoff
*May 31, 2026 | Build Session | Confidential*

---

## 1. What This Session Was

A focused build session. The Health domain went from nothing to fully functional — `health.js` written from scratch, `cascade.js` extended with the complete health intake flow, `home.js` and `store.js` updated to match. The vehicles domain was the authority model throughout and the pattern held cleanly.

By end of session: the Health grab-and-go brief is live, sub-domain sections are collapsible, the intake runs end to end on device, dates save correctly, data surfaces in the ATAK, and custom provider intervals are user-settable. Stable on mobile and VS Live Server.

---

## 2. Code Shipped This Session

### New Files

| File | What It Owns |
|---|---|
| `health.js` | Health domain module — `getHealthBrief()`, `syncHealthSignals()`, `retireAllHealthSignals()`, `retireHealthSignal()`, `initHealthStore()`, `saveMedicalIntake()`, `savePhysicalIntake()`, `saveMentalIntake()`, `markAppointmentKept()`, `getApplicableScreenings()`, `computeNextDue()`, `computeProviderNextDue()` |

### Updated Files

| File | Key Changes |
|---|---|
| `store.js` | `vehicles: []`, `maintenance: []`, `calendar: []`, `health: {}` added to defaults. Clean install no longer throws undefined reads. |
| `home.js` | Imports `getHealthBrief`, `syncHealthSignals` from `health.js`. `case 'health'` delegates to `getHealthBrief()`. `syncHealthSignals()` called on load. `openHealthIntake()` and `openHealthSubDomain()` added. `custom_html` escape hatch added to grab-and-go brief renderer. |
| `cascade.js` | Imports health helpers from `health.js`. `healthIntakeRenderer` added — full 11-step intake. `attachHealthIntakeListeners` added and wired in `attachShellListeners`. `health_intake` registered in RENDERERS. `_prePopulateHealthState()` added for edit flows. |

---

## 3. Health Domain — What Was Built

### Store Shape

```js
store.health = {
  disclaimer_seen: false,
  medical: {
    complete: false,
    sex_assigned_at_birth: null,
    primary_care: { has_provider, name, last_seen, next_due },
    providers: [{ id, tile_id, type, name, last_seen, interval_days, next_due }],
    conditions: [{ id, label, custom }],
    medications: [{ name }],
    screenings: [{ id, label, recurrence_days, last_done, next_due, skipped }],
  },
  physical: {
    complete: false,
    activity_level, goals, limitations, workout_note,
  },
  mental: {
    complete: false,
    current_state, has_provider, provider_name, provider_type,
    last_seen, app_holds_quietly,
  },
}
```

### Intake Flow — 11 Steps (Locked Session 22 Order)

| Step | What It Covers |
|---|---|
| `disclaimer` | Plain language, non-skippable, said once |
| `primary_care` | Has provider? Name + last visit date |
| `sex_at_birth` | Framed off known pronoun — one tap for majority, tile set if different |
| `providers` | Tile selection (dentist, eye care, dermatologist, physio, chiro, specialist) |
| `provider_detail` | One screen per provider — name, last visit, custom interval tiles |
| `conditions` | 14 curated tiles + free text, skippable |
| `medications` | Textarea, one per line, skippable |
| `screenings` | Age and sex appropriate tiles only, expandable last-done date, skippable |
| `physical_activity` | Single-select activity level |
| `physical_goals` | Multi-select goals + limitations free text, skippable |
| `mental_state` | Four tiles including prefer not to say; routes to provider step if set |
| `mental_provider` | Yes/No, name, last visit — only when mental state is set and not prefer_not_to_say |

### Health Intelligence Boundary (Rule 2.13) — Held Throughout

No clinical commentary, no medication comments, no symptom interpretation anywhere in the intake copy or brief output.

### `app_holds_quietly`

Set to `true` when `current_state === 'hard_season'`. The ATAK reads this for cross-domain synthesis. The app does not surface hard season in the brief or push anything additional — it holds quietly and waits.

---

## 4. Health Brief — Collapsible Sub-Domains

The grab-and-go brief renders three collapsible sections: Medical, Physical, Well-being. All collapsed by default.

**Heading tap** — toggles expand/collapse only. Chevron rotates. No cascade opens.

**Edit link** — appears inside the expanded content, bottom right. Tapping opens the health intake scoped to that sub-domain (`_editSubDomain` context), pre-populated with existing data.

**Urgent state** — heading text turns gold when any line within the section is urgent.

**`custom_html` escape hatch** — added to the grab-and-go brief renderer in `home.js`. When a section carries `custom_html`, the renderer emits it directly instead of passing through `buildItemRow`. Health uses this. Other domains unaffected.

---

## 5. Custom Provider Intervals

Provider detail step now includes four interval quick-select tiles: 3 months, 6 months, Annual, 2 years. Tap to select, tap again to deselect.

**User preference is authoritative.** When `interval_days` is set on a provider, it is used for all `next_due` calculations — initial intake, edit flow, and `markAppointmentKept` reschedule. The type-based default (`computeProviderNextDue`) applies only when no user interval is set.

`interval_days` is stored on the provider object in `store.health.medical.providers`. Persists across sessions. Carries into `_prePopulateHealthState` so the correct tile re-selects on edit.

---

## 6. Bugs Fixed This Session

| Bug | Root Cause | Fix |
|---|---|---|
| Sub-domain sections not selectable after intake | `getHealthBrief` returned nested `{ sub_domain, lines: [] }` shape; brief renderer expected flat items | Rewrote to `custom_html` collapsible blocks |
| Heading tap opened edit cascade immediately | Both inline `onclick` toggle and delegated `health-subdomain-label` listener fired on same tap | Separated: heading = toggle only, Edit link = cascade opener |
| Last visit dates not saving | `buildDateField(id, isoValue)` called with wrong arg order — label arg missing, value passed as label | Fixed to `buildDateField(id, label, isoValue)` on all four health date fields; fixed `-iso` suffix mismatch in querySelector |
| `store.calendar` default missing | Never added to `store.js` defaults | Added `calendar: []`, `vehicles: []`, `maintenance: []`, `health: {}` |

---

## 7. Decisions Locked This Session

### 7.1 Health Domain Pattern — Confirmed

The vehicles domain pattern carries cleanly into health. Domain Portability Principle (2.11) confirmed in practice. The pattern is:
- Domain module owns data shape, brief content, signal writing, signal retirement, intake helpers
- `cascade.js` owns the intake renderer and step builders
- `home.js` delegates entirely — no domain logic
- `atak.js` reads `store.health` directly for synthesis

### 7.2 Collapsible Sub-Domain Pattern

Health is the first domain with sub-domains. The collapsible heading pattern (collapsed by default, toggle only, Edit link inside expanded content) is the reference for any future domain that has sub-categories.

### 7.3 User Interval Preference — Authoritative

When a user sets a custom interval for any provider, that value is authoritative over any system default. This extends the vehicles principle (preferred oil interval wins over manufacturer default) into health. The pattern is now established across two domains.

---

## 8. Rules and Guidance Updates

The following should be added to the Rules and Guidance document:

**2.20 — Collapsible Sub-Domain Pattern**
When a domain has sub-categories (e.g. health: Medical, Physical, Mental), they render as collapsible sections in the grab-and-go brief. Collapsed by default. Heading tap toggles only — no cascade. Edit affordance lives inside the expanded content. Urgent sub-domains show gold heading text. Health is the reference implementation.

**2.21 — `custom_html` Escape Hatch**
The grab-and-go brief renderer supports a `custom_html` property on section items. When present, the HTML is emitted directly — not passed through `buildItemRow`. Use sparingly and only when the standard item shape genuinely cannot represent the content. Health sub-domain collapsibles are the reference case.

---

## 9. Next Session Priorities

### Immediate
- **Health domain depth** — individual sub-domain edit flows (edit Medical without running the full 11-step intake), provider appointment marking (tap to record kept, reschedule forward), screening completion flow
- **ATAK cross-domain conflict naming** — when a range entry overlaps a health signal, name both explicitly: "Your work trip overlaps with your dental appointment — sort the appointment before June 8"
- **Team birthday signals** — move from `atak.js` to `team.js`, write to `store.calendar` as domain signals, consistent with domain architecture rule

### Secondary
- Maintenance domain depth — log completion, next due from interval, maintenance detail cascade that syncs on completion
- Manufacturer interval vs user preference flagging — intelligence exists, flag not yet surfaced to user

### Parked (unchanged)
- Share extension (dev phase)
- Notification layer (dev phase)
- Recurring events — `recurring: true` stored, logic waits
- World language normalisation — other worlds need audit
- Back button improvement — wired in Team, needs polish
- Codebase gender audit — hardcoded she/her/his/he, flagged before next beta user

---

*Your Life / Unlocked | Session 25 Handoff | May 31, 2026 | Confidential*
