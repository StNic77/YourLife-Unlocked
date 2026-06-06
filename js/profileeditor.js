import { store } from './store.js';
import { buildDateField, attachDateListeners, readDateField } from './datepicker.js';

// ---------------------------------------------------------------------------
// PROFILE EDITOR
//
// A dedicated full-screen editor for onboarding-originated profile data.
// Accessible from the ATAK brief via "Edit profile".
//
// Owns:
//   store.user     — name, pronouns, country, province, birthday
//   store.onboarding — occupation_sector
//   store.team     — partner name, children (name + age)
//
// Does NOT write until Save is tapped.
// Cancel discards all pending changes.
//
// Usage:
//   import { createProfileEditor } from './profileeditor.js';
//   createProfileEditor({ onClose: () => {} });
// ---------------------------------------------------------------------------

const PRONOUNS = [
  { value: 'he',   label: 'He / Him' },
  { value: 'she',  label: 'She / Her' },
  { value: 'they', label: 'They / Them' },
];

const COUNTRIES = [
  { value: 'CA',    label: 'Canada' },
  { value: 'US',    label: 'United States' },
  { value: 'UK',    label: 'United Kingdom' },
  { value: 'other', label: 'Other' },
];

const OCCUPATION_SECTORS = [
  { value: 'military',       label: 'Military / CAF' },
  { value: 'first_responder', label: 'Police or Fire' },
  { value: 'healthcare',     label: 'Healthcare' },
  { value: 'trades',         label: 'Trades' },
  { value: 'business',       label: 'Business' },
  { value: 'professional',   label: 'Office / Professional' },
  { value: 'student',        label: 'Student' },
  { value: 'other',          label: 'Something else' },
];

