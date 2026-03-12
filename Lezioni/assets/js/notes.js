(function () {
  const path = window.location.pathname;
  const fileName = path.split('/').pop() || '';
  const baseName = fileName.replace(/\.html?$/i, '');

  if (!baseName || !document.body.classList.contains('lesson-page')) {
    return;
  }

  const mapPanel = document.querySelector('.map-panel');
  const contentPanel = document.querySelector('.content-panel');
  if (!mapPanel || !contentPanel) {
    return;
  }

  const notesKey = 'notes-' + baseName;
  const highlightsKey = 'highlights-' + baseName;

  const fullLessonToggle = document.querySelector('[data-toggle-full]');
  const fullLessonTargetId = fullLessonToggle ? fullLessonToggle.getAttribute('data-toggle-full') : '';

  const actionBar = document.createElement('div');
  actionBar.className = 'lesson-action-bar';

  const pdfLink = document.createElement('a');
  pdfLink.className = 'ghost-btn';
  pdfLink.href = 'assets/pdf/' + baseName + '.pdf';
  pdfLink.target = '_blank';
  pdfLink.rel = 'noopener noreferrer';
  pdfLink.textContent = 'Scarica PDF';

  const fullLessonButton = document.createElement('button');
  fullLessonButton.className = 'pill-btn';
  fullLessonButton.type = 'button';
  fullLessonButton.textContent = 'Lezione completa';

  const openNotesButton = document.createElement('button');
  openNotesButton.className = 'ghost-btn';
  openNotesButton.type = 'button';
  openNotesButton.textContent = 'Appunti';

  actionBar.appendChild(pdfLink);
  actionBar.appendChild(fullLessonButton);
  actionBar.appendChild(openNotesButton);
  mapPanel.appendChild(actionBar);

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

  const highlightButton = document.createElement('button');
  highlightButton.type = 'button';
  highlightButton.className = 'selection-highlight-btn';
  highlightButton.textContent = 'Evidenzia';
  highlightButton.hidden = true;
  document.body.appendChild(highlightButton);

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

  function downloadNotesFile(content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'appunti-' + baseName + '.txt';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);
  }

  function saveNotes() {
    localStorage.setItem(notesKey, textarea.value);
    downloadNotesFile(textarea.value);
  }

  function clearNotes() {
    textarea.value = '';
    localStorage.removeItem(notesKey);
  }

  function setFullLessonState(open) {
    fullLessonButton.textContent = open ? 'Chiudi lezione completa' : 'Lezione completa';
  }

  function toggleFullLesson() {
    if (fullLessonToggle) {
      fullLessonToggle.click();
      const target = fullLessonTargetId ? document.getElementById(fullLessonTargetId) : null;
      const isOpen = !!(target && target.classList.contains('open'));
      setFullLessonState(isOpen);
      return;
    }

    const fallback = document.querySelector('.full-lesson');
    if (!fallback) {
      return;
    }
    const isOpen = fallback.classList.toggle('open');
    setFullLessonState(isOpen);
  }

  openNotesButton.addEventListener('click', openPopup);
  saveButton.addEventListener('click', saveNotes);
  clearButton.addEventListener('click', clearNotes);
  fullLessonButton.addEventListener('click', toggleFullLesson);
  closeButtons.forEach(function (btn) {
    btn.addEventListener('click', closePopup);
  });

  if (fullLessonToggle && fullLessonTargetId) {
    const target = document.getElementById(fullLessonTargetId);
    setFullLessonState(!!(target && target.classList.contains('open')));
  }

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

  function readHighlights() {
    try {
      const parsed = JSON.parse(localStorage.getItem(highlightsKey) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveHighlights(ranges) {
    localStorage.setItem(highlightsKey, JSON.stringify(ranges));
  }

  function getTextNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        if (node.parentElement && node.parentElement.closest('.lesson-highlight')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    let current;
    while ((current = walker.nextNode())) {
      nodes.push(current);
    }
    return nodes;
  }

  function unwrapHighlights() {
    contentPanel.querySelectorAll('.lesson-highlight').forEach(function (node) {
      const parent = node.parentNode;
      while (node.firstChild) {
        parent.insertBefore(node.firstChild, node);
      }
      parent.removeChild(node);
    });
  }

  function findPosition(nodes, offset) {
    let total = 0;
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      const nextTotal = total + node.nodeValue.length;
      if (offset <= nextTotal) {
        return { node: node, offset: offset - total };
      }
      total = nextTotal;
    }

    const last = nodes[nodes.length - 1];
    if (!last) {
      return null;
    }
    return { node: last, offset: last.nodeValue.length };
  }

  function applyHighlight(start, end) {
    const nodes = getTextNodes(contentPanel);
    if (!nodes.length) {
      return;
    }

    const startPos = findPosition(nodes, start);
    const endPos = findPosition(nodes, end);
    if (!startPos || !endPos) {
      return;
    }

    const range = document.createRange();
    range.setStart(startPos.node, Math.max(0, startPos.offset));
    range.setEnd(endPos.node, Math.max(0, endPos.offset));

    if (range.collapsed) {
      return;
    }

    const mark = document.createElement('mark');
    mark.className = 'lesson-highlight';
    const fragment = range.extractContents();
    mark.appendChild(fragment);
    range.insertNode(mark);
  }

  function renderHighlights() {
    const ranges = readHighlights();
    unwrapHighlights();
    ranges.forEach(function (rangeItem) {
      if (!rangeItem || typeof rangeItem.start !== 'number' || typeof rangeItem.end !== 'number') {
        return;
      }
      if (rangeItem.end <= rangeItem.start) {
        return;
      }
      applyHighlight(rangeItem.start, rangeItem.end);
    });
  }

  function selectionToOffsets(selectionRange) {
    const preStart = document.createRange();
    preStart.setStart(contentPanel, 0);
    preStart.setEnd(selectionRange.startContainer, selectionRange.startOffset);

    const preEnd = document.createRange();
    preEnd.setStart(contentPanel, 0);
    preEnd.setEnd(selectionRange.endContainer, selectionRange.endOffset);

    return {
      start: preStart.toString().length,
      end: preEnd.toString().length
    };
  }

  function mergeRanges(ranges, newRange) {
    const sorted = ranges.concat([newRange]).sort(function (a, b) {
      return a.start - b.start;
    });

    return sorted.reduce(function (acc, current) {
      if (!acc.length) {
        acc.push(current);
        return acc;
      }

      const prev = acc[acc.length - 1];
      if (current.start <= prev.end) {
        prev.end = Math.max(prev.end, current.end);
      } else {
        acc.push(current);
      }
      return acc;
    }, []);
  }

  function getValidSelectionRange() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const common = range.commonAncestorContainer;
    const element = common.nodeType === Node.ELEMENT_NODE ? common : common.parentElement;

    if (!element || !contentPanel.contains(element)) {
      return null;
    }

    if (element.closest('.cta-row, button, a')) {
      return null;
    }

    return range;
  }

  function hideHighlightButton() {
    highlightButton.hidden = true;
  }

  function placeHighlightButton() {
    const range = getValidSelectionRange();
    if (!range) {
      hideHighlightButton();
      return;
    }

    const rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      hideHighlightButton();
      return;
    }

    const top = Math.max(10, rect.top + window.scrollY - 44);
    const left = Math.max(10, rect.left + window.scrollX);
    highlightButton.style.top = top + 'px';
    highlightButton.style.left = left + 'px';
    highlightButton.hidden = false;
  }

  highlightButton.addEventListener('click', function () {
    const range = getValidSelectionRange();
    if (!range) {
      hideHighlightButton();
      return;
    }

    const offsets = selectionToOffsets(range);
    if (!offsets || offsets.end <= offsets.start) {
      hideHighlightButton();
      return;
    }

    const merged = mergeRanges(readHighlights(), offsets);
    saveHighlights(merged);
    renderHighlights();

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }

    hideHighlightButton();
  });

  document.addEventListener('selectionchange', function () {
    if (document.activeElement === textarea) {
      return;
    }
    placeHighlightButton();
  });

  document.addEventListener('scroll', hideHighlightButton, true);
  document.addEventListener('pointerdown', function (event) {
    if (!event.target.closest('.selection-highlight-btn')) {
      hideHighlightButton();
    }
  });

  renderHighlights();
})();
