---
phase: 05
name: Verification & Review
duration: 45min
files:
  - All modified files from phases 02-04
  - docs/verification-report.md (create)
dependencies:
  - phase-02-hero-stage-spatial-fix
  - phase-03-scroll-animation-system
  - phase-04-gallery-lightbox-hover-effects
---

# Phase 05: Verification & Review

## Goal

Cross-browser testing, performance profiling, accessibility audit, và tổng kết các cải thiện đã thực hiện.

## Verification Matrix

### 1. Visual Regression Testing

**Hero Section Spatial Fix (Phase 02)**:

| Test Case | Expected | Viewport | Status |
|-----------|----------|----------|--------|
| Characters don't overlap envelope | ✅ Clear separation | 1440px | ⬜ |
| Z-ordering correct | Envelope above characters | All | ⬜ |
| Ribbon clearance | Doesn't cover player | All | ⬜ |
| Parallax still works | Mouse movement → layer shift | Desktop | ⬜ |
| Breathing animations | Smooth, no stutter | All | ⬜ |
| No horizontal scroll | Characters clipped, no scrollbar | <1200px | ⬜ |

**Scroll Animations (Phase 03)**:

| Test Case | Expected | Status |
|-----------|----------|--------|
| Initial state | Timeline images invisible (opacity: 0) | ⬜ |
| Scroll reveal | Fade-in + slide-up on enter viewport | ⬜ |
| Stagger effect | Multiple items appear with delay | ⬜ |
| One-time animation | No re-trigger on scroll up/down | ⬜ |
| Reduced motion | All visible immediately | ⬜ |
| Performance | Smooth 60fps scrolling | ⬜ |

**Gallery Lightbox (Phase 04)**:

| Test Case | Expected | Status |
|-----------|----------|--------|
| Hover effect | Scale + glow + overlay | ⬜ |
| Click opens lightbox | Full-screen modal with image | ⬜ |
| Prev/Next navigation | Buttons work, disabled at ends | ⬜ |
| Keyboard nav | Arrow keys + Esc | ⬜ |
| Click backdrop closes | Returns focus to gallery item | ⬜ |
| Body scroll lock | Page doesn't scroll behind modal | ⬜ |

### 2. Cross-Browser Testing

Test on:

- [ ] **Chrome 120+** (primary, 1440px): All features
- [ ] **Safari 17+** (macOS): CSS 3D transforms, Intersection Observer
- [ ] **Firefox 120+**: Parallax, scroll animations
- [ ] **Mobile Safari** (iPhone 15): Touch interactions, reduced viewport
- [ ] **Chrome Mobile** (Android): Performance on lower-end GPU

**Known compatibility**:
- Intersection Observer: Safari 12.1+, Chrome 58+, Firefox 55+ ✅ (well-supported)
- CSS `translate` property (independent): Chrome 104+, Safari 14.1+ ✅
- CSS Grid: All modern browsers ✅

### 3. Performance Profiling

Use Chrome DevTools Performance tab:

**Metrics to check**:
- [ ] **FPS during scroll**: Target 60fps, acceptable ≥50fps
- [ ] **Layout shifts (CLS)**: Target <0.1 (Core Web Vitals)
- [ ] **Paint time**: Each scroll reveal should be <16ms
- [ ] **Memory**: No memory leaks from IntersectionObserver (check after 50+ scrolls)
- [ ] **Image loading**: Lazy-load working correctly (offscreen images not loaded)

**Throttling test**:
- [ ] CPU: 4x slowdown → still usable
- [ ] Network: Fast 3G → images load progressively

### 4. Accessibility Audit

**Keyboard Navigation**:
- [ ] Tab through gallery items → focus visible
- [ ] Enter/Space opens lightbox from gallery item
- [ ] Arrow keys navigate in lightbox
- [ ] Esc closes lightbox
- [ ] Focus returns to triggering element after close

**Screen Reader**:
- [ ] Gallery items have descriptive alt text
- [ ] Lightbox has `role="dialog"` and `aria-modal="true"`
- [ ] Lightbox buttons have `aria-label`
- [ ] `aria-hidden` toggles correctly on open/close
- [ ] Decorative images (ornaments) have `alt=""` or `aria-hidden="true"`

**Color Contrast**:
- [ ] Hero tagline text shadow: WCAG AA compliant (4.5:1 minimum)
- [ ] Gallery overlay text: White on dark gradient ✅
- [ ] Lightbox caption: Cream on dark background ✅

**Motion Preferences**:
- [ ] `prefers-reduced-motion: reduce` → all animations disabled
- [ ] Scroll reveals appear immediately
- [ ] Parallax disabled

### 5. Asset Utilization Audit (Phase 01 Follow-up)

**Current usage** (before redesign):
- 6 images: image4, image38, image45, image50, image51, image28, image35

