// Neon Email Subscription CAPTCHA integration for the footer Field Brief form.
//
// Neon's server rejects POSTs to submitSubscription.jsp that don't carry a valid
// g-recaptcha-response. Their embed snippet handles this by loading Google
// reCAPTCHA Enterprise and, if the response field is empty on submit, popping a
// small challenge above the Subscribe button. This script re-implements that
// behavior in one place so every footer on the site gets it — no per-page HTML
// duplication.
(function () {
  var LOADED = false;
  var CAPTCHA_ID = 'subscriptionCaptcha';
  var SITEKEY = '6Lf_2ScrAAAAAPN-aF-XHIhe92y-M6ZUlHKV1CN-';

  function inject() {
    if (LOADED) return;
    LOADED = true;

    // 1. Load reCAPTCHA Enterprise. Bare enterprise.js auto-scans the DOM for
    //    <div class="g-recaptcha"> widgets and renders them (v2 checkbox).
    //    Any ?render=<sitekey> query would disable that auto-render and put the
    //    library into programmatic v3-only mode — which is not what Neon's
    //    inline snippet expects.
    var s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/enterprise.js';
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);

    // 2. Inject the CAPTCHA popup element that Neon's script targets by id.
    if (!document.getElementById(CAPTCHA_ID)) {
      var box = document.createElement('div');
      box.id = CAPTCHA_ID;
      box.style.cssText = [
        'display:none',
        'position:fixed',
        'border:1px solid #D8D2C2',
        'background:#ECE3D0',
        'padding:14px 16px',
        'text-align:left',
        'z-index:99999',
        'box-shadow:0 8px 24px rgba(14,13,11,.18)',
        'font-family:var(--ff-body,system-ui),sans-serif',
        'color:#0E0D0B'
      ].join(';');
      box.innerHTML =
        '<div style="font-family:var(--ff-mono,ui-monospace),monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#C81C00;margin-bottom:10px">// Confirm you are human</div>' +
        '<span style="position:absolute;top:8px;right:12px;cursor:pointer;color:#0E0D0B;font-size:20px;line-height:1" onclick="neonSubscriptionCloseCaptcha()">&times;</span>' +
        '<div class="g-recaptcha" data-sitekey="' + SITEKEY + '"></div>';
      document.body.appendChild(box);
    }

    // 3. On successful subscription (Neon's server 200s the hidden iframe), the
    //    onsubmit handler on the form itself already flips the button + shows
    //    the inline "// Thanks" message. Nothing more to do here.
  }

  // Wait for DOM so we can attach reliably.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

  // Neon's snippet calls these two globals from onclick and onclick-close.
  window.neonSubscriptionSubmit = function (btnEl) {
    var res = document.getElementById('g-recaptcha-response');
    if (res && res.value && res.value !== '') {
      return true;
    }
    var box = document.getElementById(CAPTCHA_ID);
    var btn = (btnEl && btnEl.getBoundingClientRect) ? btnEl : document.getElementById('subscriptionSubmitButton');
    if (!box || !btn) return false;
    box.style.display = 'block';
    var b = btn.getBoundingClientRect();
    var cH = box.offsetHeight;
    var cW = box.offsetWidth;
    var gap = 8;
    // Prefer above the button; if there's no room, drop below.
    var top;
    if (b.top - (cH + gap) > 0) {
      top = b.top - (cH + gap);
    } else if (b.bottom + cH + gap < window.innerHeight) {
      top = b.bottom + gap;
    } else {
      top = Math.max(0, (window.innerHeight - cH) / 2);
    }
    box.style.top = top + 'px';
    box.style.left = Math.max(8, Math.min(window.innerWidth - cW - 8,
      b.left + (b.width - cW) / 2)) + 'px';
    return false;
  };

  window.neonSubscriptionCloseCaptcha = function () {
    var box = document.getElementById(CAPTCHA_ID);
    if (box && box.style.display !== 'none') box.style.display = 'none';
  };
})();
