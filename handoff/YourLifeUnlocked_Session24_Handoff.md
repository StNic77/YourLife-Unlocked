# YOUR LIFE / UNLOCKED
## Product Development — Session 24 Handoff
*May 29, 2026 | Build Session | Confidential*

---

## 1. What This Session Was

A major build session. The biggest single-session code output of the project. Five new or significantly rewritten files. The domain architecture rule was locked. The brief architecture was redesigned from the ground up. The consequence scoring engine was built.

The conversation alongside the build was equally significant. The vision crystallised in a way it hasn't before — not a better organiser, but the elimination of a category of cognitive effort. The phone number analogy. The thinking partner who already knows. Magic defined precisely: not impressive, relieving.

The brief is now an intelligent document. Seven sections, each with a distinct job, each disappearing when it has nothing to say.

---

## 2. Code Shipped This Session

### New Files

| File | What It Owns |
|---|---|
| `vehicles.js` | Vehicle domain module — `getVehiclesBrief()`, `isVehicleUrgent()`, `syncVehicleSignals()`, `retireVehicleSignals()` |
| `maintenance.js` | Maintenance domain module — `getMaintenanceBrief()`, `syncMaintenanceSignals()`, `retireMaintenanceSignal()` |
| `calendar.js` | Calendar domain — month grid, day view, entry creation, recurring toggle, date range support, domain signal rendering |

### Updated Files

| File | Key Changes |
|---|---|
| `atak.js` | `isVehicleUrgent` moved to `vehicles.js`. PART 5 added: `analyseTemporalWindow()`, `buildTemporalSection()`, `getRangeContextForDate()`. `buildPrimaryBrief()` fully rewritten — seven sections, consequence scoring engine. |
| `home.js` | Imports updated. `case 'vehicles'` and `case 'maintenance'` delegate to domain modules. `syncVehicleSignals()` and `syncMaintenanceSignals()` called on load and after intake. Calendar hotspot opens `createCalendar()`. `ylu:open-domain` event listener routes calendar signal taps back to correct domain brief. `buildPrimaryBriefHTML` handles collapsible sections. |

### Store shape note
`store.calendar` defaults need `calendar: []` added to `store.js` defaults. Currently missing. Without it, a clean install produces undefined reads in the temporal analysis layer.

---

## 3. Decisions Locked This Session

### 3.1 Every Domain Has Its Own `.js` File — Locked as Architecture Rule

`home.js` is the host. It renders. It does not own domain logic. Domain logic — data shape, signal writing, signal retirement, grab-and-go brief content — lives in the domain file.

**The domain file list:**

| File | Status |
|---|---|
| `vehicles.js` | Built this session |
| `maintenance.js` | Built this session |
| `calendar.js` | Built this session |
| `health.js` | Next session — not yet built |
| `team.js` | Exists — birthday signals still in `atak.js`, move to `team.js` flagged |

### 3.2 The Brief Architecture — Seven Sections

The brief is now a structured intelligence document. Sections appear only when they have something worth saying. Empty states eliminated — silence is the message.

| Section | Window | Appears when |
|---|---|---|
| Needs Attention | past–14 days | any urgent/overdue items |
| Today | today only | any entries exist today |
| This Week | 1–7 days | temporal synthesis has something to say |
| This Month | 8–30 days | consequence score 1+ items exist |
| On the Horizon | 15–60 days | score 0 items, maintenance tasks, quiet signals |
| Your Team | — | always, collapsed |
| In Focus | — | always, collapsed |

**Today disappears when clear.** No empty state. No message. Silence is the message.

**Your Team and In Focus are collapsible** — closed by default, tap to expand. Urgent team intelligence surfaces in Needs Attention, not inside the collapsed section.

### 3.3 Consequence Scoring Engine — Locked

The ATAK scores every item 0–4 to determine section routing. Score 1+ routes to This Month. Score 0 routes to On the Horizon. The user never sets this manually — the ATAK derives it.

| Score | Condition |
|---|---|
| +2 | Range entry — blocks capacity, creates before/after pressure |
| +1 | Falls during another range entry |
| +1 | Names a team member |
| +1 | Health domain signal |
| +1 | Vehicle signal that is overdue |

**Examples:** Work trip scores 2 minimum → This Month. Furnace filter scores 0 → On the Horizon at 30 days, nowhere else until overdue.

### 3.4 Calendar — Range Entries

