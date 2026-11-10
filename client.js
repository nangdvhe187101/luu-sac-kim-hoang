

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

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  const storyNodes = document.querySelectorAll('.story-node');
  const narrationSegments = Array.from(document.querySelectorAll('.narration-segment'));
  const narrationDock = document.getElementById('narration-dock');
  const dockPlayBtn = document.getElementById('dock-play-btn');
  const dockBgmBtn = document.getElementById('dock-bgm-btn');
  const dockStatus = document.getElementById('dock-status');
  const dockSpeedBtn = document.getElementById('dock-speed-btn');

  const BGM_VOL_NORMAL = 0.30;
  const BGM_VOL_DUCKED = 0.30;
  const bgmAudio = new Audio('assets/audio/nhac-nen.m4a?v=5');
  bgmAudio.loop = true;
  bgmAudio.preload = 'auto';
  bgmAudio.volume = BGM_VOL_NORMAL;
  let bgmUserMuted = false;
  let bgmFadeRaf = null;

  function fadeBgmVolume(targetVol) {
    if (bgmFadeRaf) cancelAnimationFrame(bgmFadeRaf);
    bgmAudio.volume = Math.max(0, Math.min(1, targetVol));
  }

  function syncBgmDucking() {
    bgmAudio.volume = BGM_VOL_DUCKED;
  }

  const narrationTracks = [
    {
      src: 'assets/audio/bang-1.m4a',
      chapterIndex: 0,
      blockIndex: 0,
      labelVi: 'Phần 1 / 7 • Khởi nguồn 1701',
      labelEn: 'Part 1 / 7 • Origins 1701',
    },
    {
      src: 'assets/audio/bang-2.m4a',
      chapterIndex: 1,
      blockIndex: 1,
      labelVi: 'Phần 2 / 7 • Biến cố 1915 – 1950s',
      labelEn: 'Part 2 / 7 • 1915 – 1950s',
    },
    {
      src: 'assets/audio/bang-3.m4a',
      chapterIndex: 2,
      blockIndex: 2,
      labelVi: 'Phần 3 / 7 • Tư liệu 1960 – 2013',
      labelEn: 'Part 3 / 7 • Archives 1960 – 2013',
    },
    {
      src: 'assets/audio/bang-4.m4a',
      chapterIndex: 3,
      blockIndex: 3,
      labelVi: 'Phần 4 / 7 • Dự án phục hồi 2015',
      labelEn: 'Part 4 / 7 • Revival Project 2015',
    },
    {
      src: 'assets/audio/bang-5a.m4a',
      chapterIndex: 4,
      blockIndex: 4,
      labelVi: 'Phần 5a / 7 • Nghiên cứu màu & giấy',
      labelEn: 'Part 5a / 7 • Colours & Paper',
    },
    {
      src: 'assets/audio/bang-5b.m4a',
      chapterIndex: 4,
      blockIndex: 5,
      labelVi: 'Phần 5b / 7 • Khắc mộc bản & nhuộm giấy',
      labelEn: 'Part 5b / 7 • Woodblocks & Dyeing',
    },
    {
      src: 'assets/audio/bang-5c.m4a',
      chapterIndex: 4,
      blockIndex: 6,
      labelVi: 'Phần 5c / 7 • Sáng tạo mẫu tranh Nghê',
      labelEn: 'Part 5c / 7 • New Nghe Designs',
    },
    {
      src: 'assets/audio/bang-6.m4a',
      chapterIndex: 5,
      blockIndex: 7,
      labelVi: 'Phần 6 / 7 • Trao truyền cho nghệ nhân',
      labelEn: 'Part 6 / 7 • Passing Down the Craft',
    },
    {
      src: 'assets/audio/bang-7.m4a',
      chapterIndex: 6,
      blockIndex: 8,
      labelVi: 'Phần 7 / 7 • Sức sống đương đại',
      labelEn: 'Part 7 / 7 • Contemporary Vitality',
    },
  ];

  const PLAYBACK_SPEED = 1.25;
  let currentTrackIdx = 0;
  let userScrollPauseUntil = 0;
  let formInteractionHoldUntil = 0;
  let autoFollowEnabled = true;
  let isAutoScrollStep = false;
  let autoScrollRaf = null;
  let autoScrollY = 0;
  let lastFrameTs = 0;

  const narrationAudio = new Audio();
  narrationAudio.preload = 'metadata';

  function isUserInteractingWithForm() {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT' || active.isContentEditable)) {
      return true;
    }
    if (active && active.closest && active.closest('#guestbook-form, #guestbook')) {
      return true;
    }
    return performance.now() < formInteractionHoldUntil;
  }

  function isOutsideActiveSegment() {
    const galleryEl = document.getElementById('gallery');
    if (galleryEl) {
      const gRect = galleryEl.getBoundingClientRect();
      if (gRect.top < window.innerHeight * 0.65) {
        return true;
      }
    }
    const seg = narrationSegments[currentTrackIdx];
    if (!seg) return false;
    const rect = seg.getBoundingClientRect();
    return rect.bottom < 40 || rect.top > window.innerHeight - 40;
  }

  function applyPlaybackSpeed() {
    narrationAudio.defaultPlaybackRate = PLAYBACK_SPEED;
    narrationAudio.playbackRate = PLAYBACK_SPEED;
    if ('preservesPitch' in narrationAudio) {
      narrationAudio.preservesPitch = true;
    } else if ('webkitPreservesPitch' in narrationAudio) {
      narrationAudio.webkitPreservesPitch = true;
    }
  }

  function updateActiveChapterVisual(index) {
    storyNodes.forEach((node, i) => {
      if (i === index) {
        node.classList.add('is-reading');
      } else {
        node.classList.remove('is-reading');
      }
    });
  }

  function updateDockUI() {
    const track = narrationTracks[currentTrackIdx] || narrationTracks[0];
    const isPlaying = !narrationAudio.paused && !narrationAudio.ended;
    const isBgmPlaying = !bgmAudio.paused && !bgmAudio.ended && !bgmUserMuted;
    const isEn = document.documentElement.getAttribute('data-site-lang') === 'en';
    if (dockStatus && track) {
      dockStatus.textContent = isEn ? track.labelEn : track.labelVi;
    }
    if (narrationDock) {
      narrationDock.classList.toggle('is-speaking', isPlaying);
      narrationDock.classList.toggle('is-bgm-playing', isBgmPlaying);
    }
    if (dockPlayBtn) {
      dockPlayBtn.innerHTML = `<i data-lucide="${isPlaying ? 'volume-2' : 'volume-x'}"></i>`;
      if (window.lucide) {
        window.lucide.createIcons({ attrs: {}, nameAttr: 'data-lucide', root: dockPlayBtn });
      }
    }
    if (dockBgmBtn) {
      dockBgmBtn.innerHTML = `<i data-lucide="${isBgmPlaying ? 'music' : 'music-off'}"></i>`;
      if (window.lucide) {
        window.lucide.createIcons({ attrs: {}, nameAttr: 'data-lucide', root: dockBgmBtn });
      }
    }
  }

  function getSegmentAnchorOffset() {
    return Math.min(130, window.innerHeight * 0.18);
  }

  function computeSegmentTargetY(trackIndex) {
    const seg = narrationSegments[trackIndex];
    if (!seg) return window.scrollY;
    const rect = seg.getBoundingClientRect();
    const segTop = rect.top + window.scrollY;
    const segHeight = rect.height;
    const anchorOffset = getSegmentAnchorOffset();
    const startY = Math.max(0, segTop - anchorOffset);
    if (!narrationAudio.duration || narrationAudio.duration <= 0) {
      return startY;
    }
    const progress = Math.min(1, Math.max(0, narrationAudio.currentTime / narrationAudio.duration));
    const endY = Math.max(startY, segTop + segHeight - window.innerHeight * 0.78);
    return startY + (endY - startY) * progress;
  }

  let narrationStarted = false;
  let slowAutoScrollActive = false;

  function jumpToSegmentStart(trackIndex, smooth = false) {
    const seg = narrationSegments[trackIndex];
    if (!seg) return;
    const rect = seg.getBoundingClientRect();
    const segTop = rect.top + window.scrollY;
    const startY = Math.max(0, segTop - getSegmentAnchorOffset());
    autoScrollY = startY;
    lastFrameTs = performance.now();
    isAutoScrollStep = true;
    window.scrollTo({ top: startY, behavior: smooth ? 'smooth' : 'instant' });
    isAutoScrollStep = false;
  }

  function stepAutoScroll(ts) {
    if (document.hidden) {
      autoScrollRaf = null;
      return;
    }
    const isNarrationPlaying = !narrationAudio.paused && !narrationAudio.ended && narrationAudio.duration > 0;
    if (!isNarrationPlaying && !slowAutoScrollActive) {
      autoScrollRaf = null;
      return;
    }

    const now = typeof ts === 'number' ? ts : performance.now();
    const dt = lastFrameTs > 0 ? Math.min(64, Math.max(1, now - lastFrameTs)) : 16.67;
    lastFrameTs = now;

    const modalOpen =
      (letterModal && letterModal.classList.contains('is-visible')) ||
      (lightboxModal && lightboxModal.classList.contains('is-active')) ||
      document.body.classList.contains('cover-locked') ||
      Boolean(document.querySelector('.ei-root'));

    const suspended =
      modalOpen ||
      !autoFollowEnabled ||
      isUserInteractingWithForm() ||
      now <= userScrollPauseUntil;

    if (!suspended) {
      if (isNarrationPlaying) {
        const targetY = computeSegmentTargetY(currentTrackIdx);
        if (Math.abs(window.scrollY - autoScrollY) > 60) {
          autoScrollY = window.scrollY;
        }
        const diff = targetY - autoScrollY;
        if (Math.abs(diff) > 0.4) {
          const alpha = 1 - Math.exp(-dt / 140);
          autoScrollY += diff * alpha;
          isAutoScrollStep = true;
          window.scrollTo({ top: autoScrollY, behavior: 'instant' });
          isAutoScrollStep = false;
        }
      } else if (slowAutoScrollActive) {
        const ch7 = document.getElementById('chapter-7');
        let maxScroll;
        if (ch7) {
          const ch7Rect = ch7.getBoundingClientRect();
          maxScroll = Math.max(0, ch7Rect.bottom + window.scrollY - window.innerHeight + 30);
        } else {
          maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        }
        if (autoScrollY >= maxScroll - 2) {
          slowAutoScrollActive = false;
        } else {
          if (Math.abs(window.scrollY - autoScrollY) > 60) {
            autoScrollY = window.scrollY;
          }
          autoScrollY += dt * 0.038;
          if (autoScrollY >= maxScroll) {
            autoScrollY = maxScroll;
            slowAutoScrollActive = false;
          }
          isAutoScrollStep = true;
          window.scrollTo({ top: autoScrollY, behavior: 'instant' });
          isAutoScrollStep = false;
        }
      }
    } else {
      autoScrollY = window.scrollY;
    }
    autoScrollRaf = requestAnimationFrame(stepAutoScroll);
  }

  document.addEventListener('visibilitychange', () => {
    const isNarrationPlaying = !narrationAudio.paused && !narrationAudio.ended && narrationAudio.duration > 0;
    if (!document.hidden && (isNarrationPlaying || slowAutoScrollActive)) {
      lastFrameTs = performance.now();
      if (isNarrationPlaying && autoFollowEnabled && !isUserInteractingWithForm() && !isOutsideActiveSegment()) {
        const targetY = computeSegmentTargetY(currentTrackIdx);
        autoScrollY = targetY;
        isAutoScrollStep = true;
        window.scrollTo({ top: targetY, behavior: 'instant' });
        isAutoScrollStep = false;
      } else {
        autoScrollY = window.scrollY;
      }
      if (!autoScrollRaf) {
        autoScrollRaf = requestAnimationFrame(stepAutoScroll);
      }
    }
  });

  function startNarrationAt(trackIndex, forceFollow = true, jumpImmediate = true) {
    if (trackIndex < 0 || trackIndex >= narrationTracks.length) return;
    narrationStarted = true;
    slowAutoScrollActive = false;
    currentTrackIdx = trackIndex;
    const track = narrationTracks[currentTrackIdx];
    updateActiveChapterVisual(track.chapterIndex);
    if (forceFollow) {
      autoFollowEnabled = true;
      userScrollPauseUntil = 0;
      jumpToSegmentStart(currentTrackIdx, !jumpImmediate);
    } else if (autoFollowEnabled && !isUserInteractingWithForm() && !isOutsideActiveSegment()) {
      jumpToSegmentStart(currentTrackIdx, !jumpImmediate);
    }

    const wantedSrc = new URL(track.src, window.location.href).href;
    if (narrationAudio.src !== wantedSrc) {
      narrationAudio.src = track.src;
      narrationAudio.currentTime = 0;
    } else {
      narrationAudio.currentTime = 0;
    }
    applyPlaybackSpeed();
    narrationAudio.play().then(() => {
      applyPlaybackSpeed();
      updateDockUI();
      if (!autoScrollRaf) {
        autoScrollRaf = requestAnimationFrame(stepAutoScroll);
      }
    }).catch(() => {
      updateDockUI();
    });
    updateDockUI();
  }

  function toggleNarration() {
    if (!narrationStarted || !narrationAudio.src || narrationAudio.src.startsWith('data:')) {
      slowAutoScrollActive = false;
      startNarrationAt(0, true, false);
      return;
    }
    if (narrationAudio.paused) {
      userScrollPauseUntil = 0;
      slowAutoScrollActive = false;
      if (!isUserInteractingWithForm()) {
        autoFollowEnabled = true;
      }
      jumpToSegmentStart(currentTrackIdx, true);
      applyPlaybackSpeed();
      narrationAudio.play().then(() => {
        applyPlaybackSpeed();
        updateDockUI();
        if (!autoScrollRaf) {
          autoScrollRaf = requestAnimationFrame(stepAutoScroll);
        }
      }).catch(() => {});
    } else {
      narrationAudio.pause();
      slowAutoScrollActive = false;
      updateDockUI();
    }
  }

  narrationAudio.addEventListener('play', () => {
    applyPlaybackSpeed();
    syncBgmDucking();
    updateDockUI();
    if (!autoScrollRaf) {
      autoScrollRaf = requestAnimationFrame(stepAutoScroll);
    }
  });

  narrationAudio.addEventListener('pause', () => {
    syncBgmDucking();
    updateDockUI();
  });

  narrationAudio.addEventListener('ended', () => {
    if (currentTrackIdx + 1 < narrationTracks.length) {
      startNarrationAt(currentTrackIdx + 1, false);
    } else {
      syncBgmDucking();
      updateDockUI();
    }
  });

  bgmAudio.addEventListener('play', updateDockUI);
  bgmAudio.addEventListener('pause', updateDockUI);

  function toggleBgm() {
    if (bgmAudio.paused || bgmUserMuted) {
      bgmUserMuted = false;
      syncBgmDucking();
      bgmAudio.play().then(updateDockUI).catch(updateDockUI);
    } else {
      bgmUserMuted = true;
      bgmAudio.pause();
      updateDockUI();
    }
  }

  const handleManualUserScroll = () => {
    if (isAutoScrollStep) return;
    userScrollPauseUntil = performance.now() + 4500;
    autoScrollY = window.scrollY;
    if (narrationStarted && !narrationAudio.paused) {
      if (isOutsideActiveSegment()) {
        autoFollowEnabled = false;
      } else {
        const targetY = computeSegmentTargetY(currentTrackIdx);
        if (Math.abs(window.scrollY - targetY) > window.innerHeight * 0.5) {
          autoFollowEnabled = false;
        } else if (!isUserInteractingWithForm()) {
          autoFollowEnabled = true;
        }
      }
    } else {
      const ch7 = document.getElementById('chapter-7');
      if (ch7) {
        const ch7Rect = ch7.getBoundingClientRect();
        const maxScroll = ch7Rect.bottom + window.scrollY - window.innerHeight + 30;
        if (window.scrollY >= maxScroll) {
          slowAutoScrollActive = false;
        }
      }
      if (!isUserInteractingWithForm() && slowAutoScrollActive) {
        autoFollowEnabled = true;
      }
    }
  };
  window.addEventListener('wheel', handleManualUserScroll, { passive: true });
  window.addEventListener('touchmove', handleManualUserScroll, { passive: true });

  ['focusin', 'input', 'keydown', 'pointerdown'].forEach((evtName) => {
    document.addEventListener(evtName, (e) => {
      if (e.target && e.target.closest && e.target.closest('#guestbook, #gallery, #community')) {
        autoFollowEnabled = false;
        if (e.target.closest('#guestbook-form, input, textarea')) {
          formInteractionHoldUntil = performance.now() + 10000;
        }
      }
    }, { passive: true });
  });

  document.querySelectorAll('.site-nav a').forEach((navLink) => {
    navLink.addEventListener('click', () => {
      const href = navLink.getAttribute('href') || '';
      if (href && href !== '#storyline') {
        autoFollowEnabled = false;
        userScrollPauseUntil = performance.now() + 10000;
      } else if (href === '#storyline') {
        autoFollowEnabled = true;
        userScrollPauseUntil = 0;
      }
    });
  });

  if (dockPlayBtn) {
    dockPlayBtn.addEventListener('click', toggleNarration);
  }
  if (dockBgmBtn) {
    dockBgmBtn.addEventListener('click', toggleBgm);
  }

  const SILENT_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
  let audioPrimed = false;
  let invitationHandled = false;

  function primeNarrationOnGesture() {
    if (audioPrimed) return;
    audioPrimed = true;
    playChimeSound();
    if (!bgmUserMuted) {
      bgmAudio.volume = BGM_VOL_NORMAL;
      bgmAudio.play().then(updateDockUI).catch(() => {});
    }
    narrationAudio.src = SILENT_WAV;
    narrationAudio.play().then(() => {
      narrationAudio.pause();
    }).catch(() => {});
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('.ei-seal')) {
      primeNarrationOnGesture();
    }
  }, true);

  function handleInvitationOpened() {
    if (invitationHandled) return;
    invitationHandled = true;
    document.body.classList.remove('cover-locked');
    if (!bgmUserMuted && bgmAudio.paused) {
      bgmAudio.play().then(updateDockUI).catch(() => {});
    }
    slowAutoScrollActive = true;
    autoFollowEnabled = true;
    userScrollPauseUntil = 0;
    autoScrollY = window.scrollY;
    lastFrameTs = performance.now();
    if (!autoScrollRaf) {
      autoScrollRaf = requestAnimationFrame(stepAutoScroll);
    }
    updateDockUI();
  }

  window.onInvitationOpened = handleInvitationOpened;
  window.addEventListener('invitation:opened', handleInvitationOpened);

  narrationSegments.forEach((seg, segIdx) => {
    const badge = seg.querySelector('.node-year-badge');
    if (badge) {
      badge.style.cursor = 'pointer';
      badge.addEventListener('click', () => {
        slowAutoScrollActive = false;
        startNarrationAt(segIdx, true);
      });
    }
  });

  updateDockUI();

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
    updateDockUI();
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
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzozjBIlShGF93PzOQT12MzwF2GOMXAZ7L2sWMTQJo2JggcRtR1myYlBgducdV5qonGOA/exec';
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
      const valid = list.filter((w) => w && w.name && w.wish).slice(0, 5);
      valid.forEach((w) => {
        appendWishToWall(w.name, w.wish, false);
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
      while (wishesWall.children.length > 5) {
        wishesWall.lastElementChild.remove();
      }
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
    let lastWishSentAt = 0;

    guestbookForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = guestNameInput.value.trim().slice(0, 80);
      const email = guestEmailInput.value.trim().slice(0, 120);
      const wish = guestWishInput.value.trim().slice(0, 500);

      if (!name || !email || !wish) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast(
          getSiteLang() === 'en'
            ? 'Please enter a valid email address.'
            : 'Vui lòng nhập địa chỉ email hợp lệ.'
        );
        return;
      }
      if (Date.now() - lastWishSentAt < 15000) {
        showToast(
          getSiteLang() === 'en'
            ? 'Please wait a few seconds before sending another wish.'
            : 'Vui lòng đợi ít giây trước khi gửi lời chúc tiếp theo.'
        );
        return;
      }

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

        lastWishSentAt = Date.now();
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
      title: 'LINH ĐIỂU PHƯỢNG MÚA',
      line1: 'Cao Quý Cát Tường • Gia Đạo Thái Bình',
      line2: 'Điềm Lành Hội Tụ • Phúc Lộc Viên Mãn',
    },
    {
      src: 'tranh/ngua-vang.jpeg',
      name: 'Ngựa Vàng',
      title: 'MÃ ĐÁO THÀNH CÔNG',
      line1: 'Công Danh Hanh Thông • Vạn Sự Thành Đạt',
      line2: 'Chí Lớn Vươn Xa • Lộc Tài Rộng Mở',
    },
    {
      src: 'tranh/ga-trong-than-ke.jpeg',
      name: 'Gà Trống Thần Kê',
      title: 'THẦN KÊ ĐẠI CÁT',
      line1: 'Trấn Trạch Bình An • Đón Ánh Thái Dương',
      line2: 'Vạn Sự Hanh Thông • An Khang Thịnh Vượng',
    },
    {
      src: 'tranh/rong-vang.jpeg',
      name: 'Rồng Vàng',
      title: 'KIM LONG HIỂN THÁNH',
      line1: 'Mưa Thuận Gió Hòa • Hưng Thịnh Bền Lâu',
      line2: 'Khí Thế Vươn Cao • Phúc Lộc Dồi Dào',
    },
    {
      src: 'tranh/vo-tuong.jpeg',
      name: 'Võ Tướng',
      title: 'THẦN TƯỚNG TRẤN TRẠCH',
      line1: 'Gia Môn Vững Chãi • Bốn Mùa Bình An',
      line2: 'Oai Phong Vững Vàng • Tai Qua Nạn Khỏi',
    },
    {
      src: 'tranh/tien-loc-tien-tai.jpeg',
      name: 'Tiến Lộc Tiến Tài',
      title: 'TIẾN LỘC TIẾN TÀI',
      line1: 'Tài Lộc Dồi Dào • Phú Quý Vinh Hoa',
      line2: 'Phúc Thọ An Khang • Vạn Sự Như Ý',
    },
    {
      src: 'tranh/tre-em-hai-chuoi.jpeg',
      name: 'Trẻ Em Hái Chuối',
      title: 'SUM VẦY NO ĐỦ',
      line1: 'Gia Đình Hòa Thuận • Con Cháu Thảo Hiền',
      line2: 'Niềm Vui Đong Đầy • Ấm No Hạnh Phúc',
    },
    {
      src: 'tranh/muc-dong-cuoi-trau.jpeg',
      name: 'Mục Đồng Cưỡi Trâu',
      title: 'THANH BÌNH AN LẠC',
      line1: 'Tâm An Tự Tại • Đời Sống Thảnh Thơi',
      line2: 'Mùa Màng Bội Thu • Phúc Lành Ngập Tràn',
    },
    {
      src: 'tranh/ngua-trang.jpeg',
      name: 'Ngựa Trắng',
      title: 'BẠCH MÃ KHỞI HÀNH',
      line1: 'Thuận Buồm Xuôi Gió • Sự Nghiệp Thăng Hoa',
      line2: 'Vững Bước Đường Xa • Công Thành Danh Toại',
    },
    {
      src: 'tranh/ho-me-con.jpeg',
      name: 'Hổ Mẹ Con',
      title: 'MẪU TỬ BÌNH AN',
      line1: 'Sức Khỏe Dồi Dào • Vững Vàng Che Chở',
      line2: 'Gia Đạo Hòa Vui • Vạn Điều May Mắn',
    },
    {
      src: 'tranh/nguoi-cuoi-rong.jpeg',
      name: 'Người Cưỡi Rồng',
      title: 'LONG VÂN HỘI NGỘ',
      line1: 'Vận Hội Thăng Hoa • Bay Cao Vươn Xa',
      line2: 'Cát Tinh Chiếu Mệnh • Vạn Sự Hanh Thông',
    },
    {
      src: 'tranh/ga-trong-cat-tuong.jpeg',
      name: 'Gà Trống Cát Tường',
      title: 'NGŨ ĐỨC CÁT TƯỜNG',
      line1: 'Văn Võ Dũng Nhân • Trọn Vẹn Chữ Tín',
      line2: 'Khởi Đầu Tốt Đẹp • Phúc Lộc Trường Tồn',
    },
  ];

  let lastBlessingIdx = -1;
  const downloadBtn = document.getElementById('download-blessing-btn');

  function assignNextRandomBlessing() {
    if (!downloadBtn) return;
    let idx = Math.floor(Math.random() * blessingPaintings.length);
    if (blessingPaintings.length > 1 && idx === lastBlessingIdx) {
      idx = (idx + 1 + Math.floor(Math.random() * (blessingPaintings.length - 1))) % blessingPaintings.length;
    }
    lastBlessingIdx = idx;
    const item = blessingPaintings[idx];
    const slug = item.src.split('/').pop().replace('.jpeg', '');
    const fileName = `Loc-Do-Kim-Hoang-${slug}.png`;
    downloadBtn.setAttribute('href', `/assets/loc-do/${fileName}`);
    downloadBtn.setAttribute('download', fileName);
  }

  if (downloadBtn) {
    assignNextRandomBlessing();
    downloadBtn.addEventListener('click', () => {
      showToast(
        getSiteLang() === 'en'
          ? 'Downloading Kim Hoang Red Blessing (check your Downloads)!'
          : 'Đang tải Lộc Đỏ Kim Hoàng về máy (kiểm tra mục Tệp tải về / Downloads)!'
      );
      setTimeout(assignNextRandomBlessing, 350);
    });
  }
});
