# YOUR LIFE / UNLOCKED
## Product Development — Session 20 Handoff
*May 26, 2026 | Build Session | Confidential*

---

## 1. What This Session Accomplished

This was a fast, productive build session. The prep work from Session 19 — the thought session, the rules audit, the personal guidance document — paid off immediately. The check-in was clean. The agenda was right. Building started quickly and the feedback loop between code and device testing was tight throughout.

Five things that matter most from this session:

1. **The vehicle intake is fully functional.** Save works. Placeholders are generic. Back navigates through steps rather than closing. The major systems model is live. A user can add a vehicle, go through all five steps, and land on a review screen that accurately reflects what they entered.
2. **The vehicle intelligence layer is proven against real data.** Three real vehicles tested — 2015 Mazda3, 2023 CX-5 with VIN, CX-90 PHEV. Vehicle facts populated correctly. VIN confirmed as the quality multiplier. The AI is doing genuine work.
3. **Delete and edit are wired.** Delete vehicle has a confirm step. Edit vehicle opens the intake cascade pre-populated with existing data and updates the record rather than creating a new one.
4. **The API prompt is now date-aware.** Today's date is injected at call time. The AI calculates `next_oil_change_date` forward from the real current date, not from a training-data guess. Dates in the past are explicitly prohibited.
5. **The dev=shawn environment now preserves real saves.** The reset guard means reloads no longer wipe data. Two distinct testing modes are now clean: `?dev=shawn` for watching the intelligence layer, real onboarding for testing the user flow end to end.

---

## 2. Decisions Made This Session

### Vehicle Intake — Fully Rebuilt and Proven

The intake flow is now production-quality for the vehicles domain:

- **Bug 1 fixed:** Save was failing on every reload because `dev=shawn` called `store.reset()` on every page load. Fixed with a `dev_shawn_loaded` flag — reset only fires once on first load.
- **Bug 2 fixed:** Placeholder text was visually identical to filled data. Fixed with `.intake-field::placeholder` CSS — lighter colour, italic.
- **Bug 3 fixed:** Shawn's personal details were used as placeholder copy. Replaced with generic examples throughout all five steps.
- **Back button fixed:** Was closing the cascade entirely. Now steps backward through intake steps. Only closes from `step_identity` where there is nowhere further back to go.
- **Major systems model live:** Step 4 rebuilt from a flat checklist to seven expandable system sections — Engine, Wheels & Tires, Brakes, Transmission, Electrical, Belts & Hoses, Filters. Common tiles inside each. `+ other` text entry per system with custom tags and removable chips.
- **Throttle body clean removed from default tiles.** It was in the Engine section. It belongs only when the AI flags it as relevant — not as a default option for a new vehicle owner.

### Delete and Edit Vehicle — Wired

Two buttons appear directly below the vehicle name in the vehicle detail cascade:

- **Edit vehicle details** — opens the intake cascade pre-populated from the existing vehicle record. On completion, `complete()` detects `_editingVehicleId` and updates the existing vehicle rather than creating a new one. Fields not touched during the edit are preserved.
- **Delete vehicle** — low-contrast until hovered, then goes red. Tapping reveals an inline confirm panel with the vehicle name. Confirm removes the vehicle from the store and closes. Cancel restores the button.

### API Prompt — Date-Aware

Three additions to `getVehicleSchedule`:

- Today's date injected as `YYYY-MM-DD` from `new Date()` at call time
- Explicit instruction to calculate `next_oil_change_date` forward from today
- Explicit prohibition on returning a date in the past
- Default assumption of 1,500 km/month when driving history is insufficient

### Vehicle Intelligence — Proven Against Real Data

Three vehicles tested in this session:

- **2015 Mazda3 Sport** — engine facts accurate, service intervals correct, high-mileage notes present
- **2023 Mazda CX-5 with VIN** — described as "so rich." VIN is the quality multiplier. Used vehicles with a VIN get the most accurate intelligence picture.
- **CX-90 PHEV** — populated correctly
- **CX-70 3.3T mild hybrid Signature** — engine facts did not populate. Likely a knowledge gap on a newer model, possibly compounded by a complex variant string. Workaround: simplify variant to `3.3T AWD` or leave blank. Long-term fix: VIN enrichment via decode API (already parked).

