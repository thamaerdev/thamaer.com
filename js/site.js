(function () {
  var root = document.documentElement;
  var toggle = document.getElementById("nav-toggle");
  var clock = document.getElementById("clock");
  var notes = document.querySelectorAll("[data-phase]");
  var openAt = Date.parse("2026-12-15T00:00:00+03:00");
  var waText = {
    ar: "مرحبًا، أرغب في معرفة المزيد عن ثمائر.",
    en: "Hello, I would like to know more about thamaer."
  };

  function digits(n, lang) {
    var s = String(n).padStart(2, "0");
    if (lang !== "ar") return s;
    return s.replace(/\d/g, function (d) {
      return "٠١٢٣٤٥٦٧٨٩"[d];
    });
  }

  function arCount(n, one, two, few, many) {
    if (n === 0 || n === 1) return one;
    if (n === 2) return two;
    if (n >= 3 && n <= 10) return few;
    return many;
  }

  function units(n, lang) {
    if (lang === "ar") {
      return {
        d: arCount(n.d, "يوم", "يومان", "أيام", "يومًا"),
        h: arCount(n.h, "ساعة", "ساعتان", "ساعات", "ساعة"),
        m: arCount(n.m, "دقيقة", "دقيقتان", "دقائق", "دقيقة"),
        s: arCount(n.s, "ثانية", "ثانيتان", "ثوانٍ", "ثانية")
      };
    }
    return {
      d: n.d === 1 ? "Day" : "Days",
      h: n.h === 1 ? "Hour" : "Hours",
      m: n.m === 1 ? "Minute" : "Minutes",
      s: n.s === 1 ? "Second" : "Seconds"
    };
  }

  function tick() {
    var lang = root.lang === "en" ? "en" : "ar";
    var now = Date.now();
    var phase = now < openAt ? "before" : "after";
    notes.forEach(function (note) {
      note.hidden = note.getAttribute("data-phase") !== phase;
    });
    if (!clock) return;
    if (phase !== "before") {
      clock.hidden = true;
      return;
    }
    clock.hidden = false;
    var left = Math.max(0, Math.floor((openAt - now) / 1000));
    var parts = {
      d: Math.floor(left / 86400),
      h: Math.floor((left % 86400) / 3600),
      m: Math.floor((left % 3600) / 60),
      s: left % 60
    };
    var arLabels = units(parts, "ar");
    var enLabels = units(parts, "en");
    Object.keys(parts).forEach(function (key) {
      var num = clock.querySelector('[data-count="' + key + '"]');
      var ar = clock.querySelector('[data-label-ar="' + key + '"]');
      var en = clock.querySelector('[data-label-en="' + key + '"]');
      if (num) num.textContent = digits(parts[key], lang);
      if (ar) ar.textContent = arLabels[key];
      if (en) en.textContent = enLabels[key];
    });
  }

  function apply(lang) {
    var next = lang === "en" ? "en" : "ar";
    root.lang = next;
    root.dir = next === "en" ? "ltr" : "rtl";
    try { localStorage.setItem("thamaer-lang", next); } catch (e) {}
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-set-lang") === next ? "true" : "false");
    });
    var waHref = "https://wa.me/966593030123?text=" + encodeURIComponent(waText[next]);
    document.querySelectorAll('a[href*="wa.me"]').forEach(function (link) {
      link.href = waHref;
    });
    var nav = document.getElementById("nav");
    if (nav) nav.setAttribute("aria-label", next === "ar" ? "التنقل" : "Navigation");
    if (toggle) toggle.setAttribute("aria-label", next === "ar" ? "القائمة" : "Menu");
    try {
      var url = new URL(location.href);
      if (next === "en") url.searchParams.set("lang", "en");
      else url.searchParams.delete("lang");
      history.replaceState(null, "", url);
    } catch (e) {}
    tick();
  }

  document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      apply(btn.getAttribute("data-set-lang"));
    });
  });

  document.querySelectorAll(".nav a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (toggle) toggle.checked = false;
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && toggle) toggle.checked = false;
  });

  if ("IntersectionObserver" in window) {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
    var byId = {};
    links.forEach(function (link) {
      byId[link.getAttribute("href").slice(1)] = link;
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (item) { item.removeAttribute("aria-current"); });
          link.setAttribute("aria-current", "true");
        } else if (link.getAttribute("aria-current") === "true") {
          link.removeAttribute("aria-current");
        }
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  apply(root.lang === "en" ? "en" : "ar");
  setInterval(tick, 1000);
})();
