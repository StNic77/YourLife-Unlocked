import { store } from './store.js';
import { api } from './api.js';

// ---------------------------------------------------------------------------
// CASCADE MODULE
//
// The cascade is the third panel layer: Room → Brief → Cascade.
// It opens when the user taps an urgent item that has a cascade attached.
// The brief does not close. Back returns to the brief.
//
// Each cascade type has:
//   - A route resolver  — determines available routes, reorders by preference
//   - A content builder — builds the panel for a given route
//   - A completion handler — updates the store when the user marks done
//
// Cascade types implemented:
//   HC-1  vehicle_registration   — jurisdiction-aware, BC/AB/generic
//   HC-2  vehicle_service        — DIY / dealer / preferred shop
//   HC-5  medical_appointment    — book / find provider
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// PREFERENCE STORE
// Remembers the user's last chosen route per cascade type.
// One read/write per cascade open — no polling.
// ---------------------------------------------------------------------------

function getPreference(cascadeType) {
  const prefs = store.get('cascade_preferences') || {};
  return prefs[cascadeType] || null;
}

function setPreference(cascadeType, route) {
  const prefs = store.get('cascade_preferences') || {};
  store.set('cascade_preferences', { ...prefs, [cascadeType]: route });
}

// ---------------------------------------------------------------------------
// PUBLIC API
// Called by home.js when an urgent item is tapped.
// ---------------------------------------------------------------------------

export function createCascade({ item, onBack, onComplete }) {
  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute;inset:0;
    background:linear-gradient(to top,
      rgba(0,0,0,0.98) 0%,
      rgba(0,0,0,0.95) 60%,
      rgba(0,0,0,0.88) 100%
    );
    opacity:0;
    transform:translateX(100%);
    transition:opacity 0.3s ease, transform 0.3s cubic-bezier(0.2,0,0,1);
    pointer-events:none;
    z-index:10;
    overflow:hidden;
  `;

  const cascade = item?.cascade;
  if (!cascade) return null;

  // Route the item to the right renderer
  const renderer = RENDERERS[cascade.type];
  if (!renderer) return null;

  async function open(container) {
    container.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity        = '1';
      el.style.transform      = 'translateX(0)';
      el.style.pointerEvents  = 'all';
    });
    await render();
  }

  function close() {
    el.style.opacity   = '0';
    el.style.transform = 'translateX(100%)';
    setTimeout(() => {
      el.style.pointerEvents = 'none';
      el.remove();
    }, 320);
  }

  async function render(selectedRoute) {
    const pref  = selectedRoute || getPreference(cascade.type);

    // Save scroll position before re-render (intake tile taps, system toggles)
    const scrollEl = el.querySelector('#cascade-scroll');
    const savedScroll = scrollEl ? scrollEl.scrollTop : 0;

    const state = await renderer.resolve(cascade.context, pref);

    el.innerHTML = buildShell({
      title:    item.title,
      subtitle: item.body,
      content:  state.route
        ? await renderer.buildRoute(state.route, cascade.context)
        : buildRouteTiles(state.routes, cascade.type),
      hasRoute: !!state.route,
    });

    // Restore scroll position after re-render
    const newScrollEl = el.querySelector('#cascade-scroll');
    if (newScrollEl && savedScroll > 0) {
      newScrollEl.scrollTop = savedScroll;
    }

    attachShellListeners(state);
  }

  function buildShell({ title, subtitle, content, hasRoute }) {
    return `
      <div id="cascade-scroll" style="
        position:absolute;inset:0;
        height:100dvh;
        overflow-y:auto;
        -webkit-overflow-scrolling:touch;
        box-sizing:border-box;
        padding:
          max(52px, calc(var(--safe-top, 0px) + 28px))
          28px
          max(48px, calc(var(--safe-bottom, 0px) + 24px));
      ">

        <!-- Back -->
        <button id="cascade-back" style="
          font-family:var(--font-sans);font-weight:200;
          font-size:10px;letter-spacing:0.25em;text-transform:uppercase;
          color:rgba(240,235,218,0.35);
          margin-bottom:32px;
          display:flex;align-items:center;gap:8px;
          transition:color 0.2s ease;
        ">← back</button>

        <!-- Item title -->
        <div style="margin-bottom:28px;">
          <div style="
            font-family:var(--font-serif);font-style:italic;font-weight:300;
            font-size:clamp(22px,5vw,28px);
            color:rgba(240,235,218,0.92);
            margin-bottom:6px;
          ">${title}</div>
          <div style="
            font-family:var(--font-sans);font-weight:200;
            font-size:11px;letter-spacing:0.18em;text-transform:uppercase;
            color:rgba(210,160,60,0.7);
          ">${subtitle}</div>
        </div>

        <!-- Route divider -->
        <div style="
          height:0.5px;background:rgba(240,235,218,0.08);
          margin-bottom:28px;
        "></div>

        <!-- Content — tiles or route detail -->
        <div id="cascade-content">
          ${content}
        </div>

        <!-- Change route — only shown on multi-route cascades, not on detail or intake views -->
        ${hasRoute && cascade?.type !== 'vehicle_detail' && cascade?.type !== 'person_detail' && cascade?.type !== 'vehicle_intake' ? `
          <div style="margin-top:36px;">
            <button id="cascade-change-route" style="
              font-family:var(--font-sans);font-weight:200;
              font-size:10px;letter-spacing:0.22em;text-transform:uppercase;
              color:rgba(240,235,218,0.2);
              transition:color 0.2s ease;
            ">other options</button>
          </div>
        ` : ''}

      </div>
    `;
  }

  function buildRouteTiles(routes, cascadeType) {
    const tiles = routes.map(route => `
      <button class="cascade-route-tile" data-route="${route.id}" style="
        width:100%;
        padding:18px 20px;
        margin-bottom:10px;
        background:rgba(240,235,218,0.04);
        border:0.5px solid rgba(240,235,218,0.12);
        border-radius:2px;
        text-align:left;
        transition:all 0.2s ease;
        cursor:pointer;
      ">
        <div style="
          font-family:var(--font-sans);font-weight:300;
          font-size:14px;letter-spacing:0.04em;
          color:rgba(240,235,218,0.85);
          margin-bottom:4px;
        ">${route.label}</div>
        ${route.description ? `
          <div style="
            font-family:var(--font-sans);font-weight:200;
            font-size:11px;letter-spacing:0.04em;
            color:rgba(240,235,218,0.35);
          ">${route.description}</div>
        ` : ''}
      </button>
    `).join('');

    return `<div id="cascade-tiles">${tiles}</div>`;
  }

  function attachShellListeners(state) {
    // Back
    const backBtn = el.querySelector('#cascade-back');
    if (backBtn) {
      backBtn.addEventListener('mouseenter', () => backBtn.style.color = 'rgba(240,235,218,0.7)');
      backBtn.addEventListener('mouseleave', () => backBtn.style.color = 'rgba(240,235,218,0.35)');
      backBtn.addEventListener('click', () => {
        // During vehicle intake — back steps backward, not closes
        if (cascade.type === 'vehicle_intake') {
          const intakeState = cascade.context._intakeState;
          if (intakeState && intakeState.step !== 'step_identity') {
            const order = ['step_identity', 'step_mileage', 'step_service', 'step_history', 'step_details', 'step_review'];
            const idx = order.indexOf(intakeState.step);
            if (idx > 0) intakeState.step = order[idx - 1];
            render('intake');
            return;
          }
        }
        close(); onBack?.();
      });
    }

    // Route tiles
    el.querySelectorAll('.cascade-route-tile').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.background   = 'rgba(240,235,218,0.07)';
        btn.style.borderColor  = 'rgba(240,235,218,0.2)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background   = 'rgba(240,235,218,0.04)';
        btn.style.borderColor  = 'rgba(240,235,218,0.12)';
      });
      btn.addEventListener('click', () => {
        const route = btn.dataset.route;
        setPreference(cascade.type, route);
        render(route);
      });
    });

    // Change route
    const changeBtn = el.querySelector('#cascade-change-route');
    if (changeBtn) {
      changeBtn.addEventListener('mouseenter', () => changeBtn.style.color = 'rgba(240,235,218,0.45)');
      changeBtn.addEventListener('mouseleave', () => changeBtn.style.color = 'rgba(240,235,218,0.2)');
      changeBtn.addEventListener('click', () => render(null));
    }

    // Person detail — tap-to-edit
    if (cascade.type === 'person_detail') {
      el.querySelectorAll('.person-editable-line').forEach(row => {
        row.addEventListener('click', () => {
          if (row.querySelector('input')) return;
          const personId  = row.dataset.personId;
          const field     = row.dataset.field;
          const valueDiv  = row.querySelector('.person-editable-value');
          const current   = valueDiv?.innerText?.replace(/[—]/g, '').trim() || '';

          const input = document.createElement('input');
          input.type  = 'text';
          input.value = current;
          input.style.cssText = `
            width:100%;box-sizing:border-box;
            background:rgba(240,235,218,0.06);
            border:none;border-bottom:0.5px solid rgba(210,160,60,0.4);
            padding:4px 2px;
            font-family:var(--font-sans);font-weight:300;
            font-size:13px;letter-spacing:0.03em;
            color:rgba(240,235,218,0.88);outline:none;
          `;
          if (valueDiv) valueDiv.replaceWith(input);
          input.focus();
          const save = () => { savePersonField(personId, field, input.value.trim()); render('detail'); };
          input.addEventListener('blur',    save);
          input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); save(); } });
        });
        row.addEventListener('mouseenter', () => row.style.background = 'rgba(240,235,218,0.02)');
        row.addEventListener('mouseleave', () => row.style.background = 'transparent');
      });
      return;
    }

    // Maintenance detail — tap-to-edit + mark done + delete
    if (cascade.type === 'maintenance_detail') {
      el.querySelectorAll('.task-editable-line').forEach(row => {
        row.addEventListener('click', () => {
          if (row.querySelector('input')) return;
          const taskId   = row.dataset.taskId;
          const field    = row.dataset.field;
          const type     = row.dataset.type;
          const valueDiv = row.querySelector('.task-editable-value');
          const current  = valueDiv?.innerText?.replace(/[—]/g, '').trim() || '';

          const input = document.createElement('input');
          input.type  = 'text';
          if (type === 'date' && current) {
            const d = new Date(current);
            if (!isNaN(d)) input.value = d.toISOString().split('T')[0];
            else input.value = current;
          } else {
            input.value = current;
          }
          input.placeholder = type === 'date' ? 'e.g. 2025-01-15' : '';
          input.style.cssText = `
            width:100%;box-sizing:border-box;
            background:rgba(240,235,218,0.06);
            border:none;border-bottom:0.5px solid rgba(210,160,60,0.4);
            padding:4px 2px;
            font-family:var(--font-sans);font-weight:300;
            font-size:14px;color:rgba(240,235,218,0.88);
            outline:none;
          `;
          if (valueDiv) valueDiv.replaceWith(input);
          input.focus();
          const save = () => { saveTaskField(taskId, field, input.value.trim()); render('detail'); };
          input.addEventListener('blur',    save);
          input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); save(); } });
        });
        row.addEventListener('mouseenter', () => row.style.background = 'rgba(240,235,218,0.02)');
        row.addEventListener('mouseleave', () => row.style.background = 'transparent');
      });

      // Mark done
      el.querySelectorAll('.cascade-done').forEach(btn => {
        btn.addEventListener('click', () => {
          maintenanceDetailRenderer.complete = maintenanceTaskRenderer.complete;
          maintenanceTaskRenderer.complete(cascade.context, 'detail', {});
          close(); onComplete?.();
        });
      });

      // Delete task
      const delBtn = el.querySelector('#task-delete');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          const tasks = store.get('maintenance_tasks') || [];
          store.set('maintenance_tasks', tasks.filter(t => t.id !== delBtn.dataset.taskId));
          close(); onComplete?.();
        });
      }
      return;
    }

    // Maintenance intake listeners
    if (cascade.type === 'maintenance_intake') {
      const s = cascade.context._mState || (cascade.context._mState = { step: 'label' });

      // Wire calendar picker for last_done step
      attachCalendarListeners(el);

      const proceedBtn = el.querySelector('#m-proceed');
      if (proceedBtn) {
        proceedBtn.addEventListener('click', () => {
          if (s.step === 'label') {
            s.label = el.querySelector('#m-label')?.value.trim() || '';
            s.notes = el.querySelector('#m-notes')?.value.trim() || '';
            if (!s.label) return;
            s.step = 'interval';
            render('intake');
          } else if (s.step === 'interval') {
            s.interval_days  = el.querySelector('#m-interval-days')?.value.trim()  || s.interval_days  || '';
            s.interval_label = el.querySelector('#m-interval-label')?.value.trim() || s.interval_label || '';
            s.step = 'last_done';
            render('intake');
          } else if (s.step === 'last_done') {
            // Read from hidden ISO field (set by calendar picker or text blur)
            const hiddenDate = el.querySelector('#m-last-done');
            const textDate   = el.querySelector('#m-last-done-text');
            s.last_done = (hiddenDate?.value || textDate?.value || '').trim();
            maintenanceIntakeRenderer.complete(cascade.context, 'intake', {});
            close();
            onComplete?.();
          }
        });
      }

      const skipBtn = el.querySelector('#m-skip');
      if (skipBtn) {
        skipBtn.addEventListener('click', () => {
          if (s.step === 'interval') { s.step = 'last_done'; render('intake'); }
          else if (s.step === 'last_done') {
            maintenanceIntakeRenderer.complete(cascade.context, 'intake', {});
            close(); onComplete?.();
          }
        });
      }

      // Interval presets
      el.querySelectorAll('.m-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          s.interval_days  = btn.dataset.days;
          s.interval_label = btn.dataset.label;
          s.step = 'last_done';
          render('intake');
        });
      });

      return;
    }

    // Intake cascade — delegate to intake listener handler
    if (cascade.type === 'vehicle_intake') {
      attachIntakeListeners(el, cascade, render, close, onComplete);
      return;
    }

    // Detail cascade — log a service button
    if (cascade.type === 'vehicle_detail') {
      // Log a service button
      el.querySelectorAll('.vehicle-log-service').forEach(btn => {
        btn.addEventListener('click', () => {
          cascade.context._logMode = true;
          render('log_service');
        });
      });

      // Log service save/cancel
      if (cascade.context._logMode) {
        const saveBtn = el.querySelector('#log-service-save');
        if (saveBtn) {
          attachCalendarListeners(el); // wire log-date calendar picker
          saveBtn.addEventListener('click', () => {
            const dateVal    = el.querySelector('#log-date')?.value.trim()    || new Date().toISOString().split('T')[0];
            const mileageVal = el.querySelector('#log-mileage')?.value.trim() || '';
            const typeVal    = el.querySelector('#log-type')?.value.trim()    || 'oil_change';
            const shopVal    = el.querySelector('#log-shop')?.value.trim()    || '';
            const notesVal   = el.querySelector('#log-notes')?.value.trim()   || '';
            const vehicles   = store.get('vehicles') || [];
            const idx        = vehicles.findIndex(v => v.id === cascade.context.vehicle_id);
            if (idx >= 0) {
              vehicles[idx].service_history = vehicles[idx].service_history || [];
              vehicles[idx].service_history.push({
                type: typeVal, date: dateVal,
                mileage: mileageVal ? parseInt(mileageVal, 10) : null,
                shop: shopVal || vehicles[idx].preferred_shop || null,
                notes: notesVal || null,
              });
              if (mileageVal && parseInt(mileageVal, 10) > (vehicles[idx].mileage_at_entry || 0)) {
                vehicles[idx].mileage_at_entry = parseInt(mileageVal, 10);
                vehicles[idx].mileage_date = dateVal;
              }
              store.set('vehicles', vehicles);
            }
            cascade.context._logMode = false;
            render('detail');
          });
        }
        const cancelBtn = el.querySelector('#log-service-cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', () => { cascade.context._logMode = false; render('detail'); });
      }

      // ── Delete vehicle ────────────────────────────────────────────────────
      const deleteBtn = el.querySelector('#vehicle-delete');
      const confirmPanel = el.querySelector('#vehicle-delete-confirm');
      const confirmYes = el.querySelector('#vehicle-delete-confirm-yes');
      const confirmCancel = el.querySelector('#vehicle-delete-cancel');

      if (deleteBtn && confirmPanel) {
        deleteBtn.addEventListener('click', () => {
          confirmPanel.style.display = 'block';
          deleteBtn.style.display = 'none';
        });
      }
      if (confirmCancel && confirmPanel) {
        confirmCancel.addEventListener('click', () => {
          confirmPanel.style.display = 'none';
          if (deleteBtn) deleteBtn.style.display = '';
        });
      }
      if (confirmYes) {
        confirmYes.addEventListener('click', () => {
          const vehicleId = confirmYes.dataset.vehicleId;
          const vehicles = store.get('vehicles') || [];
          store.set('vehicles', vehicles.filter(v => v.id !== vehicleId));
          close();
          onComplete?.();
        });
      }

      // ── Refresh vehicle facts ─────────────────────────────────────────────
      const refreshBtn = el.querySelector('#vehicle-refresh-facts');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
          const vehicleId = refreshBtn.dataset.vehicleId;
          const vehicles  = store.get('vehicles') || [];
          const idx       = vehicles.findIndex(v => v.id === vehicleId);
          if (idx < 0) return;

          const v = vehicles[idx];
          refreshBtn.textContent = 'Refreshing…';
          refreshBtn.style.pointerEvents = 'none';

          try {
            const schedule = await api.getVehicleSchedule({
              year:             v.year,
              make:             v.make,
              model:            v.model,
              variant:          v.variant,
              vin:              v.vin          || null,
              transmission:     v.transmission || null,
              mileage:          v.mileage_at_entry ? String(v.mileage_at_entry) : '0',
              last_oil_date:    v.last_oil_date    || '',
              last_oil_mileage: v.last_oil_mileage ? String(v.last_oil_mileage) : '',
              interval_km:      v.preferred_interval_km ? String(v.preferred_interval_km) : '8000',
              service_history:  v.service_history || [],
            });

            console.log('[vehicle] refresh facts response:', JSON.stringify(schedule, null, 2));

            if (schedule) {
              vehicles[idx] = {
                ...vehicles[idx],
                vehicle_facts: schedule.vehicle_facts || vehicles[idx].vehicle_facts || null,
                maintenance_schedule: { ...schedule, vehicle_facts: undefined },
                service_due: schedule.next_oil_change_date || vehicles[idx].service_due,
              };
              store.set('vehicles', vehicles);
              render();
            } else {
              refreshBtn.textContent = 'No data returned';
              setTimeout(() => {
                refreshBtn.textContent = 'Refresh facts';
                refreshBtn.style.pointerEvents = '';
              }, 2000);
            }
          } catch (err) {
            console.warn('[vehicle] refresh facts failed:', err);
            refreshBtn.textContent = 'Failed — try again';
            setTimeout(() => {
              refreshBtn.textContent = 'Refresh facts';
              refreshBtn.style.pointerEvents = '';
            }, 2000);
          }
        });
      }

      // ── Edit vehicle details — opens intake cascade pre-populated ─────────
      const editBtn = el.querySelector('#vehicle-edit');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          const vehicleId = editBtn.dataset.vehicleId;
          const vehicle   = getVehicle(vehicleId);
          if (!vehicle) return;

          // Pre-populate intake state from existing vehicle data
          const prefilled = {
            step:           'step_identity',
            year:           vehicle.year            || '',
            make:           vehicle.make            || '',
            model:          vehicle.model           || '',
            variant:        vehicle.variant         || '',
            mileage:        vehicle.mileage_at_entry ? String(vehicle.mileage_at_entry) : '',
            last_oil_date:    vehicle.last_oil_date     || '',
            last_oil_mileage: vehicle.last_oil_mileage  ? String(vehicle.last_oil_mileage) : '',
            interval_km:    vehicle.preferred_interval_km ? String(vehicle.preferred_interval_km) : '',
            history:        vehicle.service_history ? [...vehicle.service_history] : [],
            transmission:   vehicle.transmission    || '',
            plate_province: vehicle.plate_province  || '',
            preferred_shop: vehicle.preferred_shop  || '',
            vin:            vehicle.vin             || '',
            ai_schedule:    vehicle.maintenance_schedule
              ? { ...vehicle.maintenance_schedule, vehicle_facts: vehicle.vehicle_facts }
              : null,
            _editingVehicleId: vehicleId, // flag so complete() updates rather than creates
          };

          // Open a new intake cascade with pre-filled state
          const editItem = {
            id:    'vehicle_edit_' + vehicleId,
            title: vehicle.name || 'Edit vehicle',
            body:  'Update details',
            cascade: {
              type:    'vehicle_intake',
              context: { _intakeState: prefilled },
            },
          };
          const editPanel = createCascade({
            item: editItem,
            onBack: () => {},
            onComplete: () => { close(); onComplete?.(); },
          });
          if (editPanel) editPanel.open(el.parentElement || document.body);
        });
      }


      // Each .editable-line taps to swap the value div for an input.
      // On blur or Enter: write to store, swap back.
      el.querySelectorAll('.editable-line').forEach(row => {
        row.addEventListener('click', () => {
          if (row.querySelector('input')) return; // already editing
          const field     = row.dataset.field;
          const type      = row.dataset.type;
          const vehicleId = row.dataset.vehicleId;
          const valueDiv  = row.querySelector('.editable-value');
          const currentText = valueDiv?.innerText?.replace(/[—]/g, '').trim() || '';

          const input = document.createElement('input');
          input.type  = type === 'date' ? 'text' : 'text';
          if (type === 'date' && currentText) {
            // Try to parse display date back to ISO
            const d = new Date(currentText);
            if (!isNaN(d)) input.value = d.toISOString().split('T')[0];
            else input.value = currentText;
          } else {
            // Strip trailing ' km' or similar for numeric fields
            input.value = currentText.replace(/[\s,km]+$/i, '').replace(/,/g, '');
          }
          input.placeholder = type === 'date' ? 'e.g. 2025-01-15' : '';
          input.style.cssText = `
            width:100%;box-sizing:border-box;
            background:rgba(240,235,218,0.06);
            border:none;border-bottom:0.5px solid rgba(210,160,60,0.4);
            padding:4px 2px;
            font-family:var(--font-sans);font-weight:300;
            font-size:14px;letter-spacing:0.03em;
            color:rgba(240,235,218,0.88);
            outline:none;
          `;

          if (valueDiv) valueDiv.replaceWith(input);
          input.focus();

          const save = () => {
            const newVal = input.value.trim();
            saveVehicleField(vehicleId, field, newVal);
            render('detail');
          };
          input.addEventListener('blur',    save);
          input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); save(); } });
        });

        // Subtle edit affordance on hover
        row.addEventListener('mouseenter', () => row.style.background = 'rgba(240,235,218,0.02)');
        row.addEventListener('mouseleave', () => row.style.background = 'transparent');
      });

      // ── Tap-to-edit: history rows ─────────────────────────────────────────
      // Each .editable-history-row taps to show inline mini-form for that entry.
      el.querySelectorAll('.editable-history-row').forEach(row => {
        const summary  = row.querySelector('.history-summary');
        const form     = row.querySelector('.history-edit-form');
        if (!summary || !form) return;

        row.addEventListener('click', () => {
          if (form.style.display !== 'none') return;
          const vehicleId  = row.dataset.vehicleId;
          const collection = row.dataset.collection;
          const index      = parseInt(row.dataset.index, 10);
          const vehicles   = store.get('vehicles') || [];
          const vIdx       = vehicles.findIndex(v => v.id === vehicleId);
          if (vIdx < 0) return;
          const entry = vehicles[vIdx][collection]?.[index] || {};

          const histDateId = `h-date-${vehicleId}-${collection}-${index}`;
          form.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:8px;padding:8px 0 4px;">
              <input class="h-type"  placeholder="type"     value="${entry.label || entry.type?.replace(/_/g,' ') || ''}"
                style="${editInputStyle()}" />
              ${buildDateField(histDateId, 'Date', entry.date || '', {})}
              <input class="h-km"    placeholder="km"       value="${entry.mileage || entry.mileage_approx || ''}"
                inputmode="numeric"  style="${editInputStyle()}" />
              <input class="h-shop"  placeholder="shop"     value="${entry.shop  || ''}"
                style="${editInputStyle()}" />
              <input class="h-notes" placeholder="notes"    value="${entry.notes || ''}"
                style="${editInputStyle()}" />
              <div style="display:flex;gap:12px;margin-top:4px;">
                <button class="h-save" style="
                  font-family:var(--font-sans);font-weight:300;
                  font-size:10px;letter-spacing:0.2em;text-transform:uppercase;
                  color:rgba(240,235,218,0.7);
                  border:0.5px solid rgba(240,235,218,0.2);border-radius:2px;
                  padding:6px 14px;cursor:pointer;
                  background:rgba(240,235,218,0.05);
                ">save</button>
                <button class="h-delete" style="
                  font-family:var(--font-sans);font-weight:200;
                  font-size:10px;letter-spacing:0.2em;text-transform:uppercase;
                  color:rgba(240,235,218,0.2);cursor:pointer;
                ">remove</button>
                <button class="h-cancel" style="
                  font-family:var(--font-sans);font-weight:200;
                  font-size:10px;letter-spacing:0.2em;text-transform:uppercase;
                  color:rgba(240,235,218,0.2);cursor:pointer;
                ">cancel</button>
              </div>
            </div>
          `;
          summary.style.display = 'none';
          form.style.display    = 'block';
          attachCalendarListeners(form);

          form.querySelector('.h-save').addEventListener('click', (e) => {
            e.stopPropagation();
            const typeFieldVal = form.querySelector('.h-type').value.trim();
            const dateHidden   = form.querySelector(`#${histDateId}`);
            const dateText     = form.querySelector(`#${histDateId}-text`);
            const dateVal      = dateHidden?.value || dateText?.value || entry.date || '';
            const updated = {
              type:    entry.type || typeFieldVal || entry.label,
              label:   typeFieldVal || entry.label || entry.type?.replace(/_/g,' ') || null,
              date:    dateVal,
              mileage: parseInt(form.querySelector('.h-km').value.trim(), 10) || entry.mileage || entry.mileage_approx || null,
              shop:    form.querySelector('.h-shop').value.trim()  || entry.shop  || null,
              notes:   form.querySelector('.h-notes').value.trim() || entry.notes || null,
            };
            const fresh = store.get('vehicles') || [];
            const fi    = fresh.findIndex(v => v.id === vehicleId);
            if (fi >= 0 && fresh[fi][collection]) {
              fresh[fi][collection][index] = updated;
              store.set('vehicles', fresh);
            }
            render('detail');
          });

          form.querySelector('.h-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            const fresh = store.get('vehicles') || [];
            const fi    = fresh.findIndex(v => v.id === vehicleId);
            if (fi >= 0 && fresh[fi][collection]) {
              fresh[fi][collection].splice(index, 1);
              store.set('vehicles', fresh);
            }
            render('detail');
          });

          form.querySelector('.h-cancel').addEventListener('click', (e) => {
            e.stopPropagation();
            form.style.display    = 'none';
            summary.style.display = 'block';
          });
        });

        row.addEventListener('mouseenter', () => row.style.background = 'rgba(240,235,218,0.02)');
        row.addEventListener('mouseleave', () => row.style.background = 'transparent');
      });

      return;
    }

    // Done buttons
    el.querySelectorAll('.cascade-done').forEach(btn => {
      btn.addEventListener('click', () => {
        const update = btn.dataset;
        renderer.complete(cascade.context, state.route, update);
        close();
        onComplete?.();
      });
    });

    // External links
    el.querySelectorAll('.cascade-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.url;
        if (url) window.open(url, '_blank', 'noopener');
      });
    });

    // Direction links
    el.querySelectorAll('.cascade-directions').forEach(btn => {
      btn.addEventListener('click', () => {
        const addr = encodeURIComponent(btn.dataset.address);
        window.open(`https://maps.google.com/?q=${addr}`, '_blank', 'noopener');
      });
    });

    // Phone links
    el.querySelectorAll('.cascade-call').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.href = `tel:${btn.dataset.phone}`;
      });
    });
  }

  return { open, close };
}

