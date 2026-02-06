import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  block.classList.add('card');
  const rows = [...block.children];
  block.innerHTML = '';

  rows.forEach((row) => {
    const cells = [...row.children];
    cells.forEach((cell) => {
      const cardItem = document.createElement('div');
      cardItem.className = 'card-item';

      const textContent = [];
      let saveText = '';

      [...cell.children].forEach((child) => {
        const text = child.textContent.trim();

        // This looks for "Save" in your document
        if (text.toLowerCase().includes('save')) {
          saveText = text;
        } else if (child.querySelector('picture') || child.tagName === 'PICTURE') {
          const imageDiv = document.createElement('div');
          imageDiv.className = 'card-image';
          imageDiv.append(child.querySelector('picture') || child);
          cardItem.append(imageDiv);
        } else {
          textContent.push(child);
        }
      });

      // FOR TESTING: If no save text is found in doc, we force one
      // if (!saveText) saveText = "Save up to 30%";

      // // Create Tag
      const tag = document.createElement('span');
      tag.className = 'card-save-tag';
      tag.textContent = saveText;
      cardItem.append(tag);

      // Create Body
      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'card-body';
      textContent.forEach((content) => bodyDiv.append(content));
      cardItem.append(bodyDiv);

      block.append(cardItem);
    });
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}
