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
    var known = document.querySelector(
      "img[src*='assets/cart/'], img[src*='assets/product/'], img[src*='assets/shop/']"
    );
    var src = known ? known.getAttribute("src") || "" : "";
    if (src.indexOf("/assets/") !== -1) return "/assets/cart/" + file;
    return "assets/cart/" + file;
  }

  function panelEl() {
    return document.getElementById("panel-cart");
  }

  function backdropEl() {
    return document.getElementById("cart-backdrop");
  }

  function isOpen() {
    var panel = panelEl();
    return !!(panel && panel.classList.contains("is-open"));
  }

  function setHiddenClass(el, hide) {
    if (!el) return;
    el.classList.toggle("is-hidden", !!hide);
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
    var panel = panelEl();
    var backdrop = backdropEl();
    if (!panel) return false;

    document.querySelectorAll(".panel").forEach(function (other) {
      if (other.id === "panel-cart") return;
      other.hidden = true;
    });
    document.querySelectorAll("[data-panel]").forEach(function (button) {
      if (button.getAttribute("aria-controls") === "panel-cart") return;
      button.setAttribute("aria-expanded", "false");
    });

    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    if (backdrop) {
      backdrop.classList.add("is-open");
      backdrop.setAttribute("aria-hidden", "false");
      backdrop.tabIndex = 0;
    }
    document.body.classList.add("cart-open");
    document.querySelectorAll('[aria-controls="panel-cart"], [data-panel="cart"]').forEach(function (button) {
      button.setAttribute("aria-expanded", "true");
    });
    paint();
    return true;
  }

  function closePanel() {
    var panel = panelEl();
    var backdrop = backdropEl();
    if (panel) {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
    }
    if (backdrop) {
      backdrop.classList.remove("is-open");
      backdrop.setAttribute("aria-hidden", "true");
      backdrop.tabIndex = -1;
    }
    document.body.classList.remove("cart-open");
    document.querySelectorAll('[aria-controls="panel-cart"], [data-panel="cart"]').forEach(function (button) {
      button.setAttribute("aria-expanded", "false");
    });
  }

  function togglePanel() {
    if (isOpen()) closePanel();
    else openPanel();
  }

  function paint() {
    var items = read();
    var count = totalQty(items);
    var sum = totalPrice(items);
    var empty = items.length === 0;

    document.querySelectorAll("[data-cart-title]").forEach(function (title) {
      title.textContent = "Your Cart (" + count + ")";
    });

    document.querySelectorAll("[data-cart-checkout]").forEach(function (button) {
      button.textContent = "Checkout - " + money(sum);
      button.disabled = empty;
    });

    document.querySelectorAll("[data-cart-empty]").forEach(function (node) {
      setHiddenClass(node, !empty);
    });
    document.querySelectorAll("[data-cart-items]").forEach(function (list) {
      setHiddenClass(list, empty);
      list.innerHTML = items.map(itemHtml).join("");
    });
    document.querySelectorAll("[data-cart-more]").forEach(function (more) {
      setHiddenClass(more, empty);
    });
    document.querySelectorAll("[data-cart-foot]").forEach(function (foot) {
      setHiddenClass(foot, empty);
    });

    document.querySelectorAll('[aria-controls="panel-cart"], [data-panel="cart"], button[aria-label^="Basket"]').forEach(function (btn) {
      var label = btn.getAttribute("aria-label") || "";
      var isCartTrigger =
        btn.getAttribute("aria-controls") === "panel-cart" ||
        btn.getAttribute("data-panel") === "cart" ||
        label.indexOf("Basket") === 0;
      if (!isCartTrigger) return;

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
      if (label.indexOf("Basket") === 0 || btn.getAttribute("aria-controls") === "panel-cart") {
        btn.setAttribute(
          "aria-label",
          count ? "Basket, " + count + (count === 1 ? " item" : " items") : "Basket"
        );
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

  function isCartTrigger(node) {
    if (!node || !node.closest) return null;
    return node.closest('[aria-controls="panel-cart"], [data-panel="cart"]');
  }

  function onClick(event) {
    var target = event.target;
    if (!(target instanceof Element)) return;

    var trigger = isCartTrigger(target);
    if (trigger && !target.closest("#panel-cart") && !target.closest("#cart-backdrop")) {
      event.preventDefault();
      event.stopPropagation();
      togglePanel();
      return;
    }

    var close = target.closest("[data-cart-close], [data-cart-backdrop], #cart-backdrop");
    if (close) {
      event.preventDefault();
      closePanel();
      return;
    }

    var dec = target.closest("[data-cart-dec]");
    if (dec) {
      var itemDec = dec.closest("[data-cart-item]");
      if (!itemDec) return;
      event.preventDefault();
      var idDec = itemDec.getAttribute("data-id");
      var qtyDec = parseInt(itemDec.querySelector("[data-cart-qty]").textContent, 10) || 1;
      setQty(idDec, qtyDec - 1);
      return;
    }

    var inc = target.closest("[data-cart-inc]");
    if (inc) {
      var itemInc = inc.closest("[data-cart-item]");
      if (!itemInc) return;
      event.preventDefault();
      var idInc = itemInc.getAttribute("data-id");
      var qtyInc = parseInt(itemInc.querySelector("[data-cart-qty]").textContent, 10) || 1;
      setQty(idInc, qtyInc + 1);
      return;
    }

    var remove = target.closest("[data-cart-remove]");
    if (remove) {
      var itemRm = remove.closest("[data-cart-item]");
      if (!itemRm) return;
      event.preventDefault();
      removeItem(itemRm.getAttribute("data-id"));
      return;
    }

    var suggest = target.closest("[data-cart-suggest-add]");
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

    var buy = target.closest(".buy");
    if (buy) {
      event.preventDefault();
      addItem(productPayload(readProductQty()));
      openPanel();
      return;
    }

    var checkout = target.closest("[data-cart-checkout]");
    if (checkout) {
      event.preventDefault();
      if (read().length) window.location.href = "/catalog";
    }
  }

  function onKey(event) {
    if (event.key === "Escape" && isOpen()) closePanel();
  }

  function onStorage(event) {
    if (event.key === KEY) paint();
  }

  function wireBasketButtons() {
    document.querySelectorAll('button[aria-label^="Basket"], button[aria-label="Basket"]').forEach(function (btn) {
      if (!btn.getAttribute("aria-controls")) btn.setAttribute("aria-controls", "panel-cart");
      if (!btn.getAttribute("data-panel")) btn.setAttribute("data-panel", "cart");
      if (!btn.getAttribute("aria-expanded")) btn.setAttribute("aria-expanded", "false");
    });
  }

  function mount() {
    ensureSeed();
    wireBasketButtons();
    // Keep closed after remounts; only refresh contents/badges.
    if (!isOpen()) closePanel();
    paint();

    if (bound) return;
    bound = true;
    // Capture phase so cart wins over other page click handlers.
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("storage", onStorage);
  }

  window.BrighticCart = {
    mount: mount,
    key: KEY,
    open: openPanel,
    close: closePanel,
    toggle: togglePanel,
    add: addItem,
    paint: paint,
    isOpen: isOpen,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
