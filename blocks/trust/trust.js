export default function decorate(block) {
  // Add class for horizontal flex layout
  block.classList.add('trust-list');

  [...block.children].forEach((row) => {
    row.classList.add('trust-item-row');
    
    const cell = row.querySelector(':scope > div');
    if (cell) {
      cell.classList.add('trust-item-content');
      
      // Remove any paragraph margins that break alignment
      const p = cell.querySelector('p');
      if (p) p.style.margin = '0';
    }
  });
}
