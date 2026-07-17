document.addEventListener("DOMContentLoaded", () => {
  const SERVICE_FEES = {
    "Gastric Sleeve Surgery": 500, "Gastric Bypass Surgery": 500, "Revision Surgeries": 600,
    "Intragastric Balloon": 400, "Hernia Repair": 350, "Gallbladder Surgery": 400,
    "Appendectomy": 350, "Thyroid & Parathyroid Surgery": 450,
    "General Consultation": 300, "Follow-up Visit": 200
  };
  const DEFAULT_FEE = 300;

  let booking = {};
  try { booking = JSON.parse(sessionStorage.getItem("salamBooking") || "{}"); } catch (e) { booking = {}; }

  const fee = SERVICE_FEES[booking.service] || DEFAULT_FEE;

  const setText = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
  setText("#sumName", booking.name || "—");
  setText("#sumService", booking.service || "General Consultation");
  setText("#sumDate", booking.date || "—");
  setText("#sumTime", booking.time || "—");
  setText("#sumFee", fee + " EGP");
  setText("#sumTotal", fee + " EGP");

  /* Payment method tabs */
  const tabs = document.querySelectorAll(".pay-tab");
  const cardForm = document.querySelector(".pay-card-form");
  const otherNote = document.querySelector(".pay-note");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const isCard = tab.dataset.method === "card";
      cardForm && cardForm.classList.toggle("active", isCard);
      if (otherNote) {
        otherNote.style.display = isCard ? "none" : "flex";
        otherNote.querySelector("span").textContent = isCard ? "" :
          `You'll receive a ${tab.dataset.method === "vodafone" ? "Vodafone Cash" : "Fawry"} payment code by SMS after confirming.`;
      }
    });
  });

  /* Card number / expiry formatting */
  const cardNumber = document.querySelector("#cardNumber");
  const cardExpiry = document.querySelector("#cardExpiry");
  const cardVisualNum = document.querySelector(".card-visual .num");
  if (cardNumber) {
    cardNumber.addEventListener("input", () => {
      let v = cardNumber.value.replace(/\D/g, "").slice(0, 16);
      v = v.replace(/(.{4})/g, "$1 ").trim();
      cardNumber.value = v;
      if (cardVisualNum) cardVisualNum.textContent = v || "•••• •••• •••• ••••";
    });
  }
  if (cardExpiry) {
    cardExpiry.addEventListener("input", () => {
      let v = cardExpiry.value.replace(/\D/g, "").slice(0, 4);
      if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
      cardExpiry.value = v;
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
    if (payBtn) { payBtn.disabled = true; payBtn.innerHTML = 'Processing <i class="fa-solid fa-circle-notch fa-spin"></i>'; }
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
