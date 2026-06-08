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
        <button type="button" class="btn btn-primary download-quote-btn" id="download-quote">Download Quote</button>
        <a class="btn btn-primary" href="contact.html">Request This Quote →</a>
        <button type="button" class="btn clear-quote-btn" id="clear-quote">Clear Selection</button>
      </div>
    `;

    const downloadButton = document.getElementById("download-quote");
    if (downloadButton) {
      downloadButton.addEventListener("click", () => downloadQuote(selected, subtotal, discountAmount, vat, total));
    }

    const clearButton = document.getElementById("clear-quote");
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        checkboxes.forEach((box) => (box.checked = false));
        updateQuote();
      });
    }
  }


  function downloadQuote(selected, subtotal, discountAmount, vat, total) {
    if (!selected || selected.length === 0) {
      alert("Please select at least one course before downloading a quote.");
      return;
    }

    const today = new Date().toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const courseLines = selected
      .map((course, index) => `${index + 1}. ${course.name} (${course.duration}) - ${currency(course.price)}`)
      .join("\n");

    const quoteContent = `EMPOWERING THE NATION
Training Quotation
Generated: ${today}

Selected Courses
----------------
${courseLines}

Pricing Summary
---------------
Subtotal: ${currency(subtotal)}
Bulk Discount: - ${currency(discountAmount)}
VAT (15%): ${currency(vat)}
Total: ${currency(total)}

Contact Details
---------------
Phone: +27 12 345 6789
Email: info@empoweringthenation.co.za

