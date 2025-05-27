/**
 * LAYOUT.JS - Navigation & Layout Logic (FIXED VERSION)
 * Portfolio Website - Black & White Minimalistic Theme
 * FIXES: Consistent navigation across all pages, proper link handling, scroll behavior
 */

// Layout-specific state and functionality
const Layout = {
  navbar: null,
  navToggle: null,
  navMenu: null,
  isMenuOpen: false,
  scrollThreshold: 50,
  lastScrollY: 0,
  scrollDirection: 'up'
};

/**
 * Initialize layout functionality when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  initializeLayout();
});

/**
 * Initialize all layout components
 */
function initializeLayout() {
  console.log('Initializing layout components...');
  
  // Cache DOM elements
  cacheLayoutElements();
  
  // Initialize navigation
  initializeNavigation();
  
  // Initialize scroll behavior
  initializeScrollBehavior();
  
  // Initialize mobile menu
  initializeMobileMenu();
  
  // Initialize keyboard navigation
  initializeKeyboardNavigation();
  
  console.log('Layout components initialized successfully');
}

/**
 * Cache commonly used DOM elements
 */
function cacheLayoutElements() {
  Layout.navbar = document.getElementById('navbar');
  Layout.navToggle = document.getElementById('nav-toggle');
  Layout.navMenu = document.getElementById('nav-menu');
}

/**
 * Initialize navigation functionality
 */
function initializeNavigation() {
  if (!Layout.navbar) return;
  
  // Add navigation event listeners
  const navLinks = Layout.navbar.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', handleNavLinkClick);
  });
  
  // Logo click handler
  const logoLink = Layout.navbar.querySelector('.logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', function(e) {
      e.preventDefault();
      navigateToPage('index.html');
      closeMobileMenu();
    });
  }
  
  // Initialize active link highlighting
  updateActiveNavLink();
}

/**
 * Handle navigation link clicks (FIXED VERSION)
 * @param {Event} event - Click event
 */
function handleNavLinkClick(event) {
  event.preventDefault();
  
  const link = event.currentTarget;
  const href = link.getAttribute('href');
  const dataPage = link.getAttribute('data-page');
  
  // Handle different types of navigation
  if (href) {
    if (href.startsWith('#')) {
      // Internal anchor link (scroll to section)
      const targetId = href.substring(1);
      
      // If we're not on index page, go to index first
      if (!window.location.pathname.includes('index.html') && 
          window.location.pathname !== '/' && 
          window.location.pathname !== '') {
        navigateToPage(`index.html${href}`);
      } else {
        scrollToSection(targetId);
      }
    } else if (href.includes('.html')) {
      // Navigate to different page
      navigateToPage(href);
    }
  } else if (dataPage) {
    // Handle data-page navigation
    switch (dataPage) {
      case 'home':
        navigateToPage('index.html');
        break;
      case 'projects':
        navigateToPage('projects.html');
        break;
      case 'contact':
        navigateToPage('contact.html');
        break;
      case 'about':
        if (window.location.pathname.includes('index.html') || 
            window.location.pathname === '/' || 
            window.location.pathname === '') {
          scrollToSection('about');
        } else {
          navigateToPage('index.html#about');
        }
        break;
    }
  }
  
  closeMobileMenu();
}

/**
 * Navigate to a page (FIXED VERSION)
 * @param {string} url - URL to navigate to
 */
function navigateToPage(url) {
  // Smooth page transition
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.style.opacity = '0.7';
    mainContent.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      window.location.href = url;
    }, 150);
  } else {
    window.location.href = url;
  }
}

/**
 * Initialize scroll behavior
 */
function initializeScrollBehavior() {
  // Throttled scroll handler for better performance
  const throttledScrollHandler = throttle(handleScroll, 16); // ~60fps
  window.addEventListener('scroll', throttledScrollHandler, { passive: true });
  
  // Initial scroll check
  handleScroll();
}

