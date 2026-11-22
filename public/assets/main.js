/* Club Volei Cabrils · interaccions */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");

  /* ---- marca quan s'ha baixat una mica: la capçalera passa de transparent a blanca ---- */
  var onScroll = function () { doc.classList.toggle("scrolled", window.scrollY > 24); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- menú mòbil ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    var setMenu = function (open) {
      nav.classList.toggle("open", open);
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Tanca el menú" : "Obre el menú");
    };
    toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  }

  /* ---- aparició en fer scroll ---- */
  var targets = document.querySelectorAll(".card, .info-card, .shop-b, .split-img, .split-txt");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });

    /* ---- xifres que compten ---- */
    var nums = document.querySelectorAll("[data-count]");
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = parseInt(el.getAttribute("data-count"), 10), t0 = null;
        io2.unobserve(el);
        var step = function (t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1200, 1);
          el.textContent = (el.getAttribute("data-prefix") || "") + Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io2.observe(el); });
  }

  /* ---- horaris: pestanyes «Setmana» / «Per equip» ---- */
  var tabs = document.querySelectorAll(".sched-tabs [role=tab]");
  if (tabs.length) {
    var showTab = function (tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { showTab(t); });
      t.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        var next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
        showTab(next); next.focus();
      });
    });
    showTab(tabs[0]);
  }

  /* ---- horaris: dia visible al mòbil (comença pel dia d'avui si hi ha entrenament) ---- */
  var cal = document.querySelector(".cal");
  var dayBtns = document.querySelectorAll(".cal-daytabs button");
  var showDay = function (day) {
    if (!cal) return;
    cal.setAttribute("data-show", day);
    dayBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-day") === day ? "true" : "false"); });
  };
  if (cal && dayBtns.length) {
    var noms = ["Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"];
    var avui = noms[new Date().getDay()], primer = dayBtns[0].getAttribute("data-day");
    var hiEs = [].some.call(dayBtns, function (b) { return b.getAttribute("data-day") === avui; });
    showDay(hiEs ? avui : primer);
    dayBtns.forEach(function (b) { b.addEventListener("click", function () { showDay(b.getAttribute("data-day")); }); });
  }

  /* ---- horaris: tria el teu equip ---- */
  var dataEl = document.getElementById("horaris-data");
  if (dataEl) {
    var equips = JSON.parse(dataEl.textContent);
    var sec = document.getElementById("horaris");
    var out = document.getElementById("pick-out");
    var chips = sec.querySelectorAll(".chip");
    var llista = function (parts) {
      return parts.length < 2 ? parts.join("") : parts.slice(0, -1).join(", ") + " i " + parts[parts.length - 1];
    };
    var store = function (v) { try { if (v) localStorage.setItem("cvc-equip", v); else localStorage.removeItem("cvc-equip"); } catch (e) { /* sense memòria */ } };
    var pick = function (team, remember) {
      var eq = team && equips[team];
      if (!eq) team = "";
      sec.classList.toggle("picking", !!team);
      sec.querySelectorAll("[data-team]").forEach(function (el) {
        var on = el.getAttribute("data-team") === team;
        el.classList.toggle("on", on);
        if (el.classList.contains("chip")) el.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (team) {
        var parts = eq.dies.map(function (d) { return d[0] + " de " + d[1] + " a " + d[2]; });
        out.innerHTML = "";
        var b = document.createElement("b"); b.textContent = eq.nom;
        out.appendChild(b);
        out.appendChild(document.createTextNode(" entrena " + llista(parts) + ". "));
        var x = document.createElement("button"); x.type = "button"; x.className = "pick-clear"; x.textContent = "Mostra tots els equips";
        x.addEventListener("click", function () { pick("", true); });
        out.appendChild(x);
        /* la tira de botons (al mòbil llisca): centra l'equip triat, sense moure la pàgina */
        var c = sec.querySelector(".chip.on"), box = c && c.parentNode;
        if (box && box.scrollWidth > box.clientWidth) {
          var cr = c.getBoundingClientRect(), br = box.getBoundingClientRect();
          box.scrollLeft += cr.left - br.left - (br.width - cr.width) / 2;
        }
        /* al mòbil, salta al primer dia que entrena */
        var first = eq.dies[0] && eq.dies[0][0];
        if (first) showDay(first.charAt(0).toUpperCase() + first.slice(1));
      } else {
        out.textContent = "";
      }
      if (remember) store(team);
    };
    sec.addEventListener("click", function (e) {
      var el = e.target.closest(".chip, .cal-b");
      if (!el) return;
      var t = el.getAttribute("data-team");
      pick(el.classList.contains("on") && el.classList.contains("chip") ? "" : t, true);
    });
    var saved = null;
    try { saved = localStorage.getItem("cvc-equip"); } catch (e) { /* sense memòria */ }
    if (saved) pick(saved, false);
  }

  /* ---- mapa (només si es demana) ---- */
  var mapBtn = document.getElementById("map-load");
  if (mapBtn) {
    mapBtn.addEventListener("click", function () {
      var box = document.getElementById("map");
      var lat = box.getAttribute("data-lat"), lng = box.getAttribute("data-lng");
      var f = document.createElement("iframe");
      f.src = "https://maps.google.com/maps?q=" + lat + "," + lng + "&z=16&hl=ca&output=embed";
      f.title = "Mapa: Pavelló de Cabrils";
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      box.innerHTML = "";
      box.appendChild(f);
      box.classList.add("loaded");
    });
  }

  /* ---- formulari de contacte ---- */
  var form = document.getElementById("contact-form");
  if (form) {
    var ok = form.querySelector(".form-msg.ok"), ko = form.querySelector(".form-msg.ko");
    var check = function (field) {
      var input = field.querySelector("input:not([type=hidden]), textarea");
      if (!input || !input.required) return true;
      var valid = input.type === "checkbox" ? input.checked : input.value.trim() !== "" && input.checkValidity();
      field.classList.toggle("invalid", !valid);
      return valid;
    };
    form.querySelectorAll(".field").forEach(function (field) {
      field.addEventListener("change", function () { if (field.classList.contains("invalid")) check(field); });
      field.addEventListener("input", function () { if (field.classList.contains("invalid")) check(field); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      ok.hidden = true; ko.hidden = true;
      var valid = true;
      form.querySelectorAll(".field").forEach(function (f) { if (!check(f)) valid = false; });
      if (!valid) { var first = form.querySelector(".invalid input, .invalid textarea"); if (first) first.focus(); return; }
      if (form.querySelector("[name=botcheck]").checked) return;

      var key = form.getAttribute("data-key");
      var name = form.elements.name.value.trim(), email = form.elements.email.value.trim(), msg = form.elements.message.value.trim();
      if (!key) {
        /* sense clau: obre el programa de correu */
        var body = msg + "\n\n— " + name + " (" + email + ")";
        location.href = "mailto:" + form.getAttribute("data-mail") +
          "?subject=" + encodeURIComponent("Missatge des de la web del CV Cabrils") +
          "&body=" + encodeURIComponent(body);
        return;
      }
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      fetch(form.action, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.success) { form.reset(); ok.hidden = false; ok.focus && ok.setAttribute("tabindex", "-1"); ok.focus(); }
          else { ko.hidden = false; }
        })
        .catch(function () { ko.hidden = false; })
        .then(function () { btn.disabled = false; });
    });
  }
})();
