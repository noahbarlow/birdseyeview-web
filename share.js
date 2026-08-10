// Lightweight share row. No third-party scripts, no trackers.
// Uses the native share sheet on mobile; falls back to direct network links
// plus copy-to-clipboard on desktop. Drop <div class="share-row" data-share-label="..."></div>
// on any page and this fills it in.
(function () {
  function build(el) {
    var url = el.getAttribute('data-share-url') || location.href.split('#')[0];
    var title = el.getAttribute('data-share-title') || document.title;
    var label = el.getAttribute('data-share-label') || 'Share this';
    var u = encodeURIComponent(url), t = encodeURIComponent(title);

    var nets = [
      ['X', 'https://twitter.com/intent/tweet?url=' + u + '&text=' + t],
      ['Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + u],
      ['LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/?url=' + u],
      ['Email', 'mailto:?subject=' + t + '&body=' + u]
    ];

    var html = '<span class="share-row__lbl">// ' + label + '</span><div class="share-row__btns">';
    if (navigator.share) {
      html += '<button type="button" class="share-btn share-btn--native">Share</button>';
    }
    nets.forEach(function (n) {
      var ext = n[0] === 'Email' ? '' : ' target="_blank" rel="noopener"';
      html += '<a class="share-btn" href="' + n[1] + '"' + ext + '>' + n[0] + '</a>';
    });
    html += '<button type="button" class="share-btn share-btn--copy">Copy link</button>';
    html += '</div>';
    el.innerHTML = html;

    var nativeBtn = el.querySelector('.share-btn--native');
    if (nativeBtn) {
      nativeBtn.addEventListener('click', function () {
        navigator.share({ title: title, url: url }).catch(function () {});
      });
    }

    var copyBtn = el.querySelector('.share-btn--copy');
    copyBtn.addEventListener('click', function () {
      var done = function () {
        var prev = copyBtn.textContent;
        copyBtn.textContent = 'Copied';
        setTimeout(function () { copyBtn.textContent = prev; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta); done();
      }
    });
  }

  function init() {
    var rows = document.querySelectorAll('.share-row');
    for (var i = 0; i < rows.length; i++) build(rows[i]);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
