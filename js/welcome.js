import { transitions } from './transitions.js';

export function createWelcome() {
  const el = document.createElement('div');
  el.className = 'screen';
  el.id = 'screen-welcome';
  el.style.cssText = 'background:#000;overflow:hidden;';

  el.innerHTML = `
    <div style="position:absolute;inset:0;">
      <img
        src="images/WELCOME_SCREEN.png"
        alt=""
        aria-hidden="true"
        style="width:100%;height:100%;object-fit:cover;object-position:center top;display:block;"
      >
      <div style="
        position:absolute;inset:0;
        background:linear-gradient(
          to top,
          rgba(0,0,0,0.82) 0%,
          rgba(0,0,0,0.4) 30%,
          rgba(0,0,0,0.1) 60%,
          transparent 100%
        );
      "></div>
    </div>

    <div style="
      position:absolute;inset:0;
      display:flex;flex-direction:column;
      justify-content:flex-end;align-items:flex-start;
      padding:0 36px calc(max(52px, var(--safe-bottom)) + 48px);
    ">
      <div style="
        font-family:var(--font-display);font-weight:500;
        font-size:clamp(30px,8vw,42px);line-height:1.05;
        letter-spacing:0.05em;
        color:var(--color-cream-90);
        opacity:0;animation:fadeUp 2s ease-out 0.9s both;
      ">Your Life / Unlocked</div>

      <div style="
        font-family:var(--font-tagline);font-style:italic;font-weight:300;
        font-size:clamp(14px,3.5vw,18px);
        letter-spacing:0.06em;
        color:var(--color-cream-60);
        margin-top:10px;margin-bottom:36px;
        opacity:0;animation:fadeIn 1.5s ease-out 1.6s both;
      ">Life, tended.</div>

      <button id="welcome-begin" style="
        align-self:flex-start;
        padding:14px 36px;
        border:0.5px solid var(--color-cream-40);
        border-radius:2px;
        font-family:var(--font-sans);font-weight:300;
        font-size:11px;letter-spacing:0.28em;text-transform:uppercase;
        color:var(--color-cream-90);
        transition:background 0.4s ease,border-color 0.4s ease;
        opacity:0;animation:fadeIn 1.5s ease-out 2.2s both;
      ">begin</button>
    </div>
  `;

  return {
    el,
    mount(container) {
      container.appendChild(el);

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
