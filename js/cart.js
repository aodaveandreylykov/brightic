(function () {
  var KEY = 'brightic_local_cart';

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
    var total = items.reduce(function (sum, item) {
      return sum + (item.unit_price || 0) * (item.quantity || 1);
    }, 0);
    var next = Object.assign({}, cart, { id: 'local_cart', items: items, item_total: total, total: total });
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  }

  function addItem(title, price, qty) {
    var cart = readCart();
    var handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    var lineId = 'local_' + handle;
    var items = (cart.items || []).slice();
    var idx = -1;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === lineId) { idx = i; break; }
    }
    if (idx >= 0) {
      items[idx] = Object.assign({}, items[idx], { quantity: (items[idx].quantity || 1) + qty });
    } else {
      items.push({ id: lineId, title: title, unit_price: price, quantity: qty });
    }
    return writeCart(Object.assign({}, cart, { items: items }));
  }

  function totalCount(cart) {
    return (cart.items || []).reduce(function (sum, item) { return sum + (item.quantity || 1); }, 0);
  }

  function fmt(amount) {
    return '$ ' + Math.round(amount);
  }

  function parsePrice(text) {
    var m = String(text || '').match(/[\d\s]+/);
    return m ? parseInt(m[0].replace(/\s/g, ''), 10) : 0;
  }

  var DRAWER_STYLES = [
    '#cart-drawer{position:fixed;inset:0;z-index:200;background:rgba(55,41,31,.45);}',
    '#cart-drawer[hidden]{display:none;}',
    '.cart-dr{position:absolute;top:0;right:0;bottom:0;width:min(400px,100%);background:#e0d2cb;color:#37291f;display:flex;flex-direction:column;font-family:"Roboto",Arial,sans-serif;}',
    '.cart-dr__head{display:flex;align-items:center;justify-content:space-between;padding:22px 24px;border-bottom:1px solid rgba(55,41,31,.15);font-size:18px;letter-spacing:-.5px;}',
    '.cart-dr__close{background:none;border:0;font-size:30px;line-height:1;cursor:pointer;color:inherit;padding:0 2px;}',
    '.cart-dr__body{flex:1;overflow-y:auto;padding:16px 24px;}',
    '.cart-dr__empty{opacity:.6;font-size:15px;margin:0;}',
    '.cart-dr__line{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid rgba(55,41,31,.12);}',
    '.cart-dr__name{font-size:15px;margin:0 0 3px;}',
    '.cart-dr__qty{font-size:13px;opacity:.6;margin:0;}',
    '.cart-dr__price{font-size:15px;white-space:nowrap;flex-shrink:0;}',
    '.cart-dr__foot{padding:20px 24px;border-top:1px solid rgba(55,41,31,.15);}',
    '.cart-dr__total{display:flex;justify-content:space-between;margin:0 0 16px;font-size:17px;}',
    '.cart-dr__btn{display:block;width:100%;height:50px;background:#37291f;color:#e0d2cb;border:0;font-size:15px;text-transform:uppercase;letter-spacing:.5px;cursor:pointer;text-align:center;text-decoration:none;line-height:50px;}',
    '.cart-badge{position:absolute;top:-6px;right:-6px;min-width:16px;height:16px;padding:0 4px;box-sizing:border-box;border-radius:999px;background:#e10600;color:#fff;font-size:10px;font-weight:700;line-height:16px;pointer-events:none;display:inline-flex;align-items:center;justify-content:center;}',
    '.cart-badge[hidden]{display:none;}',
  ].join('');

  function ensureStyles() {
    if (!document.getElementById('cart-styles')) {
      var s = document.createElement('style');
      s.id = 'cart-styles';
      s.textContent = DRAWER_STYLES;
      document.head.appendChild(s);
    }
  }

  function ensureDrawer() {
    if (document.getElementById('cart-drawer')) return;
    ensureStyles();
    var el = document.createElement('div');
    el.id = 'cart-drawer';
    el.setAttribute('hidden', '');
    el.innerHTML =
      '<div class="cart-dr">' +
        '<div class="cart-dr__head"><span>Basket</span><button type="button" class="cart-dr__close" aria-label="Close cart">&times;</button></div>' +
        '<div class="cart-dr__body"></div>' +
        '<div class="cart-dr__foot"></div>' +
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('click', function (e) {
      if (e.target === el || e.target.closest('.cart-dr__close')) closeDrawer();
    });
  }

  function renderDrawer() {
    var drawer = document.getElementById('cart-drawer');
    if (!drawer) return;
    var cart = readCart();
    var body = drawer.querySelector('.cart-dr__body');
    var foot = drawer.querySelector('.cart-dr__foot');
    var items = cart.items || [];
    if (items.length === 0) {
      body.innerHTML = '<p class="cart-dr__empty">Your basket is empty.</p>';
      foot.innerHTML = '';
      return;
    }
    body.innerHTML = items.map(function (item) {
      return '<div class="cart-dr__line">' +
        '<div><p class="cart-dr__name">' + (item.title || 'Lamp') + '</p>' +
        '<p class="cart-dr__qty">&times;&nbsp;' + (item.quantity || 1) + '</p></div>' +
        '<span class="cart-dr__price">' + fmt((item.unit_price || 0) * (item.quantity || 1)) + '</span>' +
        '</div>';
    }).join('');
    foot.innerHTML =
      '<p class="cart-dr__total"><span>Total</span><span>' + fmt(cart.total || 0) + '</span></p>' +
      '<a class="cart-dr__btn" href="shop/checkout">Checkout</a>';
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

  // Basket icon buttons → open drawer
  document.querySelectorAll('[aria-label="Basket"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openDrawer();
    });
  });

  // .buy buttons → add item + open drawer
  document.querySelectorAll('.buy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var frame = btn.closest('.pdp-frame') || document;
      var titleEl = frame.querySelector('.title') || document.querySelector('.title');
      var priceEl = frame.querySelector('.price') || document.querySelector('.price');
      var qtyEl = frame.querySelector('.qty__n');
      var title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : 'Lamp';
      var price = parsePrice(priceEl ? priceEl.textContent : '');
      var qty = parseInt(String(qtyEl ? qtyEl.textContent : '1').trim(), 10) || 1;
      addItem(title, price, qty);
      updateBadges();
      openDrawer();
    });
  });

  // Init
  ensureStyles();
  updateBadges();
})();