export function createProfileEditor({ onClose } = {}) {
  // ── Load current values into draft state ──────────────────────────────────
  const user    = store.get('user')        || {};
  const onboard = store.get('onboarding')  || {};
  const team    = store.get('team')        || {};

  // Draft — all edits live here until Save
  const draft = {
    // user
    name:              user.name       || '',
    pronouns:          user.pronouns   || null,
    country:           user.country    || null,
    province:          user.province   || '',
    birthday:          user.birthday   || '',

    // onboarding
    occupation_sector: onboard.occupation_sector || null,

    // team
    partner_name:      team.partner?.name || '',
    children:          (team.children || []).map(c => ({ ...c })),
  };

  // ── Mount ─────────────────────────────────────────────────────────────────
  const el = document.createElement('div');
  el.id = 'profile-editor';
  el.style.cssText = [
    'position:fixed;inset:0;z-index:300;',
    'background:#000;',
    'display:flex;flex-direction:column;',
    'font-family:var(--font-sans);',
    'color:rgba(240,235,218,0.85);',
    'padding-top:var(--safe-top,0px);',
    'opacity:0;transition:opacity 0.25s ease;',
  ].join('');

  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; });

  function close() {
    el.style.opacity = '0';
    setTimeout(() => {
      el.remove();
      onClose?.();
    }, 260);
  }

  render();

  // ── Render ─────────────────────────────────────────────────────────────────
  function render() {
    el.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.style.cssText = [
      'display:flex;align-items:center;justify-content:space-between;',
      'padding:20px 24px 16px;',
      'border-bottom:0.5px solid rgba(240,235,218,0.08);',
      'flex-shrink:0;',
    ].join('');

    const title = document.createElement('div');
    title.style.cssText = [
      'font-size:10px;letter-spacing:0.22em;text-transform:uppercase;',
      'color:rgba(240,235,218,0.3);',
    ].join('');
    title.textContent = 'Edit Profile';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'cancel';
    cancelBtn.style.cssText = _btnStyle(false);
    cancelBtn.addEventListener('click', close);

    header.appendChild(title);
    header.appendChild(cancelBtn);
    el.appendChild(header);

    // Scrollable body
    const body = document.createElement('div');
    body.style.cssText = [
      'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;',
      'padding:24px 24px 0;',
    ].join('');

    // ── Section: About you ─────────────────────────────────────────────────
    body.appendChild(_sectionLabel('About you'));

    body.appendChild(_textField({
      label:       'Name',
      value:       draft.name,
      placeholder: 'Your name',
      onChange:    v => { draft.name = v; },
    }));

    body.appendChild(_tileField({
      label:    'Pronouns',
      options:  PRONOUNS,
      selected: draft.pronouns,
      onChange: v => { draft.pronouns = v; },
    }));

    body.appendChild(_tileField({
      label:    'Country',
      options:  COUNTRIES,
      selected: draft.country,
      onChange: v => { draft.country = v; },
    }));

    if (draft.country === 'CA' || draft.country === 'US') {
      body.appendChild(_textField({
        label:       draft.country === 'CA' ? 'Province' : 'State',
        value:       draft.province,
        placeholder: draft.country === 'CA' ? 'e.g. BC' : 'e.g. TX',
        onChange:    v => { draft.province = v; },
      }));
    }

    // Birthday — uses shared datepicker component
    const birthdayWrap = document.createElement('div');
    birthdayWrap.innerHTML = buildDateField('profile-birthday', 'Birthday', draft.birthday || '', { past: true });
    body.appendChild(birthdayWrap);
    attachDateListeners(birthdayWrap);
    // Keep draft in sync when date changes
    const birthdayHidden = birthdayWrap.querySelector('#profile-birthday');
    if (birthdayHidden) {
      birthdayHidden.addEventListener('change', () => { draft.birthday = birthdayHidden.value; });
    }

    body.appendChild(_tileField({
      label:    'Occupation',
      options:  OCCUPATION_SECTORS,
      selected: draft.occupation_sector,
      onChange: v => { draft.occupation_sector = v; },
    }));

    // ── Section: Your team ─────────────────────────────────────────────────
    body.appendChild(_sectionLabel('Your team'));

    body.appendChild(_textField({
      label:       'Partner',
      value:       draft.partner_name,
      placeholder: 'Partner\'s name — or leave blank',
      onChange:    v => { draft.partner_name = v; },
    }));

    // Children
    const childrenLabel = document.createElement('div');
    childrenLabel.style.cssText = _fieldLabelStyle();
    childrenLabel.textContent = 'Children';
    body.appendChild(childrenLabel);

    draft.children.forEach((child, i) => {
      body.appendChild(_childRow(child, i));
    });

    // Add child button
    const addChildBtn = document.createElement('button');
    addChildBtn.textContent = '+ add child';
    addChildBtn.style.cssText = [
      'font-family:var(--font-sans);font-weight:200;',
      'font-size:10px;letter-spacing:0.18em;text-transform:uppercase;',
      'color:rgba(240,235,218,0.3);',
      'border:0.5px solid rgba(240,235,218,0.12);border-radius:2px;',
      'padding:8px 14px;margin-bottom:28px;',
      'transition:all 0.2s;',
    ].join('');
    addChildBtn.addEventListener('click', () => {
      draft.children.push({ name: '', age: '' });
      render();
    });
    addChildBtn.addEventListener('mouseenter', () => {
      addChildBtn.style.color = 'rgba(240,235,218,0.6)';
      addChildBtn.style.borderColor = 'rgba(240,235,218,0.3)';
    });
    addChildBtn.addEventListener('mouseleave', () => {
      addChildBtn.style.color = 'rgba(240,235,218,0.3)';
      addChildBtn.style.borderColor = 'rgba(240,235,218,0.12)';
    });
    body.appendChild(addChildBtn);

    el.appendChild(body);

    // ── Save button — pinned at bottom ─────────────────────────────────────
    const footer = document.createElement('div');
    footer.style.cssText = [
      'flex-shrink:0;',
      'padding:16px 24px max(24px, env(safe-area-inset-bottom));',
      'border-top:0.5px solid rgba(240,235,218,0.08);',
    ].join('');

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.style.cssText = [
      'width:100%;',
      'font-family:var(--font-sans);font-weight:300;',
      'font-size:11px;letter-spacing:0.2em;text-transform:uppercase;',
      'color:rgba(240,235,218,0.85);',
      'border:0.5px solid rgba(240,235,218,0.3);border-radius:2px;',
      'padding:15px;transition:all 0.2s;',
    ].join('');
    saveBtn.addEventListener('click', _save);
    saveBtn.addEventListener('mouseenter', () => {
      saveBtn.style.color = 'rgba(240,235,218,1)';
      saveBtn.style.borderColor = 'rgba(240,235,218,0.6)';
    });
    saveBtn.addEventListener('mouseleave', () => {
      saveBtn.style.color = 'rgba(240,235,218,0.85)';
      saveBtn.style.borderColor = 'rgba(240,235,218,0.3)';
    });

    footer.appendChild(saveBtn);
    el.appendChild(footer);
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  function _save() {
    // user
    const user = store.get('user') || {};
    store.set('user', {
      ...user,
      name:     draft.name.trim()     || user.name,
      pronouns: draft.pronouns        || user.pronouns,
      country:  draft.country         || user.country,
      province: draft.province.trim() || user.province,
      birthday: draft.birthday.trim() || user.birthday,
    });

    // onboarding
    const onboard = store.get('onboarding') || {};
    store.set('onboarding', {
      ...onboard,
      occupation_sector: draft.occupation_sector || onboard.occupation_sector,
    });

    // team
    const team = store.get('team') || {};
    store.set('team', {
      ...team,
      partner: {
        ...(team.partner || {}),
        name: draft.partner_name.trim() || team.partner?.name || null,
      },
      children: draft.children
        .filter(c => c.name && c.name.trim())
        .map(c => ({
          name: c.name.trim(),
          age:  c.age ? parseInt(c.age, 10) || null : null,
        })),
    });

    close();
  }

  // ── Child row ──────────────────────────────────────────────────────────────
  function _childRow(child, index) {
    const row = document.createElement('div');
    row.style.cssText = [
      'display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;',
    ].join('');

    // Name
    const nameInput = _inputEl({
      value:       child.name,
      placeholder: 'Name',
      flex:        '2',
      onChange:    v => { draft.children[index].name = v; },
    });

    // Age
    const ageInput = _inputEl({
      value:       child.age != null ? String(child.age) : '',
      placeholder: 'Age',
      flex:        '1',
      inputmode:   'numeric',
      onChange:    v => { draft.children[index].age = v; },
    });

    // Remove
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✕';
    removeBtn.style.cssText = [
      'font-family:var(--font-sans);font-size:12px;',
      'color:rgba(240,235,218,0.2);padding:12px 6px;',
      'align-self:center;transition:color 0.2s;flex-shrink:0;',
    ].join('');
    removeBtn.addEventListener('click', () => {
      draft.children.splice(index, 1);
      render();
    });
    removeBtn.addEventListener('mouseenter', () => removeBtn.style.color = 'rgba(240,235,218,0.5)');
    removeBtn.addEventListener('mouseleave', () => removeBtn.style.color = 'rgba(240,235,218,0.2)');

    row.appendChild(nameInput);
    row.appendChild(ageInput);
    row.appendChild(removeBtn);
    return row;
  }

  // ── Field builders ─────────────────────────────────────────────────────────

  function _sectionLabel(text) {
    const div = document.createElement('div');
    div.style.cssText = [
      'font-size:9px;letter-spacing:0.28em;text-transform:uppercase;',
      'color:rgba(240,235,218,0.2);',
      'margin:24px 0 16px;',
      'padding-bottom:10px;',
      'border-bottom:0.5px solid rgba(240,235,218,0.06);',
    ].join('');
    div.textContent = text;
    return div;
  }

  function _fieldLabelStyle() {
    return [
      'font-size:10px;letter-spacing:0.15em;text-transform:uppercase;',
      'color:rgba(240,235,218,0.3);',
      'margin-bottom:8px;',
    ].join('');
  }

  function _textField({ label, value, placeholder, onChange }) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-bottom:16px;';

    const lbl = document.createElement('div');
    lbl.style.cssText = _fieldLabelStyle();
    lbl.textContent = label;

    const input = document.createElement('input');
    input.type        = 'text';
    input.value       = value;
    input.placeholder = placeholder;
    input.autocomplete = 'off';
    input.style.cssText = _inputStyle();
    input.addEventListener('input', () => onChange(input.value));
    input.addEventListener('focus', () => input.style.borderColor = 'rgba(240,235,218,0.3)');
    input.addEventListener('blur',  () => input.style.borderColor = 'rgba(240,235,218,0.12)');

    wrap.appendChild(lbl);
    wrap.appendChild(input);
    return wrap;
  }

  function _dateField({ label, value, onChange }) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-bottom:16px;';

    const lbl = document.createElement('div');
    lbl.style.cssText = _fieldLabelStyle();
    lbl.textContent = label;

    const input = document.createElement('input');
    input.type        = 'text';
    input.value       = value;
    input.placeholder = 'YYYY-MM-DD';
    input.inputMode   = 'numeric';
    input.autocomplete = 'off';
    input.style.cssText = _inputStyle();
    input.addEventListener('input', () => onChange(input.value));
    input.addEventListener('focus', () => input.style.borderColor = 'rgba(240,235,218,0.3)');
    input.addEventListener('blur',  () => {
      input.style.borderColor = 'rgba(240,235,218,0.12)';
      // Auto-format partial dates: if user enters 8 digits, format as YYYY-MM-DD
      const digits = input.value.replace(/\D/g, '');
      if (digits.length === 8) {
        const formatted = `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6,8)}`;
        input.value = formatted;
        onChange(formatted);
      }
    });

    const hint = document.createElement('div');
    hint.style.cssText = [
      'font-size:10px;letter-spacing:0.04em;',
      'color:rgba(240,235,218,0.18);margin-top:4px;',
    ].join('');
    hint.textContent = 'Format: YYYY-MM-DD — e.g. 1985-03-15';

    wrap.appendChild(lbl);
    wrap.appendChild(input);
    wrap.appendChild(hint);
    return wrap;
  }

  function _tileField({ label, options, selected, onChange }) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-bottom:20px;';

    const lbl = document.createElement('div');
    lbl.style.cssText = _fieldLabelStyle();
    lbl.textContent = label;

    const grid = document.createElement('div');
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt.label;
      btn.dataset.value = opt.value;
      const isSelected = opt.value === selected;
      btn.style.cssText = _tileBtnStyle(isSelected);

      btn.addEventListener('click', () => {
        // Toggle — tap again to deselect
        const nowSelected = draft[_draftKeyFor(label)] === opt.value;
        onChange(nowSelected ? null : opt.value);
        // Re-render tile states without full render
        grid.querySelectorAll('button').forEach(b => {
          b.style.cssText = _tileBtnStyle(b.dataset.value === (nowSelected ? null : opt.value));
        });
        // Re-render if country changed (province field appears/disappears)
        if (label === 'Country') render();
      });

      grid.appendChild(btn);
    });

    wrap.appendChild(lbl);
    wrap.appendChild(grid);
    return wrap;
  }

  function _draftKeyFor(label) {
    const map = {
      'Pronouns':   'pronouns',
      'Country':    'country',
      'Occupation': 'occupation_sector',
    };
    return map[label] || label.toLowerCase();
  }

  function _inputEl({ value, placeholder, flex, inputmode, onChange }) {
    const input = document.createElement('input');
    input.type        = 'text';
    input.value       = value;
    input.placeholder = placeholder;
    input.autocomplete = 'off';
    if (inputmode) input.inputMode = inputmode;
    input.style.cssText = _inputStyle() + `flex:${flex || '1'};`;
    input.addEventListener('input', () => onChange(input.value));
    input.addEventListener('focus', () => input.style.borderColor = 'rgba(240,235,218,0.3)');
    input.addEventListener('blur',  () => input.style.borderColor = 'rgba(240,235,218,0.12)');
    return input;
  }

  function _inputStyle() {
    return [
      'width:100%;box-sizing:border-box;',
      'background:rgba(240,235,218,0.04);',
      'border:0.5px solid rgba(240,235,218,0.12);border-radius:2px;',
      'padding:12px 14px;',
      'font-family:var(--font-sans);font-weight:300;',
      'font-size:13px;letter-spacing:0.03em;',
      'color:rgba(240,235,218,0.85);',
      'outline:none;transition:border-color 0.2s;',
    ].join('');
  }

  function _tileBtnStyle(isSelected) {
    return [
      'font-family:var(--font-sans);font-weight:200;',
      'font-size:11px;letter-spacing:0.1em;',
      'padding:8px 14px;border-radius:2px;border:0.5px solid;',
      'transition:all 0.15s;cursor:pointer;',
      isSelected
        ? 'color:rgba(210,160,60,0.95);border-color:rgba(210,160,60,0.4);background:rgba(210,160,60,0.08);'
        : 'color:rgba(240,235,218,0.4);border-color:rgba(240,235,218,0.12);background:transparent;',
    ].join('');
  }

  function _btnStyle(primary) {
    return [
      'font-family:var(--font-sans);font-weight:200;',
      'font-size:10px;letter-spacing:0.22em;text-transform:uppercase;',
      primary
        ? 'color:rgba(240,235,218,0.85);border:0.5px solid rgba(240,235,218,0.3);'
        : 'color:rgba(240,235,218,0.3);border:none;',
      'padding:6px 10px;border-radius:2px;transition:all 0.2s;',
    ].join('');
  }
}
