// ==========================================================================
// STOCKPRED PRESENTATION DECK CONTROLLER
// Handles Slide Navigation, Fullscreen, Speaker Notes, and Dynamic Animations
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const progressBar = document.getElementById('topProgress');
  const slideCounter = document.getElementById('slideCounter');
  const notesDrawer = document.getElementById('notesDrawer');
  const notesContent = document.getElementById('notesContent');
  
  let currentSlideIndex = 0;
  const totalSlides = slides.length;

  function updateSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    
    currentSlideIndex = index;

    // Reset window scroll to prevent any native anchor jump
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Toggle blackout mode on body for pure black standby screen
    const isBlackout = currentSlideIndex === 0;
    document.body.classList.toggle('is-blackout', isBlackout);

    // Update active slide classes and reset scroll position to top
    slides.forEach((slide, idx) => {
      const isActive = idx === currentSlideIndex;
      slide.classList.toggle('active', isActive);
      if (isActive) {
        slide.scrollTop = 0;
      }
    });

    // Sync URL hash for direct linking/refresh without page jump
    const activeSlide = slides[currentSlideIndex];
    if (activeSlide && activeSlide.id) {
      history.replaceState(null, '', `#${activeSlide.id}`);
    }

    // Update Top Progress Bar
    if (progressBar) {
      if (isBlackout) {
        progressBar.style.width = '0%';
      } else {
        const progressPct = (currentSlideIndex / (totalSlides - 1)) * 100;
        progressBar.style.width = `${progressPct}%`;
      }
    }

    // Update Counter
    if (slideCounter) {
      if (isBlackout) {
        slideCounter.textContent = 'STANDBY';
      } else {
        slideCounter.textContent = `${currentSlideIndex} / ${totalSlides - 1}`;
      }
    }

    // Update Speaker Notes
    updateSpeakerNotes();

    // Trigger SVG animations if on specific slides
    triggerSlideAnimations(currentSlideIndex);
  }

  function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
      updateSlide(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      updateSlide(currentSlideIndex - 1);
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Fullscreen error: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  function toggleNotes() {
    if (notesDrawer) {
      notesDrawer.classList.toggle('open');
    }
  }

  function updateSpeakerNotes() {
    if (!notesContent) return;
    const activeSlide = slides[currentSlideIndex];
    const notesTemplate = activeSlide.querySelector('.speaker-notes-data');
    if (notesTemplate) {
      notesContent.innerHTML = notesTemplate.innerHTML;
    } else {
      notesContent.innerHTML = '<div class="notes-talking-point"><span class="notes-bullet"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></span><span>Introduce the main concept of this slide clearly and invite questions.</span></div>';
    }
  }

  function triggerSlideAnimations(idx) {
    // Check if current slide has the animated trap path
    const activeSlide = slides[idx];
    const trapLine = activeSlide.querySelector('#animatedTrapPath');
    if (trapLine) {
      trapLine.style.strokeDashoffset = '1000';
      setTimeout(() => {
        trapLine.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(0.16, 1, 0.3, 1)';
        trapLine.style.strokeDashoffset = '0';
      }, 200);
    }
  }

  // Keyboard Event Listeners
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
      case 'Backspace':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        updateSlide(0);
        break;
      case 'End':
        e.preventDefault();
        updateSlide(totalSlides - 1);
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 's':
      case 'S':
        toggleNotes();
        break;
    }
  });

  // Dock Buttons Event Listeners
  document.getElementById('btnPrev')?.addEventListener('click', prevSlide);
  document.getElementById('btnNext')?.addEventListener('click', nextSlide);
  document.getElementById('btnNotes')?.addEventListener('click', toggleNotes);
  document.getElementById('btnFullscreen')?.addEventListener('click', toggleFullscreen);
  document.getElementById('closeNotesBtn')?.addEventListener('click', toggleNotes);
  // Click on blackout slide to start presentation
  const blackoutSlide = document.getElementById('slide-blackout');
  if (blackoutSlide) {
    blackoutSlide.addEventListener('click', nextSlide);
  }


  // Initialize First Slide (Honor URL hash if present)
  function getInitialSlideIndex() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#slide-')) {
      const targetId = hash.substring(1);
      const targetSlide = document.getElementById(targetId);
      if (targetSlide) {
        const idx = Array.from(slides).indexOf(targetSlide);
        if (idx !== -1) return idx;
      }
    }
    return 0;
  }

  updateSlide(getInitialSlideIndex());
});
