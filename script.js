// ===== HEADER SCROLL EFFECT =====
const header = document.querySelector('.header');
const floatingRedBtn = document.getElementById('floatingRedBtn');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
  // Show/hide floating red button
  if (floatingRedBtn) {
    floatingRedBtn.classList.toggle('visible', window.scrollY > 400);
  }
});

// ===== FLOATING RED BUTTON (Scroll to Top) =====
if (floatingRedBtn) {
  floatingRedBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== MOBILE MENU =====
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ===== SCROLL REVEAL ANIMATIONS =====
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealElements.forEach(el => revealObserver.observe(el));

// ===== COUNTER ANIMATION =====
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const increment = target / 60;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.innerHTML = Math.floor(current).toLocaleString() + `<span>${suffix}</span>`;
  }, 25);
}

const statNumbers = document.querySelectorAll('.stat-number[data-target]');
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      animateCounter(el, parseInt(el.dataset.target), el.dataset.suffix || '');
      statsObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach(el => statsObserver.observe(el));

// ===== PRICING CARD HOVER TILT =====
document.querySelectorAll('.pricing-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 30;
    const rotateY = (centerX - x) / 30;
    card.style.transform = card.classList.contains('popular')
      ? `scale(1.05) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      : `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = card.classList.contains('popular') ? 'scale(1.05)' : '';
  });
});
// ===== PRICING TOGGLES ======
document.querySelectorAll('.pricing-card-header').forEach(header => {
  const toggle = header.querySelector('.plan-toggle');
  if (!toggle) return;
  
  const labels = header.querySelectorAll('.toggle-label');
  const priceAmount = header.querySelector('.price-amount');
  const period = header.querySelector('.plan-period');
  const badge = header.querySelector('.discount-badge');
  
  const monthlyPrice = header.dataset.monthly;
  const semiannualPrice = header.dataset.semiannual;
  
  toggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      // 6 meses
      labels[0].classList.remove('active-label');
      labels[1].classList.add('active-label');
      priceAmount.textContent = semiannualPrice;
      period.textContent = 'por 6 meses';
      badge.style.display = 'inline-block';
    } else {
      // 1 mes
      labels[1].classList.remove('active-label');
      labels[0].classList.add('active-label');
      priceAmount.textContent = monthlyPrice;
      period.textContent = 'por mes';
      badge.style.display = 'none';
    }
  });
});

// ===== SERVICES CAROUSEL ======
const track = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicator = document.getElementById('carouselIndicator');

if (track && prevBtn && nextBtn && indicator) {
  const originalSlides = Array.from(track.children);
  const totalOriginalSlides = originalSlides.length;
  
  // Clone for infinite scroll
  originalSlides.forEach(slide => {
    track.appendChild(slide.cloneNode(true));
  });
  originalSlides.slice().reverse().forEach(slide => {
    track.prepend(slide.cloneNode(true));
  });

  const allSlides = Array.from(track.children);
  let currentIndex = totalOriginalSlides; // start at 5 (first original)
  let isTransitioning = false;

  function updateCarousel(animate = true) {
    if (!animate) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }

    const containerWidth = track.parentElement.getBoundingClientRect().width;
    const slideWidth = allSlides[0].offsetWidth;
    const offset = (containerWidth / 2) - (slideWidth / 2);

    track.style.transform = `translateX(${-currentIndex * slideWidth + offset}px)`;
    
    // Calculate real index for the indicator
    const realIndex = currentIndex % totalOriginalSlides;
    indicator.textContent = `${realIndex + 1} / ${totalOriginalSlides}`;

    allSlides.forEach((slide, index) => {
      if (index === currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
  }

  nextBtn.addEventListener('click', () => {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex++;
    updateCarousel(true);
  });

  prevBtn.addEventListener('click', () => {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex--;
    updateCarousel(true);
  });

  track.addEventListener('transitionend', () => {
    isTransitioning = false;
    // Infinite loop reset
    if (currentIndex >= totalOriginalSlides * 2) {
      currentIndex -= totalOriginalSlides;
      updateCarousel(false);
    } else if (currentIndex < totalOriginalSlides) {
      currentIndex += totalOriginalSlides;
      updateCarousel(false);
    }
  });

  window.addEventListener('resize', () => updateCarousel(false));
  
  // Initialization
  setTimeout(() => updateCarousel(false), 100);
}