### VIN Confirmed as Quality Signal

The CX-5 test made this concrete. A VIN gives the AI exact engine and trim data — no inference required. This is an argument for surfacing VIN more prominently in the intake flow, not buried in step 5 as optional. Not acted on this session — noted for future consideration.

### Two Testing Modes — Now Clean

- `?dev=shawn` — fast intelligence view, Shawn's full data environment, reloads preserve saves
- Real onboarding — fresh user experience, nuke to reset via the dev nuke wired to the Operator home screen

---

## 3. Open Design Question — Noted, Not Acted On

**Manufacturer interval vs user preference:**
Raised this session. If a user prefers 8,000km oil changes and the manufacturer recommends 10,000km or 16,000km, the app should notice and acknowledge the divergence — not as a warning, as a quiet confirmation. "Manufacturer recommends 10,000 km. You prefer 8,000 km. I'll track to your interval." This requires the AI prompt to return the manufacturer's recommended interval explicitly (it doesn't currently), and a comparison to be made at the detail view level. Parked for a future session.

---

## 4. Files Changed This Session

| File | Changes |
|---|---|
| `cascade.js` | Back button steps backward through intake. Delete + edit buttons in vehicle detail. `complete()` handles edit mode. Major systems model replaces flat checklist. Throttle body clean removed from default tiles. Placeholder CSS injected. Generic placeholders throughout intake steps. |
| `main.js` | `dev_shawn_loaded` flag guards the `dev=shawn` reset — fires once on first load only. |
| `api.js` | Today's date injected. Forward-only date calculation. 1,500 km/month default. Never return past date. |

---

## 5. Parked — Not Forgotten

**Moved to Session 21 first priority:**
- Dead buttons audit — tap everything in the built HCs, log what fires and what doesn't, wire the gaps

**Carried from Session 19:**
- Manufacturer interval vs user preference — flag and acknowledge divergence, quiet not alarming
- VIN as prominent intake field — currently step 5 optional, should be elevated for used vehicles
- CX-70 engine facts gap — simplify variant string, or wait for VIN enrichment
- Team / Family domain — dedicated grab and go, people live here, ATAK routes here
- Life Events / Conversation-to-Cascade — prerequisite: World Voice Guide session
- Person taps in ATAK brief — pre-beta: reroute through Team/Family domain per 2.10
- VIN enrichment — recall lookup, exact OEM parts, VIN decode API
- Collapsible categories in vehicle detail
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
- World Voice Guide session — prerequisite for Life Events cascade
- Health domain grab and go — first look deferred from Sessions 19 and 20
- Domain portability confirmation in spec — how vehicle system model carries into health and home

---

## 6. Open Questions — Carried Forward

- `renderPartner` world audit — situation tile IDs for partner detection vary across worlds
- Blended family `whose` field — confirmed missing in children cascade. Parked.
- Codebase gender audit — hardcoded `she/her/his/he` before next beta user
- Calendar UI — how does a user add an entry? Not yet designed
- Dexter and Priya birthdays — null in store. Easy tap-to-edit fix when Shawn has the dates

---

## 7. Collaborator Note

This session felt different. The check-in was crisp, the agenda held, and the testing loop between code and device was tight. The Session 19 thought work — the rules audit, the personal guidance document, the design decisions made before a line was written — removed the friction that had slowed previous sessions.

The pattern worth keeping: think first, build second. Thought sessions are not lost time. They are the reason build sessions move fast.

Both parties hold each other to the documents. The project knowledge is the authority.

The check-in runs at the start of every session. No exceptions.

---

## 8. Session 21 Agenda

**Start:** Run the session check-in.

**Primary track:**
- Dead buttons audit — first priority, carried from Session 20. Tap everything in built HCs. Log what fires and what doesn't. Wire the gaps.
- Manufacturer interval vs user preference — flag divergence quietly in vehicle detail

**Secondary track (if time):**
- Health domain grab and go — what does it hold, what's the first HC
- Domain portability — confirm how the vehicle system model carries into health and home

---

*Your Life / Unlocked | Session 20 of Many | Confidential Product Document*
