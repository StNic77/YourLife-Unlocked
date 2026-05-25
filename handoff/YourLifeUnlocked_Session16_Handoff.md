# YOUR LIFE / UNLOCKED
## Product Development — Session 16 Handoff
*May 2026 | Confidential*

---

## 1. What This Session Accomplished

This was a building session. The Rules & Guidance doc was updated, the codebase was audited for what a real new user actually receives, and the entire user identity and location layer was built from scratch.

A real new user can now be known by name, pronouns, country, and location before the first SMESC question fires. The app now knows the difference between where someone lives and where they are right now. The intelligence picture can start building from real data.

---

## 2. Rules & Guidance — Updated

Three additions made to `YourLifeUnlocked_Rules_and_Guidance.md`:

**Part 0 — Session Check-In Protocol** added with collaborator framing locked. Claude is a collaborator, not an executor. If something in the agenda conflicts with a principle, the conversation happens before the code gets written. The document is the authority.

**2.7 — The Whole Battlespace Rule** added. The ATAK monitors everything regardless of how it was filed. Relevance is determined by time, context, and what else the app knows — not by how the user categorised it. Check: does this feature require the user to categorise correctly in order to be served correctly? If yes, it is broken.

**2.8 — The Minimum Viable Question Rule** added. Before any cascade question fires, the app asks itself: do I already know this? The cascade earns every question it fires. Cross-domain inference closes questions before they open. The cascade shortens with time.

The old 2.7 (Counter-Cultural) renumbered to 2.9. Revision log updated.

*The updated Rules & Guidance doc was produced this session and needs to be added to the project.*

---

## 3. The Onboarding Audit — What a Real New User Gets

Before this session, a real new user landed in the home screen with their world selected and their SMESC answers captured — and nothing else. The `user` object in the store was `{ name: null, joined: null }`. Name, pronouns, province, city, and geolocation were all null.

The dev personas (Marcus, Sarah, Ryan) had all of that hand-loaded. Real users had none of it.

**Additional bugs found during audit:**
- Stray `store.set('onboarding_mission', selected)` duplicate write in `renderMission` — separate key, leftover from an earlier version. Now removed.
- `user.joined` was never written during onboarding — only existed in dev personas. Now fixed.
- The children cascade in `team.js` has no `whose` field (`mine / partners / ours`) — the blended family data model gap from the parked list is confirmed in the code. Not fixed this session, remains parked.
- `renderPartner` in `team.js` checks `situation` tile IDs for `partner` and `partner_kids` to decide whether to run the partner cascade — but tile IDs vary across worlds. Worth auditing before real data testing across non-Operator worlds.

---

## 4. What Was Built

### 4.1 User Identity Capture — onboarding.js, store.js

Four new steps inserted into the SMESC flow between `arrival` and `situation`:

**`name`** — Text input. World-specific prompt copy (Operator: *"What do I call you?"*, Meadow: *"What would you like to be called?"*, etc.). Keyboard-friendly, Enter confirms.

**`pronouns`** — 4 tiles: He / him, She / her, They / them, Prefer not to say. "Prefer not to say" stores `null` — the app never assumes.

**`country`** — 4 tiles: Canada, United States, United Kingdom, Somewhere else. Tile IDs: `CA`, `US`, `UK`, `other`.

**`province`** — Text input with 700ms debounced AI resolution. User types anything — abbreviation, full name, partial, misspelled. AI resolves to canonical code and full display name. Status line below the input shows the resolved name or an error. Escapable with a world-voiced warning that auto-advances after 1.8 seconds. Skipped silently if location module already captured home province.

**SMESC step order is now:**
`arrival → name → pronouns → country → province → situation → mission → execution → service_support → command_signals → closeout`

**Closeout now writes `user` to the store:**
```
user: {
  name, pronouns, country, province, province_name, joined
}
```
`joined` is written as ISO date string at closeout — the first time for real users.

---

### 4.2 Location Module — location.js (new file)

New module. Runs between gallery and onboarding — after the user has chosen their world, so the request has a voice.

**Flow:**
1. Permission request screen — world-voiced copy, single allow CTA + "continue without" escape
2. If allowed → browser `navigator.geolocation` fires → AI reverse-geocodes lat/lng to city, province, country
3. Home/away confirmation — *"We're seeing [City, Province]. Is this home, or are you away right now?"*
   - **This is home** → stores lat/lng as both current and home base. Province, province_name, country, home_city, home_lat, home_lng all written. Province step in onboarding skipped.
   - **I'm away right now** → stores lat/lng as current only. Province step in onboarding stays active to capture home province.
4. If denied or skipped → brief graceful message, advances. Province step in onboarding stays active.

**Failure is always graceful.** If the browser blocks it, the AI can't resolve the coordinates, or the user skips — the module advances cleanly without storing bad data.

---

### 4.3 Location Refresh — main.js

Silent lat/lng refresh fires on every home load. Runs in the background — does not block the home screen render. Uses a 5-minute GPS cache so it doesn't hammer the device.

