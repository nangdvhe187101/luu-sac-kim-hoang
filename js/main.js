/**
 * LƯU SẮC KIM HOÀNG
 * Complete Client-Side Interactions
 * (Mega Menu Dropdown, Real Mobile Drawer & Accordion, Live Search, Sliders, Locale Switching)
 */

document.addEventListener('DOMContentLoaded', () => {
  initGlobalFooter();
  initMegaMenu();
  initMobileMenu();
  initSearch();
  initSearchPage();
  initCarousels();
  initExperienceCarousels();
  initHeaderScroll();
  initHeaderOffset();
  initLanguageTabs();
  initPartnerLogoCarousel();
  initGuestbook();
  initTranhGallery();
  initCreativeProducts();
  initExploreSlider();
});

/**
 * 0. Global Footer Component Loader
 * Tự động tải /footer.html vào #site-footer-container (chỉ cần sửa 1 file footer.html)
 */
function initGlobalFooter() {
  const container = document.getElementById('site-footer-container');
  if (container && (!container.firstElementChild || container.firstElementChild.tagName !== 'FOOTER')) {
    fetch('/footer.html')
      .then(res => res.ok ? res.text() : '')
      .then(html => {
        if (html) {
          container.innerHTML = html;
        }
      })
      .catch(err => console.debug('Footer auto-loader:', err));
  }
}

/**
 * 1. Desktop Mega Menu Dropdowns on Hover
 */
function initMegaMenu() {
  const header = document.querySelector('header');
  const panel = document.getElementById('header-mega-panel');
  if (!header || !panel) return;

  const items = document.querySelectorAll('.header-nav__item[data-menu]');
  const slots = document.querySelectorAll('.header-panel-slot[data-slot]');
  let closeTimer = null;

  function updateActiveNavByUrl() {
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/vi';
    items.forEach(item => {
      const trigger = item.querySelector('.header-nav__trigger');
      const href = trigger ? trigger.getAttribute('href') : '';
      const key = item.getAttribute('data-menu');
      let matches = false;

      if (href && (currentPath === href || (href !== '/vi' && href !== '/en' && currentPath.startsWith(href)))) {
        matches = true;
      } else if (key === 'san-pham-sang-tao' && (currentPath.includes('/services') || currentPath.includes('/souvenirs') || currentPath.includes('/creative'))) {
        matches = true;
      } else if (key === 'tin-tuc' && (currentPath.includes('/posts') || currentPath.includes('/news') || currentPath.includes('/library'))) {
        matches = true;
      }

      if (matches) {
        item.classList.add('is-active');
        if (trigger) trigger.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
        if (trigger) trigger.classList.remove('is-active');
      }
    });
  }

  function showSlot(menuKey) {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    if (!menuKey) {
      hidePanelImmediate();
      return;
    }

    let found = false;
    slots.forEach(slot => {
      if (slot.getAttribute('data-slot') === menuKey) {
        slot.style.display = 'block';
        found = true;
      } else {
        slot.style.display = 'none';
      }
    });

    items.forEach(item => {
      const trigger = item.querySelector('.header-nav__trigger');
      if (item.getAttribute('data-menu') === menuKey) {
        if (trigger) {
          trigger.classList.add('is-active');
          trigger.setAttribute('aria-expanded', 'true');
        }
      } else {
        if (trigger) {
          trigger.classList.remove('is-active');
          trigger.setAttribute('aria-expanded', 'false');
        }
      }
    });

    if (found) {
      panel.classList.add('is-visible');
    } else {
      hidePanelImmediate();
    }
  }

  function hidePanelImmediate() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    panel.classList.remove('is-visible');
    items.forEach(item => {
      const trigger = item.querySelector('.header-nav__trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
    slots.forEach(slot => {
      slot.style.display = 'none';
    });
    updateActiveNavByUrl();
  }

  function hidePanel() {
    closeTimer = setTimeout(hidePanelImmediate, 180);
  }

  items.forEach(item => {
    const key = item.getAttribute('data-menu');
    const trigger = item.querySelector('.header-nav__trigger');
    item.addEventListener('mouseenter', () => showSlot(key));
    item.addEventListener('focusin', () => showSlot(key));
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        const href = trigger.getAttribute('href');
        if (href && href.includes('#')) {
          const hash = '#' + href.split('#')[1];
          const targetEl = document.querySelector(hash);
          if (targetEl) {
            e.preventDefault();
            hidePanelImmediate();
            const headerH = header ? header.offsetHeight : 72;
            const y = targetEl.getBoundingClientRect().top + window.scrollY - headerH;
            window.scrollTo({ top: y, behavior: 'smooth' });
            return;
          }
        }
        if (href && href !== '#' && href !== 'javascript:void(0)') {
          window.location.href = href;
        } else {
          e.preventDefault();
          showSlot(key);
        }
      });
    }
  });

  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      hidePanelImmediate();
    }
  });

  header.addEventListener('mouseleave', hidePanel);
  panel.addEventListener('mouseenter', () => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  });
  panel.addEventListener('mouseleave', hidePanel);

  // Smooth scroll for mega panel anchor links on home page
  panel.querySelectorAll('a[href*="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.includes('#')) {
        const hash = '#' + href.split('#')[1];
        const targetEl = document.querySelector(hash);
        if (targetEl) {
          e.preventDefault();
          hidePanelImmediate();
          const headerH = header ? header.offsetHeight : 72;
          const y = targetEl.getBoundingClientRect().top + window.scrollY - headerH;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    });
  });

  updateActiveNavByUrl();
}

