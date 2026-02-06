export default function decorate(block) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  let isHotels = true;

  // 1. Build the UI
  block.innerHTML = `
    <div class="search-wrapper">
      <div class="search-main-container">
        <div class="search-fields-grid">
          <div class="search-field hotel-only">
            <label>Destination</label>
            <input type="text" id="locInput" placeholder="City or Hotel">
          </div>
          <div class="search-field flight-only" style="display:none">
            <label>From</label>
            <input type="text" id="fromInput" placeholder="Departure">
          </div>
          <div class="search-field flight-only" style="display:none">
            <label>To</label>
            <input type="text" id="toInput" placeholder="Arrival">
          </div>
          <div class="search-field">
            <label id="dateLabel">Check in</label>
            <input type="date" id="checkin" min="${today}" value="${today}">
          </div>
          <div class="search-field hotel-only">
            <label>Check out</label>
            <input type="date" id="checkout" min="${tomorrow}" value="${tomorrow}">
          </div>
          <div class="search-field hotel-only" id="guestField">
            <label>Guests</label>
            <div id="guestTrigger" class="guest-trigger">2 Adults, 1 Room</div>
            <div id="guestDropdown" class="guest-dropdown">
              <div class="counter-row" data-type="adults">
                <span>Adults</span>
                <div class="counter-ctrl">
                  <button class="minus">−</button>
                  <span class="val">2</span>
                  <button class="plus">+</button>
                </div>
              </div>
              <div class="counter-row" data-type="rooms">
                <span>Rooms</span>
                <div class="counter-ctrl">
                  <button class="minus">−</button>
                  <span class="val">1</span>
                  <button class="plus">+</button>
                </div>
              </div>
            </div>
          </div>
          <div class="search-actions">
            <button class="search-btn">Search</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Create results container after hero section
  const heroSection = document.querySelector('.hero');
  let resultsBox = document.querySelector('#resultsContainer');

  if (!resultsBox) {
    resultsBox = document.createElement('div');
    resultsBox.id = 'resultsContainer';
    resultsBox.className = 'results-list-container';
    resultsBox.style.display = 'none';

    if (heroSection && heroSection.parentElement) {
      heroSection.parentElement.insertBefore(resultsBox, heroSection.nextSibling);
    } else {
      document.querySelector('main').appendChild(resultsBox);
    }
  }
  const dateLabel = block.querySelector('#dateLabel');
  const guestTrigger = block.querySelector('#guestTrigger');
  const guestDropdown = block.querySelector('#guestDropdown');

  const buildHotelMarkup = (item, displayPrice) => `
    <div class="result-list-item">
      <img src="${item.image || ''}" class="list-img" alt="travel-img">
      <div class="list-info">
        <div class="list-text">
          <h4>${item.name || 'Hotel'}</h4>
          <p>${item.city || ''} • ⭐ ${item.rating || '4.5'}</p>
        </div>
        <div class="list-price-group">
          <span class="price-val">₹${displayPrice}</span>
          <button class="view-deal-btn">View Deal</button>
        </div>
      </div>
    </div>`;

  const buildFlightMarkup = (item, displayPrice) => `
    <div class="result-list-item flight-result">
      <div class="flight-info-full">
        <div class="flight-route">
          <h4>${item.from || 'Departure'} → ${item.to || 'Arrival'}</h4>
          <p class="airline-name">${item.airline || 'Airline'}</p>
        </div>
        <div class="flight-price-section">
          <span class="price-val">₹${displayPrice}</span>
          <button class="view-deal-btn">Book Now</button>
        </div>
      </div>
    </div>`;

  // 2. Tab Switch Sync
  window.addEventListener('search:tab-change', (e) => {
    isHotels = e.detail.tab === 'hotels';
    block.querySelectorAll('.hotel-only').forEach((el) => {
      el.style.display = isHotels ? 'flex' : 'none';
    });
    block.querySelectorAll('.flight-only').forEach((el) => {
      el.style.display = isHotels ? 'none' : 'flex';
    });
    dateLabel.textContent = isHotels ? 'Check in' : 'Departure';
    resultsBox.style.display = 'none';
  });

  // 3. Dropdown Logic
  guestTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    guestDropdown.classList.toggle('show');
  });

  document.addEventListener('click', () => guestDropdown.classList.remove('show'));
  guestDropdown.addEventListener('click', (e) => e.stopPropagation());

  block.querySelectorAll('.counter-ctrl').forEach((ctrl) => {
    ctrl.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const valSpan = ctrl.querySelector('.val');
      const row = ctrl.closest('.counter-row');
      const type = row ? row.dataset.type : 'adults';
      const max = type === 'rooms' ? 20 : 30;
      let val = parseInt(valSpan.textContent, 10);
      val = btn.classList.contains('plus')
        ? Math.min(max, val + 1)
        : Math.max(1, val - 1);
      valSpan.textContent = val;

      const adults = block.querySelector('[data-type="adults"] .val').textContent;
      const rooms = block.querySelector('[data-type="rooms"] .val').textContent;
      guestTrigger.textContent = `${adults} Adults, ${rooms} Room${rooms > 1 ? 's' : ''}`;
    });
  });

  // 4. Search Logic
  block.querySelector('.search-btn').addEventListener('click', async () => {
    const query = isHotels ? block.querySelector('#locInput').value.trim() : block.querySelector('#toInput').value.trim();
    if (!query) {
      // eslint-disable-next-line no-alert
      alert('Please enter a search term.');
      return;
    }

    resultsBox.innerHTML = '<div class="results-header"><h2>Searching...</h2></div>';
    resultsBox.style.display = 'flex';

    try {
      const resp = await fetch('/spreadsheet/hotels-flights-data.json');
      const json = await resp.json();
      let data = isHotels ? (json.data || json.hotels?.data || []) : (json['data-2'] || json.flights?.data || []);
      if (!Array.isArray(data) && typeof data === 'object') data = data.data || [];

      const filtered = data.filter((item) => {
        const val = isHotels ? item.city : item.to;
        return val?.toString().toLowerCase().includes(query.toLowerCase());
      });

      // Display Results inline
      if (filtered.length === 0) {
        resultsBox.innerHTML = `
          <div class="results-header">
            <h2>Search Results for "${query}"</h2>
            <button class="clear-btn">Clear Results</button>
          </div>
          <div class="results-grid">
            <div class="status-msg">No results found. Try a different search term.</div>
          </div>
        `;
      } else {
        const resultsMarkup = filtered.map((item) => {
          const displayPrice = isHotels
            ? (item.pricePerNight || item.price || item.rate || 'N/A')
            : (item.price || item.fare || 'N/A');

          return isHotels
            ? buildHotelMarkup(item, displayPrice)
            : buildFlightMarkup(item, displayPrice);
        }).join('');

        resultsBox.innerHTML = `
          <div class="results-header">
            <h2>Search Results for "${query}" (${filtered.length} found)</h2>
            <button class="clear-btn">Clear Results</button>
          </div>
          <div class="results-grid">
            ${resultsMarkup}
          </div>
        `;
      }

      // Smooth scroll to results
      setTimeout(() => {
        resultsBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

      // Attach clear button handler
      const clearBtn = resultsBox.querySelector('.clear-btn');
      if (clearBtn) {
        clearBtn.onclick = () => {
          block.querySelectorAll('input:not([type="date"])').forEach((i) => {
            i.value = '';
          });
          resultsBox.style.display = 'none';
        };
      }
    } catch (e) {
      resultsBox.innerHTML = `
        <div class="results-header">
          <h2>Error</h2>
          <button class="clear-btn">Clear Results</button>
        </div>
        <div class="results-grid">
          <div class="status-msg">Error fetching data. Please try again.</div>
        </div>
      `;
      
      // Attach clear button handler for error state
      const clearBtn = resultsBox.querySelector('.clear-btn');
      if (clearBtn) {
        clearBtn.onclick = () => {
          block.querySelectorAll('input:not([type="date"])').forEach((i) => {
            i.value = '';
          });
          resultsBox.style.display = 'none';
        };
      }
    }
  });
}