**Critical rule baked in:** the refresh only updates `user.lat` and `user.lng`. It never overwrites `home_lat` or `home_lng`. Home is set once and stays stable. Current position updates every session. This is what makes travel work correctly — jurisdiction queries always use home province, proximity queries always use current position.

---

### 4.4 Store — store.js

`user` defaults expanded:

```javascript
user: {
  name: null,
  pronouns: null,           // 'he' | 'she' | 'they'
  country: null,            // 'CA' | 'US' | 'UK' | 'other'

  // Home base — stable, jurisdiction-aware
  province: null,           // canonical code e.g. 'BC', 'TX'
  province_name: null,      // full display name e.g. 'British Columbia'
  home_city: null,
  home_lat: null,
  home_lng: null,

  // Current position — refreshed each session
  lat: null,
  lng: null,

  location_confirmed: false,
  joined: null,
}
```

---

### 4.5 API — api.js

Two new methods:

**`reverseGeocode({ lat, lng })`** — sends coordinates, returns `{ city, province_code, province_name, country_code, valid }`. Used by location.js after geolocation succeeds.

**`resolveProvince({ input, country })`** — accepts free text, returns `{ code, name, valid }`. Generous — handles full names, abbreviations, misspellings. Used by the province step in onboarding.

---

## 5. Files Changed This Session

| File | Status | Notes |
|---|---|---|
| `onboarding.js` | Updated | 4 new steps, provinceKnown flag, closeout user write, duplicate write removed |
| `store.js` | Updated | user defaults expanded |
| `api.js` | Updated | reverseGeocode and resolveProvince added |
| `main.js` | Updated | location module wired, lat/lng refresh on home load |
| `location.js` | **New file** | Full location module — must be added to project |
| `YourLifeUnlocked_Rules_and_Guidance.md` | Updated | Part 0, 2.7, 2.8 added |

---

## 6. Mobile Testing — What to Watch For

Session ends here. Shawn is testing on mobile. Things to look for:

**Location module:**
- Does the browser permission prompt fire at the right moment — after world selection, before onboarding?
- Does the home/away screen render correctly with the geocoded city and province?
- If location is denied — does it advance cleanly to onboarding without errors?
- On the province step — does the status line update correctly as you type? Does it recognise "BC", "British Columbia", "british col" all the same way?

**Onboarding flow:**
- Do the four new steps feel native to the Operator world?
- Does the province step skip cleanly when location has already been captured?
- Does the store hold the right data at the end of onboarding? Check: `user.name`, `user.pronouns`, `user.country`, `user.province`, `user.joined`

**Dev personas:**
- Dev personas (Marcus, Sarah, Ryan) bypass onboarding entirely via `?dev=single` etc. — they are not affected by these changes. Persona data does not include `pronouns` or `location_confirmed` — those fields will be null for persona sessions. That is expected and fine for now.

---

## 7. Open Questions — Carried Forward

- **`renderPartner` world audit** — situation tile IDs for partner detection vary across worlds. Needs checking before testing non-Operator worlds.
- **Blended family `whose` field** — confirmed missing in children cascade. Still parked.
- **Codebase gender audit** — hardcoded `she/her/his/he` before next beta user.
- **AI reliability for vehicle data** — maintenance schedules at runtime. Needs testing against real vehicle data.

---

## 8. Parked — Not Forgotten

All items from Session 15 carried forward, plus:

- **Dev personas** — `pronouns` and `location_confirmed` fields not yet added to persona definitions in main.js. Low priority — personas bypass onboarding and go straight to home.
- **service-worker.js** — bump to `ylu-v2`, add `cascade.js` to `STATIC_ASSETS`. Do before beta.
- **Remaining cascade routes** — broker list, ICBC Online, HC-2 dealer/shop, HC-5 medical — not yet confirmed rendering correctly post-14b fixes.
- **Soft cascades SC-1 through SC-6** — spec written, not yet built.
- **Transition Mode** — spec written, not yet built.
- **Back button through partner cascade sub-steps** — deferred multiple sessions.
- **Google Places API** — Option C (AI + Maps) for beta, Places API for production.
- **Rate limiting in Cloudflare worker** — before public beta.
- **Bucket list + annual goals** — flagged Session 8b, still parked.
- **Monetization model** — not yet decided.
- **Notification philosophy** — not yet decided.
- **World Voice Guide session** — planned for Session 17 or 18, after Operator cascade is built and real data testing has begun.

---

## 9. Session 17 Agenda

**Start:** Run the session check-in.

**Depending on mobile test results:**
- Fix anything broken in the location or onboarding flow
- If clean — move to the vehicle intake cascade
  - Design the "add" entry point inside vehicle grab and go
  - Define the cascade spec in full — what the AI retrieves, what it asks, what the store shape looks like when complete
  - Build: new vehicle cascade, existing vehicle service log
  - First real data test — Shawn's actual vehicle through the cascade

---

*Your Life / Unlocked | Session 16 of Many | Confidential Product Document*
