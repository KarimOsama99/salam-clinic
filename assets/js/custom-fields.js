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
    const panelHeight = panel.offsetHeight || 280;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < panelHeight + 16 && rect.top > panelHeight + 16;

    panel.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)) + "px";
    panel.style.width = rect.width + "px";
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
});