/**
 * Handle scroll events
 */
function handleScroll() {
  const currentScrollY = window.scrollY;
  const scrollDifference = currentScrollY - Layout.lastScrollY;
  
  // Determine scroll direction
  if (scrollDifference > 0) {
    Layout.scrollDirection = 'down';
  } else if (scrollDifference < 0) {
    Layout.scrollDirection = 'up';
  }
  
  // Update navbar appearance based on scroll
  updateNavbarOnScroll(currentScrollY);
  
  // Update active section in navigation
  updateActiveNavLink();
  
  Layout.lastScrollY = currentScrollY;
}

/**
 * Update navbar appearance based on scroll position
 * @param {number} scrollY - Current scroll position
 */
function updateNavbarOnScroll(scrollY) {
  if (!Layout.navbar) return;
  
  // Add/remove scrolled class
  if (scrollY > Layout.scrollThreshold) {
    Layout.navbar.classList.add('scrolled');
  } else {
    Layout.navbar.classList.remove('scrolled');
  }
}

/**
 * Update active navigation link based on current section
 */
function updateActiveNavLink() {
  const navLinks = document.querySelectorAll('.nav-link');
  const currentPath = window.location.pathname;
  const currentHash = window.location.hash;
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    
    const href = link.getAttribute('href');
    const dataPage = link.getAttribute('data-page');
    
    // Check for page-based navigation
    if (href) {
      if (href.includes('index.html') && (currentPath.includes('index.html') || currentPath === '/' || currentPath === '')) {
        link.classList.add('active');
      } else if (href.includes('projects.html') && currentPath.includes('projects.html')) {
        link.classList.add('active');
      } else if (href.includes('contact.html') && currentPath.includes('contact.html')) {
        link.classList.add('active');
      } else if (href.includes('admin.html') && currentPath.includes('admin.html')) {
        link.classList.add('active');
      } else if (href.startsWith('#') && href === currentHash) {
        link.classList.add('active');
      }
    }
    
    // Check for data-page navigation
    if (dataPage) {
      if (dataPage === 'home' && (currentPath.includes('index.html') || currentPath === '/' || currentPath === '')) {
        link.classList.add('active');
      } else if (dataPage === 'projects' && currentPath.includes('projects.html')) {
        link.classList.add('active');
      } else if (dataPage === 'contact' && currentPath.includes('contact.html')) {
        link.classList.add('active');
      }
    }
  });
  
  // Handle section-based active states for single page
  if (currentPath.includes('index.html') || currentPath === '/' || currentPath === '') {
    updateSectionBasedNavigation();
  }
}

/**
 * Update navigation based on current section in viewport
 */
function updateSectionBasedNavigation() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  let currentSection = null;
  
  // Find the current section in viewport
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionHeight = rect.height;
    
    // Check if section is in viewport (with offset for navbar)
    if (sectionTop <= 100 && sectionTop + sectionHeight > 100) {
      currentSection = section.id;
    }
  });
  
  // Update navigation link active states for sections
  if (currentSection) {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href === `#${currentSection}`) {
        // Remove active from page-level navigation first
        if (href.startsWith('#')) {
          // Only add active to section links, not page links
          link.classList.add('active');
        }
      } else if (href && href.startsWith('#') && href !== `#${currentSection}`) {
        link.classList.remove('active');
      }
    });
  }
}

/**
 * Initialize mobile menu functionality
 */
function initializeMobileMenu() {
  if (!Layout.navToggle || !Layout.navMenu) return;
  
  // Mobile menu toggle
  Layout.navToggle.addEventListener('click', toggleMobileMenu);
  
  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
    if (Layout.isMenuOpen && 
        !Layout.navToggle.contains(event.target) && 
        !Layout.navMenu.contains(event.target)) {
      closeMobileMenu();
    }
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && Layout.isMenuOpen) {
      closeMobileMenu();
    }
  });
  
  // Close menu on window resize to desktop
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && Layout.isMenuOpen) {
      closeMobileMenu();
    }
  });
}

