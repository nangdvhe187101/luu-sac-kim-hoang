

document.addEventListener('DOMContentLoaded', () => {
  
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const parallaxBg = document.getElementById('parallax-bg');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (parallaxBg) {
          const scrollY = window.scrollY;
          parallaxBg.style.transform = `translate3d(0, ${Math.min(scrollY * 0.08, 80)}px, 0)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  const envelopeCard = document.getElementById('envelope-card');
  const letterModal = document.getElementById('letter-modal');
  const letterCloseBtn = document.getElementById('letter-close-btn');
  const startJourneyBtn = document.getElementById('start-journey-btn');
  const quickLetterBtn = document.getElementById('quick-letter-btn');

  let letterOpener = null;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let cancelPendingOpen = null;

  function showLetter() {
    if (!letterModal) return;
    const scroller = letterModal.querySelector('.letter-scroll');
    if (scroller) scroller.scrollTop = 0;
    letterModal.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
    if (letterCloseBtn) letterCloseBtn.focus();
  }

  function openLetter() {
    if (cancelPendingOpen) return;
    letterOpener = document.activeElement;
    playChimeSound();

    const heritageStage = document.getElementById('heritage-stage');
    if (heritageStage) {
      heritageStage.classList.add('is-invitation-opened');
    }

    const sheet = envelopeCard && envelopeCard.querySelector('.envelope-sheet');
    if (!envelopeCard || !sheet || prefersReducedMotion.matches) {
      showLetter();
      return;
    }

    envelopeCard.classList.add('is-opened');
    const onEnd = (e) => {
      if (e.propertyName === 'transform') finish();
    };
    
    const timer = setTimeout(() => finish(), 2000);

    function cancel() {
      clearTimeout(timer);
      sheet.removeEventListener('transitionend', onEnd);
      cancelPendingOpen = null;
    }
    function finish() {
      cancel();
      showLetter();
    }

    cancelPendingOpen = cancel;
    sheet.addEventListener('transitionend', onEnd);
  }

  function closeLetter() {
    if (cancelPendingOpen) cancelPendingOpen();
    if (letterModal) {
      const wasVisible = letterModal.classList.contains('is-visible');
      letterModal.classList.remove('is-visible');
      document.body.style.overflow = '';
      if (wasVisible && letterOpener && typeof letterOpener.focus === 'function') {
        letterOpener.focus();
      }
    }
    if (envelopeCard) {
      envelopeCard.classList.remove('is-opened');
    }
    const heritageStage = document.getElementById('heritage-stage');
    if (heritageStage) {
      heritageStage.classList.remove('is-invitation-opened');
    }
  }

  if (envelopeCard) {
    envelopeCard.addEventListener('click', openLetter);
    envelopeCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLetter();
      }
    });
  }

  const envelopeCTABtn = document.getElementById('envelope-cta-btn');
  if (envelopeCTABtn) {
    envelopeCTABtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const storylineSection = document.getElementById('storyline');
      if (storylineSection) {
        closeLetter();
        setTimeout(() => {
          storylineSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
      }
    });
  }

  const parallaxStage = document.getElementById('heritage-stage');
  if (parallaxStage) {
    const depthLayers = Array.from(parallaxStage.querySelectorAll('[data-depth]'));
    const PARALLAX_RANGE = 60; 
    let parallaxFrame = null;

    function applyParallax(nx, ny) {
      depthLayers.forEach((el) => {
        const depth = parseFloat(el.dataset.depth) || 0;
        el.style.setProperty('--px', `${(nx * depth * PARALLAX_RANGE).toFixed(2)}px`);
        el.style.setProperty('--py', `${(ny * depth * PARALLAX_RANGE).toFixed(2)}px`);
      });
    }

    parallaxStage.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || prefersReducedMotion.matches) return;
      if (parallaxFrame) return;
      const { clientX, clientY } = e;
      parallaxFrame = requestAnimationFrame(() => {
        const rect = parallaxStage.getBoundingClientRect();
        const nx = ((clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((clientY - rect.top) / rect.height - 0.5) * 2;
        applyParallax(nx, ny);
        parallaxFrame = null;
      });
    });

    parallaxStage.addEventListener('pointerleave', () => applyParallax(0, 0));
  }

  const revealElements = document.querySelectorAll('[data-scroll-reveal]');

  if (revealElements.length > 0 && !prefersReducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.scrollDelay || '0';
          el.style.setProperty('--scroll-delay', delay);

          const delayMs = parseInt(delay, 10);
          setTimeout(() => {
            el.classList.add('is-revealed');
          }, delayMs);

          revealObserver.unobserve(el);
        }
      });
    }, {
      root: null, 
      rootMargin: '0px 0px -10% 0px', 
      threshold: 0.15 
    });

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  const navToggleBtn = document.getElementById('nav-toggle-btn');
  const siteNav = document.getElementById('site-nav');

  function setNavOpen(open) {
    if (!siteNav || !navToggleBtn) return;
    siteNav.classList.toggle('is-open', open);
    navToggleBtn.setAttribute('aria-expanded', String(open));
    navToggleBtn.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
  }

  if (navToggleBtn && siteNav) {
    navToggleBtn.addEventListener('click', () => {
      setNavOpen(!siteNav.classList.contains('is-open'));
    });
    siteNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setNavOpen(false));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setNavOpen(false);
    });
  }

  if (letterCloseBtn) letterCloseBtn.addEventListener('click', closeLetter);
  
  if (quickLetterBtn) {
    quickLetterBtn.addEventListener('click', () => {
      letterOpener = document.activeElement;
      showLetter();
    });
  }

  if (letterModal) {
    letterModal.addEventListener('click', (e) => {
      if (e.target === letterModal) closeLetter();
    });
  }

  if (startJourneyBtn) {
    startJourneyBtn.addEventListener('click', () => {
      closeLetter();
      const storylineSection = document.getElementById('storyline');
      if (storylineSection) {
        storylineSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  const OPEN_SOUND = 'gong';

  function playTone(ctx, freq, start, duration, peak, type = 'sine') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  function playChimeSound() {
    if (OPEN_SOUND === 'none') return;
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;

      if (OPEN_SOUND === 'mo') {
        
        playTone(ctx, 820, t, 0.14, 0.18, 'triangle');
        playTone(ctx, 780, t + 0.22, 0.14, 0.14, 'triangle');
        return;
      }

      const base = 196;
      [[1, 0.16, 3.2], [2.01, 0.08, 2.4], [2.76, 0.05, 1.8], [5.4, 0.025, 1.0]].forEach(([ratio, peak, dur]) => {
        playTone(ctx, base * ratio, t, dur, peak);
      });
    } catch (e) {}
  }

  const chapters = [
    {
      id: 'chapter-1',
      title: 'Khởi Sắc Năm 1701',
      text: 'Vào năm Chính Hòa thứ 22, năm 1701, người dân hai làng Kim Bảng và Hoàng Bảng từ Thanh Hóa di cư ra Bắc, cùng nhau lập nên làng Kim Hoàng ở phía tây thành Thăng Long. Nhận thấy tranh Đông Hồ chỉ đủ phục vụ mạn Hà Bắc, Hải Dương, còn tranh Hàng Trống lại quá đắt đỏ, hai dòng họ Nguyễn Sỹ và Nguyễn Thế đã quyết tâm sáng tạo một dòng tranh mới, kết hợp tinh hoa của cả hai nơi. Cứ mỗi độ giáp Tết, khắp làng lại rộn rã tiếng cười, người dân tất bật thâu đêm chong đèn chấm màu rồi gánh tranh đi bán khắp các phiên chợ đón xuân.',
    },
    {
      id: 'chapter-2',
      title: 'Ký Ức Gánh Tranh Của Cha',
      text: 'Cụ Trần Sơn Phương, hậu duệ người làng tranh xúc động nhớ lại: Cụ thân sinh tôi làm nghề buôn tranh, cứ Tết đến lại đón hàng mang bán khắp vùng. Tranh Kim Hoàng ngày ấy là thứ không thể thiếu trong mỗi gia đình, nên hàng lấy ngày nào, bán hết ngay ngày đó. Chiều về, gánh trên vai cha nhẹ bẫng, mấy anh em tôi hớn hở chạy theo, đòi cha cho đu bám dây quang.',
    },
    {
      id: 'chapter-3',
      title: 'Đại Hạn Vỡ Đê Năm 1915',
      text: 'Thế nhưng, năm Ất Mão đời vua Duy Tân, tức năm 1915, trận đại hồng thủy do vỡ đê Liên Mạc đã làm ngập cả vùng Tây Hà Nội, cuốn trôi sạch kho ván mộc quý báu của làng. Nghề làm tranh từ đó suy giảm nặng nề. Đến năm 1945, chiến tranh và nạn đói khiến các ván in còn lại đành phải bán đi. Đến cuối những năm 50 của thế kỷ trước, phong trào bài trừ mê tín dị đoan đã khiến những ván in cổ bị chẻ làm củi đun. Cứ thế, Kim Hoàng mất hẳn một dòng tranh dân gian rực rỡ, tưởng chừng đã vĩnh viễn lùi sâu vào dĩ vãng.',
    },
    {
      id: 'chapter-4',
      title: 'Tia Sáng Paris',
      text: 'Tưởng chừng số phận dòng tranh đã chấm dứt, nhưng nhà nghiên cứu người Pháp Maurice Durand đã từng sưu tầm tranh thờ và tranh Tết ở Bắc Bộ, lưu trữ tại Viện Viễn Đông Bác Cổ. Năm 1960, cuốn sách Tranh Dân Gian Việt Nam của ông được xuất bản tại Paris. Đến năm 2011, cuốn sách được tái bản với đầy đủ hình in màu minh họa. Qua đối chiếu phong cách và sắc đỏ cam đặc trưng, các nhà nghiên cứu xác nhận có tới 58 bức tranh dân gian Kim Hoàng. Đây chính là chiếc chìa khóa định mệnh mở ra hy vọng phục hồi dòng tranh đã mất.',
    },
    {
      id: 'chapter-5',
      title: 'Hành Trình Đến Làng Tìm Lại Nốt Son',
      text: 'Không cam tâm để dòng tranh chỉ tồn tại trên trang sách, năm 2015, Tiến sĩ Nguyễn Thị Thu Hòa đã khởi xướng dự án phục hồi tranh dân gian Kim Hoàng. Nhóm nghiên cứu đã về làng và may mắn gặp được cụ Trần Thị Liên, người bán tranh cuối cùng vào năm 1947. Cụ cùng các bô lão trong làng đã cùng thống nhất: sắc đỏ cam trên giấy xuyến chỉ chính là màu sắc chuẩn xác nhất của tranh Kim Hoàng xưa.',
    },
    {
      id: 'chapter-6',
      title: 'Kỹ Nghệ Gian Truân',
      text: 'Quá trình phục hồi là một hành trình gian nan cùng cực. Nhóm nghiên cứu đã làm hỏng hơn 700 tờ giấy dó mới tìm ra cách nhuộm phẳng giấy xuyến chỉ dưới nắng nhẹ; người thợ phải dùng tới 40 loại đục để đục lại ván mộc gỗ thị mềm dẻo, tái hiện nét khắc đanh thép và tinh xảo hơn cả Đông Hồ.',
    },
    {
      id: 'chapter-7',
      title: 'Nốt Đỏ Trở Lại Đương Đại',
      text: 'Dự án đã phục dựng thành công 33 mẫu mộc bản và 19 mẫu vẽ tay. Nghệ nhân Đào Đình Chung nay đã có thể tự nuôi sống mình bằng chính nghề làm tranh truyền thống. Cùng với sự chung tay của thế hệ trẻ qua các triển lãm như Nốt Đỏ, sắc đỏ Kim Hoàng đã chính thức thức giấc, đàng hoàng bước vào đời sống đương đại.',
    },
  ];

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  const storyNodes = document.querySelectorAll('.story-node');

  function updateActiveChapterVisual(index) {
    storyNodes.forEach((node, i) => {
      if (i === index) {
        node.classList.add('is-reading');
      } else {
        node.classList.remove('is-reading');
      }
    });
  }

  const coverGate = document.getElementById('cover-gate');
  const coverOpenBtn = document.getElementById('cover-open-btn');

  function openCover() {
    if (!coverGate || coverGate.classList.contains('is-opening')) return;
    playChimeSound();
    coverGate.classList.add('is-opening');
    document.body.classList.remove('cover-locked');
    window.scrollTo({ top: 0, behavior: 'instant' });

    const removeDelay = prefersReducedMotion.matches ? 50 : 1800;
    setTimeout(() => coverGate.remove(), removeDelay);
  }

  if (coverOpenBtn) {
    coverOpenBtn.addEventListener('click', openCover);
    coverOpenBtn.focus();
  }

  storyNodes.forEach((node, idx) => {
    node.addEventListener('click', () => {
      updateActiveChapterVisual(idx);
    });
  });

  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxCounter = document.getElementById('lightbox-counter');

  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');
  const galleryList = Array.from(galleryItems);
  let lightboxIndex = 0;
  let lightboxOpener = null;

  function getSiteLang() {
    return document.documentElement.getAttribute('data-site-lang') === 'en' ? 'en' : 'vi';
  }

  function getItemCaption(item) {
    if (!item) return '';
    if (getSiteLang() === 'en') {
      return item.getAttribute('data-caption-en') || item.getAttribute('data-caption') || '';
    }
    return item.getAttribute('data-caption') || '';
  }

  function showLightboxAt(index) {
    if (!lightboxModal || !lightboxImg || galleryList.length === 0) return;
    lightboxIndex = (index + galleryList.length) % galleryList.length;
    const item = galleryList[lightboxIndex];
    const thumb = item.querySelector('img');
    lightboxImg.src = item.getAttribute('data-full-src');
    lightboxImg.alt = thumb ? thumb.alt : '';
    lightboxCaption.textContent = getItemCaption(item);
    if (lightboxCounter) {
      lightboxCounter.textContent = `${lightboxIndex + 1} / ${galleryList.length}`;
    }
  }

  function openLightbox(index, opener) {
    if (!lightboxModal) return;
    lightboxOpener = opener || null;
    showLightboxAt(index);
    lightboxModal.classList.add('is-active');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lightboxCloseBtn) lightboxCloseBtn.focus();
  }

  function closeLightbox() {
    if (!lightboxModal || !lightboxModal.classList.contains('is-active')) return;
    lightboxModal.classList.remove('is-active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lightboxOpener) lightboxOpener.focus();
  }

  const coverflowEl = document.getElementById('coverflow');
  const coverflowCaption = document.getElementById('coverflow-caption');
  const coverflowCounter = document.getElementById('coverflow-counter');
  let coverflowIndex = 0;

  function layoutCoverflow() {
    const count = galleryList.length;
    const stageWidth = coverflowEl ? coverflowEl.clientWidth : 0;
    const narrow = stageWidth < 640;
    const stepX = narrow ? 0.34 : 0.3; 
    const itemWidth = galleryList[0] ? galleryList[0].offsetWidth : 300;

    galleryList.forEach((item, i) => {
      
      let offset = i - coverflowIndex;
      if (offset > count / 2) offset -= count;
      if (offset < -count / 2) offset += count;

      const abs = Math.abs(offset);
      const visible = abs <= (narrow ? 2 : 3);
      const sign = Math.sign(offset);
      const x = offset === 0 ? 0 : sign * itemWidth * (0.62 + (abs - 1) * stepX);
      const rotate = offset === 0 ? 0 : -sign * 52;
      const scale = offset === 0 ? 1 : Math.max(0.55, 0.86 - (abs - 1) * 0.14);
      const depth = offset === 0 ? 0 : -140 - (abs - 1) * 90;

      item.style.transform =
        `translate(-50%, -50%) translateX(${x}px) translateZ(${depth}px) rotateY(${rotate}deg) scale(${scale})`;
      item.style.zIndex = String(100 - abs);
      item.style.opacity = visible ? String(offset === 0 ? 1 : Math.max(0.25, 0.7 - (abs - 1) * 0.22)) : '0';
      item.style.pointerEvents = visible ? 'auto' : 'none';
      item.classList.toggle('is-active', offset === 0);
      item.setAttribute('aria-hidden', visible ? 'false' : 'true');
      item.tabIndex = offset === 0 ? 0 : -1;
    });

    const current = galleryList[coverflowIndex];
    if (coverflowCaption && current) coverflowCaption.textContent = getItemCaption(current);
    if (coverflowCounter) coverflowCounter.textContent = `${coverflowIndex + 1} / ${count}`;
  }

  const langToggleBtn = document.getElementById('lang-toggle-btn');

  function applyLanguage(lang) {
    const nextLang = lang === 'en' ? 'en' : 'vi';
    document.documentElement.setAttribute('data-site-lang', nextLang);
    document.documentElement.setAttribute('lang', nextLang);
    document.querySelectorAll('[data-placeholder-vi]').forEach((el) => {
      const ph = el.getAttribute(nextLang === 'en' ? 'data-placeholder-en' : 'data-placeholder-vi');
      if (ph !== null) el.setAttribute('placeholder', ph);
    });
    const current = galleryList[coverflowIndex];
    if (coverflowCaption && current) {
      coverflowCaption.textContent = getItemCaption(current);
    }
    if (lightboxModal && lightboxModal.classList.contains('is-active') && galleryList[lightboxIndex]) {
      lightboxCaption.textContent = getItemCaption(galleryList[lightboxIndex]);
    }
    try {
      sessionStorage.setItem('kim_hoang_lang', nextLang);
    } catch (e) {}
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      applyLanguage(getSiteLang() === 'vi' ? 'en' : 'vi');
    });
  }

  try {
    const savedLang = sessionStorage.getItem('kim_hoang_lang');
    if (savedLang === 'en' || savedLang === 'vi') {
      applyLanguage(savedLang);
    }
  } catch (e) {}

  function setCoverflow(index) {
    const count = galleryList.length;
    if (!coverflowEl || count === 0) return;
    coverflowIndex = (index + count) % count;
    layoutCoverflow();
  }

  if (coverflowEl) {
    const prevBtn = document.getElementById('coverflow-prev');
    const nextBtn = document.getElementById('coverflow-next');
    if (prevBtn) prevBtn.addEventListener('click', () => setCoverflow(coverflowIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => setCoverflow(coverflowIndex + 1));

    window.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (lightboxModal && lightboxModal.classList.contains('is-active')) return;
      const rect = coverflowEl.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.3;
      if (!inView) return;
      setCoverflow(coverflowIndex + (e.key === 'ArrowRight' ? 1 : -1));
    });

    const DRAG_STEP_PX = 70;
    let dragStartX = null;
    let dragLastStepX = 0;
    let dragMoved = false;

    coverflowEl.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.target.closest('.coverflow-btn')) return;
      dragStartX = e.clientX;
      dragLastStepX = e.clientX;
      dragMoved = false;
      coverflowEl.classList.add('is-dragging');
    });

    coverflowEl.addEventListener('pointermove', (e) => {
      if (dragStartX === null) return;
      if (Math.abs(e.clientX - dragStartX) > 8) dragMoved = true;
      if (!dragMoved) return;
      
      while (e.clientX - dragLastStepX <= -DRAG_STEP_PX) {
        dragLastStepX -= DRAG_STEP_PX;
        setCoverflow(coverflowIndex + 1);
      }
      while (e.clientX - dragLastStepX >= DRAG_STEP_PX) {
        dragLastStepX += DRAG_STEP_PX;
        setCoverflow(coverflowIndex - 1);
      }
    });

    const endDrag = () => {
      if (dragStartX === null) return;
      dragStartX = null;
      coverflowEl.classList.remove('is-dragging');
      
      setTimeout(() => { dragMoved = false; }, 0);
    };
    coverflowEl.addEventListener('pointerup', endDrag);
    coverflowEl.addEventListener('pointercancel', endDrag);
    coverflowEl.addEventListener('pointerleave', endDrag);

    coverflowEl.addEventListener('click', (e) => {
      if (dragMoved) {
        e.stopPropagation();
        e.preventDefault();
      }
    }, true);

    coverflowEl.addEventListener('dragstart', (e) => e.preventDefault());

    window.addEventListener('resize', layoutCoverflow, { passive: true });
    layoutCoverflow();
  }

  galleryList.forEach((item, idx) => {
    
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('click', () => {
      
      if (coverflowEl && idx !== coverflowIndex) {
        setCoverflow(idx);
        return;
      }
      openLightbox(idx, item);
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (coverflowEl && idx !== coverflowIndex) {
          setCoverflow(idx);
          return;
        }
        openLightbox(idx, item);
      }
    });
  });

  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', () => showLightboxAt(lightboxIndex - 1));
  if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', () => showLightboxAt(lightboxIndex + 1));

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);

  let touchStartX = null;
  if (lightboxModal) {
    lightboxModal.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightboxModal.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(deltaX) < 50) return;
      showLightboxAt(lightboxIndex + (deltaX < 0 ? 1 : -1));
    }, { passive: true });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  window.addEventListener('keydown', (e) => {
    const lightboxOpen = lightboxModal && lightboxModal.classList.contains('is-active');
    if (e.key === 'Escape') {
      closeLightbox();
      if (letterModal && letterModal.classList.contains('is-visible')) closeLetter();
    } else if (lightboxOpen && e.key === 'ArrowLeft') {
      showLightboxAt(lightboxIndex - 1);
    } else if (lightboxOpen && e.key === 'ArrowRight') {
      showLightboxAt(lightboxIndex + 1);
    }
  });

  const guestbookForm = document.getElementById('guestbook-form');
  const guestNameInput = document.getElementById('guest-name');
  const guestEmailInput = document.getElementById('guest-email');
  const guestWishInput = document.getElementById('guest-wish');
  const wishesWall = document.getElementById('wishes-wall');
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxEBqRF5o1O50-HCIZUE6YuHrw6rCO5o-R7id8-Lf7HOpZW2AAqO9jfb_98q34yWE1ocg/exec';
  const SCRIPT_TOKEN = 'aB3k9XmQ7vP1wZ5rN8tY2uL4';

  try {
    localStorage.removeItem('kim_hoang_wishes');
  } catch (e) {}

  async function loadWishes() {
    if (!wishesWall) return;
    try {
      const res = await fetch(SCRIPT_URL, {
        method: 'GET',
        redirect: 'follow',
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      const list = Array.isArray(data) ? data : (data && Array.isArray(data.wishes) ? data.wishes : []);
      wishesWall.innerHTML = '';
      list.forEach((w) => {
        if (w && w.name && w.wish) {
          appendWishToWall(w.name, w.wish, false);
        }
      });
    } catch (e) {}
  }

  function appendWishToWall(name, wish, isNew = true) {
    if (!wishesWall) return;
    const wishEl = document.createElement('div');
    wishEl.className = 'wish-item';
    wishEl.innerHTML = `
      <div class="wish-author">
        <i data-lucide="sparkle" style="width: 14px; height: 14px; color: var(--color-gold-light);"></i>
        <span>${escapeHtml(name)}</span>
      </div>
      <p class="wish-message">“${escapeHtml(wish)}”</p>
    `;

    if (isNew) {
      wishesWall.prepend(wishEl);
    } else {
      wishesWall.appendChild(wishEl);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  let toastTimer = null;
  function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3500);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  if (guestbookForm) {
    const submitBtn = guestbookForm.querySelector('button[type="submit"]');

    guestbookForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = guestNameInput.value.trim();
      const email = guestEmailInput.value.trim();
      const wish = guestWishInput.value.trim();

      if (!name || !email || !wish) return;

      if (submitBtn) submitBtn.disabled = true;
      try {
        const res = await fetch(SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ token: SCRIPT_TOKEN, name, email, wish }),
          redirect: 'follow',
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || (data && data.ok === false)) {
          showToast(
            data.error ||
              (getSiteLang() === 'en'
                ? 'Could not send your message. Please try again.'
                : 'Chưa gửi được lời chúc, vui lòng thử lại.')
          );
          return;
        }

        appendWishToWall(name, wish, true);
        guestbookForm.reset();
        showToast(
          getSiteLang() === 'en'
            ? 'Thank you! Your message has been sent to Luu Sac Kim Hoang.'
            : 'Cảm ơn bạn! Lời chúc đã được gửi đến Lưu Sắc Kim Hoàng.'
        );
      } catch (err) {
        showToast(
          getSiteLang() === 'en'
            ? 'Could not send your message. Please check your connection and try again.'
            : 'Chưa gửi được lời chúc, vui lòng kiểm tra kết nối và thử lại.'
        );
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    loadWishes();
  }

  const blessingPaintings = [
    {
      src: 'tranh/phuong-mua.jpeg',
      name: 'Phượng Múa',
      title: 'LINH ĐIỂU PHƯỢNG MÚA • 2026',
      line1: 'Cao Quý Cát Tường • Gia Đạo Thái Bình',
      line2: 'Điềm Lành Hội Tụ • Phúc Lộc Viên Mãn',
    },
    {
      src: 'tranh/ngua-vang.jpeg',
      name: 'Ngựa Vàng',
      title: 'MÃ ĐÁO THÀNH CÔNG • 2026',
      line1: 'Công Danh Hanh Thông • Vạn Sự Thành Đạt',
      line2: 'Chí Lớn Vươn Xa • Lộc Tài Rộng Mở',
    },
    {
      src: 'tranh/ga-trong-than-ke.jpeg',
      name: 'Gà Trống Thần Kê',
      title: 'THẦN KÊ ĐẠI CÁT • 2026',
      line1: 'Trấn Trạch Bình An • Đón Ánh Thái Dương',
      line2: 'Vạn Sự Hanh Thông • An Khang Thịnh Vượng',
    },
    {
      src: 'tranh/rong-vang.jpeg',
      name: 'Rồng Vàng',
      title: 'KIM LONG HIỂN THÁNH • 2026',
      line1: 'Mưa Thuận Gió Hòa • Hưng Thịnh Bền Lâu',
      line2: 'Khí Thế Vươn Cao • Phúc Lộc Dồi Dào',
    },
    {
      src: 'tranh/vo-tuong.jpeg',
      name: 'Võ Tướng',
      title: 'THẦN TƯỚNG TRẤN TRẠCH • 2026',
      line1: 'Gia Môn Vững Chãi • Bốn Mùa Bình An',
      line2: 'Oai Phong Vững Vàng • Tai Qua Nạn Khỏi',
    },
    {
      src: 'tranh/tien-loc-tien-tai.jpeg',
      name: 'Tiến Lộc Tiến Tài',
      title: 'TIẾN LỘC TIẾN TÀI • 2026',
      line1: 'Tài Lộc Dồi Dào • Phú Quý Vinh Hoa',
      line2: 'Phúc Thọ An Khang • Vạn Sự Như Ý',
    },
    {
      src: 'tranh/tre-em-hai-chuoi.jpeg',
      name: 'Trẻ Em Hái Chuối',
      title: 'SUM VẦY NO ĐỦ • 2026',
      line1: 'Gia Đình Hòa Thuận • Con Cháu Thảo Hiền',
      line2: 'Niềm Vui Đong Đầy • Ấm No Hạnh Phúc',
    },
    {
      src: 'tranh/muc-dong-cuoi-trau.jpeg',
      name: 'Mục Đồng Cưỡi Trâu',
      title: 'THANH BÌNH AN LẠC • 2026',
      line1: 'Tâm An Tự Tại • Đời Sống Thảnh Thơi',
      line2: 'Mùa Màng Bội Thu • Phúc Lành Ngập Tràn',
    },
    {
      src: 'tranh/ngua-trang.jpeg',
      name: 'Ngựa Trắng',
      title: 'BẠCH MÃ KHỞI HÀNH • 2026',
      line1: 'Thuận Buồm Xuôi Gió • Sự Nghiệp Thăng Hoa',
      line2: 'Vững Bước Đường Xa • Công Thành Danh Toại',
    },
    {
      src: 'tranh/ho-me-con.jpeg',
      name: 'Hổ Mẹ Con',
      title: 'MẪU TỬ BÌNH AN • 2026',
      line1: 'Sức Khỏe Dồi Dào • Vững Vàng Che Chở',
      line2: 'Gia Đạo Hòa Vui • Vạn Điều May Mắn',
    },
    {
      src: 'tranh/nguoi-cuoi-rong.jpeg',
      name: 'Người Cưỡi Rồng',
      title: 'LONG VÂN HỘI NGỘ • 2026',
      line1: 'Vận Hội Thăng Hoa • Bay Cao Vươn Xa',
      line2: 'Cát Tinh Chiếu Mệnh • Vạn Sự Hanh Thông',
    },
    {
      src: 'tranh/ga-trong-cat-tuong.jpeg',
      name: 'Gà Trống Cát Tường',
      title: 'NGŨ ĐỨC CÁT TƯỜNG • 2026',
      line1: 'Văn Võ Dũng Nhân • Trọn Vẹn Chữ Tín',
      line2: 'Khởi Đầu Tốt Đẹp • Phúc Lộc Trường Tồn',
    },
  ];

  let lastBlessingIdx = -1;
  const downloadBtn = document.getElementById('download-blessing-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      let idx = Math.floor(Math.random() * blessingPaintings.length);
      if (blessingPaintings.length > 1 && idx === lastBlessingIdx) {
        idx = (idx + 1 + Math.floor(Math.random() * (blessingPaintings.length - 1))) % blessingPaintings.length;
      }
      lastBlessingIdx = idx;
      const item = blessingPaintings[idx];

      try {
        await Promise.all([
          document.fonts.load('bold 68px "DFVN Bropella"', 'LƯU SẮC KIM HOÀNG'),
          document.fonts.load('italic 38px "Asap"', 'Chạm Sắc Son'),
          document.fonts.load('bold 48px "DFVN Bropella"', item.title),
          document.fonts.load('38px "Asap"', item.line1),
        ]);
      } catch (e) {}

      const loadPainting = (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        });

      const paintingImg = await loadPainting(item.src);

      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = 1080;
      offscreenCanvas.height = 1920;
      const offCtx = offscreenCanvas.getContext('2d');

      const rootStyle = getComputedStyle(document.documentElement);
      const token = (name) => rootStyle.getPropertyValue(name).trim();

      const gradient = offCtx.createLinearGradient(0, 0, 0, 1920);
      gradient.addColorStop(0, token('--bg-1') || '#4a0607');
      gradient.addColorStop(0.5, token('--bg-2') || '#6e0b0d');
      gradient.addColorStop(1, token('--bg-3') || '#2e0304');
      offCtx.fillStyle = gradient;
      offCtx.fillRect(0, 0, 1080, 1920);

      offCtx.strokeStyle = token('--color-gold') || '#d4a23a';
      offCtx.lineWidth = 14;
      offCtx.strokeRect(40, 40, 1000, 1840);
      offCtx.lineWidth = 2;
      offCtx.strokeRect(64, 64, 952, 1792);

      offCtx.fillStyle = token('--color-gold-light') || '#ffd56b';
      offCtx.textAlign = 'center';
      offCtx.font = 'bold 68px "DFVN Bropella", "Asap", serif';
      offCtx.fillText('LƯU SẮC KIM HOÀNG', 540, 210);

      offCtx.fillStyle = token('--color-cream') || '#fff5e1';
      offCtx.font = 'italic 38px "Asap", sans-serif';
      offCtx.fillText('“Chạm Sắc Son, Lưu Dấu Người...”', 540, 290);

      if (paintingImg && paintingImg.width && paintingImg.height) {
        const maxW = 740;
        const maxH = 840;
        const scale = Math.min(maxW / paintingImg.width, maxH / paintingImg.height);
        const drawW = Math.round(paintingImg.width * scale);
        const drawH = Math.round(paintingImg.height * scale);
        const drawX = Math.round((1080 - drawW) / 2);
        const drawY = Math.round(350 + (maxH - drawH) / 2);

        offCtx.fillStyle = 'rgba(20, 4, 4, 0.45)';
        offCtx.fillRect(drawX - 18, drawY - 18, drawW + 36, drawH + 36);
        offCtx.strokeStyle = token('--color-gold-light') || '#ffd56b';
        offCtx.lineWidth = 6;
        offCtx.strokeRect(drawX - 14, drawY - 14, drawW + 28, drawH + 28);
        offCtx.drawImage(paintingImg, drawX, drawY, drawW, drawH);
      }

      offCtx.fillStyle = token('--color-gold-light') || '#ffd56b';
      offCtx.font = 'bold 48px "DFVN Bropella", "Asap", serif';
      offCtx.fillText(item.title, 540, 1340);

      offCtx.fillStyle = token('--color-gold') || '#d4a23a';
      offCtx.font = 'italic 34px "Asap", sans-serif';
      offCtx.fillText(`Tranh dân gian Kim Hoàng: ${item.name}`, 540, 1410);

      offCtx.fillStyle = token('--color-paper-warm') || '#f8e6c1';
      offCtx.font = '38px "Asap", sans-serif';
      offCtx.fillText(item.line1, 540, 1515);
      offCtx.fillText(item.line2, 540, 1585);

      offCtx.fillStyle = token('--color-gold-light') || '#ffd56b';
      offCtx.font = '30px "Asap", sans-serif';
      offCtx.fillText('Tranh Đỏ Thăng Long Ngàn Năm', 540, 1730);

      const link = document.createElement('a');
      link.download = `Loc-Do-Kim-Hoang-${item.src.split('/').pop().replace('.jpeg', '')}.png`;
      link.href = offscreenCanvas.toDataURL('image/png');
      link.click();
    });
  }
});
