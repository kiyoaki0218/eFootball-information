/* ============================================
   イーフト情報 - Application Logic
   ============================================ */

(function () {
  'use strict';

  // ==================== CONFIG ====================
  const ADMIN_PASSWORD = 'admin';
  const STORAGE_KEY = 'efootball_news';

  // ==================== STATE ====================
  let isAdminMode = false;
  let currentFilter = 'all';

  // ==================== SAMPLE DATA ====================
  const sampleNews = [
    {
      id: 'sample-1',
      title: 'エンドリッキがオリンピック・リヨンへ移籍！',
      category: 'transfer',
      body: 'レアル・マドリードのエンドリッキがフランスのオリンピック・リヨンへ移籍することが決定。出場機会を求めての移籍とみられる。イーフトへの影響にも注目。',
      image: '',
      date: '2025-12-24',
      isSample: true
    },
    {
      id: 'sample-2',
      title: 'チェルシーFCマレスカ監督が解任！後任候補は？',
      category: 'manager',
      body: 'チェルシーFCのヘッドコーチ、マレスカ監督が解任。イーフト情報の予想候補：前ユヴェントス監督アッレグリ、前塩試合監督サウスゲート、前アヤックス所属ファリオーリ監督。穴狙いは前バルセロナ監督シャビ・エルナンデス。',
      image: '',
      date: '2025-01-01',
      isSample: true
    },
    {
      id: 'sample-3',
      title: 'トッテナムのブレナンジョンソンがパレスに移籍',
      category: 'transfer',
      body: 'トッテナム・ホットスパーのブレナン・ジョンソンがクリスタルパレスへ移籍。プレミアリーグ内での移籍となった。',
      image: '',
      date: '2025-01-02',
      isSample: true
    },
    {
      id: 'sample-4',
      title: '初心者向け：週間FPガチャの引き方ガイド',
      category: 'efootball',
      body: '初心者は通常選手を集めたり、貯めたコインで緑色の枠の、POTMや俗に言う週間FPのガチャを引くと良いですよ！無課金・微課金でも十分強いチームが作れます。',
      image: '',
      date: '2025-10-26',
      isSample: true
    }
  ];

  // ==================== DOM ELEMENTS ====================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const header = $('#header');
  const menuBtn = $('#menuBtn');
  const mobileNav = $('#mobileNav');
  const mobileNavClose = $('#mobileNavClose');
  const newsGrid = $('#newsGrid');
  const newsFilters = $('#newsFilters');
  const adminToggleBtn = $('#adminToggleBtn');
  const passwordModal = $('#passwordModal');
  const passwordSubmit = $('#passwordSubmit');
  const passwordCancel = $('#passwordCancel');
  const adminPassword = $('#adminPassword');
  const postModal = $('#postModal');
  const postForm = $('#postForm');
  const postCancel = $('#postCancel');
  const chatBody = $('#chatBody');

  // ==================== INITIALIZATION ====================
  function init() {
    initHeader();
    initMobileNav();
    initScrollReveal();
    initNewsSystem();
    initAdminSystem();
    initChatAnimation();
  }

  // ==================== HEADER ====================
  function initHeader() {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY > 50) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
      lastScroll = scrollY;
    }, { passive: true });
  }

  // ==================== MOBILE NAV ====================
  function initMobileNav() {
    menuBtn.addEventListener('click', () => {
      mobileNav.classList.add('mobile-nav--open');
    });

    mobileNavClose.addEventListener('click', () => {
      mobileNav.classList.remove('mobile-nav--open');
    });

    $$('.mobile-nav__link').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('mobile-nav--open');
      });
    });
  }

  // ==================== SCROLL REVEAL ====================
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    $$('.reveal').forEach(el => observer.observe(el));
  }

  // ==================== NEWS SYSTEM ====================
  function getNews() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // First time: use sample data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleNews));
    return sampleNews;
  }

  function saveNews(news) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(news));
  }

  function initNewsSystem() {
    renderNews();
    initFilters();
  }

  function renderNews() {
    const news = getNews();
    const filtered = currentFilter === 'all'
      ? news
      : news.filter(n => n.category === currentFilter);

    if (filtered.length === 0) {
      newsGrid.innerHTML = '<div class="news__empty">📭 まだニュースがありません</div>';
      return;
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    newsGrid.innerHTML = filtered.map((item, index) => {
      const categoryLabels = {
        transfer: '移籍',
        manager: '監督',
        match: '試合',
        efootball: 'イーフト'
      };

      return `
        <article class="news-card" style="animation-delay: ${index * 0.08}s">
          ${item.image ? `<img class="news-card__image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">` : `
            <div class="news-card__image" style="display:flex;align-items:center;justify-content:center;font-size:3rem;background:linear-gradient(135deg, var(--bg-card), var(--bg-secondary));">
              ${item.category === 'transfer' ? '🔄' : item.category === 'manager' ? '👔' : item.category === 'match' ? '⚽' : '🎮'}
            </div>
          `}
          <div class="news-card__body">
            <span class="news-card__category news-card__category--${item.category}">${categoryLabels[item.category] || item.category}</span>
            <h3 class="news-card__title">${escapeHtml(item.title)}</h3>
            <p class="news-card__excerpt">${escapeHtml(item.body)}</p>
            <div class="news-card__meta">
              <span>📅 ${item.date}</span>
              <button class="news-card__delete" data-id="${item.id}" aria-label="削除">🗑 削除</button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach delete handlers
    $$('.news-card__delete').forEach(btn => {
      btn.addEventListener('click', () => deleteNews(btn.dataset.id));
    });
  }

  function initFilters() {
    newsFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.news__filter-btn');
      if (!btn) return;

      $$('.news__filter-btn').forEach(b => b.classList.remove('news__filter-btn--active'));
      btn.classList.add('news__filter-btn--active');

      currentFilter = btn.dataset.category;
      renderNews();
    });
  }

  function addNews(newsItem) {
    const news = getNews();
    news.unshift(newsItem);
    saveNews(news);
    renderNews();
  }

  function deleteNews(id) {
    if (!confirm('このニュースを削除しますか？')) return;
    const news = getNews().filter(n => n.id !== id);
    saveNews(news);
    renderNews();
  }

  // ==================== ADMIN SYSTEM ====================
  function initAdminSystem() {
    adminToggleBtn.addEventListener('click', () => {
      if (isAdminMode) {
        // Toggle off
        isAdminMode = false;
        document.body.classList.remove('admin-mode');
        adminToggleBtn.textContent = '🔑 管理者';
        return;
      }
      openModal(passwordModal);
    });

    passwordSubmit.addEventListener('click', () => {
      if (adminPassword.value === ADMIN_PASSWORD) {
        isAdminMode = true;
        document.body.classList.add('admin-mode');
        adminToggleBtn.textContent = '✅ 管理者モード ON（投稿する）';
        closeModal(passwordModal);
        adminPassword.value = '';

        // Now clicking admin button opens post modal
        adminToggleBtn.onclick = () => {
          if (isAdminMode) {
            openModal(postModal);
          }
        };
      } else {
        alert('パスワードが違います');
        adminPassword.value = '';
      }
    });

    adminPassword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') passwordSubmit.click();
    });

    passwordCancel.addEventListener('click', () => {
      closeModal(passwordModal);
      adminPassword.value = '';
    });

    postCancel.addEventListener('click', () => {
      closeModal(postModal);
    });

    postForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = $('#postTitle').value.trim();
      const category = $('#postCategory').value;
      const body = $('#postBody').value.trim();
      const image = $('#postImage').value.trim();

      if (!title || !body) return;

      const newsItem = {
        id: 'post-' + Date.now(),
        title,
        category,
        body,
        image: image || '',
        date: new Date().toISOString().split('T')[0],
        isSample: false
      };

      addNews(newsItem);
      closeModal(postModal);
      postForm.reset();

      // Scroll to news
      document.getElementById('news').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ==================== MODAL HELPERS ====================
  function openModal(modal) {
    modal.classList.add('modal-overlay--visible');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('modal-overlay--visible');
    document.body.style.overflow = '';
  }

  // Close modal on overlay click
  [passwordModal, postModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // ==================== CHAT ANIMATION ====================
  function initChatAnimation() {
    const messages = [
      { type: 'right', text: 'メッシ強い？', delay: 600 },
      { type: 'typing', delay: 1200 },
      { type: 'left', text: 'メッシは攻撃面のステータスが非常に優秀です！特にパス・ドリブル系は圧倒的ですよ 🔥', delay: 2000 },
      { type: 'right', text: 'どのガチャ引けばいい？', delay: 3500 },
      { type: 'typing', delay: 4200 },
      { type: 'left', text: '初心者は通常選手を集めつつ、緑色の枠の週間FPガチャを引くのがおすすめです！コスパ最強💪', delay: 5200 },
      { type: 'right', text: 'エンドリッキってイーフトに来る？', delay: 7000 },
      { type: 'typing', delay: 7600 },
      { type: 'left', text: 'リヨンへの移籍が決定したので、FP化の可能性大です！要チェック⚡', delay: 8600 },
    ];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          playChat(messages);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe($('#chatMock'));
  }

  function playChat(messages) {
    chatBody.innerHTML = '';
    messages.forEach((msg) => {
      setTimeout(() => {
        // Remove any typing indicator
        const typing = chatBody.querySelector('.chat-bubble--typing');
        if (typing && msg.type !== 'typing') typing.remove();

        const bubble = document.createElement('div');

        if (msg.type === 'typing') {
          bubble.className = 'chat-bubble chat-bubble--left chat-bubble--typing';
          bubble.innerHTML = '<span></span><span></span><span></span>';
          bubble.style.opacity = '1';
          bubble.style.transform = 'translateY(0)';
        } else {
          bubble.className = `chat-bubble chat-bubble--${msg.type}`;
          bubble.textContent = msg.text;
        }

        chatBody.appendChild(bubble);
        chatBody.scrollTop = chatBody.scrollHeight;
      }, msg.delay);
    });
  }

  // ==================== UTILITIES ====================
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== START ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
