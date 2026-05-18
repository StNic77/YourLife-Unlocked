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
      justify-content:flex-end;
      padding:0 32px calc(max(52px, var(--safe-bottom)) + 52px);
    ">
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:11px;letter-spacing:0.35em;text-transform:uppercase;
        color:var(--color-cream-40);margin-bottom:10px;
        opacity:0;animation:fadeIn 1.5s ease-out 0.6s both;
      ">your life</div>
      <div style="
        font-family:var(--font-serif);font-style:italic;font-weight:300;
        font-size:clamp(38px,10vw,52px);line-height:1;
        color:var(--color-cream-90);letter-spacing:0.02em;
        opacity:0;animation:fadeUp 2s ease-out 0.9s both;
      ">unlocked</div>
      <div style="
        font-family:var(--font-sans);font-weight:200;
        font-size:11px;letter-spacing:0.22em;text-transform:uppercase;
        color:var(--color-cream-40);margin-top:16px;margin-bottom:32px;
        opacity:0;animation:fadeIn 1.5s ease-out 1.6s both;
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