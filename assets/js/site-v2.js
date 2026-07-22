document.addEventListener("DOMContentLoaded", () => {
  /* Preloader */
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => preloader.remove(), 600);
      }, 300);
    });
  }

  /* Bottom sheet menu */
  const menuBtn = document.querySelector(".dock-menu-btn");
  const sheet = document.querySelector(".bottom-sheet");
  const backdrop = document.querySelector(".sheet-backdrop");
  const closeBtn = document.querySelector(".sheet-close");
  const openSheet = () => { sheet.classList.add("open"); backdrop.classList.add("open"); document.body.style.overflow = "hidden"; };
  const shutSheet = () => { sheet.classList.remove("open"); backdrop.classList.remove("open"); document.body.style.overflow = ""; };
  menuBtn && menuBtn.addEventListener("click", openSheet);
  closeBtn && closeBtn.addEventListener("click", shutSheet);
  backdrop && backdrop.addEventListener("click", shutSheet);
  document.querySelectorAll(".sheet-nav a, .sheet-cta-row a").forEach(a => a.addEventListener("click", shutSheet));

  /* Segmented control (services toggle) with sliding thumb */
  const seg = document.querySelector(".segmented");
  if (seg) {
    const thumb = seg.querySelector(".segmented-thumb");
    const buttons = [...seg.querySelectorAll("button")];
    const panels = document.querySelectorAll(".svc-panel");
    const moveThumb = (btn) => {
      thumb.style.width = btn.offsetWidth + "px";
      thumb.style.transform = `translateX(${btn.offsetLeft - 5}px)`;
    };
    const active = seg.querySelector("button.active") || buttons[0];
    requestAnimationFrame(() => moveThumb(active));
    window.addEventListener("resize", () => moveThumb(seg.querySelector("button.active")));
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        panels.forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.target).classList.add("active");
        moveThumb(btn);
      });
    });
  }

  /* Testimonial nav */
  const track = document.querySelector(".testi-scroller");
  const prev = document.querySelector(".testi-prev2");
  const next = document.querySelector(".testi-next2");
  if (track) {
    const isRTL = document.documentElement.dir === "rtl";
    const amt = () => track.querySelector(".testi-card2").offsetWidth + 22;
    next && next.addEventListener("click", () => track.scrollBy({ left: isRTL ? -amt() : amt(), behavior: "smooth" }));
    prev && prev.addEventListener("click", () => track.scrollBy({ left: isRTL ? amt() : -amt(), behavior: "smooth" }));
  }

  /* Drag-to-scroll for horizontal carousels (mouse). Touch already scrolls natively. */
  const makeDraggable = (el) => {
    if (!el) return;
    let isDown = false, startX = 0, startScroll = 0, moved = false;
    el.classList.add("drag-scroll");
    el.addEventListener("mousedown", (e) => {
      isDown = true; moved = false;
      startX = e.pageX; startScroll = el.scrollLeft;
      el.classList.add("dragging");
    });
    window.addEventListener("mouseup", () => { isDown = false; el.classList.remove("dragging"); });
    window.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startScroll - dx;
    });
    // Prevent link/card clicks from firing right after a real drag
    el.addEventListener("click", (e) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  };
  document.querySelectorAll(".journey-scroller, .testi-scroller").forEach(makeDraggable);

  /* Reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  /* Counter animation */
  const cIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor(progress * target);
        if (progress < 1) requestAnimationFrame(tick); else el.textContent = target;
      };
      requestAnimationFrame(tick);
      cIo.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll(".count-up").forEach(el => cIo.observe(el));

  /* Dock shadow on scroll */
  const dock = document.querySelector(".dock-nav");
  if (dock) {
    const onScroll = () => {
      if (window.scrollY > 20) dock.style.boxShadow = "0 24px 60px -18px rgba(10,14,26,.35)";
      else dock.style.boxShadow = "0 20px 50px -20px rgba(10,14,26,.25)";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Back-to-top button visibility + action + social FAB position swap */
  const topBtn = document.querySelector(".fab-top");
  const fabStack = document.querySelector(".fab-stack");
  if (topBtn) {
    const toggleTop = () => {
      const scrolled = window.scrollY > 480;
      topBtn.classList.toggle("show", scrolled);
      if (fabStack) fabStack.classList.toggle("scrolled", scrolled);
    };
    window.addEventListener("scroll", toggleTop, { passive: true });
    toggleTop();
    topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* Social speed-dial FAB */
  const fabSocial = document.querySelector(".fab-social");
  if (fabSocial) {
    // Open by default
    fabSocial.classList.add("open");

    const mainBtn = fabSocial.querySelector(".main-social");
    mainBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      fabSocial.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
      if (!fabSocial.contains(e.target)) fabSocial.classList.remove("open");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") fabSocial.classList.remove("open");
    });
  }

  /* Accordion (FAQ v2) */
  document.querySelectorAll(".acc2-item").forEach(item => {
    const head = item.querySelector(".acc2-head");
    const bodyEl = item.querySelector(".acc2-body");
    if (!head || !bodyEl) return;
    head.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".acc2-item").forEach(i => { i.classList.remove("open"); i.querySelector(".acc2-body").style.maxHeight = null; });
      if (!isOpen) { item.classList.add("open"); bodyEl.style.maxHeight = bodyEl.scrollHeight + "px"; }
    });
  });

  /* Video CTA modal */
  const videoPlay = document.querySelector(".video-play");
  const videoModalBackdrop = document.querySelector(".video-modal-backdrop");
  const videoModalClose = document.querySelector(".video-modal-close");
  const videoEl = document.querySelector(".video-modal-box video");
  if (videoPlay && videoModalBackdrop) {
    const openVideo = () => {
      videoModalBackdrop.classList.add("open");
      document.body.classList.add("modal-open");
      if (videoEl) { videoEl.currentTime = 0; videoEl.play().catch(() => {}); }
    };
    const closeVideo = () => {
      videoModalBackdrop.classList.remove("open");
      document.body.classList.remove("modal-open");
      if (videoEl) videoEl.pause();
    };
    videoPlay.addEventListener("click", openVideo);
    videoModalClose && videoModalClose.addEventListener("click", closeVideo);
    videoModalBackdrop.addEventListener("click", (e) => { if (e.target === videoModalBackdrop) closeVideo(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeVideo(); });
  }

  /* Blog post modal (reads content from each card's <template>, no separate details page) */
  const blogBackdrop = document.querySelector(".blog-modal-backdrop");
  const blogModal = document.querySelector(".blog-modal");
  if (blogBackdrop && blogModal) {
    const modalHeroImg = blogModal.querySelector(".modal-hero img");
    const modalBody = blogModal.querySelector(".modal-body");
    const modalCloseBtn = blogModal.querySelector(".modal-close");

    const openPost = (card) => {
      const tpl = card.querySelector("template.post-content");
      const thumbImg = card.querySelector(".thumb img");
      if (!tpl) return;
      modalHeroImg.src = thumbImg ? thumbImg.src : "";
      modalHeroImg.alt = thumbImg ? thumbImg.alt : "";
      modalBody.innerHTML = "";
      modalBody.appendChild(tpl.content.cloneNode(true));
      blogBackdrop.classList.add("open");
      blogModal.classList.add("open");
      document.body.classList.add("modal-open");
      blogModal.scrollTop = 0;
    };
    const closePost = () => {
      blogBackdrop.classList.remove("open");
      blogModal.classList.remove("open");
      document.body.classList.remove("modal-open");
    };

    document.querySelectorAll("[data-blog-card]").forEach(card => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        openPost(card);
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPost(card); }
      });
    });
    modalCloseBtn && modalCloseBtn.addEventListener("click", closePost);
    blogBackdrop.addEventListener("click", closePost);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePost(); });
  }

  /* Appointment form(s): time-slot picker + redirect to payment */
  const ALL_SLOTS = ["10:00 AM", "11:00 AM", "12:30 PM", "02:00 PM", "03:30 PM", "05:00 PM", "06:30 PM", "08:00 PM"];

  document.querySelectorAll("[data-appt-form]").forEach((form) => {
    const dateInput = form.querySelector('input[type="date"]');
    const slotsWrap = form.querySelector(".time-slots-wrap");
    const slotsEl = form.querySelector(".time-slots");
    const timeHidden = form.querySelector('input[name="time"]');
    const today = new Date().toISOString().split("T")[0];
    if (dateInput) dateInput.min = today;

    if (dateInput && slotsWrap && slotsEl && timeHidden) {
      dateInput.addEventListener("change", () => {
        if (!dateInput.value) { slotsWrap.style.display = "none"; return; }
        // Deterministic pseudo-availability based on the chosen date, so it looks real but stays consistent per day
        const seed = dateInput.value.split("-").reduce((a, n) => a + parseInt(n, 10), 0);
        slotsEl.innerHTML = "";
        timeHidden.value = "";
        ALL_SLOTS.forEach((slot, i) => {
          const taken = (seed + i * 3) % 5 === 0;
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "time-slot" + (taken ? " taken" : "");
          btn.textContent = slot;
          if (!taken) {
            btn.addEventListener("click", () => {
              slotsEl.querySelectorAll(".time-slot").forEach(s => s.classList.remove("selected"));
              btn.classList.add("selected");
              timeHidden.value = slot;
            });
          } else {
            btn.disabled = true;
          }
          slotsEl.appendChild(btn);
        });
        slotsWrap.style.display = "block";
      });
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const serviceSelect = form.querySelector('select[name="service"]');
      const nameInput = form.querySelector('input[name="name"]');
      const phoneInput = form.querySelector('input[name="phone"]');

      const flagInvalid = (fieldWrap) => {
        if (!fieldWrap) return;
        fieldWrap.classList.add("cs-invalid", "cd-invalid");
        fieldWrap.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => fieldWrap.classList.remove("cs-invalid", "cd-invalid"), 1600);
      };

      if (nameInput && !nameInput.value.trim()) { nameInput.focus(); return; }
      if (phoneInput && !phoneInput.value.trim()) { phoneInput.focus(); return; }
      if (serviceSelect && !serviceSelect.value) {
        flagInvalid(serviceSelect.closest(".cs-wrap") || serviceSelect);
        return;
      }
      if (dateInput && !dateInput.value) {
        flagInvalid(dateInput.closest(".cd-wrap") || dateInput);
        return;
      }
      if (timeHidden && dateInput && dateInput.value && !timeHidden.value) {
        slotsWrap && slotsWrap.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      const data = {};
      new FormData(form).forEach((val, key) => { data[key] = val; });
      try { sessionStorage.setItem("salamBooking", JSON.stringify(data)); } catch (err) {}
      window.location.href = document.documentElement.dir === "rtl" ? "payment-ar.html" : "payment.html";
    });
  });

  /* Certificate lightbox gallery */
  const certGallery = document.querySelector("[data-cert-gallery]");
  if (certGallery) {
    const items = Array.from(certGallery.querySelectorAll("[data-cert-item]"));
    const backdrop = document.querySelector(".cert-lightbox-backdrop");
    const box = document.querySelector(".cert-lightbox-box");
    const imgEl = box.querySelector("img");
    const captionEl = box.querySelector(".cert-lightbox-caption");
    let current = 0;

    const show = (i) => {
      current = (i + items.length) % items.length;
      const item = items[current];
      const src = item.querySelector("img").getAttribute("src");
      const title = item.dataset.title || "";
      imgEl.src = src;
      imgEl.alt = title;
      captionEl.textContent = title;
    };
    const open = (i) => {
      show(i);
      backdrop.classList.add("open");
      document.body.classList.add("modal-open");
    };
    const close = () => {
      backdrop.classList.remove("open");
      document.body.classList.remove("modal-open");
    };

    items.forEach((item, i) => item.addEventListener("click", () => open(i)));
    box.querySelector(".cert-lightbox-close").addEventListener("click", close);
    box.querySelector(".cert-lightbox-prev").addEventListener("click", () => show(current - 1));
    box.querySelector(".cert-lightbox-next").addEventListener("click", () => show(current + 1));
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
    document.addEventListener("keydown", (e) => {
      if (!backdrop.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }
});
