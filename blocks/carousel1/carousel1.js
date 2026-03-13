// js
import { fetchPlaceholders } from '../../scripts/placeholders.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel1');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel1-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel1-slide-indicator');
  indicators.forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel1-slide');
  if (!slides.length) return;

  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;

  const activeSlide = slides[realSlideIndex];

  // immediate accessibility focusability
  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));

  // Ensure the scroller aligns exactly to the slide
  const scroller = block.querySelector('.carousel1-slides');
  scroller.scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });

  // NEW: update active state immediately (no waiting for IntersectionObserver)
  updateActiveSlide(activeSlide);
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel1-slide-indicators');
  if (slideIndicators) {
    slideIndicators.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', (e) => {
        const slideIndicator = e.currentTarget.parentElement;
        showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
      });
    });
  }

  const prev = block.querySelector('.slide-prev');
  const next = block.querySelector('.slide-next');
  if (prev && next) {
    prev.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) - 1);
    });
    next.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) + 1);
    });
  }

  // Keep IntersectionObserver for passive sync (e.g., touch/drag scroll)
  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });

  block.querySelectorAll('.carousel1-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });

  // NEW: keyboard support (ArrowLeft / ArrowRight) when block is focused
  block.setAttribute('tabindex', '0');
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) + 1);
    }
  });

  // Keep the active slide aligned on resize (e.g., responsive image widths)
  window.addEventListener('resize', () => {
    const idx = parseInt(block.dataset.activeSlide || '0', 10);
    showSlide(block, idx);
  }, { passive: true });
}

function createSlide(row, slideIndex, carousel1Id) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel1-${carousel1Id}-slide-${slideIndex}`);
  slide.classList.add('carousel1-slide');

  // Keep your two-column expectation (image then content)
  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel1-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  // Ensure a heading provides a label if present
  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    if (!labeledBy.getAttribute('id')) {
      labeledBy.setAttribute('id', `carousel1-${carousel1Id}-label-${slideIndex}`);
    }
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carousel1Id = 0;
export default async function decorate(block) {
  carousel1Id += 1;
  block.setAttribute('id', `carousel1-${carousel1Id}`);

  // Detect visual variant via class or data-variant
  const variant = block.dataset.variant || [...block.classList].find((c) => c.startsWith('carousel1--'))?.replace('carousel1--', '') || 'hero';
  block.dataset.variant = variant; // normalize

  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel1 || 'carousel');

  // Container
  const container = document.createElement('div');
  container.classList.add('carousel1-slides-container');

  // Scroller (ul)
  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel1-slides');
  block.prepend(slidesWrapper);

  // Indicators & nav
  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.classList.add('carousel1-indicators-nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carousel1SlideControls || 'Carousel Slide Controls');

    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel1-slide-indicators');

    slideIndicatorsNav.append(slideIndicators);
    // Place nav inside the block so we can absolutely center it
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel1-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;
    container.append(slideNavButtons);
  }

  // Build slides
  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carousel1Id);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel1-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${(placeholders.showSlide || 'Show Slide')} ${idx + 1} ${(placeholders.of || 'of')} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
    // Start on the first slide aligned
    showSlide(block, 0);
  }
}
