---
phase: 04
name: Gallery Lightbox & Hover Effects
duration: 1.5h
files:
  - index.html (gallery structure, lightbox modal markup)
  - styles.css (hover effects, lightbox styles)
  - app.js (lightbox open/close logic, keyboard nav)
dependencies: []
---

# Phase 04: Gallery Lightbox & Hover Effects

## Goal

Nâng cấp gallery section với hover effects chuyên nghiệp (scale + glow + info overlay) và lightbox modal để xem ảnh phóng to với prev/next navigation.

## Current State

Gallery có CSS hover cơ bản:

```css
.gallery-item:hover {
  transform: translateY(-4px);
  /* ... */
}
```

Không có:
- Info overlay khi hover (title, caption)
- Click-to-zoom lightbox
- Keyboard navigation (arrow keys, Esc)

## Desired Features

### 1. Enhanced Hover State

```
Hover on gallery item:
  ✅ Scale up slightly (1.02)
  ✅ Glow border (gold)
  ✅ Info overlay fades in (title + view icon)
  ✅ Cursor: pointer
```

### 2. Lightbox Modal

```
Click gallery item:
  → Open full-screen modal
  → Display image at max size (contain)
  → Show caption below
  → Prev/Next buttons (if multiple images)
  → Close button (X) + click backdrop to close
  → Keyboard: Left/Right arrows, Esc
  → Trap focus inside modal (accessibility)
```

## Implementation

### 1. Update Gallery HTML Structure

Add `data-lightbox` attributes and hidden metadata:

```html
<!-- In gallery section -->
<div class="gallery-grid">
  <div class="gallery-item" 
       data-scroll-reveal 
       data-lightbox-index="0"
       data-lightbox-src="assets/gallery/tranh_ga_dong.jpg"
       data-lightbox-caption="Tranh Gà Trống - Biểu tượng cát tường năm sắc">
    <div class="gallery-thumb-wrap">
      <img src="assets/gallery/tranh_ga_dong.jpg" alt="Tranh Gà Trống Kim Hoàng" loading="lazy">
      <div class="gallery-hover-overlay">
        <i data-lucide="zoom-in" class="gallery-zoom-icon"></i>
        <span class="gallery-hover-title">Gà Trống Cát Tường</span>
      </div>
    </div>
  </div>
  
  <!-- Repeat for other items -->
</div>

<!-- Lightbox Modal (add before closing </body>) -->
<div class="lightbox-modal" id="lightbox-modal" role="dialog" aria-modal="true" aria-hidden="true">
  <button class="lightbox-close-btn" id="lightbox-close" aria-label="Đóng lightbox">
    <i data-lucide="x"></i>
  </button>
  
  <button class="lightbox-nav-btn lightbox-prev" id="lightbox-prev" aria-label="Ảnh trước">
    <i data-lucide="chevron-left"></i>
  </button>
  
  <button class="lightbox-nav-btn lightbox-next" id="lightbox-next" aria-label="Ảnh sau">
    <i data-lucide="chevron-right"></i>
  </button>
  
  <div class="lightbox-content">
    <img class="lightbox-image" id="lightbox-image" src="" alt="">
    <p class="lightbox-caption" id="lightbox-caption"></p>
    <span class="lightbox-counter" id="lightbox-counter">1 / 12</span>
  </div>
  
  <div class="lightbox-backdrop" id="lightbox-backdrop"></div>
</div>
```

### 2. Add CSS - Enhanced Hover

```css
/* Gallery hover overlay */
.gallery-hover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(20, 13, 12, 0.95) 0%,
    rgba(20, 13, 12, 0.7) 50%,
    transparent 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
}

.gallery-item:hover .gallery-hover-overlay {
  opacity: 1;
}

.gallery-zoom-icon {
  width: 48px;
  height: 48px;
  color: var(--color-gold-light);
  margin-bottom: 0.8rem;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6));
}

.gallery-hover-title {
  font-family: var(--font-display);
  font-size: 0.95rem;
  color: var(--color-cream);
  text-align: center;
  padding: 0 1rem;
  letter-spacing: 0.05em;
}

/* Enhanced hover scale + glow */
.gallery-item {
  cursor: pointer;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.35s ease;
}

.gallery-item:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5),
              0 0 0 2px var(--color-gold-light),
              0 0 20px rgba(var(--gold-glow-rgb), 0.6);
}
```

### 3. Add CSS - Lightbox Modal

