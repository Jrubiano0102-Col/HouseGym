/**
 * HOUSE GYM â€” Main Script
 * Organized into logical sections with optimized event handling
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  // =============================================
  // 1. DOM ELEMENT CACHE
  // =============================================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const header = $('.header');
  const floatingRedBtn = $('#floatingRedBtn');
  const menuToggle = $('.menu-toggle');
  const navLinks = $('.nav-links');
  const track = $('#carouselTrack');
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  const indicator = $('#carouselIndicator');
  const popupOverlay = $('#servicePopupOverlay');
  const popupTitle = $('#servicePopupTitle');
  const popupDesc = $('#servicePopupDesc');
  const popupIcon = $('#servicePopupIcon');
  const popupImg = $('#servicePopupImg');
  const popupClose = $('#servicePopupClose');
  const popupCta = $('#servicePopupCta');
  // =============================================
  // 2. HEADER SCROLL & FLOATING BUTTON
  // =============================================
  let lastScrollY = 0;
  let ticking = false;
  function onScroll() {
    lastScrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', lastScrollY > 50);
        if (floatingRedBtn) {
          floatingRedBtn.classList.toggle('visible', lastScrollY > 400);
        }
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  if (floatingRedBtn) {
    floatingRedBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  // =============================================
  // 3. MOBILE MENU
  // =============================================
  function toggleMenu(open) {
    const isOpen = typeof open === 'boolean' ? open : !navLinks.classList.contains('open');
    menuToggle.classList.toggle('active', isOpen);
    navLinks.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
  menuToggle.addEventListener('click', () => toggleMenu());
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });
  // =============================================
  // 4. SMOOTH SCROLL
  // =============================================
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = $(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
  // =============================================
  // 5. SCROLL REVEAL ANIMATIONS
  // =============================================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(el => revealObserver.observe(el));
  // =============================================
  // 6. COUNTER ANIMATION
  // =============================================
  function animateCounter(el, target, suffix = '') {
    const duration = 1500;
    const start = performance.now();
    function step(timestamp) {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.floor(eased * target);
      el.innerHTML = `${current.toLocaleString()}<span>${suffix}</span>`;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCounter(el, parseInt(el.dataset.target), el.dataset.suffix || '');
        statsObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  $$('.stat-number[data-target]').forEach(el => statsObserver.observe(el));
  // =============================================
  // 7. PRICING CARDS (Tilt + Toggles)
  // =============================================
  $$('.pricing-card').forEach(card => {
    const isPopular = card.classList.contains('popular');
    // --- Hover Tilt ---
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const rotateX = ((e.clientY - rect.top) - rect.height / 2) / 30;
      const rotateY = (rect.width / 2 - (e.clientX - rect.left)) / 30;
      const base = isPopular ? 'scale(1.05) ' : '';
      card.style.transform = `${base}perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = isPopular ? 'scale(1.05)' : '';
    });
    // --- Price Toggle ---
    const cardHeader = card.querySelector('.pricing-card-header');
    if (!cardHeader) return;
    const toggle = cardHeader.querySelector('.plan-toggle');
    if (!toggle) return;
    const labels = cardHeader.querySelectorAll('.toggle-label');
    const priceAmount = cardHeader.querySelector('.price-amount');
    const period = cardHeader.querySelector('.plan-period');
    const badge = cardHeader.querySelector('.discount-badge');
    const ctaBtn = card.querySelector('.btn');
    const planName = cardHeader.querySelector('.plan-name').textContent.trim();
    const { monthly, semiannual } = cardHeader.dataset;
    function updatePlan(isSixMonths) {
      labels[0].classList.toggle('active-label', !isSixMonths);
      labels[1].classList.toggle('active-label', isSixMonths);
      priceAmount.textContent = isSixMonths ? semiannual : monthly;
      period.textContent = isSixMonths ? 'por 6 meses' : 'por mes';
      badge.style.display = isSixMonths ? 'inline-block' : 'none';
      if (ctaBtn) {
        const price = isSixMonths ? semiannual : monthly;
        const duration = isSixMonths ? '6 meses' : '1 mes';
        const msg = `Hola, estoy interesado en el *${planName}* por ${duration} ($${price}). Quiero más información.`;
        ctaBtn.href = `https://wa.me/573112043316?text=${encodeURIComponent(msg)}`;
      }
    }
    // DESPUÉS — fuerza sincronización inicial con href correcto
    toggle.checked = false;          // asegura que inicia en "1 mes"
    updatePlan(false);               // sincroniza precio Y href desde el inicio
    toggle.addEventListener('change', () => updatePlan(toggle.checked));
  });
  // =============================================
  // 8. SERVICES CAROUSEL (Infinite Scroll)
  // =============================================
  if (track && prevBtn && nextBtn && indicator) {
    const originalSlides = Array.from(track.children);
    const totalSlides = originalSlides.length;
    // Clone slides for infinite loop
    originalSlides.forEach(s => track.appendChild(s.cloneNode(true)));
    [...originalSlides].reverse().forEach(s => track.prepend(s.cloneNode(true)));
    const allSlides = Array.from(track.children);
    let currentIndex = totalSlides;
    let isTransitioning = false;
    function updateCarousel(animate = true) {
      track.style.transition = animate
        ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        : 'none';
      const containerWidth = track.parentElement.getBoundingClientRect().width;
      const slideWidth = allSlides[0].offsetWidth;
      const offset = (containerWidth - slideWidth) / 2;
      track.style.transform = `translateX(${-currentIndex * slideWidth + offset}px)`;
      indicator.textContent = `${(currentIndex % totalSlides) + 1} / ${totalSlides}`;
      allSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentIndex);
      });
    }
    function navigate(direction) {
      if (isTransitioning) return;
      isTransitioning = true;
      currentIndex += direction;
      updateCarousel(true);
    }
    nextBtn.addEventListener('click', () => navigate(1));
    prevBtn.addEventListener('click', () => navigate(-1));
    track.addEventListener('transitionend', () => {
      isTransitioning = false;
      if (currentIndex >= totalSlides * 2) {
        currentIndex -= totalSlides;
        updateCarousel(false);
      } else if (currentIndex < totalSlides) {
        currentIndex += totalSlides;
        updateCarousel(false);
      }
    });
    // Debounced resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => updateCarousel(false), 150);
    });
    setTimeout(() => updateCarousel(false), 100);
  }
  // =============================================
  // 9. SERVICE POPUPS
  // =============================================
  const servicePopupData = {
    'popup-suplementacion': {
      icon: '💊',
      title: 'Suplementación',
      img: 'assets/images/suplementos.png',
      desc: 'Potencia tus resultados con nuestra asesoría en suplementación deportiva. Contamos con una amplia variedad de productos de las mejores marcas: proteínas, creatina, aminoácidos, pre-entrenos y más. Nuestros entrenadores te guiarán para elegir el suplemento ideal según tus objetivos y necesidades.'
    },
    'popup-clases': {
      icon: '🏃',
      title: 'Clases Grupales',
      img: 'assets/images/clases-grupales.jpg',
      desc: 'Súmate a nuestras clases grupales llenas de energía y motivación. Ofrecemos sesiones de Rumba, Funcional, HIIT y más, impartidas por instructores certificados. Entrena en comunidad, diviértete y alcanza tus metas con sesiones diseñadas para todos los niveles.'
    },
    'popup-rutinas': {
      icon: '📋',
      title: 'Rutinas Personalizadas',
      img: 'assets/images/rutinas.jpg',
      desc: 'Recibe un plan de entrenamiento diseñado exclusivamente para ti. Nuestros entrenadores certificados evaluarán tu condición física, objetivos y disponibilidad para crear rutinas que maximicen tus resultados. Incluye seguimiento periódico y ajustes según tu progreso.'
    },
    'popup-valoracion': {
      icon: '📊',
      title: 'Valoración Antropométrica',
      img: 'assets/images/personalizadas.jpg',
      desc: 'Conoce tu composición corporal con precisión. Realizamos mediciones de porcentaje de grasa, masa muscular, índice de masa corporal y más. Con estos datos, nuestros profesionales te ayudarán a definir metas realistas y a diseñar un plan de acción efectivo para tu transformación.'
    },
    'popup-dietas': {
      icon: '🥗',
      title: 'Dietas Personalizadas',
      img: 'assets/images/dieta.jpg',
      desc: 'La nutrición es clave para lograr tus objetivos. Nuestros especialistas diseñarán un plan alimenticio adaptado a tu estilo de vida, preferencias y metas. Ya sea que busques ganar masa muscular, perder grasa o mejorar tu rendimiento, tendrás una guía nutricional completa.'
    }
  };
  function openServicePopup(popupId) {
    const data = servicePopupData[popupId];
    if (!data) return;
    popupImg.src = data.img;
    popupImg.alt = data.title;
    popupIcon.textContent = data.icon;
    popupTitle.textContent = data.title;
    popupDesc.textContent = data.desc;
    popupOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeServicePopup() {
    popupOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  // Event delegation for popup open (handles cloned carousel slides)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-popup]');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      openServicePopup(btn.dataset.popup);
    }
  });
  // Popup close handlers
  if (popupClose) popupClose.addEventListener('click', closeServicePopup);
  if (popupOverlay) popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) closeServicePopup();
  });
  if (popupCta) popupCta.addEventListener('click', closeServicePopup);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popupOverlay?.classList.contains('active')) {
      closeServicePopup();
    }
  });
});
