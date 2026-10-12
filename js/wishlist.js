(function () {
  var KEY = "brightic-wishlist";
  var bound = false;

  function slug(title) {
    return String(title || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .replace(/&/g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function read() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!Array.isArray(raw)) return [];
      var seen = {};
      var items = [];
      raw.forEach(function (item) {
        if (!item || typeof item.id !== "string" || !item.id || seen[item.id]) return;
        seen[item.id] = true;
        items.push({ id: item.id, title: String(item.title || item.id) });
      });
      return items;
    } catch (error) {
      return [];
    }
  }

  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  function asset(file) {
    var known = document.querySelector("img[src*='assets/product/'], img[src*='assets/shop/']");
    var src = known ? known.getAttribute("src") || "" : "";
    if (src.indexOf("/assets/") !== -1) return "/assets/product/" + file;
    return "assets/product/" + file;
  }

  function ensureHearts() {
    document.querySelectorAll(".fav").forEach(function (fav) {
      if (fav.hasAttribute("data-wish")) return;
      var titleEl = document.querySelector(".title");
      var title = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "Flux Line";
      fav.setAttribute("data-wish", slug(title));
      fav.setAttribute("data-wish-title", title);
    });

    document.querySelectorAll("img.also__heart").forEach(function (img) {
      var card = img.closest(".also");
      if (!card) return;
      var name = card.querySelector(".also__name");
      var title = name ? name.textContent.replace(/\s+/g, " ").trim() : "Lamp";
      var span = document.createElement("span");
      span.className = "also__heart";
      span.setAttribute("data-wish", slug(title));
      span.setAttribute("data-wish-title", title);
      span.setAttribute("role", "button");
      span.tabIndex = 0;
      span.setAttribute("aria-pressed", "false");
      img.classList.remove("also__heart");
      img.parentNode.insertBefore(span, img);
      span.appendChild(img);
    });

    document.querySelectorAll(".card").forEach(function (card) {
      if (card.querySelector(".card__wish")) return;
      var heading = card.querySelector("h3");
      if (!heading) return;
      var title = heading.textContent.replace(/\s+/g, " ").trim();
      if (!title) return;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "card__wish";
      button.setAttribute("data-wish", slug(title));
      button.setAttribute("data-wish-title", title);
      button.setAttribute("aria-pressed", "false");
      var img = document.createElement("img");
      img.alt = "";
      img.src = asset("heart-card.svg");
      button.appendChild(img);
      card.appendChild(button);
    });

    document.querySelectorAll(".lamp").forEach(function (lamp) {
      if (lamp.querySelector(".lamp__wish")) return;
      var name = lamp.querySelector(".lamp__name");
      if (!name) return;
      var title = name.textContent.replace(/\s+/g, " ").trim();
      if (!title) return;
      var span = document.createElement("span");
      span.className = "lamp__wish";
      span.setAttribute("data-wish", slug(title));
      span.setAttribute("data-wish-title", title);
      span.setAttribute("role", "button");
      span.tabIndex = 0;
      span.setAttribute("aria-pressed", "false");
      var img = document.createElement("img");
      img.alt = "";
      img.src = asset("heart-card.svg");
      span.appendChild(img);
      lamp.appendChild(span);
    });
  }

  function paint() {
    var items = read();
    var saved = {};
    items.forEach(function (item) {
      saved[item.id] = true;
    });

    document.querySelectorAll("[data-wish]").forEach(function (el) {
      if (el.closest("#panel-saved")) return;
      var on = !!saved[el.getAttribute("data-wish")];
      el.setAttribute("aria-pressed", on ? "true" : "false");
      var title = el.getAttribute("data-wish-title") || "product";
      el.setAttribute("aria-label", (on ? "Remove " : "Save ") + title);
      var img = el.querySelector("img");
      if (!img) return;
      var off = img.getAttribute("data-off");
      if (!off) {
        off = img.getAttribute("src") || "";
        img.setAttribute("data-off", off);
        img.setAttribute("data-on", off.replace(/\.svg(?=($|\?))/, "-on.svg"));
      }
      img.setAttribute("src", on ? img.getAttribute("data-on") : off);
    });

    var count = items.length;
    document.querySelectorAll('button[aria-label="Saved"], button.wish-saved').forEach(function (btn) {
      btn.classList.add("wish-saved");
      var badge = btn.querySelector(".wish-badge");
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "wish-badge";
        badge.setAttribute("aria-hidden", "true");
        btn.appendChild(badge);
      }
      badge.hidden = count < 1;
      badge.textContent = count > 0 ? String(count) : "";
      btn.setAttribute("aria-label", count ? "Saved, " + count + (count === 1 ? " item" : " items") : "Saved");
    });

    document.querySelectorAll("#panel-saved").forEach(function (panel) {
      var list = panel.querySelector(".saved-list");
      if (!list) {
        list = document.createElement("ul");
        list.className = "saved-list";
        var note = panel.querySelector("p");
        if (note) panel.insertBefore(list, note);
        else panel.appendChild(list);
      }
      list.textContent = "";
      items.forEach(function (item) {
        var li = document.createElement("li");
        var button = document.createElement("button");
        button.type = "button";
        button.setAttribute("data-wish", item.id);
        button.setAttribute("data-wish-title", item.title);
        button.textContent = item.title;
        li.appendChild(button);
        list.appendChild(li);
      });
      var empty = panel.querySelector("p");
      if (empty) empty.hidden = items.length > 0;
    });
  }

  function toggle(id, title) {
    if (!id) return;
    var items = read();
    var next = [];
    var found = false;
    items.forEach(function (item) {
      if (item.id === id) found = true;
      else next.push(item);
    });
    if (!found) next.push({ id: id, title: title || id });
    write(next);
    paint();
  }

  function onClick(event) {
    var heart = event.target.closest("[data-wish]");
    if (!heart) return;
    event.preventDefault();
    event.stopPropagation();
    toggle(heart.getAttribute("data-wish"), heart.getAttribute("data-wish-title") || "");
  }

  function onKey(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    var heart = event.target.closest("[data-wish]");
    if (!heart || heart.tagName === "BUTTON") return;
    event.preventDefault();
    toggle(heart.getAttribute("data-wish"), heart.getAttribute("data-wish-title") || "");
  }

  function onStorage(event) {
    if (event.key === KEY) paint();
  }

  function mount() {
    ensureHearts();
    paint();
    if (bound) return;
    bound = true;
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("storage", onStorage);
  }

  window.BrighticWishlist = { mount: mount, key: KEY };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