```css
/* Lightbox modal */
.lightbox-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.lightbox-modal[aria-hidden="false"] {
  opacity: 1;
  visibility: visible;
}

.lightbox-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(10, 7, 6, 0.96);
  backdrop-filter: blur(8px);
  z-index: -1;
  cursor: pointer;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  animation: lightboxZoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes lightboxZoomIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.lightbox-image {
  max-width: 100%;
  max-height: calc(90vh - 120px);
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(var(--gold-glow-rgb), 0.3);
}

.lightbox-caption {
  margin-top: 1.5rem;
  font-size: 1.05rem;
  color: var(--color-cream);
  text-align: center;
  max-width: 600px;
  font-style: italic;
}

.lightbox-counter {
  position: absolute;
  top: -40px;
  right: 0;
  font-size: 0.85rem;
  color: var(--color-cream-muted);
  background: rgba(20, 13, 12, 0.8);
  padding: 4px 12px;
  border-radius: 999px;
}

/* Lightbox controls */
.lightbox-close-btn {
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  background: rgba(20, 13, 12, 0.9);
  border: 1px solid rgba(var(--gold-rgb), 0.4);
  border-radius: 50%;
  color: var(--color-gold-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  z-index: 2;
}

.lightbox-close-btn:hover {
  background: var(--color-gold-light);
  color: var(--bg-deep);
  border-color: var(--color-gold-light);
  transform: rotate(90deg);
}

.lightbox-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  background: rgba(20, 13, 12, 0.85);
  border: 1px solid rgba(var(--gold-rgb), 0.4);
  border-radius: 50%;
  color: var(--color-gold-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  z-index: 2;
}

.lightbox-prev {
  left: 2rem;
}

.lightbox-next {
  right: 2rem;
}

.lightbox-nav-btn:hover {
  background: var(--color-gold-light);
  color: var(--bg-deep);
  border-color: var(--color-gold-light);
  transform: translateY(-50%) scale(1.1);
}

.lightbox-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Prevent body scroll when lightbox open */
body.lightbox-open {
  overflow: hidden;
}
```

### 4. Add JavaScript - Lightbox Logic

Add to `app.js` (after scroll reveal section):

```javascript
/* ==========================================================================
   GALLERY LIGHTBOX MODAL
   ========================================================================== */

const lightbox = (() => {
  const modal = document.getElementById('lightbox-modal');
  if (!modal) return null;

  const image = document.getElementById('lightbox-image');
  const caption = document.getElementById('lightbox-caption');
  const counter = document.getElementById('lightbox-counter');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const backdrop = document.getElementById('lightbox-backdrop');

  const galleryItems = Array.from(document.querySelectorAll('[data-lightbox-index]'));
  let currentIndex = 0;
  let lastFocusedElement = null;

  function open(index) {
    currentIndex = index;
    lastFocusedElement = document.activeElement;
    
    const item = galleryItems[currentIndex];
    const src = item.dataset.lightboxSrc;
    const cap = item.dataset.lightboxCaption || '';

    image.src = src;
    caption.textContent = cap;
    counter.textContent = `${currentIndex + 1} / ${galleryItems.length}`;

    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');

    // Update nav buttons state
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === galleryItems.length - 1;

    closeBtn.focus();
  }

  function close() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  function showPrev() {
    if (currentIndex > 0) {
      open(currentIndex - 1);
    }
  }

  function showNext() {
    if (currentIndex < galleryItems.length - 1) {
      open(currentIndex + 1);
    }
  }

  // Event listeners
  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => open(idx));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(idx);
      }
    });
  });

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (modal.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    }
  });

  return { open, close };
})();
```

## Verification Checklist

- [ ] **Hover effect**: Gallery item scales + glows + shows overlay with zoom icon
- [ ] **Click to open**: Lightbox opens with correct image and caption
- [ ] **Navigation**: Prev/Next buttons work, disabled at ends
- [ ] **Keyboard**: Arrow keys navigate, Esc closes
- [ ] **Click backdrop**: Closes lightbox
- [ ] **Focus trap**: Focus returns to gallery item after close
- [ ] **Body scroll lock**: Page doesn't scroll behind open lightbox
- [ ] **Counter**: Shows "1 / 12" correctly

## Risks

- **Low**: Z-index conflict with letter modal (letter modal is z:9998, lightbox is z:9999 → OK)
- **Low**: Large images may take time to load in lightbox → could add loading spinner in future

## Next Phase

→ **Phase 05**: Verification & Review (cross-browser testing, performance, accessibility audit).
