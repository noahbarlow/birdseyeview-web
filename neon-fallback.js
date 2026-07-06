// Hide the .neon-fallback CTA once Neon's iframe has actually loaded with content.
// If Neon's script silently fails (parent origin not in Neon's CSP allowlist —
// staging, localhost, etc.) the fallback stays visible so users can still reach
// the standalone hosted form.
(function () {
  // Hosts allowed to render the Neon iframe. Must match what's whitelisted
  // in Neon's Sharing → Allowed Domains list for each form. Any host NOT
  // in here will force the fallback CTA and hide the failed iframe.
  var PROD_HOSTS = ['noahbarlow.work', 'www.noahbarlow.work'];
  var isProd = PROD_HOSTS.indexOf(location.hostname) !== -1;

  function check() {
    var embeds = document.querySelectorAll('.neon-embed');
    for (var i = 0; i < embeds.length; i++) {
      var embed = embeds[i];
      var fallback = embed.querySelector('.neon-fallback');
      if (!fallback) continue;
      var iframe = embed.querySelector('iframe[src*="neoncrm.com"]');
      var loaded = isProd && iframe && iframe.offsetHeight > 300;
      if (loaded) {
        fallback.hidden = true;
        embed.classList.remove('neon-embed--failed');
      } else if (!isProd) {
        // Off-prod (staging, localhost, previews) — Neon's CSP blocks the iframe,
        // so Chrome shows a broken-doc icon. The CSS class hides Neon's DOM with
        // !important so Neon's own postMessage handler can't fight it back on.
        fallback.hidden = false;
        embed.classList.add('neon-embed--failed');
      }
    }
  }

  function boot() {
    window.__neonFallbackRan = true;
    check();
    [1500, 3500, 7000, 12000].forEach(function (ms) { setTimeout(check, ms); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
