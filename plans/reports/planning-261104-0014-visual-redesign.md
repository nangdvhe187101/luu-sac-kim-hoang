---
type: planning
created: 2026-11-04T00:14:00+07:00
plan: plans/261104-0014-visual-redesign-layout-polish
status: ready_for_execution
---

# Planning Report: Lưu Sắc Kim Hoàng - Visual Redesign & Layout Polish

## Executive Summary

Plan chi tiết đã được tạo để giải quyết 3 vấn đề chính của giao diện hiện tại:

1. **🔴 Hero Stage Overlap**: Nhân vật và thiệp 3D chồng lên nhau xấu xí
2. **🟠 Static Timeline**: Không có scroll animations, trải nghiệm flat
3. **🟠 Basic Gallery**: Thiếu hover effects và lightbox modal

## Plan Structure

```
plans/261104-0014-visual-redesign-layout-polish/
├── plan.md (index, overview, acceptance criteria)
├── phase-01-asset-audit-categorization.md
├── phase-02-hero-stage-spatial-fix.md
├── phase-03-scroll-animation-system.md
├── phase-04-gallery-lightbox-hover-effects.md
└── phase-05-verification-review.md
```

**Total Estimated Effort**: ~6 hours (1 focused work session)

## Key Decisions Made

### Phase 02: Hero Stage - "Wide Stage" Approach Selected

**Chosen**: Approach A (spatial separation)
- Push characters to `left: -8%`, `right: -8%` (from `2%`)
- Raise envelope z-index to 6 (above characters at z:3)
- Reduce ribbon overflow to `bottom: -10px` (from `-25px`)

**Rejected**: Approach B (3D depth via translateZ)
- Reason: More complex, Safari compatibility risk, harder to debug

**Trade-off accepted**: Characters partially cropped at <1200px (will be addressed in future mobile responsive phase).

### Phase 03: Scroll Animations - Intersection Observer

**Technology**: Native `IntersectionObserver` API (no polyfill needed for modern browsers)

**Animation strategy**:
- One-time fade-in + slide-up (no reverse on scroll back up)
- 15% visibility threshold to trigger
- Stagger delays via `data-scroll-delay` attribute
- Graceful degradation: `prefers-reduced-motion` → all visible immediately

### Phase 04: Gallery Lightbox - Vanilla JS Modal

**No library dependencies**: Custom lightbox implementation
- Full keyboard navigation (arrows, Esc)
- Focus trap and restoration
- Body scroll lock when open
- Click backdrop to close

**Accessibility**: ARIA attributes, semantic HTML, WCAG AA contrast.

## Asset Utilization Strategy

**Current**: 6/86 images used (7%)  
**Target**: 23/86 images used (27%) — +17 new assets

**New additions planned**:
- Section dividers: image14, image22, image8 (decorative bands)
- Timeline frames: image28, image84 (medallion overlays)
- Gallery expansions: 12 new items with ornament accents

## Risk Assessment

| Phase | Risk Level | Mitigation |
|-------|-----------|------------|
| Phase 01 | Low | Read-only audit, no code changes |
| Phase 02 | Medium | Character crop <1200px → document as known issue, defer to mobile phase |
| Phase 03 | Low | IntersectionObserver well-supported; fallback for reduced-motion |
| Phase 04 | Low | Lightbox z-index 9999 > letter modal 9998 → no conflict |
| Phase 05 | Low | Verification only, rollback plan documented |

## Acceptance Criteria Summary

✅ **Must Have** (blocking):
1. Hero section: No overlap between characters and envelope at 1440px
2. Timeline: Fade-in animations on scroll (60fps smooth)
3. Gallery: Working lightbox with keyboard nav
4. Performance: No regressions, ≥50fps scroll
5. Accessibility: WCAG AA compliant

⚠️ **Nice to Have** (non-blocking):
- Decorative frame overlays on timeline images
- Stagger animations for multiple gallery items
- 20+ new assets utilized (target 17+ acceptable)

## Dependencies & Constraints

**External dependencies**: None (vanilla HTML/CSS/JS only)

**Browser support**:
- Chrome 104+, Safari 14.1+, Firefox 55+ (IntersectionObserver, CSS translate property)
- Graceful degradation for older browsers

**Constraints respected**:
- ✅ No framework changes (kept vanilla JS)
- ✅ No backend modifications
- ✅ Works on localhost:8765 immediately
- ✅ Preserves existing content and sections

## Implementation Order

**Sequential** (phases 02, 05 depend on prior phases):
1. Phase 01: Asset audit (independent, informational)
2. Phase 02: Hero stage fix (depends on Phase 01 inventory)
3. Phase 03: Scroll animations (independent, can run parallel with 04)
4. Phase 04: Gallery lightbox (independent, can run parallel with 03)
5. Phase 05: Verification (depends on 02-04 completion)

**Parallel opportunities**:
- Phase 03 and 04 can be implemented simultaneously (no file conflicts)

## Next Steps

### To Execute This Plan

Run `/ak:cook` with plan path:

```bash
/ak:cook plans/261104-0014-visual-redesign-layout-polish
```

Or execute phases manually:
1. Read `phase-01-asset-audit-categorization.md` → create inventory
2. Read `phase-02-hero-stage-spatial-fix.md` → edit CSS
3. Read `phase-03-scroll-animation-system.md` → add IntersectionObserver
4. Read `phase-04-gallery-lightbox-hover-effects.md` → add modal
5. Read `phase-05-verification-review.md` → test and report

### Verification Checklist

After implementation, verify on `http://localhost:8765/`:

- [ ] Reload page with Cmd+Shift+R (clear cache)
- [ ] Hero section: No visual overlap at 1440px viewport
- [ ] Scroll down: Timeline images fade in smoothly
- [ ] Gallery: Hover shows overlay, click opens lightbox
- [ ] Keyboard: Arrow keys navigate lightbox, Esc closes
- [ ] Performance: Smooth 60fps scrolling (check DevTools FPS meter)

## Success Metrics

**Visual Quality**:
- Professional layout matching modern wedding/event websites
- No overlapping elements at primary viewport (1440px)
- 27% asset utilization (up from 7%)

**User Experience**:
- Engaging scroll animations without being distracting
- Intuitive gallery lightbox with full keyboard support
- Smooth performance (≥50fps, ideally 60fps)

**Technical Quality**:
- WCAG AA accessibility compliance
- Cross-browser compatibility (Chrome, Safari, Firefox)
- Zero console errors
- No new dependencies added

## Open Questions

None remaining — all architectural decisions made, approaches selected, and trade-offs documented in phase files.

---

**Plan Status**: ✅ **Ready for Execution**  
**Next Command**: `/ak:cook plans/261104-0014-visual-redesign-layout-polish` or manual phase-by-phase implementation  
**Estimated Completion**: 6 hours (including verification)