// ---------------------------------------------------------------------------
// SHARED UI BUILDERS
// Used across multiple renderers for consistent presentation.
// ---------------------------------------------------------------------------

function buildLoadingHTML(message = 'Getting what you need…') {
  return `
    <div style="
      display:flex;align-items:center;gap:12px;
      padding:20px 0;
      font-family:var(--font-sans);font-weight:200;
      font-size:12px;letter-spacing:0.12em;
      color:rgba(240,235,218,0.3);
    ">
      <div style="
        width:16px;height:16px;border-radius:50%;
        border:1px solid rgba(240,235,218,0.15);
        border-top-color:rgba(240,235,218,0.5);
        animation:cascadeSpin 0.8s linear infinite;
      "></div>
      ${message}
    </div>
  `;
}

function buildDetailRow(label, value, opts = {}) {
  return `
    <div style="
      padding:14px 0;
      border-bottom:0.5px solid rgba(240,235,218,0.06);
      ${opts.urgent ? 'border-left:2px solid rgba(210,160,60,0.6);padding-left:12px;' : ''}
    ">
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.2em;text-transform:uppercase;
        color:rgba(240,235,218,0.3);
        margin-bottom:5px;
      ">${label}</div>
      <div style="
        font-family:var(--font-sans);font-weight:300;
        font-size:14px;letter-spacing:0.03em;
        color:rgba(240,235,218,${opts.dim ? '0.5' : '0.85'});
        line-height:1.5;
      ">${value}</div>
    </div>
  `;
}

function buildListHTML(items) {
  return items.map(item => `
    <div style="
      padding:12px 0;
      border-bottom:0.5px solid rgba(240,235,218,0.06);
      display:flex;align-items:baseline;gap:10px;
    ">
      <div style="
        width:4px;height:4px;border-radius:50%;
        background:rgba(240,235,218,0.25);
        flex-shrink:0;margin-top:6px;
      "></div>
      <div style="
        font-family:var(--font-sans);font-weight:300;
        font-size:13px;letter-spacing:0.03em;
        color:rgba(240,235,218,0.8);
        line-height:1.5;
      ">${item}</div>
    </div>
  `).join('');
}

function buildActionButton(label, opts = {}) {
  const base = `
    display:inline-flex;align-items:center;gap:8px;
    padding:13px 22px;
    border-radius:2px;
    font-family:var(--font-sans);font-weight:300;
    font-size:11px;letter-spacing:0.22em;text-transform:uppercase;
    transition:all 0.2s ease;
    cursor:pointer;
    margin-top:${opts.mt || 0}px;
    margin-right:10px;
    margin-bottom:10px;
  `;

  if (opts.primary) {
    return `
      <button class="${opts.class || ''}"
        ${opts.dataAttrs || ''}
        style="${base}
          background:rgba(240,235,218,0.08);
          border:0.5px solid rgba(240,235,218,0.3);
          color:rgba(240,235,218,0.85);
        "
        onmouseenter="this.style.background='rgba(240,235,218,0.13)'"
        onmouseleave="this.style.background='rgba(240,235,218,0.08)'"
      >${label}</button>
    `;
  }

  return `
    <button class="${opts.class || ''}"
      ${opts.dataAttrs || ''}
      style="${base}
        background:transparent;
        border:0.5px solid rgba(240,235,218,0.15);
        color:rgba(240,235,218,0.45);
      "
      onmouseenter="this.style.borderColor='rgba(240,235,218,0.3)';this.style.color='rgba(240,235,218,0.7)'"
      onmouseleave="this.style.borderColor='rgba(240,235,218,0.15)';this.style.color='rgba(240,235,218,0.45)'"
    >${label}</button>
  `;
}

function buildDoneButton(label = 'Mark done') {
  return buildActionButton(label, {
    class: 'cascade-done',
    primary: true,
    mt: 28,
  });
}

