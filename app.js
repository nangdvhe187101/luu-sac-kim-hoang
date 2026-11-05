

document.addEventListener('DOMContentLoaded', () => {
  
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const canvas = document.getElementById('petals-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    const canvasStyle = getComputedStyle(document.documentElement);
    const petalRgb = canvasStyle.getPropertyValue('--petal-rgb').trim();
    const dustRgb = canvasStyle.getPropertyValue('--gold-light-rgb').trim();

    const petals = [];
    const petalCount = 32;

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 6,
        speedY: Math.random() * 0.8 + 0.4,
        speedX: Math.random() * 0.6 - 0.3,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 1.5,
        type: i % 3 === 0 ? 'gold' : 'petal', 
        alpha: Math.random() * 0.5 + 0.35,
      });
    }

    function renderPetals() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petalCount; i++) {
        const p = petals[i];
        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.015) * 0.8 + p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        if (p.type === 'petal') {
          
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, 0, 0, p.size * 1.3);
          ctx.bezierCurveTo(-p.size, 0, -p.size / 2, -p.size / 2, 0, 0);
          ctx.fillStyle = `rgba(${petalRgb}, ${p.alpha * 0.85})`;
          ctx.fill();
        } else {
          
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.22, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${dustRgb}, ${p.alpha})`;
          ctx.fill();
        }
        ctx.restore();
      }

      requestAnimationFrame(renderPetals);
    }
    renderPetals();
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
      
      voiceState.currentIndex = 0;
      if (!voiceState.isPlaying) {
        startVoiceTour();
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
      text: 'Tưởng chừng số phận dòng tranh đã chấm dứt, nhưng nhà nghiên cứu người Pháp Maurice Durand đã từng sưu tầm tranh thờ và tranh Tết ở Bắc Bộ, lưu trữ tại Viện Viễn Đông Bác Cổ. Năm 1960, cuốn sách Tranh Dân Gian Việt Nam của ông được xuất bản tại Paris. Đến năm 2011, cuốn sách được tái bản với đầy đủ hình in màu minh họa. Qua đối chiếu phong cách và sắc đỏ cam đặc trưng, các nhà nghiên cứu xác nhận có tới 58 bức tranh dân gian Kim Hoàng. Đây chính là chiếc chìa khóa định mệnh mở ra hy vọng phục sinh một di sản đã mất.',
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
      text: 'Dự án đã phục dựng thành công 33 mẫu mộc bản và 19 mẫu vẽ tay. Nghệ nhân Đào Đình Chung nay đã có thể tự nuôi sống mình bằng chính nghề làm tranh di sản. Cùng với sự chung tay của thế hệ trẻ qua các triển lãm như Nốt Đỏ Di Sản, sắc đỏ Kim Hoàng đã chính thức thức giấc, đàng hoàng bước vào đời sống đương đại.',
    },
  ];

  const voiceState = {
    isPlaying: false,
    currentIndex: 0,
    rate: 1.2, 
    speechSynth: window.speechSynthesis,
    preferredVoice: null,
  };

  const voicePlayBtn = document.getElementById('voice-play-btn');
  const playIcon = document.getElementById('play-icon');
  const voiceStatusText = document.getElementById('voice-status-text');
  const voiceSpeedBtn = document.getElementById('voice-speed-btn');
  const audioWaves = document.getElementById('audio-waves');
  const storyNodes = document.querySelectorAll('.story-node');

  function scoreVoice(v) {
    let score = 0;
    const name = v.name.toLowerCase();
    if (/natural|neural|online/.test(name)) score += 50;
    if (/hoaimy|hoài my|namminh|nam minh/.test(name)) score += 40;
    if (/google/.test(name)) score += 25;
    if (/premium|enhanced|siri/.test(name)) score += 20;
    if (/linh/.test(name)) score += 10;
    if (!v.localService) score += 5;
    return score;
  }

  function pickBestVoice() {
    if (!voiceState.speechSynth) return;
    const viVoices = voiceState.speechSynth.getVoices()
      .filter((v) => /^vi/i.test(v.lang) || /viet/i.test(v.name));
    if (!viVoices.length) return;
    viVoices.sort((a, b) => scoreVoice(b) - scoreVoice(a));
    voiceState.preferredVoice = viVoices[0];
  }

  if (voiceState.speechSynth) {
    pickBestVoice();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = pickBestVoice;
    }
  }

  let autoScrollFrame = null;

  function stopAutoScroll() {
    if (autoScrollFrame) {
      cancelAnimationFrame(autoScrollFrame);
      autoScrollFrame = null;
    }
  }

  function estimateReadMs(text) {
    
    return (text.length / (14 * voiceState.rate)) * 1000;
  }

  function getNodeScrollRange(node) {
    const headerOffset = 96;
    const top = node.getBoundingClientRect().top + window.scrollY - headerOffset;
    const bottomView = top + node.offsetHeight - window.innerHeight + headerOffset + 48;
    return { top, bottom: Math.max(top, bottomView) };
  }

  function scrollSmoothTo(toY, durationMs, ease) {
    stopAutoScroll();
    const startY = window.scrollY;
    const t0 = performance.now();
    const total = Math.max(1, durationMs);

    function step(now) {
      const k = Math.min(1, (now - t0) / total);
      const e = ease ? (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2) : k;
      window.scrollTo({ top: startY + (toY - startY) * e, behavior: 'instant' });
      autoScrollFrame = k < 1 ? requestAnimationFrame(step) : null;
    }
    autoScrollFrame = requestAnimationFrame(step);
  }

  function glideToNode(node) {
    scrollSmoothTo(getNodeScrollRange(node).top, 1200, true);
  }

  function scrollToProgress(node, fraction, durationMs) {
    const { top, bottom } = getNodeScrollRange(node);
    scrollSmoothTo(top + (bottom - top) * fraction, durationMs, false);
  }

  function updateActiveChapterVisual(index) {
    storyNodes.forEach((node, i) => {
      if (i === index) {
        node.classList.add('is-reading');
        if (voiceState.isPlaying && chapters[index]) {
          glideToNode(node);
        } else {
          node.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        node.classList.remove('is-reading');
      }
    });

    if (voiceStatusText && chapters[index]) {
      voiceStatusText.textContent = `Đang đọc: ${chapters[index].title}`;
    }
  }

  function readChapter(index) {
    if (!voiceState.speechSynth) {
      voiceState.isPlaying = false;
      showToast('Trình duyệt của bạn chưa hỗ trợ giọng đọc. Bạn vẫn có thể đọc câu chuyện bên dưới.');
      return;
    }

    if (!voiceState.preferredVoice && !voiceState.noVoiceWarned) {
      voiceState.noVoiceWarned = true;
      showToast('Máy chưa có giọng đọc tiếng Việt nên giọng kể có thể không chuẩn.');
    }

    voiceState.speechSynth.cancel();

    if (index >= chapters.length) {
      stopVoiceTour();
      if (voiceStatusText) voiceStatusText.textContent = 'Đã hoàn thành chuyến thuyết minh';
      return;
    }

    voiceState.currentIndex = index;
    updateActiveChapterVisual(index);

    const chapter = chapters[index];

    const sentences = chapter.text.match(/[^.!?…]+[.!?…]*/g) || [chapter.text];
    const queue = sentences.map((s) => s.trim()).filter(Boolean);

    const totalChars = queue.reduce((sum, s) => sum + s.length, 0) || 1;
    let readChars = 0;
    const node = storyNodes[index];

    voiceState.session = (voiceState.session || 0) + 1;
    const session = voiceState.session;

    const speakSentence = (i) => {
      if (!voiceState.isPlaying || session !== voiceState.session) return;
      if (i >= queue.length) {
        setTimeout(() => {
          if (voiceState.isPlaying && session === voiceState.session) readChapter(voiceState.currentIndex + 1);
        }, 350);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(queue[i]);
      utterance.lang = 'vi-VN';
      utterance.rate = voiceState.rate;
      
      utterance.pitch = i === 0 ? 1.08 : 1.0 - (i % 2) * 0.04;
      if (voiceState.preferredVoice) utterance.voice = voiceState.preferredVoice;

      if (i === 0) {
        utterance.onstart = () => {
          voiceState.isPlaying = true;
          if (audioWaves) audioWaves.classList.add('is-speaking');
          if (playIcon) playIcon.setAttribute('data-lucide', 'pause');
          if (window.lucide) window.lucide.createIcons();
        };
      }

      const sentenceChars = queue[i].length;
      const fractionAfter = Math.min(1, (readChars + sentenceChars) / totalChars);
      const estimatedMs = estimateReadMs(queue[i]) * 1.25;
      const GLIDE_INTO_NODE_MS = 1200;
      const startProgressScroll = () => {
        if (node && session === voiceState.session && voiceState.isPlaying) {
          scrollToProgress(node, fractionAfter, estimatedMs);
        }
      };
      const baseOnStart = utterance.onstart;
      utterance.onstart = (ev) => {
        if (baseOnStart) baseOnStart(ev);
        if (i === 0) {
          
          setTimeout(startProgressScroll, GLIDE_INTO_NODE_MS);
        } else {
          startProgressScroll();
        }
      };

      utterance.onend = () => {
        readChars += sentenceChars;
        
        const pause = /[.…]$/.test(queue[i]) ? 280 : 160;
        setTimeout(() => speakSentence(i + 1), pause);
      };

      voiceState.speechSynth.speak(utterance);
    };

    speakSentence(0);
  }

  function startVoiceTour() {
    voiceState.isPlaying = true;
    readChapter(voiceState.currentIndex);
  }

  function pauseVoiceTour() {
    voiceState.isPlaying = false;
    stopAutoScroll();
    if (voiceState.speechSynth) {
      voiceState.speechSynth.cancel();
    }
    if (audioWaves) audioWaves.classList.remove('is-speaking');
    if (playIcon) playIcon.setAttribute('data-lucide', 'play');
    if (window.lucide) window.lucide.createIcons();
    if (voiceStatusText) voiceStatusText.textContent = 'Đã tạm dừng thuyết minh';
  }

  function stopVoiceTour() {
    pauseVoiceTour();
    storyNodes.forEach((node) => node.classList.remove('is-reading'));
  }

  ['wheel', 'touchstart'].forEach((evt) => {
    window.addEventListener(evt, () => {
      if (voiceState.isPlaying) pauseVoiceTour();
    }, { passive: true });
  });
  window.addEventListener('keydown', (e) => {
    const navKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
    if (voiceState.isPlaying && navKeys.includes(e.key)) pauseVoiceTour();
  });

  const coverGate = document.getElementById('cover-gate');
  const coverOpenBtn = document.getElementById('cover-open-btn');

  function openCover() {
    if (!coverGate || coverGate.classList.contains('is-opening')) return;
    playChimeSound();
    coverGate.classList.add('is-opening');
    document.body.classList.remove('cover-locked');
    window.scrollTo({ top: 0, behavior: 'instant' });

    voiceState.currentIndex = 0;
    if (!voiceState.isPlaying) startVoiceTour();

    const removeDelay = prefersReducedMotion.matches ? 50 : 1800;
    setTimeout(() => coverGate.remove(), removeDelay);
  }

  if (coverOpenBtn) {
    coverOpenBtn.addEventListener('click', openCover);
    coverOpenBtn.focus();
  }

  if (voicePlayBtn) {
    voicePlayBtn.addEventListener('click', () => {
      if (voiceState.isPlaying) {
        pauseVoiceTour();
      } else {
        startVoiceTour();
      }
    });
  }

  const speedOptions = [1.2, 1.35, 1.05];
  let currentSpeedIdx = 0;
  if (voiceSpeedBtn) {
    voiceSpeedBtn.addEventListener('click', () => {
      currentSpeedIdx = (currentSpeedIdx + 1) % speedOptions.length;
      voiceState.rate = speedOptions[currentSpeedIdx];
      voiceSpeedBtn.textContent = `${voiceState.rate}x`;

      if (voiceState.isPlaying) {
        readChapter(voiceState.currentIndex);
      }
    });
  }

  storyNodes.forEach((node, idx) => {
    node.addEventListener('click', () => {
      voiceState.currentIndex = idx;
      if (voiceState.isPlaying) {
        readChapter(idx);
      } else {
        updateActiveChapterVisual(idx);
      }
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

  function showLightboxAt(index) {
    if (!lightboxModal || !lightboxImg || galleryList.length === 0) return;
    lightboxIndex = (index + galleryList.length) % galleryList.length;
    const item = galleryList[lightboxIndex];
    const thumb = item.querySelector('img');
    lightboxImg.src = item.getAttribute('data-full-src');
    lightboxImg.alt = thumb ? thumb.alt : '';
    lightboxCaption.textContent = item.getAttribute('data-caption');
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
    if (coverflowCaption && current) coverflowCaption.textContent = current.getAttribute('data-caption') || '';
    if (coverflowCounter) coverflowCounter.textContent = `${coverflowIndex + 1} / ${count}`;
  }

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

  async function loadWishes() {
    try {
      const res = await fetch('/api/wishes', { headers: { Accept: 'application/json' } });
      if (!res.ok) return;
      const list = await res.json();
      
      list.slice().reverse().forEach((w) => appendWishToWall(w.name, w.wish, true));
    } catch (e) {
      
    }
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
        const res = await fetch('/api/wishes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, wish }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          showToast(data.error || 'Chưa gửi được lời chúc, vui lòng thử lại.');
          return;
        }

        appendWishToWall(data.name, data.wish, true);
        guestbookForm.reset();
        showToast('Cảm ơn bạn! Lời chúc đã được gửi đến Lưu Sắc Kim Hoàng.');
      } catch (err) {
        showToast('Không kết nối được máy chủ. Hãy chạy "node server.js" rồi mở trang qua địa chỉ của server.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    loadWishes();
  }

  const downloadBtn = document.getElementById('download-blessing-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      
      try {
        await Promise.all([
          document.fonts.load('bold 74px "Be Vietnam Pro"', 'LƯU SẮC KIM HOÀNG'),
          document.fonts.load('italic 42px "Be Vietnam Pro"', 'Chạm Sắc Son'),
          document.fonts.load('600 48px "Be Vietnam Pro"', 'THẦN KÊ ĐẠI CÁT'),
          document.fonts.load('36px "Be Vietnam Pro"', 'Vạn Sự Hanh Thông'),
        ]);
      } catch (e) {}

      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = 1080;
      offscreenCanvas.height = 1920;
      const offCtx = offscreenCanvas.getContext('2d');

      const rootStyle = getComputedStyle(document.documentElement);
      const token = (name) => rootStyle.getPropertyValue(name).trim();

      const gradient = offCtx.createLinearGradient(0, 0, 0, 1920);
      gradient.addColorStop(0, token('--bg-1'));
      gradient.addColorStop(0.5, token('--bg-2'));
      gradient.addColorStop(1, token('--bg-3'));
      offCtx.fillStyle = gradient;
      offCtx.fillRect(0, 0, 1080, 1920);

      offCtx.strokeStyle = token('--color-gold');
      offCtx.lineWidth = 14;
      offCtx.strokeRect(40, 40, 1000, 1840);

      offCtx.fillStyle = token('--color-gold-light');
      offCtx.textAlign = 'center';
      offCtx.font = 'bold 74px "Be Vietnam Pro", sans-serif';
      offCtx.fillText('LƯU SẮC KIM HOÀNG', 540, 440);

      offCtx.fillStyle = token('--color-cream');
      offCtx.font = 'italic 42px "Be Vietnam Pro", sans-serif';
      offCtx.fillText('“Chạm Sắc Son, Lưu Dấu Người...”', 540, 550);

      offCtx.fillStyle = token('--color-gold-light');
      offCtx.font = 'bold 180px "Songti SC", "STSong", "Noto Serif CJK SC", "SimSun", serif';
      offCtx.fillText('神 雞', 540, 940);

      offCtx.fillStyle = token('--color-gold-light');
      offCtx.font = '600 48px "Be Vietnam Pro", sans-serif';
      offCtx.fillText('THẦN KÊ ĐẠI CÁT • 2026', 540, 1100);

      offCtx.fillStyle = token('--color-paper-warm');
      offCtx.font = '36px "Be Vietnam Pro", sans-serif';
      offCtx.fillText('Vạn Sự Hanh Thông • An Khang Thịnh Vượng', 540, 1220);
      offCtx.fillText('Di Sản Tranh Đỏ Thăng Long Ngàn Năm', 540, 1300);

      const link = document.createElement('a');
      link.download = 'Loc-Do-Kim-Hoang-2026.png';
      link.href = offscreenCanvas.toDataURL('image/png');
      link.click();
    });
  }
});
