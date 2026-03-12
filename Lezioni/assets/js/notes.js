(function () {
  const path = window.location.pathname;
  const fileName = path.split('/').pop() || '';
  const baseName = fileName.replace(/\.html?$/i, '');

  if (!baseName || !document.body.classList.contains('lesson-page')) {
    return;
  }

  const ctaRow = document.querySelector('.cta-row');
  if (!ctaRow) {
    return;
  }

  const pdfLink = document.createElement('a');
  pdfLink.className = 'ghost-btn';
  pdfLink.href = 'assets/pdf/' + baseName + '.pdf';
  pdfLink.target = '_blank';
  pdfLink.rel = 'noopener noreferrer';
  pdfLink.textContent = 'Scarica PDF';
  ctaRow.appendChild(pdfLink);

  const openNotesButton = document.createElement('button');
  openNotesButton.className = 'ghost-btn';
  openNotesButton.type = 'button';
  openNotesButton.textContent = 'Appunti';
  ctaRow.appendChild(openNotesButton);

  const notesKey = 'notes-' + baseName;

  const popup = document.createElement('section');
  popup.className = 'notes-popup';
  popup.hidden = true;
  popup.innerHTML = [
    '<header class="notes-popup-header">',
    '  <h2>Appunti</h2>',
    '  <button type="button" class="icon-btn notes-close" aria-label="Chiudi appunti">✕</button>',
    '</header>',
    '<div class="notes-popup-body">',
    '  <textarea class="notes-textarea" placeholder="Scrivi qui i tuoi appunti..."></textarea>',
    '</div>',
    '<footer class="notes-popup-actions">',
    '  <button type="button" class="pill-btn notes-save">Salva</button>',
    '  <button type="button" class="ghost-btn notes-clear">Cancella</button>',
    '  <button type="button" class="ghost-btn notes-close">Chiudi</button>',
    '</footer>'
  ].join('');

  document.body.appendChild(popup);

  const textarea = popup.querySelector('.notes-textarea');
  const closeButtons = popup.querySelectorAll('.notes-close');
  const saveButton = popup.querySelector('.notes-save');
  const clearButton = popup.querySelector('.notes-clear');
  const dragHandle = popup.querySelector('.notes-popup-header');

  textarea.value = localStorage.getItem(notesKey) || '';

  function openPopup() {
    popup.hidden = false;
    requestAnimationFrame(function () {
      textarea.focus();
    });
  }

  function closePopup() {
    popup.hidden = true;
  }

  function saveNotes() {
    localStorage.setItem(notesKey, textarea.value);
  }

  function clearNotes() {
    textarea.value = '';
    localStorage.removeItem(notesKey);
  }

  openNotesButton.addEventListener('click', openPopup);
  saveButton.addEventListener('click', saveNotes);
  clearButton.addEventListener('click', clearNotes);
  closeButtons.forEach(function (btn) {
    btn.addEventListener('click', closePopup);
  });

  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  dragHandle.addEventListener('pointerdown', function (event) {
    if (event.target.closest('button')) {
      return;
    }
    dragging = true;
    pointerId = event.pointerId;
    popup.setPointerCapture(pointerId);

    const rect = popup.getBoundingClientRect();
    startX = event.clientX;
    startY = event.clientY;
    startLeft = rect.left;
    startTop = rect.top;

    popup.style.left = startLeft + 'px';
    popup.style.top = startTop + 'px';
    popup.style.right = 'auto';
    popup.style.bottom = 'auto';
  });

  popup.addEventListener('pointermove', function (event) {
    if (!dragging || event.pointerId !== pointerId) {
      return;
    }

    const nextLeft = startLeft + (event.clientX - startX);
    const nextTop = startTop + (event.clientY - startY);

    const maxLeft = Math.max(12, window.innerWidth - popup.offsetWidth - 12);
    const maxTop = Math.max(12, window.innerHeight - popup.offsetHeight - 12);

    popup.style.left = Math.min(Math.max(12, nextLeft), maxLeft) + 'px';
    popup.style.top = Math.min(Math.max(12, nextTop), maxTop) + 'px';
  });

  function stopDragging(event) {
    if (!dragging || event.pointerId !== pointerId) {
      return;
    }
    dragging = false;
    popup.releasePointerCapture(pointerId);
    pointerId = null;
  }

  popup.addEventListener('pointerup', stopDragging);
  popup.addEventListener('pointercancel', stopDragging);
})();