function injectCascadeKeyframes() {
  if (document.getElementById('cascade-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'cascade-keyframes';
  style.textContent = `
    @keyframes cascadeSpin {
      to { transform: rotate(360deg); }
    }
    /* Intake input placeholders — visually subordinate to real data */
    .intake-field::placeholder {
      color: rgba(240,235,218,0.2);
      font-style: italic;
    }
    /* Calendar picker */
    .ylu-cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
    .ylu-cal-day {
      aspect-ratio:1; display:flex; align-items:center; justify-content:center;
      font-family:var(--font-sans); font-weight:300; font-size:11px;
      color:rgba(240,235,218,0.55); border-radius:2px; cursor:pointer;
      transition:background 0.15s ease, color 0.15s ease;
    }
    .ylu-cal-day:hover { background:rgba(240,235,218,0.08); color:rgba(240,235,218,0.9); }
    .ylu-cal-day.today { color:rgba(210,160,60,0.85); }
    .ylu-cal-day.selected { background:rgba(210,160,60,0.18); color:rgba(240,235,218,0.95); font-weight:400; }
    .ylu-cal-day.other-month { color:rgba(240,235,218,0.18); }
    .ylu-cal-day.empty { cursor:default; }
    .ylu-cal-day.empty:hover { background:transparent; }
  `;
  document.head.appendChild(style);
}
injectCascadeKeyframes();

// ---------------------------------------------------------------------------
// CALENDAR PICKER
// Shared inline calendar widget. Renders above a text input so both paths work.
// Usage: buildDateField(id, label, isoValue, opts)
// Returns HTML string. Attach listeners via attachCalendarListeners(el).
// ---------------------------------------------------------------------------

function buildDateField(id, label, isoValue = '', opts = {}) {
  const displayVal = isoValue ? formatDetailDate(isoValue) : '';
  const optStr     = opts.optional ? ' <span style="color:rgba(240,235,218,0.15);">— optional</span>' : '';
  return `
    <div class="ylu-date-field" data-field-id="${id}" style="margin-bottom:20px;">
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.2em;text-transform:uppercase;
        color:rgba(240,235,218,0.3);margin-bottom:8px;
      ">${label}${optStr}</div>

      <!-- Text input — always present -->
      <input
        id="${id}-text"
        class="intake-field ylu-date-text"
        type="text"
        placeholder="e.g. Jan 2025 or 2025-01-15"
        value="${displayVal}"
        autocomplete="off"
        style="
          width:100%;box-sizing:border-box;
          background:rgba(240,235,218,0.04);
          border:0.5px solid rgba(240,235,218,0.12);
          border-radius:2px 2px 0 0;
          padding:13px 16px;
          font-family:var(--font-sans);font-weight:300;
          font-size:15px;letter-spacing:0.02em;
          color:rgba(240,235,218,0.88);
          outline:none;-webkit-appearance:none;
          border-bottom:none;
        "
        onfocus="this.style.borderColor='rgba(240,235,218,0.3)'"
        onblur="this.style.borderColor='rgba(240,235,218,0.12)'"
      />

      <!-- Calendar toggle bar -->
      <button class="ylu-cal-toggle" data-target="${id}" style="
        width:100%;box-sizing:border-box;
        background:rgba(240,235,218,0.02);
        border:0.5px solid rgba(240,235,218,0.12);
        border-top:none;
        border-radius:0 0 2px 2px;
        padding:7px 16px;
        display:flex;align-items:center;gap:8px;
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.2em;text-transform:uppercase;
        color:rgba(240,235,218,0.25);
        cursor:pointer;transition:all 0.15s ease;
        text-align:left;
      "
      onmouseenter="this.style.color='rgba(240,235,218,0.5)';this.style.background='rgba(240,235,218,0.04)'"
      onmouseleave="this.style.color='rgba(240,235,218,0.25)';this.style.background='rgba(240,235,218,0.02)'"
      >
        <span style="font-size:12px;">📅</span> pick a date
      </button>

      <!-- Calendar panel — hidden by default -->
      <div id="${id}-cal" class="ylu-cal-panel" style="display:none;
        background:rgba(20,18,14,0.97);
        border:0.5px solid rgba(240,235,218,0.1);
        border-top:none;border-radius:0 0 4px 4px;
        padding:14px;
      ">
        <!-- Nav row -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <button class="ylu-cal-prev" data-target="${id}" style="
            font-family:var(--font-sans);font-weight:200;font-size:14px;
            color:rgba(240,235,218,0.4);cursor:pointer;padding:4px 8px;
            transition:color 0.15s ease;
          "
          onmouseenter="this.style.color='rgba(240,235,218,0.88)'"
          onmouseleave="this.style.color='rgba(240,235,218,0.4)'"
          >‹</button>
          <div class="ylu-cal-month-label" data-target="${id}" style="
            font-family:var(--font-sans);font-weight:300;
            font-size:11px;letter-spacing:0.18em;text-transform:uppercase;
            color:rgba(240,235,218,0.55);
          "></div>
          <button class="ylu-cal-next" data-target="${id}" style="
            font-family:var(--font-sans);font-weight:200;font-size:14px;
            color:rgba(240,235,218,0.4);cursor:pointer;padding:4px 8px;
            transition:color 0.15s ease;
          "
          onmouseenter="this.style.color='rgba(240,235,218,0.88)'"
          onmouseleave="this.style.color='rgba(240,235,218,0.4)'"
          >›</button>
        </div>
        <!-- Day-of-week headers -->
        <div class="ylu-cal-grid" style="margin-bottom:4px;">
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

      <!-- Hidden ISO value store — read by intake handlers -->
      <input id="${id}" type="hidden" value="${isoValue}" />
    </div>
  `;
}

// Attaches calendar interaction to all .ylu-cal-toggle buttons within el.
// Call once after any render that contains buildDateField() output.
function attachCalendarListeners(el) {
  el.querySelectorAll('.ylu-cal-toggle').forEach(toggle => {
    if (toggle._calInit) return;
    toggle._calInit = true;
    const targetId  = toggle.dataset.target;
    const panel     = el.querySelector(`#${targetId}-cal`);
    const textInput = el.querySelector(`#${targetId}-text`);
    const hidden    = el.querySelector(`#${targetId}`);
    if (!panel || !textInput || !hidden) return;

    // Calendar state
    const state = { year: 0, month: 0 };

    function parseCurrentValue() {
      const iso = hidden.value;
      if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
        const d = new Date(iso + 'T12:00:00');
        return isNaN(d) ? null : d;
      }
      return null;
    }

    function initMonth() {
      const d = parseCurrentValue() || new Date();
      state.year  = d.getFullYear();
      state.month = d.getMonth();
    }

    function renderCalendar() {
      const monthNames = ['January','February','March','April','May','June',
                          'July','August','September','October','November','December'];
      const label = el.querySelector(`.ylu-cal-month-label[data-target="${targetId}"]`);
      if (label) label.textContent = `${monthNames[state.month]} ${state.year}`;

      const grid      = el.querySelector(`.ylu-cal-days[data-target="${targetId}"]`);
      if (!grid) return;
      const today     = new Date();
      const selected  = parseCurrentValue();
      const firstDay  = new Date(state.year, state.month, 1).getDay();
      const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();

      let html = '';
      for (let i = 0; i < firstDay; i++) {
        html += `<div class="ylu-cal-day empty"></div>`;
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const isToday    = today.getFullYear() === state.year && today.getMonth() === state.month && today.getDate() === d;
        const isSelected = selected && selected.getFullYear() === state.year && selected.getMonth() === state.month && selected.getDate() === d;
        const iso = `${state.year}-${String(state.month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        html += `<div class="ylu-cal-day${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}"
          data-iso="${iso}" data-target="${targetId}">${d}</div>`;
      }
      grid.innerHTML = html;

      // Day click listeners
      grid.querySelectorAll('.ylu-cal-day[data-iso]').forEach(day => {
        day.addEventListener('click', () => {
          const iso = day.dataset.iso;
          hidden.value    = iso;
          textInput.value = formatDetailDate(iso);
          panel.style.display = 'none';
          toggle.style.display = '';
          renderCalendar(); // re-render to show selection
          // Fire change so intake handlers can read the value
          hidden.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
    }

    // Toggle open/close
    toggle.addEventListener('click', () => {
      const isOpen = panel.style.display !== 'none';
      if (isOpen) {
        panel.style.display = 'none';
      } else {
        initMonth();
        panel.style.display = 'block';
        renderCalendar();
      }
    });

    // Prev/next month
    const prev = el.querySelector(`.ylu-cal-prev[data-target="${targetId}"]`);
    const next = el.querySelector(`.ylu-cal-next[data-target="${targetId}"]`);
    if (prev) prev.addEventListener('click', e => { e.stopPropagation(); state.month--; if (state.month < 0) { state.month = 11; state.year--; } renderCalendar(); });
    if (next) next.addEventListener('click', e => { e.stopPropagation(); state.month++; if (state.month > 11) { state.month = 0; state.year++; } renderCalendar(); });

    // Text input — parse on blur and sync hidden value
    textInput.addEventListener('blur', () => {
      const raw = textInput.value.trim();
      if (!raw) { hidden.value = ''; return; }
      const d = new Date(raw);
      if (!isNaN(d)) {
        hidden.value = d.toISOString().split('T')[0];
        textInput.value = formatDetailDate(hidden.value);
        renderCalendar();
      }
    });
  });
}

// ---------------------------------------------------------------------------
// HC-1 — VEHICLE REGISTRATION
// Jurisdiction-aware. BC: ICBC Autoplan only. AB: private market.
// Generic: online / mail / in-person routes.
// ---------------------------------------------------------------------------

const vehicleRegistrationRenderer = {

  async resolve(context, preference) {
    const province = context.plate_province || context.province || 'generic';

    // BC — combined reg + insurance through ICBC Autoplan
    if (province === 'BC') {
      const routes = [
        { id: 'icbc_online',  label: 'ICBC Online',     description: 'icbc.com — ~10 minutes' },
        { id: 'autoplan_broker', label: 'Autoplan Broker', description: 'In person, walk-in' },
      ];
      const route = preference && routes.find(r => r.id === preference) ? preference : null;
      return { routes, route: route || (preference ? preference : null) };
    }

    // AB — standard registration, separate from private insurance
    if (province === 'AB') {
      const routes = [
        { id: 'ab_online',    label: 'Online',      description: 'alberta.ca — registry agent' },
        { id: 'ab_registry',  label: 'Registry Agent', description: 'In person, walk-in' },
      ];
      const route = preference && routes.find(r => r.id === preference) ? preference : null;
      return { routes, route };
    }

    // Generic — other provinces/states
    const routes = [
      { id: 'online',    label: 'Online',     description: 'Provincial portal' },
      { id: 'by_mail',   label: 'By Mail',    description: 'Allow extra time' },
      { id: 'in_person', label: 'In Person',  description: 'Registry office' },
    ];
    const route = preference && routes.find(r => r.id === preference) ? preference : null;
    return { routes, route };
  },

  async buildRoute(route, context) {
    const province = context.plate_province || context.province || 'generic';
    const vehicle  = getVehicle(context.vehicle_id);
    const name     = vehicle?.name || 'Your vehicle';

    // Show loading state then fetch AI content
    const loadingId = `cascade-route-${Date.now()}`;

    // Kick off AI call — pass user location for broker recommendations
    const user     = store.get('user') || {};
    const dataPromise = api.getRegistrationCascade({
      route,
      province,
      vehicle_name: name,
      vehicle_year: vehicle?.year || null,
      city: user.city || null,
      lat:  user.lat  || null,
      lng:  user.lng  || null,
    });

    // Return loading HTML immediately — JS will replace it
    setTimeout(async () => {
      try {
        const data  = await dataPromise;
        const inner = document.getElementById(loadingId);
        if (inner) inner.innerHTML = buildRegistrationRouteHTML(route, data, name);
        // Re-attach listeners for new buttons
        attachDynamicListeners();
      } catch (err) {
        const inner = document.getElementById(loadingId);
        if (inner) inner.innerHTML = buildErrorHTML();
      }
    }, 0);

    return `<div id="${loadingId}">${buildLoadingHTML()}</div>`;
  },

  complete(context, route, update) {
    // Mark registration renewed — prompt for new expiry date
    const vehicles = store.get('vehicles') || [];
    const updated  = vehicles.map(v => {
      if (v.id !== context.vehicle_id) return v;
      return { ...v, registration_expiry: update.new_expiry || null };
    });
    store.set('vehicles', updated);
    logCascadeComplete('vehicle_registration', context.vehicle_id, route);
  },
};

function buildRegistrationRouteHTML(route, data, vehicleName) {
  const sections = [];

  if (route === 'icbc_online') {
    sections.push(buildDetailRow('What you need', data.what_you_need?.join('<br>') || 'BC driver\'s licence · Vehicle info · Payment'));
    sections.push(buildDetailRow('Estimated cost', data.estimated_cost || 'Varies by vehicle class'));
    sections.push(buildDetailRow('Time', data.time_estimate || '~10 minutes'));
    if (data.eligibility_note) sections.push(buildDetailRow('Note', data.eligibility_note, { dim: true }));
    return sections.join('') + `
      <div style="margin-top:24px;display:flex;flex-wrap:wrap;">
        ${buildActionButton('Open ICBC', { primary: true, class: 'cascade-link', dataAttrs: 'data-url="https://onlinebusiness.icbc.com/webdeal/"' })}
        ${buildDoneButton('Mark renewed')}
      </div>
    `;
  }

  if (route === 'autoplan_broker' || route === 'ab_registry' || route === 'in_person') {
    sections.push(buildDetailRow('What to bring', data.what_to_bring?.join('<br>') || 'Current vehicle portion · Payment · ID'));
    sections.push(buildDetailRow('Estimated cost', data.estimated_cost || 'Varies by vehicle class'));

    // Broker list — 2-3 options ordered by proximity
    if (data.brokers?.length) {
      const brokerHTML = data.brokers.map((b, i) => `
        <div style="
          padding:14px 0;
          border-bottom:0.5px solid rgba(240,235,218,0.06);
        ">
          <div style="
            font-family:var(--font-sans);font-weight:300;
            font-size:13px;letter-spacing:0.03em;
            color:rgba(240,235,218,0.85);
            margin-bottom:4px;
          ">${b.name}</div>
          ${b.address ? `<div style="
            font-family:var(--font-sans);font-weight:200;
            font-size:11px;letter-spacing:0.03em;
            color:rgba(240,235,218,0.4);
            margin-bottom:8px;
          ">${b.address}${b.hours ? ` · ${b.hours}` : ''}</div>` : ''}
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${b.address ? `<button class="cascade-directions" data-address="${b.address}" style="
              font-family:var(--font-sans);font-weight:200;
              font-size:9px;letter-spacing:0.18em;text-transform:uppercase;
              color:rgba(240,235,218,0.4);
              padding:4px 10px;
              border:0.5px solid rgba(240,235,218,0.12);border-radius:1px;
              transition:all 0.2s ease;
            ">directions</button>` : ''}
            ${b.phone ? `<button class="cascade-call" data-phone="${b.phone}" style="
              font-family:var(--font-sans);font-weight:200;
              font-size:9px;letter-spacing:0.18em;text-transform:uppercase;
              color:rgba(240,235,218,0.4);
              padding:4px 10px;
              border:0.5px solid rgba(240,235,218,0.12);border-radius:1px;
              transition:all 0.2s ease;
            ">call</button>` : ''}
          </div>
        </div>
      `).join('');

      sections.push(`
        <div style="padding:4px 0 0;">
          <div style="
            font-family:var(--font-sans);font-weight:200;
            font-size:10px;letter-spacing:0.2em;text-transform:uppercase;
            color:rgba(240,235,218,0.3);
            margin-bottom:4px;padding-bottom:8px;
            border-bottom:0.5px solid rgba(240,235,218,0.06);
          ">Nearest brokers</div>
          ${brokerHTML}
        </div>
      `);
    }

    // Always include a Maps search fallback
    const mapsQuery = data.maps_search_query || (province === 'BC' ? 'ICBC Autoplan broker' : 'vehicle registry agent');
    const mapsUrl   = `https://www.google.com/maps/search/${encodeURIComponent(mapsQuery + (data.brokers?.length ? '' : ' near me'))}`;

    return sections.join('') + `
      <div style="margin-top:24px;display:flex;flex-wrap:wrap;align-items:center;">
        ${buildActionButton('Find more on Maps', { class: 'cascade-link', dataAttrs: `data-url="${mapsUrl}"` })}
        ${buildDoneButton('Mark renewed')}
      </div>
    `;
  }

  if (route === 'ab_online') {
    sections.push(buildDetailRow('What you need', data.what_you_need?.join('<br>') || 'Alberta registry account · Vehicle info · Payment'));
    sections.push(buildDetailRow('Estimated cost', data.estimated_cost || 'Varies by vehicle class'));
    return sections.join('') + `
      <div style="margin-top:24px;display:flex;flex-wrap:wrap;">
        ${buildActionButton('Open Registry', { primary: true, class: 'cascade-link', dataAttrs: 'data-url="https://www.alberta.ca/vehicle-registration.aspx"' })}
        ${buildDoneButton('Mark renewed')}
      </div>
    `;
  }

  // Generic routes
  if (route === 'online') {
    sections.push(buildDetailRow('How', data.instructions || 'Visit your provincial registration portal'));
    if (data.portal_url) sections.push(buildDetailRow('Portal', data.portal_url, { dim: true }));
    sections.push(buildDetailRow('What you need', data.what_you_need?.join('<br>') || 'Driver\'s licence · Vehicle info · Payment'));
    return sections.join('') + `
      <div style="margin-top:24px;display:flex;flex-wrap:wrap;">
        ${data.portal_url ? buildActionButton('Open Portal', { primary: true, class: 'cascade-link', dataAttrs: `data-url="${data.portal_url}"` }) : ''}
        ${buildDoneButton('Mark renewed')}
      </div>
    `;
  }

  if (route === 'by_mail') {
    sections.push(buildDetailRow('Mail to', data.mail_address || 'Contact your provincial authority'));
    sections.push(buildDetailRow('Include', data.mail_include?.join('<br>') || 'Payment · Current registration copy'));
    sections.push(buildDetailRow('Processing', data.processing_time || 'Allow 2–3 weeks'));
    return sections.join('') + `<div style="margin-top:24px;">${buildDoneButton('Mark renewed')}</div>`;
  }

  return buildErrorHTML();
}

// ---------------------------------------------------------------------------
// HC-2 — VEHICLE SERVICE
// DIY: full parts list, specs, disposal. Dealer/shop: nearest + booking.
// ---------------------------------------------------------------------------

const vehicleServiceRenderer = {

  async resolve(context, preference) {
    const routes = [
      { id: 'diy',    label: 'Do It Myself',    description: 'Parts list, specs, disposal' },
      { id: 'dealer', label: 'Dealer',           description: 'Manufacturer service centre' },
      { id: 'shop',   label: 'Preferred Shop',   description: context.preferred_shop || 'Or find one nearby' },
    ];
    const route = preference && routes.find(r => r.id === preference) ? preference : null;
    return { routes, route };
  },

  async buildRoute(route, context) {
    const vehicle = getVehicle(context.vehicle_id);
    const name    = vehicle?.name || 'Your vehicle';
    const loadingId = `cascade-route-${Date.now()}`;

    const dataPromise = api.getServiceCascade({
      route,
      vehicle_year:  vehicle?.year  || null,
      vehicle_make:  vehicle?.make  || null,
      vehicle_model: vehicle?.model || null,
      service_type:  context.service_type || 'oil_change',
      preferred_shop: context.preferred_shop || null,
    });

    setTimeout(async () => {
      try {
        const data  = await dataPromise;
        const inner = document.getElementById(loadingId);
        if (inner) inner.innerHTML = buildServiceRouteHTML(route, data, name);
        attachDynamicListeners();
      } catch (err) {
        const inner = document.getElementById(loadingId);
        if (inner) inner.innerHTML = buildErrorHTML();
      }
    }, 0);

    return `<div id="${loadingId}">${buildLoadingHTML()}</div>`;
  },

  complete(context, route, update) {
    const vehicles = store.get('vehicles') || [];
    const updated  = vehicles.map(v => {
      if (v.id !== context.vehicle_id) return v;
      return { ...v, service_due: update.new_service_due || null };
    });
    store.set('vehicles', updated);
    logCascadeComplete('vehicle_service', context.vehicle_id, route);
  },
};

function buildServiceRouteHTML(route, data, vehicleName) {
  const sections = [];

  if (route === 'diy') {
    if (data.oil_spec)    sections.push(buildDetailRow('Oil', `${data.oil_volume_litres}L · ${data.oil_spec}`));
    if (data.filter_part) sections.push(buildDetailRow('Filter', `${data.filter_part_oem}${data.filter_part_aftermarket ? ` · or ${data.filter_part_aftermarket}` : ''}`));
    if (data.drain_plug_washer) sections.push(buildDetailRow('Drain plug washer', data.drain_plug_washer));
    if (data.tools?.length)     sections.push(buildDetailRow('Tools', buildListHTML(data.tools)));
    if (data.torque_spec)       sections.push(buildDetailRow('Torque', data.torque_spec));
    if (data.maintenance_light_reset) sections.push(buildDetailRow('Reset maintenance light', data.maintenance_light_reset));

    const disposalBtn = data.disposal_search_query
      ? buildActionButton('Find oil disposal', {
          class: 'cascade-link',
          dataAttrs: `data-url="https://www.google.com/maps/search/${encodeURIComponent(data.disposal_search_query)}"`,
        })
      : '';

    return sections.join('') + `
      <div style="margin-top:24px;display:flex;flex-wrap:wrap;">
        ${disposalBtn}
        ${buildDoneButton('Mark done')}
      </div>
    `;
  }

  if (route === 'dealer') {
    if (data.dealer_name)    sections.push(buildDetailRow('Dealer', `${data.dealer_name}<br><span style="color:rgba(240,235,218,0.4);font-size:12px;">${data.dealer_address || ''}</span>`));
    if (data.dealer_hours)   sections.push(buildDetailRow('Hours', data.dealer_hours, { dim: true }));
    if (data.dealer_phone)   sections.push(buildDetailRow('Phone', data.dealer_phone, { dim: true }));
    sections.push(buildDetailRow('Mention', `${vehicleName} · ${data.service_type_label || 'Service due'} · current mileage`));

    const dirBtn   = data.dealer_address ? buildActionButton('Directions', { class: 'cascade-directions', dataAttrs: `data-address="${data.dealer_address}"` }) : '';
    const callBtn  = data.dealer_phone   ? buildActionButton('Call', { class: 'cascade-call', dataAttrs: `data-phone="${data.dealer_phone}"` }) : '';
    const bookBtn  = data.booking_url    ? buildActionButton('Book Online', { primary: true, class: 'cascade-link', dataAttrs: `data-url="${data.booking_url}"` }) : '';

    return sections.join('') + `
      <div style="margin-top:24px;display:flex;flex-wrap:wrap;">
        ${dirBtn}${callBtn}${bookBtn}
        ${buildDoneButton('Mark done')}
      </div>
    `;
  }

  if (route === 'shop') {
    if (data.shop_name)  sections.push(buildDetailRow('Shop', `${data.shop_name}<br><span style="color:rgba(240,235,218,0.4);font-size:12px;">${data.shop_address || ''}</span>`));
    if (data.shop_hours) sections.push(buildDetailRow('Hours', data.shop_hours, { dim: true }));
    if (data.shop_phone) sections.push(buildDetailRow('Phone', data.shop_phone, { dim: true }));

    const dirBtn  = data.shop_address ? buildActionButton('Directions', { class: 'cascade-directions', dataAttrs: `data-address="${data.shop_address}"` }) : '';
    const callBtn = data.shop_phone   ? buildActionButton('Call', { primary: true, class: 'cascade-call', dataAttrs: `data-phone="${data.shop_phone}"` }) : '';

    return sections.join('') + `
      <div style="margin-top:24px;display:flex;flex-wrap:wrap;">
        ${dirBtn}${callBtn}
        ${buildDoneButton('Mark done')}
      </div>
    `;
  }

  return buildErrorHTML();
}

// ---------------------------------------------------------------------------
// HC-5 — MEDICAL APPOINTMENT
// Book with existing provider, or find nearest accepting patients.
// ---------------------------------------------------------------------------

const medicalAppointmentRenderer = {

  async resolve(context, preference) {
    const hasProvider = !!(context.provider_name || context.provider_phone);
    const routes = hasProvider
      ? [
          { id: 'book',    label: context.provider_name || 'My Doctor', description: 'Book with your provider' },
          { id: 'find',    label: 'Find a Clinic',    description: 'Walk-in or accepting new patients' },
        ]
      : [
          { id: 'find',    label: 'Find a Clinic',    description: 'Walk-in or accepting new patients' },
          { id: 'book',    label: 'Add My Doctor',    description: 'Save for next time' },
        ];
    const route = preference && routes.find(r => r.id === preference) ? preference : (hasProvider ? 'book' : 'find');
    return { routes, route };
  },

  async buildRoute(route, context) {
    const loadingId = `cascade-route-${Date.now()}`;

    const dataPromise = api.getMedicalCascade({
      route,
      appointment_type: context.appointment_type || 'general',
      provider_name:    context.provider_name    || null,
      provider_phone:   context.provider_phone   || null,
      provider_url:     context.provider_url     || null,
      province:         context.province         || store.get('user')?.province || null,
    });

    setTimeout(async () => {
      try {
        const data  = await dataPromise;
        const inner = document.getElementById(loadingId);
        if (inner) inner.innerHTML = buildMedicalRouteHTML(route, data, context);
        attachDynamicListeners();
      } catch (err) {
        const inner = document.getElementById(loadingId);
        if (inner) inner.innerHTML = buildErrorHTML();
      }
    }, 0);

    return `<div id="${loadingId}">${buildLoadingHTML('Finding your options…')}</div>`;
  },

  complete(context, route, update) {
    // Update last_visit date for this appointment type
    const health = store.get('health') || {};
    health[context.appointment_type || 'general'] = {
      last_visit: new Date().toISOString().split('T')[0],
      provider:   context.provider_name || null,
    };
    store.set('health', health);
    logCascadeComplete('medical_appointment', context.appointment_type, route);
  },
};

function buildMedicalRouteHTML(route, data, context) {
  const sections = [];

  if (route === 'book') {
    const name  = context.provider_name  || data.provider_name  || 'Your provider';
    const phone = context.provider_phone || data.provider_phone || null;
    const url   = context.provider_url   || data.booking_url    || null;

    sections.push(buildDetailRow('Provider', name));
    if (data.provider_address) sections.push(buildDetailRow('Address', data.provider_address));
    if (data.provider_hours)   sections.push(buildDetailRow('Hours', data.provider_hours, { dim: true }));
    sections.push(buildDetailRow('What to mention', data.what_to_mention || `Annual physical · last visit ${data.last_visit_label || 'on file'}`));

    const callBtn = phone ? buildActionButton('Call', { primary: true, class: 'cascade-call', dataAttrs: `data-phone="${phone}"` }) : '';
    const bookBtn = url   ? buildActionButton('Book Online', { primary: !phone, class: 'cascade-link', dataAttrs: `data-url="${url}"` }) : '';

    return sections.join('') + `
      <div style="margin-top:24px;display:flex;flex-wrap:wrap;">
        ${callBtn}${bookBtn}
        ${buildDoneButton('Mark booked')}
      </div>
    `;
  }

  if (route === 'find') {
    if (data.clinic_name) {
      sections.push(buildDetailRow('Nearest clinic', `${data.clinic_name}<br><span style="color:rgba(240,235,218,0.4);font-size:12px;">${data.clinic_address || ''}</span>`));
      if (data.clinic_hours)    sections.push(buildDetailRow('Hours', data.clinic_hours, { dim: true }));
      if (data.clinic_phone)    sections.push(buildDetailRow('Phone', data.clinic_phone, { dim: true }));
      if (data.accepting_note)  sections.push(buildDetailRow('New patients', data.accepting_note, { dim: true }));
    } else {
      sections.push(buildDetailRow('Find a clinic', data.search_note || 'Search for walk-in clinics or family practices accepting new patients in your area'));
    }

    const searchQuery = encodeURIComponent(data.search_query || 'walk-in clinic near me');
    const dirBtn   = data.clinic_address ? buildActionButton('Directions', { class: 'cascade-directions', dataAttrs: `data-address="${data.clinic_address}"` }) : '';
    const callBtn  = data.clinic_phone   ? buildActionButton('Call', { class: 'cascade-call', dataAttrs: `data-phone="${data.clinic_phone}"` }) : '';
    const searchBtn = buildActionButton('Search Clinics', {
      primary: !data.clinic_name,
      class: 'cascade-link',
      dataAttrs: `data-url="https://www.google.com/maps/search/${searchQuery}"`,
    });

    return sections.join('') + `
      <div style="margin-top:24px;display:flex;flex-wrap:wrap;">
        ${dirBtn}${callBtn}${searchBtn}
        ${buildDoneButton('Mark booked')}
      </div>
    `;
  }

  return buildErrorHTML();
}

// ---------------------------------------------------------------------------
// VEHICLE INTAKE — New vehicle entry cascade
//
// Triggered by the "Add a vehicle" CTA in the vehicles grab and go.
// Minimum viable entry: year, make, model, approximate mileage.
// Everything else is asked once, progressively, or inferred from the
// Mazda/Toyota/etc maintenance schedule via AI.
//
// Steps:
//   step_identity   — year, make, model (required)
//   step_mileage    — current odometer (required — everything else derives)
//   step_service    — last oil change date + mileage, preferred interval
//   step_history    — known recent work (optional — skip gracefully)
//   step_details    — plate province, preferred shop, VIN (all optional)
//   step_review     — summary before writing to store
//
// The AI contract fires once after step_mileage:
//   given year/make/model + mileage → return maintenance timeline,
//   scheduled items due now or soon, and next service windows.
//
// Store shape written on completion:
// {
//   id: 'v_<timestamp>',
//   name: '2015 Mazda3 Sport',
//   year, make, model, variant,
//   mileage_at_entry: 267000,
//   mileage_date: '2026-05-25',
//   plate_province: 'BC',
//   preferred_shop: 'Mr. Lube',
//   preferred_interval_km: 8000,
//   vin: null,
//   transmission: 'manual',
//   service_history: [
//     { date, mileage, type, shop, notes }
//   ],
//   maintenance_schedule: { ... },  // AI-generated
//   service_due: '<next_oil_date>',
//   registration_expiry: null,       // asked separately or from ICBC
//   insurance_expiry: null,
// }
// ---------------------------------------------------------------------------

// Internal state for the multi-step intake flow.
// Lives only for the duration of one cascade open — reset on each open.
function createIntakeState() {
  return {
    step: 'step_identity',
    year: '', make: '', model: '', variant: '',
    mileage: '',
    last_oil_date: '', last_oil_mileage: '',
    interval_km: '',
    history: [],         // [{ type, date, mileage, notes }]
    transmission: '',
    plate_province: store.get('user')?.province || '',
    preferred_shop: '',
    vin: '',
    ai_schedule: null,   // populated after step_mileage AI call
  };
}

const vehicleIntakeRenderer = {

  // resolve() is called once on open — returns the intake step UI
  // For intake, there's no "route" concept — we always start at step_identity.
  async resolve(context, _preference) {
    return { routes: [], route: 'intake' };
  },

  async buildRoute(_route, context) {
    // context carries intakeState when re-rendering steps
    const state = context._intakeState || createIntakeState();
    context._intakeState = state;
    return buildIntakeStep(state, context);
  },

  complete(context, _route, _update) {
    const state = context._intakeState;
    if (!state) return;

    const vehicles = store.get('vehicles') || [];

    // Edit mode — update existing vehicle rather than creating a new one
    if (state._editingVehicleId) {
      const idx = vehicles.findIndex(v => v.id === state._editingVehicleId);
      if (idx >= 0) {
        vehicles[idx] = {
          ...vehicles[idx],
          name: [state.year, state.make, state.model, state.variant].filter(Boolean).join(' '),
          year:  state.year,
          make:  state.make,
          model: state.model,
          variant: state.variant || null,
          mileage_at_entry: parseInt(state.mileage, 10) || vehicles[idx].mileage_at_entry,
          mileage_date: new Date().toISOString().split('T')[0],
          last_oil_date: state.last_oil_date || vehicles[idx].last_oil_date || null,
          last_oil_mileage: parseInt(state.last_oil_mileage, 10) || vehicles[idx].last_oil_mileage || null,
          plate_province: state.plate_province || vehicles[idx].plate_province || null,
          preferred_shop: state.preferred_shop || vehicles[idx].preferred_shop || null,
          preferred_interval_km: parseInt(state.interval_km, 10) || vehicles[idx].preferred_interval_km || 8000,
          vin: state.vin || vehicles[idx].vin || null,
          transmission: state.transmission || vehicles[idx].transmission || null,
          service_history: state.history?.length ? state.history : vehicles[idx].service_history || [],
          maintenance_schedule: state.ai_schedule ? { ...state.ai_schedule, vehicle_facts: undefined } : vehicles[idx].maintenance_schedule,
          // vehicle_facts locked — only update if none exist yet
          vehicle_facts: vehicles[idx].vehicle_facts || state.ai_schedule?.vehicle_facts || null,
          service_due: state.ai_schedule?.next_oil_change_date || vehicles[idx].service_due || null,
        };
        store.set('vehicles', vehicles);
        logCascadeComplete('vehicle_intake', state._editingVehicleId, 'edited');
      }
      return;
    }

    // New vehicle
    const id = `v_${Date.now()}`;

    const newVehicle = {
      id,
      name: [state.year, state.make, state.model, state.variant].filter(Boolean).join(' '),
      year:  state.year,
      make:  state.make,
      model: state.model,
      variant: state.variant || null,
      mileage_at_entry: parseInt(state.mileage, 10) || null,
      mileage_date: new Date().toISOString().split('T')[0],
      last_oil_date: state.last_oil_date || null,
      last_oil_mileage: parseInt(state.last_oil_mileage, 10) || null,
      plate_province: state.plate_province || store.get('user')?.province || null,
      preferred_shop: state.preferred_shop || null,
      preferred_interval_km: parseInt(state.interval_km, 10) || 8000,
      vin: state.vin || null,
      transmission: state.transmission || null,
      service_history: state.history || [],
      maintenance_schedule: state.ai_schedule ? { ...state.ai_schedule, vehicle_facts: undefined } : null,
      vehicle_facts: state.ai_schedule?.vehicle_facts || null,
      service_due: state.ai_schedule?.next_oil_change_date || null,
      registration_expiry: null,
      insurance_expiry: null,
    };

    vehicles.push(newVehicle);
    store.set('vehicles', vehicles);
    logCascadeComplete('vehicle_intake', id, 'complete');
  },
};

// ---------------------------------------------------------------------------
// INTAKE STEP BUILDERS
// Each step renders its own form. On confirm, advances state and re-renders.
// ---------------------------------------------------------------------------

function buildIntakeStep(state, context) {
  switch (state.step) {
    case 'step_identity': return buildIdentityStep(state, context);
    case 'step_mileage':  return buildMileageStep(state, context);
    case 'step_service':  return buildServiceStep(state, context);
    case 'step_history':  return buildHistoryStep(state, context);
    case 'step_details':  return buildDetailsStep(state, context);
    case 'step_review':   return buildReviewStep(state, context);
    default:              return buildIdentityStep(state, context);
  }
}

// Shared step wrapper — progress indicator + content
function buildStepWrapper(stepNum, totalSteps, content) {
  const pct = Math.round((stepNum / totalSteps) * 100);
  return `
    <div>
      <!-- Progress bar -->
      <div style="
        height:1px;background:rgba(240,235,218,0.06);
        margin-bottom:28px;position:relative;
      ">
        <div style="
          position:absolute;top:0;left:0;height:100%;
          width:${pct}%;
          background:rgba(210,160,60,0.5);
          transition:width 0.4s ease;
        "></div>
      </div>
      ${content}
    </div>
  `;
}

function buildIntakeInput(id, label, placeholder, value = '', opts = {}) {
  return `
    <div style="margin-bottom:20px;">
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.2em;text-transform:uppercase;
        color:rgba(240,235,218,0.3);margin-bottom:8px;
      ">${label}${opts.optional ? ' <span style="color:rgba(240,235,218,0.15);">— optional</span>' : ''}</div>
      <input
        id="${id}"
        class="intake-field"
        type="${opts.type || 'text'}"
        inputmode="${opts.inputmode || 'text'}"
        placeholder="${placeholder}"
        value="${value}"
        style="
          width:100%;box-sizing:border-box;
          background:rgba(240,235,218,0.04);
          border:0.5px solid rgba(240,235,218,0.12);
          border-radius:2px;
          padding:14px 16px;
          font-family:var(--font-sans);font-weight:300;
          font-size:15px;letter-spacing:0.02em;
          color:rgba(240,235,218,0.88);
          outline:none;
          -webkit-appearance:none;
        "
        onfocus="this.style.borderColor='rgba(240,235,218,0.3)'"
        onblur="this.style.borderColor='rgba(240,235,218,0.12)'"
      />
    </div>
  `;
}

function buildIntakeProceedButton(label = 'Continue') {
  return `
    <button id="intake-proceed" style="
      margin-top:8px;
      display:inline-flex;align-items:center;
      padding:14px 28px;
      background:rgba(240,235,218,0.08);
      border:0.5px solid rgba(240,235,218,0.3);
      border-radius:2px;
      font-family:var(--font-sans);font-weight:300;
      font-size:11px;letter-spacing:0.22em;text-transform:uppercase;
      color:rgba(240,235,218,0.85);
      cursor:pointer;
      transition:all 0.2s ease;
    "
    onmouseenter="this.style.background='rgba(240,235,218,0.13)'"
    onmouseleave="this.style.background='rgba(240,235,218,0.08)'"
    >${label}</button>
  `;
}

function buildSkipLink(label = 'Skip this') {
  return `
    <button id="intake-skip" style="
      margin-top:16px;margin-left:16px;
      font-family:var(--font-sans);font-weight:200;
      font-size:10px;letter-spacing:0.18em;text-transform:uppercase;
      color:rgba(240,235,218,0.2);
      cursor:pointer;
      transition:color 0.2s ease;
    "
    onmouseenter="this.style.color='rgba(240,235,218,0.45)'"
    onmouseleave="this.style.color='rgba(240,235,218,0.2)'"
    >${label}</button>
  `;
}

// Step 1 — Year, make, model, variant
function buildIdentityStep(state, context) {
  return buildStepWrapper(1, 5, `
    <div style="
      font-family:var(--font-sans);font-weight:200;
      font-size:12px;letter-spacing:0.06em;
      color:rgba(240,235,218,0.4);
      margin-bottom:24px;line-height:1.6;
    ">What are we working with?</div>

    ${buildIntakeInput('intake-year',    'Year',          'e.g. 2019',      state.year,    { inputmode: 'numeric' })}
    ${buildIntakeInput('intake-make',    'Make',          'e.g. Toyota',    state.make)}
    ${buildIntakeInput('intake-model',   'Model',         'e.g. Camry',     state.model)}
    ${buildIntakeInput('intake-variant', 'Trim / Variant','e.g. LE',        state.variant, { optional: true })}

    <div style="display:flex;align-items:center;margin-top:8px;">
      ${buildIntakeProceedButton('Continue')}
    </div>
  `);
}

// Step 2 — Current mileage. AI call fires here.
function buildMileageStep(state, context) {
  return buildStepWrapper(2, 5, `
    <div style="
      font-family:var(--font-serif);font-style:italic;font-weight:300;
      font-size:15px;color:rgba(240,235,218,0.6);
      margin-bottom:24px;line-height:1.6;
    ">${state.year} ${state.make} ${state.model}${state.variant ? ' ' + state.variant : ''}</div>

    <div style="
      font-family:var(--font-sans);font-weight:200;
      font-size:12px;letter-spacing:0.06em;
      color:rgba(240,235,218,0.4);
      margin-bottom:24px;line-height:1.6;
    ">What's on the odometer right now?<br>
    <span style="font-size:11px;color:rgba(240,235,218,0.2);">Approximate is fine — I'll build from here.</span></div>

    ${buildIntakeInput('intake-mileage', 'Current kilometres', 'e.g. 85000', state.mileage, { inputmode: 'numeric' })}

    <div style="display:flex;align-items:center;margin-top:8px;">
      ${buildIntakeProceedButton('Continue')}
    </div>
  `);
}

// Step 3 — Last service + preferred interval
function buildServiceStep(state, context) {
  const hasAiSchedule = !!state.ai_schedule;
  const hint = hasAiSchedule && state.ai_schedule.next_oil_change_date
    ? `<div style="
        margin-top:-12px;margin-bottom:20px;
        font-family:var(--font-sans);font-weight:200;
        font-size:11px;letter-spacing:0.04em;
        color:rgba(210,160,60,0.6);line-height:1.5;
      ">Based on the schedule, next oil change window is around ${state.ai_schedule.next_oil_change_date}.</div>`
    : '';

  return buildStepWrapper(3, 5, `
    <div style="
      font-family:var(--font-sans);font-weight:200;
      font-size:12px;letter-spacing:0.06em;
      color:rgba(240,235,218,0.4);
      margin-bottom:24px;line-height:1.6;
    ">Last oil change — when and how many kilometres?<br>
    <span style="font-size:11px;color:rgba(240,235,218,0.2);">If you're not sure, give me your best guess.</span></div>

    ${buildDateField('intake-last-oil-date', 'Date', state.last_oil_date || '', {})}
    ${buildIntakeInput('intake-last-oil-mileage', 'Kilometres',  'e.g. 76000',     state.last_oil_mileage, { inputmode: 'numeric', optional: false })}
    ${buildIntakeInput('intake-interval',         'Your preferred interval (km)', 'e.g. 8000', state.interval_km, { inputmode: 'numeric', optional: true })}

    ${hint}

    <div style="display:flex;align-items:center;margin-top:8px;">
      ${buildIntakeProceedButton('Continue')}
      ${buildSkipLink("I don't know")}
    </div>
  `);
}

// Step 4 — Service history: major systems model
// Each system is an expandable section. Common tiles inside. + other for anything else.
// Tap a tile to toggle it into state.history. Items carry a system tag.
function buildHistoryStep(state, context) {

  const SYSTEMS = [
    {
      id: 'engine',
      label: 'Engine',
      tiles: [
        { id: 'oil_change',       label: 'Oil change' },
        { id: 'air_filter',       label: 'Air filter' },
        { id: 'spark_plugs',      label: 'Spark plugs' },
        { id: 'fuel_system',      label: 'Fuel system service' },
        { id: 'coolant_flush',    label: 'Coolant flush' },
      ],
    },
    {
      id: 'suspension_wheels_tires',
      label: 'Suspension, Wheels & Tires',
      tiles: [
        { id: 'tires_new',        label: 'New tires' },
        { id: 'tires_summer',     label: 'Summer swap' },
        { id: 'tires_winter',     label: 'Winter swap' },
        { id: 'rotation',         label: 'Rotation' },
        { id: 'balance',          label: 'Balance' },
        { id: 'alignment',        label: 'Alignment' },
        { id: 'struts_front',     label: 'Front struts' },
        { id: 'struts_rear',      label: 'Rear struts' },
        { id: 'sway_bar_links',   label: 'Sway bar links' },
        { id: 'cv_axle',          label: 'CV axle / boot' },
      ],
    },
    {
      id: 'brakes',
      label: 'Brakes',
      tiles: [
        { id: 'brake_pads_front', label: 'Front pads' },
        { id: 'brake_pads_rear',  label: 'Rear pads' },
        { id: 'rotors',           label: 'Rotors' },
        { id: 'brake_fluid',      label: 'Fluid flush' },
      ],
    },
    {
      id: 'transmission',
      label: 'Transmission',
      tiles: [
        { id: 'trans_fluid',      label: 'Fluid change' },
        { id: 'trans_filter',     label: 'Filter' },
      ],
    },
    {
      id: 'electrical',
      label: 'Electrical',
      tiles: [
        { id: 'battery',          label: 'Battery' },
        { id: 'alternator',       label: 'Alternator' },
      ],
    },
    {
      id: 'belts_hoses',
      label: 'Belts & Hoses',
      tiles: [
        { id: 'serpentine_belt',  label: 'Serpentine belt' },
        { id: 'timing_service',   label: 'Timing belt / chain service' },
      ],
    },
    {
      id: 'filters',
      label: 'Filters',
      tiles: [
        { id: 'cabin_filter',     label: 'Cabin air filter' },
        { id: 'fuel_filter',      label: 'Fuel filter' },
      ],
    },
  ];

  const checkedIds = state.history.map(h => h.type);

  // Track which systems are expanded — stored on state to survive re-renders
  if (!state._expandedSystems) state._expandedSystems = {};

  const systemSections = SYSTEMS.map(system => {
    const systemItems   = state.history.filter(h => h.system === system.id);
    const systemChecked = systemItems.length;
    const isExpanded    = !!state._expandedSystems[system.id];

    const tiles = system.tiles.map(tile => {
      const checked = checkedIds.includes(tile.id);
      return `
        <button class="intake-history-tile"
          data-id="${tile.id}"
          data-label="${tile.label}"
          data-system="${system.id}"
          style="
            padding:10px 14px;margin:0 6px 6px 0;
            border-radius:2px;
            font-family:var(--font-sans);font-weight:300;
            font-size:12px;letter-spacing:0.04em;
            background:${checked ? 'rgba(210,160,60,0.08)' : 'rgba(240,235,218,0.03)'};
            border:0.5px solid ${checked ? 'rgba(210,160,60,0.35)' : 'rgba(240,235,218,0.1)'};
            color:rgba(240,235,218,${checked ? '0.85' : '0.45'});
            cursor:pointer;transition:all 0.18s ease;
            display:inline-flex;align-items:center;gap:6px;
          "
        >${tile.label}${checked ? ' <span style="color:rgba(210,160,60,0.6);font-size:10px;">✓</span>' : ''}</button>
      `;
    }).join('');

    // Find any custom items for this system
    const customItems = state.history.filter(h => h.system === system.id && h.custom);
    const customChips = customItems.map(h => `
      <span class="intake-custom-chip"
        data-type="${h.type}"
        data-system="${system.id}"
        style="
          display:inline-flex;align-items:center;gap:6px;
          padding:8px 12px;margin:0 6px 6px 0;
          border-radius:2px;
          font-family:var(--font-sans);font-weight:300;
          font-size:12px;letter-spacing:0.04em;
          background:rgba(210,160,60,0.08);
          border:0.5px solid rgba(210,160,60,0.35);
          color:rgba(240,235,218,0.85);
          cursor:pointer;
        "
      >${h.label} <span style="color:rgba(240,235,218,0.3);font-size:10px;">✕</span></span>
    `).join('');

    return `
      <div class="intake-system-section" style="
        border-bottom:0.5px solid rgba(240,235,218,0.06);
        margin-bottom:2px;
      ">
        <!-- System header — tap to expand/collapse -->
        <button class="intake-system-toggle"
          data-system="${system.id}"
          style="
            width:100%;
            padding:14px 0;
            display:flex;justify-content:space-between;align-items:center;
            font-family:var(--font-sans);font-weight:300;
            font-size:13px;letter-spacing:0.04em;
            color:rgba(240,235,218,${isExpanded ? '0.85' : '0.5'});
            cursor:pointer;
            transition:color 0.18s ease;
          "
        >
          ${system.label}
          <span style="
            font-family:var(--font-sans);font-weight:200;
            font-size:10px;letter-spacing:0.12em;
            color:${systemChecked > 0 ? 'rgba(210,160,60,0.7)' : 'rgba(240,235,218,0.2)'};
          ">${systemChecked > 0 ? systemChecked + ' logged' : isExpanded ? '▲' : '▼'}</span>
        </button>

        <!-- Expandable tile panel -->
        <div class="intake-system-panel" data-system="${system.id}" style="
          display:${isExpanded ? 'block' : 'none'};
          padding-bottom:14px;
        ">
          <div style="display:flex;flex-wrap:wrap;margin-top:4px;">
            ${tiles}
            ${customChips}
          </div>

          <!-- + other text entry -->
          <div style="margin-top:8px;display:flex;align-items:center;gap:8px;">
            <input
              class="intake-field intake-other-input"
              data-system="${system.id}"
              type="text"
              placeholder="+ other"
              style="
                flex:1;
                background:rgba(240,235,218,0.03);
                border:0.5px solid rgba(240,235,218,0.08);
                border-radius:2px;
                padding:9px 12px;
                font-family:var(--font-sans);font-weight:300;
                font-size:12px;letter-spacing:0.04em;
                color:rgba(240,235,218,0.75);
                outline:none;
              "
              onfocus="this.style.borderColor='rgba(240,235,218,0.25)'"
              onblur="this.style.borderColor='rgba(240,235,218,0.08)'"
            />
            <button class="intake-other-add" data-system="${system.id}" style="
              padding:9px 14px;
              font-family:var(--font-sans);font-weight:300;
              font-size:10px;letter-spacing:0.18em;text-transform:uppercase;
              color:rgba(240,235,218,0.4);
              border:0.5px solid rgba(240,235,218,0.12);
              border-radius:2px;
              cursor:pointer;
              transition:all 0.18s ease;
            "
            onmouseenter="this.style.color='rgba(240,235,218,0.75)';this.style.borderColor='rgba(240,235,218,0.3)'"
            onmouseleave="this.style.color='rgba(240,235,218,0.4)';this.style.borderColor='rgba(240,235,218,0.12)'"
            >Add</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const totalLogged = state.history.length;

  return buildStepWrapper(4, 5, `
    <div style="
      font-family:var(--font-sans);font-weight:200;
      font-size:12px;letter-spacing:0.06em;
      color:rgba(240,235,218,0.4);
      margin-bottom:24px;line-height:1.6;
    ">Anything recently done worth tracking?<br>
    <span style="font-size:11px;color:rgba(240,235,218,0.2);">Tap a system to expand. Tap what applies.</span></div>

    <div id="intake-systems-list" style="margin-bottom:20px;">
      ${systemSections}
    </div>

    <div style="display:flex;align-items:center;margin-top:8px;">
      ${buildIntakeProceedButton(totalLogged > 0 ? `Continue — ${totalLogged} logged` : 'Continue')}
      ${buildSkipLink('Nothing to add')}
    </div>
  `);
}

// Step 5 — Details: transmission, plate province, shop, VIN
function buildDetailsStep(state, context) {
  const province = state.plate_province || store.get('user')?.province || '';
  return buildStepWrapper(5, 5, `
    <div style="
      font-family:var(--font-sans);font-weight:200;
      font-size:12px;letter-spacing:0.06em;
      color:rgba(240,235,218,0.4);
      margin-bottom:24px;line-height:1.6;
    ">A few last things — all optional.</div>

    <!-- Transmission toggle -->
    <div style="margin-bottom:20px;">
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.2em;text-transform:uppercase;
        color:rgba(240,235,218,0.3);margin-bottom:10px;
      ">Transmission <span style="color:rgba(240,235,218,0.15);">— optional</span></div>
      <div style="display:flex;gap:10px;">
        ${['automatic', 'manual', 'cvt'].map(t => `
          <button class="intake-trans-btn" data-trans="${t}" style="
            padding:11px 18px;border-radius:2px;
            font-family:var(--font-sans);font-weight:300;
            font-size:11px;letter-spacing:0.15em;text-transform:uppercase;
            background:${state.transmission === t ? 'rgba(210,160,60,0.1)' : 'rgba(240,235,218,0.03)'};
            border:0.5px solid ${state.transmission === t ? 'rgba(210,160,60,0.4)' : 'rgba(240,235,218,0.1)'};
            color:rgba(240,235,218,${state.transmission === t ? '0.85' : '0.35'});
            cursor:pointer;transition:all 0.18s ease;
          ">${t}</button>
        `).join('')}
      </div>
    </div>

    ${buildIntakeInput('intake-province',  'Plate province', 'e.g. BC',         province,              { optional: true })}
    ${buildIntakeInput('intake-shop',      'Preferred shop', 'e.g. Jiffy Lube', state.preferred_shop,  { optional: true })}
    ${buildIntakeInput('intake-vin',       'VIN',            'e.g. 1HGBH41J...',state.vin,             { optional: true })}

    <div style="
      margin-top:-8px;margin-bottom:20px;
      font-family:var(--font-sans);font-weight:200;
      font-size:11px;letter-spacing:0.03em;
      color:rgba(240,235,218,0.18);line-height:1.5;
    ">VIN unlocks recall checks and exact OEM parts.</div>

    <div style="display:flex;align-items:center;margin-top:8px;">
      ${buildIntakeProceedButton('Review')}
      ${buildSkipLink('Skip all')}
    </div>
  `);
}

// Step — Review before writing to store
function buildReviewStep(state, context) {
  const name = [state.year, state.make, state.model, state.variant].filter(Boolean).join(' ');
  const nextOil = state.ai_schedule?.next_oil_change_date || 'to be confirmed';

  const rows = [
    ['Vehicle',           name],
    ['Odometer',          state.mileage ? `${parseInt(state.mileage,10).toLocaleString()} km` : 'not entered'],
    ['Last oil change',   state.last_oil_date ? `${state.last_oil_date}${state.last_oil_mileage ? ' @ ' + parseInt(state.last_oil_mileage,10).toLocaleString() + ' km' : ''}` : 'not on file'],
    ['Your interval',     state.interval_km ? `${parseInt(state.interval_km,10).toLocaleString()} km` : '8,000 km (default)'],
    ['Next oil change',   nextOil],
    ['Transmission',      state.transmission || 'not specified'],
    ['Plate province',    state.plate_province || 'not specified'],
    ['Preferred shop',    state.preferred_shop || 'not specified'],
    state.vin ? ['VIN', state.vin] : null,
    state.history.length ? ['History logged', state.history.map(h => h.label).join(', ')] : null,
  ].filter(Boolean);

  return `
    <div style="
      font-family:var(--font-sans);font-weight:200;
      font-size:12px;letter-spacing:0.06em;
      color:rgba(240,235,218,0.4);
      margin-bottom:24px;line-height:1.6;
    ">Here's what I've got. Add it?</div>

    ${rows.map(([label, value]) => buildDetailRow(label, value)).join('')}

    <div style="margin-top:28px;display:flex;flex-wrap:wrap;align-items:center;">
      ${buildDoneButton('Add vehicle')}
      <button id="intake-back-to-edit" style="
        margin-left:10px;
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.18em;text-transform:uppercase;
        color:rgba(240,235,218,0.2);cursor:pointer;
        transition:color 0.2s ease;
      "
      onmouseenter="this.style.color='rgba(240,235,218,0.45)'"
      onmouseleave="this.style.color='rgba(240,235,218,0.2)'"
      >edit</button>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// INTAKE LISTENER ATTACHMENT
// Called from attachShellListeners when cascade type is vehicle_intake.
// Handles all step transitions, toggle buttons, history checklist.
// ---------------------------------------------------------------------------

export function attachIntakeListeners(el, cascade, render, close, onComplete) {
  const context = cascade.context;
  const state   = context._intakeState;
  if (!state) return;

  // Proceed button — advances step
  const proceedBtn = el.querySelector('#intake-proceed');
  if (proceedBtn) {
    proceedBtn.addEventListener('click', async () => {
      await handleIntakeProceed(state, context, el, render, close, onComplete);
    });
  }

  // Wire calendar pickers for any date fields in current step
  attachCalendarListeners(el);

  // Skip button — skips optional step
  const skipBtn = el.querySelector('#intake-skip');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      advanceIntakeStep(state);
      render('intake');
    });
  }

  // System section toggles — expand / collapse
  el.querySelectorAll('.intake-system-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const systemId = btn.dataset.system;
      if (!state._expandedSystems) state._expandedSystems = {};
      state._expandedSystems[systemId] = !state._expandedSystems[systemId];
      render('intake');
    });
  });

  // History tile toggles — tap to add/remove from state.history
  el.querySelectorAll('.intake-history-tile').forEach(btn => {
    btn.addEventListener('click', () => {
      const id       = btn.dataset.id;
      const label    = btn.dataset.label;
      const systemId = btn.dataset.system;
      const idx      = state.history.findIndex(h => h.type === id);
      if (idx >= 0) {
        state.history.splice(idx, 1);
      } else {
        state.history.push({ type: id, label, system: systemId, date: null, mileage: null, notes: null });
      }
      render('intake');
    });
  });

  // Custom chip removal — tap the ✕ on a custom item to remove it
  el.querySelectorAll('.intake-custom-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const type     = chip.dataset.type;
      const systemId = chip.dataset.system;
      const idx      = state.history.findIndex(h => h.type === type && h.system === systemId);
      if (idx >= 0) state.history.splice(idx, 1);
      render('intake');
    });
  });

  // + other add buttons — take the text from the sibling input, add to history
  el.querySelectorAll('.intake-other-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const systemId = btn.dataset.system;
      const input    = el.querySelector(`.intake-other-input[data-system="${systemId}"]`);
      const text     = input?.value.trim();
      if (!text) return;
      // Unique custom type key per system + label
      const customType = `custom_${systemId}_${Date.now()}`;
      state.history.push({
        type:   customType,
        label:  text,
        system: systemId,
        custom: true,
        date:   null,
        mileage: null,
        notes:  null,
      });
      render('intake');
    });
  });

  // Also allow Enter key in + other inputs
  el.querySelectorAll('.intake-other-input').forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const systemId  = input.dataset.system;
      const text      = input.value.trim();
      if (!text) return;
      const customType = `custom_${systemId}_${Date.now()}`;
      state.history.push({
        type:   customType,
        label:  text,
        system: systemId,
        custom: true,
        date:   null,
        mileage: null,
        notes:  null,
      });
      render('intake');
    });
  });

  // Transmission toggles
  el.querySelectorAll('.intake-trans-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.transmission = btn.dataset.trans;
      render('intake');
    });
  });

  // Back to edit from review
  const backToEdit = el.querySelector('#intake-back-to-edit');
  if (backToEdit) {
    backToEdit.addEventListener('click', () => {
      state.step = 'step_details';
      render('intake');
    });
  }

  // Done button on review — writes to store
  el.querySelectorAll('.cascade-done').forEach(btn => {
    btn.addEventListener('click', () => {
      vehicleIntakeRenderer.complete(context, 'intake', {});
      close();
      onComplete?.();
    });
  });
}

