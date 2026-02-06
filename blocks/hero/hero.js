export default function decorate(block) {
  const container = document.createElement('div');
  container.className = 'hero-content';
  const rows = [...block.children];
  let textWrapper = null;
  let buttonWrapper = null;

  rows.forEach((row) => {
    // 1. Handle Background Image
    const pic = row.querySelector('picture');
    if (pic) {
      const bg = document.createElement('div');
      bg.className = 'hero-bg';
      bg.append(pic);
      block.prepend(bg);
      row.remove();
      return;
    }

    // 2. Detect if this is a button row (should only have Hotels/Flights as separate cells)
    const cells = Array.from(row.children);
    const cellTexts = cells.map((c) => c.innerText.trim().toLowerCase());

    // Check if this row has exactly "hotels" and/or "flights" as individual cells
    const hasHotelCell = cellTexts.some((t) => t === 'hotels');
    const hasFlightCell = cellTexts.some((t) => t === 'flights');
    const isButtonRow = (hasHotelCell || hasFlightCell) && cells.length <= 2;

    if (isButtonRow) {
      // Create button wrapper only once
      if (!buttonWrapper) {
        buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'hero-buttons';
      }

      cells.forEach((cell) => {
        const text = cell.innerText.trim();
        const lowerText = text.toLowerCase();

        if (lowerText === 'hotels' || lowerText === 'flights') {
          const btn = document.createElement('button');
          btn.className = 'hero-btn';
          btn.textContent = text;

          if (lowerText === 'hotels') btn.dataset.tab = 'hotels';
          else if (lowerText === 'flights') btn.dataset.tab = 'flights';

          buttonWrapper.append(btn);
        }
      });
    } else {
      // This is regular text content - keep it
      if (!textWrapper) {
        textWrapper = document.createElement('div');
        textWrapper.className = 'hero-text-wrapper';
      }
      textWrapper.append(...row.childNodes);
    }

    row.remove();
  });

  // Add text wrapper if it has content
  if (textWrapper && textWrapper.children.length > 0) {
    container.prepend(textWrapper);
  }

  // Add button wrapper if it has buttons
  if (buttonWrapper && buttonWrapper.children.length > 0) {
    container.append(buttonWrapper);
  }

  const overlay = document.createElement('div');
  overlay.className = 'hero-overlay';
  block.append(overlay);
  block.append(container);

  // Move Search Block inside Hero (EDS way: find by class/block-name)
  // Wait a bit for search block to be created
  setTimeout(() => {
    const searchBlock = document.querySelector('.search.block');
    if (searchBlock && !searchBlock.closest('.hero-content')) {
      container.append(searchBlock);
    }
  }, 100);

  // Sync Tab Buttons
  const toggleButtons = block.querySelectorAll('.hero-btn');

  // Activate first button by default (Hotels)
  if (toggleButtons.length > 0) {
    toggleButtons[0].classList.add('active');
    window.dispatchEvent(new CustomEvent('search:tab-change', {
      detail: { tab: toggleButtons[0].dataset.tab || 'hotels' },
    }));
  }

  toggleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      toggleButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      window.dispatchEvent(new CustomEvent('search:tab-change', {
        detail: { tab: btn.dataset.tab },
      }));
    });
  });
}
