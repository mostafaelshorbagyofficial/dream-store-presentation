import { presentationData } from './data.js';

// Image Player State
let playerIndex = 0;
let isAutoplay = false;
let autoplayTimer = null;
let currentZoom = 1;
const AUTOPLAY_DELAY = 4000;

// Slides Meta
const slides = presentationData.sections.map((s, idx) => ({
  id: s.id,
  num: idx + 1,
  titleEn: s.titleEn,
  titleAr: s.titleAr,
  image: `/assets/${idx + 1}.jpeg`
}));

// DOM Elements
const modal = document.getElementById('image-player-modal');
const mainImage = document.getElementById('player-main-image');
const badge = document.getElementById('player-slide-badge');
const titleEn = document.getElementById('player-slide-title');
const titleAr = document.getElementById('player-slide-ar');
const thumbStrip = document.getElementById('player-thumbnail-strip');

const btnClose = document.getElementById('player-btn-close');
const btnNext = document.getElementById('player-btn-next');
const btnPrev = document.getElementById('player-btn-prev');
const btnAutoplay = document.getElementById('player-btn-autoplay');
const iconPlay = document.getElementById('player-icon-play');
const textPlay = document.getElementById('player-text-play');

const btnZoomIn = document.getElementById('player-btn-zoom-in');
const btnZoomOut = document.getElementById('player-btn-zoom-out');
const btnZoomReset = document.getElementById('player-btn-zoom-reset');
const btnFullscreen = document.getElementById('player-btn-fullscreen');

const btnOpenHeader = document.getElementById('btn-open-gallery-header');

// Initialize
function init() {
  renderThumbnails();
  setupEventListeners();
  refreshLucide();
}

// Render Thumbnail Strip
function renderThumbnails() {
  if (!thumbStrip) return;
  thumbStrip.innerHTML = '';
  slides.forEach((s, idx) => {
    const thumb = document.createElement('button');
    thumb.className = `shrink-0 w-12 sm:w-16 h-8 sm:h-10 rounded-lg overflow-hidden border-2 transition-all duration-200 relative group ${
      idx === playerIndex ? 'border-[#00D9FF] scale-105 shadow-[0_0_10px_#00D9FF]' : 'border-white/20 opacity-60 hover:opacity-100 hover:border-[#6A3CF0]'
    }`;
    thumb.innerHTML = `
      <img src="${s.image}" alt="${s.titleEn}" class="w-full h-full object-cover">
      <span class="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] font-bold text-white font-en">${s.id}</span>
    `;
    thumb.addEventListener('click', () => {
      goToPlayerSlide(idx);
    });
    thumbStrip.appendChild(thumb);
  });
}

