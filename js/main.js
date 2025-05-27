/**
 * MAIN.JS - Core Application Logic (FIXED VERSION)
 * Portfolio Website - Black & White Minimalistic Theme
 * FIXES: Removes problematic loadPage() function, improves navigation consistency
 */

// Global App State
const App = {
  currentPage: getCurrentPageFromURL(),
  isLoading: false,
  pages: {
    home: {
      title: 'Flutter Developer Portfolio',
      description: 'Flutter Developer Portfolio - Showcasing mobile app development expertise'
    },
    projects: {
      title: 'Projects - Flutter Developer',  
      description: 'Flutter Developer Projects - Mobile App Portfolio'
    },
    about: {
      title: 'About - Flutter Developer',
      description: 'About Flutter Developer - Background and expertise'
    },
    contact: {
      title: 'Contact - Flutter Developer',
      description: 'Contact Flutter Developer - Get in touch for mobile app development'
    },
    admin: {
      title: 'Admin Panel - Portfolio Management',
      description: 'Admin Panel for Portfolio Management'
    }
  }
};

/**
 * Get current page from URL
 */
function getCurrentPageFromURL() {
  const path = window.location.pathname;
  
  if (path.includes('projects.html')) {
    return 'projects';
  } else if (path.includes('contact.html')) {
    return 'contact';
  } else if (path.includes('admin.html')) {
    return 'admin';
  } else {
    return 'home';
  }
}

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
  console.log('Initializing Portfolio App...');
  
  // Update current page state
  App.currentPage = getCurrentPageFromURL();
  
  // Set page title based on current page
  updatePageTitle();
  
  // Initialize smooth scrolling for internal links
  initializeSmoothScrolling();
  
  // Initialize scroll animations
  initializeScrollAnimations();
  
  // Initialize hero animations (if on home page)
  if (App.currentPage === 'home') {
    initializeHeroAnimations();
  }
  
  // Initialize navbar scroll effect
  initializeNavbarScrollEffect();
  
  // Initialize page-specific functionality
  initializePageSpecificFeatures();
  
  console.log('Portfolio App initialized successfully');
}

/**
 * Update page title based on current page
 */
function updatePageTitle() {
  const pageConfig = App.pages[App.currentPage];
  if (pageConfig) {
    document.title = pageConfig.title;
    
    // Update meta description if it exists
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && pageConfig.description) {
      metaDescription.setAttribute('content', pageConfig.description);
    }
  }
}

/**
 * Initialize smooth scrolling for internal links
 */
function initializeSmoothScrolling() {
  const internalLinks = document.querySelectorAll('a[href^="#"]');
  
  internalLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return; // Skip empty anchors
      
      e.preventDefault();
      
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        scrollToElement(targetElement);
      }
    });
  });
}

/**
 * Scroll to element with smooth animation
 * @param {Element} element - Target element to scroll to
 */
function scrollToElement(element) {
  const navbarHeight = window.Layout ? window.Layout.getNavbarHeight() : 70;
  const targetPosition = element.offsetTop - navbarHeight;
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
}

/**
 * Initialize scroll animations
 */
function initializeScrollAnimations() {
  if (!window.IntersectionObserver) return;
  
  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        // Add fade-in animation
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        // Trigger animation
        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, 100);
        
        // Stop observing this element
        animationObserver.unobserve(element);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  // Observe elements for animation
  const animatedElements = document.querySelectorAll([
    '.section:not(.hero-section)',
    '.project-card',
    '.skills-category',
    '.highlight-item',
    '.contact-item'
  ].join(','));
  
  animatedElements.forEach(element => {
    animationObserver.observe(element);
  });
}

/**
 * Initialize hero section animations (for home page)
 */
function initializeHeroAnimations() {
  const heroText = document.querySelector('.hero-text');
  const heroImage = document.querySelector('.hero-image');
  
  if (heroText && heroImage) {
    // Initial state
    heroText.style.opacity = '0';
    heroText.style.transform = 'translateX(-30px)';
    heroImage.style.opacity = '0';  
    heroImage.style.transform = 'translateX(30px)';
    
    // Animate in
    setTimeout(() => {
      heroText.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      heroImage.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      
      heroText.style.opacity = '1';
      heroText.style.transform = 'translateX(0)';
      heroImage.style.opacity = '1';
      heroImage.style.transform = 'translateX(0)';
    }, 300);
  }
  
  // Animate skill bars when they come into view
  const skillsSection = document.querySelector('.skills-section');
  if (skillsSection) {
    const skillsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateSkillBars();
          skillsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    
    skillsObserver.observe(skillsSection);
  }
}