/**
 * 2. Real Mobile Drawer & Accordion Menu
 */
function initMobileMenu() {
  const menuBtn = document.querySelector('.header-menu-btn');
  const mobileOverlay = document.getElementById('header-mobile-overlay');
  if (!menuBtn || !mobileOverlay) return;

  const backdrop = mobileOverlay.querySelector('.header-mobile-nav__backdrop');

  function openDrawer() {
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.classList.add('is-open');
    mobileOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.classList.remove('is-open');
    mobileOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', () => {
    const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) closeDrawer();
    else openDrawer();
  });

  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  // Accordion toggle on each row, or direct anchor smooth scroll
  const rows = mobileOverlay.querySelectorAll('.header-mobile-nav__row');
  rows.forEach(row => {
    row.addEventListener('click', (e) => {
      if (row.tagName.toLowerCase() === 'a') {
        const href = row.getAttribute('href');
        if (href && href.includes('#')) {
          const hash = '#' + href.split('#')[1];
          const targetEl = document.querySelector(hash);
          if (targetEl) {
            e.preventDefault();
            closeDrawer();
            const headerH = document.querySelector('header')?.offsetHeight || 72;
            const y = targetEl.getBoundingClientRect().top + window.scrollY - headerH;
            window.scrollTo({ top: y, behavior: 'smooth' });
            return;
          }
        }
        if (href && href !== '#' && href !== 'javascript:void(0)') {
          e.preventDefault();
          closeDrawer();
          window.location.href = href;
          return;
        }
        closeDrawer();
        return;
      }

      const item = row.closest('.header-mobile-nav__item');
      const panel = item ? item.querySelector('.header-mobile-nav__panel') : null;
      const icon = row.querySelector('.header-mobile-nav__row-icon');
      if (!panel) return;

      const isOpen = panel.classList.contains('is-open');

      // Close all other panels
      rows.forEach(otherRow => {
        if (otherRow !== row) {
          otherRow.setAttribute('aria-expanded', 'false');
          const otherItem = otherRow.closest('.header-mobile-nav__item');
          const otherPanel = otherItem ? otherItem.querySelector('.header-mobile-nav__panel') : null;
          const otherIcon = otherRow.querySelector('.header-mobile-nav__row-icon');
          if (otherPanel) {
            otherPanel.classList.remove('is-open');
            otherPanel.setAttribute('aria-hidden', 'true');
          }
          if (otherIcon) otherIcon.classList.remove('is-open');
        }
      });

      if (isOpen) {
        row.setAttribute('aria-expanded', 'false');
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
        if (icon) icon.classList.remove('is-open');
      } else {
        row.setAttribute('aria-expanded', 'true');
        panel.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        if (icon) icon.classList.add('is-open');
      }
    });
  });

  // Handle all links inside mobile submenu panels reliably
  mobileOverlay.querySelectorAll('.header-mobile-nav__panel a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href === 'javascript:void(0)') return;
      if (href.includes('#')) {
        const parts = href.split('#');
        const pathPart = parts[0];
        const hash = '#' + parts[1];
        const samePage = !pathPart || pathPart === window.location.pathname || pathPart === window.location.pathname + '/';
        const targetEl = samePage ? document.querySelector(hash) : null;
        if (targetEl) {
          e.preventDefault();
          closeDrawer();
          const headerH = document.querySelector('header')?.offsetHeight || 72;
          const y = targetEl.getBoundingClientRect().top + window.scrollY - headerH;
          window.scrollTo({ top: y, behavior: 'smooth' });
          return;
        }
      }
      e.preventDefault();
      closeDrawer();
      window.location.assign(href);
    });
  });
}


/**
 * Helper: Get current site language ('vi' | 'en')
 */
function getSiteLang() {
  try {
    const saved = localStorage.getItem('lskh_lang');
    if (saved === 'en' || saved === 'vi') return saved;
  } catch (e) {}
  return document.documentElement.lang === 'en' ? 'en' : 'vi';
}

/**
 * Helper: Remove Vietnamese diacritics for smart search matching
 */
