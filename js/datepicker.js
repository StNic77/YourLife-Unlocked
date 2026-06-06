// ---------------------------------------------------------------------------
// DATEPICKER.JS
// Shared date picker component — used by every date field in the app.
//
// Exports:
//   buildDateField(id, label, isoValue, opts)  → HTML string
//   attachDateListeners(el)                    → void  (call after render)
//   formatDisplayDate(isoStr)                  → human-readable string
//   readDateField(el, id)                      → ISO string or ''
//
// Usage:
//   1. In your HTML template: ${buildDateField('my-date', 'Last done', value)}
//   2. After inserting into DOM: attachDateListeners(containerEl)
//   3. To read the value: readDateField(containerEl, 'my-date')
//      or directly: document.getElementById('my-date').value
//
// The hidden input #id always holds the canonical ISO value (YYYY-MM-DD).
// The text display shows a human-readable version (Jun 6, 2026).
//
// Options (opts):
//   optional  — appends "— optional" to the label
//   future    — disables past dates (calendar entries, appointments)
//   past      — disables future dates (last done, last seen, birthdays)
//   noToday   — hides the Today shortcut button
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// FORMAT HELPER
// Shared across the app — replaces formatDetailDate in cascade.js
// ---------------------------------------------------------------------------

export function formatDisplayDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr + (isoStr.length === 10 ? 'T12:00:00' : ''));
  if (isNaN(d)) return isoStr;
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}


// ---------------------------------------------------------------------------
// READ HELPER
// Reads the canonical ISO value from a rendered date field.
// ---------------------------------------------------------------------------

export function readDateField(container, id) {
  const hidden = container?.querySelector?.(`#${id}`) || document.getElementById(id);
  return hidden?.value?.trim() || '';
}


// ---------------------------------------------------------------------------
// BUILD — returns HTML string
// ---------------------------------------------------------------------------

