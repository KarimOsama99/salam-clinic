document.addEventListener("DOMContentLoaded", () => {
  const openPanels = new Set(); // { wrap, panel, trigger }

  const closeAll = (except) => {
    openPanels.forEach(entry => {
      if (entry === except) return;
      entry.wrap.classList.remove("open");
      entry.panel.classList.remove("open");
    });
  };

  const positionPanel = (trigger, panel) => {
    const rect = trigger.getBoundingClientRect();
    const isDatePanel = panel.classList.contains("cd-panel");
    if (!isDatePanel) panel.style.width = rect.width + "px";
    const panelWidth = isDatePanel ? Math.min(300, window.innerWidth - 16) : rect.width;
    const panelHeight = panel.offsetHeight || 280;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < panelHeight + 16 && rect.top > panelHeight + 16;

    panel.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - panelWidth - 8)) + "px";
    if (openUpward) {
      panel.style.top = "auto";
      panel.style.bottom = (window.innerHeight - rect.top + 8) + "px";
    } else {
      panel.style.bottom = "auto";
      panel.style.top = (rect.bottom + 8) + "px";
    }
  };

  const registerPanel = (wrap, trigger, panel) => {
    document.body.appendChild(panel); // portal: escape any overflow:hidden ancestor
    panel.style.position = "fixed";
    const entry = { wrap, panel, trigger };
    openPanels.add(entry);

    const open = () => {
      closeAll(entry);
      panel.style.visibility = "hidden";
      panel.classList.add("open");
      wrap.classList.add("open");
      positionPanel(trigger, panel);
      panel.style.visibility = "";
    };
    const close = () => { wrap.classList.remove("open"); panel.classList.remove("open"); };
    const toggle = () => { wrap.classList.contains("open") ? close() : open(); };

    trigger.addEventListener("click", (e) => { e.stopPropagation(); toggle(); });
    return { open, close };
  };

  const repositionOpen = () => {
    openPanels.forEach(entry => { if (entry.wrap.classList.contains("open")) positionPanel(entry.trigger, entry.panel); });
  };
  window.addEventListener("resize", repositionOpen);
  window.addEventListener("scroll", repositionOpen, true);
  document.addEventListener("click", (e) => {
    openPanels.forEach(entry => {
      if (entry.wrap.classList.contains("open") && !entry.wrap.contains(e.target) && !entry.panel.contains(e.target)) {
        entry.wrap.classList.remove("open");
        entry.panel.classList.remove("open");
      }
    });
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });

  /* ============ Custom Select ============ */
  function enhanceSelect(select) {
    if (select.dataset.csEnhanced) return;
    select.dataset.csEnhanced = "1";

    const wrap = document.createElement("div");
    wrap.className = "cs-wrap";
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    select.style.display = "none";

    const placeholderOpt = select.querySelector('option[value=""]');
    const placeholderText = placeholderOpt ? placeholderOpt.textContent : "Select";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "cs-trigger";
    trigger.innerHTML = `<span class="cs-value">${placeholderText}</span><i class="fa-solid fa-chevron-down"></i>`;
    wrap.appendChild(trigger);

    const panel = document.createElement("div");
    panel.className = "cs-panel" + (wrap.closest(".appt2-form") ? " cs-panel-dark" : "");

    const makeOption = (opt) => {
      const div = document.createElement("div");
      div.className = "cs-option";
      div.textContent = opt.textContent;
      div.dataset.value = opt.value;
      if (opt.selected && opt.value !== "") div.classList.add("selected");
      div.addEventListener("click", () => {
        select.value = opt.value;
        panel.querySelectorAll(".cs-option").forEach(o => o.classList.remove("selected"));
        div.classList.add("selected");
        const valueEl = trigger.querySelector(".cs-value");
        valueEl.textContent = opt.textContent;
        valueEl.classList.add("filled");
        select.dispatchEvent(new Event("change", { bubbles: true }));
        wrap.classList.remove("open");
        panel.classList.remove("open");
      });
      return div;
    };

    Array.from(select.children).forEach(child => {
      if (child.tagName === "OPTGROUP") {
        const label = document.createElement("div");
        label.className = "cs-group-label";
        label.textContent = child.label;
        panel.appendChild(label);
        Array.from(child.children).forEach(opt => panel.appendChild(makeOption(opt)));
      } else if (child.tagName === "OPTION" && child.value !== "") {
        panel.appendChild(makeOption(child));
      }
    });

    registerPanel(wrap, trigger, panel);
  }

  document.querySelectorAll("select[data-cs]").forEach(enhanceSelect);

  /* ============ Custom Date Picker ============ */
  function enhanceDate(input) {
    if (input.dataset.cdEnhanced) return;
    input.dataset.cdEnhanced = "1";

    const wrap = document.createElement("div");
    wrap.className = "cd-wrap";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    input.style.display = "none";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "cd-trigger";
    trigger.innerHTML = `<span class="cd-value">${input.placeholder || input.dataset.placeholder || "Select a date"}</span><i class="fa-solid fa-calendar-days"></i>`;
    wrap.appendChild(trigger);

    const panel = document.createElement("div");
    panel.className = "cd-panel" + (wrap.closest(".appt2-form") ? " cd-panel-dark" : "");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let viewYear = today.getFullYear();
    let viewMonth = today.getMonth();
    let selectedDate = null;

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const pad = (n) => (n < 10 ? "0" + n : "" + n);
    const fmt = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

    const render = () => {
      const firstDay = new Date(viewYear, viewMonth, 1).getDay();
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const isFirstMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

      let html = `<div class="cd-head">
        <button type="button" class="cd-nav-btn cd-prev" ${isFirstMonth ? "disabled" : ""}><i class="fa-solid fa-chevron-left"></i></button>
        <b>${monthNames[viewMonth]} ${viewYear}</b>
        <button type="button" class="cd-nav-btn cd-next"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
      <div class="cd-weekdays">${weekdays.map(w => `<span>${w}</span>`).join("")}</div>
      <div class="cd-days">`;
      for (let i = 0; i < firstDay; i++) html += `<div class="cd-day empty"></div>`;
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(viewYear, viewMonth, d);
        const isPast = dateObj < today;
        const isToday = dateObj.getTime() === today.getTime();
        const dateStr = fmt(viewYear, viewMonth, d);
        const isSelected = selectedDate === dateStr;
        html += `<div class="cd-day${isPast ? " disabled" : ""}${isToday ? " today" : ""}${isSelected ? " selected" : ""}" data-date="${dateStr}">${d}</div>`;
      }
      html += `</div>`;
      panel.innerHTML = html;

      panel.querySelector(".cd-prev").addEventListener("click", (e) => {
        e.stopPropagation();
        viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; }
        render();
      });
      panel.querySelector(".cd-next").addEventListener("click", (e) => {
        e.stopPropagation();
        viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; }
        render();
      });
      panel.querySelectorAll(".cd-day:not(.disabled):not(.empty)").forEach(el => {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          selectedDate = el.dataset.date;
          input.value = selectedDate;
          input.dispatchEvent(new Event("change", { bubbles: true }));
          const d = new Date(selectedDate + "T00:00:00");
          const valueEl = trigger.querySelector(".cd-value");
          valueEl.textContent = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
          valueEl.classList.add("filled");
          wrap.classList.remove("open");
          panel.classList.remove("open");
          render();
        });
      });
    };
    render();

    registerPanel(wrap, trigger, panel);
  }

  document.querySelectorAll('input[type="date"][data-cd]').forEach(enhanceDate);

  /* ============ Phone Input with Country Code ============ */
  const COUNTRIES = [
    { code: "+20", flag: "🇪🇬", label: "مصر / Egypt", maxLen: 11 },
    { code: "+966", flag: "🇸🇦", label: "السعودية / Saudi Arabia", maxLen: 10 },
    { code: "+971", flag: "🇦🇪", label: "الإمارات / UAE", maxLen: 9 },
    { code: "+965", flag: "🇰🇼", label: "الكويت / Kuwait", maxLen: 8 },
    { code: "+962", flag: "🇯🇴", label: "الأردن / Jordan", maxLen: 9 },
    { code: "+974", flag: "🇶🇦", label: "قطر / Qatar", maxLen: 8 },
    { code: "+968", flag: "🇴🇲", label: "عُمان / Oman", maxLen: 8 },
    { code: "+973", flag: "🇧🇭", label: "البحرين / Bahrain", maxLen: 8 },
    { code: "+1",   flag: "🇺🇸", label: "USA / Canada", maxLen: 10 },
    { code: "+44",  flag: "🇬🇧", label: "UK", maxLen: 10 }
  ];

  function enhancePhoneInput(input) {
    if (input.dataset.phoneEnhanced) return;
    input.dataset.phoneEnhanced = "1";

    const isDark = !!input.closest(".appt2-form");
    const placeholder = input.getAttribute("placeholder") || "Phone number";
    input.setAttribute("placeholder", placeholder);

    // Wrap the input in phone-wrap
    const wrap = document.createElement("div");
    wrap.className = "phone-wrap";
    input.parentNode.insertBefore(wrap, input);

    // Country selector trigger (not using cs-wrap to avoid conflicts)
    const selBtn = document.createElement("button");
    selBtn.type = "button";
    selBtn.className = "phone-country-btn";
    selBtn.setAttribute("aria-label", "Select country code");
    selBtn.innerHTML = `<span class="phone-flag">${COUNTRIES[0].flag}</span><span class="phone-code" dir="ltr">${COUNTRIES[0].code}</span><i class="fa-solid fa-chevron-down phone-chevron"></i>`;
    wrap.appendChild(selBtn);

    // Separator
    const sep = document.createElement("span");
    sep.className = "phone-sep";
    wrap.appendChild(sep);

    // Move input into wrap
    wrap.appendChild(input);
    input.style.flex = "1";
    input.style.border = "none";
    input.style.background = "transparent";
    input.style.boxShadow = "none";
    input.style.outline = "none";
    input.style.padding = "0 16px";
    input.setAttribute("inputmode", "numeric");
    input.setAttribute("pattern", "[0-9]*");

    // Dropdown panel
    const panel = document.createElement("div");
    panel.className = "phone-panel" + (isDark ? " phone-panel-dark" : "");
    document.body.appendChild(panel);

    let currentCountry = COUNTRIES[0];
    input.maxLength = currentCountry.maxLen;

    const buildPanel = () => {
      panel.innerHTML = "";
      COUNTRIES.forEach(c => {
        const opt = document.createElement("div");
        opt.className = "phone-option" + (c.code === currentCountry.code ? " selected" : "");
        opt.innerHTML = `<span style="font-size:18px">${c.flag}</span><span dir="ltr" style="font-weight:600;color:var(--navy)">${c.code}</span><span style="opacity:0.6;font-size:12.5px">${c.label}</span>`;
        opt.addEventListener("click", () => {
          currentCountry = c;
          input.maxLength = c.maxLen;
          input.value = input.value.replace(/\D/g, "").slice(0, c.maxLen);
          selBtn.querySelector(".phone-flag").textContent = c.flag;
          selBtn.querySelector(".phone-code").textContent = c.code;
          closePanel();
          buildPanel();
        });
        panel.appendChild(opt);
      });
    };
    buildPanel();

    const isOpen = () => panel.classList.contains("open");

    const openPanel = () => {
      // Close other panels
      document.querySelectorAll(".phone-panel.open").forEach(p => {
        if (p !== panel) { p.classList.remove("open"); p.previousData?.btn?.classList.remove("open"); }
      });
      panel.previousData = { btn: selBtn };

      const rect = selBtn.getBoundingClientRect();
      panel.style.minWidth = "220px";
      panel.style.position = "fixed";
      const panelH = 300;
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < panelH && rect.top > panelH) {
        panel.style.top = "auto";
        panel.style.bottom = (window.innerHeight - rect.top + 6) + "px";
      } else {
        panel.style.top = (rect.bottom + 6) + "px";
        panel.style.bottom = "auto";
      }
      if (document.documentElement.dir === "rtl") {
        panel.style.left = Math.max(8, rect.right - 220) + "px";
      } else {
        panel.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 230)) + "px";
      }
      panel.classList.add("open");
      selBtn.classList.add("open");
    };

    const closePanel = () => {
      panel.classList.remove("open");
      selBtn.classList.remove("open");
    };

    selBtn.addEventListener("click", e => {
      e.stopPropagation();
      isOpen() ? closePanel() : openPanel();
    });

    document.addEventListener("click", e => {
      if (!wrap.contains(e.target) && !panel.contains(e.target)) closePanel();
    });

    window.addEventListener("scroll", () => { if (isOpen()) openPanel(); }, true);
    window.addEventListener("resize", () => { if (isOpen()) openPanel(); });

    // Numeric only
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "");
    });
    input.addEventListener("keydown", e => {
      const allowed = ["Backspace","Delete","Tab","Escape","Enter","ArrowLeft","ArrowRight","Home","End"];
      if (allowed.includes(e.key)) return;
      if (e.ctrlKey || e.metaKey) return;
      if (!/^\d$/.test(e.key)) e.preventDefault();
    });
  }

  document.querySelectorAll('input[type="tel"]').forEach(enhancePhoneInput);
});