/**
 * Toggle mobile menu open/close
 */
function toggleMobileMenu() {
  if (Layout.isMenuOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

/**
 * Open mobile menu
 */
function openMobileMenu() {
  Layout.isMenuOpen = true;
  Layout.navToggle.classList.add('active');
  Layout.navMenu.classList.add('active');
  Layout.navToggle.setAttribute('aria-expanded', 'true');
  
  // Prevent body scroll when menu is open
  document.body.style.overflow = 'hidden';
  
  // Focus first menu item for accessibility
  const firstLink = Layout.navMenu.querySelector('.nav-link');
  if (firstLink) {
    firstLink.focus();
  }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
  Layout.isMenuOpen = false;
  Layout.navToggle.classList.remove('active');
  Layout.navMenu.classList.remove('active');
  Layout.navToggle.setAttribute('aria-expanded', 'false');
  
  // Restore body scroll
  document.body.style.overflow = '';
}

/**
 * Initialize keyboard navigation
 */
function initializeKeyboardNavigation() {
  // Handle keyboard navigation in mobile menu
  Layout.navMenu?.addEventListener('keydown', function(event) {
    if (!Layout.isMenuOpen) return;
    
    const focusableElements = Layout.navMenu.querySelectorAll('.nav-link');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.key === 'Tab') {
      // Trap focus within mobile menu
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  });
}

/**
 * Smooth scroll to a section
 * @param {string} sectionId - Target section ID
 */
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  
  const navbarHeight = Layout.navbar ? Layout.navbar.offsetHeight : 70;
  const targetPosition = section.offsetTop - navbarHeight;
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
  
  // Update URL hash without triggering navigation
  history.pushState(null, null, `#${sectionId}`);
}

/**
 * Get navbar height (useful for other components)
 * @returns {number} Navbar height in pixels
 */
function getNavbarHeight() {
  return Layout.navbar ? Layout.navbar.offsetHeight : 70;
}

/**
 * Check if mobile menu is open
 * @returns {boolean} True if mobile menu is open
 */
function isMobileMenuOpen() {
  return Layout.isMenuOpen;
}

/**
 * Update page title and meta description
 * @param {string} title - Page title
 * @param {string} description - Page description
 */
function updatePageMeta(title, description) {
  document.title = title;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && description) {
    metaDescription.setAttribute('content', description);
  }
}

/**
 * Show/hide loading state for navigation
 * @param {boolean} isLoading - Loading state
 */
function setNavigationLoading(isLoading) {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    if (isLoading) {
      link.style.pointerEvents = 'none';
      link.style.opacity = '0.6';
    } else {
      link.style.pointerEvents = '';
      link.style.opacity = '';
    }
  });
}

/**
 * Add scroll-based animation to elements
 * @param {string} selector - CSS selector for elements to animate
 * @param {string} className - Class to add when element is in view
 */
function addScrollAnimation(selector, className = 'fade-in') {
  const elements = document.querySelectorAll(selector);
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add(className);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  elements.forEach(element => {
    observer.observe(element);
  });
}

/**
 * Initialize scroll animations for common elements
 */
function initializeScrollAnimations() {
  // Add animations to sections, cards, and other elements
  addScrollAnimation('.section');
  addScrollAnimation('.project-card');
  addScrollAnimation('.skills-category');
  addScrollAnimation('.highlight-item');
  addScrollAnimation('.contact-item');
}

/**
 * Throttle function for performance optimization
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Delay animation initialization to ensure all content is loaded
  setTimeout(initializeScrollAnimations, 100);
});

// Export functions for use in other modules
window.Layout = {
  scrollToSection,
  getNavbarHeight,
  isMobileMenuOpen,
  closeMobileMenu,
  updatePageMeta,
  setNavigationLoading,
  addScrollAnimation,
  navigateToPage
};