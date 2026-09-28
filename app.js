/* 苗兴旺 · 个人简历 —— 交互脚本
   无依赖，纯原生；渐进增强：禁用 JS 时页面依然完整可读。 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 滚动进场 ---------- */
  var revealables = document.querySelectorAll('.reveal');

  // 同一容器内的多个元素依次进场（最多错开 7 档）
  Array.prototype.forEach.call(revealables, function (el) {
    if (el.style.getPropertyValue('--i')) return;
    var siblings = el.parentNode ? el.parentNode.querySelectorAll(':scope > .reveal') : [];
    var idx = Array.prototype.indexOf.call(siblings, el);
    if (idx > 0) el.style.setProperty('--i', Math.min(idx, 7));
  });

  if (!('IntersectionObserver' in window) || reduced) {
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add('is-in');
    });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    Array.prototype.forEach.call(revealables, function (el) {
      observer.observe(el);
    });
  }

  /* ---------- 顶部阅读进度 ---------- */
  var bar = document.getElementById('progressBar');
  var ticking = false;

  function updateProgress() {
    ticking = false;
    if (!bar) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.width = (ratio * 100).toFixed(2) + '%';
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateProgress);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateProgress();

  /* ---------- 打印 / 存 PDF ---------- */
  var printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', function () {
      window.print();
    });
  }
  /* ---------- 复制微信号 ---------- */
  var copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = copyBtn.getAttribute('data-copy') || '';
      var label = copyBtn.textContent;
      var timer = null;

      function done() {
        copyBtn.textContent = '已复制';
        copyBtn.classList.add('is-done');
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          copyBtn.textContent = label;
          copyBtn.classList.remove('is-done');
        }, 1800);
      }

      // 本地用 file:// 打开时 navigator.clipboard 可能不可用，退回 execCommand
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (err) { /* 交给用户手动选中 */ }
        document.body.removeChild(ta);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
    });
  }
})();
