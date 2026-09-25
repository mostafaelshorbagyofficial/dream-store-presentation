import { presentationData } from './data.js';
import { initAudio, setSoundEnabled, isSoundEnabled, playSlideTransitionSound, playClickSound, playSuccessChime } from './audio.js';

let currentSlideIndex = 0;
const totalSlides = presentationData.sections.length;

// DOM Elements
const introScreen = document.getElementById('intro-screen');
const introPromedia = document.getElementById('intro-promedia');
const introDream = document.getElementById('intro-dream');
const btnStartPresentation = document.getElementById('btn-start-presentation');

const outroScreen = document.getElementById('outro-screen');
const btnReplay = document.getElementById('btn-replay');
const btnCloseOutro = document.getElementById('btn-close-outro');

const slideContainer = document.getElementById('presentation-slide-container');
const progressSegmentsContainer = document.getElementById('progress-segments-container');

const headerSectionBadge = document.getElementById('header-section-badge');
const headerSectionTitle = document.getElementById('header-section-title');

const currentSlideNum = document.getElementById('current-slide-num');
const currentSlideNameFooter = document.getElementById('current-slide-name-footer');
const btnPrevSlide = document.getElementById('btn-prev-slide');
const btnNextSlide = document.getElementById('btn-next-slide');

const btnToggleSound = document.getElementById('btn-toggle-sound');
const iconSound = document.getElementById('icon-sound');
const btnFullscreen = document.getElementById('btn-fullscreen');

const btnToggleMasterSlide = document.getElementById('btn-toggle-master-slide');
const masterSlideModal = document.getElementById('master-slide-modal');
const modalBadge = document.getElementById('modal-badge');
const modalTitle = document.getElementById('modal-title');
const modalImage = document.getElementById('modal-image');
const btnCloseModal = document.getElementById('btn-close-modal');

const btnToggleAgenda = document.getElementById('btn-toggle-agenda');
const agendaDrawer = document.getElementById('agenda-drawer');
const agendaListContainer = document.getElementById('agenda-list-container');
const btnCloseAgenda = document.getElementById('btn-close-agenda');

// Init Sequence
function init() {
  renderProgressSegments();
  renderAgendaList();
  setupIntroAnimation();
  setupEventListeners();
  renderSlide(0);
  refreshLucide();
}

// Opening Intro Sequence Animation
function setupIntroAnimation() {
  setTimeout(() => {
    introDream.classList.remove('opacity-0', 'translate-y-8');
    introDream.classList.add('opacity-100', 'translate-y-0');
  }, 1200);

  btnStartPresentation.addEventListener('click', () => {
    initAudio();
    playSuccessChime();
    introScreen.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      introScreen.style.display = 'none';
    }, 700);
  });
}

// Render 13 Progress Segments
function renderProgressSegments() {
  progressSegmentsContainer.innerHTML = '';
  presentationData.sections.forEach((sec, idx) => {
    const seg = document.createElement('button');
    seg.className = `flex-1 h-1.5 rounded-full transition-all duration-300 relative group ${idx === 0 ? 'bg-[#00D9FF] shadow-[0_0_8px_#00D9FF]' : 'bg-[#6A3CF0]/25 hover:bg-[#6A3CF0]/60'}`;
    seg.title = `${sec.id} - ${sec.titleAr} (${sec.titleEn})`;
    
    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'absolute bottom-full mb-2 right-1/2 translate-x-1/2 px-2.5 py-1 rounded-md bg-[#180A33] border border-[#6A3CF0]/60 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-40 shadow-xl';
    tooltip.innerHTML = `<span class="text-[#00D9FF] font-bold font-en">${sec.id}</span> ${sec.titleAr}`;
    seg.appendChild(tooltip);

    seg.addEventListener('click', () => {
      goToSlide(idx);
    });
    progressSegmentsContainer.appendChild(seg);
  });
}

function updateProgressSegments() {
  const segments = progressSegmentsContainer.children;
  for (let i = 0; i < segments.length; i++) {
    if (i < currentSlideIndex) {
      segments[i].className = 'flex-1 h-1.5 rounded-full transition-all duration-300 relative group bg-[#6A3CF0]';
    } else if (i === currentSlideIndex) {
      segments[i].className = 'flex-1 h-1.5 rounded-full transition-all duration-300 relative group bg-[#00D9FF] shadow-[0_0_10px_#00D9FF] scale-y-125';
    } else {
      segments[i].className = 'flex-1 h-1.5 rounded-full transition-all duration-300 relative group bg-[#6A3CF0]/20 hover:bg-[#6A3CF0]/50';
    }
  }
}