function updateThumbnails() {
  if (!thumbStrip) return;
  const children = thumbStrip.children;
  for (let i = 0; i < children.length; i++) {
    if (i === playerIndex) {
      children[i].className = 'shrink-0 w-12 sm:w-16 h-8 sm:h-10 rounded-lg overflow-hidden border-2 transition-all duration-200 relative group border-[#00D9FF] scale-105 shadow-[0_0_10px_#00D9FF] opacity-100';
      children[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      children[i].className = 'shrink-0 w-12 sm:w-16 h-8 sm:h-10 rounded-lg overflow-hidden border-2 transition-all duration-200 relative group border-white/20 opacity-60 hover:opacity-100 hover:border-[#6A3CF0]';
    }
  }
}

// Open Player Modal
export function openPlayer(slideNum = 1) {
  playerIndex = Math.max(0, Math.min(slides.length - 1, slideNum - 1));
  currentZoom = 1;
  applyZoom();

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';

  updatePlayerView();
  refreshLucide();
}

// Close Player Modal
export function closePlayer() {
  stopAutoplay();
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = '';
}

// Go to Slide
function goToPlayerSlide(idx) {
  playerIndex = (idx + slides.length) % slides.length;
  currentZoom = 1;
  applyZoom();
  updatePlayerView();
}

function playerNext() {
  goToPlayerSlide(playerIndex + 1);
}

function playerPrev() {
  goToPlayerSlide(playerIndex - 1);
}

function updatePlayerView() {
  const current = slides[playerIndex];
  if (!current) return;

  // Fade transition
  mainImage.style.opacity = '0';
  setTimeout(() => {
    mainImage.src = current.image;
    mainImage.alt = current.titleEn;
    badge.textContent = current.id;
    titleEn.textContent = `${current.id} — ${current.titleEn}`;
    titleAr.textContent = current.titleAr;
    mainImage.style.opacity = '1';
  }, 120);

  updateThumbnails();
}

// Autoplay Toggle
function toggleAutoplay() {
  if (isAutoplay) {
    stopAutoplay();
  } else {
    startAutoplay();
  }
}

function startAutoplay() {
  isAutoplay = true;
  iconPlay.setAttribute('data-lucide', 'pause');
  if (textPlay) textPlay.textContent = 'إيقاف مؤقت';
  btnAutoplay.classList.add('bg-[#6A3CF0]');
  refreshLucide();

  autoplayTimer = setInterval(() => {
    playerNext();
  }, AUTOPLAY_DELAY);
}

function stopAutoplay() {
  isAutoplay = false;
  if (autoplayTimer) clearInterval(autoplayTimer);
  autoplayTimer = null;
  iconPlay.setAttribute('data-lucide', 'play');
  if (textPlay) textPlay.textContent = 'تشغيل تلقائي';
  btnAutoplay.classList.remove('bg-[#6A3CF0]');
  refreshLucide();
}

// Zoom Functions
function applyZoom() {
  if (mainImage) {
    mainImage.style.transform = `scale(${currentZoom})`;
  }
}

function zoomIn() {
  currentZoom = Math.min(3, currentZoom + 0.25);
  applyZoom();
}

function zoomOut() {
  currentZoom = Math.max(0.75, currentZoom - 0.25);
  applyZoom();
}

function zoomReset() {
  currentZoom = 1;
  applyZoom();
}

// Fullscreen
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    modal.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Triggers across the page
  document.querySelectorAll('.open-player-trigger, .image-card-trigger').forEach(el => {
    el.addEventListener('click', (e) => {
      const slideNum = parseInt(el.getAttribute('data-slide') || '1', 10);
      openPlayer(slideNum);
    });
  });

  if (btnOpenHeader) {
    btnOpenHeader.addEventListener('click', () => openPlayer(1));
  }

  // Player Navigation Controls
  if (btnNext) btnNext.addEventListener('click', playerNext);
  if (btnPrev) btnPrev.addEventListener('click', playerPrev);
  if (btnClose) btnClose.addEventListener('click', closePlayer);
  if (btnAutoplay) btnAutoplay.addEventListener('click', toggleAutoplay);

  // Zoom Controls
  if (btnZoomIn) btnZoomIn.addEventListener('click', zoomIn);
  if (btnZoomOut) btnZoomOut.addEventListener('click', zoomOut);
  if (btnZoomReset) btnZoomReset.addEventListener('click', zoomReset);
  if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);

  // Double click main image to toggle zoom
  if (mainImage) {
    mainImage.addEventListener('dblclick', () => {
      if (currentZoom === 1) {
        currentZoom = 1.75;
      } else {
        currentZoom = 1;
      }
      applyZoom();
    });
  }

  // Keyboard navigation when modal is active
  window.addEventListener('keydown', (e) => {
    if (modal.classList.contains('hidden')) return;

    // RTL: Left Arrow goes to Next slide, Right Arrow goes to Previous slide
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      playerNext();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      playerPrev();
    } else if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      toggleAutoplay();
    } else if (e.key === 'Escape') {
      closePlayer();
    } else if (e.key === '+' || e.key === '=') {
      zoomIn();
    } else if (e.key === '-') {
      zoomOut();
    } else if (e.key === '0') {
      zoomReset();
    }
  });

  // Close when clicking modal backdrop outside controls
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.id === 'player-viewport') {
      closePlayer();
    }
  });
}

function refreshLucide() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Start
document.addEventListener('DOMContentLoaded', init);