function normalizeViText(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

let cachedSearchIndex = null;
async function fetchSearchDocs(query) {
  const qNorm = normalizeViText(query.trim());
  if (!qNorm) return [];

  // Try backend /api/search first, then fall back to static /search-index.json
  try {
    const resp = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (resp.ok) {
      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await resp.json();
        if (Array.isArray(data.docs) && data.docs.length > 0) {
          return data.docs;
        }
      }
    }
  } catch (e) {}

  try {
    if (!cachedSearchIndex) {
      const resp = await fetch('/search-index.json');
      if (resp.ok) {
        cachedSearchIndex = await resp.json();
      }
    }
    if (Array.isArray(cachedSearchIndex)) {
      return cachedSearchIndex.filter(item => {
        const titleNorm = normalizeViText(item.title);
        const excerptNorm = normalizeViText(item.excerpt);
        const catNorm = normalizeViText(item.category);
        return titleNorm.includes(qNorm) || excerptNorm.includes(qNorm) || catNorm.includes(qNorm);
      }).slice(0, 15);
    }
  } catch (e) {}

  return [];
}

/**
 * 4. Live Autocomplete Search Field Interactions
 */
function initSearch() {
  const searchWrappers = document.querySelectorAll('.header-search');

  searchWrappers.forEach(wrapper => {
    const input = wrapper.querySelector('.header-search-field__input');
    const icon = wrapper.querySelector('.header-search-field__icon');
    if (!input) return;

    let dropdown = wrapper.querySelector('.header-search-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'header-search-dropdown';
      dropdown.style.display = 'none';
      wrapper.appendChild(dropdown);
    }

    let searchTimer = null;

    function goToSearchPage() {
      const q = input.value.trim();
      if (q) {
        window.location.href = `/vi/search?q=${encodeURIComponent(q)}`;
      } else {
        input.focus();
      }
    }

    if (icon) {
      icon.setAttribute('role', 'button');
      icon.setAttribute('aria-label', 'Tìm kiếm');
      icon.addEventListener('click', (e) => {
        e.preventDefault();
        goToSearchPage();
      });
    }

    input.addEventListener('input', () => {
      const q = input.value.trim();
      if (searchTimer) clearTimeout(searchTimer);

      if (!q) {
        dropdown.style.display = 'none';
        return;
      }

      searchTimer = setTimeout(() => {
        performSearch(q, dropdown);
      }, 200);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        goToSearchPage();
      } else if (e.key === 'Escape') {
        dropdown.style.display = 'none';
      }
    });

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  });

  async function performSearch(query, dropdown) {
    const isEn = getSiteLang() === 'en';
    try {
      dropdown.style.display = 'flex';
      dropdown.innerHTML = `
        <h3 class="header-search-dropdown__heading">${isEn ? 'Search Results' : 'Kết quả tìm kiếm'}</h3>
        <div class="header-search-dropdown__body">
          <div class="header-search-dropdown__loading"><span class="text-xs text-gray-500">${isEn ? 'Searching...' : 'Đang tìm kiếm...'}</span></div>
        </div>
      `;

      const docs = await fetchSearchDocs(query);

      if (docs.length === 0) {
        dropdown.innerHTML = `
          <h3 class="header-search-dropdown__heading">${isEn ? 'Search Results' : 'Kết quả tìm kiếm'}</h3>
          <div class="header-search-dropdown__body">
            <p class="header-search-dropdown__empty">${isEn ? 'No results found for your query.' : 'Không có kết quả nào cho từ khóa của bạn.'}</p>
          </div>
        `;
        return;
      }

      const qRegex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

      let listHtml = docs.slice(0, 5).map(doc => {
        const highlightedTitle = doc.title.replace(qRegex, '<mark>$1</mark>');
        const highlightedExcerpt = (doc.excerpt || '').replace(qRegex, '<mark>$1</mark>');
        return `
          <li class="header-search-dropdown__item">
            <a class="header-search-dropdown__link" href="${doc.url}">
              <span class="header-search-dropdown__title">${highlightedTitle}</span>
              <p class="header-search-dropdown__excerpt">${highlightedExcerpt}</p>
            </a>
          </li>
        `;
      }).join('');

      dropdown.innerHTML = `
        <h3 class="header-search-dropdown__heading">${isEn ? 'Search Results' : 'Kết quả tìm kiếm'}</h3>
        <div class="header-search-dropdown__body">
          <ul class="header-search-dropdown__list">
            ${listHtml}
          </ul>
        </div>
        <a class="header-search-dropdown__footer" href="/vi/search?q=${encodeURIComponent(query)}">
          ${isEn ? 'View all results for' : 'Xem tất cả kết quả cho'} <span class="header-search-dropdown__footer-query">"${query}"</span> →
        </a>
      `;
    } catch (err) {
      console.error('Search error:', err);
    }
  }
}

/**
 * 5. Search Page Results Rendering (/vi/search)
 */