// Render Agenda List in Drawer
function renderAgendaList() {
  agendaListContainer.innerHTML = '';
  presentationData.sections.forEach((sec, idx) => {
    const item = document.createElement('button');
    item.className = `w-full p-3 rounded-2xl border transition-all flex items-center justify-between text-right ${
      idx === currentSlideIndex 
        ? 'bg-[#6A3CF0]/30 border-[#00D9FF] shadow-[0_0_15px_rgba(0,217,255,0.2)]' 
        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-[#6A3CF0]/40'
    }`;

    item.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="w-7 h-7 rounded-lg bg-[#6A3CF0]/40 border border-[#6A3CF0]/60 flex items-center justify-center font-bold text-xs text-[#00D9FF] font-en">
          ${sec.id}
        </span>
        <div>
          <h4 class="text-sm font-bold text-white">${sec.titleAr}</h4>
          <span class="text-[11px] text-gray-400 font-en uppercase">${sec.titleEn}</span>
        </div>
      </div>
      <i data-lucide="chevron-left" class="w-4 h-4 text-gray-400"></i>
    `;

    item.addEventListener('click', () => {
      goToSlide(idx);
      toggleAgenda(false);
    });

    agendaListContainer.appendChild(item);
  });
}

// Navigation Functions
function goToSlide(index) {
  if (index < 0 || index >= totalSlides) return;
  currentSlideIndex = index;
  playSlideTransitionSound();
  renderSlide(currentSlideIndex);
  updateProgressSegments();
  renderAgendaList();
}

function nextSlide() {
  if (currentSlideIndex < totalSlides - 1) {
    goToSlide(currentSlideIndex + 1);
  } else {
    // Show Outro screen
    showOutro();
  }
}

function prevSlide() {
  if (currentSlideIndex > 0) {
    goToSlide(currentSlideIndex - 1);
  }
}

function showOutro() {
  outroScreen.classList.remove('hidden');
  setTimeout(() => {
    outroScreen.classList.remove('opacity-0');
    outroScreen.classList.add('opacity-100', 'flex');
  }, 50);
  playSuccessChime();
}

function hideOutro() {
  outroScreen.classList.remove('opacity-100');
  outroScreen.classList.add('opacity-0');
  setTimeout(() => {
    outroScreen.classList.add('hidden');
    outroScreen.classList.remove('flex');
  }, 500);
}

// Render Master Slide into Viewport
function renderSlide(index) {
  const sec = presentationData.sections[index];

  // Update Header & Footer
  headerSectionBadge.textContent = sec.id;
  headerSectionTitle.textContent = `${sec.titleEn} — ${sec.titleAr}`;
  currentSlideNum.textContent = sec.id;
  currentSlideNameFooter.textContent = `${sec.titleEn} — ${sec.titleAr}`;

  btnPrevSlide.disabled = index === 0;
  if (index === totalSlides - 1) {
    btnNextSlide.innerHTML = `<span>الختام</span><i data-lucide="award" class="w-4 h-4 text-[#00D9FF]"></i>`;
  } else {
    btnNextSlide.innerHTML = `<span>التالي</span><i data-lucide="chevron-left" class="w-4 h-4"></i>`;
  }

  // Fade out current slide
  slideContainer.classList.add('slide-fade-enter');
  
  // Render specific slide content based on index
  let slideHtml = '';

  switch (sec.key) {
    case 'brand-challenge':
      slideHtml = renderSlide01(sec);
      break;
    case 'brand-identity':
      slideHtml = renderSlide02(sec);
      break;
    case 'the-big-idea':
      slideHtml = renderSlide03(sec);
      break;
    case 'the-geek':
      slideHtml = renderSlide04(sec);
      break;
    case 'content-dna':
      slideHtml = renderSlide05(sec);
      break;
    case 'dream-since-1998':
      slideHtml = renderSlide06(sec);
      break;
    case 'community':
      slideHtml = renderSlide07(sec);
      break;
    case 'entertainment':
      slideHtml = renderSlide08(sec);
      break;
    case 'products':
      slideHtml = renderSlide09(sec);
      break;
    case 'store-experience':
      slideHtml = renderSlide10(sec);
      break;
    case 'omnichannel-experience':
      slideHtml = renderSlide11(sec);
      break;
    case 'future-vision':
      slideHtml = renderSlide12(sec);
      break;
    case 'loyalty-rewards':
      slideHtml = renderSlide13(sec);
      break;
    default:
      slideHtml = `<div class="p-8">Slide ${sec.id}</div>`;
  }

  slideContainer.innerHTML = slideHtml;

  // Trigger animations & dynamic interactive listeners
  setTimeout(() => {
    slideContainer.classList.remove('slide-fade-enter');
    slideContainer.classList.add('slide-fade-enter-active');
    bindSlideInteractiveEvents(sec.key);
    refreshLucide();
  }, 50);
}

/* ========================================================
   SLIDE 01: BRAND CHALLENGE
======================================================== */
function renderSlide01(sec) {
  return `
    <div class="p-6 sm:p-10 flex flex-col justify-between h-full space-y-6">
      <!-- Section Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#6A3CF0]/25 pb-4">
        <div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-xl bg-gradient-to-r from-[#6A3CF0] to-[#2E1065] text-white font-black text-sm font-en border border-[#6A3CF0]/60">01</span>
            <h2 class="text-2xl sm:text-3xl font-black text-white font-en">${sec.titleEn}</h2>
            <span class="text-xl sm:text-2xl font-bold text-[#E9D8FF]">${sec.titleAr}</span>
          </div>
          <p class="text-sm text-gray-300 mt-1 max-w-2xl">${sec.summaryAr}</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="open-reference-btn px-3 py-1.5 rounded-xl bg-[#6A3CF0]/20 hover:bg-[#6A3CF0]/40 border border-[#6A3CF0]/40 text-xs font-semibold text-[#00D9FF] transition flex items-center gap-1.5" data-slide="1">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>معاينة السلايد 01</span>
          </button>
        </div>
      </div>

      <!-- Main Comparison Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <!-- CURRENT: Just a Retail Store -->
        <div class="rounded-2xl bg-[#130726]/80 border border-red-500/30 p-6 flex flex-col justify-between relative overflow-hidden group hover:border-red-500/50 transition">
          <div class="absolute -right-16 -top-16 w-36 h-36 bg-red-600/10 rounded-full blur-2xl"></div>
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold font-en uppercase border border-red-500/30">
                ${sec.current.titleEn} — ${sec.current.badge}
              </span>
              <span class="text-xs text-gray-400 font-medium">${sec.current.descAr}</span>
            </div>

            <h3 class="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
              <i data-lucide="alert-triangle" class="w-5 h-5 text-red-400"></i>
              <span>التحديات ونقاط الضعف الحالية:</span>
            </h3>

            <div class="space-y-2.5">
              ${sec.current.points.map(p => `
                <div class="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-start gap-3 hover:bg-black/50 transition">
                  <div class="w-6 h-6 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    ✕
                  </div>
                  <div>
                    <p class="text-xs sm:text-sm font-semibold text-gray-200">${p.ar}</p>
                    <span class="text-[11px] text-gray-400 font-en">${p.en}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-white/10 text-xs text-red-300/80 font-medium">
            ⚠️ النتيجة: تشابه مع المنافسين وصعوبة بناء ولاء مستدام.
          </div>
        </div>

        <!-- FUTURE: A Technology Brand -->
        <div class="rounded-2xl bg-gradient-to-br from-[#2E1065]/70 to-[#190A36]/90 border border-[#00D9FF]/40 p-6 flex flex-col justify-between relative overflow-hidden shadow-[0_0_30px_rgba(106,60,240,0.25)] group hover:border-[#00D9FF] transition">
          <div class="absolute -left-16 -bottom-16 w-44 h-44 bg-[#00D9FF]/15 rounded-full blur-3xl"></div>
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="px-3 py-1 rounded-lg bg-[#00D9FF]/20 text-[#00D9FF] text-xs font-bold font-en uppercase border border-[#00D9FF]/40">
                ${sec.future.titleEn} — ${sec.future.badge}
              </span>
              <span class="text-xs text-[#E9D8FF] font-medium">${sec.future.descAr}</span>
            </div>

            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <i data-lucide="sparkles" class="w-5 h-5 text-[#00D9FF]"></i>
              <span>رحلة العميل الجديدة مع البراند:</span>
            </h3>

            <!-- 5 Stages Journey Horizontal / Vertical -->
            <div class="grid grid-cols-1 sm:grid-cols-5 gap-2">
              ${sec.future.journey.map(j => `
                <div class="p-3 rounded-xl bg-[#6A3CF0]/25 border border-[#6A3CF0]/40 flex flex-col items-center text-center hover:bg-[#6A3CF0]/45 hover:border-[#00D9FF] hover:scale-105 transition transform">
                  <div class="w-8 h-8 rounded-full bg-[#00D9FF]/20 text-[#00D9FF] flex items-center justify-center mb-1.5">
                    <i data-lucide="${j.icon}" class="w-4 h-4"></i>
                  </div>
                  <span class="text-[11px] font-bold text-[#00D9FF] font-en uppercase">${j.en}</span>
                  <span class="text-xs font-bold text-white mb-1">${j.ar}</span>
                  <span class="text-[10px] text-gray-300 leading-tight">${j.desc}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Bottom Big Slogan -->
          <div class="mt-6 p-4 rounded-xl bg-[#0B0217]/80 border border-[#6A3CF0]/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
            <div>
              <h4 class="font-black text-sm sm:text-base text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E9D8FF] to-[#00D9FF] font-en">
                ${sec.future.bottomQuote.en}
              </h4>
              <p class="text-[11px] text-gray-300 font-en tracking-wider">${sec.future.bottomQuote.subEn}</p>
            </div>
            <div class="px-3 py-1 rounded-full bg-[#6A3CF0]/40 text-[#00D9FF] text-xs font-bold font-en border border-[#00D9FF]/40">
              1998 → TODAY → FUTURE
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ========================================================
   SLIDE 02: BRAND IDENTITY
======================================================== */
function renderSlide02(sec) {
  return `
    <div class="p-6 sm:p-10 flex flex-col justify-between h-full space-y-6">
      <!-- Section Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#6A3CF0]/25 pb-4">
        <div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-xl bg-gradient-to-r from-[#6A3CF0] to-[#2E1065] text-white font-black text-sm font-en border border-[#6A3CF0]/60">02</span>
            <h2 class="text-2xl sm:text-3xl font-black text-white font-en">${sec.titleEn}</h2>
            <span class="text-xl sm:text-2xl font-bold text-[#E9D8FF]">${sec.titleAr}</span>
          </div>
          <p class="text-sm text-gray-300 mt-1 max-w-2xl">${sec.leadAr}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full bg-[#6A3CF0]/20 text-[#00D9FF] text-xs font-semibold font-en border border-[#6A3CF0]/40">
            ${sec.quote}
          </span>
          <button class="open-reference-btn px-3 py-1.5 rounded-xl bg-[#6A3CF0]/20 hover:bg-[#6A3CF0]/40 border border-[#6A3CF0]/40 text-xs font-semibold text-[#00D9FF] transition flex items-center gap-1.5" data-slide="2">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>معاينة السلايد 02</span>
          </button>
        </div>
      </div>

      <!-- Identity Grid: Palette + Typography + Elements -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Color Palette -->
        <div class="rounded-2xl bg-[#190A36]/60 border border-[#6A3CF0]/30 p-5 flex flex-col justify-between">
          <h3 class="text-sm font-bold text-white mb-3 flex items-center justify-between">
            <span class="font-en text-[#00D9FF]">COLOR PALETTE</span>
            <span class="text-xs text-gray-400">الألوان الأساسية</span>
          </h3>
          <div class="space-y-2">
            ${sec.palette.map(c => `
              <div class="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between hover:border-[#6A3CF0]/50 transition">
                <div class="flex items-center gap-2.5">
                  <div class="w-6 h-6 rounded-lg shadow-md border border-white/20 shrink-0" style="background-color: ${c.hex}"></div>
                  <div>
                    <p class="text-xs font-bold text-white font-en">${c.nameEn}</p>
                    <p class="text-[11px] text-gray-300">${c.roleAr}</p>
                  </div>
                </div>
                <span class="text-[11px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded font-en">${c.hex}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Typography -->
        <div class="rounded-2xl bg-[#190A36]/60 border border-[#6A3CF0]/30 p-5 flex flex-col justify-between">
          <h3 class="text-sm font-bold text-white mb-3 flex items-center justify-between">
            <span class="font-en text-[#00D9FF]">TYPOGRAPHY</span>
            <span class="text-xs text-gray-400">الخطوط المستخدمة</span>
          </h3>
          <div class="p-4 rounded-xl bg-gradient-to-br from-[#6A3CF0]/20 to-black/50 border border-[#6A3CF0]/30 text-center mb-3">
            <span class="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#E9D8FF] font-en">Aa</span>
            <p class="text-xs text-[#00D9FF] font-bold mt-1">DREAM STORE FONT FAMILY</p>
          </div>
          <div class="space-y-1.5 text-xs">
            ${sec.typography.fonts.map(f => `
              <div class="p-2 rounded-lg bg-black/30 flex items-center justify-between">
                <span class="font-bold text-white font-en">${f.weight}</span>
                <span class="text-[11px] text-gray-300">${f.usage}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Brand Elements -->
        <div class="rounded-2xl bg-[#190A36]/60 border border-[#6A3CF0]/30 p-5 flex flex-col justify-between">
          <h3 class="text-sm font-bold text-white mb-3 flex items-center justify-between">
            <span class="font-en text-[#00D9FF]">BRAND ELEMENTS</span>
            <span class="text-xs text-gray-400">عناصر الهوية</span>
          </h3>
          <div class="grid grid-cols-2 gap-2.5">
            ${sec.brandElements.map(e => `
              <div class="p-3 rounded-xl bg-black/40 border border-[#6A3CF0]/25 text-center hover:border-[#00D9FF] transition">
                <p class="text-xs font-black text-white font-en mb-0.5">${e.nameEn}</p>
                <span class="text-[11px] font-bold text-[#00D9FF] block mb-1">${e.nameAr}</span>
                <p class="text-[10px] text-gray-400 leading-tight">${e.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Visual Applications Row -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-xs font-bold text-gray-300 font-en uppercase tracking-wider">VISUAL APPLICATIONS — تطبيق الهوية علي مختلف المنصات</h3>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          ${sec.applications.map((app, i) => `
            <div class="p-3 rounded-xl bg-[#2E1065]/40 border border-[#6A3CF0]/30 hover:bg-[#6A3CF0]/30 hover:border-[#00D9FF] transition flex flex-col justify-between text-center">
              <div>
                <span class="text-[10px] font-bold text-[#00D9FF] font-en uppercase block mb-1">${app.titleEn}</span>
                <h4 class="text-xs font-bold text-white mb-1">${app.titleAr}</h4>
              </div>
              <p class="text-[10px] text-gray-400 mt-2">${app.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ========================================================
   SLIDE 03: THE BIG IDEA
======================================================== */
function renderSlide03(sec) {
  return `
    <div class="p-6 sm:p-10 flex flex-col justify-between h-full space-y-6">
      <!-- Section Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#6A3CF0]/25 pb-4">
        <div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-xl bg-gradient-to-r from-[#6A3CF0] to-[#2E1065] text-white font-black text-sm font-en border border-[#6A3CF0]/60">03</span>
            <h2 class="text-2xl sm:text-3xl font-black text-white font-en">${sec.titleEn}</h2>
            <span class="text-xl sm:text-2xl font-bold text-[#E9D8FF]">${sec.titleAr}</span>
          </div>
          <p class="text-sm text-gray-300 mt-1 max-w-2xl">${sec.leadAr}</p>
        </div>
        <button class="open-reference-btn px-3 py-1.5 rounded-xl bg-[#6A3CF0]/20 hover:bg-[#6A3CF0]/40 border border-[#6A3CF0]/40 text-xs font-semibold text-[#00D9FF] transition flex items-center gap-1.5" data-slide="3">
          <i data-lucide="eye" class="w-3.5 h-3.5"></i>
          <span>معاينة السلايد 03</span>
        </button>
      </div>

      <!-- Cinematic Slogan Banner -->
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#2E1065] via-[#6A3CF0]/50 to-[#190A36] border border-[#00D9FF]/40 text-center relative overflow-hidden shadow-[0_0_40px_rgba(106,60,240,0.3)]">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,217,255,0.15)_0,transparent_70%)] pointer-events-none"></div>
        <span class="px-3 py-1 rounded-full bg-[#00D9FF]/20 text-[#00D9FF] text-xs font-bold font-en uppercase tracking-wider mb-2 inline-block">
          ${sec.coreHeadlineEn}
        </span>
        <h3 class="text-3xl sm:text-4xl font-black text-white mb-2">
          "${sec.coreHeadlineAr}"
        </h3>
        <p class="text-sm text-[#E9D8FF] max-w-xl mx-auto">
          التحول الاستراتيجي الأكبر في تاريخ العلامة التجارية منذ تأسيسها
        </p>
      </div>

      <!-- 3 Transformation Eras Timeline -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${sec.transformation.map((t, idx) => `
          <div class="p-4 rounded-2xl bg-[#190A36]/70 border border-[#6A3CF0]/30 hover:border-[#00D9FF] transition flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xl font-black text-[#00D9FF] font-en">${t.era}</span>
              <span class="text-xs font-bold px-2 py-0.5 rounded bg-[#6A3CF0]/40 text-white">${t.labelAr}</span>
            </div>
            <p class="text-xs text-gray-300 font-en mb-2">${t.descAr}</p>
            <p class="text-xs text-gray-400 bg-black/30 p-2.5 rounded-xl border border-white/5">${t.tagAr}</p>
          </div>
        `).join('')}
      </div>

      <!-- Strategic Pillars & Goals Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        ${sec.pillars.map(p => `
          <div class="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-[#6A3CF0] hover:bg-[#6A3CF0]/20 transition text-center flex flex-col items-center justify-between">
            <div class="w-8 h-8 rounded-full bg-[#6A3CF0]/30 text-[#00D9FF] flex items-center justify-center mb-2">
              <i data-lucide="${p.icon}" class="w-4 h-4"></i>
            </div>
            <h4 class="text-xs font-bold text-white mb-1">${p.titleAr}</h4>
            <span class="text-[10px] text-gray-400 font-en leading-tight">${p.titleEn}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ========================================================
   SLIDE 04: THE GEEK
======================================================== */
function renderSlide04(sec) {
  return `
    <div class="p-6 sm:p-10 flex flex-col justify-between h-full space-y-6">
      <!-- Section Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#6A3CF0]/25 pb-4">
        <div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-xl bg-gradient-to-r from-[#6A3CF0] to-[#2E1065] text-white font-black text-sm font-en border border-[#6A3CF0]/60">04</span>
            <h2 class="text-2xl sm:text-3xl font-black text-white font-en">${sec.titleEn}</h2>
            <span class="text-xl sm:text-2xl font-bold text-[#E9D8FF]">${sec.titleAr}</span>
          </div>
          <p class="text-sm text-gray-300 mt-1 max-w-2xl">${sec.leadAr}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full bg-[#6A3CF0]/30 text-[#00D9FF] text-xs font-bold font-en border border-[#6A3CF0]/50">
            ${sec.subQuote}
          </span>
          <button class="open-reference-btn px-3 py-1.5 rounded-xl bg-[#6A3CF0]/20 hover:bg-[#6A3CF0]/40 border border-[#6A3CF0]/40 text-xs font-semibold text-[#00D9FF] transition flex items-center gap-1.5" data-slide="4">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>معاينة السلايد 04</span>
          </button>
        </div>
      </div>

      <!-- Quote banner -->
      <div class="p-3.5 rounded-2xl bg-gradient-to-r from-[#6A3CF0]/30 to-[#00D9FF]/20 border border-[#00D9FF]/40 text-center">
        <span class="text-sm sm:text-base font-black text-white">
          " ${sec.quote} "
        </span>
      </div>

      <!-- 3 Executions Cards -->
      <div>
        <h3 class="text-xs font-bold text-[#00D9FF] font-en uppercase tracking-wider mb-3">3 EXECUTIONS — ثلاثة أشكال لنفس الشخصية</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${sec.executions.map((ex, i) => `
            <div class="p-5 rounded-2xl bg-[#190A36]/80 border border-[#6A3CF0]/30 hover:border-[#00D9FF] hover:scale-[1.02] transition flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="px-2.5 py-0.5 rounded bg-[#6A3CF0]/40 text-white font-black text-xs font-en">0${i+1}</span>
                  <span class="text-xs font-bold text-[#00D9FF] font-en">${ex.typeEn}</span>
                </div>
                <h4 class="text-base font-bold text-white mb-2">${ex.typeAr}</h4>
                <p class="text-xs text-gray-300 mb-4 leading-relaxed">${ex.desc}</p>
              </div>
              <div class="flex flex-wrap gap-1.5">
                ${ex.tags.map(t => `<span class="px-2 py-0.5 rounded-md bg-black/40 text-[10px] text-gray-300 font-en border border-white/5">✓ ${t}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Personality Traits & Expressions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Traits -->
        <div class="p-4 rounded-2xl bg-black/40 border border-white/10">
          <h4 class="text-xs font-bold text-gray-300 mb-3 flex items-center justify-between">
            <span class="font-en text-[#00D9FF]">PERSONALITY TRAITS</span>
            <span>سمات شخصيته</span>
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            ${sec.traits.map(t => `
              <div class="p-2 rounded-xl bg-[#2E1065]/40 border border-[#6A3CF0]/20 text-center">
                <span class="text-xs font-bold text-white block">${t.ar}</span>
                <span class="text-[10px] text-[#00D9FF] font-en">${t.en}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Usages -->
        <div class="p-4 rounded-2xl bg-black/40 border border-white/10">
          <h4 class="text-xs font-bold text-gray-300 mb-3 flex items-center justify-between">
            <span class="font-en text-[#00D9FF]">USAGE EXAMPLES</span>
            <span>قنوات واستخدامات الشخصية</span>
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
            ${sec.usages.map(u => `
              <div class="p-2 rounded-xl bg-[#6A3CF0]/20 border border-[#6A3CF0]/30 text-center">
                <span class="text-xs font-bold text-white block">${u.nameAr}</span>
                <span class="text-[10px] text-gray-400 font-en">${u.nameEn}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ========================================================
   SLIDE 05: CONTENT DNA
======================================================== */
function renderSlide05(sec) {
  return `
    <div class="p-6 sm:p-10 flex flex-col justify-between h-full space-y-6">
      <!-- Section Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#6A3CF0]/25 pb-4">
        <div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-xl bg-gradient-to-r from-[#6A3CF0] to-[#2E1065] text-white font-black text-sm font-en border border-[#6A3CF0]/60">05</span>
            <h2 class="text-2xl sm:text-3xl font-black text-white font-en">${sec.titleEn}</h2>
            <span class="text-xl sm:text-2xl font-bold text-[#E9D8FF]">${sec.titleAr}</span>
          </div>
          <p class="text-sm text-gray-300 mt-1 max-w-2xl">${sec.leadAr}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full bg-[#6A3CF0]/30 text-[#00D9FF] text-xs font-bold font-en border border-[#6A3CF0]/50">
            ${sec.quote}
          </span>
          <button class="open-reference-btn px-3 py-1.5 rounded-xl bg-[#6A3CF0]/20 hover:bg-[#6A3CF0]/40 border border-[#6A3CF0]/40 text-xs font-semibold text-[#00D9FF] transition flex items-center gap-1.5" data-slide="5">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>معاينة السلايد 05</span>
          </button>
        </div>
      </div>

      <!-- 7 Content Pillars Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        ${sec.pillars.map(p => `
          <div class="p-3.5 rounded-2xl bg-[#190A36]/80 border border-[#6A3CF0]/30 hover:border-[#00D9FF] hover:bg-[#2E1065]/80 transition flex flex-col justify-between group">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-black text-[#00D9FF] font-en">${p.num}</span>
                <i data-lucide="${p.icon}" class="w-4 h-4 text-[#E9D8FF]"></i>
              </div>
              <span class="text-[11px] font-bold text-[#00D9FF] font-en uppercase block mb-0.5">${p.nameEn}</span>
              <h4 class="text-sm font-bold text-white mb-2">${p.nameAr}</h4>
              <p class="text-[11px] text-gray-300 leading-relaxed mb-3">${p.desc}</p>
            </div>
            <div class="space-y-1 pt-2 border-t border-white/10">
              <span class="text-[9px] text-gray-400 font-bold block">أمثلة المحتوى:</span>
              ${p.examples.map(ex => `<div class="p-1.5 rounded-md bg-black/40 text-[10px] text-gray-200 border border-white/5">💡 ${ex}</div>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Content Formats & Bottom Slogan -->
      <div class="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-gray-300 font-en">CONTENT FORMATS:</span>
          <div class="flex flex-wrap gap-2">
            ${sec.formats.map(f => `
              <span class="px-3 py-1 rounded-xl bg-[#6A3CF0]/30 border border-[#6A3CF0]/40 text-xs text-white font-medium flex items-center gap-1.5">
                <i data-lucide="${f.icon}" class="w-3.5 h-3.5 text-[#00D9FF]"></i>
                <span>${f.nameAr}</span>
              </span>
            `).join('')}
          </div>
        </div>
        <div class="text-xs font-bold text-[#00D9FF] font-en tracking-wider">
          ${sec.subQuote}
        </div>
      </div>
    </div>
  `;
}

/* ========================================================
   SLIDE 06: DREAM SINCE 1998
======================================================== */
function renderSlide06(sec) {
  return `
    <div class="p-6 sm:p-10 flex flex-col justify-between h-full space-y-6">
      <!-- Section Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#6A3CF0]/25 pb-4">
        <div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-xl bg-gradient-to-r from-[#6A3CF0] to-[#2E1065] text-white font-black text-sm font-en border border-[#6A3CF0]/60">06</span>
            <h2 class="text-2xl sm:text-3xl font-black text-white font-en">${sec.titleEn}</h2>
            <span class="text-xl sm:text-2xl font-bold text-[#E9D8FF]">${sec.titleAr}</span>
          </div>
          <p class="text-sm text-gray-300 mt-1 max-w-2xl">${sec.leadAr}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full bg-[#6A3CF0]/30 text-[#00D9FF] text-xs font-bold font-en border border-[#6A3CF0]/50">
            ${sec.subQuote}
          </span>
          <button class="open-reference-btn px-3 py-1.5 rounded-xl bg-[#6A3CF0]/20 hover:bg-[#6A3CF0]/40 border border-[#6A3CF0]/40 text-xs font-semibold text-[#00D9FF] transition flex items-center gap-1.5" data-slide="6">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>معاينة السلايد 06</span>
          </button>
        </div>
      </div>

      <!-- Interactive 5-Era Timeline -->
      <div>
        <h3 class="text-xs font-bold text-[#00D9FF] font-en uppercase tracking-wider mb-3">CINEMATIC TIMELINE — 1998 TO THE FUTURE</h3>
        <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
          ${sec.timeline.map((t, i) => `
            <div class="p-4 rounded-2xl bg-[#190A36]/80 border border-[#6A3CF0]/30 hover:border-[#00D9FF] hover:bg-[#2E1065] transition flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00D9FF] font-en">${t.era}</span>
                  <i data-lucide="${t.icon}" class="w-4 h-4 text-[#E9D8FF]"></i>
                </div>
                <h4 class="text-sm font-bold text-white mb-1">${t.titleAr}</h4>
                <p class="text-xs text-gray-300 leading-relaxed">${t.descAr}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 7 Nostalgia Content Series -->
      <div>
        <h3 class="text-xs font-bold text-gray-300 font-en uppercase tracking-wider mb-3">CONTENT SERIES — سلاسل محتوى النوستالجيا</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          ${sec.series.map(s => `
            <div class="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-[#6A3CF0] transition flex flex-col justify-between">
              <div>
                <span class="text-xs font-bold text-[#00D9FF] font-en">${s.num}</span>
                <h4 class="text-xs font-bold text-white mb-1 mt-0.5">${s.titleAr}</h4>
              </div>
              <p class="text-[10px] text-gray-400 leading-tight mt-2">${s.descAr}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Quote footer -->
      <div class="p-3.5 rounded-2xl bg-gradient-to-r from-[#2E1065] to-[#6A3CF0]/40 border border-[#6A3CF0]/40 text-center">
        <span class="text-sm font-black text-white">
          " ${sec.quote} "
        </span>
      </div>
    </div>
  `;
}

/* ========================================================
   SLIDE 07: COMMUNITY
======================================================== */
function renderSlide07(sec) {
  return `
    <div class="p-6 sm:p-10 flex flex-col justify-between h-full space-y-6">
      <!-- Section Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#6A3CF0]/25 pb-4">
        <div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-xl bg-gradient-to-r from-[#6A3CF0] to-[#2E1065] text-white font-black text-sm font-en border border-[#6A3CF0]/60">07</span>
            <h2 class="text-2xl sm:text-3xl font-black text-white font-en">${sec.titleEn}</h2>
            <span class="text-xl sm:text-2xl font-bold text-[#E9D8FF]">${sec.titleAr}</span>
          </div>
          <p class="text-sm text-gray-300 mt-1 max-w-2xl">${sec.leadAr}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full bg-[#6A3CF0]/30 text-[#00D9FF] text-xs font-bold font-en border border-[#6A3CF0]/50">
            ${sec.subQuote}
          </span>
          <button class="open-reference-btn px-3 py-1.5 rounded-xl bg-[#6A3CF0]/20 hover:bg-[#6A3CF0]/40 border border-[#6A3CF0]/40 text-xs font-semibold text-[#00D9FF] transition flex items-center gap-1.5" data-slide="7">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>معاينة السلايد 07</span>
          </button>
        </div>
      </div>

      <!-- Why Community & 4 Action Pillars -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Why Community -->
        <div class="p-4 rounded-2xl bg-[#190A36]/70 border border-[#6A3CF0]/30">
          <h3 class="text-xs font-bold text-[#00D9FF] font-en uppercase mb-3">WHY COMMUNITY? — ليه المجتمع مهم؟</h3>
          <div class="grid grid-cols-2 gap-2.5">
            ${sec.whyCommunity.map(w => `
              <div class="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2.5">
                <i data-lucide="${w.icon}" class="w-4 h-4 text-[#00D9FF] shrink-0"></i>
                <div>
                  <h4 class="text-xs font-bold text-white">${w.titleAr}</h4>
                  <span class="text-[10px] text-gray-400 font-en">${w.en}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 4 Pillars -->
        <div class="p-4 rounded-2xl bg-[#190A36]/70 border border-[#6A3CF0]/30">
          <h3 class="text-xs font-bold text-[#00D9FF] font-en uppercase mb-3">OUR COMMUNITY PILLARS — أركان المجتمع</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            ${sec.pillars.map(p => `
              <div class="p-3 rounded-xl bg-[#6A3CF0]/20 border border-[#6A3CF0]/40 text-center flex flex-col justify-between">
                <div>
                  <i data-lucide="${p.icon}" class="w-4 h-4 text-[#00D9FF] mx-auto mb-1"></i>
                  <span class="text-xs font-black text-white font-en block">${p.en}</span>
                  <span class="text-xs font-bold text-[#E9D8FF] mb-1 block">${p.ar}</span>
                </div>
                <p class="text-[9px] text-gray-300 mt-1">${p.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 6 Community Experiences -->
      <div>
        <h3 class="text-xs font-bold text-gray-300 font-en uppercase tracking-wider mb-3">COMMUNITY EXPERIENCES — تجارب وفعاليات المجتمع</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          ${sec.experiences.map(e => `
            <div class="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-[#00D9FF] transition flex flex-col justify-between">
              <div>
                <span class="text-[10px] font-bold text-[#00D9FF] font-en uppercase block">${e.titleEn}</span>
                <h4 class="text-xs font-bold text-white mb-1">${e.titleAr}</h4>
              </div>
              <p class="text-[10px] text-gray-400 mt-2">${e.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Community Platforms row -->
      <div class="p-3 rounded-2xl bg-[#2E1065]/40 border border-[#6A3CF0]/30 flex flex-wrap items-center justify-between gap-2">
        <span class="text-xs font-bold text-[#E9D8FF]">منصات المجتمع:</span>
        <div class="flex flex-wrap gap-2">
          ${sec.platforms.map(pl => `
            <span class="px-3 py-1 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-200">
              <strong class="text-white font-en">${pl.name}:</strong> ${pl.descAr}
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ========================================================
   SLIDE 08: ENTERTAINMENT
======================================================== */
function renderSlide08(sec) {
  return `
    <div class="p-6 sm:p-10 flex flex-col justify-between h-full space-y-6">
      <!-- Section Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#6A3CF0]/25 pb-4">
        <div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-xl bg-gradient-to-r from-[#6A3CF0] to-[#2E1065] text-white font-black text-sm font-en border border-[#6A3CF0]/60">08</span>
            <h2 class="text-2xl sm:text-3xl font-black text-white font-en">${sec.titleEn}</h2>
            <span class="text-xl sm:text-2xl font-bold text-[#E9D8FF]">${sec.titleAr}</span>
          </div>
          <p class="text-sm text-gray-300 mt-1 max-w-2xl">${sec.leadAr}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full bg-[#6A3CF0]/30 text-[#00D9FF] text-xs font-bold font-en border border-[#6A3CF0]/50">
            ${sec.subQuote}
          </span>
          <button class="open-reference-btn px-3 py-1.5 rounded-xl bg-[#6A3CF0]/20 hover:bg-[#6A3CF0]/40 border border-[#6A3CF0]/40 text-xs font-semibold text-[#00D9FF] transition flex items-center gap-1.5" data-slide="8">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>معاينة السلايد 08</span>
          </button>
        </div>
      </div>

      <!-- 4 Entertainment Pillars -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        ${sec.pillars.map(p => `
          <div class="p-4 rounded-2xl bg-[#190A36]/80 border border-[#6A3CF0]/30 hover:border-[#00D9FF] transition flex flex-col justify-between text-center">
            <div>
              <i data-lucide="${p.icon}" class="w-5 h-5 text-[#00D9FF] mx-auto mb-2"></i>
              <span class="text-xs font-black text-white font-en block mb-1">${p.en}</span>
              <h4 class="text-xs font-bold text-[#E9D8FF] mb-1">${p.ar}</h4>
            </div>
            <p class="text-[10px] text-gray-400 mt-2 leading-relaxed">${p.desc}</p>
          </div>
        `).join('')}
      </div>

      <!-- 8 Content Examples Cards -->
      <div>
        <h3 class="text-xs font-bold text-gray-300 font-en uppercase tracking-wider mb-3">CONTENT EXAMPLES — أمثلة وتنسيقات المحتوى الترفيهي</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          ${sec.examples.map(ex => `
            <div class="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-[#6A3CF0] transition flex flex-col justify-between">
              <div>
                <span class="text-[10px] font-bold text-[#00D9FF] font-en block">${ex.titleEn}</span>
                <h4 class="text-xs font-bold text-white mb-1">${ex.titleAr}</h4>
              </div>
              <p class="text-[10px] text-gray-400 mt-2">${ex.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Quote banner -->
      <div class="p-3.5 rounded-2xl bg-gradient-to-r from-[#6A3CF0]/30 to-[#00D9FF]/20 border border-[#00D9FF]/40 text-center">
        <span class="text-sm font-black text-white">
          " ${sec.quote} "
        </span>
      </div>
    </div>
  `;
}

/* ========================================================
   SLIDE 09: PRODUCTS
======================================================== */
function renderSlide09(sec) {
  return `
    <div class="p-6 sm:p-10 flex flex-col justify-between h-full space-y-6">
      <!-- Section Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#6A3CF0]/25 pb-4">
        <div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-xl bg-gradient-to-r from-[#6A3CF0] to-[#2E1065] text-white font-black text-sm font-en border border-[#6A3CF0]/60">09</span>
            <h2 class="text-2xl sm:text-3xl font-black text-white font-en">${sec.titleEn}</h2>
            <span class="text-xl sm:text-2xl font-bold text-[#E9D8FF]">${sec.titleAr}</span>
          </div>
          <p class="text-sm text-gray-300 mt-1 max-w-2xl">${sec.leadAr}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full bg-[#6A3CF0]/30 text-[#00D9FF] text-xs font-bold font-en border border-[#6A3CF0]/50">
            ${sec.subQuote}
          </span>
          <button class="open-reference-btn px-3 py-1.5 rounded-xl bg-[#6A3CF0]/20 hover:bg-[#6A3CF0]/40 border border-[#6A3CF0]/40 text-xs font-semibold text-[#00D9FF] transition flex items-center gap-1.5" data-slide="9">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>معاينة السلايد 09</span>
          </button>
        </div>
      </div>

      <!-- 8 Categories Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        ${sec.categories.map(c => `
          <div class="p-3 rounded-2xl bg-[#190A36]/80 border border-[#6A3CF0]/30 hover:border-[#00D9FF] hover:bg-[#2E1065] transition flex flex-col items-center text-center justify-between">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#6A3CF0]/30 text-[#00D9FF] flex items-center justify-center mx-auto mb-2">
                <i data-lucide="${c.icon}" class="w-4 h-4"></i>
              </div>
              <span class="text-[10px] font-bold text-[#00D9FF] font-en uppercase block">${c.en}</span>
              <h4 class="text-xs font-bold text-white mb-1">${c.ar}</h4>
            </div>
            <p class="text-[9px] text-gray-400 mt-1 leading-tight">${c.subAr}</p>
          </div>
        `).join('')}
      </div>

      <!-- 7 Guarantees Badges -->
      <div class="p-4 rounded-2xl bg-black/40 border border-white/10">
        <h3 class="text-xs font-bold text-gray-300 font-en uppercase tracking-wider mb-3">QUALITY & GUARANTEES — ضمان وجودة Dream Store</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          ${sec.guarantees.map(g => `
            <div class="p-2 rounded-xl bg-[#6A3CF0]/20 border border-[#6A3CF0]/30 flex items-center gap-2">
              <i data-lucide="${g.icon}" class="w-4 h-4 text-[#00D9FF] shrink-0"></i>
              <div>
                <span class="text-xs font-bold text-white block">${g.ar}</span>
                <span class="text-[9px] text-gray-400 font-en">${g.en}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Real Life Uses -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
        ${sec.realLifeUses.map(u => `
          <div class="p-2 rounded-xl bg-white/5 border border-white/5">
            <span class="font-bold text-[#00D9FF] block">${u.ar}</span>
            <span class="text-[10px] text-gray-400 font-en">${u.en}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ========================================================
   SLIDE 10: STORE EXPERIENCE
======================================================== */
function renderSlide10(sec) {
  return `
    <div class="p-6 sm:p-10 flex flex-col justify-between h-full space-y-6">
      <!-- Section Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#6A3CF0]/25 pb-4">
        <div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-xl bg-gradient-to-r from-[#6A3CF0] to-[#2E1065] text-white font-black text-sm font-en border border-[#6A3CF0]/60">10</span>
            <h2 class="text-2xl sm:text-3xl font-black text-white font-en">${sec.titleEn}</h2>
            <span class="text-xl sm:text-2xl font-bold text-[#E9D8FF]">${sec.titleAr}</span>
          </div>
          <p class="text-sm text-gray-300 mt-1 max-w-2xl">${sec.leadAr}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full bg-[#6A3CF0]/30 text-[#00D9FF] text-xs font-bold font-en border border-[#6A3CF0]/50">
            ${sec.subQuote}
          </span>
          <button class="open-reference-btn px-3 py-1.5 rounded-xl bg-[#6A3CF0]/20 hover:bg-[#6A3CF0]/40 border border-[#6A3CF0]/40 text-xs font-semibold text-[#00D9FF] transition flex items-center gap-1.5" data-slide="10">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>معاينة السلايد 10</span>
          </button>
        </div>
      </div>

      <!-- 8-Step Customer Journey -->
      <div>
        <h3 class="text-xs font-bold text-[#00D9FF] font-en uppercase tracking-wider mb-3">STORE JOURNEY — رحلة العميل داخل المتجر (8 خطوات)</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          ${sec.journey.map(j => `
            <div class="p-3 rounded-2xl bg-[#190A36]/80 border border-[#6A3CF0]/30 hover:border-[#00D9FF] hover:bg-[#2E1065] transition flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="px-2 py-0.5 rounded bg-[#6A3CF0]/40 text-xs font-black text-[#00D9FF] font-en">${j.step}</span>
                  <i data-lucide="${j.icon}" class="w-4 h-4 text-[#E9D8FF]"></i>
                </div>
                <span class="text-[10px] font-bold text-[#00D9FF] font-en uppercase block mb-0.5">${j.en}</span>
                <h4 class="text-xs font-bold text-white mb-1">${j.ar}</h4>
              </div>
              <p class="text-[9px] text-gray-300 mt-2 leading-tight">${j.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Extra Touchpoints & Pillars -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Store Pillars -->
        <div class="p-4 rounded-2xl bg-black/40 border border-white/10">
          <h4 class="text-xs font-bold text-gray-300 font-en uppercase mb-2">STORE PILLARS — أركان التجربة</h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${sec.pillars.map(p => `
              <div class="p-2.5 rounded-xl bg-[#6A3CF0]/20 border border-[#6A3CF0]/30">
                <span class="text-xs font-bold text-white block">${p.ar}</span>
                <span class="text-[9px] text-[#00D9FF] font-en">${p.en}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Touchpoints -->
        <div class="p-4 rounded-2xl bg-black/40 border border-white/10">
          <h4 class="text-xs font-bold text-gray-300 font-en uppercase mb-2">EXTRA TOUCHPOINTS — لمسات إضافية في الفروع</h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${sec.touchpoints.map(tp => `
              <div class="p-2.5 rounded-xl bg-[#2E1065]/40 border border-white/5 flex items-center gap-2">
                <i data-lucide="${tp.icon}" class="w-4 h-4 text-[#00D9FF] shrink-0"></i>
                <div>
                  <span class="text-xs font-bold text-white block">${tp.ar}</span>
                  <span class="text-[9px] text-gray-400 font-en">${tp.en}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ========================================================
   SLIDE 11: OMNICHANNEL EXPERIENCE
======================================================== */
function renderSlide11(sec) {
  return `
    <div class="p-6 sm:p-10 flex flex-col justify-between h-full space-y-6">
      <!-- Section Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#6A3CF0]/25 pb-4">
        <div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-xl bg-gradient-to-r from-[#6A3CF0] to-[#2E1065] text-white font-black text-sm font-en border border-[#6A3CF0]/60">11</span>
            <h2 class="text-2xl sm:text-3xl font-black text-white font-en">${sec.titleEn}</h2>
            <span class="text-xl sm:text-2xl font-bold text-[#E9D8FF]">${sec.titleAr}</span>
          </div>
          <p class="text-sm text-gray-300 mt-1 max-w-2xl">${sec.leadAr}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full bg-[#6A3CF0]/30 text-[#00D9FF] text-xs font-bold font-en border border-[#6A3CF0]/50">
            ${sec.subQuote}
          </span>
          <button class="open-reference-btn px-3 py-1.5 rounded-xl bg-[#6A3CF0]/20 hover:bg-[#6A3CF0]/40 border border-[#6A3CF0]/40 text-xs font-semibold text-[#00D9FF] transition flex items-center gap-1.5" data-slide="11">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>معاينة السلايد 11</span>
          </button>
        </div>
      </div>

      <!-- 5 Omnichannel Channels -->
      <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
        ${sec.channels.map(ch => `
          <div class="p-4 rounded-2xl bg-[#190A36]/80 border border-[#6A3CF0]/30 hover:border-[#00D9FF] hover:bg-[#2E1065] transition flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-[#00D9FF] font-en">${ch.num}</span>
                <i data-lucide="${ch.icon}" class="w-4 h-4 text-[#E9D8FF]"></i>
              </div>
              <span class="text-xs font-bold text-[#00D9FF] font-en uppercase block mb-0.5">${ch.en}</span>
              <h4 class="text-sm font-bold text-white mb-1">${ch.ar}</h4>
              <p class="text-xs text-gray-300 leading-relaxed">${ch.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Journey + Benefits Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Seamless Customer Journey -->
        <div class="p-4 rounded-2xl bg-black/40 border border-white/10">
          <h4 class="text-xs font-bold text-[#00D9FF] font-en uppercase mb-3">SEAMLESS JOURNEY — رحلة عميل متكاملة</h4>
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
            ${sec.journey.map(j => `
              <div class="p-2 rounded-xl bg-[#6A3CF0]/20 border border-[#6A3CF0]/30 text-center">
                <span class="text-xs font-bold text-white block">${j.ar}</span>
                <span class="text-[9px] text-[#00D9FF] font-en uppercase">${j.en}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Key Benefits -->
        <div class="p-4 rounded-2xl bg-black/40 border border-white/10">
          <h4 class="text-xs font-bold text-[#00D9FF] font-en uppercase mb-3">KEY BENEFITS — أهم المميزات</h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            ${sec.benefits.map(b => `
              <div class="p-2.5 rounded-xl bg-[#2E1065]/40 border border-white/5 text-center">
                <span class="text-xs font-bold text-white block">${b.ar}</span>
                <span class="text-[9px] text-gray-300 font-en uppercase">${b.en}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Real Scenarios Row -->
      <div class="p-3.5 rounded-2xl bg-[#2E1065]/40 border border-[#6A3CF0]/30 flex flex-wrap items-center justify-between gap-3">
        <span class="text-xs font-bold text-white">سيناريو عملي:</span>
        <div class="flex flex-wrap gap-2 text-xs">
          ${sec.scenarios.map(sc => `
            <span class="px-3 py-1 rounded-xl bg-black/40 border border-white/10 text-gray-200">
              <strong class="text-[#00D9FF] font-en">${sc.step}.</strong> ${sc.ar}
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ========================================================
   SLIDE 12: FUTURE VISION
======================================================== */
function renderSlide12(sec) {
  return `
    <div class="p-6 sm:p-10 flex flex-col justify-between h-full space-y-6">
      <!-- Section Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#6A3CF0]/25 pb-4">
        <div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-xl bg-gradient-to-r from-[#6A3CF0] to-[#2E1065] text-white font-black text-sm font-en border border-[#6A3CF0]/60">12</span>
            <h2 class="text-2xl sm:text-3xl font-black text-white font-en">${sec.titleEn}</h2>
            <span class="text-xl sm:text-2xl font-bold text-[#E9D8FF]">${sec.titleAr}</span>
          </div>
          <p class="text-sm text-gray-300 mt-1 max-w-2xl">${sec.leadAr}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full bg-[#6A3CF0]/30 text-[#00D9FF] text-xs font-bold font-en border border-[#6A3CF0]/50">
            ${sec.subQuote}
          </span>
          <button class="open-reference-btn px-3 py-1.5 rounded-xl bg-[#6A3CF0]/20 hover:bg-[#6A3CF0]/40 border border-[#6A3CF0]/40 text-xs font-semibold text-[#00D9FF] transition flex items-center gap-1.5" data-slide="12">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>معاينة السلايد 12</span>
          </button>
        </div>
      </div>

      <!-- Growth Targets 4 Big Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        ${sec.targets.map(t => `
          <div class="p-5 rounded-2xl bg-gradient-to-br from-[#6A3CF0]/30 to-[#190A36] border border-[#00D9FF]/40 text-center shadow-[0_0_20px_rgba(106,60,240,0.2)]">
            <span class="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-white font-en block mb-1">
              ${t.num}
            </span>
            <span class="text-xs font-bold text-white uppercase font-en block mb-0.5">${t.en}</span>
            <span class="text-xs text-[#E9D8FF] font-bold">${t.ar}</span>
          </div>
        `).join('')}
      </div>

      <!-- Expansion Plan & Regional Markets -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- 5 Expansion Steps -->
        <div class="p-4 rounded-2xl bg-[#190A36]/80 border border-[#6A3CF0]/30">
          <h3 class="text-xs font-bold text-[#00D9FF] font-en uppercase mb-3">OUR EXPANSION PLAN — خطة التوسع</h3>
          <div class="space-y-2">
            ${sec.expansionPlan.map(p => `
              <div class="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-xs font-black text-[#00D9FF] font-en">${p.num}</span>
                  <div>
                    <h4 class="text-xs font-bold text-white">${p.ar}</h4>
                    <span class="text-[10px] text-gray-400 font-en">${p.en}</span>
                  </div>
                </div>
                <span class="text-[10px] text-gray-300 hidden sm:inline">${p.desc}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Target Markets & Innovation -->
        <div class="p-4 rounded-2xl bg-[#190A36]/80 border border-[#6A3CF0]/30 flex flex-col justify-between">
          <div>
            <h3 class="text-xs font-bold text-[#00D9FF] font-en uppercase mb-3">INTO NEW MARKETS — أسواق جديدة</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              ${sec.markets.map(m => `
                <div class="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                  <span class="text-xl block mb-1">${m.flag}</span>
                  <span class="text-xs font-bold text-white block">${m.ar}</span>
                  <span class="text-[9px] text-[#00D9FF] font-en">${m.en}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div>
            <h3 class="text-xs font-bold text-gray-300 font-en uppercase mb-2">INNOVATION & TECH — الابتكار والتكنولوجيا</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              ${sec.innovation.map(inv => `
                <div class="p-2 rounded-xl bg-[#6A3CF0]/20 border border-[#6A3CF0]/30 text-center">
                  <span class="text-xs font-bold text-white block">${inv.ar}</span>
                  <span class="text-[9px] text-gray-300 font-en">${inv.en}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ========================================================
   SLIDE 13: LOYALTY & REWARDS
======================================================== */
function renderSlide13(sec) {
  return `
    <div class="p-6 sm:p-10 flex flex-col justify-between h-full space-y-6">
      <!-- Section Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#6A3CF0]/25 pb-4">
        <div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-xl bg-gradient-to-r from-[#6A3CF0] to-[#2E1065] text-white font-black text-sm font-en border border-[#6A3CF0]/60">13</span>
            <h2 class="text-2xl sm:text-3xl font-black text-white font-en">${sec.titleEn}</h2>
            <span class="text-xl sm:text-2xl font-bold text-[#E9D8FF]">${sec.titleAr}</span>
          </div>
          <p class="text-sm text-gray-300 mt-1 max-w-2xl">${sec.leadAr}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full bg-[#6A3CF0]/30 text-[#00D9FF] text-xs font-bold font-en border border-[#6A3CF0]/50">
            ${sec.subQuote}
          </span>
          <button class="open-reference-btn px-3 py-1.5 rounded-xl bg-[#6A3CF0]/20 hover:bg-[#6A3CF0]/40 border border-[#6A3CF0]/40 text-xs font-semibold text-[#00D9FF] transition flex items-center gap-1.5" data-slide="13">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>معاينة السلايد 13</span>
          </button>
        </div>
      </div>

      <!-- 4 Loyalty Tiers Grid -->
      <div>
        <h3 class="text-xs font-bold text-[#00D9FF] font-en uppercase tracking-wider mb-3">LOYALTY TIERS — مستويات برنامج الولاء</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${sec.tiers.map(t => `
            <div class="p-4 rounded-2xl bg-[#190A36]/90 border border-[#6A3CF0]/40 hover:border-[#00D9FF] hover:scale-105 transition flex flex-col justify-between group shadow-lg">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-bold text-white uppercase font-en bg-gradient-to-r ${t.gradient}">
                    ${t.tierEn}
                  </span>
                  <span class="text-xs font-bold text-gray-300">${t.tierAr}</span>
                </div>
                <div class="space-y-2 mt-3">
                  ${t.perks.map(p => `
                    <div class="p-2 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2 text-xs">
                      <span class="text-[#00D9FF] mt-0.5">★</span>
                      <div>
                        <p class="font-semibold text-white">${p.ar}</p>
                        <span class="text-[10px] text-gray-400 font-en">${p.en}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Interactive Points Calculator Simulator -->
      <div class="p-5 rounded-3xl bg-gradient-to-r from-[#2E1065]/90 to-[#190A36] border border-[#00D9FF]/40 shadow-xl">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div>
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              <i data-lucide="calculator" class="w-4 h-4 text-[#00D9FF]"></i>
              <span>حاسبة نقاط ومكافآت Dream Store التفاعلية</span>
            </h4>
            <p class="text-xs text-gray-300">حرّك المؤشر لتجربة حساب النقاط والمستوى التلقائي</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">قيمة المشتريات:</span>
            <span id="calc-spend-display" class="px-3 py-1 rounded-xl bg-black/60 text-[#00D9FF] font-black text-base font-en">5,000 EGP</span>
          </div>
        </div>

        <input id="calc-spend-slider" type="range" min="500" max="50000" step="500" value="5000" class="w-full mb-4">

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <span class="text-gray-400 block text-[10px]">النقاط المكتسبة:</span>
            <span id="calc-points-display" class="text-base font-black text-white font-en">5,000 Pts</span>
          </div>
          <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <span class="text-gray-400 block text-[10px]">المستوى المؤهل:</span>
            <span id="calc-tier-display" class="text-base font-black text-amber-400 font-en">SILVER</span>
          </div>
          <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <span class="text-gray-400 block text-[10px]">قيمة القسيمة الفورية:</span>
            <span id="calc-voucher-display" class="text-base font-black text-[#00D9FF] font-en">250 EGP</span>
          </div>
          <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <span class="text-gray-400 block text-[10px]">الميزة الخاصة:</span>
            <span id="calc-perk-display" class="text-xs font-bold text-[#E9D8FF]">دخول مبكر للعروض</span>
          </div>
        </div>
      </div>

      <!-- Footer Quote -->
      <div class="text-center">
        <span class="text-xs font-bold text-gray-300">
          ${sec.footerQuote}
        </span>
      </div>
    </div>
  `;
}

// Interactive event binders per slide
function bindSlideInteractiveEvents(key) {
  // Bind master reference slide preview buttons
  document.querySelectorAll('.open-reference-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const slideId = btn.getAttribute('data-slide');
      openMasterSlideModal(slideId);
    });
  });

  // Slide 13 Simulator Slider
  if (key === 'loyalty-rewards') {
    const slider = document.getElementById('calc-spend-slider');
    const spendDisplay = document.getElementById('calc-spend-display');
    const pointsDisplay = document.getElementById('calc-points-display');
    const tierDisplay = document.getElementById('calc-tier-display');
    const voucherDisplay = document.getElementById('calc-voucher-display');
    const perkDisplay = document.getElementById('calc-perk-display');

    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        spendDisplay.textContent = `${val.toLocaleString()} EGP`;
        
        // Calculate
        let points = val;
        let tier = 'BRONZE';
        let tierColor = 'text-amber-600';
        let voucher = Math.floor(val * 0.05);
        let perk = 'نقاط ترحيبية وهدية ميلاد';

        if (val >= 25000) {
          tier = 'PLATINUM';
          tierColor = 'text-purple-300';
          points = Math.floor(val * 2);
          voucher = Math.floor(val * 0.10);
          perk = 'مدير حساب VIP ودعوات خاصة';
        } else if (val >= 12000) {
          tier = 'GOLD';
          tierColor = 'text-yellow-400';
          points = Math.floor(val * 1.5);
          voucher = Math.floor(val * 0.08);
          perk = 'شحن مجاني ودعم أولوية';
        } else if (val >= 4000) {
          tier = 'SILVER';
          tierColor = 'text-slate-300';
          points = Math.floor(val * 1.2);
          voucher = Math.floor(val * 0.06);
          perk = 'دخول مبكر للعروض الموسمية';
        }

        pointsDisplay.textContent = `${points.toLocaleString()} Pts`;
        tierDisplay.textContent = tier;
        tierDisplay.className = `text-base font-black ${tierColor} font-en`;
        voucherDisplay.textContent = `${voucher.toLocaleString()} EGP`;
        perkDisplay.textContent = perk;
      });
    }
  }
}

// Master Slide Modal Controls
function openMasterSlideModal(slideId) {
  const sNum = slideId || presentationData.sections[currentSlideIndex].id;
  const currentSec = presentationData.sections.find(s => parseInt(s.id, 10) === parseInt(sNum, 10)) || presentationData.sections[currentSlideIndex];
  
  modalBadge.textContent = currentSec.id;
  modalTitle.textContent = `${currentSec.titleEn} — ${currentSec.titleAr}`;
  modalImage.src = `/assets/${parseInt(currentSec.id, 10)}.jpeg`;
  
  masterSlideModal.classList.remove('hidden');
  masterSlideModal.classList.add('flex');
}

function closeMasterSlideModal() {
  masterSlideModal.classList.add('hidden');
  masterSlideModal.classList.remove('flex');
}

function toggleAgenda(show) {
  if (show === undefined) {
    agendaDrawer.classList.toggle('hidden');
    agendaDrawer.classList.toggle('flex');
  } else if (show) {
    agendaDrawer.classList.remove('hidden');
    agendaDrawer.classList.add('flex');
  } else {
    agendaDrawer.classList.add('hidden');
    agendaDrawer.classList.remove('flex');
  }
}

// Setup Event Listeners
function setupEventListeners() {
  btnNextSlide.addEventListener('click', nextSlide);
  btnPrevSlide.addEventListener('click', prevSlide);

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    // Left arrow in RTL goes to NEXT slide, Right arrow goes to PREVIOUS
    if (e.key === 'ArrowLeft' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowRight' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSlide(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToSlide(totalSlides - 1);
    } else if (e.key === 'Escape') {
      closeMasterSlideModal();
      toggleAgenda(false);
      hideOutro();
    }
  });

  // Master Slide Modal Toggle
  btnToggleMasterSlide.addEventListener('click', () => {
    openMasterSlideModal();
  });
  btnCloseModal.addEventListener('click', closeMasterSlideModal);
  masterSlideModal.addEventListener('click', (e) => {
    if (e.target === masterSlideModal) closeMasterSlideModal();
  });

  // Agenda Drawer
  btnToggleAgenda.addEventListener('click', () => toggleAgenda());
  btnCloseAgenda.addEventListener('click', () => toggleAgenda(false));
  agendaDrawer.addEventListener('click', (e) => {
    if (e.target === agendaDrawer) toggleAgenda(false);
  });

  // Sound Toggle
  btnToggleSound.addEventListener('click', () => {
    const newState = !isSoundEnabled();
    setSoundEnabled(newState);
    if (newState) {
      iconSound.setAttribute('data-lucide', 'volume-2');
      playClickSound();
    } else {
      iconSound.setAttribute('data-lucide', 'volume-x');
    }
    refreshLucide();
  });

  // Fullscreen
  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Outro replay & close
  btnReplay.addEventListener('click', () => {
    hideOutro();
    goToSlide(0);
  });
  btnCloseOutro.addEventListener('click', () => {
    hideOutro();
  });
}

function refreshLucide() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Start
document.addEventListener('DOMContentLoaded', init);
