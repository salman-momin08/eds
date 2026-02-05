export default function decorate(block) {
  const rows = [...block.children];
  
  // The first row is our Section Title
  const titleRow = rows.shift();
  titleRow.classList.add('features-title-row');

  // Process the rest as Feature Cards
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'features-cards-container';

  rows.forEach((row) => {
    row.classList.add('feature-card');
    
    // Find the emoji (usually the first <p>)
    const emoji = row.querySelector('p:first-child');
    if (emoji) {
      emoji.classList.add('feature-icon');
    }

    // Re-organize content: Emoji on top, Text below
    const h3 = row.querySelector('h3');
    const desc = row.querySelector('p:not(.feature-icon)');
    
    // Clear and rebuild for consistent vertical alignment inside the horizontal card
    row.textContent = ''; 
    if (emoji) row.append(emoji);
    if (h3) row.append(h3);
    if (desc) row.append(desc);
    
    cardsContainer.append(row);
  });

  block.append(cardsContainer);
}