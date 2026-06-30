(function () {
  'use strict';

  var header = document.getElementById('header');
  var menuBtn = document.getElementById('menuBtn');
  var mobileNav = document.getElementById('mobileNav');
  var mobileNavClose = document.getElementById('mobileNavClose');
  var chatBody = document.getElementById('chatBody');

  function init() {
    initHeader();
    initMobileNav();
    initScrollReveal();
    initChatAnimation();
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

  function initChatAnimation() {
    var messages = [
      { type: 'right', text: '\u30E1\u30C3\u30B7\u5F37\u3044\uFF1F', delay: 600 },
      { type: 'typing', delay: 1200 },
      { type: 'left', text: '\u30E1\u30C3\u30B7\u306F\u653B\u6483\u9762\u306E\u30B9\u30C6\u30FC\u30BF\u30B9\u304C\u975E\u5E38\u306B\u512A\u79C0\u3067\u3059\uFF01\u7279\u306B\u30D1\u30B9\u30FB\u30C9\u30EA\u30D6\u30EB\u7CFB\u306F\u5727\u5012\u7684\u3067\u3059\u3088 \uD83D\uDD25', delay: 2000 },
      { type: 'right', text: '\u3069\u306E\u30AC\u30C1\u30E3\u5F15\u3051\u3070\u3044\u3044\uFF1F', delay: 3500 },
      { type: 'typing', delay: 4200 },
      { type: 'left', text: '\u521D\u5FC3\u8005\u306F\u901A\u5E38\u9078\u624B\u3092\u96C6\u3081\u3064\u3064\u3001\u7DD1\u8272\u306E\u67A0\u306E\u9031\u9593FP\u30AC\u30C1\u30E3\u3092\u5F15\u304F\u306E\u304C\u304A\u3059\u3059\u3081\u3067\u3059\uFF01\u30B3\u30B9\u30D1\u6700\u5F37\uD83D\uDCAA', delay: 5200 },
      { type: 'right', text: '\u30A8\u30F3\u30C9\u30EA\u30C3\u30AD\u3063\u3066\u30A4\u30FC\u30D5\u30C8\u306B\u6765\u308B\uFF1F', delay: 7000 },
      { type: 'typing', delay: 7600 },
      { type: 'left', text: '\u30EA\u30E8\u30F3\u3078\u306E\u79FB\u7C4D\u304C\u6C7A\u5B9A\u3057\u305F\u306E\u3067\u3001FP\u5316\u306E\u53EF\u80FD\u6027\u5927\u3067\u3059\uFF01\u8981\u30C1\u30A7\u30C3\u30AF\u26A1', delay: 8600 }
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