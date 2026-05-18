import { transitions } from './transitions.js';

export function createWelcome() {
  const el = document.createElement('div');
  el.className = 'screen';
  el.id = 'screen-welcome';
  el.style.cssText = 'background:#0d1a12;overflow:hidden;';

  el.innerHTML = `
    <div id="welcome-scene" style="position:absolute;inset:0;">

      <div id="stars" style="position:absolute;inset:0;pointer-events:none;"></div>

      <div class="moon" style="
        position:absolute;top:52px;right:72px;
        width:34px;height:34px;border-radius:50%;
        background:#f0e8c8;
        opacity:0;
        animation:fadeIn 2s ease-out 1s both;
      "></div>

      <div class="hills-far" style="
        position:absolute;bottom:220px;left:0;width:100%;height:160px;
        opacity:0;animation:fadeUp 2.5s ease-out 0.8s both;
      ">
        <svg width="100%" height="160" viewBox="0 0 380 160" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 120 Q60 40 130 80 Q180 110 220 60 Q270 10 320 55 Q355 85 380 70 L380 160 L0 160Z" fill="#1e4a35" opacity="0.8"/>
          <path d="M0 140 Q80 75 150 100 Q200 118 250 80 Q300 45 340 70 Q360 82 380 78 L380 160 L0 160Z" fill="#1a3d2c" opacity="0.7"/>
        </svg>
      </div>

      <div class="forest" style="
        position:absolute;bottom:210px;left:-10px;width:200px;height:140px;
        opacity:0;animation:fadeIn 2.5s ease-out 1s both;
      ">
        <svg width="200" height="140" viewBox="0 0 200 140" aria-hidden="true">
          <polygon points="10,140 30,65 50,140" fill="#0d2318"/>
          <polygon points="28,140 52,48 76,140" fill="#0f2a1e"/>
          <polygon points="48,140 70,38 94,140" fill="#0d2318"/>
          <polygon points="65,140 88,52 112,140" fill="#102c20"/>
          <polygon points="85,140 105,58 126,140" fill="#0d2318"/>
          <polygon points="100,140 124,45 148,140" fill="#0f2a1e"/>
          <polygon points="118,140 142,60 166,140" fill="#0d2318"/>
          <polygon points="136,140 162,50 188,140" fill="#102c20"/>
          <rect x="0" y="125" width="200" height="20" fill="#0d2318"/>
        </svg>
      </div>

      <div class="house" style="
        position:absolute;bottom:268px;right:84px;
        opacity:0;animation:fadeIn 3s ease-out 2.5s both;
      ">
        <svg width="40" height="36" viewBox="0 0 40 36" aria-hidden="true">
          <rect x="8" y="17" width="24" height="19" fill="#0f2a1e" opacity="0.85"/>
          <polygon points="4,19 20,4 36,19" fill="#0d2318" opacity="0.9"/>
          <rect x="14" y="22" width="6" height="7" fill="#c8882a" opacity="0.6" rx="0.5"/>
          <rect x="22" y="22" width="6" height="7" fill="#c8882a" opacity="0.5" rx="0.5"/>
          <rect x="17" y="29" width="6" height="7" fill="#0a1f14" opacity="0.9" rx="0.5"/>
        </svg>
      </div>

      <div class="hills-mid" style="
        position:absolute;bottom:160px;left:0;width:100%;height:140px;
        opacity:0;animation:fadeUp 2.5s ease-out 1.2s both;
      ">
        <svg width="100%" height="140" viewBox="0 0 380 140" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 100 Q40 60 100 80 Q160 100 210 55 Q260 15 310 50 Q345 72 380 60 L380 140 L0 140Z" fill="#1c3d28" opacity="0.9"/>
          <path d="M0 120 Q70 85 140 105 Q190 120 240 88 Q290 60 340 80 L380 90 L380 140 L0 140Z" fill="#183324" opacity="0.8"/>
        </svg>
      </div>

      <div class="ground" style="position:absolute;bottom:0;left:0;width:100%;height:200px;">
        <svg width="100%" height="200" viewBox="0 0 380 200" preserveAspectRatio="none" aria-hidden="true">
          <rect x="0" y="0" width="380" height="200" fill="#0f2a1a"/>
          <path d="M0 30 Q95 12 190 28 Q285 42 380 22 L380 200 L0 200Z" fill="#112e1c" opacity="0.6"/>
          <ellipse cx="190" cy="160" rx="18" ry="70" fill="#183524" opacity="0.25"/>
        </svg>
      </div>

      <div class="mist" style="
        position:absolute;bottom:195px;left:-20%;
        width:140%;height:60px;
        background:rgba(180,210,190,0.12);
        filter:blur(16px);border-radius:50%;
        animation:mistFloat 6s ease-in-out 2s infinite alternate;
      "></div>

      <div style="
        position:absolute;inset:0;
        background:linear-gradient(to top,
          rgba(8,22,14,0.9) 0%,
          rgba(8,22,14,0.6) 25%,
          rgba(8,22,14,0.2) 55%,
          transparent 100%
        );
      "></div>
    </div>

    <div style="
      position:absolute;inset:0;
      display:flex;flex-direction:column;
      justify-content:flex-end;
      padding:0 32px calc(max(52px, var(--safe-bottom)) + 52px);
    ">
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:11px;letter-spacing:0.35em;text-transform:uppercase;
        color:var(--color-cream-40);margin-bottom:10px;
        opacity:0;animation:fadeIn 2s ease-out 2.8s both;
      ">your life</div>

      <div style="
        font-family:var(--font-serif);font-style:italic;font-weight:300;
        font-size:clamp(38px,10vw,52px);line-height:1;
        color:var(--color-cream-90);letter-spacing:0.02em;
        opacity:0;animation:fadeUp 2.5s ease-out 3.1s both;
      ">unlocked</div>

      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:11px;letter-spacing:0.22em;text-transform:uppercase;
        color:var(--color-cream-40);margin-top:16px;margin-bottom:32px;
        opacity:0;animation:fadeIn 2s ease-out 3.8s both;
      ">everything in its season</div>

      <button id="welcome-begin" style="
        align-self:flex-start;
        padding:14px 36px;
        border:0.5px solid var(--color-cream-40);
        border-radius:2px;
        font-family:var(--font-sans);font-weight:300;
        font-size:11px;letter-spacing:0.28em;text-transform:uppercase;
        color:var(--color-cream-90);
        transition:background 0.4s ease,border-color 0.4s ease;
        opacity:0;animation:fadeIn 2s ease-out 4.4s both;
      ">begin</button>
    </div>

    <style>
      @keyframes mistFloat {
        from { opacity:0.6; transform:translateX(0); }
        to   { opacity:1;   transform:translateX(12px); }
      }
    </style>
  `;

  function initStars() {
    const container = el.querySelector('#stars');
    const sky = el.querySelector('#welcome-scene');
    const skyH = sky ? sky.offsetHeight * 0.6 : 300;

    for (let i = 0; i < 60; i++) {
      const s = document.createElement('div');
      const size = Math.random() < 0.15 ? 2.5 : Math.random() < 0.4 ? 1.5 : 1;
      const minO = (0.2 + Math.random() * 0.3).toFixed(2);
      const maxO = Math.min(parseFloat(minO) + 0.3 + Math.random() * 0.4, 1).toFixed(2);
      s.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;border-radius:50%;
        background:#fff;
        left:${Math.random() * 100}%;
        top:${Math.random() * skyH}px;
        opacity:0;
        animation:
          fadeIn 3s ease-out ${(0.5 + Math.random() * 2).toFixed(1)}s both,
          twinkle ${(2 + Math.random() * 4).toFixed(1)}s ease-in-out ${(Math.random() * 3).toFixed(1)}s infinite alternate;
        --min:${minO};--max:${maxO};
      `;
      container.appendChild(s);
    }
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes twinkle {
      from { opacity: var(--min, 0.3); }
      to   { opacity: var(--max, 0.9); }
    }
  `;
  document.head.appendChild(style);

  return {
    el,
    mount(container) {
      container.appendChild(el);
      requestAnimationFrame(() => initStars());

      const btn = el.querySelector('#welcome-begin');
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(240,235,218,0.08)';
        btn.style.borderColor = 'var(--color-cream-60)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'transparent';
        btn.style.borderColor = 'var(--color-cream-40)';
      });

      return new Promise(resolve => {
        btn.addEventListener('click', resolve, { once: true });
      });
    },
    unmount() {
      return transitions.fadeOut(el, 700).then(() => el.remove());
    },
  };
}