Thank you for choosing Empowering the Nation.
Empowering Communities Through Education.
`;

    const blob = new Blob([quoteContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "empowering-the-nation-quote.txt";
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
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


/* =========================================================
   Global Language Switcher - Final Presentation Fix
   ---------------------------------------------------------
   What it does:
   - Uses one shared language system across all pages.
   - Saves the user's selected language in localStorage.
   - Applies translations without reloading the page.
   - Re-applies translations when quote content updates dynamically.
   ========================================================= */
(function () {
  const TRANSLATIONS = {
    af: {
      "Home": "Tuis",
      "Courses": "Kursusse",
      "Get Quote": "Kry Kwotasie",
      "Get a Quote": "Kry 'n Kwotasie",
      "Contact": "Kontak",
      "Contact Us": "Kontak Ons",
      "View Courses →": "Bekyk Kursusse →",
      "View Courses": "Bekyk Kursusse",
      "Back to All Courses": "← Terug na Alle Kursusse",
      "← Back to All Courses": "← Terug na Alle Kursusse",
      "Empowering Communities Through Education": "Bemagtig Gemeenskappe Deur Onderwys",
      "Empowering Communities Through Quality Skills Training": "Bemagtig Gemeenskappe Deur Gehalte Vaardigheidsopleiding",
      "Professional development courses for unemployed individuals, domestic workers, and gardeners.": "Professionele ontwikkelingskursusse vir werklose individue, huishoudelike werkers en tuiniers.",
      "Why Choose Us?": "Hoekom Ons Kies?",
      "We are committed to providing quality education and training.": "Ons is verbind tot gehalte onderwys en opleiding.",
      "Quality Training": "Gehalte Opleiding",
      "Affordable Pricing": "Bekostigbare Pryse",
      "Community Focused": "Gemeenskapsgefokus",
      "Training Programs": "Opleidingsprogramme",
      "Explore our comprehensive range of practical skills training courses designed to empower individuals and communities.": "Verken ons reeks praktiese vaardigheidskursusse wat ontwerp is om individue en gemeenskappe te bemagtig.",
      "6-Month Intensive Courses": "6-Maande Intensiewe Kursusse",
      "6-Week Short Courses": "6-Week Kort Kursusse",
      "First Aid": "Noodhulp",
      "Sewing": "Naaldwerk",
      "Landscaping": "Landskapwerk",
      "Life Skills": "Lewensvaardighede",
      "Child Minding": "Kinderversorging",
      "Cooking": "Kookkuns",
      "Garden Maintenance": "Tuinonderhoud",
      "View Course": "Bekyk Kursus",
      "6 Months": "6 Maande",
      "6 Weeks": "6 Weke",
      "6 Months Course": "6 Maande Kursus",
      "6 Weeks Course": "6 Weke Kursus",
      "What You'll Learn": "Wat Jy Sal Leer",
      "Course Details": "Kursusbesonderhede",
      "Duration": "Duur",
      "Price": "Prys",
      "Certification": "Sertifisering",
      "Training Type": "Opleidingstipe",
      "Bulk Discount": "Grootmaat Afslag",
      "Save up to 15% when you enroll in multiple courses.": "Spaar tot 15% wanneer jy vir verskeie kursusse inskryf.",
      "Calculate Your Savings": "Bereken Jou Besparing",
      "Ready to Start Your First Aid Training?": "Gereed om met Jou Noodhulpopleiding te Begin?",
      "Ready to Start Your Sewing Training?": "Gereed om met Jou Naaldwerkopleiding te Begin?",
      "Ready to Start Your Landscaping Training?": "Gereed om met Jou Landskapopleiding te Begin?",
      "Ready to Start Your Life Skills Training?": "Gereed om met Jou Lewensvaardigheidsopleiding te Begin?",
      "Ready to Start Your Child Minding Training?": "Gereed om met Jou Kinderversorgingsopleiding te Begin?",
      "Ready to Start Your Cooking Training?": "Gereed om met Jou Kookopleiding te Begin?",
      "Ready to Start Your Garden Maintenance Training?": "Gereed om met Jou Tuinonderhoudopleiding te Begin?",
      "Get a personalized quote or contact us to learn more about enrollment and start dates.": "Kry 'n persoonlike kwotasie of kontak ons vir meer inligting oor inskrywing en begindatums.",
      "Course Quote Calculator": "Kursus Kwotasie Sakrekenaar",
      "Select the courses you're interested in and see your personalized quote with automatic bulk discounts applied.": "Kies die kursusse waarin jy belangstel en sien jou persoonlike kwotasie met outomatiese grootmaat-afslag.",
      "Select Your Courses": "Kies Jou Kursusse",
      "Choose one or more courses to get started. Discounts are automatically applied for multiple courses.": "Kies een of meer kursusse om te begin. Afslag word outomaties vir verskeie kursusse toegepas.",
      "ⓘ Bulk Discounts:": "ⓘ Grootmaat Afslag:",
      "2 courses = 5% off • 3 courses = 10% off • 4+ courses = 15% off": "2 kursusse = 5% af • 3 kursusse = 10% af • 4+ kursusse = 15% af",
      "R1,500 each": "R1,500 elk",
      "R750 each": "R750 elk",
      "Quote Summary": "Kwotasie Opsomming",
      "Selected courses": "Gekose kursusse",
      "Select courses to see your quote": "Kies kursusse om jou kwotasie te sien",
      "Subtotal": "Subtotaal",
      "Bulk Discount (0%)": "Grootmaat Afslag (0%)",
      "VAT (15%)": "BTW (15%)",
      "Total": "Totaal",
      "Download Quote": "Laai Kwotasie Af",
      "Request This Quote →": "Versoek Hierdie Kwotasie →",
      "Clear Selection": "Maak Keuse Skoon",
      "Contact Us": "Kontak Ons",
      "Have questions about our courses? Need more information? We're here to help!": "Het jy vrae oor ons kursusse? Benodig jy meer inligting? Ons is hier om te help!",
      "Request Information": "Versoek Inligting",
      "Fill out the form and we'll get back to you within 24 hours": "Vul die vorm in en ons sal binne 24 uur terugkom na jou toe",
      "Full Name": "Volle Naam",
      "Email Address": "E-posadres",
      "Phone Number": "Telefoonnommer",
      "Course Interest": "Kursusbelangstelling",
      "Select a course": "Kies 'n kursus",
      "Message": "Boodskap",
      "Send Message": "Stuur Boodskap",
      "Find Us": "Vind Ons",
      "Visit our training centre in Johannesburg": "Besoek ons opleidingsentrum in Johannesburg",
      "Quick Links": "Vinnige Skakels",
      "Contact Information": "Kontakinligting"
    },
    zu: {
      "Home": "Ikhaya",
      "Courses": "Izifundo",
      "Get Quote": "Thola Ikhotheshini",
      "Get a Quote": "Thola Ikhotheshini",
      "Contact": "Xhumana Nathi",
      "Contact Us": "Xhumana Nathi",
      "View Courses →": "Buka Izifundo →",
      "View Courses": "Buka Izifundo",
      "Back to All Courses": "← Buyela Kuzo Zonke Izifundo",
      "← Back to All Courses": "← Buyela Kuzo Zonke Izifundo",
      "Empowering Communities Through Education": "Ukuqinisa Imiphakathi Ngemfundo",
      "Empowering Communities Through Quality Skills Training": "Ukuqinisa Imiphakathi Ngokuqeqeshwa Kwamakhono Asezingeni",
      "Professional development courses for unemployed individuals, domestic workers, and gardeners.": "Izifundo zokuthuthukisa amakhono kubantu abangasebenzi, abasebenzi basezindlini nabalimi bezingadi.",
      "Why Choose Us?": "Kungani Ukhethe Thina?",
      "We are committed to providing quality education and training.": "Sizinikele ekunikezeni imfundo nokuqeqeshwa kwekhwalithi.",
      "Quality Training": "Ukuqeqeshwa Kwekhwalithi",
      "Affordable Pricing": "Amanani Angabizi",
      "Community Focused": "Kugxile Emphakathini",
      "Training Programs": "Izinhlelo Zokuqeqesha",
      "Explore our comprehensive range of practical skills training courses designed to empower individuals and communities.": "Hlola uhla lwethu lwezifundo zamakhono ezenzelwe ukuqinisa abantu nemiphakathi.",
      "6-Month Intensive Courses": "Izifundo Ezingu-6 Izinyanga",
      "6-Week Short Courses": "Izifundo Ezimfushane Zamasonto Ayisi-6",
      "First Aid": "Usizo Lokuqala",
      "Sewing": "Ukuthunga",
      "Landscaping": "Ukuhlelwa Kwendawo",
      "Life Skills": "Amakhono Empilo",
      "Child Minding": "Ukunakekela Izingane",
      "Cooking": "Ukupheka",
      "Garden Maintenance": "Ukunakekelwa Kwengadi",
      "View Course": "Buka Isifundo",
      "6 Months": "Izinyanga Ezi-6",
      "6 Weeks": "Amasonto Ayisi-6",
      "6 Months Course": "Isifundo Sezinyanga Ezi-6",
      "6 Weeks Course": "Isifundo Samasonto Ayisi-6",
      "What You'll Learn": "Ozokufunda",
      "Course Details": "Imininingwane Yesifundo",
      "Duration": "Isikhathi",
      "Price": "Intengo",
      "Certification": "Isitifiketi",
      "Training Type": "Uhlobo Lokuqeqeshwa",
      "Bulk Discount": "Isaphulelo Sezifundo Eziningi",
      "Save up to 15% when you enroll in multiple courses.": "Wonga kufika ku-15% uma ubhalisela izifundo eziningi.",
      "Calculate Your Savings": "Bala Ukonga Kwakho",
      "Ready to Start Your First Aid Training?": "Usukulungele Ukuqala Usizo Lokuqala?",
      "Ready to Start Your Sewing Training?": "Usukulungele Ukuqala Ukuthunga?",
      "Ready to Start Your Landscaping Training?": "Usukulungele Ukuqala Ukuhlelwa Kwendawo?",
      "Ready to Start Your Life Skills Training?": "Usukulungele Ukuqala Amakhono Empilo?",
      "Ready to Start Your Child Minding Training?": "Usukulungele Ukuqala Ukunakekela Izingane?",
      "Ready to Start Your Cooking Training?": "Usukulungele Ukuqala Ukupheka?",
      "Ready to Start Your Garden Maintenance Training?": "Usukulungele Ukuqala Ukunakekelwa Kwengadi?",
      "Get a personalized quote or contact us to learn more about enrollment and start dates.": "Thola ikhotheshini yakho noma uxhumane nathi ukuze uthole imininingwane yokubhalisa nezinsuku zokuqala.",
      "Course Quote Calculator": "Isibali Sekhotheshini Yezifundo",
      "Select the courses you're interested in and see your personalized quote with automatic bulk discounts applied.": "Khetha izifundo ozithandayo ubone ikhotheshini yakho enezaphulelo ezizenzakalelayo.",
      "Select Your Courses": "Khetha Izifundo Zakho",
      "Choose one or more courses to get started. Discounts are automatically applied for multiple courses.": "Khetha isifundo esisodwa noma ngaphezulu ukuze uqale. Izaphulelo zisebenza ngokuzenzakalela uma ukhetha eziningi.",
      "ⓘ Bulk Discounts:": "ⓘ Izaphulelo Zezifundo Eziningi:",
      "2 courses = 5% off • 3 courses = 10% off • 4+ courses = 15% off": "2 izifundo = 5% phansi • 3 izifundo = 10% phansi • 4+ izifundo = 15% phansi",
      "R1,500 each": "R1,500 ngayinye",
      "R750 each": "R750 ngayinye",
      "Quote Summary": "Isifinyezo Sekhotheshini",
      "Selected courses": "Izifundo ezikhethiwe",
      "Select courses to see your quote": "Khetha izifundo ukuze ubone ikhotheshini",
      "Subtotal": "Inani elincane",
      "Bulk Discount (0%)": "Isaphulelo (0%)",
      "VAT (15%)": "VAT (15%)",
      "Total": "Inani Lonke",
      "Download Quote": "Landa Ikhotheshini",
      "Request This Quote →": "Cela Le Khotheshini →",
      "Clear Selection": "Sula Okukhethiwe",
      "Have questions about our courses? Need more information? We're here to help!": "Unemibuzo ngezifundo zethu? Udinga ulwazi olwengeziwe? Silapha ukukusiza!",
      "Request Information": "Cela Ulwazi",
      "Fill out the form and we'll get back to you within 24 hours": "Gcwalisa ifomu sizobuyela kuwe kungakapheli amahora angu-24",
      "Full Name": "Igama Eligcwele",
      "Email Address": "Ikheli le-imeyili",
      "Phone Number": "Inombolo Yocingo",
      "Course Interest": "Isifundo Osithandayo",
      "Select a course": "Khetha isifundo",
      "Message": "Umlayezo",
      "Send Message": "Thumela Umlayezo",
      "Find Us": "Sithole",
      "Visit our training centre in Johannesburg": "Vakashela isikhungo sethu sokuqeqesha eJohannesburg",
      "Quick Links": "Izixhumanisi Ezisheshayo",
      "Contact Information": "Ulwazi Lokuxhumana"
    },
    st: {
      "Home": "Lehae",
      "Courses": "Dithuto",
      "Get Quote": "Fumana Khoutheishene",
      "Get a Quote": "Fumana Khoutheishene",
      "Contact": "Ikopanye",
      "Contact Us": "Ikopanye le Rona",
      "View Courses →": "Sheba Dithuto →",
      "View Courses": "Sheba Dithuto",
      "Back to All Courses": "← Kgutlela Dithutong Tsohle",
      "← Back to All Courses": "← Kgutlela Dithutong Tsohle",
      "Empowering Communities Through Education": "Ho Matlafatsa Metse ka Thuto",
      "Empowering Communities Through Quality Skills Training": "Ho Matlafatsa Metse ka Koetliso ya Bokgoni ba Boleng",
      "Professional development courses for unemployed individuals, domestic workers, and gardeners.": "Dithuto tsa ntshetsopele ya bokgoni bakeng sa batho ba sa sebetseng, basebetsi ba malapeng le balemi ba dirapa.",
      "Why Choose Us?": "Hobaneng o Kgetha Rona?",
      "We are committed to providing quality education and training.": "Re ikemiseditse ho fana ka thuto le koetliso ya boleng.",
      "Quality Training": "Koetliso ya Boleng",
      "Affordable Pricing": "Ditjeho tse Kgonehang",
      "Community Focused": "E Shebane le Setjhaba",
      "Training Programs": "Mananeo a Koetliso",
      "Explore our comprehensive range of practical skills training courses designed to empower individuals and communities.": "Lekola dithuto tsa rona tsa bokgoni tse reretsweng ho matlafatsa batho le metse.",
      "6-Month Intensive Courses": "Dithuto tsa Dikgwedi tse 6",
      "6-Week Short Courses": "Dithuto tse Kgutshwane tsa Dibeke tse 6",
      "First Aid": "Thuso ya Pele",
      "Sewing": "Ho Roka",
      "Landscaping": "Tlhophiso ya Sebaka",
      "Life Skills": "Bokgoni ba Bophelo",
      "Child Minding": "Tlhokomelo ya Bana",
      "Cooking": "Ho Pheha",
      "Garden Maintenance": "Tlhokomelo ya Serapa",
      "View Course": "Sheba Thuto",
      "6 Months": "Dikgwedi tse 6",
      "6 Weeks": "Dibeke tse 6",
      "6 Months Course": "Thuto ya Dikgwedi tse 6",
      "6 Weeks Course": "Thuto ya Dibeke tse 6",
      "What You'll Learn": "Seo o Tla Ithuta Sona",
      "Course Details": "Dintlha tsa Thuto",
      "Duration": "Nako",
      "Price": "Theko",
      "Certification": "Setifikeiti",
      "Training Type": "Mofuta wa Koetliso",
      "Bulk Discount": "Theolelo ya Dithuto tse Ngata",
      "Save up to 15% when you enroll in multiple courses.": "Boloka ho fihlela ho 15% ha o ingodisa dithutong tse ngata.",
      "Calculate Your Savings": "Bala Poloko ya Hao",
      "Ready to Start Your First Aid Training?": "O Itokiseditse ho Qala Thuso ya Pele?",
      "Ready to Start Your Sewing Training?": "O Itokiseditse ho Qala Ho Roka?",
      "Ready to Start Your Landscaping Training?": "O Itokiseditse ho Qala Tlhophiso ya Sebaka?",
      "Ready to Start Your Life Skills Training?": "O Itokiseditse ho Qala Bokgoni ba Bophelo?",
      "Ready to Start Your Child Minding Training?": "O Itokiseditse ho Qala Tlhokomelo ya Bana?",
      "Ready to Start Your Cooking Training?": "O Itokiseditse ho Qala Ho Pheha?",
      "Ready to Start Your Garden Maintenance Training?": "O Itokiseditse ho Qala Tlhokomelo ya Serapa?",
      "Get a personalized quote or contact us to learn more about enrollment and start dates.": "Fumana khoutheishene ya hao kapa ikopanye le rona bakeng sa tlhahisoleseding ya ho ingodisa le matsatsi a ho qala.",
      "Course Quote Calculator": "Sebali sa Khoutheishene ya Dithuto",
      "Select the courses you're interested in and see your personalized quote with automatic bulk discounts applied.": "Kgetha dithuto tseo o di ratang mme o bone khoutheishene ya hao ka ditheolelo tse iketsahallang.",
      "Select Your Courses": "Kgetha Dithuto tsa Hao",
      "Choose one or more courses to get started. Discounts are automatically applied for multiple courses.": "Kgetha thuto e le nngwe kapa tse ngata ho qala. Ditholelo di sebetsa ka boyona ha o kgetha tse ngata.",
      "ⓘ Bulk Discounts:": "ⓘ Ditholelo tsa Dithuto tse Ngata:",
      "2 courses = 5% off • 3 courses = 10% off • 4+ courses = 15% off": "Dithuto tse 2 = 5% tlase • tse 3 = 10% tlase • 4+ = 15% tlase",
      "R1,500 each": "R1,500 ka nngwe",
      "R750 each": "R750 ka nngwe",
      "Quote Summary": "Kakaretso ya Khoutheishene",
      "Selected courses": "Dithuto tse kgethilweng",
      "Select courses to see your quote": "Kgetha dithuto ho bona khoutheishene",
      "Subtotal": "Kakaretso ya pele",
      "Bulk Discount (0%)": "Theolelo (0%)",
      "VAT (15%)": "VAT (15%)",
      "Total": "Kakaretso",
      "Download Quote": "Khoasolla Khoutheishene",
      "Request This Quote →": "Kopa Khoutheishene Ena →",
      "Clear Selection": "Hlakola Kgetho",
      "Have questions about our courses? Need more information? We're here to help!": "Na o na le dipotso ka dithuto tsa rona? O hloka tlhahisoleseding e eketsehileng? Re mona ho thusa!",
      "Request Information": "Kopa Tlhahisoleseding",
      "Fill out the form and we'll get back to you within 24 hours": "Tlatsa foromo mme re tla kgutlela ho wena nakong ya dihora tse 24",
      "Full Name": "Lebitso ka Botlalo",
      "Email Address": "Aterese ya Imeile",
      "Phone Number": "Nomoro ya Mohala",
      "Course Interest": "Thuto eo o e Ratang",
      "Select a course": "Kgetha thuto",
      "Message": "Molaetsa",
      "Send Message": "Romela Molaetsa",
      "Find Us": "Re Fumane",
      "Visit our training centre in Johannesburg": "Etela setsi sa rona sa koetliso Johannesburg",
      "Quick Links": "Dihokelo tse Potlakileng",
      "Contact Information": "Tlhahisoleseding ya Puisano"
    }
  };

  const LANGUAGE_LABELS = {
    en: "English",
    af: "Afrikaans",
    zu: "isiZulu",
    st: "Sesotho"
  };

  const originalText = new WeakMap();
  const originalPlaceholder = new WeakMap();
  let isApplying = false;

  function normaliseText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function preserveSpacing(original, replacement) {
    const leading = (original.match(/^\s*/) || [""])[0];
    const trailing = (original.match(/\s*$/) || [""])[0];
    return leading + replacement + trailing;
  }

  function ensureLanguageSelector() {
    let selector = document.getElementById("language");
    if (!selector) {
      const navWrap = document.querySelector(".nav-wrap");
      if (!navWrap) return null;
      selector = document.createElement("select");
      selector.id = "language";
      navWrap.appendChild(selector);
    }

    selector.innerHTML = "";
    Object.entries(LANGUAGE_LABELS).forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      selector.appendChild(option);
    });

    return selector;
  }

  function translateTextNode(node, lang) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const english = originalText.get(node);
    if (lang === "en") {
      node.nodeValue = english;
      return;
    }
    const key = normaliseText(english);
    const translated = TRANSLATIONS[lang] && TRANSLATIONS[lang][key];
    if (translated) node.nodeValue = preserveSpacing(english, translated);
    else node.nodeValue = english;
  }

  function shouldSkipNode(parent) {
    if (!parent) return true;
    const tag = parent.nodeName.toLowerCase();
    return ["script", "style", "noscript", "svg", "path", "textarea", "option"].includes(tag);
  }

  function applyLanguage(lang) {
    if (!lang || !LANGUAGE_LABELS[lang]) lang = "en";
    isApplying = true;

    document.documentElement.lang = lang;
    const selector = ensureLanguageSelector();
    if (selector) selector.value = lang;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!normaliseText(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        if (shouldSkipNode(node.parentNode)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => translateTextNode(node, lang));

    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((field) => {
      if (!originalPlaceholder.has(field)) originalPlaceholder.set(field, field.getAttribute("placeholder"));
      const english = originalPlaceholder.get(field);
      if (lang === "en") field.setAttribute("placeholder", english);
      else field.setAttribute("placeholder", (TRANSLATIONS[lang] && TRANSLATIONS[lang][english]) || english);
    });

    localStorage.setItem("preferredLanguage", lang);
    window.setTimeout(() => { isApplying = false; }, 0);
  }

  function initialiseLanguageSwitcher() {
    const selector = ensureLanguageSelector();
    const savedLanguage = localStorage.getItem("preferredLanguage") || "en";

    if (selector) {
      selector.value = savedLanguage;
      selector.addEventListener("change", function () {
        applyLanguage(this.value);
      });
    }

    applyLanguage(savedLanguage);

    const observer = new MutationObserver(() => {
      if (isApplying) return;
      const activeLanguage = localStorage.getItem("preferredLanguage") || "en";
      if (activeLanguage !== "en") window.setTimeout(() => applyLanguage(activeLanguage), 0);
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseLanguageSwitcher);
  } else {
    initialiseLanguageSwitcher();
  }

  window.applyLanguage = applyLanguage;
})();
