/**
 * HOME.JS - Home Page Specific Logic
 * Portfolio Website - Black & White Minimalistic Theme
 */

// Home page state and functionality
const HomePage = {
  isInitialized: false,
  animationObserver: null,
  typingAnimation: null,
  skillsAnimated: false,
  counters: {
    apps: { current: 0, target: 15, duration: 2000 },
    experience: { current: 0, target: 3, duration: 1500 },
    downloads: { current: 0, target: 50000, duration: 2500 }
  }
};

/**
 * Initialize home page when content is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  // Small delay to ensure all content is rendered
  setTimeout(() => {
    if (window.App?.currentPage === 'home' || !window.App) {
      initializeHomePage();
    }
  }, 100);
});

/**
 * Initialize all home page functionality
 */
function initializeHomePage() {
  if (HomePage.isInitialized) return;
  
  console.log('Initializing home page...');
  
  // Initialize scroll animations
  initializeScrollAnimations();
  
  // Initialize typing animation for hero
  initializeHeroAnimation();
  
  // Initialize skills progress animations
  initializeSkillsAnimation();
  
  // Initialize counter animations
  initializeCounterAnimations();
  
  // Initialize smooth scrolling for internal links
  initializeSmoothScrolling();
  
  // Initialize image lazy loading
  initializeImageLazyLoading();
  
  // Initialize particle effects (optional)
  initializeParticleEffects();
  
  HomePage.isInitialized = true;
  console.log('Home page initialized successfully');
}

/**
 * Initialize scroll-triggered animations
 */
function initializeScrollAnimations() {
  if (!window.IntersectionObserver) return;
  
  const animationOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  HomePage.animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const animationType = element.dataset.animation || 'fadeIn';
        
        // Add animation class
        element.classList.add('animate', animationType);
        
        // Special handling for different sections
        handleSectionAnimation(element);
        
        // Stop observing this element
        HomePage.animationObserver.unobserve(element);
      }
    });
  }, animationOptions);
  
  // Observe elements for animation
  const animatedElements = document.querySelectorAll([
    '.hero-text',
    '.hero-image', 
    '.about-paragraph',
    '.about-highlights',
    '.project-card',
    '.skills-category',
    '.contact-item'
  ].join(','));
  
  animatedElements.forEach(element => {
    HomePage.animationObserver.observe(element);
  });
}

/**
 * Handle specific section animations
 * @param {Element} element - Element that entered viewport
 */
function handleSectionAnimation(element) {
  if (element.classList.contains('about-highlights')) {
    startCounterAnimations();
  }
  
  if (element.classList.contains('skills-category') && !HomePage.skillsAnimated) {
    animateSkillBars();
    HomePage.skillsAnimated = true;
  }
  
  if (element.classList.contains('project-card')) {
    staggerProjectCards();
  }
}

/**
 * Initialize hero section typing animation
 */
function initializeHeroAnimation() {
  const heroName = document.querySelector('.hero-name');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  
  if (!heroName || !heroSubtitle) return;
  
  // Add typing effect to hero name
  const nameText = heroName.textContent;
  heroName.textContent = '';
  heroName.style.borderRight = '2px solid var(--color-black)';
  
  let i = 0;
  HomePage.typingAnimation = setInterval(() => {
    if (i < nameText.length) {
      heroName.textContent += nameText.charAt(i);
      i++;
    } else {
      clearInterval(HomePage.typingAnimation);
      heroName.style.borderRight = 'none';
      
      // Trigger subtitle animation
      setTimeout(() => {
        heroSubtitle.classList.add('animate', 'slideInUp');
      }, 300);
    }
  }, 100);
}

/**
 * Initialize skills progress bar animations
 */
function initializeSkillsAnimation() {
  const skillBars = document.querySelectorAll('.skill-progress');
  
  skillBars.forEach(bar => {
    const targetWidth = bar.style.width;
    bar.style.width = '0%';
    bar.dataset.targetWidth = targetWidth;
  });
}

/**
 * Animate skill bars when they come into view
 */
function animateSkillBars() {
  const skillBars = document.querySelectorAll('.skill-progress');
  
  skillBars.forEach((bar, index) => {
    setTimeout(() => {
      const targetWidth = bar.dataset.targetWidth;
      bar.style.transition = 'width 1.5s ease-out';
      bar.style.width = targetWidth;
    }, index * 200);
  });
}

/**
 * Initialize counter animations for statistics
 */
function initializeCounterAnimations() {
  // Setup counter elements
  const appsCounter = document.querySelector('.highlight-item:nth-child(1) .highlight-title');
  const experienceCounter = document.querySelector('.highlight-item:nth-child(2) .highlight-title');
  const downloadsCounter = document.querySelector('.highlight-item:nth-child(3) .highlight-title');
  
  if (appsCounter) HomePage.counters.apps.element = appsCounter;
  if (experienceCounter) HomePage.counters.experience.element = experienceCounter;
  if (downloadsCounter) HomePage.counters.downloads.element = downloadsCounter;
}

/**
 * Start counter animations
 */
function startCounterAnimations() {
  Object.keys(HomePage.counters).forEach(key => {
    const counter = HomePage.counters[key];
    if (counter.element) {
      animateCounter(counter);
    }
  });
}

/**
 * Animate individual counter
 * @param {Object} counter - Counter configuration object
 */