function initSearchPage() {
  const pathname = window.location.pathname;
  if (!pathname.includes('/search')) return;

  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get('q') || '';
  const searchInput = document.getElementById('search');
  const searchMain = document.querySelector('.search-page__main');

  if (searchInput && q) {
    searchInput.value = q;
  }

  if (searchMain) {
    if (q) {
      renderSearchPageResults(q, searchMain);
    }

    if (searchInput) {
      let pageSearchTimer = null;
      searchInput.addEventListener('input', () => {
        const newQ = searchInput.value.trim();
        if (pageSearchTimer) clearTimeout(pageSearchTimer);
        pageSearchTimer = setTimeout(() => {
          if (newQ) {
            history.replaceState(null, '', `?q=${encodeURIComponent(newQ)}`);
            renderSearchPageResults(newQ, searchMain);
          }
        }, 300);
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const newQ = searchInput.value.trim();
          if (newQ) {
            history.replaceState(null, '', `?q=${encodeURIComponent(newQ)}`);
            renderSearchPageResults(newQ, searchMain);
          }
        }
      });
    }
  }

  async function renderSearchPageResults(query, container) {
    const isEn = getSiteLang() === 'en';
    try {
      container.className = 'search-page__main';
      container.innerHTML = `
        <div class="py-12 text-center text-sm text-gray-500">${isEn ? 'Searching...' : 'Đang tìm kiếm...'}</div>
      `;

      const docs = await fetchSearchDocs(query);

      if (docs.length === 0) {
        container.innerHTML = `
          <div class="py-16 text-center">
            <h3 class="text-lg font-serif text-gray-800">${isEn ? 'No results found' : 'Không tìm thấy kết quả nào'}</h3>
            <p class="text-sm text-gray-500 mt-2">${isEn ? `No content matches "${query}". Please try different keywords.` : `Không có nội dung nào phù hợp với từ khóa "${query}". Vui lòng thử từ khóa khác.`}</p>
          </div>
        `;
        return;
      }

      const qRegex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

      const itemsHtml = docs.map(doc => {
        const highlightedTitle = doc.title.replace(qRegex, '<mark>$1</mark>');
        const highlightedExcerpt = (doc.excerpt || '').replace(qRegex, '<mark>$1</mark>');
        return `
          <li class="search-page__item">
            <a class="search-page__link" href="${doc.url}">
              <div class="search-page__meta">
                <span class="search-page__badge search-page__badge--events">${doc.category || doc.badge || (isEn ? 'Article' : 'Bài viết')}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right search-page__arrow" aria-hidden="true">
                  <path d="m9 18 6-6-6-6"></path>
                </svg>
              </div>
              <span class="search-page__title font-serif">${highlightedTitle}</span>
              <p class="search-page__excerpt search-snippet">${highlightedExcerpt}</p>
            </a>
          </li>
        `;
      }).join('');

      container.innerHTML = `
        <section class="search-page__results" aria-label="${isEn ? 'Search results' : 'Kết quả tìm kiếm'}">
          <div class="search-page__list-scroll">
            <ul class="search-page__list">
              ${itemsHtml}
            </ul>
          </div>
        </section>
      `;
    } catch (e) {
      console.error('Search page render error:', e);
    }
  }
}

/**
 * 6. Mouse Grab & Touch Drag for Horizontal Scroll Carousels
 */
function initCarousels() {
  const scrollContainers = document.querySelectorAll('.overflow-x-auto');
  scrollContainers.forEach(container => {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    container.addEventListener('mousedown', (e) => {
      isDown = true;
      container.style.cursor = 'grabbing';
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
      isDown = false;
      container.style.cursor = '';
    });

    container.addEventListener('mouseup', () => {
      isDown = false;
      container.style.cursor = '';
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    });
  });
}

/**
 * 6.0. Mobile Slider cho Khám Phá (Nút < >, Dots, Cảm ứng vuốt Touch)
 */
function initExploreSlider() {
  const slider = document.querySelector('.kh-explore-slider');
  if (!slider) return;

  const track = slider.querySelector('.kh-explore-track');
  const slides = slider.querySelectorAll('.kh-explore-slide');
  const prevBtn = slider.querySelector('.kh-explore-prev');
  const nextBtn = slider.querySelector('.kh-explore-next');
  const dots = slider.querySelectorAll('.kh-explore-dot');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;

  function goToSlide(index) {
    if (index < 0) {
      currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.className = 'kh-explore-dot size-2 rounded-full bg-[#b41818] w-6 transition-all duration-300';
      } else {
        dot.className = 'kh-explore-dot size-2 rounded-full bg-stone-300 transition-all duration-300';
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      goToSlide(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      goToSlide(currentIndex + 1);
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      goToSlide(idx);
    });
  });

  // Touch Swipe cảm ứng trên thiết bị di động
  let startX = 0;
  let startY = 0;
  let isSwiping = false;

  track.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isSwiping = true;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isSwiping || !e.changedTouches || e.changedTouches.length === 0) return;
    isSwiping = false;
    const diffX = startX - e.changedTouches[0].clientX;
    const diffY = startY - e.changedTouches[0].clientY;

    // Chỉ kích hoạt lướt slide nếu chuyển động ngang lớn hơn chuyển động dọc
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
      if (diffX > 0) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(currentIndex - 1);
      }
    }
  }, { passive: true });
}

/**
 * 6.1. Infinite Auto-Rotating Carousel for Sự Kiện & Tin Tức (Van Mieu standard)
 */