/**
 * Animate skill progress bars
 */
function animateSkillBars() {
  const skillBars = document.querySelectorAll('.skill-progress');
  
  skillBars.forEach((bar, index) => {
    const targetWidth = bar.style.width;
    bar.style.width = '0%';
    
    setTimeout(() => {
      bar.style.transition = 'width 1.5s ease-out';
      bar.style.width = targetWidth;
    }, index * 150);
  });
}

/**
 * Initialize navbar scroll effect
 */
function initializeNavbarScrollEffect() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  
  const throttledScrollHandler = throttle(() => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, 16);
  
  window.addEventListener('scroll', throttledScrollHandler, { passive: true });
}

/**
 * Initialize page-specific functionality
 */
function initializePageSpecificFeatures() {
  switch (App.currentPage) {
    case 'home':
      initializeHomeFeatures();
      break;
    case 'projects':
      initializeProjectsFeatures();
      break;
    case 'contact':
      initializeContactFeatures();
      break;
    case 'admin':
      initializeAdminFeatures();
      break;
  }
}

/**
 * Initialize home page specific features
 */
function initializeHomeFeatures() {
  // Initialize counter animations for statistics
  const aboutSection = document.querySelector('.about-section');
  if (aboutSection) {
    const aboutObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          aboutObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    aboutObserver.observe(aboutSection);
  }
}

/**
 * Animate counter elements
 */
function animateCounters() {
  const counters = document.querySelectorAll('.highlight-title');
  
  counters.forEach(counter => {
    const text = counter.textContent;
    const numberMatch = text.match(/\d+/);
    
    if (numberMatch) {
      const targetNumber = parseInt(numberMatch[0]);
      const suffix = text.replace(numberMatch[0], '');
      let currentNumber = 0;
      const increment = targetNumber / 50; // 50 steps
      
      const timer = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= targetNumber) {
          counter.textContent = targetNumber + suffix;
          clearInterval(timer);
        } else {
          counter.textContent = Math.floor(currentNumber) + suffix;
        }
      }, 30);
    }
  });
}

/**
 * Initialize projects page specific features
 */
function initializeProjectsFeatures() {
  // Projects page features are handled in projects.js
  console.log('Projects page features initialized');
}

/**
 * Initialize contact page specific features
 */
function initializeContactFeatures() {
  // Contact page features are handled in contact.html inline scripts
  console.log('Contact page features initialized');
}

/**
 * Initialize admin page specific features
 */
function initializeAdminFeatures() {
  // Admin page features are handled in admin.js
  console.log('Admin page features initialized');
}

/**
 * Scroll to a specific section by ID
 * @param {string} sectionId - Section ID to scroll to
 */
function scrollToSection(sectionId) {
  const targetElement = document.getElementById(sectionId);
  if (targetElement) {
    scrollToElement(targetElement);
  }
}

/**
 * Navigate to external URLs or specific project details
 * @param {string} url - URL to navigate to
 */
function navigateToURL(url) {
  if (url.startsWith('http')) {
    // External URL - open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    // Internal URL - navigate normally
    window.location.href = url;
  }
}

/**
 * Show loading state
 * @param {boolean} show - Whether to show loading state
 */
function showLoadingState(show = true) {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    if (show) {
      loadingScreen.classList.remove('hidden');
    } else {
      loadingScreen.classList.add('hidden');
    }
  }
}

/**
 * Utility function to throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, wait) {
  let timeout;
  let previous = 0;
  
  return function executedFunction(...args) {
    const now = Date.now();
    const remaining = wait - (now - previous);
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * Utility function to debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @returns {boolean} True if element is in viewport
 */
function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Export functions for global access (REMOVED loadPage function)
window.App = App;
window.scrollToSection = scrollToSection;
window.navigateToURL = navigateToURL;
window.showLoadingState = showLoadingState;
window.isElementInViewport = isElementInViewport;

// Export utility functions
window.throttle = throttle;
window.debounce = debounce;