async function handleIntakeProceed(state, context, el, render, close, onComplete) {
  if (state.step === 'step_identity') {
    state.year    = el.querySelector('#intake-year')?.value.trim()    || '';
    state.make    = el.querySelector('#intake-make')?.value.trim()    || '';
    state.model   = el.querySelector('#intake-model')?.value.trim()   || '';
    state.variant = el.querySelector('#intake-variant')?.value.trim() || '';
    if (!state.year || !state.make || !state.model) return; // require basics
    state.step = 'step_mileage';
    render('intake');
    return;
  }

  if (state.step === 'step_mileage') {
    state.mileage = el.querySelector('#intake-mileage')?.value.trim() || '';
    if (!state.mileage) return;
    state.step = 'step_service';
    render('intake');
    return;
  }

  if (state.step === 'step_service') {
    // Date field now uses buildDateField — read from hidden input
    const dateHidden = el.querySelector('#intake-last-oil-date');
    const dateText   = el.querySelector('#intake-last-oil-date-text');
    // Prefer hidden ISO value; fall back to raw text entry
    state.last_oil_date    = (dateHidden?.value || dateText?.value || '').trim();
    state.last_oil_mileage = el.querySelector('#intake-last-oil-mileage')?.value.trim() || '';
    state.interval_km      = el.querySelector('#intake-interval')?.value.trim()         || '';
    state.step = 'step_history';

    // Fire AI call now — oil date and mileage are known
    fetchVehicleSchedule(state).then(schedule => {
      state.ai_schedule = schedule;
    });

    render('intake');
    return;
  }

  if (state.step === 'step_history') {
    // History items are toggled live — just advance
    state.step = 'step_details';
    render('intake');
    return;
  }

  if (state.step === 'step_details') {
    state.plate_province  = el.querySelector('#intake-province')?.value.trim()  || '';
    state.preferred_shop  = el.querySelector('#intake-shop')?.value.trim()      || '';
    state.vin             = el.querySelector('#intake-vin')?.value.trim()        || '';
    state.step = 'step_review';
    render('intake');
    return;
  }
}

