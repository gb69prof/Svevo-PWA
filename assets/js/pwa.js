
(() => {
  if (!('serviceWorker' in navigator)) return;
  const updateBanner = document.getElementById('update-banner');
  const reloadBtn = document.getElementById('reload-app');
  let waitingWorker = null;

  const showUpdate = (registration) => {
    waitingWorker = registration.waiting;
    if (updateBanner && waitingWorker) updateBanner.classList.add('show');
  };

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      if (registration.waiting) showUpdate(registration);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdate(registration);
          }
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (window.__swReloading) return;
        window.__swReloading = true;
        window.location.reload();
      });

      if (reloadBtn) {
        reloadBtn.addEventListener('click', () => {
          if (waitingWorker) waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        });
      }
    } catch (err) {
      console.error('SW registration failed:', err);
    }
  });

  const drawer = document.getElementById('drawer');
  const openBtn = document.getElementById('open-menu');
  const closeBtn = document.getElementById('close-menu');
  const closeDrawer = () => drawer && drawer.classList.remove('open');
  if (openBtn && drawer) openBtn.addEventListener('click', () => drawer.classList.add('open'));
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  drawer?.querySelector('.drawer-backdrop')?.addEventListener('click', closeDrawer);

  let deferredPrompt = null;
  const installBtn = document.getElementById('install-app');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.hidden = false;
  });
  installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
  });
})();
