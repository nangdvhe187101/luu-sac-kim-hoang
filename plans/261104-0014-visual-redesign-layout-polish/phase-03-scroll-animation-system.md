---
phase: 03
name: Scroll Animation System
duration: 2h
files:
  - app.js (add IntersectionObserver system)
  - styles.css (add scroll-reveal animations)
  - index.html (add data-attributes to animatable elements)
dependencies:
  - phase-01-asset-audit-categorization
---

# Phase 03: Scroll Animation System

## Goal

Thêm hiệu ứng fade-in + slide-up cho timeline images, decorative elements, và section headers khi người dùng cuộn xuống, tạo cảm giác "mở sách tranh dân gian từ từ".

## Current State

Timeline images (`.node-image-figure`) và text blocks xuất hiện đột ngột khi load page hoặc scroll. Không có animation nào.

## Desired Behavior

```
User scrolls down
    ↓
Element enters viewport (50% visible)
    ↓
Trigger CSS animation:
  - opacity: 0 → 1
  - transform: translateY(40px) → translateY(0)
  - duration: 0.8s ease-out
    ↓
Element stays visible (no reverse on scroll up)
```

## Implementation Strategy

### 1. Mark Animatable Elements in HTML

Add `data-scroll-reveal` attribute to elements that should animate on scroll:

**Target elements**:
- `.node-image-figure` (timeline images)
- `.story-node` (timeline text blocks)
- `.section-intro-header` (section titles)
- `.gallery-item` (gallery cards)

Edit `index.html`:

```html
<!-- Example: Timeline node -->
<article class="story-node" data-scroll-reveal data-chapter-index="0">
  <!-- ... -->
  <figure class="node-image-figure" data-scroll-reveal data-scroll-delay="200">
    <img src="..." alt="..." loading="lazy">
  </figure>
</article>

<!-- Gallery items -->
<div class="gallery-item" data-scroll-reveal data-scroll-delay="100">
  <!-- ... -->
</div>
```

**Optional**: `data-scroll-delay` for staggered reveals (in ms).

### 2. Add CSS Animation Classes

Add to `styles.css`:

```css
/* Scroll reveal initial state (before animation) */
[data-scroll-reveal] {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease-out,
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Revealed state (after entering viewport) */
[data-scroll-reveal].is-revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  [data-scroll-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

/* Optional: Different reveal styles for specific elements */
.node-image-figure[data-scroll-reveal] {
  transform: translateY(60px) scale(0.95);
}

.node-image-figure[data-scroll-reveal].is-revealed {
  transform: translateY(0) scale(1);
}

/* Stagger delay via custom property */
[data-scroll-reveal][data-scroll-delay] {
  transition-delay: calc(var(--scroll-delay, 0) * 1ms);
}
```

### 3. Implement Intersection Observer in app.js

Add new section after the parallax code (around line 240):

```javascript
/* ==========================================================================
   SCROLL-TRIGGERED REVEAL ANIMATIONS (INTERSECTION OBSERVER)
   ========================================================================== */

const scrollRevealObserver = (() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  // Skip observer if user prefers reduced motion
  if (prefersReducedMotion.matches) {
    document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
      el.classList.add('is-revealed');
    });
    return null;
  }

  const revealElements = document.querySelectorAll('[data-scroll-reveal]');
  if (!revealElements.length) return null;

  // Observer options: trigger when 50% of element is visible
  const observerOptions = {
    root: null, // viewport
    rootMargin: '0px 0px -10% 0px', // trigger slightly before element fully enters
    threshold: 0.15 // 15% visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('is-revealed')) {
        const delay = entry.target.dataset.scrollDelay || 0;
        
        if (delay > 0) {
          entry.target.style.setProperty('--scroll-delay', delay);
        }

        // Add revealed class (CSS transition will handle animation)
        entry.target.classList.add('is-revealed');
        
        // Unobserve after reveal (one-time animation, no reverse)
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all marked elements
  revealElements.forEach(el => observer.observe(el));

  return observer;
})();
```

### 4. Add Decorative Frame Overlays (Bonus)

Use unused decorative band images from Phase 01 inventory as section dividers:

**In HTML** (after each `.section-intro-header`):

```html
<div class="section-divider-ornament" data-scroll-reveal>
  <img src="assets/pptx-extracted/ppt/media/image14.png" alt="" loading="lazy">
</div>
```

**In CSS**:

```css
.section-divider-ornament {
  width: min(600px, 80vw);
  margin: 2rem auto;
  opacity: 0.7;
}

.section-divider-ornament img {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}
```

### 5. Timeline Image Frame Enhancement

Wrap timeline images with decorative medallion backgrounds:

**Option A**: CSS pseudo-element (simpler)

```css
.node-image-figure {
  position: relative;
  /* ... existing styles ... */
}

.node-image-figure::before {
  content: '';
  position: absolute;
  inset: -20px;
  background-image: url('assets/pptx-extracted/ppt/media/image28.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.15;
  z-index: -1;
  pointer-events: none;
}
```

**Option B**: HTML wrapper (more control)

```html
<div class="node-image-frame" data-scroll-reveal>
  <img class="frame-ornament" src="assets/.../image28.png" alt="" aria-hidden="true">
  <figure class="node-image-figure">
    <img src="assets/pdf_images/..." alt="...">
  </figure>
</div>
```

**Decision**: Use Option A (CSS pseudo) for Phase 03, reserve Option B for future customization.

## Verification Checklist

Manual testing at `http://localhost:8765/`:

- [ ] **Initial page load**: Timeline images below fold are invisible (opacity: 0)
- [ ] **Scroll down slowly**: Each image fades in + slides up when entering viewport
- [ ] **Stagger effect**: If multiple images in view, they appear with slight delay (100–200ms)
- [ ] **One-time reveal**: Scroll up then down again → images stay visible (no re-animation)
- [ ] **Reduced motion**: With system accessibility setting enabled → all images visible immediately
- [ ] **Performance**: Smooth 60fps scrolling, no jank
- [ ] **Gallery items**: Grid items also reveal on scroll

## Performance Considerations

**Intersection Observer** is performant (native browser API, no scroll event listeners), but:

- Limit observed elements to ~50–100 max (current plan: ~30 elements OK)
- Unobserve after reveal to free memory
- Use `loading="lazy"` on images to defer offscreen image loads

## Risks

- **Low**: Older browsers (Safari < 12.1) don't support IntersectionObserver → provide polyfill or graceful degradation
  - **Mitigation**: Add check `if (!('IntersectionObserver' in window))` → reveal all immediately

## Next Phase

→ **Phase 04**: Gallery Lightbox & Hover Effects (independent, can run in parallel with Phase 03).
