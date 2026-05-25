# YOUR LIFE / UNLOCKED
## Product Development — Session 17 Handoff
*May 2026 | Confidential*

---

## 1. What This Session Accomplished

This was a debugging and stabilisation session. No new features were specced from scratch — but two real problems were found, diagnosed, and fixed, and a third real-world problem was identified and solved before it became a user complaint.

The app now knows a real person in a real place. Not a persona. Not fabricated coordinates. A real user, confirmed in Comox, BC. Everything built from here builds on that foundation.

---

## 2. The Diagnosis — What Broke in Session 16

The Session 16 build shipped with a black screen on launch. The app would not load. Root cause was found this session.

**Primary cause: syntax error in `onboarding.js` line 330.**

The Garden world skip warning copy contained an apostrophe inside a single-quoted JavaScript string:

```javascript
garden: 'I'll be able to tend things better once I know where you are. You can add it later.',
```

The `'` in `I'll` closed the string early. The parser saw `ll` as an unexpected identifier and crashed the module. A failed module import in the entry point produces a black screen with no visible UI error — which is why it was hard to diagnose on mobile.

**Fix:** escaped apostrophe.

```javascript
garden: 'I\'ll be able to tend things better once I know where you are. You can add it later.',
```

**Lesson:** Any world voice copy string containing a contraction (`I'll`, `you'll`, `it's`, `don't`, `we're`) must use either escaped apostrophes or backtick template literals. Backticks are preferred for prose strings going forward — they read cleaner and eliminate the risk entirely.

**Secondary discovery: `main.js` out of sync.**

After fixing the syntax error, the location module still wasn't firing on VS Live Server. Investigation revealed the VS desktop file was the pre-Session-16 `main.js` — the git pull had not updated it. The GitHub version had the correct `location.js` import and the `showGallery` wiring. The VS file did not.

Fix: replaced the VS `main.js` with the GitHub version directly. Both are now in sync.

**What the sync issue taught us:** the two-file repair at the end of Session 16 (main and onboarding dropped in together) masked the fact that `main.js` on disk was stale. The GitHub version was always correct. The desktop was behind.

---

## 3. What Was Built

### 3.1 Location Correction Flow — `location.js`

A real-world problem was identified during testing: mobile GPS (and desktop wifi-based geolocation) can drift. The app geocoded Powell River when the user was in Comox. The original home/away confirmation screen offered no way to correct a wrong city — the user could only accept it or skip.

**The fix:** a third option added to the home/away confirmation screen.

```
[ This is home ]  [ I'm away right now ]
Close — let me correct it
```

"Close — let me correct it" is styled as a quiet secondary link — low visual weight, not competing with the primary options. It opens a correction screen.

**Correction screen — `renderCorrection()`:**
- Single text field: city name only
- Province is pre-filled from the GPS result and not re-asked unless the corrected city changes it (Minimum Viable Question Rule)
- 700ms debounce — same pattern as the province step in onboarding
- AI resolves via `api.resolveCity()` — generous, handles "courtenay", "courtenay bc", "Courtenay British Columbia" identically
- Status line shows resolved city and province once confirmed
- "That's it" confirm button appears once a valid result is in hand
- Enter key also confirms — keyboard-friendly
- If resolution fails: status line says so, user can try again
- On confirm: feeds corrected city, province, and city-centre lat/lng back into the home/away screen
- User then picks "This is home" or "I'm away right now" as normal

**The flow is a loop** — if somehow the corrected result is also wrong, the user can correct again. In practice this will never happen twice.

**Why this matters beyond the fix:** the correction screen signals that the app cares about getting it right more than it cares about moving fast. Most apps accept the GPS result and move on. This one stops and asks. That tone compounds over time.

**Tested:** GPS landed on Courtenay. User corrected to "Comox, BC". App accepted it. `home_city` written as Comox. Store confirmed correct.

---

### 3.2 `api.js` — `resolveCity` Method Added

New method alongside `reverseGeocode` and `resolveProvince`.

```javascript
async resolveCity({ input, country })
```

**Returns:** `{ city, province_code, province_name, country_code, lat, lng, valid }`

**Differs from `reverseGeocode` in two ways:**
- Works from text input rather than coordinates
- Returns city-centre lat/lng (approximate), not the device's exact position

**Country hint** passed in from store when known — narrows resolution and reduces ambiguity for common city names.

**AI contract:** generous. Resolves partial names, casual input, province hints embedded in the string. Returns `valid: false` cleanly if the input is genuinely unresolvable.

---

## 4. Files Changed This Session

| File | Status | Notes |
|---|---|---|
| `location.js` | Updated | Correction flow added — `renderCorrection()`, third tile on home/away screen |
| `api.js` | Updated | `resolveCity()` method added |
| `onboarding.js` | Fixed | Line 330 apostrophe escape — Garden world skip warning |
| `main.js` | Synced | VS desktop file replaced with correct GitHub version |

---

## 5. Real Data Testing — Status

The app has now been run by a real user (Shawn) through the full new-user flow:

- World selection ✓
- Location module fires ✓
- GPS geocoded (Courtenay — close but not exact) ✓
- Correction flow used — corrected to Comox, BC ✓
- Home confirmed ✓
- Store written correctly ✓
- Onboarding continues from there ✓

This is the first time the app has captured real location data from a real person. The intelligence picture is no longer entirely simulated.

---

## 6. Open Questions — Carried Forward

- **`renderPartner` world audit** — situation tile IDs for partner detection vary across worlds. Needs checking before testing non-Operator worlds.
- **Blended family `whose` field** — confirmed missing in children cascade. Still parked.
- **Codebase gender audit** — hardcoded `she/her/his/he` before next beta user.
- **AI reliability for vehicle data** — maintenance schedules at runtime. Needs testing against real vehicle data.
- **Project management tooling** — raised this session. The handoff docs are carrying a lot of weight. Worth a short conversation next session about whether a lightweight kanban or living task doc would help surface what's parked vs. what's active. Not urgent — note it, don't solve it yet.

---

## 7. Parked — Not Forgotten

All items from Session 16 carried forward:

- **Dev personas** — `pronouns` and `location_confirmed` fields not yet added to persona definitions in `main.js`. Low priority — personas bypass onboarding and go straight to home.
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
- **World Voice Guide session** — planned for Session 18 or 19, after real data testing has begun in earnest.

---

## 8. Session 18 Agenda

**Start:** Run the session check-in.

**Primary track — vehicle intake cascade:**
- Design the "add" entry point inside the vehicle grab and go
- Define the cascade spec — what the AI retrieves, what it asks, what the store shape looks like when complete
- Build: new vehicle cascade and existing vehicle service log
- First real data test — Shawn's actual vehicle through the cascade

**If time — secondary track:**
- Short conversation on project management tooling — is the handoff doc enough, or does something need to be tracked differently?

---

*Your Life / Unlocked | Session 17 of Many | Confidential Product Document*