export function buildDateField(id, label, isoValue = '', opts = {}) {
  const displayVal = isoValue ? formatDisplayDate(isoValue) : '';
  const optStr     = opts.optional
    ? ' <span style="color:rgba(240,235,218,0.15);">— optional</span>'
    : '';
  const modeAttr   = opts.future ? 'data-mode="future"' : opts.past ? 'data-mode="past"' : '';

  return `
    <div class="ylu-date-field" data-field-id="${id}" ${modeAttr} style="margin-bottom:20px;">

      <!-- Label -->
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.2em;text-transform:uppercase;
        color:rgba(240,235,218,0.3);margin-bottom:8px;
      ">${label}${optStr}</div>

      <!-- Display button — shows current value or placeholder, opens picker -->
      <button
        class="ylu-date-display"
        data-target="${id}"
        style="
          width:100%;box-sizing:border-box;
          background:rgba(240,235,218,0.04);
          border:0.5px solid rgba(240,235,218,0.12);
          border-radius:2px 2px 0 0;
          padding:13px 16px;
          display:flex;align-items:center;justify-content:space-between;
          font-family:var(--font-sans);font-weight:300;
          font-size:15px;letter-spacing:0.02em;
          color:${displayVal ? 'rgba(240,235,218,0.88)' : 'rgba(240,235,218,0.25)'};
          cursor:pointer;text-align:left;
          transition:border-color 0.15s ease;
          -webkit-tap-highlight-color:transparent;
        "
        onfocus="this.style.borderColor='rgba(240,235,218,0.3)'"
        onblur="this.style.borderColor='rgba(240,235,218,0.12)'"
      >
        <span class="ylu-date-label" data-target="${id}">${displayVal || 'Select a date'}</span>
        <span style="font-size:11px;color:rgba(240,235,218,0.2);">▾</span>
      </button>

      <!-- Picker panel — hidden by default -->
      <div id="${id}-picker" class="ylu-date-picker" style="
        display:none;
        background:rgba(20,18,14,0.98);
        border:0.5px solid rgba(240,235,218,0.1);
        border-top:none;border-radius:0 0 4px 4px;
        padding:14px;
      ">

        <!-- Today button -->
        ${opts.noToday ? '' : `
        <button class="ylu-date-today" data-target="${id}" style="
          width:100%;box-sizing:border-box;
          background:rgba(240,235,218,0.04);
          border:0.5px solid rgba(240,235,218,0.1);border-radius:2px;
          padding:9px 14px;margin-bottom:12px;
          font-family:var(--font-sans);font-weight:300;
          font-size:11px;letter-spacing:0.18em;text-transform:uppercase;
          color:rgba(240,235,218,0.4);cursor:pointer;
          transition:all 0.15s ease;
          -webkit-tap-highlight-color:transparent;
        "
        onmouseenter="this.style.background='rgba(240,235,218,0.08)';this.style.color='rgba(240,235,218,0.75)'"
        onmouseleave="this.style.background='rgba(240,235,218,0.04)';this.style.color='rgba(240,235,218,0.4)'"
        >Today</button>
        `}

        <!-- Month/year nav row -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <button class="ylu-cal-prev" data-target="${id}" style="
            font-family:var(--font-sans);font-weight:200;font-size:16px;
            color:rgba(240,235,218,0.4);cursor:pointer;padding:4px 10px;
            transition:color 0.15s ease;
            -webkit-tap-highlight-color:transparent;
          "
          onmouseenter="this.style.color='rgba(240,235,218,0.88)'"
          onmouseleave="this.style.color='rgba(240,235,218,0.4)'"
          >‹</button>

          <!-- Month/year label — tappable, opens jump picker -->
          <button class="ylu-cal-month-btn" data-target="${id}" style="
            font-family:var(--font-sans);font-weight:300;
            font-size:11px;letter-spacing:0.18em;text-transform:uppercase;
            color:rgba(240,235,218,0.65);cursor:pointer;
            padding:4px 10px;border-radius:2px;
            transition:all 0.15s ease;
            -webkit-tap-highlight-color:transparent;
          "
          onmouseenter="this.style.color='rgba(240,235,218,0.95)';this.style.background='rgba(240,235,218,0.06)'"
          onmouseleave="this.style.color='rgba(240,235,218,0.65)';this.style.background='transparent'"
          ></button>

          <button class="ylu-cal-next" data-target="${id}" style="
            font-family:var(--font-sans);font-weight:200;font-size:16px;
            color:rgba(240,235,218,0.4);cursor:pointer;padding:4px 10px;
            transition:color 0.15s ease;
            -webkit-tap-highlight-color:transparent;
          "
          onmouseenter="this.style.color='rgba(240,235,218,0.88)'"
          onmouseleave="this.style.color='rgba(240,235,218,0.4)'"
          >›</button>
        </div>

        <!-- Jump picker — month grid + decade accordion, hidden until month/year tapped -->
        <div id="${id}-jump" class="ylu-date-jump" style="display:none;"></div>

        <!-- Day-of-week headers -->
        <div class="ylu-cal-grid ylu-cal-dow" style="margin-bottom:4px;">
          ${['S','M','T','W','T','F','S'].map(d => `
            <div style="
              font-family:var(--font-sans);font-weight:200;
              font-size:9px;letter-spacing:0.15em;text-transform:uppercase;
              color:rgba(240,235,218,0.2);
              display:flex;align-items:center;justify-content:center;
              padding:2px 0;
            ">${d}</div>
          `).join('')}
        </div>

        <!-- Day grid — populated by JS -->
        <div class="ylu-cal-days ylu-cal-grid" data-target="${id}"></div>
      </div>

      <!-- Hidden canonical value — always ISO YYYY-MM-DD -->
      <input id="${id}" type="hidden" value="${isoValue}" />
    </div>
  `;
}


// ---------------------------------------------------------------------------
// ATTACH LISTENERS
// Call once after inserting buildDateField HTML into the DOM.
// Idempotent — skips fields already initialised.
// ---------------------------------------------------------------------------