function advanceIntakeStep(state) {
  const order = ['step_identity', 'step_mileage', 'step_service', 'step_history', 'step_details', 'step_review'];
  const idx = order.indexOf(state.step);
  if (idx >= 0 && idx < order.length - 1) {
    state.step = order[idx + 1];
  }
}

// AI call — retrieves maintenance schedule for year/make/model at current mileage
async function fetchVehicleSchedule(state) {
  try {
    return await api.getVehicleSchedule({
      year:              state.year,
      make:              state.make,
      model:             state.model,
      variant:           state.variant,
      vin:               state.vin          || null,
      transmission:      state.transmission || null,
      mileage:           state.mileage,
      last_oil_date:     state.last_oil_date,
      last_oil_mileage:  state.last_oil_mileage,
      interval_km:       state.interval_km,
      service_history:   state.history      || [],
    });
  } catch (err) {
    console.warn('[intake] AI schedule fetch failed:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// VEHICLE DETAIL — Full vehicle record cascade
//
// Opens when user taps a vehicle in the vehicles grab and go.
// Shows everything the app knows. Also the entry point for logging
// new service and adding to the watch list.
//
// Sections:
//   — Status bar: mileage, next service, oil spec
//   — Service history: dated entries, newest first
//   — Known history: major work logged at intake
//   — Tires: summer/winter, season count, current status
//   — Watch list: flagged items not yet done
//   — Details: transmission, plate province, shop, VIN
//
// Actions:
//   — Log a service (fires service log sub-flow)
//   — Add to watch list
// ---------------------------------------------------------------------------

const vehicleDetailRenderer = {

  async resolve(context, _preference) {
    return { routes: [], route: 'detail' };
  },

  async buildRoute(route, context) {
    const vehicle = getVehicle(context.vehicle_id);
    if (!vehicle) return buildErrorHTML();
    if (route === 'log_service' || context._logMode) return buildLogServiceHTML(vehicle);
    return buildVehicleDetailHTML(vehicle);
  },

  complete(context, _route, _update) {
    logCascadeComplete('vehicle_detail', context.vehicle_id, 'viewed');
  },
};

function buildVehicleDetailHTML(v) {
  const sections = [];

  // ── Vehicle actions — delete and edit ────────────────────────────────────
  sections.push(`
    <div style="display:flex;gap:10px;margin-bottom:28px;">
      <button id="vehicle-edit" data-vehicle-id="${v.id}" style="
        padding:10px 18px;border-radius:2px;
        font-family:var(--font-sans);font-weight:300;
        font-size:10px;letter-spacing:0.18em;text-transform:uppercase;
        color:rgba(240,235,218,0.6);
        border:0.5px solid rgba(240,235,218,0.2);
        cursor:pointer;transition:all 0.18s ease;
      "
      onmouseenter="this.style.color='rgba(240,235,218,0.9)';this.style.borderColor='rgba(240,235,218,0.4)'"
      onmouseleave="this.style.color='rgba(240,235,218,0.6)';this.style.borderColor='rgba(240,235,218,0.2)'"
      >Edit vehicle details</button>
      <button id="vehicle-refresh-facts" data-vehicle-id="${v.id}" style="
        padding:10px 18px;border-radius:2px;
        font-family:var(--font-sans);font-weight:300;
        font-size:10px;letter-spacing:0.18em;text-transform:uppercase;
        color:rgba(240,235,218,0.25);
        border:0.5px solid rgba(240,235,218,0.1);
        cursor:pointer;transition:all 0.18s ease;
      "
      onmouseenter="this.style.color='rgba(210,160,60,0.7)';this.style.borderColor='rgba(210,160,60,0.3)'"
      onmouseleave="this.style.color='rgba(240,235,218,0.25)';this.style.borderColor='rgba(240,235,218,0.1)'"
      >Refresh facts</button>
      <button id="vehicle-delete" data-vehicle-id="${v.id}" style="
        padding:10px 18px;border-radius:2px;
        font-family:var(--font-sans);font-weight:300;
        font-size:10px;letter-spacing:0.18em;text-transform:uppercase;
        color:rgba(240,235,218,0.25);
        border:0.5px solid rgba(240,235,218,0.1);
        cursor:pointer;transition:all 0.18s ease;
      "
      onmouseenter="this.style.color='rgba(210,80,60,0.7)';this.style.borderColor='rgba(210,80,60,0.3)'"
      onmouseleave="this.style.color='rgba(240,235,218,0.25)';this.style.borderColor='rgba(240,235,218,0.1)'"
      >Delete vehicle</button>
    </div>

    <!-- Confirm delete — hidden until delete is tapped -->
    <div id="vehicle-delete-confirm" style="display:none;
      margin-bottom:28px;padding:16px;
      background:rgba(210,80,60,0.06);
      border:0.5px solid rgba(210,80,60,0.2);
      border-radius:2px;
    ">
      <div style="
        font-family:var(--font-sans);font-weight:300;
        font-size:13px;letter-spacing:0.03em;
        color:rgba(240,235,218,0.7);margin-bottom:14px;
      ">Remove ${v.name || 'this vehicle'} permanently?</div>
      <div style="display:flex;gap:10px;">
        <button id="vehicle-delete-confirm-yes" data-vehicle-id="${v.id}" style="
          padding:9px 18px;border-radius:2px;
          font-family:var(--font-sans);font-weight:300;
          font-size:10px;letter-spacing:0.18em;text-transform:uppercase;
          color:rgba(210,80,60,0.8);
          border:0.5px solid rgba(210,80,60,0.35);
          cursor:pointer;transition:all 0.18s ease;
        "
        onmouseenter="this.style.background='rgba(210,80,60,0.08)'"
        onmouseleave="this.style.background='transparent'"
        >Yes, remove it</button>
        <button id="vehicle-delete-cancel" style="
          padding:9px 18px;
          font-family:var(--font-sans);font-weight:200;
          font-size:10px;letter-spacing:0.18em;text-transform:uppercase;
          color:rgba(240,235,218,0.25);cursor:pointer;transition:color 0.18s ease;
        "
        onmouseenter="this.style.color='rgba(240,235,218,0.6)'"
        onmouseleave="this.style.color='rgba(240,235,218,0.25)'"
        >Cancel</button>
      </div>
    </div>
  `);

  // Shown first — what the AI knows about this engine, not user-entered data.
  if (v.vehicle_facts) {
    const f = v.vehicle_facts;
    const factLines = [
      f.timing_system   ? buildEditableLine(v.id, 'timing_system',   'Timing',         f.timing_system,   'text') : null,
      f.serpentine_belt ? buildEditableLine(v.id, 'serpentine_belt', 'Serpentine belt', f.serpentine_belt, 'text') : null,
      f.spark_plugs     ? buildEditableLine(v.id, 'spark_plugs',     'Spark plugs',     f.spark_plugs,     'text') : null,
      f.transmission_fluid ? buildEditableLine(v.id, 'transmission_fluid', 'Trans fluid', f.transmission_fluid, 'text') : null,
      f.coolant         ? buildEditableLine(v.id, 'coolant',         'Coolant',         f.coolant,         'text') : null,
      f.notes           ? buildEditableLine(v.id, 'facts_notes',     'Engine notes',    f.notes,           'text') : null,
    ].filter(Boolean);
    if (factLines.length) sections.push(buildDetailSection('Engine facts', factLines.join('')));
  }

  // ── Status ────────────────────────────────────────────────────────────────
  const statusLines = [
    buildEditableLine(v.id, 'mileage_at_entry',      'Odometer at entry',   v.mileage_at_entry     ? parseInt(v.mileage_at_entry).toLocaleString() + ' km'      : '', 'text'),
    buildEditableLine(v.id, 'mileage_date',           'Entry date',          v.mileage_date         ? formatDetailDate(v.mileage_date)                            : '', 'date'),
    buildEditableLine(v.id, 'preferred_interval_km',  'Oil interval',        v.preferred_interval_km ? v.preferred_interval_km.toLocaleString() + ' km'          : '', 'text'),
    v.maintenance_schedule?.oil_spec
      ? buildEditableLine(v.id, 'oil_spec',           'Oil spec',            v.maintenance_schedule.oil_spec, 'text') : null,
    buildEditableLine(v.id, 'service_due',            'Next service',        v.service_due          ? formatDetailDate(v.service_due)                             : '', 'date'),
    v.maintenance_schedule?.next_oil_change_km
      ? buildReadonlyLine('Next oil change km', '~' + parseInt(v.maintenance_schedule.next_oil_change_km).toLocaleString() + ' km') : null,
    buildEditableLine(v.id, 'registration_expiry',    'Registration expiry', v.registration_expiry  ? formatDetailDate(v.registration_expiry)                     : '', 'date'),
    buildEditableLine(v.id, 'insurance_expiry',       'Insurance expiry',    v.insurance_expiry     ? formatDetailDate(v.insurance_expiry)                        : '', 'date'),
  ].filter(Boolean);
  sections.push(buildDetailSection('Status', statusLines.join('')));

  // ── AI maintenance notes ──────────────────────────────────────────────────
  if (v.maintenance_schedule?.notes) {
    sections.push(buildDetailSection('Schedule notes', `
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:13px;letter-spacing:0.03em;
        color:rgba(240,235,218,0.45);line-height:1.6;
        padding:6px 0 8px;
      ">${v.maintenance_schedule.notes}</div>
    `));
  }

  // ── Service history ───────────────────────────────────────────────────────
  if (v.service_history?.length) {
    const sorted = [...v.service_history].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    });
    const rows = sorted.map((s, i) => {
      const idx = v.service_history.indexOf(s);
      return buildEditableHistoryRow(v.id, 'service_history', idx, s);
    }).join('');
    sections.push(buildDetailSection('Service history', rows));
  }

  // ── Known history ─────────────────────────────────────────────────────────
  if (v.known_history?.length) {
    const rows = v.known_history.map((h, i) =>
      buildEditableHistoryRow(v.id, 'known_history', i, {
        type:   h.type,
        date:   h.date || h.date_approx,
        mileage: h.mileage_approx,
        notes:  h.notes,
        label:  h.label,
      })
    ).join('');
    sections.push(buildDetailSection('Known history', rows));
  }

  // ── Upcoming from AI schedule ─────────────────────────────────────────────
  if (v.maintenance_schedule?.upcoming_items?.length) {
    const rows = v.maintenance_schedule.upcoming_items.map(item => {
      const urgencyColor = item.urgency === 'now'
        ? 'rgba(210,160,60,0.8)'
        : item.urgency === 'soon'
          ? 'rgba(240,235,218,0.55)'
          : 'rgba(240,235,218,0.3)';
      return `
        <div style="
          padding:11px 0;border-bottom:0.5px solid rgba(240,235,218,0.05);
          display:flex;justify-content:space-between;align-items:baseline;
        ">
          <div style="font-family:var(--font-sans);font-weight:300;font-size:13px;color:rgba(240,235,218,0.7);">${item.label}</div>
          <div style="font-family:var(--font-sans);font-weight:200;font-size:11px;color:${urgencyColor};white-space:nowrap;margin-left:12px;">
            ${item.due_km ? '~' + parseInt(item.due_km).toLocaleString() + ' km' : item.urgency || ''}
          </div>
        </div>`;
    }).join('');
    sections.push(buildDetailSection('Upcoming', rows));
  }

  // ── Tires ─────────────────────────────────────────────────────────────────
  if (v.tires) {
    const tireLines = [];
    if (v.tires.summer) {
      const s = v.tires.summer;
      tireLines.push(buildEditableLine(v.id, 'tires_summer_brand',   'Summer brand',    s.brand  || '',    'text'));
      tireLines.push(buildEditableLine(v.id, 'tires_summer_season',  'Summer seasons',  s.season ? String(s.season) : '', 'text'));
      tireLines.push(buildEditableLine(v.id, 'tires_summer_on',      'Summer on now',   s.on ? 'yes' : 'no', 'text'));
      if (s.installed) tireLines.push(buildEditableLine(v.id, 'tires_summer_installed', 'Summer installed', formatDetailDate(s.installed), 'date'));
    }
    if (v.tires.winter) {
      const w = v.tires.winter;
      tireLines.push(buildEditableLine(v.id, 'tires_winter_brand',   'Winter brand',    w.brand  || '',    'text'));
      tireLines.push(buildEditableLine(v.id, 'tires_winter_season',  'Winter seasons',  w.season ? String(w.season) : '', 'text'));
      tireLines.push(buildEditableLine(v.id, 'tires_winter_on',      'Winter on now',   w.on ? 'yes' : 'no', 'text'));
      if (w.notes) tireLines.push(buildEditableLine(v.id, 'tires_winter_notes', 'Winter notes', w.notes, 'text'));
    }
    if (tireLines.length) sections.push(buildDetailSection('Tires', tireLines.join('')));
  }

  // ── Watch list ────────────────────────────────────────────────────────────
  if (v.watch_list?.length) {
    const rows = v.watch_list.map((w, i) =>
      buildEditableLine(v.id, `watch_${i}`, w.label || w.type?.replace(/_/g, ' '),
        w.status?.replace(/_/g, ' ') || 'flagged', 'text')
    ).join('');
    sections.push(buildDetailSection('Watch list', rows));
  }

  // ── Vehicle details ───────────────────────────────────────────────────────
  const detailLines = [
    buildEditableLine(v.id, 'transmission',   'Transmission',   v.transmission   || '', 'text'),
    buildEditableLine(v.id, 'plate_province', 'Plate province', v.plate_province || '', 'text'),
    buildEditableLine(v.id, 'preferred_shop', 'Preferred shop', v.preferred_shop || '', 'text'),
    buildEditableLine(v.id, 'vin',            'VIN',            v.vin            || '', 'text'),
  ];
  sections.push(buildDetailSection('Details', detailLines.join('')));

  // ── Actions ───────────────────────────────────────────────────────────────
  const logBtn = buildActionButton('Log a service', {
    primary: true,
    class: 'vehicle-log-service',
    dataAttrs: `data-vehicle-id="${v.id}"`,
  });

  return `
    ${sections.join('')}
    <div style="margin-top:28px;display:flex;flex-wrap:wrap;">
      ${logBtn}
    </div>
  `;
}

// ---------------------------------------------------------------------------
// EDITABLE LINE — tap to edit, blur/enter to save
// Each line knows its field path so it can write directly to the store.
// field: dot-path string — 'transmission', 'tires_summer_brand', etc.
// ---------------------------------------------------------------------------

function buildEditableLine(vehicleId, field, label, value, type) {
  const displayVal = value || '<span style="color:rgba(240,235,218,0.18);">—</span>';
  return `
    <div class="editable-line" data-vehicle-id="${vehicleId}" data-field="${field}" data-type="${type}" style="
      padding:11px 0;
      border-bottom:0.5px solid rgba(240,235,218,0.05);
      cursor:text;
    ">
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.18em;text-transform:uppercase;
        color:rgba(240,235,218,0.22);margin-bottom:4px;
      ">${label}</div>
      <div class="editable-value" style="
        font-family:var(--font-sans);font-weight:300;
        font-size:15px;letter-spacing:0.02em;
        color:rgba(240,235,218,0.75);line-height:1.4;
        min-height:18px;
      ">${displayVal}</div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// VEHICLE FIELD SAVE — writes a single flat field back to the vehicle store
// Handles dot-pathed fields like tires_summer_brand → tires.summer.brand
// ---------------------------------------------------------------------------

function saveVehicleField(vehicleId, field, value) {
  const vehicles = store.get('vehicles') || [];
  const idx = vehicles.findIndex(v => v.id === vehicleId);
  if (idx < 0) return;
  const v = vehicles[idx];

  // Strip display formatting for numeric fields
  const numVal = parseFloat(value.replace(/[^0-9.]/g, ''));

  switch (field) {
    case 'mileage_at_entry':      v.mileage_at_entry      = isNaN(numVal) ? value : numVal; break;
    case 'mileage_date':          v.mileage_date           = value; break;
    case 'preferred_interval_km': v.preferred_interval_km  = isNaN(numVal) ? 8000 : numVal; break;
    case 'oil_spec':
      v.maintenance_schedule = v.maintenance_schedule || {};
      v.maintenance_schedule.oil_spec = value; break;
    case 'service_due':           v.service_due            = value; break;
    case 'registration_expiry':   v.registration_expiry    = value; break;
    case 'insurance_expiry':      v.insurance_expiry       = value; break;
    case 'transmission':          v.transmission           = value; break;
    case 'plate_province':        v.plate_province         = value; break;
    case 'preferred_shop':        v.preferred_shop         = value; break;
    case 'vin':                   v.vin                    = value; break;
    case 'timing_system':
      v.vehicle_facts = v.vehicle_facts || {};
      v.vehicle_facts.timing_system = value; break;
    case 'serpentine_belt':
      v.vehicle_facts = v.vehicle_facts || {};
      v.vehicle_facts.serpentine_belt = value; break;
    case 'spark_plugs':
      v.vehicle_facts = v.vehicle_facts || {};
      v.vehicle_facts.spark_plugs = value; break;
    case 'transmission_fluid':
      v.vehicle_facts = v.vehicle_facts || {};
      v.vehicle_facts.transmission_fluid = value; break;
    case 'coolant':
      v.vehicle_facts = v.vehicle_facts || {};
      v.vehicle_facts.coolant = value; break;
    case 'facts_notes':
      v.vehicle_facts = v.vehicle_facts || {};
      v.vehicle_facts.notes = value; break;
    // Tire fields — tires_summer_brand, tires_winter_season, etc.
    default:
      if (field.startsWith('tires_')) {
        const parts  = field.split('_'); // ['tires','summer','brand']
        const season = parts[1]; // 'summer' | 'winter'
        const key    = parts.slice(2).join('_'); // 'brand' | 'season' | 'on' | 'notes'
        v.tires = v.tires || {};
        v.tires[season] = v.tires[season] || {};
        if (key === 'on') {
          v.tires[season].on = value.toLowerCase() === 'yes' || value === 'true';
        } else if (key === 'season') {
          v.tires[season].season = isNaN(parseInt(value, 10)) ? value : parseInt(value, 10);
        } else {
          v.tires[season][key] = value;
        }
      } else if (field.startsWith('watch_')) {
        const wIdx = parseInt(field.replace('watch_', ''), 10);
        v.watch_list = v.watch_list || [];
        if (v.watch_list[wIdx]) v.watch_list[wIdx].status = value;
      }
  }

  store.set('vehicles', vehicles);
}

// Shared input style for inline history edit form
function editInputStyle() {
  return `
    width:100%;box-sizing:border-box;
    background:rgba(240,235,218,0.04);
    border:none;border-bottom:0.5px solid rgba(240,235,218,0.1);
    padding:6px 2px;
    font-family:var(--font-sans);font-weight:300;
    font-size:13px;letter-spacing:0.03em;
    color:rgba(240,235,218,0.8);
    outline:none;
  `;
}

function buildReadonlyLine(label, value) {
  return `
    <div style="padding:11px 0;border-bottom:0.5px solid rgba(240,235,218,0.05);">
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.18em;text-transform:uppercase;
        color:rgba(240,235,218,0.22);margin-bottom:4px;
      ">${label}</div>
      <div style="
        font-family:var(--font-sans);font-weight:300;
        font-size:15px;color:rgba(240,235,218,0.4);
      ">${value}</div>
    </div>
  `;
}

function buildEditableHistoryRow(vehicleId, collection, index, entry) {
  const summary = [
    entry.date   ? formatDetailDate(entry.date) : null,
    entry.mileage ? parseInt(entry.mileage).toLocaleString() + ' km' : null,
    entry.label  || entry.type?.replace(/_/g, ' ') || null,
    entry.shop   || null,
    entry.notes  || null,
  ].filter(Boolean).join(' · ');

  return `
    <div class="editable-history-row" data-vehicle-id="${vehicleId}"
      data-collection="${collection}" data-index="${index}" style="
      padding:11px 0;
      border-bottom:0.5px solid rgba(240,235,218,0.05);
      cursor:text;
    ">
      <div class="history-summary" style="
        font-family:var(--font-sans);font-weight:300;
        font-size:13px;letter-spacing:0.03em;
        color:rgba(240,235,218,0.7);line-height:1.4;
      ">${summary || '<span style="color:rgba(240,235,218,0.18);">—</span>'}</div>
      <div class="history-edit-form" style="display:none;margin-top:10px;"></div>
    </div>
  `;
}



function buildLogServiceHTML(v) {
  const today = new Date().toISOString().split('T')[0];
  const serviceTypes = [
    ['oil_change',      'Oil change'],
    ['tire_rotation',   'Tire rotation'],
    ['tire_swap',       'Tire swap'],
    ['brake_service',   'Brakes'],
    ['filters',         'Filters'],
    ['fluids',          'Fluids'],
    ['inspection',      'Inspection'],
    ['other',           'Other'],
  ];

  const typeOptions = serviceTypes.map(([val, label]) =>
    `<option value="${val}">${label}</option>`
  ).join('');

  return `
    <div style="
      font-family:var(--font-sans);font-weight:200;
      font-size:12px;letter-spacing:0.06em;
      color:rgba(240,235,218,0.4);
      margin-bottom:24px;line-height:1.6;
    ">Log a service — ${v.name}</div>

    <div style="margin-bottom:18px;">
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.2em;text-transform:uppercase;
        color:rgba(240,235,218,0.3);margin-bottom:8px;
      ">Service type</div>
      <select id="log-type" style="
        width:100%;box-sizing:border-box;
        background:rgba(240,235,218,0.04);
        border:0.5px solid rgba(240,235,218,0.12);
        border-radius:2px;padding:14px 16px;
        font-family:var(--font-sans);font-weight:300;
        font-size:14px;color:rgba(240,235,218,0.85);
        outline:none;-webkit-appearance:none;
      ">${typeOptions}</select>
    </div>

    <div style="margin-bottom:18px;">
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.2em;text-transform:uppercase;
        color:rgba(240,235,218,0.3);margin-bottom:8px;
      ">Date</div>
      <input id="log-date-text" class="intake-field ylu-date-text" type="text"
        placeholder="e.g. Jan 2025 or 2025-01-15"
        value="${formatDetailDate(today)}"
        autocomplete="off"
        style="
          width:100%;box-sizing:border-box;
          background:rgba(240,235,218,0.04);
          border:0.5px solid rgba(240,235,218,0.12);
          border-radius:2px 2px 0 0;
          padding:13px 16px;
          font-family:var(--font-sans);font-weight:300;
          font-size:15px;letter-spacing:0.02em;
          color:rgba(240,235,218,0.85);
          outline:none;-webkit-appearance:none;
          border-bottom:none;
        "
        onfocus="this.style.borderColor='rgba(240,235,218,0.3)'"
        onblur="this.style.borderColor='rgba(240,235,218,0.12)'"
      />
      <button class="ylu-cal-toggle" data-target="log-date" style="
        width:100%;box-sizing:border-box;
        background:rgba(240,235,218,0.02);
        border:0.5px solid rgba(240,235,218,0.12);border-top:none;
        border-radius:0 0 2px 2px;
        padding:7px 16px;display:flex;align-items:center;gap:8px;
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.2em;text-transform:uppercase;
        color:rgba(240,235,218,0.25);cursor:pointer;transition:all 0.15s ease;text-align:left;
      "
      onmouseenter="this.style.color='rgba(240,235,218,0.5)';this.style.background='rgba(240,235,218,0.04)'"
      onmouseleave="this.style.color='rgba(240,235,218,0.25)';this.style.background='rgba(240,235,218,0.02)'"
      ><span style="font-size:12px;">📅</span> pick a date</button>
      <div id="log-date-cal" class="ylu-cal-panel" style="display:none;
        background:rgba(20,18,14,0.97);border:0.5px solid rgba(240,235,218,0.1);
        border-top:none;border-radius:0 0 4px 4px;padding:14px;
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <button class="ylu-cal-prev" data-target="log-date" style="font-family:var(--font-sans);font-weight:200;font-size:14px;color:rgba(240,235,218,0.4);cursor:pointer;padding:4px 8px;transition:color 0.15s ease;"
          onmouseenter="this.style.color='rgba(240,235,218,0.88)'" onmouseleave="this.style.color='rgba(240,235,218,0.4)'">‹</button>
          <div class="ylu-cal-month-label" data-target="log-date" style="font-family:var(--font-sans);font-weight:300;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(240,235,218,0.55);"></div>
          <button class="ylu-cal-next" data-target="log-date" style="font-family:var(--font-sans);font-weight:200;font-size:14px;color:rgba(240,235,218,0.4);cursor:pointer;padding:4px 8px;transition:color 0.15s ease;"
          onmouseenter="this.style.color='rgba(240,235,218,0.88)'" onmouseleave="this.style.color='rgba(240,235,218,0.4)'">›</button>
        </div>
        <div class="ylu-cal-grid" style="margin-bottom:4px;">
          ${['S','M','T','W','T','F','S'].map(d => `<div style="font-family:var(--font-sans);font-weight:200;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(240,235,218,0.2);display:flex;align-items:center;justify-content:center;padding:2px 0;">${d}</div>`).join('')}
        </div>
        <div class="ylu-cal-days ylu-cal-grid" data-target="log-date"></div>
      </div>
      <input id="log-date" type="hidden" value="${today}" />
    </div>

    <div style="margin-bottom:18px;">
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.2em;text-transform:uppercase;
        color:rgba(240,235,218,0.3);margin-bottom:8px;
      ">Kilometres <span style="color:rgba(240,235,218,0.15);">— optional</span></div>
      <input id="log-mileage" type="text" inputmode="numeric"
        placeholder="${v.mileage_at_entry ? (parseInt(v.mileage_at_entry) + 5000).toLocaleString() : '267000'}"
        style="
          width:100%;box-sizing:border-box;
          background:rgba(240,235,218,0.04);
          border:0.5px solid rgba(240,235,218,0.12);
          border-radius:2px;padding:14px 16px;
          font-family:var(--font-sans);font-weight:300;
          font-size:14px;color:rgba(240,235,218,0.85);
          outline:none;-webkit-appearance:none;
        "
        onfocus="this.style.borderColor='rgba(240,235,218,0.3)'"
        onblur="this.style.borderColor='rgba(240,235,218,0.12)'"
      />
    </div>

    <div style="margin-bottom:18px;">
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.2em;text-transform:uppercase;
        color:rgba(240,235,218,0.3);margin-bottom:8px;
      ">Shop <span style="color:rgba(240,235,218,0.15);">— optional</span></div>
      <input id="log-shop" type="text"
        placeholder="${v.preferred_shop || 'Mr. Lube'}"
        value="${v.preferred_shop || ''}"
        style="
          width:100%;box-sizing:border-box;
          background:rgba(240,235,218,0.04);
          border:0.5px solid rgba(240,235,218,0.12);
          border-radius:2px;padding:14px 16px;
          font-family:var(--font-sans);font-weight:300;
          font-size:14px;color:rgba(240,235,218,0.85);
          outline:none;-webkit-appearance:none;
        "
        onfocus="this.style.borderColor='rgba(240,235,218,0.3)'"
        onblur="this.style.borderColor='rgba(240,235,218,0.12)'"
      />
    </div>

    <div style="margin-bottom:24px;">
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.2em;text-transform:uppercase;
        color:rgba(240,235,218,0.3);margin-bottom:8px;
      ">Notes <span style="color:rgba(240,235,218,0.15);">— optional</span></div>
      <input id="log-notes" type="text"
        placeholder="anything worth remembering"
        style="
          width:100%;box-sizing:border-box;
          background:rgba(240,235,218,0.04);
          border:0.5px solid rgba(240,235,218,0.12);
          border-radius:2px;padding:14px 16px;
          font-family:var(--font-sans);font-weight:300;
          font-size:14px;color:rgba(240,235,218,0.85);
          outline:none;-webkit-appearance:none;
        "
        onfocus="this.style.borderColor='rgba(240,235,218,0.3)'"
        onblur="this.style.borderColor='rgba(240,235,218,0.12)'"
      />
    </div>

    <div style="display:flex;align-items:center;gap:0;flex-wrap:wrap;">
      ${buildActionButton('Save', { primary: true, class: '', dataAttrs: 'id="log-service-save"' })}
      <button id="log-service-cancel" style="
        margin-left:12px;
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.18em;text-transform:uppercase;
        color:rgba(240,235,218,0.2);cursor:pointer;
        transition:color 0.2s ease;
      "
      onmouseenter="this.style.color='rgba(240,235,218,0.45)'"
      onmouseleave="this.style.color='rgba(240,235,218,0.2)'"
      >cancel</button>
    </div>
  `;
}

function buildDetailSection(title, content) {
  return `
    <div style="margin-bottom:24px;">
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.22em;text-transform:uppercase;
        color:rgba(240,235,218,0.25);
        margin-bottom:10px;padding-bottom:6px;
        border-bottom:0.5px solid rgba(240,235,218,0.06);
      ">${title}</div>
      ${content}
    </div>
  `;
}

function buildDetailLine(value) {
  return `
    <div style="
      padding:9px 0;
      border-bottom:0.5px solid rgba(240,235,218,0.04);
      font-family:var(--font-sans);font-weight:300;
      font-size:13px;letter-spacing:0.03em;
      color:rgba(240,235,218,0.7);
      line-height:1.5;
    ">${value}</div>
  `;
}

function formatDetailDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T12:00:00' : ''));
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// HC-6 — MAINTENANCE TASK
// Triggered when a maintenance task surfaces as urgent in the ATAK.
// Shows what the task is, when it was last done, what's needed.
// Routes: mark done (logs completion, recalculates next due).
// ---------------------------------------------------------------------------

const maintenanceTaskRenderer = {

  async resolve(context, _preference) {
    return { routes: [], route: 'task' };
  },

  async buildRoute(_route, context) {
    const tasks = store.get('maintenance_tasks') || [];
    const task  = tasks.find(t => t.id === context.task_id);
    if (!task) return buildErrorHTML();

    const today    = new Date();
    const due      = task.next_due ? new Date(task.next_due) : null;
    const days     = due ? Math.ceil((due - today) / (1000 * 60 * 60 * 24)) : null;
    const overdue  = days !== null && days < 0;
    const lastDone = task.last_done ? formatDetailDate(task.last_done) : 'Not on file';

    const urgencyLine = overdue
      ? `Overdue by ${Math.abs(days)} days`
      : days === 0 ? 'Due today'
      : days !== null ? `Due in ${days} days`
      : 'No due date calculated';

    const sections = [
      buildDetailRow('Task',      task.label),
      buildDetailRow('Status',    urgencyLine, { urgent: overdue }),
      buildDetailRow('Last done', lastDone),
      task.interval_label ? buildDetailRow('Interval', task.interval_label) : '',
      task.notes          ? buildDetailRow('Notes',    task.notes)          : '',
    ].filter(Boolean).join('');

    return `
      ${sections}
      <div style="margin-top:24px;display:flex;flex-wrap:wrap;">
        ${buildDoneButton('Mark done')}
      </div>
    `;
  },

  complete(context, _route, _update) {
    const tasks = store.get('maintenance_tasks') || [];
    const idx   = tasks.findIndex(t => t.id === context.task_id);
    if (idx < 0) return;

    const task     = tasks[idx];
    const today    = new Date().toISOString().split('T')[0];
    task.last_done = today;

    // Recalculate next due from interval
    if (task.interval_days) {
      const next = new Date();
      next.setDate(next.getDate() + task.interval_days);
      task.next_due = next.toISOString().split('T')[0];
    }

    store.set('maintenance_tasks', tasks);
    logCascadeComplete('maintenance_task', context.task_id, 'done');
  },
};

// ---------------------------------------------------------------------------
// MAINTENANCE INTAKE — Add a new recurring task
// Minimal: label + interval. Everything else optional.
// Store shape:
// {
//   id: 'mt_<timestamp>',
//   label: 'Furnace filter',
//   interval_days: 90,
//   interval_label: 'Every 3 months',
//   last_done: '2026-02-01',
//   next_due: '2026-05-02',
//   notes: null,
//   tier: 'caution',   // warning | caution — governs alert tier when due
// }
// ---------------------------------------------------------------------------

const maintenanceIntakeRenderer = {

  async resolve(context, _preference) {
    if (!context._mState) context._mState = { step: 'label' };
    return { routes: [], route: 'intake' };
  },

  async buildRoute(_route, context) {
    const s = context._mState || { step: 'label' };
    return buildMaintenanceIntakeStep(s);
  },

  complete(context, _route, _update) {
    const s = context._mState;
    if (!s) return;

    const tasks = store.get('maintenance_tasks') || [];
    const id    = `mt_${Date.now()}`;

    let next_due = null;
    if (s.last_done && s.interval_days) {
      const d = new Date(s.last_done);
      d.setDate(d.getDate() + parseInt(s.interval_days, 10));
      next_due = d.toISOString().split('T')[0];
    } else if (s.interval_days) {
      // No last done — due soon, flag in 7 days as a prompt to check
      const d = new Date();
      d.setDate(d.getDate() + 7);
      next_due = d.toISOString().split('T')[0];
    }

    tasks.push({
      id,
      label:          s.label,
      interval_days:  s.interval_days ? parseInt(s.interval_days, 10) : null,
      interval_label: s.interval_label || null,
      last_done:      s.last_done || null,
      next_due,
      notes:          s.notes || null,
      tier:           'caution',
    });

    store.set('maintenance_tasks', tasks);
    logCascadeComplete('maintenance_intake', id, 'complete');
  },
};

function buildMaintenanceIntakeStep(s) {
  if (s.step === 'label') {
    return `
      <div style="font-family:var(--font-sans);font-weight:200;font-size:12px;letter-spacing:0.06em;color:rgba(240,235,218,0.4);margin-bottom:24px;line-height:1.6;">
        What needs tracking?
      </div>
      ${buildMIntakeInput('m-label', 'Task', 'Furnace filter', s.label || '')}
      ${buildMIntakeInput('m-notes', 'Notes', 'anything worth remembering', s.notes || '', true)}
      <div style="display:flex;align-items:center;margin-top:8px;">
        ${buildMProceed('Continue')}
      </div>
    `;
  }

  if (s.step === 'interval') {
    const presets = [
      { label: 'Monthly',       days: 30  },
      { label: 'Every 3 months', days: 90  },
      { label: 'Every 6 months', days: 180 },
      { label: 'Annually',      days: 365 },
    ];
    const tiles = presets.map(p => `
      <button class="m-preset" data-days="${p.days}" data-label="${p.label}" style="
        padding:13px 18px;margin-bottom:8px;margin-right:8px;
        border-radius:2px;border:0.5px solid rgba(240,235,218,0.12);
        font-family:var(--font-sans);font-weight:300;
        font-size:12px;letter-spacing:0.06em;
        color:rgba(240,235,218,0.6);
        background:rgba(240,235,218,0.03);
        cursor:pointer;transition:all 0.18s ease;
      "
      onmouseenter="this.style.borderColor='rgba(240,235,218,0.3)';this.style.color='rgba(240,235,218,0.88)'"
      onmouseleave="this.style.borderColor='rgba(240,235,218,0.12)';this.style.color='rgba(240,235,218,0.6)'"
      >${p.label}</button>
    `).join('');

    return `
      <div style="font-family:var(--font-sans);font-weight:200;font-size:12px;letter-spacing:0.06em;color:rgba(240,235,218,0.4);margin-bottom:24px;line-height:1.6;">
        How often? <span style="color:rgba(240,235,218,0.2);font-size:11px;">— tap or enter custom</span>
      </div>
      <div style="margin-bottom:16px;flex-wrap:wrap;display:flex;">${tiles}</div>
      ${buildMIntakeInput('m-interval-days',  'Custom interval (days)', '90', s.interval_days || '')}
      ${buildMIntakeInput('m-interval-label', 'Custom label',           'Every 3 months', s.interval_label || '', true)}
      <div style="display:flex;align-items:center;margin-top:8px;">
        ${buildMProceed('Continue')}
        ${buildMSkip('Skip')}
      </div>
    `;
  }

  if (s.step === 'last_done') {
    return `
      <div style="font-family:var(--font-sans);font-weight:200;font-size:12px;letter-spacing:0.06em;color:rgba(240,235,218,0.4);margin-bottom:24px;line-height:1.6;">
        When was it last done?<br>
        <span style="font-size:11px;color:rgba(240,235,218,0.2);">Helps calculate when it's next due.</span>
      </div>
      ${buildDateField('m-last-done', 'Date last done', s.last_done || '', {})}
      <div style="display:flex;align-items:center;margin-top:8px;">
        ${buildMProceed('Add task')}
        ${buildMSkip("I don't know")}
      </div>
    `;
  }

  return '';
}

function buildMIntakeInput(id, label, placeholder, value, optional = false, type = 'text') {
  return `
    <div style="margin-bottom:18px;">
      <div style="font-family:var(--font-sans);font-weight:200;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(240,235,218,0.3);margin-bottom:8px;">
        ${label}${optional ? ' <span style="color:rgba(240,235,218,0.15);">— optional</span>' : ''}
      </div>
      <input id="${id}" type="${type}" ${type === 'date' ? 'style="color-scheme:dark;"' : ''}
        placeholder="${placeholder}" value="${value}" style="
        width:100%;box-sizing:border-box;
        background:rgba(240,235,218,0.04);
        border:0.5px solid rgba(240,235,218,0.12);border-radius:2px;
        padding:14px 16px;
        font-family:var(--font-sans);font-weight:300;
        font-size:14px;color:rgba(240,235,218,0.85);
        outline:none;-webkit-appearance:none;
      "
      onfocus="this.style.borderColor='rgba(240,235,218,0.3)'"
      onblur="this.style.borderColor='rgba(240,235,218,0.12)'"
      />
    </div>
  `;
}

function buildMProceed(label) {
  return `<button id="m-proceed" style="
    padding:14px 28px;border-radius:2px;
    background:rgba(240,235,218,0.08);border:0.5px solid rgba(240,235,218,0.3);
    font-family:var(--font-sans);font-weight:300;
    font-size:11px;letter-spacing:0.22em;text-transform:uppercase;
    color:rgba(240,235,218,0.85);cursor:pointer;transition:all 0.2s ease;
  "
  onmouseenter="this.style.background='rgba(240,235,218,0.13)'"
  onmouseleave="this.style.background='rgba(240,235,218,0.08)'"
  >${label}</button>`;
}

function buildMSkip(label) {
  return `<button id="m-skip" style="
    margin-left:16px;
    font-family:var(--font-sans);font-weight:200;
    font-size:10px;letter-spacing:0.18em;text-transform:uppercase;
    color:rgba(240,235,218,0.2);cursor:pointer;transition:color 0.2s ease;
  "
  onmouseenter="this.style.color='rgba(240,235,218,0.45)'"
  onmouseleave="this.style.color='rgba(240,235,218,0.2)'"
  >${label}</button>`;
}


// ---------------------------------------------------------------------------
// PERSON DETAIL — Partner or child full record with tap-to-edit
// Triggered by tapping a person row in the ATAK brief.
// Reads from team.partner or team.children[idx] via person_id.
// ---------------------------------------------------------------------------

const personDetailRenderer = {

  async resolve(context, _preference) {
    return { routes: [], route: 'detail' };
  },

  async buildRoute(_route, context) {
    const { person, personType } = resolvePerson(context.person_id);
    if (!person) return buildErrorHTML();
    return buildPersonDetailHTML(person, personType, context.person_id);
  },

  complete(context, _route, _update) {
    logCascadeComplete('person_detail', context.person_id, 'viewed');
  },
};

function resolvePerson(personId) {
  const team = store.get('team') || {};
  if (personId === 'partner') {
    return { person: team.partner || null, personType: 'partner' };
  }
  if (personId?.startsWith('child_')) {
    const idx = parseInt(personId.replace('child_', ''), 10);
    return { person: (team.children || [])[idx] || null, personType: 'child', idx };
  }
  return { person: null, personType: null };
}

function buildPersonDetailHTML(person, personType, personId) {
  const isPartner = personType === 'partner';
  const lines = [];

  if (isPartner) {
    lines.push(buildPersonEditableLine(personId, 'name',               'Name',               person.name               || ''));
    lines.push(buildPersonEditableLine(personId, 'pronoun',            'Pronoun',             person.pronoun            || ''));
    lines.push(buildPersonEditableLine(personId, 'birthday',           'Birthday',            person.birthday           || ''));
    lines.push(buildPersonEditableLine(personId, 'birth_year',         'Birth year',          person.birth_year         ? String(person.birth_year) : ''));
    lines.push(buildPersonEditableLine(personId, 'profession',         'Profession',          person.profession         || ''));
    lines.push(buildPersonEditableLine(personId, 'love_language',      'Love language',       person.love_language      ? loveLangLabelLocal(person.love_language) : ''));
    lines.push(buildPersonEditableLine(personId, 'relationship_state', 'Relationship',        person.relationship_state || ''));
    lines.push(buildPersonEditableLine(personId, 'tenure',             'Together',            person.tenure             || ''));
    lines.push(buildPersonEditableLine(personId, 'works',              'Works',               person.works              || ''));
  } else {
    lines.push(buildPersonEditableLine(personId, 'name',    'Name',    person.name    || ''));
    lines.push(buildPersonEditableLine(personId, 'pronoun', 'Pronoun', person.pronoun || ''));
    lines.push(buildPersonEditableLine(personId, 'age', 'Age', (() => {
      const computed = person.birthday ? (() => {
        const m = person.birthday.match(/\b(19|20)\d{2}\b/);
        if (!m) return null;
        const age = new Date().getFullYear() - parseInt(m[0], 10);
        return age > 0 && age < 120 ? String(age) : null;
      })() : null;
      return computed || (person.age ? String(person.age) : '');
    })()));
    lines.push(buildPersonEditableLine(personId, 'birthday','Birthday',person.birthday|| ''));
    lines.push(buildPersonEditableLine(personId, 'whose',   'Whose',   person.whose   || ''));
  }

  return `
    <div style="margin-bottom:8px;">
      ${lines.join('')}
    </div>
  `;
}

function buildPersonEditableLine(personId, field, label, value) {
  const displayVal = value || '<span style="color:rgba(240,235,218,0.18);">—</span>';
  return `
    <div class="person-editable-line"
      data-person-id="${personId}" data-field="${field}" style="
      padding:11px 0;
      border-bottom:0.5px solid rgba(240,235,218,0.05);
      cursor:text;
    ">
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.18em;text-transform:uppercase;
        color:rgba(240,235,218,0.22);margin-bottom:4px;
      ">${label}</div>
      <div class="person-editable-value" style="
        font-family:var(--font-sans);font-weight:300;
        font-size:15px;letter-spacing:0.02em;
        color:rgba(240,235,218,0.75);line-height:1.4;
        min-height:18px;
      ">${displayVal}</div>
    </div>
  `;
}

function loveLangLabelLocal(id) {
  const map = {
    words_of_affirmation: 'Words of affirmation',
    acts_of_service:      'Acts of service',
    receiving_gifts:      'Receiving gifts',
    quality_time:         'Quality time',
    physical_touch:       'Physical touch',
  };
  return map[id] || id;
}

function savePersonField(personId, field, value) {
  const team = store.get('team') || {};

  if (personId === 'partner') {
    team.partner = team.partner || {};
    if (field === 'birth_year') team.partner.birth_year = parseInt(value, 10) || null;
    else team.partner[field] = value;
  } else if (personId.startsWith('child_')) {
    const idx = parseInt(personId.replace('child_', ''), 10);
    team.children = team.children || [];
    team.children[idx] = team.children[idx] || {};
    if (field === 'age') team.children[idx].age = parseInt(value, 10) || null;
    else team.children[idx][field] = value;
  }

  store.set('team', team);
}

// ---------------------------------------------------------------------------
// MAINTENANCE DETAIL — Full task record with tap-to-edit
// Opens when user taps a maintenance task row in the brief.
// ≤4 meaningful fields — editable here, no sub-cascade needed.
// ---------------------------------------------------------------------------

const maintenanceDetailRenderer = {

  async resolve(context, _preference) {
    return { routes: [], route: 'detail' };
  },

  async buildRoute(_route, context) {
    const tasks = store.get('maintenance_tasks') || [];
    const task  = tasks.find(t => t.id === context.task_id);
    if (!task) return buildErrorHTML();
    return buildMaintenanceDetailHTML(task);
  },

  complete(context, _route, _update) {
    logCascadeComplete('maintenance_detail', context.task_id, 'viewed');
  },
};

function buildMaintenanceDetailHTML(task) {
  const lines = [
    buildTaskEditableLine(task.id, 'label',          'Task',           task.label           || ''),
    buildTaskEditableLine(task.id, 'interval_label',  'Interval',       task.interval_label  || ''),
    buildTaskEditableLine(task.id, 'interval_days',   'Interval (days)',task.interval_days   ? String(task.interval_days) : ''),
    buildTaskEditableLine(task.id, 'last_done',       'Last done',      task.last_done       || '', 'date'),
    buildTaskEditableLine(task.id, 'next_due',        'Next due',       task.next_due        || '', 'date'),
    buildTaskEditableLine(task.id, 'notes',           'Notes',          task.notes           || ''),
    buildTaskEditableLine(task.id, 'tier',            'Tier',           task.tier            || 'caution'),
  ].join('');

  return `
    <div style="margin-bottom:8px;">${lines}</div>
    <div style="margin-top:24px;display:flex;flex-wrap:wrap;">
      ${buildDoneButton('Mark done')}
      <button id="task-delete" data-task-id="${task.id}" style="
        margin-left:16px;margin-top:28px;
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.18em;text-transform:uppercase;
        color:rgba(240,235,218,0.2);cursor:pointer;transition:color 0.2s ease;
      "
      onmouseenter="this.style.color='rgba(240,235,218,0.5)'"
      onmouseleave="this.style.color='rgba(240,235,218,0.2)'"
      >remove task</button>
    </div>
  `;
}

function buildTaskEditableLine(taskId, field, label, value, type = 'text') {
  const displayVal = value || '<span style="color:rgba(240,235,218,0.18);">—</span>';
  return `
    <div class="task-editable-line"
      data-task-id="${taskId}" data-field="${field}" data-type="${type}" style="
      padding:11px 0;
      border-bottom:0.5px solid rgba(240,235,218,0.05);
      cursor:text;
    ">
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.18em;text-transform:uppercase;
        color:rgba(240,235,218,0.22);margin-bottom:4px;
      ">${label}</div>
      <div class="task-editable-value" style="
        font-family:var(--font-sans);font-weight:300;
        font-size:15px;letter-spacing:0.02em;
        color:rgba(240,235,218,0.75);min-height:18px;
      ">${displayVal}</div>
    </div>
  `;
}

function saveTaskField(taskId, field, value) {
  const tasks = store.get('maintenance_tasks') || [];
  const idx   = tasks.findIndex(t => t.id === taskId);
  if (idx < 0) return;
  if (field === 'interval_days') tasks[idx][field] = parseInt(value, 10) || null;
  else tasks[idx][field] = value || null;
  store.set('maintenance_tasks', tasks);
}


// ---------------------------------------------------------------------------
// RENDERER REGISTRY
// ---------------------------------------------------------------------------

const RENDERERS = {
  vehicle_registration: vehicleRegistrationRenderer,
  vehicle_service:      vehicleServiceRenderer,
  medical_appointment:  medicalAppointmentRenderer,
  vehicle_intake:       vehicleIntakeRenderer,
  vehicle_detail:       vehicleDetailRenderer,
  maintenance_task:     maintenanceTaskRenderer,
  maintenance_intake:   maintenanceIntakeRenderer,
  person_detail:        personDetailRenderer,
  maintenance_detail:   maintenanceDetailRenderer,
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function getVehicle(vehicleId) {
  if (!vehicleId) return null;
  const vehicles = store.get('vehicles') || [];
  return vehicles.find(v => v.id === vehicleId) || null;
}

function logCascadeComplete(type, entityId, route) {
  const log = store.get('cascade_log') || [];
  log.push({
    type,
    entity_id: entityId,
    route,
    completed_at: new Date().toISOString(),
  });
  store.set('cascade_log', log);
}

function buildErrorHTML() {
  return `
    <div style="
      padding:20px 0;
      font-family:var(--font-sans);font-weight:200;
      font-size:13px;letter-spacing:0.04em;
      color:rgba(240,235,218,0.35);
      line-height:1.6;
    ">
      Couldn't load the details right now.<br>
      <span style="color:rgba(240,235,218,0.2);font-size:11px;">Check your connection and try again.</span>
    </div>
  `;
}

// Re-attach listeners for dynamically loaded content
// Called after async content replaces loading state
function attachDynamicListeners() {
  // cascade-link, cascade-directions, cascade-call, cascade-done
  // These are attached via inline onmouseenter/leave for hover,
  // and via event delegation on the cascade container.
  // Nothing needed here — the shell's delegated listeners handle it.
  // This function exists as a hook for future dynamic listener needs.
}
