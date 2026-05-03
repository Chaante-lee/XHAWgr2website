document.addEventListener("DOMContentLoaded", () => {
  const checkboxes = document.querySelectorAll(".course-checkbox");
  const countEl = document.getElementById("selected-count");
  const summaryBody = document.getElementById("quote-summary-body");

  const currency = (amount) => `R${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  function getDiscountRate(count) {
    if (count >= 4) return 0.15;
    if (count === 3) return 0.10;
    if (count === 2) return 0.05;
    return 0;
  }

  function updateQuote() {
    if (!summaryBody || !countEl) return;

    const selected = Array.from(checkboxes)
      .filter((box) => box.checked)
      .map((box) => ({
        name: box.dataset.name,
        duration: box.dataset.duration,
        price: Number(box.dataset.price),
      }));

    countEl.textContent = selected.length;

    if (selected.length === 0) {
      summaryBody.innerHTML = `
        <div class="empty-quote-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2"></rect>
            <path d="M8 6h8"></path>
            <circle cx="9" cy="11" r="1"></circle>
            <circle cx="12" cy="11" r="1"></circle>
            <circle cx="15" cy="11" r="1"></circle>
            <circle cx="9" cy="15" r="1"></circle>
            <circle cx="12" cy="15" r="1"></circle>
            <circle cx="15" cy="15" r="1"></circle>
          </svg>
        </div>
        <p class="empty-quote-text">Select courses to see your quote</p>
      `;
      return;
    }

    const subtotal = selected.reduce((sum, course) => sum + course.price, 0);
    const discountRate = getDiscountRate(selected.length);
    const discountAmount = subtotal * discountRate;
    const discountedSubtotal = subtotal - discountAmount;
    const vat = discountedSubtotal * 0.15;
    const total = discountedSubtotal + vat;

    const selectedHtml = selected.map((course) => `
      <div class="selected-course-line">
        <div><strong>${course.name}</strong><small>${course.duration}</small></div>
        <strong>${currency(course.price)}</strong>
      </div>
    `).join("");

    summaryBody.innerHTML = `
      ${selectedHtml}
      <div class="quote-total-lines">
        <div class="quote-total-line"><span>Subtotal</span><strong>${currency(subtotal)}</strong></div>
        <div class="quote-total-line discount-line"><span>Bulk Discount (${Math.round(discountRate * 100)}%)</span><strong>- ${currency(discountAmount)}</strong></div>
        <div class="quote-total-line"><span>VAT (15%)</span><strong>${currency(vat)}</strong></div>
      </div>
      <div class="quote-grand-total"><span>Total</span><strong>${currency(total)}</strong></div>
      <div class="quote-actions">
        <a class="btn btn-primary" href="contact.html">Request This Quote →</a>
        <button type="button" class="btn clear-quote-btn" id="clear-quote">Clear Selection</button>
      </div>
    `;

    const clearButton = document.getElementById("clear-quote");
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        checkboxes.forEach((box) => (box.checked = false));
        updateQuote();
      });
    }
  }

  checkboxes.forEach((box) => box.addEventListener("change", updateQuote));
  updateQuote();
});
