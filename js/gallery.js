import { transitions } from './transitions.js';
import { store } from './store.js';

const DISSOLVE_MS = 900;
const THROTTLE_MS = 850;
const SWIPE_THRESHOLD = 40;
const GYRO_THRESHOLD = 12;
const GYRO_THROTTLE_MS = 1200;

// Per-image object-position fine-tuning for desktop crops.
// Adjust these values if a specific world image needs reframing on wide screens.
const DESKTOP_OBJECT_POSITION = {
  operator: 'center center',
  range:    'center 30%',
  garden:   'center center',
  journey:  'center 40%',
  playbook: 'center center',
  summit:   'center 20%',
  practice: 'center center',
  meadow:   'center 35%',
};

const IS_DESKTOP = window.matchMedia('(min-width: 768px)').matches;

export function createGallery(worlds) {
  const el = document.createElement('div');
  el.className = 'screen';
  el.id = 'screen-gallery';
  el.style.cssText = 'background:#000;';

  let current = 0;
  let animating = false;
  let lastNav = 0;
  let lastGyroY = null;
  let hintDismissed = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let resolveChoice = null;

  const sceneEls = [];
  const dotEls = [];

  function buildHTML() {
    el.innerHTML = `
      <h2 class="sr-only">Choose your path — eight environments representing different ways of moving through life</h2>

      <div id="g-scenes" style="position:absolute;inset:0;"></div>

      <div id="g-hint" style="
        position:absolute;
        bottom:max(120px, calc(var(--safe-bottom) + 120px));
        right:max(24px, calc(var(--safe-right) + 24px));
        font-family:var(--font-sans);font-weight:200;
        font-size:10px;letter-spacing:0.22em;text-transform:uppercase;
        color:var(--color-cream-25);
        writing-mode:vertical-rl;
        pointer-events:none;
        opacity:0;
        animation:fadeIn 1s ease-out 2s both;
        transition:opacity 0.5s ease;
        z-index:20;
      ">scroll</div>

      <div style="
        position:absolute;inset:0;
        display:flex;flex-direction:column;
        justify-content:space-between;
        pointer-events:none;
        z-index:10;
      ">
        <div style="
          padding:max(52px, calc(var(--safe-top) + 28px)) 28px 0;
          opacity:0;animation:fadeDown 1s ease-out 0.4s both;
        ">
          <div style="
            font-family:var(--font-serif);font-style:italic;font-weight:300;
            font-size:clamp(20px,5vw,28px);
            color:var(--color-cream-90);letter-spacing:0.01em;line-height:1.25;
          ">Find somewhere that<br>feels like you.</div>
          <div style="
            margin-top:6px;
            font-family:var(--font-sans);font-weight:200;
            font-size:10px;letter-spacing:0.3em;text-transform:uppercase;
            color:var(--color-cream-25);
          ">your life / unlocked</div>
        </div>

        <div style="
          padding:0 28px max(36px, calc(var(--safe-bottom) + 28px));
          display:flex;flex-direction:column;gap:14px;
          pointer-events:all;
        ">
          <div id="g-dots" style="display:flex;gap:6px;align-items:center;"></div>

          <div id="g-world-info" style="display:flex;flex-direction:column;gap:4px;">
            <div id="g-label" style="
              font-family:var(--font-sans);font-weight:300;
              font-size:clamp(10px,2.5vw,11px);letter-spacing:0.28em;text-transform:uppercase;
              color:var(--color-cream-40);
              transition:opacity 0.3s ease;
            ">your path</div>
            <div id="g-title" style="
              font-family:var(--font-serif);font-weight:300;
              font-size:clamp(28px,7vw,42px);
              color:var(--color-cream-90);
              letter-spacing:0.04em;line-height:1;
              transition:opacity 0.3s ease;
            ">—</div>
          </div>

          <button id="g-enter" style="
            align-self:flex-start;
            padding:13px 32px;
            border:0.5px solid var(--color-cream-40);
            border-radius:2px;
            font-family:var(--font-sans);font-weight:300;
            font-size:clamp(10px,2.5vw,11px);letter-spacing:0.28em;text-transform:uppercase;
            color:var(--color-cream-90);
            transition:background 0.3s ease,border-color 0.3s ease;
          ">start here</button>
        </div>
      </div>
    `;
  }

  function buildScenes() {
    const container = el.querySelector('#g-scenes');
    worlds.forEach((world, i) => {
      const objectPosition = IS_DESKTOP
        ? (DESKTOP_OBJECT_POSITION[world.id] || 'center center')
        : 'center center';

      const scene = document.createElement('div');
      scene.style.cssText = `
        position:absolute;inset:0;
        opacity:${i === 0 ? 1 : 0};
        z-index:${i === 0 ? 2 : 1};
        will-change:opacity;
      `;
      scene.innerHTML = `
        <img
          src="${world.image}"
          alt="${world.name}"
          loading="${i < 2 ? 'eager' : 'lazy'}"
          style="width:100%;height:100%;object-fit:cover;object-position:${objectPosition};display:block;"
        >
        <div style="
          position:absolute;inset:0;
          background:linear-gradient(
            to top,
            rgba(0,0,0,0.72) 0%,
            rgba(0,0,0,0.18) 40%,
            rgba(0,0,0,0.04) 70%,
            transparent 100%
          );
        "></div>
      `;
      container.appendChild(scene);
      sceneEls.push(scene);
    });
  }

  function buildDots() {
    const container = el.querySelector('#g-dots');
    worlds.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Go to ${worlds[i].name}`);
      dot.style.cssText = `
        width:${i === 0 ? 20 : 4}px;height:4px;
        border-radius:${i === 0 ? 2 : 50}px;
        background:${i === 0 ? 'var(--color-cream-90)' : 'var(--color-cream-25)'};
        border:none;padding:0;cursor:pointer;
        transition:all 0.4s ease;
        -webkit-tap-highlight-color:transparent;
      `;
      dot.addEventListener('click', () => goTo(i));
      container.appendChild(dot);
      dotEls.push(dot);
    });
  }

  function updateUI(idx, immediate = false) {
    const titleEl = el.querySelector('#g-title');
    const labelEl = el.querySelector('#g-label');

    if (!immediate) {
      titleEl.style.opacity = '0';
      labelEl.style.opacity = '0';
      setTimeout(() => {
        titleEl.textContent = worlds[idx].name;
        labelEl.textContent = 'your path';
        titleEl.style.opacity = '1';
        labelEl.style.opacity = '1';
      }, 200);
    } else {
      titleEl.textContent = worlds[idx].name;
    }

    dotEls.forEach((dot, i) => {
      dot.style.width = i === idx ? '20px' : '4px';
      dot.style.borderRadius = i === idx ? '2px' : '50%';
      dot.style.background = i === idx
        ? 'var(--color-cream-90)'
        : 'var(--color-cream-25)';
    });
  }

  function goTo(idx) {
    if (animating || idx === current || idx < 0 || idx >= worlds.length) return;

    const now = Date.now();
    if (now - lastNav < THROTTLE_MS) return;
    lastNav = now;

    animating = true;

    if (!hintDismissed) {
      const hint = el.querySelector('#g-hint');
      if (hint) hint.style.opacity = '0';
      hintDismissed = true;
    }

    const outEl = sceneEls[current];
    const inEl = sceneEls[idx];

    inEl.style.opacity = '0';
    inEl.style.zIndex = '3';
    outEl.style.zIndex = '2';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inEl.style.transition = `opacity ${DISSOLVE_MS}ms cubic-bezier(0.4,0,0.2,1)`;
        outEl.style.transition = `opacity ${DISSOLVE_MS}ms cubic-bezier(0.4,0,0.2,1)`;
        inEl.style.opacity = '1';
        outEl.style.opacity = '0';

        updateUI(idx);

        setTimeout(() => {
          outEl.style.zIndex = '1';
          inEl.style.zIndex = '2';
          outEl.style.transition = '';
          inEl.style.transition = '';
          current = idx;
          animating = false;
        }, DISSOLVE_MS);
      });
    });
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function handleWheel(e) {
    e.preventDefault();
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.deltaY > 0 ? next() : prev();
    } else {
      e.deltaX > 0 ? next() : prev();
    }
  }

  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    const dx = touchStartX - e.changedTouches[0].clientX;
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > SWIPE_THRESHOLD) {
      dy > 0 ? next() : prev();
    } else if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      dx > 0 ? next() : prev();
    }
  }

  function handleKey(e) {
    if (['ArrowDown', 'ArrowRight'].includes(e.key)) next();
    if (['ArrowUp', 'ArrowLeft'].includes(e.key)) prev();
  }

  function handleGyro(e) {
    if (e.beta === null) return;
    if (lastGyroY === null) { lastGyroY = e.beta; return; }
    const delta = e.beta - lastGyroY;
    if (Math.abs(delta) > GYRO_THRESHOLD) {
      const now = Date.now();
      if (now - lastNav < GYRO_THROTTLE_MS) return;
      delta > 0 ? next() : prev();
      lastGyroY = e.beta;
    }
  }

  function attachListeners() {
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('keydown', handleKey);
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleGyro);
    }

    const enterBtn = el.querySelector('#g-enter');
    enterBtn.addEventListener('mouseenter', () => {
      enterBtn.style.background = 'rgba(240,235,218,0.08)';
      enterBtn.style.borderColor = 'var(--color-cream-60)';
    });
    enterBtn.addEventListener('mouseleave', () => {
      enterBtn.style.background = 'transparent';
      enterBtn.style.borderColor = 'var(--color-cream-40)';
    });
    enterBtn.addEventListener('click', () => {
      if (resolveChoice) resolveChoice(worlds[current]);
    });
  }

  function detachListeners() {
    el.removeEventListener('wheel', handleWheel);
    el.removeEventListener('touchstart', handleTouchStart);
    el.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('keydown', handleKey);
    window.removeEventListener('deviceorientation', handleGyro);
  }

  return {
    el,
    mount(container) {
      buildHTML();
      buildScenes();
      buildDots();
      updateUI(0, true);
      container.appendChild(el);
      attachListeners();

      return new Promise(resolve => {
        resolveChoice = resolve;
      });
    },
    unmount() {
      detachListeners();
      return transitions.fadeOut(el, 700).then(() => el.remove());
    },
  };
}
