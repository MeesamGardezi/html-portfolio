/**
 * MAIN.JS - Core Application Logic
 * Portfolio Website - Black & White Minimalistic Theme
 */

// Global App State
const App = {
  currentPage: 'home',
  isLoading: false,
  pages: {
    home: {
      title: 'Flutter Developer Portfolio',
      cssFile: 'css/pages/home.css'
    },
    projects: {
      title: 'Projects - Flutter Developer',  
      cssFile: 'css/pages/projects.css'
    },
    about: {
      title: 'About - Flutter Developer',
      cssFile: 'css/pages/about.css'
    },
    contact: {
      title: 'Contact - Flutter Developer',
      cssFile: 'css/pages/contact.css'
    }
  }
};

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
  
  // Load home page specific CSS
  loadPageCSS('home');
  
  // Initialize smooth scrolling for internal links
  initializeSmoothScrolling();
  
  // Initialize scroll animations
  initializeScrollAnimations();
  
  // Initialize hero animations
  initializeHeroAnimations();
  
  console.log('Portfolio App initialized successfully');
}

/**
 * Load page-specific CSS
 * @param {string} page - Page name
 */
function loadPageCSS(page) {
  const pageConfig = App.pages[page];
  if (!pageConfig || !pageConfig.cssFile) return;
  
  const existingLink = document.getElementById('page-css');
  if (existingLink) {
    existingLink.href = pageConfig.cssFile;
  } else {
    const link = document.createElement('link');
    link.id = 'page-css';
    link.rel = 'stylesheet';
    link.href = pageConfig.cssFile;
    document.head.appendChild(link);
  }
}

/**
 * Load specific page
 * @param {string} page - Page name to load
 */
function loadPage(page) {
  console.log(`Loading page: ${page}`);
  
  if (page === 'home') {
    // Navigate to home page
    window.location.href = 'index.html';
  } else if (page === 'projects') {
    // Navigate to projects page
    window.location.href = 'projects.html';
  } else if (page === 'about') {
    // Scroll to about section on home page
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      scrollToSection('about');
    } else {
      window.location.href = 'index.html#about';
    }
  } else if (page === 'contact') {
    // Scroll to contact section on home page
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      scrollToSection('contact');
    } else {
      window.location.href = 'index.html#contact';
    }
  }
  
  // Update active navigation
  updateNavigationState(page);
}

/**
 * Update navigation active state
 * @param {string} page - Current page name
 */
function updateNavigationState(page) {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    }
  });
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
        const navbarHeight = 70;
        const targetPosition = targetElement.offsetTop - navbarHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
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
        element.style.transform = 'translateY(30px)';
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
    '.about-section',
    '.featured-projects-section', 
    '.skills-section',
    '.contact-section',
    '.project-card',
    '.skills-category',
    '.highlight-item'
  ].join(','));
  
  animatedElements.forEach(element => {
    animationObserver.observe(element);
  });
}

/**
 * Initialize hero section animations
 */
function initializeHeroAnimations() {
  const heroText = document.querySelector('.hero-text');
  const heroImage = document.querySelector('.hero-image');
  
  if (heroText && heroImage) {
    // Initial state
    heroText.style.opacity = '0';
    heroText.style.transform = 'translateX(-50px)';
    heroImage.style.opacity = '0';  
    heroImage.style.transform = 'translateX(50px)';
    
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
    });
    
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
    }, index * 200);
  });
}

/**
 * Scroll to a specific section
 * @param {string} sectionId - Section ID to scroll to
 */
function scrollToSection(sectionId) {
  const targetElement = document.getElementById(sectionId);
  if (targetElement) {
    const navbarHeight = 70;
    const targetPosition = targetElement.offsetTop - navbarHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

/**
 * Load specific project detail (placeholder for now)
 * @param {string} projectId - Project ID to load
 */
function loadProjectDetail(projectId) {
  console.log(`Loading project detail for: ${projectId}`);
  alert(`Project details for ${projectId} will be implemented next!`);
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

// Export functions for global access
window.loadPage = loadPage;
window.loadProjectDetail = loadProjectDetail;

// Handle navbar scroll effect
window.addEventListener('scroll', debounce(() => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
}, 10));