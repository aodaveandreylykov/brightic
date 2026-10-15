(function () {
  var KEY = 'brightic_local_cart';

  /* ── storage ── */
  function readCart() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return { id: 'local_cart', items: [], total: 0 };
      var parsed = JSON.parse(raw);
      return parsed && parsed.id ? parsed : { id: 'local_cart', items: [], total: 0 };
    } catch (e) { return { id: 'local_cart', items: [], total: 0 }; }
  }

  function writeCart(cart) {
    var items = cart.items || [];
    var total = items.reduce(function (s, it) {
      return s + (it.unit_price || 0) * Math.max(1, it.quantity || 1);
    }, 0);
    var next = Object.assign({}, cart, { id: 'local_cart', items: items, item_total: total, total: total });
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) {}
    return next;
  }

  function addItem(title, price, qty, image, blurb) {
    var cart = readCart();
    var handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    var lineId = 'local_' + handle;
    var items = (cart.items || []).slice();
    var idx = -1;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === lineId) { idx = i; break; }
    }
    if (idx >= 0) {
      items[idx] = Object.assign({}, items[idx], { quantity: (items[idx].quantity || 1) + qty });
    } else {
      items.push({ id: lineId, title: title, unit_price: price, quantity: qty, thumbnail: image || '', blurb: blurb || '' });
    }
    return writeCart(Object.assign({}, cart, { items: items }));
  }

  function removeItem(lineId) {
    var cart = readCart();
    var items = (cart.items || []).filter(function (it) { return it.id !== lineId; });
    return writeCart(Object.assign({}, cart, { items: items }));
  }

  function changeQty(lineId, delta) {
    var cart = readCart();
    var items = (cart.items || []).map(function (it) {
      if (it.id !== lineId) return it;
      var next = Math.max(1, (it.quantity || 1) + delta);
      return Object.assign({}, it, { quantity: next });
    });
    return writeCart(Object.assign({}, cart, { items: items }));
  }

  function totalCount(cart) {
    return (cart.items || []).reduce(function (s, it) { return s + (it.quantity || 1); }, 0);
  }

  function fmt(n) { return '$ ' + Math.round(n || 0); }

  function parsePrice(text) {
    var m = String(text || '').replace(/\s/g, '').match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  }

  /* ── "Add more light" — reads .also cards from page ── */
  function getRelated(cartItems) {
    var cartIds = {};
    cartItems.forEach(function (it) { cartIds[it.id] = true; });
    var out = [];
    document.querySelectorAll('.also').forEach(function (el) {
      var nameEl = el.querySelector('.also__name, .also__blurb');
      var priceEl = el.querySelector('.also__price');
      var imgEl = el.querySelector('img:not(.also__heart)');
      var blurbEl = el.querySelector('.also__blurb');
      var title = nameEl ? nameEl.textContent.trim() : '';
      if (!title) return;
      var handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (cartIds['local_' + handle]) return;
      out.push({
        id: 'local_' + handle,
        title: title,
        unit_price: parsePrice(priceEl ? priceEl.textContent : ''),
        thumbnail: imgEl ? imgEl.getAttribute('src') : '',
        blurb: blurbEl ? blurbEl.textContent.trim() : '',
      });
    });
    return out.slice(0, 4);
  }

  /* ── styles ── */
  var CSS = [
    '#cart-drawer{position:fixed;inset:0;z-index:200;display:flex;justify-content:flex-end;}',
    '#cart-drawer[hidden]{display:none;}',
    '#cart-drawer>.cd-overlay{position:absolute;inset:0;background:rgba(30,20,14,.5);}',
    '.cd{position:relative;z-index:1;width:min(560px,100%);background:#ede4dd;color:#37291f;display:flex;flex-direction:column;font-family:"Roboto",Arial,sans-serif;overflow:hidden;}',
    '.cd-head{display:flex;align-items:center;justify-content:space-between;padding:24px 28px 20px;border-bottom:1px solid rgba(55,41,31,.12);flex-shrink:0;}',
    '.cd-head__title{font-size:22px;font-weight:400;letter-spacing:-.5px;margin:0;}',
    '.cd-close{background:none;border:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:inherit;font-size:22px;padding:0;flex-shrink:0;}',
    '.cd-scroll{flex:1;overflow-y:auto;}',
    '.cd-items{padding:0 28px;}',
    '.cd-item{display:grid;grid-template-columns:88px 1fr;grid-template-rows:auto auto;column-gap:16px;padding:20px 0;border-bottom:1px solid rgba(55,41,31,.1);}',
    '.cd-item__img{grid-row:1/3;width:88px;height:88px;object-fit:cover;background:#2c1e15;flex-shrink:0;}',
    '.cd-item__img-placeholder{grid-row:1/3;width:88px;height:88px;background:#2c1e15;flex-shrink:0;}',
    '.cd-item__info{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;}',
    '.cd-item__text{}',
    '.cd-item__name{font-size:16px;font-weight:400;margin:0 0 4px;letter-spacing:-.2px;}',
    '.cd-item__blurb{font-size:13px;opacity:.6;margin:0;}',
    '.cd-item__price{font-size:16px;white-space:nowrap;flex-shrink:0;}',
    '.cd-item__actions{display:flex;align-items:center;justify-content:space-between;margin-top:12px;}',
    '.cd-item__qty{display:flex;align-items:center;gap:0;}',
    '.cd-item__qlabel{font-size:13px;margin-right:10px;opacity:.7;}',
    '.cd-qty-btn{width:32px;height:32px;border:1px solid rgba(55,41,31,.3);background:#ede4dd;color:#37291f;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;}',
    '.cd-qty-n{width:36px;height:32px;border-top:1px solid rgba(55,41,31,.3);border-bottom:1px solid rgba(55,41,31,.3);display:flex;align-items:center;justify-content:center;font-size:14px;}',
    '.cd-item__remove{font-size:13px;opacity:.5;cursor:pointer;background:none;border:0;color:inherit;text-decoration:underline;padding:0;}',
    '.cd-item__remove:hover{opacity:.8;}',
    '.cd-more{padding:20px 28px 0;}',
    '.cd-more__title{font-size:17px;font-weight:400;margin:0 0 14px;letter-spacing:-.3px;}',
    '.cd-more__grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-bottom:24px;}',
    '.cd-more__card{background:#e4d8d0;padding:0;cursor:pointer;border:1px solid rgba(55,41,31,.08);}',
    '.cd-more__card:hover{border-color:rgba(55,41,31,.25);}',
    '.cd-more__thumb{width:100%;height:110px;object-fit:cover;background:#2c1e15;display:block;}',
    '.cd-more__thumb-ph{width:100%;height:110px;background:#2c1e15;display:block;}',
    '.cd-more__body{padding:10px 12px 12px;}',
    '.cd-more__name{font-size:14px;margin:0 0 2px;}',
    '.cd-more__price{font-size:13px;margin:0 0 4px;opacity:.9;}',
    '.cd-more__blurb{font-size:12px;opacity:.6;margin:0 0 6px;}',
    '.cd-more__qty{font-size:12px;opacity:.6;margin:0;}',
    '.cd-foot{border-top:1px solid rgba(55,41,31,.12);padding:20px 28px;flex-shrink:0;}',
    '.cd-checkout{display:block;width:100%;height:52px;background:#fff;color:#37291f;border:0;font-size:15px;text-transform:uppercase;letter-spacing:.8px;cursor:pointer;text-align:center;text-decoration:none;line-height:52px;font-family:inherit;box-sizing:border-box;}',
    '.cd-checkout:hover{background:#f5ede7;}',
    '.cd-shipping{font-size:12px;opacity:.55;margin:10px 0 0;text-align:center;}',
    '.cd-empty{padding:40px 28px;font-size:15px;opacity:.6;}',
    '.cart-badge{position:absolute;top:-6px;right:-6px;min-width:16px;height:16px;padding:0 4px;box-sizing:border-box;border-radius:999px;background:#e10600;color:#fff;font-size:10px;font-weight:700;line-height:16px;pointer-events:none;display:inline-flex;align-items:center;justify-content:center;}',
    '.cart-badge[hidden]{display:none;}',
  ].join('');

  function ensureStyles() {
    if (!document.getElementById('cd-styles')) {
      var s = document.createElement('style');
      s.id = 'cd-styles';
      s.textContent = CSS;
      document.head.appendChild(s);
    }
  }

  function ensureDrawer() {
    if (document.getElementById('cart-drawer')) return;
    ensureStyles();
    var el = document.createElement('div');
    el.id = 'cart-drawer';
    el.setAttribute('hidden', '');
    el.innerHTML = '<div class="cd-overlay"></div><div class="cd">' +
      '<div class="cd-head"><h2 class="cd-head__title">Your Cart</h2>' +
      '<button type="button" class="cd-close" aria-label="Close cart">&#xd7;</button></div>' +
      '<div class="cd-scroll"><div class="cd-items"></div><div class="cd-more"></div></div>' +
      '<div class="cd-foot"></div></div>';
    document.body.appendChild(el);
    el.querySelector('.cd-overlay').addEventListener('click', closeDrawer);
    el.querySelector('.cd-close').addEventListener('click', closeDrawer);
    el.addEventListener('click', function (e) {
      var dec = e.target.closest('.cd-qty-btn[data-dir="-1"]');
      var inc = e.target.closest('.cd-qty-btn[data-dir="1"]');
      var rem = e.target.closest('.cd-item__remove');
      var card = e.target.closest('.cd-more__card');
      if (dec) { changeQty(dec.dataset.id, -1); renderDrawer(); updateBadges(); }
      if (inc) { changeQty(inc.dataset.id, 1); renderDrawer(); updateBadges(); }
      if (rem) { removeItem(rem.dataset.id); renderDrawer(); updateBadges(); }
      if (card && !dec && !inc && !rem) {
        addItem(card.dataset.title, parseInt(card.dataset.price, 10) || 0, 1, card.dataset.img, card.dataset.blurb);
        renderDrawer();
        updateBadges();
      }
    });
  }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function renderItem(item) {
    var total = (item.unit_price || 0) * Math.max(1, item.quantity || 1);
    var thumb = item.thumbnail
      ? '<img class="cd-item__img" src="' + esc(item.thumbnail) + '" alt="">'
      : '<div class="cd-item__img-placeholder"></div>';
    return '<div class="cd-item">' +
      thumb +
      '<div class="cd-item__info">' +
        '<div class="cd-item__text">' +
          '<p class="cd-item__name">' + esc(item.title) + '</p>' +
          (item.blurb ? '<p class="cd-item__blurb">' + esc(item.blurb) + '</p>' : '') +
        '</div>' +
        '<span class="cd-item__price">' + fmt(total) + '</span>' +
      '</div>' +
      '<div class="cd-item__actions">' +
        '<div class="cd-item__qty">' +
          '<span class="cd-item__qlabel">Quantity:</span>' +
          '<button class="cd-qty-btn" data-dir="-1" data-id="' + esc(item.id) + '">&#x2212;</button>' +
          '<span class="cd-qty-n">' + (item.quantity || 1) + '</span>' +
          '<button class="cd-qty-btn" data-dir="1" data-id="' + esc(item.id) + '">+</button>' +
        '</div>' +
        '<button class="cd-item__remove" data-id="' + esc(item.id) + '">Remove</button>' +
      '</div>' +
    '</div>';
  }

  function renderRelated(related) {
    if (!related.length) return '';
    var cards = related.map(function (r) {
      var thumb = r.thumbnail
        ? '<img class="cd-more__thumb" src="' + esc(r.thumbnail) + '" alt="">'
        : '<div class="cd-more__thumb-ph"></div>';
      return '<div class="cd-more__card" data-title="' + esc(r.title) + '" data-price="' + (r.unit_price || 0) + '" data-img="' + esc(r.thumbnail) + '" data-blurb="' + esc(r.blurb) + '">' +
        thumb +
        '<div class="cd-more__body">' +
          '<p class="cd-more__name">' + esc(r.title) + '</p>' +
          '<p class="cd-more__price">' + fmt(r.unit_price) + '</p>' +
          (r.blurb ? '<p class="cd-more__blurb">' + esc(r.blurb) + '</p>' : '') +
          '<p class="cd-more__qty">Quantity: 1</p>' +
        '</div>' +
      '</div>';
    }).join('');
    return '<div class="cd-more__title">Add more light</div><div class="cd-more__grid">' + cards + '</div>';
  }

  function renderDrawer() {
    var drawer = document.getElementById('cart-drawer');
    if (!drawer) return;
    var cart = readCart();
    var items = cart.items || [];
    var count = totalCount(cart);

    drawer.querySelector('.cd-head__title').textContent = 'Your Cart (' + count + ')';

    var itemsEl = drawer.querySelector('.cd-items');
    var moreEl = drawer.querySelector('.cd-more');
    var foot = drawer.querySelector('.cd-foot');

    if (items.length === 0) {
      itemsEl.innerHTML = '<p class="cd-empty">Your basket is empty.</p>';
      moreEl.innerHTML = '';
      foot.innerHTML = '';
      return;
    }

    itemsEl.innerHTML = items.map(renderItem).join('');

    var related = getRelated(items);
    moreEl.innerHTML = renderRelated(related);

    foot.innerHTML =
      '<a class="cd-checkout" href="shop/checkout">Checkout &mdash; ' + fmt(cart.total) + '</a>' +
      '<p class="cd-shipping">Shipping &amp; taxes calculated at checkout</p>';
  }

  function openDrawer() {
    ensureDrawer();
    renderDrawer();
    var drawer = document.getElementById('cart-drawer');
    drawer.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    var drawer = document.getElementById('cart-drawer');
    if (drawer) drawer.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function updateBadges() {
    var count = totalCount(readCart());
    document.querySelectorAll('[aria-label="Basket"]').forEach(function (btn) {
      var badge = btn.querySelector('.cart-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-badge';
        btn.style.position = 'relative';
        btn.appendChild(badge);
      }
      badge.textContent = String(count);
      badge.hidden = count === 0;
    });
  }

  /* ── wire up ── */
  document.querySelectorAll('[aria-label="Basket"]').forEach(function (btn) {
    btn.addEventListener('click', openDrawer);
  });

  document.querySelectorAll('.buy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var frame = btn.closest('.pdp-frame') || document;
      var titleEl = frame.querySelector('.title') || document.querySelector('.title');
      var priceEl = frame.querySelector('.price') || document.querySelector('.price');
      var qtyEl = frame.querySelector('.qty__n');
      var imgEl = frame.querySelector('.stage__img') || document.querySelector('.stage__img');
      var blurbEl = frame.querySelector('.lead');
      var title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : 'Lamp';
      var price = parsePrice(priceEl ? priceEl.textContent : '');
      var qty = parseInt(String(qtyEl ? qtyEl.textContent : '1').trim(), 10) || 1;
      var image = imgEl ? imgEl.getAttribute('src') : '';
      var blurb = blurbEl ? blurbEl.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) : '';
      addItem(title, price, qty, image, blurb);
      updateBadges();
      openDrawer();
    });
  });

  ensureStyles();
  updateBadges();
})();
