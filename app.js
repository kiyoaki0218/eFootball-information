(function () {
  'use strict';

  var header = document.getElementById('header');
  var menuBtn = document.getElementById('menuBtn');
  var mobileNav = document.getElementById('mobileNav');
  var mobileNavClose = document.getElementById('mobileNavClose');
  var chatBody = document.getElementById('chatBody');
  var newsGrid = document.getElementById('newsGrid');
  var newsFilters = document.getElementById('newsFilters');

  var allNews = [];
  var currentFilter = 'all';

  function init() {
    initHeader();
    initMobileNav();
    initScrollReveal();
    initChatAnimation();
    fetchNews();
  }

  function initHeader() {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    }, { passive: true });
  }

  function initMobileNav() {
    menuBtn.addEventListener('click', function() {
      mobileNav.classList.add('mobile-nav--open');
    });

    mobileNavClose.addEventListener('click', function() {
      mobileNav.classList.remove('mobile-nav--open');
    });

    var mobileLinks = document.querySelectorAll('.mobile-nav__link, .mobile-nav .btn');
    for (var i = 0; i < mobileLinks.length; i++) {
      mobileLinks[i].addEventListener('click', function() {
        mobileNav.classList.remove('mobile-nav--open');
      });
    }
  }

  function initScrollReveal() {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    var reveals = document.querySelectorAll('.reveal');
    for (var i = 0; i < reveals.length; i++) {
      observer.observe(reveals[i]);
    }
  }

  // Fetch News from Vercel Serverless API
  function fetchNews() {
    if (!newsGrid) return;
    fetch('/api/news')
      .then(function(res) {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(function(data) {
        allNews = data;
        renderNews();
        initFilters();
      })
      .catch(function(err) {
        console.error('Fetch error:', err);
        newsGrid.innerHTML = '<div class="news__error"><p>\u6700\u65B0\u30CB\u30E5\u30FC\u30B9\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u3057\u3070\u3089\u304F\u7D4C\u3063\u3066\u304B\u3089\u518D\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002</p></div>';
      });
  }

  function renderNews() {
    if (!newsGrid) return;
    
    // Filter logic
    var filtered = allNews;
    if (currentFilter !== 'all') {
      filtered = allNews.filter(function(item) {
        // match category maps to 'match' or others
        if (currentFilter === 'match') {
          return item.category === 'match' || item.category === 'efootball';
        }
        return item.category === currentFilter;
      });
    }

    if (filtered.length === 0) {
      newsGrid.innerHTML = '<div class="news__error"><p>\u8A72\u5F53\u3059\u308B\u30CB\u30E5\u30FC\u30B9\u304C\u3042\u308A\u307E\u305B\u3093\u3002</p></div>';
      return;
    }

    var categoryLabels = {
      transfer: '\u79FB\u7C4D',
      manager: '\u76E3\u7763',
      match: '\u8A66\u5408',
      efootball: '\u30A4\u30FC\u30D5\u30C8'
    };

    var html = filtered.map(function(item, index) {
      var categoryClass = item.category || 'match';
      var label = categoryLabels[item.category] || '\u305D\u306E\u4ED6';
      var icon = '⚽';
      if (item.category === 'transfer') icon = '🔄';
      else if (item.category === 'manager') icon = '👔';
      else if (item.category === 'efootball') icon = '🎮';

      // Format date (yyyy-mm-dd)
      var dateStr = '';
      if (item.pubDate) {
        var d = new Date(item.pubDate);
        if (!isNaN(d.getTime())) {
          var y = d.getFullYear();
          var m = ('0' + (d.getMonth() + 1)).slice(-2);
          var date = ('0' + d.getDate()).slice(-2);
          dateStr = y + '-' + m + '-' + date;
        }
      }

      return '<article class="news-card" style="animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: ' + (index * 0.05) + 's">' +
        '<div class="news-card__icon-header">' + icon + '</div>' +
        '<div class="news-card__body">' +
          '<div class="news-card__meta-top">' +
            '<span class="news-card__category news-card__category--' + categoryClass + '">' + label + '</span>' +
            '<span class="news-card__source">' + escapeHtml(item.source) + '</span>' +
          '</div>' +
          '<h3 class="news-card__title">' + escapeHtml(item.title) + '</h3>' +
          '<div class="news-card__link-wrap">' +
            '<span class="news-card__date">📅 ' + dateStr + '</span>' +
            '<a href="' + escapeHtml(item.link) + '" target="_blank" rel="noopener noreferrer" class="news-card__btn">' +
              '\u8A73\u7D30\u3092\u898B\u308B <span style="font-size:0.75rem;">↗</span>' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');

    newsGrid.innerHTML = html;
  }

  function initFilters() {
    if (!newsFilters) return;
    newsFilters.addEventListener('click', function(e) {
      var btn = e.target.closest('.news__filter-btn');
      if (!btn) return;

      var buttons = newsFilters.querySelectorAll('.news__filter-btn');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('news__filter-btn--active');
      }
      btn.classList.add('news__filter-btn--active');

      currentFilter = btn.getAttribute('data-category');
      renderNews();
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  function initChatAnimation() {
    var messages = [
      { type: 'right', text: 'メッシ強い？', delay: 600 },
      { type: 'typing', delay: 1200 },
      { type: 'left', text: 'メッシは攻撃面のステータスが非常に優秀です！特にパス・ドリブル系は圧倒的ですよ 🔥', delay: 2000 },
      { type: 'right', text: 'どのガチャ引けばいい？', delay: 3500 },
      { type: 'typing', delay: 4200 },
      { type: 'left', text: '初心者は通常選手を集めつつ、緑色の枠の週間FPガチャを引くのがおすすめです！コスパ最強💪', delay: 5200 },
      { type: 'right', text: 'エンドリッキってイーフトに来る？', delay: 7000 },
      { type: 'typing', delay: 7600 },
      { type: 'left', text: 'リヨンへの移籍が決定したので、FP化の可能性大です！要チェック⚡', delay: 8600 }
    ];

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          playChat(messages);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    var chatMock = document.getElementById('chatMock');
    if (chatMock) observer.observe(chatMock);
  }

  function playChat(messages) {
    if (!chatBody) return;
    chatBody.innerHTML = '';
    messages.forEach(function(msg) {
      setTimeout(function() {
        var typing = chatBody.querySelector('.chat-bubble--typing');
        if (typing && msg.type !== 'typing') typing.remove();

        var bubble = document.createElement('div');

        if (msg.type === 'typing') {
          bubble.className = 'chat-bubble chat-bubble--left chat-bubble--typing';
          bubble.innerHTML = '<span></span><span></span><span></span>';
          bubble.style.opacity = '1';
          bubble.style.transform = 'translateY(0)';
        } else {
          bubble.className = 'chat-bubble chat-bubble--' + msg.type;
          bubble.textContent = msg.text;
        }

        chatBody.appendChild(bubble);
        chatBody.scrollTop = chatBody.scrollHeight;
      }, msg.delay);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
