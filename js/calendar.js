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

// Get entries for a specific day
function getEntriesForDay(dateStr) {
  return getEntries().filter(e => e.date === dateStr);
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
  const calendar = store.get('calendar') || [];
  const newEntry = {
    id:         newEntryId(),
    type:       'user_entry',
    title:      entry.title.trim(),
    date:       entry.date,
    time_start: entry.time_start || null,
    time_end:   entry.time_end   || null,
    all_day:    !entry.time_start,
    notes:      entry.notes || '',
    source:     'user',
    domain:     null,
    created_at: new Date().toISOString(),
  };
  store.set('calendar', [...calendar, newEntry]);
  return newEntry;
}

export function deleteUserEntry(entryId) {
  const calendar = store.get('calendar') || [];
  store.set('calendar', calendar.filter(e => e.id !== entryId || e.type !== 'user_entry'));
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

export function createCalendar({ onClose } = {}) {

  let viewDate     = new Date();   // month currently shown in grid
  let selectedDay  = null;         // ISO date string — currently open day view
  let addingEntry  = false;        // entry form open
  let el           = null;         // the mounted DOM element

  viewDate.setDate(1);             // always start at the 1st of the month
  viewDate.setHours(0, 0, 0, 0);

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

    // Layer 2 — week day labels
    el.appendChild(buildWeekLabels());

    // Layer 3 — month grid
    el.appendChild(buildGrid());

    // Layer 4 — day view (if a day is selected)
    if (selectedDay) {
      el.appendChild(buildDayView(selectedDay));
    }

    // Layer 5 — entry form (if adding)
    if (addingEntry) {
      el.appendChild(buildEntryForm(selectedDay));
    }
  }

  // ── Header ────────────────────────────────────────────────────────────────

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
        <div style="
          font-family:var(--font-serif);font-style:italic;font-weight:300;
          font-size:clamp(20px,5vw,26px);
          color:rgba(240,235,218,0.92);
          min-width:180px;text-align:center;
        ">${formatMonthYear(viewDate)}</div>
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

  function buildGrid() {
    const grid = document.createElement('div');
    grid.style.cssText = [
      'display:grid;grid-template-columns:repeat(7,1fr);',
      'padding:0 20px;',
      'flex-shrink:0;',
      'gap:2px 0;',
    ].join('');

    const todayDate  = today();
    const year       = viewDate.getFullYear();
    const month      = viewDate.getMonth();
    const firstDay   = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Empty cells before the 1st
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.style.cssText = 'height:44px;';
      grid.appendChild(empty);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const date      = new Date(year, month, d);
      const dateStr   = toISO(date);
      const isToday   = sameDay(date, todayDate);
      const isSelected = dateStr === selectedDay;
      const hasEntries = dayHasEntries(dateStr);
      const hasWarning = dayHasWarning(dateStr);
      const isPast    = date < todayDate && !isToday;

      const cell = document.createElement('button');
      cell.style.cssText = [
        'position:relative;',
        'height:44px;',
        'display:flex;flex-direction:column;align-items:center;justify-content:center;',
        'border:none;background:transparent;cursor:pointer;',
        '-webkit-tap-highlight-color:transparent;',
        'border-radius:4px;',
        isSelected
          ? 'background:rgba(240,235,218,0.1);'
          : '',
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

      // Entry indicator
      if (hasEntries && !isToday) {
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

    return grid;
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
    row.appendChild(main);

    // Delete button — user entries only
    if (!isSignal) {
      const del = document.createElement('button');
      del.style.cssText = [
        'font-family:var(--font-sans);font-weight:200;',
        'font-size:9px;letter-spacing:0.2em;text-transform:uppercase;',
        'color:rgba(240,235,218,0.2);',
        'border:0.5px solid rgba(240,235,218,0.1);border-radius:1px;',
        'padding:4px 8px;transition:all 0.2s;white-space:nowrap;',
        'align-self:center;',
      ].join('');
      del.textContent = 'remove';
      del.addEventListener('click', () => {
        deleteUserEntry(entry.id);
        // store change triggers re-render via subscription
      });
      del.addEventListener('mouseenter', () => {
        del.style.color = 'rgba(240,235,218,0.5)';
        del.style.borderColor = 'rgba(240,235,218,0.25)';
      });
      del.addEventListener('mouseleave', () => {
        del.style.color = 'rgba(240,235,218,0.2)';
        del.style.borderColor = 'rgba(240,235,218,0.1)';
      });
      row.appendChild(del);
    }

    return row;
  }

  // ── Entry form ────────────────────────────────────────────────────────────

  function buildEntryForm(dateStr) {
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
      ">Add to ${formatDayHeading(parseDate(dateStr))}</div>
    `;

    // Title field
    form.appendChild(_buildFormField({
      id:          'entry-title',
      placeholder: 'What is it?',
      type:        'text',
      required:    true,
    }));

    // Time start field
    form.appendChild(_buildFormField({
      id:          'entry-time-start',
      placeholder: 'Start time — optional (e.g. 14:00)',
      type:        'text',
      required:    false,
    }));

    // Time end field
    form.appendChild(_buildFormField({
      id:          'entry-time-end',
      placeholder: 'End time — optional (e.g. 16:00)',
      type:        'text',
      required:    false,
    }));

    // Notes field
    form.appendChild(_buildFormField({
      id:          'entry-notes',
      placeholder: 'Notes — optional',
      type:        'textarea',
      required:    false,
    }));

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
      addUserEntry({
        title,
        date:       dateStr,
        time_start: form.querySelector('#entry-time-start')?.value?.trim() || null,
        time_end:   form.querySelector('#entry-time-end')?.value?.trim()   || null,
        notes:      form.querySelector('#entry-notes')?.value?.trim()      || '',
      });
      addingEntry = false;
      // store change triggers re-render via subscription
    });

    cancelBtn.addEventListener('click', () => {
      addingEntry = false;
      render();
    });

    btns.appendChild(saveBtn);
    btns.appendChild(cancelBtn);
    form.appendChild(btns);

    overlay.appendChild(form);

    // Tap backdrop to cancel
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { addingEntry = false; render(); }
    });

    return overlay;
  }

  // ── Form helpers ──────────────────────────────────────────────────────────

  function _buildFormField({ id, placeholder, type, required }) {
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