function initExperienceCarousels() {
  const carousels = document.querySelectorAll('.vm-carousel');
  carousels.forEach(carousel => {
    const track = carousel.querySelector('.vm-carousel-track');
    if (!track) return;
    const items = track.querySelectorAll('.vm-carousel-item');
    if (items.length <= 1) return;

    let currentIndex = 0;
    let autoPlayTimer = null;
    let isPaused = false;
    let isTransitioning = false;

    // Number of original items before duplication (defaults to 4)
    const baseCount = parseInt(carousel.getAttribute('data-base-count') || '4', 10);

    function getItemWidth() {
      if (!items[0]) return 0;
      return items[0].getBoundingClientRect().width;
    }

    function updateSlide(smooth = true) {
      const itemWidth = getItemWidth();
      if (!itemWidth) return;
      track.style.transition = smooth ? 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
      track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
    }

    function nextSlide() {
      if (isTransitioning) return;
      isTransitioning = true;
      currentIndex++;
      updateSlide(true);
    }

    track.addEventListener('transitionend', () => {
      isTransitioning = false;
      // When reaching baseCount (which looks identical to index 0), seamlessly reset to 0
      if (currentIndex >= baseCount) {
        currentIndex = 0;
        updateSlide(false);
      }
    });

    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(() => {
        if (!isPaused && !isTransitioning) {
          nextSlide();
        }
      }, 3500); // Auto next every 3.5s
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    carousel.addEventListener('mouseenter', () => { isPaused = true; });
    carousel.addEventListener('mouseleave', () => { isPaused = false; });
    carousel.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
    carousel.addEventListener('touchend', () => { isPaused = false; }, { passive: true });

    // Touch swipe support
    let touchStartX = 0;
    carousel.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
      }
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) {
            nextSlide();
          } else if (currentIndex > 0) {
            currentIndex--;
            updateSlide(true);
          } else {
            currentIndex = baseCount - 1;
            updateSlide(false);
            requestAnimationFrame(() => updateSlide(true));
          }
        }
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      updateSlide(false);
    });

    // Initialize layout
    setTimeout(() => {
      updateSlide(false);
      startAutoPlay();
    }, 100);
  });
}

/**
 * 7. Header Background & Shadow on Scroll
 */
function initHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('shadow-md');
    } else {
      header.classList.remove('shadow-md');
    }
  });
}

/**
 * 8. Language Tabs Toggle (VI <-> EN) — Full Site & 3D Exhibition Sync
 */