Range entries (`is_range: true`, `date_start`, `date_end`) are a first-class entry type. They render as filled bars in the month grid, appear in the day view for every day they span, and route to This Month in the brief based on consequence score. Point-in-time entries and range entries coexist in `store.calendar`.

**Data shape:**
```js
{
  id, type: 'user_entry', title,
  date,           // equals date_start for backward compat
  date_start,     // ISO date string
  date_end,       // ISO date string
  is_range: true,
  recurring: false,
  recurring_frequency: null,  // 'weekly' | 'monthly' | 'annual' — future, stored not yet acted on
  ...
}
```

### 3.5 Today Disappears When Clear

No empty state. No "nothing on today." If today is clear, the brief skips directly to This Week. The absence is the message.

### 3.6 Brief Does Not Repeat What the User Already Knows

Profile data — age, love language, profession, pronouns — does not appear in the brief. The brief surfaces only what is active or relevant right now. Your Team collapses to names when life is quiet.

### 3.7 Share Extension — Dev Phase Requirement

The missing input layer. On iOS, a Share Extension registers YLU in the system share sheet. User books a flight in Safari, taps share, taps "Add to YLU" — the app receives page content, AI parses it, writes a range entry to the calendar. The user does nothing except tap share.

Cannot be built in the web prototype. Requires a native wrapper. Waits for dev phase.

This is also the answer to the Siri friction problem — the app meets the user in whatever they're already doing, rather than asking them to switch context.

---

## 4. Rules and Guidance Updates

The following should be added to the Rules and Guidance document before next session:

**2.17 — Domain File Rule**
Every domain has its own `.js` file. `home.js` is the host — it renders and routes. It does not own domain logic. Domain logic (data shape, signal writing, signal retirement, grab-and-go brief content) lives in the domain file. Violating this creates the same problem we had before the extraction — intelligence and rendering tangled together.

**2.18 — Brief Silence Rule**
The brief does not speak when it has nothing to say. Sections disappear when empty. No empty states, no placeholder copy, no "nothing here yet." Silence is the message. This applies to Today, This Week, This Month, On the Horizon, and any future section.

**2.19 — Consequence Radius Principle**
Items route to brief sections based on consequence radius, not date alone. The furnace filter and the work trip can both be 20 days out and surface in different sections. The ATAK scores consequence automatically — the user never configures this.

---

## 5. Next Session Priorities

### Primary
- **Health domain** — `health.js`. Health brief, signal writing, signal retirement. Annual physical overdue, screening due, appointment with date/time. Surfaces in Needs Attention, This Month, On the Horizon based on consequence score. Full intake exists from Session 22 spec — needs the domain module to match.
- **`store.calendar: []` default** — add to `store.js` before anything else.

### Secondary
- **ATAK depth** — when a conflict is detected between a range entry and a domain signal, name both explicitly in the brief. "Your work trip overlaps with your medication refill — sort the refill before June 8."
- **Team birthday signals** — currently derived in `atak.js`. Should move to `team.js` and write to `store.calendar` as domain signals. Consistent with the domain architecture.
- **Maintenance domain depth** — `maintenance.js` exists. Add log completion, compute next due date from interval, maintenance detail cascade that syncs signals on completion.

### Parked
- Share extension (dev phase)
- Notification layer (dev phase)
- Recurring events — `recurring: true` stored, logic waits
- World language normalisation — other worlds need audit
- Back button improvement — wired in Team, needs polish
- Codebase gender audit — hardcoded she/her/his/he, flagged before next beta user
- Codebase gender audit — hardcoded she/her/his/he, flagged before next beta user
- Manufacturer interval vs user preference — intelligence exists, flag not yet built

---

## 6. The Vision — Captured This Session

Two things said this session that belong in the permanent record.

**The phone number analogy:**
Nobody optimised the memorisation experience. The address book eliminated the problem entirely. YLU does the same for the cognitive load of tracking — what's due, what's coming, what's conflicting, what you promised, what's overdue. Not organised better. Gone.

**Magic defined:**
Magic has a specific feeling. It is not impressive. It is relieving. The user doesn't think "clever app." They think "oh thank god, I wasn't even thinking about that." That is the test for every decision going forward. Not "is this useful" but "does this feel like relief."

---

*Your Life / Unlocked | Session 24 Handoff | May 29, 2026 | Confidential*
