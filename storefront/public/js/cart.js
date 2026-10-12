(function () {
  var KEY = "brightic-cart";
  var SEED_KEY = "brightic-cart-seeded";
  var bound = false;

  var DEMO = [
    {
      id: "flux-line",
      title: "Flux line",
      blurb: "Fluid modern light form",
      price: 750,
      qty: 1,
      image: "/assets/cart/item-flux.png",
    },
    {
      id: "steel-petal",
      title: "Steel Petal",
      blurb: "Subtle reflective warmth",
      price: 1200,
      qty: 1,
      image: "/assets/cart/item-steel.png",
    },
  ];

  function slug(title) {
    return String(title || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .replace(/&/g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function money(amount) {
    return "$ " + Math.round(Number(amount) || 0);
  }

  function read() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!Array.isArray(raw)) return [];
      return raw
        .filter(function (item) {
          return item && typeof item.id === "string" && item.id;
        })
        .map(function (item) {
          return {
            id: item.id,
            title: String(item.title || item.id),
            blurb: String(item.blurb || ""),
            price: Number(item.price) || 0,
            qty: Math.max(1, Math.min(99, Number(item.qty) || 1)),
            image: String(item.image || "/assets/cart/item-flux.png"),
          };
        });
    } catch (error) {
      return [];
    }
  }

  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  function ensureSeed() {
    if (localStorage.getItem(SEED_KEY)) return;
    if (read().length) {
      localStorage.setItem(SEED_KEY, "1");
      return;
    }
    write(DEMO);
    localStorage.setItem(SEED_KEY, "1");
  }

  function totalQty(items) {
    return items.reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
  }

  function totalPrice(items) {
    return items.reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);
  }

  function asset(file) {
    var known = document.querySelector("img[src*='assets/cart/'], img[src*='assets/product/'], img[src*='assets/shop/']");
    var src = known ? known.getAttribute("src") || "" : "";
    if (src.indexOf("/assets/") !== -1) return "/assets/cart/" + file;
    return "assets/cart/" + file;
  }

  function itemHtml(item) {
    return (
      '<article class="cart-item" data-cart-item data-id="' +
      item.id +
      '">' +
      '<div class="cart-item__media"><img src="' +
      item.image +
      '" alt=""></div>' +
      '<div class="cart-item__top">' +
      '<div class="cart-item__info">' +
      '<p class="cart-item__name">' +
      item.title +
      "</p>" +
      '<p class="cart-item__blurb">' +
      item.blurb +
      "</p>" +
      "</div>" +
      '<p class="cart-item__price">' +
      money(item.price) +
      "</p>" +
      "</div>" +
      '<p class="cart-item__qty-label">Quantity:</p>' +
      '<div class="cart-item__actions">' +
      '<div class="cart-qty">' +
      '<button type="button" class="cart-qty__btn cart-qty__btn--minus" data-cart-dec aria-label="Decrease quantity">' +
      '<img src="' +
      asset("minus.svg") +
      '" width="16" height="1" alt="">' +
      "</button>" +
      '<span class="cart-qty__n" data-cart-qty>' +
      item.qty +
      "</span>" +
      '<button type="button" class="cart-qty__btn cart-qty__btn--plus" data-cart-inc aria-label="Increase quantity">' +
      '<img src="' +
      asset("plus.svg") +
      '" width="12" height="12" alt="">' +
      "</button>" +
      "</div>" +
      '<button type="button" class="cart-item__remove" data-cart-remove>Remove</button>' +
      "</div>" +
      "</article>" +
      '<hr class="cart-item__rule" data-cart-rule>'
    );
  }

  function openPanel() {
    var panel = document.getElementById("panel-cart");
    var backdrop = document.getElementById("cart-backdrop");
    if (!panel) return;
    document.querySelectorAll(".panel").forEach(function (other) {
      other.hidden = true;
    });
    document.querySelectorAll("[data-panel]").forEach(function (button) {
      button.setAttribute("aria-expanded", "false");
    });
    panel.hidden = false;
    if (backdrop) backdrop.hidden = false;
    document.body.classList.add("cart-open");
    document.querySelectorAll('[aria-controls="panel-cart"]').forEach(function (button) {
      button.setAttribute("aria-expanded", "true");
    });
  }

  function closePanel() {
    var panel = document.getElementById("panel-cart");
    var backdrop = document.getElementById("cart-backdrop");
    if (panel) panel.hidden = true;
    if (backdrop) backdrop.hidden = true;
    document.body.classList.remove("cart-open");
    document.querySelectorAll('[aria-controls="panel-cart"]').forEach(function (button) {
      button.setAttribute("aria-expanded", "false");
    });
  }

  function paint() {
    var items = read();
    var count = totalQty(items);
    var sum = totalPrice(items);

    document.querySelectorAll("[data-cart-title]").forEach(function (title) {
      title.textContent = "Your Cart (" + count + ")";
    });

    document.querySelectorAll("[data-cart-checkout]").forEach(function (button) {
      button.textContent = "Checkout - " + money(sum);
      button.disabled = items.length === 0;
    });

    document.querySelectorAll("[data-cart-empty]").forEach(function (empty) {
      empty.hidden = items.length > 0;
    });
    document.querySelectorAll("[data-cart-items]").forEach(function (list) {
      list.hidden = items.length === 0;
      list.innerHTML = items.map(itemHtml).join("");
    });
    document.querySelectorAll("[data-cart-more]").forEach(function (more) {
      more.hidden = items.length === 0;
    });
    document.querySelectorAll("[data-cart-foot]").forEach(function (foot) {
      foot.hidden = items.length === 0;
    });

    document.querySelectorAll('[aria-controls="panel-cart"], button[aria-label^="Basket"]').forEach(function (btn) {
      if (!btn.matches('[aria-controls="panel-cart"]') && !/Basket/i.test(btn.getAttribute("aria-label") || "")) {
        return;
      }
      btn.classList.add("cart-trigger");
      var badge = btn.querySelector(".cart-badge");
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "cart-badge";
        badge.setAttribute("aria-hidden", "true");
        btn.appendChild(badge);
      }
      badge.hidden = count < 1;
      badge.textContent = count > 0 ? String(count) : "";
      var label = count ? "Basket, " + count + (count === 1 ? " item" : " items") : "Basket";
      if ((btn.getAttribute("aria-label") || "").indexOf("Basket") === 0 || btn.getAttribute("aria-controls") === "panel-cart") {
        btn.setAttribute("aria-label", label);
      }
    });
  }

  function setQty(id, next) {
    var items = read();
    var updated = [];
    items.forEach(function (item) {
      if (item.id !== id) {
        updated.push(item);
        return;
      }
      var qty = Math.max(0, Math.min(99, next));
      if (qty > 0) updated.push(Object.assign({}, item, { qty: qty }));
    });
    write(updated);
    paint();
  }

  function removeItem(id) {
    write(
      read().filter(function (item) {
        return item.id !== id;
      })
    );
    paint();
  }

  function addItem(payload) {
    if (!payload || !payload.id) return;
    var items = read();
    var found = false;
    var next = items.map(function (item) {
      if (item.id !== payload.id) return item;
      found = true;
      return Object.assign({}, item, {
        qty: Math.min(99, item.qty + (payload.qty || 1)),
        title: payload.title || item.title,
        blurb: payload.blurb || item.blurb,
        price: payload.price != null ? Number(payload.price) : item.price,
        image: payload.image || item.image,
      });
    });
    if (!found) {
      next.push({
        id: payload.id,
        title: payload.title || payload.id,
        blurb: payload.blurb || "",
        price: Number(payload.price) || 0,
        qty: Math.max(1, payload.qty || 1),
        image: payload.image || "/assets/cart/item-flux.png",
      });
    }
    write(next);
    paint();
  }

  function productPayload(qty) {
    var titleEl = document.querySelector(".pdp-frame:not([hidden]) .title, .pdp .title, h1.title");
    var priceEl = document.querySelector(".pdp-frame:not([hidden]) .price, .pdp .price");
    var imgEl = document.querySelector(".pdp-frame:not([hidden]) .stage__img, .pdp .stage__img");
    var title = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "Flux Line";
    var priceText = priceEl ? priceEl.textContent.replace(/[^0-9.]/g, "") : "750";
    return {
      id: slug(title),
      title: title,
      blurb: "Fluid modern light form",
      price: Number(priceText) || 750,
      qty: qty || 1,
      image: imgEl ? imgEl.getAttribute("src") || "/assets/cart/item-flux.png" : "/assets/cart/item-flux.png",
    };
  }

  function readProductQty() {
    var n = document.querySelector(".pdp-frame:not([hidden]) .qty__n, .pdp .qty__n");
    var value = n ? parseInt(String(n.textContent || "1").trim(), 10) : 1;
    return Number.isFinite(value) && value > 0 ? value : 1;
  }

  function onClick(event) {
    var trigger = event.target.closest('[aria-controls="panel-cart"]');
    if (trigger && !event.target.closest("#panel-cart") && !event.target.closest("#cart-backdrop")) {
      event.preventDefault();
      var panel = document.getElementById("panel-cart");
      if (!panel) return;
      if (panel.hidden) openPanel();
      else closePanel();
      return;
    }

    var close = event.target.closest("[data-cart-close], #cart-backdrop");
    if (close) {
      event.preventDefault();
      closePanel();
      return;
    }

    var dec = event.target.closest("[data-cart-dec]");
    if (dec) {
      var itemDec = dec.closest("[data-cart-item]");
      if (!itemDec) return;
      event.preventDefault();
      var idDec = itemDec.getAttribute("data-id");
      var qtyDec = parseInt(itemDec.querySelector("[data-cart-qty]").textContent, 10) || 1;
      setQty(idDec, qtyDec - 1);
      return;
    }

    var inc = event.target.closest("[data-cart-inc]");
    if (inc) {
      var itemInc = inc.closest("[data-cart-item]");
      if (!itemInc) return;
      event.preventDefault();
      var idInc = itemInc.getAttribute("data-id");
      var qtyInc = parseInt(itemInc.querySelector("[data-cart-qty]").textContent, 10) || 1;
      setQty(idInc, qtyInc + 1);
      return;
    }

    var remove = event.target.closest("[data-cart-remove]");
    if (remove) {
      var itemRm = remove.closest("[data-cart-item]");
      if (!itemRm) return;
      event.preventDefault();
      removeItem(itemRm.getAttribute("data-id"));
      return;
    }

    var suggest = event.target.closest("[data-cart-suggest-add]");
    if (suggest) {
      event.preventDefault();
      addItem({
        id: suggest.getAttribute("data-id"),
        title: suggest.getAttribute("data-title"),
        blurb: suggest.getAttribute("data-blurb"),
        price: Number(suggest.getAttribute("data-price")) || 0,
        image: suggest.getAttribute("data-image"),
        qty: 1,
      });
      return;
    }

    var buy = event.target.closest(".buy");
    if (buy) {
      event.preventDefault();
      addItem(productPayload(readProductQty()));
      openPanel();
      return;
    }

    var checkout = event.target.closest("[data-cart-checkout]");
    if (checkout) {
      event.preventDefault();
      if (read().length) window.location.href = "/catalog";
    }
  }

  function onKey(event) {
    if (event.key === "Escape") {
      var panel = document.getElementById("panel-cart");
      if (panel && !panel.hidden) closePanel();
    }
  }

  function onStorage(event) {
    if (event.key === KEY) paint();
  }

  function observePanel() {
    var panel = document.getElementById("panel-cart");
    var backdrop = document.getElementById("cart-backdrop");
    if (!panel || !window.MutationObserver) return;
    var observer = new MutationObserver(function () {
      if (panel.hidden) {
        if (backdrop) backdrop.hidden = true;
        document.body.classList.remove("cart-open");
      } else {
        if (backdrop) backdrop.hidden = false;
        document.body.classList.add("cart-open");
        paint();
      }
    });
    observer.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
  }

  function wireBasketButtons() {
    document.querySelectorAll('button[aria-label^="Basket"], button[aria-label="Basket"]').forEach(function (btn) {
      if (btn.getAttribute("aria-controls") === "panel-cart") return;
      if (btn.getAttribute("data-panel") === "cart") return;
      btn.setAttribute("data-panel", "cart");
      btn.setAttribute("aria-controls", "panel-cart");
      btn.setAttribute("aria-expanded", "false");
    });
  }

  function mount() {
    ensureSeed();
    wireBasketButtons();
    paint();
    observePanel();
    if (bound) return;
    bound = true;
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("storage", onStorage);
  }

  window.BrighticCart = {
    mount: mount,
    key: KEY,
    open: openPanel,
    close: closePanel,
    add: addItem,
    paint: paint,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