function initLanguageTabs() {
  let enDict = null;
  let enDictPromise = null;
  const originalTextMap = new WeakMap();
  const originalPlaceholderMap = new WeakMap();
  const originalTitle = document.title;
  let isApplying = false;
  let observer = null;
  let observerTimer = null;

  async function loadEnDict() {
    if (enDict) return enDict;
    if (!enDictPromise) {
      enDictPromise = fetch('/js/i18n-en.json?v=3')
        .then(r => (r.ok ? r.json() : {}))
        .then(data => {
          enDict = data || {};
          return enDict;
        })
        .catch(() => {
          enDict = {};
          return enDict;
        });
    }
    return enDictPromise;
  }

  function translateString(text, dict) {
    if (!text) return null;
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized) return null;

    if (Object.prototype.hasOwnProperty.call(dict, normalized)) {
      return dict[normalized];
    }

    // Dynamic patterns (e.g., "Hình ảnh tư liệu (3 ảnh)", "Giai đoạn 2 / 7", "Giai đoạn 2: ...")
    const galleryMatch = normalized.match(/^Hình ảnh tư liệu \((\d+) ảnh\)$/);
    if (galleryMatch) {
      return `Archival Photos (${galleryMatch[1]} ${galleryMatch[1] === '1' ? 'photo' : 'photos'})`;
    }
    const stepMatch = normalized.match(/^Giai đoạn (\d+) \/ (\d+)$/);
    if (stepMatch) {
      return `Stage ${stepMatch[1]} / ${stepMatch[2]}`;
    }
    const stageTitleMatch = normalized.match(/^Giai đoạn (\d+):\s*(.+)$/);
    if (stageTitleMatch) {
      const sub = dict[stageTitleMatch[2].trim()] || stageTitleMatch[2].trim();
      return `Stage ${stageTitleMatch[1]}: ${sub}`;
    }
    const numberedTitleMatch = normalized.match(/^(\d+)\.\s*(.+)$/);
    if (numberedTitleMatch && dict[numberedTitleMatch[2].trim()]) {
      return `${numberedTitleMatch[1]}. ${dict[numberedTitleMatch[2].trim()]}`;
    }

    return null;
  }

  function syncIframeLang(lang) {
    const iframe = document.getElementById('kh-3d-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'kh-3d-lang', lang }, window.location.origin);
    }
    const openFullLink = document.getElementById('kh-3d-open-full');
    if (openFullLink) {
      try {
        const u = new URL(openFullLink.href, window.location.origin);
        u.searchParams.set('lang', lang);
        openFullLink.href = u.pathname + u.search;
      } catch (e) {}
    }
  }

  function applyDomTranslation(lang, dict) {
    if (isApplying) return;
    isApplying = true;
    try {
      const isEn = lang === 'en';

      // Translate document title
      if (isEn) {
        const translatedTitle = translateString(originalTitle, dict);
        if (translatedTitle) document.title = translatedTitle;
      } else {
        document.title = originalTitle;
      }

      // Translate input/textarea placeholders
      document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
        if (!originalPlaceholderMap.has(el)) {
          originalPlaceholderMap.set(el, el.getAttribute('placeholder') || '');
        }
        const origPh = originalPlaceholderMap.get(el);
        if (!isEn) {
          el.setAttribute('placeholder', origPh);
          if (el.classList.contains('header-search-field__input')) {
            el.setAttribute('aria-label', origPh);
          }
        } else {
          const translatedPh =
            origPh === 'Tìm kiếm...'
              ? 'Search...'
              : translateString(origPh, dict);
          if (translatedPh) {
            el.setAttribute('placeholder', translatedPh);
            if (el.classList.contains('header-search-field__input')) {
              el.setAttribute('aria-label', translatedPh);
            }
          }
        }
      });

      // Translate all visible text nodes losslessly
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent) continue;
        const tag = parent.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') continue;

        if (!originalTextMap.has(node)) {
          originalTextMap.set(node, node.nodeValue);
        }
        const orig = originalTextMap.get(node);
        if (!isEn) {
          if (node.nodeValue !== orig) node.nodeValue = orig;
          continue;
        }

        const translated = translateString(orig, dict);
        if (translated !== null) {
          const lead = orig.match(/^\s*/)[0];
          const trail = orig.match(/\s*$/)[0];
          const nextVal = lead + translated + trail;
          if (node.nodeValue !== nextVal) {
            node.nodeValue = nextVal;
          }
        }
      }
    } finally {
      isApplying = false;
    }
  }

  function ensureObserver() {
    if (observer || !window.MutationObserver) return;
    observer = new MutationObserver(() => {
      if (isApplying || getSiteLang() !== 'en' || !enDict) return;
      if (observerTimer) clearTimeout(observerTimer);
      observerTimer = setTimeout(() => {
        if (getSiteLang() === 'en' && enDict) {
          applyDomTranslation('en', enDict);
        }
      }, 60);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  async function applySiteLanguage(lang) {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('lskh_lang', lang);
    } catch (e) {}

    // Update all VI/EN toggle buttons across desktop & mobile drawer
    document.querySelectorAll('.locale-tabs__tab').forEach(tab => {
      const code = tab.textContent.trim().toLowerCase();
      const active = code === lang;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-pressed', active ? 'true' : 'false');
      if (active) {
        tab.setAttribute('aria-current', 'true');
      } else {
        tab.removeAttribute('aria-current');
      }
    });

    if (lang === 'en') {
      const dict = await loadEnDict();
      applyDomTranslation('en', dict);
      ensureObserver();
    } else {
      applyDomTranslation('vi', enDict || {});
    }

    syncIframeLang(lang);
  }

  const tabs = document.querySelectorAll('.locale-tabs__tab');
  tabs.forEach(tab => {
    const activate = () => {
      const targetLang = tab.textContent.trim().toLowerCase();
      if (targetLang === 'en' || targetLang === 'vi') {
        applySiteLanguage(targetLang);
      }
    };
    tab.addEventListener('click', activate);
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });

  // Sync iframe once loaded if user already chose EN
  const iframe = document.getElementById('kh-3d-iframe');
  if (iframe) {
    iframe.addEventListener('load', () => {
      const currentLang = getSiteLang();
      if (currentLang === 'en') {
        syncIframeLang('en');
      }
    });
  }

  // Apply saved language on page load
  const initialLang = getSiteLang();
  if (initialLang === 'en') {
    applySiteLanguage('en');
  }
}

/**
 * Dynamic Header Offset for Subpages
 */
function initHeaderOffset() {
  function adjust() {
    const header = document.querySelector('header.header-shell');
    const bc = document.querySelector('.breadcrumb');
    if (header && bc) {
      const h = header.offsetHeight;
      if (h > 0) {
        bc.style.setProperty('padding-top', (h + 10) + 'px', 'important');
      }
    }
  }
  adjust();
  window.addEventListener('resize', adjust);
  window.addEventListener('load', adjust);
}

/**
 * 9. Partner Logos Carousel (Smooth item-by-item next ticker with exact fit)
 */
function initPartnerLogoCarousel() {
  // Pure CSS hardware-accelerated continuous infinite marquee handles the ticker smoothly
  return;
}

/**
 * 10. Sổ Lưu Bút (Guestbook) - Tự động đồng bộ và lưu vào Google Sheets / Excel
 */
function initGuestbook() {
  const form = document.getElementById('guestbook-form');
  const wishesWall = document.getElementById('wishes-wall');
  if (!form && !wishesWall) return;

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzozjBIlShGF93PzOQT12MzwF2GOMXAZ7L2sWMTQJo2JggcRtR1myYlBgducdV5qonGOA/exec';
  const SCRIPT_TOKEN = 'aB3k9XmQ7vP1wZ5rN8tY2uL4';
  const isEn = document.documentElement.lang === 'en' || window.location.pathname.startsWith('/en');

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  let toastTimer = null;
  function showToast(message, isSuccess = true) {
    let toast = document.getElementById('guestbook-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'guestbook-toast';
      toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;max-width:380px;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:500;box-shadow:0 16px 36px rgba(0,0,0,0.35);transition:all 0.3s ease;opacity:0;transform:translateY(16px);pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.style.backgroundColor = isSuccess ? '#1b4322' : '#7a1212';
    toast.style.border = isSuccess ? '1px solid #6ee7b7' : '1px solid #fca5a5';
    toast.style.color = '#ffffff';
    toast.textContent = message;
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
      toast.style.pointerEvents = 'auto';
    });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(16px)';
      toast.style.pointerEvents = 'none';
    }, 4000);
  }

  function appendWishToWall(name, wish, isNew = true) {
    if (!wishesWall) return;
    const placeholder = wishesWall.querySelector('.guestbook-placeholder');
    if (placeholder) placeholder.remove();

    const wishEl = document.createElement('div');
    wishEl.className = 'guestbook-wish-item';
    wishEl.innerHTML = `
      <div class="guestbook-wish-author font-serif">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b21816" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>
        <span style="word-break:break-word;">${escapeHtml(name)}</span>
      </div>
      <p class="guestbook-wish-message" style="word-break:break-word;">“${escapeHtml(wish)}”</p>
    `;

    if (isNew) {
      wishesWall.prepend(wishEl);
      while (wishesWall.children.length > 5) {
        wishesWall.lastElementChild.remove();
      }
    } else {
      wishesWall.appendChild(wishEl);
    }
  }

  async function loadWishes() {
    if (!wishesWall) return;
    try {
      const res = await fetch(SCRIPT_URL, {
        method: 'GET',
        redirect: 'follow',
      });
      if (!res.ok) throw new Error('Network response not ok');
      const data = await res.json().catch(() => null);
      const list = Array.isArray(data) ? data : (data && Array.isArray(data.wishes) ? data.wishes : []);
      const valid = list.filter((w) => w && w.name && w.wish).slice(0, 5);
      wishesWall.innerHTML = '';
      if (valid.length === 0) {
        wishesWall.innerHTML = `<div class="guestbook-placeholder">${isEn ? 'No wishes yet. Be the first to leave a message!' : 'Chưa có lời chúc nào. Hãy là người đầu tiên để lại lời chúc!'}</div>`;
        return;
      }
      valid.forEach((w) => {
        appendWishToWall(w.name, w.wish, false);
      });
    } catch (e) {
      wishesWall.innerHTML = `<div class="guestbook-placeholder">${isEn ? 'Could not load wishes at this time. Please try again later.' : 'Không thể tải danh sách lời chúc lúc này. Vui lòng thử lại sau.'}</div>`;
    }
  }

  if (form) {
    const nameInput = document.getElementById('guest-name');
    const emailInput = document.getElementById('guest-email');
    const wishInput = document.getElementById('guest-wish');
    const submitBtn = document.getElementById('guestbook-submit-btn');
    let lastSentAt = 0;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = nameInput ? nameInput.value.trim().slice(0, 80) : '';
      const email = emailInput ? emailInput.value.trim().slice(0, 120) : '';
      const wish = wishInput ? wishInput.value.trim().slice(0, 500) : '';

      if (!name || !email || !wish) {
        showToast(isEn ? 'Please fill in your name, email and message.' : 'Vui lòng điền đầy đủ họ tên, email và lời chúc.', false);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast(isEn ? 'Please enter a valid email address.' : 'Vui lòng nhập địa chỉ email hợp lệ.', false);
        return;
      }

      if (Date.now() - lastSentAt < 12000) {
        showToast(isEn ? 'Please wait a few seconds before sending another wish.' : 'Vui lòng đợi ít giây trước khi gửi lời chúc tiếp theo.', false);
        return;
      }

      const origBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>${isEn ? 'Sending wishes...' : 'Đang gửi lời chúc...'}</span>
        `;
      }

      try {
        const res = await fetch(SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ token: SCRIPT_TOKEN, name, email, wish }),
          redirect: 'follow',
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || (data && data.ok === false)) {
          showToast(data.error || (isEn ? 'Could not send your wish. Please try again.' : 'Chưa gửi được lời chúc, vui lòng thử lại.'), false);
          return;
        }

        lastSentAt = Date.now();
        appendWishToWall(name, wish, true);
        form.reset();
        showToast(isEn ? 'Thank you! Your wish has been saved to the guestbook.' : 'Cảm ơn bạn! Lời chúc đã được lưu vào sổ lưu bút và hiển thị thành công.', true);
      } catch (err) {
        showToast(isEn ? 'Could not send wish. Please check your network and try again.' : 'Chưa gửi được lời chúc, vui lòng kiểm tra kết nối mạng và thử lại.', false);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnHtml;
        }
      }
    });
  }

  loadWishes();
}

/**
 * 11. Tranh Dân Gian Kim Hoàng Gallery & Lightbox
 */
function initTranhGallery() {
  const cards = Array.from(document.querySelectorAll('.tranh-card'));
  const lightbox = document.getElementById('tranh-lightbox');
  if (!cards.length || !lightbox) return;

  const imgEl = document.getElementById('tranh-lightbox-img');
  const titleEl = document.getElementById('tranh-lightbox-title');
  const descEl = document.getElementById('tranh-lightbox-desc');
  const counterEl = document.getElementById('tranh-lightbox-counter');
  const prevBtn = document.getElementById('tranh-lightbox-prev');
  const nextBtn = document.getElementById('tranh-lightbox-next');
  const closeBtn = document.getElementById('tranh-lightbox-close');

  let currentIdx = 0;

  function showAt(idx) {
    currentIdx = (idx + cards.length) % cards.length;
    const card = cards[currentIdx];
    const src = card.getAttribute('data-src');
    const alt = card.getAttribute('data-alt') || `Tranh Kim Hoàng ${currentIdx + 1}`;
    const title = card.getAttribute('data-title') || alt;
    const desc = card.getAttribute('data-desc') || '';
    if (imgEl && src) {
      imgEl.src = src;
      imgEl.alt = alt;
    }
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;
    if (counterEl) {
      counterEl.textContent = `${currentIdx + 1} / ${cards.length}`;
    }
  }

  function openLightbox(idx) {
    showAt(idx);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  cards.forEach((card, i) => {
    card.addEventListener('click', () => openLightbox(i));
  });

  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showAt(currentIdx - 1); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showAt(currentIdx + 1); });
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') showAt(currentIdx - 1);
    else if (e.key === 'ArrowRight') showAt(currentIdx + 1);
  });

  let touchX = null;
  lightbox.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) touchX = e.touches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (touchX === null || !e.changedTouches || !e.changedTouches[0]) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) showAt(currentIdx + (dx < 0 ? 1 : -1));
  }, { passive: true });
}

/**
 * 12. Creative Products Gallery, Category Filter & Detail Modal
 */
function initCreativeProducts() {
  const grid = document.getElementById('creative-grid');
  const modal = document.getElementById('creative-modal');
  if (!grid || !modal) return;

  const filterBtns = Array.from(document.querySelectorAll('.creative-filter-btn'));
  const cards = Array.from(grid.querySelectorAll('.creative-card'));
  const closeBtn = document.getElementById('creative-modal-close');
  const imgEl = document.getElementById('creative-modal-img');
  const thumbsEl = document.getElementById('creative-modal-thumbs');
  const authorEl = document.getElementById('creative-modal-author');
  const titleEl = document.getElementById('creative-modal-title');
  const descEl = document.getElementById('creative-modal-desc');
  const linksEl = document.getElementById('creative-modal-links');

  function applyFilter(cat) {
    filterBtns.forEach(b => b.classList.toggle('is-active', b.getAttribute('data-filter') === cat));
    cards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      card.classList.toggle('is-hidden', cat !== 'all' && cardCat !== cat);
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      applyFilter(btn.getAttribute('data-filter') || 'all');
    });
  });

  const urlFilter = new URLSearchParams(window.location.search).get('filter');
  if (urlFilter && filterBtns.some(b => b.getAttribute('data-filter') === urlFilter)) {
    applyFilter(urlFilter);
  }

  function openModal(card) {
    const images = (card.getAttribute('data-images') || '').split('|').filter(Boolean);
    const author = card.getAttribute('data-author') || '';
    const title = card.getAttribute('data-title') || '';
    const desc = card.getAttribute('data-desc') || '';
    let extLinks = [];
    try {
      extLinks = JSON.parse(card.getAttribute('data-links') || '[]');
    } catch (_) {
      extLinks = [];
    }

    if (imgEl && images[0]) {
      imgEl.src = images[0];
      imgEl.alt = title;
    }

    if (thumbsEl) {
      thumbsEl.innerHTML = '';
      if (images.length > 1) {
        images.forEach((src, idx) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'creative-modal__thumb' + (idx === 0 ? ' is-active' : '');
          b.setAttribute('aria-label', `${title} - ảnh ${idx + 1}`);
          const im = document.createElement('img');
          im.src = src;
          im.alt = title;
          b.appendChild(im);
          b.addEventListener('click', () => {
            if (imgEl) imgEl.src = src;
            thumbsEl.querySelectorAll('.creative-modal__thumb').forEach(t => t.classList.remove('is-active'));
            b.classList.add('is-active');
          });
          thumbsEl.appendChild(b);
        });
      }
    }

    if (authorEl) authorEl.textContent = author;
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;

    if (linksEl) {
      linksEl.innerHTML = '';
      extLinks.forEach(item => {
        if (!item || !item.url) return;
        const a = document.createElement('a');
        a.className = 'creative-modal__ext';
        a.href = item.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = item.label || 'Xem thêm';
        linksEl.appendChild(a);
      });
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  cards.forEach(card => {
    const media = card.querySelector('.creative-card__media');
    const btn = card.querySelector('.creative-card__btn');
    if (media) media.addEventListener('click', () => openModal(card));
    if (btn) btn.addEventListener('click', () => openModal(card));
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
}
