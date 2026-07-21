document.addEventListener("DOMContentLoaded", () => {
  const SERVICE_FEES = {
    "Gastric Sleeve Surgery": 500, "Gastric Bypass Surgery": 500, "Revision Surgeries": 600,
    "Intragastric Balloon": 400, "Hernia Repair": 350, "Gallbladder Surgery": 400,
    "Appendectomy": 350, "Thyroid & Parathyroid Surgery": 450,
    "General Consultation": 300, "Follow-up Visit": 200,
    /* Arabic equivalents, used when the booking form was submitted from the Arabic pages */
    "تكميم المعدة": 500, "تحويل مسار المعدة": 500, "جراحات تصحيحية": 600,
    "البالون المعدي": 400, "علاج الفتق": 350, "جراحة المرارة": 400,
    "استئصال الزائدة الدودية": 350, "جراحة الغدة الدرقية والجار درقية": 450,
    "استشارة عامة": 300, "زيارة متابعة": 200
  };
  const DEFAULT_FEE = 300;
  const isRTL = document.documentElement.dir === "rtl";
  const CURRENCY = isRTL ? "جنيه" : "EGP";

  let booking = {};
  try { booking = JSON.parse(sessionStorage.getItem("salamBooking") || "{}"); } catch (e) { booking = {}; }

  const fee = SERVICE_FEES[booking.service] || DEFAULT_FEE;
  const dash = "—";

  const setText = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
  setText("#sumName", booking.name || dash);
  setText("#sumService", booking.service || (isRTL ? "استشارة عامة" : "General Consultation"));
  setText("#sumDate", booking.date || dash);
  setText("#sumTime", booking.time || dash);
  setText("#sumFee", fee + " " + CURRENCY);
  setText("#sumTotal", fee + " " + CURRENCY);

  /* Payment method tabs */
  const tabs = document.querySelectorAll(".pay-tab");
  const cardForm = document.querySelector(".pay-card-form");
  const transferBoxes = document.querySelectorAll(".transfer-box");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const method = tab.dataset.method;
      const isCard = method === "card";
      cardForm && cardForm.classList.toggle("active", isCard);
      cardForm && (cardForm.querySelectorAll("input").forEach(i => i.required = isCard));
      transferBoxes.forEach(box => {
        const match = box.dataset.methodBox === method;
        box.style.display = match ? "block" : "none";
      });
    });
  });

  /* Copy-to-clipboard for transfer details */
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.copy;
      const done = () => {
        const original = btn.innerHTML;
        btn.classList.add("copied");
        btn.innerHTML = isRTL ? '<i class="fa-solid fa-check"></i> تم النسخ' : '<i class="fa-solid fa-check"></i> Copied';
        setTimeout(() => { btn.classList.remove("copied"); btn.innerHTML = original; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(val).then(done).catch(done);
      } else {
        done();
      }
    });
  });

  /* Card number / expiry / holder — live visual updates */
  const cardNumber = document.querySelector("#cardNumber");
  const cardExpiry = document.querySelector("#cardExpiry");
  const cardHolder = document.querySelector("#cardHolder");
  const cvNumber = document.querySelector("#cvNumber");
  const cvExpiry = document.querySelector("#cvExpiry");
  const cvHolder = document.querySelector("#cvHolder");

  if (cardNumber) {
    cardNumber.addEventListener("input", () => {
      let v = cardNumber.value.replace(/\D/g, "").slice(0, 16);
      v = v.replace(/(.{4})/g, "$1 ").trim();
      cardNumber.value = v;
      if (cvNumber) cvNumber.textContent = v || "•••• •••• •••• ••••";
    });
  }
  if (cardExpiry) {
    cardExpiry.addEventListener("input", () => {
      let v = cardExpiry.value.replace(/\D/g, "").slice(0, 4);
      if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
      cardExpiry.value = v;
      if (cvExpiry) cvExpiry.textContent = v || "MM/YY";
    });
  }
  if (cardHolder) {
    cardHolder.addEventListener("input", () => {
      if (cvHolder) cvHolder.textContent = cardHolder.value.trim().toUpperCase() || (isRTL ? "اسمك" : "YOUR NAME");
    });
  }

  /* Fake pay flow */
  const payForm = document.querySelector("#paymentForm");
  const payWrap = document.querySelector(".pay-form-wrap");
  const summaryEl = document.querySelector(".order-summary");
  const successEl = document.querySelector(".pay-success");
  const refEl = document.querySelector("#bookingRef");
  const payBtn = document.querySelector("#payBtn");

  payForm && payForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (payBtn) { payBtn.disabled = true; payBtn.innerHTML = isRTL ? 'جاري المعالجة <i class="fa-solid fa-circle-notch fa-spin"></i>' : 'Processing <i class="fa-solid fa-circle-notch fa-spin"></i>'; }
    setTimeout(() => {
      payWrap && payWrap.classList.add("hide");
      summaryEl && summaryEl.classList.add("hide");
      successEl && successEl.classList.add("show");
      if (refEl) refEl.textContent = "SLM-" + Math.floor(100000 + Math.random() * 900000);
      try { sessionStorage.removeItem("salamBooking"); } catch (err) {}
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1100);
  });
});