export function attachDateListeners(el) {
  el.querySelectorAll('.ylu-date-display').forEach(btn => {
    if (btn._dpInit) return;
    btn._dpInit = true;

    const targetId  = btn.dataset.target;
    const picker    = el.querySelector(`#${targetId}-picker`);
    const jumpEl    = el.querySelector(`#${targetId}-jump`);
    const hidden    = el.querySelector(`#${targetId}`) || document.getElementById(targetId);
    const labelSpan = el.querySelector(`.ylu-date-label[data-target="${targetId}"]`);
    const modeEl    = el.querySelector(`.ylu-date-field[data-field-id="${targetId}"]`);
    const mode      = modeEl?.dataset?.mode || 'any'; // 'past' | 'future' | 'any'

    if (!picker || !hidden) return;

    const state = { year: 0, month: 0, jumpOpen: false };
    const today = new Date();

    // ── Helpers ──────────────────────────────────────────────────────────────

    function getCurrentISO() {
      return hidden.value && /^\d{4}-\d{2}-\d{2}$/.test(hidden.value) ? hidden.value : null;
    }

    function setDate(iso) {
      hidden.value = iso;
      if (labelSpan) {
        labelSpan.textContent = formatDisplayDate(iso);
        labelSpan.style.color = 'rgba(240,235,218,0.88)';
      }
      hidden.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function initMonth() {
      const iso = getCurrentISO();
      const d   = iso ? new Date(iso + 'T12:00:00') : new Date();
      state.year  = d.getFullYear();
      state.month = d.getMonth();
    }

    function openPicker() {
      initMonth();
      picker.style.display = 'block';
      state.jumpOpen = false;
      if (jumpEl) jumpEl.style.display = 'none';
      renderDayGrid();
      updateMonthLabel();
    }

    function closePicker() {
      picker.style.display = 'none';
      state.jumpOpen = false;
      if (jumpEl) jumpEl.style.display = 'none';
    }

    // ── Month label ───────────────────────────────────────────────────────────

    function updateMonthLabel() {
      const monthNames = ['January','February','March','April','May','June',
                          'July','August','September','October','November','December'];
      const btn = el.querySelector(`.ylu-cal-month-btn[data-target="${targetId}"]`);
      if (btn) btn.textContent = `${monthNames[state.month]} ${state.year}`;
    }

    // ── Day grid ──────────────────────────────────────────────────────────────

    function renderDayGrid() {
      // Hide jump picker when day grid is active
      if (jumpEl) jumpEl.style.display = 'none';
      el.querySelector('.ylu-cal-dow')?.style && (el.querySelector('.ylu-cal-dow').style.display = '');

      const grid = el.querySelector(`.ylu-cal-days[data-target="${targetId}"]`);
      if (!grid) return;

      const todayISO     = today.toISOString().split('T')[0];
      const selectedISO  = getCurrentISO();
      const firstDay     = new Date(state.year, state.month, 1).getDay();
      const daysInMonth  = new Date(state.year, state.month + 1, 0).getDate();

      let html = '';
      for (let i = 0; i < firstDay; i++) {
        html += `<div class="ylu-cal-day empty"></div>`;
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const iso       = `${state.year}-${String(state.month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const isToday   = iso === todayISO;
        const isSel     = iso === selectedISO;
        const isPast    = iso < todayISO;
        const isFuture  = iso > todayISO;
        const disabled  = (mode === 'future' && isPast) || (mode === 'past' && isFuture);

        html += `<div
          class="ylu-cal-day${isToday ? ' today' : ''}${isSel ? ' selected' : ''}${disabled ? ' disabled' : ''}"
          data-iso="${iso}" data-target="${targetId}"
          style="${disabled ? 'opacity:0.2;pointer-events:none;' : ''}"
        >${d}</div>`;
      }
      grid.innerHTML = html;

      grid.querySelectorAll('.ylu-cal-day[data-iso]:not(.disabled)').forEach(day => {
        day.addEventListener('click', () => {
          setDate(day.dataset.iso);
          closePicker();
          state.jumpOpen = false;
        });
      });

      updateMonthLabel();
    }

    // ── Jump picker — month grid + decade accordion ───────────────────────────

    function renderJump() {
      if (!jumpEl) return;
      state.jumpOpen = true;

      const monthNames  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const currentYear = state.year;
      const currentDec  = Math.floor(currentYear / 10) * 10;

      // Build decade list — current decade open, others collapsed
      // Range: 10 decades back to 1 decade forward
      const decades = [];
      for (let dec = currentDec - 100; dec <= currentDec + 10; dec += 10) {
        decades.push(dec);
      }
      decades.reverse(); // most recent first

      const monthGrid = monthNames.map((m, i) => `
        <button class="ylu-jump-month" data-month="${i}" style="
          padding:8px 4px;
          font-family:var(--font-sans);font-weight:300;font-size:11px;
          letter-spacing:0.08em;
          color:${i === state.month ? 'rgba(240,235,218,0.95)' : 'rgba(240,235,218,0.45)'};
          background:${i === state.month ? 'rgba(240,235,218,0.08)' : 'transparent'};
          border:0.5px solid ${i === state.month ? 'rgba(240,235,218,0.2)' : 'transparent'};
          border-radius:2px;cursor:pointer;
          transition:all 0.12s ease;
          -webkit-tap-highlight-color:transparent;
        "
        onmouseenter="this.style.color='rgba(240,235,218,0.9)';this.style.background='rgba(240,235,218,0.06)'"
        onmouseleave="this.style.color='${i === state.month ? 'rgba(240,235,218,0.95)' : 'rgba(240,235,218,0.45)'}';this.style.background='${i === state.month ? 'rgba(240,235,218,0.08)' : 'transparent'}'"
        >${m}</button>
      `).join('');

      const decadeAccordion = decades.map(dec => {
        const isOpen = dec === currentDec;
        const years  = Array.from({length: 10}, (_, i) => dec + i);
        const yearGrid = years.map(y => `
          <button class="ylu-jump-year" data-year="${y}" style="
            padding:7px 4px;
            font-family:var(--font-sans);font-weight:300;font-size:12px;
            color:${y === currentYear ? 'rgba(240,235,218,0.95)' : 'rgba(240,235,218,0.45)'};
            background:${y === currentYear ? 'rgba(240,235,218,0.08)' : 'transparent'};
            border:0.5px solid ${y === currentYear ? 'rgba(240,235,218,0.2)' : 'transparent'};
            border-radius:2px;cursor:pointer;
            transition:all 0.12s ease;
            -webkit-tap-highlight-color:transparent;
          "
          onmouseenter="this.style.color='rgba(240,235,218,0.9)';this.style.background='rgba(240,235,218,0.06)'"
          onmouseleave="this.style.color='${y === currentYear ? 'rgba(240,235,218,0.95)' : 'rgba(240,235,218,0.45)'}';this.style.background='${y === currentYear ? 'rgba(240,235,218,0.08)' : 'transparent'}'"
          >${y}</button>
        `).join('');

        return `
          <div class="ylu-decade-row" style="border-bottom:0.5px solid rgba(240,235,218,0.04);">
            <button class="ylu-decade-toggle" data-decade="${dec}" style="
              width:100%;display:flex;align-items:center;justify-content:space-between;
              padding:8px 4px;
              font-family:var(--font-sans);font-weight:200;font-size:10px;
              letter-spacing:0.18em;text-transform:uppercase;
              color:rgba(240,235,218,0.35);cursor:pointer;
              -webkit-tap-highlight-color:transparent;
            ">${dec}s <span style="font-size:9px;">${isOpen ? '▾' : '›'}</span></button>
            <div class="ylu-decade-years" data-decade="${dec}" style="
              display:${isOpen ? 'grid' : 'none'};
              grid-template-columns:repeat(5,1fr);gap:4px;
              padding:4px 0 10px;
            ">${yearGrid}</div>
          </div>
        `;
      }).join('');

      jumpEl.innerHTML = `
        <div style="margin-bottom:12px;">
          <div style="
            font-family:var(--font-sans);font-weight:200;font-size:9px;
            letter-spacing:0.2em;text-transform:uppercase;
            color:rgba(240,235,218,0.2);margin-bottom:8px;
          ">Month</div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:16px;">
            ${monthGrid}
          </div>
          <div style="
            font-family:var(--font-sans);font-weight:200;font-size:9px;
            letter-spacing:0.2em;text-transform:uppercase;
            color:rgba(240,235,218,0.2);margin-bottom:8px;
          ">Year</div>
          <div class="ylu-decade-list" style="max-height:180px;overflow-y:auto;">
            ${decadeAccordion}
          </div>
        </div>
      `;

      // Wire month clicks
      jumpEl.querySelectorAll('.ylu-jump-month').forEach(btn => {
        btn.addEventListener('click', () => {
          state.month = parseInt(btn.dataset.month, 10);
          state.jumpOpen = false;
          jumpEl.style.display = 'none';
          renderDayGrid();
        });
      });

      // Wire year clicks
      jumpEl.querySelectorAll('.ylu-jump-year').forEach(btn => {
        btn.addEventListener('click', () => {
          state.year = parseInt(btn.dataset.year, 10);
          state.jumpOpen = false;
          jumpEl.style.display = 'none';
          renderDayGrid();
        });
      });

      // Wire decade toggles
      jumpEl.querySelectorAll('.ylu-decade-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const dec      = btn.dataset.decade;
          const yearsDiv = jumpEl.querySelector(`.ylu-decade-years[data-decade="${dec}"]`);
          const arrow    = btn.querySelector('span');
          if (!yearsDiv) return;
          const isOpen   = yearsDiv.style.display !== 'none';
          yearsDiv.style.display = isOpen ? 'none' : 'grid';
          if (arrow) arrow.textContent = isOpen ? '›' : '▾';
        });
      });

      jumpEl.style.display = 'block';

      // Scroll current decade into view
      const openDec = jumpEl.querySelector(`.ylu-decade-years[data-decade="${currentDec}"]`);
      openDec?.closest('.ylu-decade-row')?.scrollIntoView?.({ block: 'nearest' });
    }

    // ── Wire controls ─────────────────────────────────────────────────────────

    // Display button — toggle picker
    btn.addEventListener('click', () => {
      const isOpen = picker.style.display !== 'none';
      if (isOpen) {
        closePicker();
      } else {
        openPicker();
      }
    });

    // Today button
    const todayBtn = picker.querySelector(`.ylu-date-today[data-target="${targetId}"]`);
    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        setDate(today.toISOString().split('T')[0]);
        closePicker();
      });
    }

    // Month/year label — opens jump picker
    const monthBtn = picker.querySelector(`.ylu-cal-month-btn[data-target="${targetId}"]`);
    if (monthBtn) {
      monthBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (state.jumpOpen) {
          state.jumpOpen = false;
          if (jumpEl) jumpEl.style.display = 'none';
          renderDayGrid();
        } else {
          renderJump();
        }
      });
    }

    // Prev/next month
    const prevBtn = picker.querySelector(`.ylu-cal-prev[data-target="${targetId}"]`);
    const nextBtn = picker.querySelector(`.ylu-cal-next[data-target="${targetId}"]`);
    if (prevBtn) prevBtn.addEventListener('click', e => {
      e.stopPropagation();
      state.month--;
      if (state.month < 0) { state.month = 11; state.year--; }
      renderDayGrid();
    });
    if (nextBtn) nextBtn.addEventListener('click', e => {
      e.stopPropagation();
      state.month++;
      if (state.month > 11) { state.month = 0; state.year++; }
      renderDayGrid();
    });
  });
}


// ---------------------------------------------------------------------------
// SHARED CSS — inject once per page load
// Call injectDatePickerStyles() from main.js or once in any module boot.
// ---------------------------------------------------------------------------

let _stylesInjected = false;

export function injectDatePickerStyles() {
  if (_stylesInjected) return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    .ylu-cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }
    .ylu-cal-day {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 32px;
      font-family: var(--font-sans);
      font-weight: 300;
      font-size: 13px;
      color: rgba(240,235,218,0.65);
      border-radius: 2px;
      cursor: pointer;
      transition: all 0.12s ease;
      -webkit-tap-highlight-color: transparent;
    }
    .ylu-cal-day:hover:not(.empty):not(.disabled) {
      background: rgba(240,235,218,0.08);
      color: rgba(240,235,218,0.95);
    }
    .ylu-cal-day.today {
      color: rgba(210,160,60,0.9);
      font-weight: 400;
    }
    .ylu-cal-day.selected {
      background: rgba(240,235,218,0.12);
      color: rgba(240,235,218,0.95);
      border: 0.5px solid rgba(240,235,218,0.3);
    }
    .ylu-cal-day.empty {
      cursor: default;
    }
    .ylu-cal-day.disabled {
      opacity: 0.2;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}
