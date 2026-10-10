(function () {
  document.querySelectorAll(".pdp").forEach(function (root) {
    root.addEventListener("click", function (event) {
      var thumb = event.target.closest(".thumb");
      if (thumb && root.contains(thumb)) {
        var frame = thumb.closest(".pdp-frame");
        var img = frame.querySelector(".stage__img");
        img.src = thumb.getAttribute("data-src");
        img.className = "stage__img " + thumb.getAttribute("data-crop");
        frame.querySelectorAll(".thumb").forEach(function (el) {
          el.classList.toggle("is-on", el === thumb);
        });
        return;
      }

      var step = event.target.closest(".qty__dec, .qty__inc");
      if (step) {
        var qty = step.closest(".qty");
        var n = qty.querySelector(".qty__n");
        var current = parseInt(n.textContent, 10) || 1;
        var next = step.classList.contains("qty__inc") ? current + 1 : current - 1;
        if (next < 1) next = 1;
        n.textContent = n.textContent.indexOf(" ") === -1 ? String(next) : String(next) + " ";
        return;
      }

      var acc = event.target.closest(".acc");
      if (acc) {
        acc.classList.toggle("is-open");
        return;
      }

      var fav = event.target.closest(".fav");
      if (fav) {
        var pressed = fav.getAttribute("aria-pressed") === "true";
        fav.setAttribute("aria-pressed", String(!pressed));
        return;
      }

      var burger = event.target.closest(".pdp-burger");
      if (burger) {
        var menu = burger.closest(".pdp-frame").querySelector(".pdp-menu");
        var willOpen = menu.hasAttribute("hidden");
        menu.hidden = !willOpen;
        burger.setAttribute("aria-expanded", String(willOpen));
      }
    });
  });
})();
