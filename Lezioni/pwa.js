
(function () {
  const pathBase = location.pathname.replace(/\/[^/]*$/, '/');
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register(pathBase + 'service-worker.js');
        if (reg.waiting) showUpdate(reg.waiting);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdate(newWorker);
            }
          });
        });

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          location.reload();
        });
      } catch (err) {
        console.error('SW registration failed', err);
      }
    });
  }

  function showUpdate(worker) {
    const banner = document.getElementById('update-banner');
    const btn = document.getElementById('reload-app');
    if (!banner || !btn) return;
    banner.classList.add('show');
    btn.onclick = () => worker.postMessage({ type: 'SKIP_WAITING' });
  }
})();
