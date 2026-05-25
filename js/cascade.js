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
    display:flex;flex-direction:column;
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
    overflow-y:auto;
    -webkit-overflow-scrolling:touch;
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
    const state = await renderer.resolve(cascade.context, pref);

    el.innerHTML = buildShell({
      title:    item.title,
      subtitle: item.body,
      content:  state.route
        ? await renderer.buildRoute(state.route, cascade.context)
        : buildRouteTiles(state.routes, cascade.type),
      hasRoute: !!state.route,
    });

    attachShellListeners(state);
  }

  function buildShell({ title, subtitle, content, hasRoute }) {
    return `
      <div style="
        padding:
          max(52px, calc(var(--safe-top, 0px) + 28px))
          28px
          max(48px, calc(var(--safe-bottom, 0px) + 24px));
        min-height:100%;
        box-sizing:border-box;
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

        <!-- Change route — only shown when a route is active -->
        ${hasRoute ? `
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
      backBtn.addEventListener('click', () => { close(); onBack?.(); });
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
  `;
  document.head.appendChild(style);
}
injectCascadeKeyframes();

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
// RENDERER REGISTRY
// ---------------------------------------------------------------------------

const RENDERERS = {
  vehicle_registration: vehicleRegistrationRenderer,
  vehicle_service:      vehicleServiceRenderer,
  medical_appointment:  medicalAppointmentRenderer,
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
