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

// Contact form validation and error handling
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const fields = {
    fullName: document.getElementById("fullName"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    message: document.getElementById("message"),
  };

  const errors = {
    fullName: document.getElementById("fullNameError"),
    email: document.getElementById("emailError"),
    phone: document.getElementById("phoneError"),
    message: document.getElementById("messageError"),
  };

  const statusBox = document.getElementById("formStatus");

  function setError(fieldName, message) {
    const field = fields[fieldName];
    const error = errors[fieldName];
    if (!field || !error) return;

    field.classList.add("input-error");
    error.textContent = message;
  }

  function clearError(fieldName) {
    const field = fields[fieldName];
    const error = errors[fieldName];
    if (!field || !error) return;

    field.classList.remove("input-error");
    error.textContent = "";
  }

  function showStatus(type, message) {
    if (!statusBox) return;
    statusBox.className = `form-status ${type}`;
    statusBox.textContent = message;
  }

  function clearStatus() {
    if (!statusBox) return;
    statusBox.className = "form-status";
    statusBox.textContent = "";
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    const cleaned = phone.replace(/\s/g, "");
    return /^(\+27|0)[0-9]{9}$/.test(cleaned);
  }

  function validateForm() {
    let isValid = true;
    clearStatus();

    Object.keys(errors).forEach(clearError);

    if (!fields.fullName.value.trim()) {
      setError("fullName", "Please enter your full name.");
      isValid = false;
    } else if (fields.fullName.value.trim().length < 3) {
      setError("fullName", "Full name must be at least 3 characters.");
      isValid = false;
    }

    if (!fields.email.value.trim()) {
      setError("email", "Please enter your email address.");
      isValid = false;
    } else if (!isValidEmail(fields.email.value.trim())) {
      setError("email", "Please enter a valid email address.");
      isValid = false;
    }

    if (!fields.phone.value.trim()) {
      setError("phone", "Please enter your phone number.");
      isValid = false;
    } else if (!isValidPhone(fields.phone.value.trim())) {
      setError("phone", "Use a valid SA number, e.g. +27 12 345 6789 or 0123456789.");
      isValid = false;
    }

    if (!fields.message.value.trim()) {
      setError("message", "Please enter your message.");
      isValid = false;
    } else if (fields.message.value.trim().length < 10) {
      setError("message", "Message must be at least 10 characters.");
      isValid = false;
    }

    return isValid;
  }

  Object.keys(fields).forEach((fieldName) => {
    const field = fields[fieldName];
    if (!field) return;
    field.addEventListener("input", () => {
      clearError(fieldName);
      clearStatus();
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm()) {
      showStatus("error", "Please fix the highlighted fields before sending.");
      return;
    }

    showStatus("success", "Thank you! Your message has been validated successfully.");
    form.reset();
  });
})();
