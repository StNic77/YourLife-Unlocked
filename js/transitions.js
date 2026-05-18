const DISSOLVE_DURATION = 900;
const DISSOLVE_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

export const transitions = {
  dissolve(outEl, inEl, duration = DISSOLVE_DURATION) {
    return new Promise(resolve => {
      if (!outEl && !inEl) { resolve(); return; }

      if (!outEl) {
        inEl.style.opacity = '0';
        inEl.style.display = 'block';
        requestAnimationFrame(() => {
          inEl.style.transition = `opacity ${duration}ms ${DISSOLVE_EASING}`;
          inEl.style.opacity = '1';
          setTimeout(resolve, duration);
        });
        return;
      }

      if (!inEl) {
        outEl.style.transition = `opacity ${duration}ms ${DISSOLVE_EASING}`;
        outEl.style.opacity = '0';
        setTimeout(() => {
          outEl.style.display = 'none';
          resolve();
        }, duration);
        return;
      }

      inEl.style.opacity = '0';
      inEl.style.display = 'block';
      inEl.style.zIndex = '2';
      outEl.style.zIndex = '1';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          inEl.style.transition = `opacity ${duration}ms ${DISSOLVE_EASING}`;
          outEl.style.transition = `opacity ${duration}ms ${DISSOLVE_EASING}`;
          inEl.style.opacity = '1';
          outEl.style.opacity = '0';

          setTimeout(() => {
            outEl.style.display = 'none';
            outEl.style.transition = '';
            inEl.style.transition = '';
            inEl.style.zIndex = '';
            outEl.style.zIndex = '';
            resolve();
          }, duration);
        });
      });
    });
  },

  fadeIn(el, duration = 600, delay = 0) {
    return new Promise(resolve => {
      el.style.opacity = '0';
      el.style.transition = `opacity ${duration}ms ease ${delay}ms`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          setTimeout(resolve, duration + delay);
        });
      });
    });
  },

  fadeOut(el, duration = 600) {
    return new Promise(resolve => {
      el.style.transition = `opacity ${duration}ms ease`;
      el.style.opacity = '0';
      setTimeout(resolve, duration);
    });
  },

  crossfadeImages(outImg, inImg, duration = DISSOLVE_DURATION) {
    return new Promise(resolve => {
      inImg.style.opacity = '0';
      inImg.style.transition = `opacity ${duration}ms ${DISSOLVE_EASING}`;
      outImg.style.transition = `opacity ${duration}ms ${DISSOLVE_EASING}`;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          inImg.style.opacity = '1';
          outImg.style.opacity = '0';
          setTimeout(resolve, duration);
        });
      });
    });
  },
};