**After Phase 02-04**:
- [ ] Hero stage: Same 6 (unchanged, but better positioned)
- [ ] Section dividers: +3 decorative bands (image14, image22, image8)
- [ ] Timeline frames: +2 medallion overlays (image28 pseudo-element, image84)
- [ ] Gallery: +12 new gallery items with ornament hover accents

**Total new assets added**: ~17 files (target was ≥20, acceptable if <20 due to visual balance constraints).

### 6. Code Quality Review

**CSS**:
- [ ] No `!important` added (except existing ones)
- [ ] Consistent naming convention (kebab-case)
- [ ] Comments for complex selectors
- [ ] Media queries organized at end of file

**JavaScript**:
- [ ] No global variable pollution (use IIFE or const closures)
- [ ] Event listeners properly cleaned up (IntersectionObserver unobserve after reveal)
- [ ] Error handling for missing DOM elements (`if (!element) return`)
- [ ] No console.log left in production code

**HTML**:
- [ ] Valid semantic markup (no div soup where possible)
- [ ] `loading="lazy"` on all below-fold images
- [ ] ARIA attributes correct (`aria-hidden`, `aria-label`, `role`)

## Verification Report Template

Create `docs/verification-report.md`:

```markdown
# Verification Report: Visual Redesign & Layout Polish

**Date**: 2026-11-04  
**Plan**: `plans/261104-0014-visual-redesign-layout-polish/`  
**Phases Completed**: 02, 03, 04  
**Tester**: [Automated + Manual]

## Summary

✅ **Passed**: X / Y tests  
⚠️ **Warnings**: Z issues (non-blocking)  
❌ **Failed**: 0 critical issues

## Detailed Results

### Hero Stage Spatial Fix
- ✅ Characters no longer overlap envelope at 1440px
- ✅ Z-index layering correct (envelope z:6 > characters z:3)
- ✅ Ribbon clearance: bottom -10px (was -25px), no player overlap
- ✅ Parallax functional after position changes
- ⚠️ Characters partially cropped at 1024px (expected, mobile pass needed)

### Scroll Animations
[...]

### Gallery Lightbox
[...]

## Performance Metrics
- **Scroll FPS**: 58-60fps (target: ≥50)
- **CLS**: 0.08 (target: <0.1) ✅
- **LCP**: 2.1s (target: <2.5s) ✅

## Accessibility Score
- **Keyboard Nav**: 100% ✅
- **Screen Reader**: All landmarks + labels present ✅
- **Color Contrast**: WCAG AA compliant ✅

## Browser Compatibility
- Chrome 120: ✅ All features work
- Safari 17: ✅ No issues
- Firefox 120: ✅ No issues
- Mobile: ⚠️ Needs dedicated responsive pass (out of scope)

## Asset Utilization
- **Before**: 6/86 images used (7%)
- **After**: 23/86 images used (27%) — +17 new assets ✅

## Recommendations
1. Schedule Phase 06: Mobile Responsive Polish (fix character crop <1024px)
2. Add loading spinner for lightbox large images (UX enhancement)
3. Consider lazy-loading decorative ornaments (performance optimization)

## Sign-off
- [ ] Visual QA passed
- [ ] Performance acceptable
- [ ] Accessibility compliant
- [ ] Ready for user acceptance testing
```

## Rollback Plan

If critical issues found:

1. **Hero stage broken**: Revert Phase 02 CSS changes (git checkout styles.css lines 318-448)
2. **Scroll animations jank**: Disable IntersectionObserver, add `.is-revealed` to all elements by default
3. **Lightbox unusable**: Comment out lightbox CSS/JS, revert to simple gallery grid

## Success Criteria

All of these must pass:

- [ ] No visual regressions from original design (except intentional spacing fixes)
- [ ] 60fps scroll performance maintained
- [ ] Lightbox keyboard accessible
- [ ] No console errors on any browser
- [ ] User acceptance: "Nhìn chuyên nghiệp hơn, không còn ảnh chồng lấn"

## Next Steps After Phase 05

**If all tests pass**:
1. Create git commit with conventional commit message:
   ```
   feat(ui): redesign hero stage layout and add scroll animations
   
   - Fix character/envelope overlap in hero section (z-index + spacing)
   - Add Intersection Observer scroll-reveal animations for timeline
   - Implement gallery lightbox modal with keyboard nav
   - Utilize 17 additional PPTX assets for decorative elements
   
   Closes: visual-redesign-plan
   ```

2. Optional: Generate `/ak:journal` entry summarizing changes

3. Archive plan: Move to `plans/archive/261104-0014-visual-redesign-layout-polish/`

**If issues found**:
- Document in verification report
- Create Phase 06 to address (or rollback affected phase)

---

**Estimated Time**: 45 minutes (30min manual testing + 15min report writing)