function animateCounter(counter) {
  const startTime = Date.now();
  const startValue = counter.current;
  
  function updateCounter() {
    const now = Date.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / counter.duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    counter.current = Math.floor(startValue + (counter.target - startValue) * easeOut);
    
    // Format number based on size
    let displayValue;
    if (counter.target >= 1000) {
      displayValue = (counter.current / 1000).toFixed(0) + 'K+';
    } else {
      displayValue = counter.current + '+';
    }
    
    counter.element.textContent = displayValue;
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      // Final value
      if (counter.target >= 1000) {
        counter.element.textContent = (counter.target / 1000) + 'K+';
      } else {
        counter.element.textContent = counter.target + '+';
      }
    }
  }
  
  requestAnimationFrame(updateCounter);
}

/**
 * Stagger project card animations
 */
function staggerProjectCards() {
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('animate', 'slideInUp');
    }, index * 150);
  });
}

/**
 * Initialize smooth scrolling for internal links
 */
function initializeSmoothScrolling() {
  const internalLinks = document.querySelectorAll('a[href^="#"]');
  
  internalLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const navbarHeight = window.Layout ? window.Layout.getNavbarHeight() : 70;
        const targetPosition = targetElement.offsetTop - navbarHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Update URL hash
        setTimeout(() => {
          history.pushState(null, null, `#${targetId}`);
        }, 500);
      }
    });
  });
}

/**
 * Initialize image lazy loading with intersection observer
 */
function initializeImageLazyLoading() {
  if (!window.IntersectionObserver) return;
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        // Load the image
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        
        // Add loaded class for animations
        img.addEventListener('load', () => {
          img.classList.add('loaded');
        });
        
        imageObserver.unobserve(img);
      }
    });
  });
  
  // Observe all images with data-src
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach(img => {
    imageObserver.observe(img);
  });
}

/**
 * Initialize subtle particle effects (optional enhancement)
 */
function initializeParticleEffects() {
  const heroSection = document.querySelector('.hero-section');
  if (!heroSection) return;
  
  // Create particle container
  const particleContainer = document.createElement('div');
  particleContainer.className = 'particle-container';
  particleContainer.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  `;
  
  heroSection.appendChild(particleContainer);
  
  // Create floating particles
  for (let i = 0; i < 20; i++) {
    createParticle(particleContainer, i);
  }
}

/**
 * Create individual particle
 * @param {Element} container - Particle container
 * @param {number} index - Particle index
 */
function createParticle(container, index) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  
  const size = Math.random() * 4 + 2;
  const left = Math.random() * 100;
  const animationDuration = Math.random() * 20 + 10;
  const delay = Math.random() * 5;
  
  particle.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    background: var(--color-gray-light);
    border-radius: 50%;
    left: ${left}%;
    top: 100%;
    opacity: 0.3;
    animation: floatUp ${animationDuration}s linear infinite ${delay}s;
  `;
  
  container.appendChild(particle);
}

/**
 * Handle scroll progress indicator
 */
function initializeScrollProgress() {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.style.cssText = `
    position: fixed;
    top: 70px;
    left: 0;
    width: 0%;
    height: 2px;
    background: var(--color-black);
    z-index: var(--z-fixed);
    transition: width 0.1s ease;
  `;
  
  document.body.appendChild(progressBar);
  
  window.addEventListener('scroll', Utils.animation.throttle(() => {
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = (scrolled / maxScroll) * 100;
    
    progressBar.style.width = `${Math.min(scrollProgress, 100)}%`;
  }, 16));
}

/**
 * Initialize contact form functionality (if present)
 */
function initializeContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', handleContactFormSubmit);
}

/**
 * Handle contact form submission
 * @param {Event} event - Form submit event
 */
function handleContactFormSubmit(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());
  
  // Basic validation
  if (!Utils.validation.isEmail(data.email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }
  
  if (Utils.validation.isEmpty(data.message)) {
    showNotification('Please enter a message', 'error');
    return;
  }
  
  // Show loading state
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;
  
  // Simulate form submission (replace with actual implementation)
  setTimeout(() => {
    showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
    event.target.reset();
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }, 2000);
}

/**
 * Show notification message
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info)
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 90px;
    right: 20px;
    background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44aa44' : '#444444'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    z-index: 1000;
    box-shadow: var(--shadow-lg);
    transform: translateX(400px);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Slide in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Auto remove
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

/**
 * Cleanup home page when navigating away
 */
function cleanupHomePage() {
  if (HomePage.typingAnimation) {
    clearInterval(HomePage.typingAnimation);
  }
  
  if (HomePage.animationObserver) {
    HomePage.animationObserver.disconnect();
  }
  
  // Remove scroll progress bar
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    progressBar.remove();
  }
  
  HomePage.isInitialized = false;
  console.log('Home page cleaned up');
}

/**
 * Reinitialize home page (useful for SPA navigation)
 */
function reinitializeHomePage() {
  cleanupHomePage();
  setTimeout(initializeHomePage, 100);
}

// Add CSS for animations
const homePageStyles = `
  @keyframes floatUp {
    to {
      transform: translateY(-100vh);
      opacity: 0;
    }
  }
  
  .animate.fadeIn {
    animation: fadeIn 0.8s ease-out both;
  }
  
  .animate.slideInUp {
    animation: slideInUp 0.6s ease-out both;
  }
  
  .animate.slideInLeft {
    animation: slideInLeft 0.8s ease-out both;
  }
  
  .animate.slideInRight {
    animation: slideInRight 0.8s ease-out both;
  }
  
  img.loaded {
    opacity: 1;
    transition: opacity 0.3s ease;
  }
  
  img[data-src] {
    opacity: 0;
  }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = homePageStyles;
document.head.appendChild(styleSheet);

// Export functions for global access
window.HomePage = {
  initialize: initializeHomePage,
  cleanup: cleanupHomePage,
  reinitialize: reinitializeHomePage
};