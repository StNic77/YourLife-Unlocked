import { store } from './store.js';

// ---------------------------------------------------------------------------
// CALENDAR DOMAIN MODULE
//
// The calendar is the authoritative temporal domain. It owns time.
//
// Architecture:
//   calendar.js ──owns──▶  store.calendar (reads + writes + presents)
//   domain files ──write signals──▶ store.calendar (never call into calendar.js)
//   atak.js      ──reads──▶ store.calendar (for temporal analysis — never renders)
//
// Two entry types in the store:
//   user_entry    — the user created this
//   domain_signal — a domain wrote this (vehicles, maintenance, health, team, ...)
//
// The calendar presents both in the same view, visually distinguished.
// Domain signals route back to their owning domain on tap.
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// UTILITIES
// ---------------------------------------------------------------------------

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return isNaN(d) ? null : d;
}

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function formatMonthYear(date) {
  return date.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
}

function formatDayHeading(date) {
  return date.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatTimeRange(entry) {
  if (!entry.time_start) return null;
  if (!entry.time_end) return entry.time_start;
  return `${entry.time_start}–${entry.time_end}`;
}

// Unique ID for new user entries
function newEntryId() {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

// Get all entries from the store, sorted by date ascending
function getEntries() {
  const raw = store.get('calendar') || [];
  return [...raw].sort((a, b) => {
    const da = parseDate(a.date);
    const db = parseDate(b.date);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da - db;
  });
}

// Get entries for a specific day — includes range entries and recurring occurrences
function getEntriesForDay(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return [];
  return getEntries().filter(e => {
    if (e.is_range && e.date_start && e.date_end) {
      const start = parseDate(e.date_start);
      const end   = parseDate(e.date_end);
      return start && end && d >= start && d <= end;
    }
    // Exact date match
    if (e.date === dateStr) return true;
    // Recurring occurrence check
    if (e.recurring && e.recurring_frequency && e.date) {
      return isRecurringOccurrence(e, dateStr);
    }
    return false;
  });
}

// Returns true if a recurring entry falls on the given dateStr
function isRecurringOccurrence(entry, dateStr) {
  const origin = parseDate(entry.date);
  const target = parseDate(dateStr);
  if (!origin || !target) return false;
  // Don't show on the origin date itself — already matched by exact date check
  if (dateStr === entry.date) return false;
  // Don't recur before origin
  if (target < origin) return false;

  const diffMs   = target - origin;
  const diffDays = Math.round(diffMs / 86400000);

  switch (entry.recurring_frequency) {
    case 'daily': {
      // Every day after origin
      return diffDays > 0;
    }
    case 'weekly': {
      // Same day of week, every 7 days
      return diffDays > 0 && diffDays % 7 === 0;
    }
    case 'biweekly': {
      // Same day of week, every 14 days
      return diffDays > 0 && diffDays % 14 === 0;
    }
    case 'monthly': {
      // Same day of month, any month after origin
      return target.getDate() === origin.getDate()
        && (target.getFullYear() > origin.getFullYear()
          || (target.getFullYear() === origin.getFullYear()
            && target.getMonth() > origin.getMonth()));
    }
    case 'annually': {
      // Same month and day, any year after origin
      return target.getMonth() === origin.getMonth()
        && target.getDate()  === origin.getDate()
        && target.getFullYear() > origin.getFullYear();
    }
    default:
      return false;
  }
}

// Get all range entries that overlap with the current month view
function getRangeEntriesForMonth(year, month) {
  const monthStart = new Date(year, month, 1);
  const monthEnd   = new Date(year, month + 1, 0);
  return getEntries().filter(e => {
    if (!e.is_range || !e.date_start || !e.date_end) return false;
    const start = parseDate(e.date_start);
    const end   = parseDate(e.date_end);
    return start && end && start <= monthEnd && end >= monthStart;
  });
}

// Pressure weight — for sorting and visual priority
function pressureWeight(entry) {
  if (entry.type === 'user_entry') return 1;
  if (entry.pressure === 'warning') return 0;
  if (entry.pressure === 'caution') return 2;
  return 3; // info
}

// Does a day have any warning-pressure signals?
function dayHasWarning(dateStr) {
  return getEntriesForDay(dateStr).some(
    e => e.type === 'domain_signal' && e.pressure === 'warning'
  );
}

// Does a day have any entries at all?
function dayHasEntries(dateStr) {
  return getEntriesForDay(dateStr).length > 0;
}


// ---------------------------------------------------------------------------
// ENTRY CREATION
// ---------------------------------------------------------------------------

export function addUserEntry(entry) {
  const calendar   = store.get('calendar') || [];
  const isRange    = !!(entry.date_end && entry.date_end !== entry.date_start);
  const newEntry = {
    id:                  newEntryId(),
    type:                'user_entry',
    title:               entry.title.trim(),
    // For point-in-time entries: date is set, date_start/date_end are null.
    // For range entries: date equals date_start (for backward compat),
    //   date_start and date_end define the span, is_range is true.
    date:                entry.date_start || entry.date,
    date_start:          isRange ? entry.date_start : null,
    date_end:            isRange ? entry.date_end   : null,
    is_range:            isRange,
    time_start:          entry.time_start || null,
    time_end:            entry.time_end   || null,
    all_day:             !entry.time_start,
    notes:               entry.notes || '',
    recurring:           entry.recurring || false,
    recurring_frequency: entry.recurring ? (entry.recurring_frequency || null) : null,
    // recurring_frequency values: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'annually'
    source:              'user',
    domain:              null,
    created_at:          new Date().toISOString(),
  };
  store.set('calendar', [...calendar, newEntry]);
  return newEntry;
}

export function deleteUserEntry(entryId) {
  const calendar = store.get('calendar') || [];
  store.set('calendar', calendar.filter(e => e.id !== entryId || e.type !== 'user_entry'));
}

export function updateUserEntry(entryId, updates) {
  const calendar = store.get('calendar') || [];
  const isRange  = !!(updates.date_end && updates.date_end !== updates.date_start);
  store.set('calendar', calendar.map(e => {
    if (e.id !== entryId || e.type !== 'user_entry') return e;
    return {
      ...e,
      title:               updates.title.trim(),
      date:                updates.date_start || updates.date,
      date_start:          isRange ? updates.date_start : null,
      date_end:            isRange ? updates.date_end   : null,
      is_range:            isRange,
      time_start:          updates.time_start || null,
      time_end:            updates.time_end   || null,
      all_day:             !updates.time_start,
      notes:               updates.notes || '',
      recurring:           updates.recurring || false,
      recurring_frequency: updates.recurring ? (updates.recurring_frequency || e.recurring_frequency || null) : null,
      updated_at:          new Date().toISOString(),
    };
  }));
}


// ---------------------------------------------------------------------------
// MAIN MODULE — createCalendar
//
// Mounts the full calendar domain over #app (same pattern as cascade panels).
// home.js calls this when the calendar hotspot is tapped.
//
// Usage:
//   import { createCalendar } from './calendar.js';
//   const cal = createCalendar({ onClose: () => {} });
//   cal.open(document.getElementById('app'));
// ---------------------------------------------------------------------------

export function createCalendar({ onClose, initialDate } = {}) {

  let viewDate     = new Date();   // month currently shown in grid
  let selectedDay  = initialDate || null;  // ISO date string — open to this day if provided
  let addingEntry  = false;        // entry form open
  let editingEntry  = null;          // entry object being edited, null when not editing
  let jumpPickerOpen = false;      // month/year jump picker overlay open
  let el           = null;         // the mounted DOM element

  // If opening to a specific date, show that month
  if (initialDate) {
    const d = new Date(initialDate + 'T00:00:00');
    viewDate = new Date(d.getFullYear(), d.getMonth(), 1);
  } else {
    viewDate.setDate(1);
    viewDate.setHours(0, 0, 0, 0);
  }

  // ── Open / close ──────────────────────────────────────────────────────────

  function open(container) {
    el = document.createElement('div');
    el.id = 'screen-calendar';
    el.style.cssText = [
      'position:absolute;inset:0;',
      'background:#000;',
      'z-index:100;',
      'display:flex;flex-direction:column;',
      'opacity:0;transition:opacity 0.25s ease;',
    ].join('');

    render();
    container.appendChild(el);

    requestAnimationFrame(() => { el.style.opacity = '1'; });

    // Re-render when store.calendar changes
    el._unsub = store.subscribe((state, key) => {
      const keys = Array.isArray(key) ? key : [key];
      if (keys.includes('calendar')) render();
    });
  }

  function close() {
    if (!el) return;
    if (el._unsub) { el._unsub(); el._unsub = null; }
    el.style.opacity = '0';
    setTimeout(() => {
      el.remove();
      el = null;
      if (onClose) onClose();
    }, 260);
  }

  // ── Main render ───────────────────────────────────────────────────────────

  function render() {
    if (!el) return;
    el.innerHTML = '';

    // Inject keyframes once
    injectKeyframes();

    // Layer 1 — header (month nav + close)
    el.appendChild(buildHeader());

    // Layer 1b — jump picker overlay (if open)
    if (jumpPickerOpen) {
      el.appendChild(buildJumpPicker());
      return; // picker replaces the rest of the calendar until dismissed
    }

    // Layer 2 — week day labels
    el.appendChild(buildWeekLabels());

    // Layer 3 — month grid
    el.appendChild(buildGrid());

    // Layer 4 — day view (if a day is selected)
    if (selectedDay) {
      el.appendChild(buildDayView(selectedDay));
    }

    // Layer 5 — entry form (if adding)
    if (editingEntry) {
      el.appendChild(buildEntryForm(editingEntry.date || editingEntry.date_start, editingEntry));
    } else if (addingEntry) {
      el.appendChild(buildEntryForm(selectedDay));
    }
  }

  // ── Header ────────────────────────────────────────────────────────────────

  // ── Jump picker — tap month/year label to open ───────────────────────────
  // Month grid on top. Decade accordion below.
  // Current decade open by default. Tap decade to expand. Tap year to select.

  function buildJumpPicker() {
    const currentYear  = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const currentDecade = Math.floor(currentYear / 10) * 10;

    let pickerYear   = currentYear;
    let pickerMonth  = currentMonth;
    let openDecade   = currentDecade;  // which decade is expanded

    const wrap = document.createElement('div');
    wrap.style.cssText = [
      'position:absolute;inset:0;background:#000;z-index:200;',
      'display:flex;flex-direction:column;overflow:hidden;',
      'padding:max(52px, calc(var(--safe-top,0px) + 28px)) 0 max(24px, var(--safe-bottom,0px));',
    ].join('');

    // ── Header ────────────────────────────────────────────────────────────
    const head = document.createElement('div');
    head.style.cssText = [
      'display:flex;justify-content:space-between;align-items:center;',
      'padding:0 28px;margin-bottom:24px;flex-shrink:0;',
    ].join('');

    const title = document.createElement('div');
    title.style.cssText = [
      'font-family:var(--font-serif);font-style:italic;font-weight:300;',
      'font-size:clamp(20px,5vw,26px);color:rgba(240,235,218,0.92);',
    ].join('');
    title.textContent = 'Go to';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'cancel';
    cancelBtn.style.cssText = [
      'font-family:var(--font-sans);font-weight:200;',
      'font-size:10px;letter-spacing:0.22em;text-transform:uppercase;',
      'color:rgba(240,235,218,0.3);padding:8px;',
    ].join('');
    cancelBtn.addEventListener('click', () => { jumpPickerOpen = false; render(); });

    head.appendChild(title);
    head.appendChild(cancelBtn);
    wrap.appendChild(head);

    // ── Month grid ────────────────────────────────────────────────────────
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthGrid  = document.createElement('div');
    monthGrid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:0 28px;margin-bottom:28px;flex-shrink:0;';

    function renderMonthGrid() {
      monthGrid.innerHTML = '';
      monthNames.forEach((name, i) => {
        const isSelected = i === pickerMonth;
        const btn = document.createElement('button');
        btn.textContent  = name;
        btn.style.cssText = [
          'font-family:var(--font-sans);font-weight:200;',
          'font-size:11px;letter-spacing:0.1em;text-transform:uppercase;',
          'padding:9px 4px;border-radius:2px;border:0.5px solid;transition:all 0.15s;',
          isSelected
            ? 'color:rgba(210,160,60,0.95);border-color:rgba(210,160,60,0.4);background:rgba(210,160,60,0.1);'
            : 'color:rgba(240,235,218,0.4);border-color:rgba(240,235,218,0.08);background:transparent;',
        ].join('');
        btn.addEventListener('click', () => { pickerMonth = i; renderMonthGrid(); });
        monthGrid.appendChild(btn);
      });
    }
    renderMonthGrid();
    wrap.appendChild(monthGrid);

    // ── Divider ───────────────────────────────────────────────────────────
    const divider = document.createElement('div');
    divider.style.cssText = 'height:0.5px;background:rgba(240,235,218,0.07);margin:0 28px 20px;flex-shrink:0;';
    wrap.appendChild(divider);

    // ── Decade accordion ──────────────────────────────────────────────────
    const accordionScroll = document.createElement('div');
    accordionScroll.style.cssText = 'flex:1;overflow-y:auto;padding:0 28px 8px;-webkit-overflow-scrolling:touch;';

    // Build decades from current+1 down to 1940s
    const decades = [];
    const topDecade = currentDecade + 10; // one future decade
    for (let d = topDecade; d >= 1940; d -= 10) {
      decades.push(d);
    }

    function renderAccordion() {
      accordionScroll.innerHTML = '';

      decades.forEach(decadeStart => {
        const decadeEnd  = decadeStart + 9;
        const isOpen     = decadeStart === openDecade;
        const label      = `${decadeStart}s`;

        // Decade row
        const decadeRow = document.createElement('button');
        decadeRow.style.cssText = [
          'width:100%;display:flex;justify-content:space-between;align-items:center;',
          'padding:12px 0;border-bottom:0.5px solid rgba(240,235,218,0.06);',
          'font-family:var(--font-sans);font-weight:200;',
          'font-size:12px;letter-spacing:0.12em;text-transform:uppercase;',
          isOpen
            ? 'color:rgba(240,235,218,0.7);'
            : 'color:rgba(240,235,218,0.3);',
          'transition:color 0.15s;',
        ].join('');

        const decadeLabel = document.createElement('span');
        decadeLabel.textContent = label;

        const chevron = document.createElement('span');
        chevron.textContent = isOpen ? '▴' : '▾';
        chevron.style.cssText = 'font-size:9px;color:rgba(240,235,218,0.2);';

        decadeRow.appendChild(decadeLabel);
        decadeRow.appendChild(chevron);

        decadeRow.addEventListener('click', () => {
          openDecade = isOpen ? null : decadeStart;
          renderAccordion();
        });

        accordionScroll.appendChild(decadeRow);

        // Year grid — shown when decade is open
        if (isOpen) {
          const yearGrid = document.createElement('div');
          yearGrid.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:12px 0 8px;';

          for (let y = decadeStart; y <= Math.min(decadeEnd, currentYear + 5); y++) {
            const isSelected = y === pickerYear;
            const isCurrent  = y === currentYear;

            const yBtn = document.createElement('button');
            yBtn.textContent = y;
            yBtn.style.cssText = [
              'font-family:var(--font-sans);font-weight:200;',
              'font-size:12px;letter-spacing:0.03em;',
              'padding:9px 4px;border-radius:2px;border:0.5px solid;transition:all 0.15s;',
              isSelected
                ? 'color:rgba(210,160,60,0.95);border-color:rgba(210,160,60,0.4);background:rgba(210,160,60,0.1);'
                : isCurrent
                  ? 'color:rgba(240,235,218,0.75);border-color:rgba(240,235,218,0.25);background:transparent;'
                  : 'color:rgba(240,235,218,0.4);border-color:rgba(240,235,218,0.08);background:transparent;',
            ].join('');

            yBtn.addEventListener('click', () => {
              pickerYear = y;
              renderMonthGrid();
              renderAccordion();
            });

            yearGrid.appendChild(yBtn);
          }

          accordionScroll.appendChild(yearGrid);
        }
      });
    }

    renderAccordion();
    wrap.appendChild(accordionScroll);

    // ── Go button ──────────────────────────────────────────────────────────
    const goWrap = document.createElement('div');
    goWrap.style.cssText = 'padding:16px 28px 0;flex-shrink:0;';

    const goBtn = document.createElement('button');
    goBtn.style.cssText = [
      'width:100%;',
      'font-family:var(--font-sans);font-weight:300;',
      'font-size:11px;letter-spacing:0.2em;text-transform:uppercase;',
      'color:rgba(240,235,218,0.8);',
      'border:0.5px solid rgba(240,235,218,0.25);border-radius:2px;',
      'padding:14px;transition:all 0.2s;',
    ].join('');
    goBtn.textContent = 'Go';
    goBtn.addEventListener('click', () => {
      viewDate       = new Date(pickerYear, pickerMonth, 1);
      selectedDay    = null;
      addingEntry    = false;
      jumpPickerOpen = false;
      render();
    });
    goBtn.addEventListener('mouseenter', () => {
      goBtn.style.color = 'rgba(240,235,218,1)';
      goBtn.style.borderColor = 'rgba(240,235,218,0.5)';
    });
    goBtn.addEventListener('mouseleave', () => {
      goBtn.style.color = 'rgba(240,235,218,0.8)';
      goBtn.style.borderColor = 'rgba(240,235,218,0.25)';
    });

    goWrap.appendChild(goBtn);
    wrap.appendChild(goWrap);

    return wrap;
  }

  function buildHeader() {
    const div = document.createElement('div');
    div.style.cssText = [
      'display:flex;justify-content:space-between;align-items:center;',
      'padding:max(52px, calc(var(--safe-top,0px) + 28px)) 28px 16px;',
      'flex-shrink:0;',
    ].join('');

    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:20px;">
        <button id="cal-prev" style="
          font-family:var(--font-sans);font-weight:200;
          font-size:18px;color:rgba(240,235,218,0.4);
          padding:4px 8px;transition:color 0.2s;
        ">‹</button>
        <button id="cal-month-label" style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(20px,5vw,26px);
          color:rgba(240,235,218,0.92);
          min-width:180px;text-align:center;
          background:none;border:none;cursor:pointer;
          transition:color 0.2s;
        ">${formatMonthYear(viewDate)}<span style="
          font-family:var(--font-sans);font-size:10px;
          letter-spacing:0.15em;color:rgba(240,235,218,0.25);
          margin-left:8px;vertical-align:middle;
        ">▾</span></button>
        <button id="cal-next" style="
          font-family:var(--font-sans);font-weight:200;
          font-size:18px;color:rgba(240,235,218,0.4);
          padding:4px 8px;transition:color 0.2s;
        ">›</button>
      </div>
      <button id="cal-close" style="
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.22em;text-transform:uppercase;
        color:rgba(240,235,218,0.3);padding:8px;
        transition:color 0.2s;
      ">close</button>
    `;

    div.querySelector('#cal-prev').addEventListener('click', () => {
      viewDate.setMonth(viewDate.getMonth() - 1);
      selectedDay = null;
      addingEntry = false;
      render();
    });
    div.querySelector('#cal-next').addEventListener('click', () => {
      viewDate.setMonth(viewDate.getMonth() + 1);
      selectedDay = null;
      addingEntry = false;
      render();
    });
    div.querySelector('#cal-close').addEventListener('click', close);
    div.querySelector('#cal-month-label').addEventListener('click', () => {
      jumpPickerOpen = !jumpPickerOpen;
      render();
    });

    // Hover states
    ['#cal-prev','#cal-next'].forEach(id => {
      const btn = div.querySelector(id);
      btn.addEventListener('mouseenter', () => btn.style.color = 'rgba(240,235,218,0.8)');
      btn.addEventListener('mouseleave', () => btn.style.color = 'rgba(240,235,218,0.4)');
    });
    const closeBtn = div.querySelector('#cal-close');
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.color = 'rgba(240,235,218,0.7)');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.color = 'rgba(240,235,218,0.3)');

    return div;
  }

  // ── Week day labels ───────────────────────────────────────────────────────

  function buildWeekLabels() {
    const div = document.createElement('div');
    div.style.cssText = [
      'display:grid;grid-template-columns:repeat(7,1fr);',
      'padding:0 20px;margin-bottom:4px;flex-shrink:0;',
    ].join('');

    ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => {
      const cell = document.createElement('div');
      cell.style.cssText = [
        'text-align:center;',
        'font-family:var(--font-sans);font-weight:200;',
        'font-size:9px;letter-spacing:0.2em;text-transform:uppercase;',
        'color:rgba(240,235,218,0.25);',
        'padding:4px 0;',
      ].join('');
      cell.textContent = d;
      div.appendChild(cell);
    });

    return div;
  }

  // ── Month grid ────────────────────────────────────────────────────────────
  //
  // Two-layer rendering:
  //   Layer 1 — range bars: positioned behind day numbers, span multiple cells
  //   Layer 2 — day cells: tap targets with numbers and point-in-time indicators
  //
  // Range bars use absolute positioning within a relative wrapper.
  // Each bar is computed from the grid column positions of its start and end days.

  function buildGrid() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = [
      'position:relative;',
      'padding:0 20px;',
      'flex-shrink:0;',
    ].join('');

    const todayDate   = today();
    const year        = viewDate.getFullYear();
    const month       = viewDate.getMonth();
    const firstDay    = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cellH       = 46; // px — height per row including gap

    // Grid element — day cells
    const grid = document.createElement('div');
    grid.style.cssText = [
      'display:grid;grid-template-columns:repeat(7,1fr);',
      'gap:2px 0;',
      'position:relative;z-index:1;',
    ].join('');

    // Empty cells before the 1st
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.style.cssText = 'height:44px;';
      grid.appendChild(empty);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const date       = new Date(year, month, d);
      const dateStr    = toISO(date);
      const isToday    = sameDay(date, todayDate);
      const isSelected = dateStr === selectedDay;
      const hasEntries = dayHasEntries(dateStr);
      const hasWarning = dayHasWarning(dateStr);
      const isPast     = date < todayDate && !isToday;
      const inRange    = _dayIsInAnyRange(dateStr);

      const cell = document.createElement('button');
      cell.style.cssText = [
        'position:relative;',
        'height:44px;',
        'display:flex;flex-direction:column;align-items:center;justify-content:center;',
        'border:none;background:transparent;cursor:pointer;',
        '-webkit-tap-highlight-color:transparent;',
        'border-radius:4px;',
        isSelected ? 'background:rgba(240,235,218,0.1);' : '',
        'transition:background 0.15s ease;',
      ].join('');

      // Day number
      const num = document.createElement('div');
      num.style.cssText = [
        'font-family:var(--font-sans);font-weight:300;',
        'font-size:14px;letter-spacing:0.02em;',
        isToday
          ? 'color:rgba(240,235,218,0.95);'
          : isPast
            ? 'color:rgba(240,235,218,0.25);'
            : inRange
              ? 'color:rgba(240,235,218,0.85);'
              : 'color:rgba(240,235,218,0.7);',
      ].join('');
      num.textContent = d;
      cell.appendChild(num);

      // Today dot
      if (isToday) {
        const dot = document.createElement('div');
        dot.style.cssText = [
          'position:absolute;bottom:6px;left:50%;transform:translateX(-50%);',
          'width:3px;height:3px;border-radius:50%;',
          'background:rgba(240,235,218,0.7);',
        ].join('');
        cell.appendChild(dot);
      }

      // Point-in-time entry indicator (not shown for range days — bar handles that)
      if (hasEntries && !isToday) {
        const nonRangeEntries = getEntriesForDay(dateStr).filter(e => !e.is_range);
        if (nonRangeEntries.length > 0) {
          const dot = document.createElement('div');
          dot.style.cssText = [
            'position:absolute;bottom:6px;left:50%;transform:translateX(-50%);',
            'width:3px;height:3px;border-radius:50%;',
            hasWarning
              ? 'background:rgba(220,60,60,0.8);'
              : 'background:rgba(210,160,60,0.6);',
          ].join('');
          cell.appendChild(dot);
        }
      }

      cell.addEventListener('click', () => {
        selectedDay = isSelected ? null : dateStr;
        addingEntry = false;
        render();
      });
      cell.addEventListener('mouseenter', () => {
        if (!isSelected) cell.style.background = 'rgba(240,235,218,0.05)';
      });
      cell.addEventListener('mouseleave', () => {
        if (!isSelected) cell.style.background = 'transparent';
      });

      grid.appendChild(cell);
    }

    wrapper.appendChild(grid);

    // ── Range bars — absolutely positioned behind day cells ─────────────────
    // Each range entry gets a bar rendered per visible row it spans.
    // Bars are layered below the grid (z-index:0) so day taps still work.

    const rangeEntries = getRangeEntriesForMonth(year, month);
    const totalCells   = firstDay + daysInMonth;
    const numRows      = Math.ceil(totalCells / 7);

    // Bar layer — same dimensions as the grid, sits behind it
    const barLayer = document.createElement('div');
    barLayer.style.cssText = [
      'position:absolute;top:0;left:20px;right:20px;',
      `height:${numRows * cellH}px;`,
      'pointer-events:none;z-index:0;',
    ].join('');

    rangeEntries.forEach((entry, entryIdx) => {
      const rangeStart  = parseDate(entry.date_start);
      const rangeEnd    = parseDate(entry.date_end);
      const monthStart  = new Date(year, month, 1);
      const monthEnd    = new Date(year, month + 1, 0);

      // Clamp to visible month
      const visStart    = rangeStart < monthStart ? monthStart : rangeStart;
      const visEnd      = rangeEnd   > monthEnd   ? monthEnd   : rangeEnd;

      const startDay    = visStart.getDate();
      const endDay      = visEnd.getDate();

      // Grid positions (0-indexed from Sunday col 0)
      const startCell   = firstDay + startDay - 1;
      const endCell     = firstDay + endDay - 1;

      // Vertical offset per stacked range (up to 3 bars per day)
      const barH        = 4;
      const barGap      = 2;
      const barOffset   = entryIdx % 3; // stack up to 3 ranges
      const barTop      = 6 + barOffset * (barH + barGap); // px from top of cell

      // Draw bar row by row across weeks
      let cell = startCell;
      while (cell <= endCell) {
        const rowStart   = Math.floor(cell / 7) * 7;
        const rowEnd     = rowStart + 6;
        const segStart   = cell;
        const segEnd     = Math.min(endCell, rowEnd);
        const row        = Math.floor(cell / 7);

        const colStart   = segStart % 7;  // 0–6
        const colSpan    = segEnd - segStart + 1;
        const colW       = 100 / 7;       // % width of one column

        const isFirst    = cell === startCell;
        const isLast     = segEnd === endCell;

        const bar = document.createElement('div');
        bar.style.cssText = [
          'position:absolute;',
          `top:${row * cellH + barTop}px;`,
          `left:${colStart * colW}%;`,
          `width:${colSpan * colW}%;`,
          `height:${barH}px;`,
          'background:rgba(180,200,240,0.25);',
          `border-radius:${isFirst ? '2px' : '0'} ${isLast ? '2px' : '0'} ${isLast ? '2px' : '0'} ${isFirst ? '2px' : '0'};`,
        ].join('');

        // Label on the first segment of the bar
        if (isFirst) {
          bar.title = entry.title;
          const label = document.createElement('span');
          label.style.cssText = [
            'position:absolute;left:6px;top:50%;transform:translateY(-50%);',
            'font-family:var(--font-sans);font-weight:200;',
            'font-size:8px;letter-spacing:0.06em;',
            'color:rgba(180,200,240,0.7);',
            'white-space:nowrap;overflow:hidden;',
            `max-width:${colSpan * colW - 8}%;`,
          ].join('');
          label.textContent = entry.title;
          bar.appendChild(label);
        }

        barLayer.appendChild(bar);
        cell = rowEnd + 1; // next row
      }
    });

    wrapper.appendChild(barLayer);
    return wrapper;
  }

  // Returns true if this date falls inside any range entry
  function _dayIsInAnyRange(dateStr) {
    const d = parseDate(dateStr);
    if (!d) return false;
    return (store.get('calendar') || []).some(e => {
      if (!e.is_range || !e.date_start || !e.date_end) return false;
      const start = parseDate(e.date_start);
      const end   = parseDate(e.date_end);
      return start && end && d >= start && d <= end;
    });
  }

  // ── Day view ──────────────────────────────────────────────────────────────

  function buildDayView(dateStr) {
    const container = document.createElement('div');
    container.style.cssText = [
      'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;',
      'border-top:0.5px solid rgba(240,235,218,0.1);',
      'margin-top:16px;',
      'padding:20px 28px;',
      'display:flex;flex-direction:column;',
    ].join('');

    const date    = parseDate(dateStr);
    const entries = getEntriesForDay(dateStr)
      .sort((a, b) => pressureWeight(a) - pressureWeight(b));

    // Day heading + add button
    const heading = document.createElement('div');
    heading.style.cssText = [
      'display:flex;justify-content:space-between;align-items:center;',
      'margin-bottom:16px;',
    ].join('');
    heading.innerHTML = `
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:11px;letter-spacing:0.2em;text-transform:uppercase;
        color:rgba(240,235,218,0.4);
      ">${formatDayHeading(date)}</div>
      <button id="cal-add-entry" style="
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.22em;text-transform:uppercase;
        color:rgba(240,235,218,0.3);
        border:0.5px solid rgba(240,235,218,0.15);border-radius:2px;
        padding:6px 12px;transition:all 0.2s;
      ">+ add</button>
    `;

    const addBtn = heading.querySelector('#cal-add-entry');
    addBtn.addEventListener('click', () => { addingEntry = true; render(); });
    addBtn.addEventListener('mouseenter', () => {
      addBtn.style.color = 'rgba(240,235,218,0.7)';
      addBtn.style.borderColor = 'rgba(240,235,218,0.35)';
    });
    addBtn.addEventListener('mouseleave', () => {
      addBtn.style.color = 'rgba(240,235,218,0.3)';
      addBtn.style.borderColor = 'rgba(240,235,218,0.15)';
    });

    container.appendChild(heading);

    // Entries list
    if (entries.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = [
        'font-family:var(--font-sans);font-weight:200;',
        'font-size:12px;letter-spacing:0.06em;',
        'color:rgba(240,235,218,0.2);',
        'padding:12px 0;',
      ].join('');
      empty.textContent = 'Nothing on this day';
      container.appendChild(empty);
    } else {
      entries.forEach(entry => {
        container.appendChild(buildEntryRow(entry));
      });
    }

    return container;
  }

  // Individual entry row in the day view
  function buildEntryRow(entry) {
    const row = document.createElement('div');
    const isSignal   = entry.type === 'domain_signal';
    const isWarning  = entry.pressure === 'warning';
    const isCaution  = entry.pressure === 'caution';
    const timeStr    = formatTimeRange(entry);

    row.style.cssText = [
      'display:flex;align-items:flex-start;gap:12px;',
      'padding:14px 0;',
      'border-bottom:0.5px solid rgba(240,235,218,0.06);',
      isSignal && isWarning
        ? 'border-left:2px solid rgba(220,60,60,0.6);padding-left:12px;'
        : isSignal && isCaution
          ? 'border-left:2px solid rgba(210,160,60,0.5);padding-left:12px;'
          : isSignal
            ? 'border-left:2px solid rgba(240,235,218,0.15);padding-left:12px;'
            : 'border-left:2px solid rgba(240,235,218,0.08);padding-left:12px;',
    ].join('');

    const main = document.createElement('div');
    main.style.cssText = 'flex:1;';

    // Title
    const title = document.createElement('div');
    title.style.cssText = [
      'font-family:var(--font-sans);font-weight:300;',
      'font-size:13px;letter-spacing:0.04em;',
      isSignal && (isWarning || isCaution)
        ? 'color:rgba(240,235,218,0.85);'
        : 'color:rgba(240,235,218,0.65);',
      'margin-bottom:3px;',
      isSignal ? 'cursor:pointer;transition:color 0.15s;' : '',
    ].join('');
    title.textContent = entry.title;

    if (isSignal) {
      title.innerHTML += `<span style="font-size:10px;letter-spacing:0.15em;color:rgba(240,235,218,0.2);margin-left:8px;">view →</span>`;
      title.addEventListener('click', () => _routeToSignalDomain(entry));
      title.addEventListener('mouseenter', () => title.style.color = 'rgba(210,160,60,0.9)');
      title.addEventListener('mouseleave', () => title.style.color = isWarning || isCaution ? 'rgba(240,235,218,0.85)' : 'rgba(240,235,218,0.65)');
    }

    main.appendChild(title);

    // Subtitle line — time or domain label
    const sub = document.createElement('div');
    sub.style.cssText = [
      'font-family:var(--font-sans);font-weight:200;',
      'font-size:11px;letter-spacing:0.06em;',
      'color:rgba(240,235,218,0.3);',
    ].join('');

    if (isSignal) {
      sub.textContent = _domainLabel(entry.domain);
    } else if (timeStr) {
      sub.textContent = timeStr;
    } else {
      sub.textContent = 'All day';
    }
    main.appendChild(sub);

    // Notes — shown inline if present
    if (!isSignal && entry.notes && entry.notes.trim()) {
      const notes = document.createElement('div');
      notes.style.cssText = [
        'font-family:var(--font-sans);font-weight:200;',
        'font-size:12px;letter-spacing:0.03em;line-height:1.5;',
        'color:rgba(240,235,218,0.45);',
        'margin-top:8px;white-space:pre-wrap;',
      ].join('');
      notes.textContent = entry.notes.trim();
      main.appendChild(notes);
    }

    // Recurring badge
    if (!isSignal && entry.recurring && entry.recurring_frequency) {
      const badge = document.createElement('div');
      badge.style.cssText = [
        'display:inline-block;margin-top:6px;',
        'font-family:var(--font-sans);font-weight:200;',
        'font-size:9px;letter-spacing:0.15em;text-transform:uppercase;',
        'color:rgba(240,235,218,0.2);',
      ].join('');
      badge.textContent = `↻ ${entry.recurring_frequency}`;
      main.appendChild(badge);
    }

    row.appendChild(main);

    // Edit + Delete buttons — user entries only
    if (!isSignal) {
      const btnWrap = document.createElement('div');
      btnWrap.style.cssText = 'display:flex;gap:6px;align-self:center;flex-shrink:0;';

      const edit = document.createElement('button');
      edit.style.cssText = [
        'font-family:var(--font-sans);font-weight:200;',
        'font-size:9px;letter-spacing:0.2em;text-transform:uppercase;',
        'color:rgba(240,235,218,0.3);',
        'border:0.5px solid rgba(240,235,218,0.15);border-radius:1px;',
        'padding:4px 8px;transition:all 0.2s;white-space:nowrap;',
      ].join('');
      edit.textContent = 'edit';
      edit.addEventListener('click', () => {
        editingEntry = entry;
        addingEntry  = false;
        render();
      });
      edit.addEventListener('mouseenter', () => {
        edit.style.color = 'rgba(240,235,218,0.7)';
        edit.style.borderColor = 'rgba(240,235,218,0.35)';
      });
      edit.addEventListener('mouseleave', () => {
        edit.style.color = 'rgba(240,235,218,0.3)';
        edit.style.borderColor = 'rgba(240,235,218,0.15)';
      });

      const del = document.createElement('button');
      del.style.cssText = [
        'font-family:var(--font-sans);font-weight:200;',
        'font-size:9px;letter-spacing:0.2em;text-transform:uppercase;',
        'color:rgba(240,235,218,0.2);',
        'border:0.5px solid rgba(240,235,218,0.1);border-radius:1px;',
        'padding:4px 8px;transition:all 0.2s;white-space:nowrap;',
      ].join('');
      del.textContent = 'remove';
      let confirmPending = false;
      let confirmTimer   = null;

      del.addEventListener('click', () => {
        if (confirmPending) {
          clearTimeout(confirmTimer);
          deleteUserEntry(entry.id);
        } else {
          confirmPending      = true;
          del.textContent     = 'sure?';
          del.style.color     = 'rgba(240,235,218,0.7)';
          del.style.borderColor = 'rgba(240,235,218,0.35)';
          // Auto-reset after 3 seconds if user doesn't confirm
          confirmTimer = setTimeout(() => {
            confirmPending      = false;
            del.textContent     = 'remove';
            del.style.color     = 'rgba(240,235,218,0.2)';
            del.style.borderColor = 'rgba(240,235,218,0.1)';
          }, 3000);
        }
      });
      del.addEventListener('mouseenter', () => {
        if (!confirmPending) {
          del.style.color = 'rgba(240,235,218,0.5)';
          del.style.borderColor = 'rgba(240,235,218,0.25)';
        }
      });
      del.addEventListener('mouseleave', () => {
        if (!confirmPending) {
          del.style.color = 'rgba(240,235,218,0.2)';
          del.style.borderColor = 'rgba(240,235,218,0.1)';
        }
      });

      btnWrap.appendChild(edit);
      btnWrap.appendChild(del);
      row.appendChild(btnWrap);
    }

    return row;
  }

  // ── Entry form ────────────────────────────────────────────────────────────

  function buildEntryForm(dateStr, existingEntry = null) {
    const isEditing = !!existingEntry;
    const overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:absolute;inset:0;',
      'background:rgba(0,0,0,0.7);',
      'display:flex;flex-direction:column;justify-content:flex-end;',
      'z-index:10;',
    ].join('');

    const form = document.createElement('div');
    form.style.cssText = [
      'background:linear-gradient(to top, rgba(8,8,8,0.99) 0%, rgba(14,14,14,0.97) 100%);',
      'border-top:0.5px solid rgba(240,235,218,0.1);',
      'border-radius:4px 4px 0 0;',
      'padding:24px 28px max(32px, calc(var(--safe-bottom,0px) + 20px));',
    ].join('');

    // Drag handle
    form.innerHTML = `
      <div style="width:36px;height:3px;border-radius:2px;background:rgba(240,235,218,0.15);margin:0 auto 24px;"></div>
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:9px;letter-spacing:0.35em;text-transform:uppercase;
        color:rgba(240,235,218,0.3);margin-bottom:20px;
      ">${isEditing ? 'Edit entry' : 'Add to ' + formatDayHeading(parseDate(dateStr))}</div>
    `;

    // Title field
    form.appendChild(_buildFormField({
      id:          'entry-title',
      placeholder: 'What is it?',
      type:        'text',
      required:    true,
      value:       existingEntry?.title || '',
    }));

    // ── Date range toggle ────────────────────────────────────────────────────
    let isDateRange = !!(existingEntry?.is_range);

    const rangeToggleWrap = document.createElement('div');
    rangeToggleWrap.style.cssText = [
      'display:flex;align-items:center;justify-content:space-between;',
      'padding:10px 0 10px;',
    ].join('');

    const rangeToggleLabel = document.createElement('div');
    rangeToggleLabel.style.cssText = [
      'font-family:var(--font-sans);font-weight:200;',
      'font-size:12px;letter-spacing:0.06em;',
      'color:rgba(240,235,218,0.4);',
    ].join('');
    rangeToggleLabel.textContent = 'Date range';

    const rangeToggleBtn = document.createElement('button');
    rangeToggleBtn.style.cssText = [
      'position:relative;width:36px;height:20px;border-radius:10px;',
      'background:rgba(240,235,218,0.1);',
      'border:0.5px solid rgba(240,235,218,0.2);',
      'transition:background 0.2s ease, border-color 0.2s ease;',
      'flex-shrink:0;',
    ].join('');
    rangeToggleBtn.innerHTML = `
      <span style="
        position:absolute;top:3px;left:3px;
        width:12px;height:12px;border-radius:50%;
        background:rgba(240,235,218,0.35);
        transition:transform 0.2s ease, background 0.2s ease;
      "></span>
    `;

    // End date field — hidden until range toggle is on
    // ── End date mini calendar picker ────────────────────────────────────────
    let endDate = existingEntry?.date_end || null;  // ISO string, null until selected
    let endPickerView = endDate ? parseDate(endDate) : parseDate(dateStr);

    const endDateWrap = document.createElement('div');
    endDateWrap.style.display = isDateRange ? 'block' : 'none';
    endDateWrap.style.cssText = `display:${isDateRange ? 'block' : 'none'};margin-bottom:16px;`;

    function buildEndDatePicker() {
      endDateWrap.innerHTML = '';

      const year  = endPickerView.getFullYear();
      const month = endPickerView.getMonth();
      const firstDay    = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Mini picker header
      const pickerHead = document.createElement('div');
      pickerHead.style.cssText = [
        'display:flex;align-items:center;justify-content:space-between;',
        'margin-bottom:8px;',
      ].join('');

      const label = document.createElement('div');
      label.style.cssText = [
        'font-family:var(--font-sans);font-weight:200;',
        'font-size:11px;letter-spacing:0.12em;text-transform:uppercase;',
        'color:rgba(240,235,218,0.45);',
      ].join('');
      label.textContent = `End date — ${new Date(year, month).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}`;

      const navWrap = document.createElement('div');
      navWrap.style.cssText = 'display:flex;gap:8px;';

      ['‹', '›'].forEach((arrow, i) => {
        const btn = document.createElement('button');
        btn.textContent = arrow;
        btn.style.cssText = [
          'font-family:var(--font-sans);font-size:14px;',
          'color:rgba(240,235,218,0.3);background:none;border:none;',
          'cursor:pointer;padding:0 2px;line-height:1;',
        ].join('');
        btn.addEventListener('click', () => {
          endPickerView = new Date(year, month + (i === 0 ? -1 : 1), 1);
          buildEndDatePicker();
        });
        navWrap.appendChild(btn);
      });

      pickerHead.appendChild(label);
      pickerHead.appendChild(navWrap);
      endDateWrap.appendChild(pickerHead);

      // Day-of-week row
      const dowRow = document.createElement('div');
      dowRow.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px;';
      ['S','M','T','W','T','F','S'].forEach(d => {
        const cell = document.createElement('div');
        cell.textContent = d;
        cell.style.cssText = [
          'text-align:center;',
          'font-family:var(--font-sans);font-weight:200;',
          'font-size:9px;letter-spacing:0.1em;',
          'color:rgba(240,235,218,0.2);',
          'padding:2px 0;',
        ].join('');
        dowRow.appendChild(cell);
      });
      endDateWrap.appendChild(dowRow);

      // Day grid
      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:2px;';

      // Empty cells before first day
      for (let i = 0; i < firstDay; i++) {
        grid.appendChild(document.createElement('div'));
      }

      const startISO   = dateStr;
      const todayISO   = toISO(new Date());

      for (let d = 1; d <= daysInMonth; d++) {
        const cellISO   = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const isSelected = cellISO === endDate;
        const isStart    = cellISO === startISO;
        const isPast     = cellISO < startISO;
        const isToday    = cellISO === todayISO;

        const cell = document.createElement('div');
        cell.textContent = d;
        cell.style.cssText = [
          'text-align:center;padding:6px 2px;border-radius:2px;',
          'font-family:var(--font-sans);font-weight:300;font-size:12px;',
          isPast
            ? 'color:rgba(240,235,218,0.12);cursor:default;'
            : 'cursor:pointer;',
          isSelected
            ? 'background:rgba(210,160,60,0.25);color:rgba(210,160,60,0.95);'
            : isStart
              ? 'color:rgba(240,235,218,0.35);'
              : isToday
                ? 'color:rgba(240,235,218,0.7);'
                : isPast
                  ? ''
                  : 'color:rgba(240,235,218,0.6);',
          'transition:background 0.15s;',
        ].join('');

        if (!isPast) {
          cell.addEventListener('click', () => {
            endDate = cellISO;
            buildEndDatePicker();
          });
          if (!isSelected) {
            cell.addEventListener('mouseenter', () => cell.style.background = 'rgba(240,235,218,0.06)');
            cell.addEventListener('mouseleave', () => cell.style.background = 'transparent');
          }
        }

        grid.appendChild(cell);
      }

      endDateWrap.appendChild(grid);

      // Show selected date confirmation
      if (endDate) {
        const confirm = document.createElement('div');
        confirm.style.cssText = [
          'margin-top:8px;',
          'font-family:var(--font-sans);font-weight:200;',
          'font-size:11px;letter-spacing:0.06em;',
          'color:rgba(210,160,60,0.7);',
        ].join('');
        confirm.textContent = `Ends ${parseDate(endDate).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        endDateWrap.appendChild(confirm);
      }
    }

    buildEndDatePicker();
    // ── End date mini calendar picker ─────────────────────────────────────────

    rangeToggleBtn.addEventListener('click', () => {
      isDateRange = !isDateRange;
      const knob = rangeToggleBtn.querySelector('span');
      if (isDateRange) {
        rangeToggleBtn.style.background   = 'rgba(180,200,240,0.2)';
        rangeToggleBtn.style.borderColor  = 'rgba(180,200,240,0.5)';
        knob.style.transform              = 'translateX(16px)';
        knob.style.background             = 'rgba(180,200,240,0.9)';
        rangeToggleLabel.style.color      = 'rgba(240,235,218,0.7)';
        endDateWrap.style.display         = 'block';
        buildEndDatePicker();
      } else {
        rangeToggleBtn.style.background   = 'rgba(240,235,218,0.1)';
        rangeToggleBtn.style.borderColor  = 'rgba(240,235,218,0.2)';
        knob.style.transform              = 'translateX(0)';
        knob.style.background             = 'rgba(240,235,218,0.35)';
        rangeToggleLabel.style.color      = 'rgba(240,235,218,0.4)';
        endDateWrap.style.display         = 'none';
        endDate = null;
      }
    });

    rangeToggleWrap.appendChild(rangeToggleLabel);
    rangeToggleWrap.appendChild(rangeToggleBtn);
    form.appendChild(rangeToggleWrap);
    form.appendChild(endDateWrap);
    // ── End date range toggle ─────────────────────────────────────────────────

    // Time start field — hidden for range entries
    const timeStartWrap = _buildFormField({
      id:          'entry-time-start',
      placeholder: 'Start time — optional (e.g. 14:00)',
      type:        'text',
      required:    false,
      value:       existingEntry?.time_start || '',
    });
    form.appendChild(timeStartWrap);

    // Time end field
    const timeEndWrap = _buildFormField({
      id:          'entry-time-end',
      placeholder: 'End time — optional (e.g. 16:00)',
      type:        'text',
      required:    false,
      value:       existingEntry?.time_end || '',
    });
    form.appendChild(timeEndWrap);

    // Notes field
    form.appendChild(_buildFormField({
      id:          'entry-notes',
      placeholder: 'Notes — optional',
      type:        'textarea',
      required:    false,
      value:       existingEntry?.notes || '',
    }));

    // Recurring toggle + frequency selector
    let isRecurring       = !!(existingEntry?.recurring);
    let recurringFrequency = existingEntry?.recurring_frequency || 'weekly';

    const recurringSection = document.createElement('div');
    recurringSection.style.cssText = [
      'border-top:0.5px solid rgba(240,235,218,0.06);',
      'margin-top:4px;padding-top:4px;',
    ].join('');

    // Toggle row
    const recurringWrap = document.createElement('div');
    recurringWrap.style.cssText = [
      'display:flex;align-items:center;justify-content:space-between;',
      'padding:12px 0;',
    ].join('');

    const recurringLabel = document.createElement('div');
    recurringLabel.style.cssText = [
      'font-family:var(--font-sans);font-weight:200;',
      'font-size:12px;letter-spacing:0.06em;',
      'color:rgba(240,235,218,0.4);',
    ].join('');
    recurringLabel.textContent = 'Recurring';

    const recurringToggle = document.createElement('button');
    recurringToggle.style.cssText = [
      'position:relative;width:36px;height:20px;border-radius:10px;',
      'background:rgba(240,235,218,0.1);',
      'border:0.5px solid rgba(240,235,218,0.2);',
      'transition:background 0.2s ease, border-color 0.2s ease;',
      'flex-shrink:0;',
    ].join('');
    recurringToggle.innerHTML = `
      <span style="
        position:absolute;top:3px;left:3px;
        width:12px;height:12px;border-radius:50%;
        background:rgba(240,235,218,0.35);
        transition:transform 0.2s ease, background 0.2s ease;
      "></span>
    `;

    // Frequency selector — shown when recurring is on
    const freqWrap = document.createElement('div');
    freqWrap.style.cssText = [
      'display:flex;gap:8px;padding-bottom:12px;',
      isRecurring ? '' : 'display:none;',
    ].join('');
    freqWrap.style.display = isRecurring ? 'flex' : 'none';

    const frequencies = [
      { value: 'daily',     label: 'Daily' },
      { value: 'weekly',    label: 'Weekly' },
      { value: 'biweekly',  label: 'Biweekly' },
      { value: 'monthly',   label: 'Monthly' },
      { value: 'annually',  label: 'Annually' },
    ];

    function updateFreqButtons() {
      freqWrap.querySelectorAll('[data-freq]').forEach(btn => {
        const active = btn.dataset.freq === recurringFrequency;
        btn.style.color       = active ? 'rgba(210,160,60,0.9)'  : 'rgba(240,235,218,0.3)';
        btn.style.borderColor = active ? 'rgba(210,160,60,0.4)'  : 'rgba(240,235,218,0.12)';
        btn.style.background  = active ? 'rgba(210,160,60,0.08)' : 'transparent';
      });
    }

    frequencies.forEach(({ value, label }) => {
      const btn = document.createElement('button');
      btn.dataset.freq = value;
      btn.textContent  = label;
      btn.style.cssText = [
        'font-family:var(--font-sans);font-weight:200;',
        'font-size:10px;letter-spacing:0.15em;text-transform:uppercase;',
        'border:0.5px solid rgba(240,235,218,0.12);border-radius:1px;',
        'padding:5px 10px;transition:all 0.2s;cursor:pointer;',
      ].join('');
      btn.addEventListener('click', () => {
        recurringFrequency = value;
        updateFreqButtons();
      });
      freqWrap.appendChild(btn);
    });

    updateFreqButtons();

    // Set initial toggle state
    if (isRecurring) {
      const knob = recurringToggle.querySelector('span');
      recurringToggle.style.background  = 'rgba(210,160,60,0.25)';
      recurringToggle.style.borderColor = 'rgba(210,160,60,0.5)';
      knob.style.transform              = 'translateX(16px)';
      knob.style.background             = 'rgba(210,160,60,0.9)';
      recurringLabel.style.color        = 'rgba(240,235,218,0.7)';
    }

    recurringToggle.addEventListener('click', () => {
      isRecurring = !isRecurring;
      const knob  = recurringToggle.querySelector('span');
      if (isRecurring) {
        recurringToggle.style.background  = 'rgba(210,160,60,0.25)';
        recurringToggle.style.borderColor = 'rgba(210,160,60,0.5)';
        knob.style.transform              = 'translateX(16px)';
        knob.style.background             = 'rgba(210,160,60,0.9)';
        recurringLabel.style.color        = 'rgba(240,235,218,0.7)';
        freqWrap.style.display            = 'flex';
      } else {
        recurringToggle.style.background  = 'rgba(240,235,218,0.1)';
        recurringToggle.style.borderColor = 'rgba(240,235,218,0.2)';
        knob.style.transform              = 'translateX(0)';
        knob.style.background             = 'rgba(240,235,218,0.35)';
        recurringLabel.style.color        = 'rgba(240,235,218,0.4)';
        freqWrap.style.display            = 'none';
      }
    });

    recurringWrap.appendChild(recurringLabel);
    recurringWrap.appendChild(recurringToggle);
    recurringSection.appendChild(recurringWrap);
    recurringSection.appendChild(freqWrap);
    form.appendChild(recurringSection);

    // Buttons row
    const btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:12px;margin-top:20px;';

    const saveBtn   = _buildActionBtn('save', 'rgba(240,235,218,0.7)', 'rgba(240,235,218,0.3)');
    const cancelBtn = _buildActionBtn('cancel', 'rgba(240,235,218,0.3)', 'rgba(240,235,218,0.12)');

    saveBtn.addEventListener('click', () => {
      const title = form.querySelector('#entry-title')?.value?.trim();
      if (!title) {
        _shake(form.querySelector('#entry-title'));
        return;
      }

      if (isDateRange) {
        if (!endDate) {
          // Shake the end date picker header as visual feedback
          const pickerHead = endDateWrap.querySelector('div');
          if (pickerHead) _shake(pickerHead);
          return;
        }
        const payload = {
          title,
          date_start:          dateStr,
          date_end:            endDate,
          notes:               form.querySelector('#entry-notes')?.value?.trim() || '',
          recurring:           isRecurring,
          recurring_frequency: isRecurring ? recurringFrequency : null,
        };
        if (isEditing) {
          updateUserEntry(existingEntry.id, payload);
        } else {
          addUserEntry(payload);
        }
      } else {
        const payload = {
          title,
          date:                dateStr,
          date_start:          null,
          date_end:            null,
          time_start:          form.querySelector('#entry-time-start')?.value?.trim() || null,
          time_end:            form.querySelector('#entry-time-end')?.value?.trim()   || null,
          notes:               form.querySelector('#entry-notes')?.value?.trim()      || '',
          recurring:           isRecurring,
          recurring_frequency: isRecurring ? recurringFrequency : null,
        };
        if (isEditing) {
          updateUserEntry(existingEntry.id, payload);
        } else {
          addUserEntry(payload);
        }
      }
      addingEntry  = false;
      editingEntry = null;
      render();
    });

    cancelBtn.addEventListener('click', () => {
      addingEntry  = false;
      editingEntry = null;
      render();
    });

    btns.appendChild(saveBtn);
    btns.appendChild(cancelBtn);
    form.appendChild(btns);

    overlay.appendChild(form);

    // Tap backdrop to cancel
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { addingEntry = false; editingEntry = null; render(); }
    });

    return overlay;
  }

  // ── Form helpers ──────────────────────────────────────────────────────────

  function _buildFormField({ id, placeholder, type, required, value = '' }) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-bottom:12px;';

    const tag = type === 'textarea' ? 'textarea' : 'input';
    const el  = document.createElement(tag);
    el.id     = id;

    if (tag === 'input') {
      el.type = 'text';
      el.autocomplete = 'off';
    } else {
      el.rows = 2;
    }

    el.placeholder = placeholder;
    if (value) el.value = value;
    el.style.cssText = [
      'width:100%;box-sizing:border-box;',
      'background:rgba(240,235,218,0.05);',
      'border:0.5px solid rgba(240,235,218,0.15);border-radius:2px;',
      'padding:12px 14px;',
      'font-family:var(--font-sans);font-weight:300;',
      'font-size:13px;letter-spacing:0.03em;',
      'color:rgba(240,235,218,0.85);',
      'outline:none;',
      tag === 'textarea' ? 'resize:none;' : '',
      'transition:border-color 0.2s;',
    ].join('');

    // Inject placeholder style once
    if (!document.getElementById('cal-input-placeholder-style')) {
      const s = document.createElement('style');
      s.id = 'cal-input-placeholder-style';
      s.textContent = `
        #entry-title::placeholder,
        #entry-time-start::placeholder,
        #entry-time-end::placeholder,
        #entry-notes::placeholder { color: rgba(240,235,218,0.2); }
      `;
      document.head.appendChild(s);
    }

    el.addEventListener('focus', () => el.style.borderColor = 'rgba(240,235,218,0.35)');
    el.addEventListener('blur',  () => el.style.borderColor = 'rgba(240,235,218,0.15)');

    wrap.appendChild(el);
    return wrap;
  }

  function _buildActionBtn(label, color, borderColor) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = [
      'padding:12px 28px;',
      `border:0.5px solid ${borderColor};border-radius:2px;`,
      'font-family:var(--font-sans);font-weight:300;',
      'font-size:11px;letter-spacing:0.28em;text-transform:uppercase;',
      `color:${color};`,
      'transition:all 0.2s;',
    ].join('');
    btn.addEventListener('mouseenter', () => {
      btn.style.opacity = '0.8';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.opacity = '1';
    });
    return btn;
  }

  function _shake(el) {
    if (!el) return;
    el.style.borderColor = 'rgba(220,60,60,0.6)';
    setTimeout(() => { el.style.borderColor = 'rgba(240,235,218,0.15)'; }, 800);
  }

  // ── Signal routing ────────────────────────────────────────────────────────
  // Tapping a domain signal in the day view routes the user to that domain.
  // The calendar closes and home.js re-opens the relevant brief.
  // For now: closes calendar and dispatches a custom event that home.js can catch.

  function _routeToSignalDomain(entry) {
    close();
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('ylu:open-domain', {
        detail: { domain: entry.domain, domain_ref: entry.domain_ref }
      }));
    }, 280);
  }

  function _domainLabel(domain) {
    const labels = {
      vehicles:    'Vehicles',
      maintenance: 'Maintenance',
      health:      'Health',
      team:        'Team',
    };
    return labels[domain] || domain || 'App';
  }

  // ── Keyframes ─────────────────────────────────────────────────────────────

  function injectKeyframes() {
    if (document.getElementById('cal-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'cal-keyframes';
    style.textContent = `
      @keyframes calFadeIn {
        from { opacity:0; transform:translateY(8px); }
        to   { opacity:1; transform:translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return { open, close };
}
