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
      cssFile: 'css/pages/home.css',
      jsFile: 'js/pages/home.js'
    },
    projects: {
      title: 'Projects - Flutter Developer',
      cssFile: 'css/pages/projects.css',
      jsFile: 'js/pages/projects.js'
    },
    about: {
      title: 'About - Flutter Developer',
      cssFile: 'css/pages/about.css',
      jsFile: 'js/pages/about.js'
    },
    contact: {
      title: 'Contact - Flutter Developer',
      cssFile: 'css/pages/contact.css',
      jsFile: 'js/pages/contact.js'
    },
    admin: {
      title: 'Admin Panel - Portfolio',
      cssFile: 'css/admin.css',
      jsFile: 'js/admin.js'
    }
  }
};

// Page Content Templates
const PageTemplates = {
  home: `
    <section id="home" class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              <span class="hero-greeting">Hello, I'm</span>
              <span class="hero-name">Your Name</span>
            </h1>
            <h2 class="hero-subtitle">Flutter Developer</h2>
            <p class="hero-description">
              I create beautiful, performant mobile applications using Flutter and Dart. 
              Passionate about clean code, user experience, and bringing ideas to life 
              across iOS and Android platforms.
            </p>
            <div class="hero-actions">
              <a href="#" onclick="loadPage('projects')" class="btn btn-primary">View My Work</a>
              <a href="#" onclick="loadPage('contact')" class="btn btn-secondary">Get In Touch</a>
            </div>
          </div>
          <div class="hero-image">
            <div class="hero-image-container">
              <img src="assets/images/profile.jpg" alt="Your Name - Flutter Developer" class="profile-image">
            </div>
          </div>
        </div>
        
        <div class="hero-scroll">
          <a href="#about" class="scroll-indicator">
            <span class="scroll-text">Scroll Down</span>
            <div class="scroll-arrow"></div>
          </a>
        </div>
      </div>
    </section>

    <section id="about" class="about-section section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">About Me</h2>
          <p class="section-subtitle">Get to know more about my background and expertise</p>
        </div>
        
        <div class="about-content">
          <p class="about-paragraph">
            As a passionate Flutter developer with over 3 years of experience, I specialize in 
            creating cross-platform mobile applications that deliver exceptional user experiences. 
            My expertise spans the entire development lifecycle, from concept and design to 
            deployment and maintenance.
          </p>
          <p class="about-paragraph">
            I'm proficient in Dart, Firebase, and various state management solutions including 
            Provider, Riverpod, and Bloc. I have a strong foundation in UI/UX principles and 
            enjoy collaborating with designers to bring pixel-perfect designs to life.
          </p>
          
          <div class="about-highlights">
            <div class="highlight-item">
              <h3 class="highlight-title">15+</h3>
              <p class="highlight-text">Apps Published</p>
            </div>
            <div class="highlight-item">
              <h3 class="highlight-title">3+</h3>
              <p class="highlight-text">Years Experience</p>
            </div>
            <div class="highlight-item">
              <h3 class="highlight-title">50K+</h3>
              <p class="highlight-text">App Downloads</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="projects" class="featured-projects-section section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Featured Projects</h2>
          <p class="section-subtitle">A showcase of my best Flutter applications</p>
        </div>
        
        <div class="projects-grid">
          <article class="project-card featured">
            <div class="project-image">
              <img src="assets/images/projects/project-1.jpg" alt="E-Commerce App" loading="lazy">
              <div class="project-overlay">
                <a href="#" onclick="loadProjectDetail('ecommerce-app')" class="project-link">View Details</a>
              </div>
            </div>
            <div class="project-content">
              <h3 class="project-title">E-Commerce Mobile App</h3>
              <p class="project-description">
                Full-featured shopping app with Firebase backend, payment integration, 
                and real-time order tracking.
              </p>
              <div class="project-tech">
                <span class="tech-tag">Flutter</span>
                <span class="tech-tag">Firebase</span>
                <span class="tech-tag">Stripe</span>
              </div>
            </div>
          </article>

          <article class="project-card featured">
            <div class="project-image">
              <img src="assets/images/projects/project-2.jpg" alt="Fitness Tracker App" loading="lazy">
              <div class="project-overlay">
                <a href="#" onclick="loadProjectDetail('fitness-tracker')" class="project-link">View Details</a>
              </div>
            </div>
            <div class="project-content">
              <h3 class="project-title">Fitness Tracker App</h3>
              <p class="project-description">
                Comprehensive fitness tracking with workout plans, progress monitoring, 
                and social features.
              </p>
              <div class="project-tech">
                <span class="tech-tag">Flutter</span>
                <span class="tech-tag">SQLite</span>
                <span class="tech-tag">Charts</span>
              </div>
            </div>
          </article>

          <article class="project-card featured">
            <div class="project-image">
              <img src="assets/images/projects/project-3.jpg" alt="Weather App" loading="lazy">
              <div class="project-overlay">
                <a href="#" onclick="loadProjectDetail('weather-app')" class="project-link">View Details</a>
              </div>
            </div>
            <div class="project-content">
              <h3 class="project-title">Weather Forecast App</h3>
              <p class="project-description">
                Beautiful weather app with location-based forecasts, interactive maps, 
                and customizable widgets.
              </p>
              <div class="project-tech">
                <span class="tech-tag">Flutter</span>
                <span class="tech-tag">API</span>
                <span class="tech-tag">Maps</span>
              </div>
            </div>
          </article>
        </div>
        
        <div class="section-footer">
          <a href="#" onclick="loadPage('projects')" class="btn btn-outline">View All Projects</a>
        </div>
      </div>
    </section>

    <section id="skills" class="skills-section section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Skills & Expertise</h2>
          <p class="section-subtitle">Technologies and tools I work with</p>
        </div>
        
        <div class="skills-content">
          <div class="skills-category">
            <h3 class="category-title">Mobile Development</h3>
            <div class="skills-list">
              <div class="skill-item">
                <span class="skill-name">Flutter</span>
                <div class="skill-level">
                  <div class="skill-progress" style="width: 95%"></div>
                </div>
              </div>
              <div class="skill-item">
                <span class="skill-name">Dart</span>
                <div class="skill-level">
                  <div class="skill-progress" style="width: 95%"></div>
                </div>
              </div>
              <div class="skill-item">
                <span class="skill-name">Android (Native)</span>
                <div class="skill-level">
                  <div class="skill-progress" style="width: 75%"></div>
                </div>
              </div>
              <div class="skill-item">
                <span class="skill-name">iOS (Native)</span>
                <div class="skill-level">
                  <div class="skill-progress" style="width: 65%"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="skills-category">
            <h3 class="category-title">Backend & Database</h3>
            <div class="skills-list">
              <div class="skill-item">
                <span class="skill-name">Firebase</span>
                <div class="skill-level">
                  <div class="skill-progress" style="width: 90%"></div>
                </div>
              </div>
              <div class="skill-item">
                <span class="skill-name">REST APIs</span>
                <div class="skill-level">
                  <div class="skill-progress" style="width: 85%"></div>
                </div>
              </div>
              <div class="skill-item">
                <span class="skill-name">SQLite</span>
                <div class="skill-level">
                  <div class="skill-progress" style="width: 80%"></div>
                </div>
              </div>
              <div class="skill-item">
                <span class="skill-name">Node.js</span>
                <div class="skill-level">
                  <div class="skill-progress" style="width: 70%"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="skills-category">
            <h3 class="category-title">Tools & Others</h3>
            <div class="skills-list">
              <div class="skill-item">
                <span class="skill-name">Git & GitHub</span>
                <div class="skill-level">
                  <div class="skill-progress" style="width: 90%"></div>
                </div>
              </div>
              <div class="skill-item">
                <span class="skill-name">Figma</span>
                <div class="skill-level">
                  <div class="skill-progress" style="width: 80%"></div>
                </div>
              </div>
              <div class="skill-item">
                <span class="skill-name">App Store Deployment</span>
                <div class="skill-level">
                  <div class="skill-progress" style="width: 85%"></div>
                </div>
              </div>
              <div class="skill-item">
                <span class="skill-name">CI/CD</span>
                <div class="skill-level">
                  <div class="skill-progress" style="width: 75%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="contact" class="contact-section section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Let's Work Together</h2>
          <p class="section-subtitle">Ready to bring your mobile app idea to life?</p>
        </div>
        
        <div class="contact-content">
          <div class="contact-info">
            <div class="contact-item">
              <h3 class="contact-title">Email</h3>
              <a href="mailto:your.email@example.com" class="contact-link">your.email@example.com</a>
            </div>
            <div class="contact-item">
              <h3 class="contact-title">Location</h3>
              <p class="contact-text">Your City, Country</p>
            </div>
            <div class="contact-item">
              <h3 class="contact-title">Availability</h3>
              <p class="contact-text">Available for freelance projects</p>
            </div>
          </div>
          
          <div class="contact-actions">
            <a href="mailto:your.email@example.com" class="btn btn-primary">Send Email</a>
            <div class="social-links">
              <a href="https://github.com/yourusername" target="_blank" rel="noopener" class="social-link">GitHub</a>
              <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener" class="social-link">LinkedIn</a>
              <a href="https://twitter.com/yourusername" target="_blank" rel="noopener" class="social-link">Twitter</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  
  projects: `
    <section class="projects-page section">
      <div class="container">
        <div class="section-header">
          <h1 class="section-title">My Projects</h1>
          <p class="section-subtitle">Explore my Flutter applications and development work</p>
        </div>
        
        <div class="filter-container">
          <div class="filter-group">
            <label class="filter-label">Category:</label>
            <select class="filter-select" id="categoryFilter">
              <option value="all">All Categories</option>
              <option value="mobile">Mobile Apps</option>
              <option value="web">Web Apps</option>
              <option value="game">Games</option>
              <option value="utility">Utilities</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Technology:</label>
            <select class="filter-select" id="techFilter">
              <option value="all">All Technologies</option>
              <option value="flutter">Flutter</option>
              <option value="firebase">Firebase</option>
              <option value="api">REST API</option>
              <option value="sqlite">SQLite</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Sort by:</label>
            <select class="filter-select" id="sortFilter">
              <option value="latest">Latest</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="featured">Featured First</option>
            </select>
          </div>
          
          <div class="search-box">
            <input type="text" class="search-input" id="searchInput" placeholder="Search projects...">
          </div>
        </div>
        
        <div class="projects-grid" id="projectsGrid">
          <!-- Projects will be loaded here -->
        </div>
        
        <div class="pagination" id="pagination">
          <!-- Pagination will be generated here -->
        </div>
      </div>
    </section>
  `,
  
  contact: `
    <section class="contact-page section">
      <div class="container">
        <div class="section-header">
          <h1 class="section-title">Get In Touch</h1>
          <p class="section-subtitle">Let's discuss your next mobile app project</p>
        </div>
        
        <div class="contact-content">
          <div class="contact-info">
            <div class="contact-item">
              <h3 class="contact-title">Email</h3>
              <a href="mailto:your.email@example.com" class="contact-link">your.email@example.com</a>
            </div>
            <div class="contact-item">
              <h3 class="contact-title">Phone</h3>
              <a href="tel:+1234567890" class="contact-link">+1 (234) 567-890</a>
            </div>
            <div class="contact-item">
              <h3 class="contact-title">Location</h3>
              <p class="contact-text">Your City, Country</p>
            </div>
            <div class="contact-item">
              <h3 class="contact-title">Availability</h3>
              <p class="contact-text">Available for freelance projects</p>
            </div>
            <div class="contact-item">
              <h3 class="contact-title">Response Time</h3>
              <p class="contact-text">Usually within 24 hours</p>
            </div>
          </div>
          
          <div class="contact-form">
            <form id="contactForm">
              <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" name="name" required>
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
              </div>
              <div class="form-group">
                <label for="subject">Subject</label>
                <input type="text" id="subject" name="subject" required>
              </div>
              <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" rows="6" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `
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
  
  // Initialize navigation
  initializeNavigation();
  
  // Load initial page based on URL hash or default to home
  const initialPage = getInitialPage();
  loadPage(initialPage);
  
  // Add scroll event listener for navbar
  window.addEventListener('scroll', handleScroll);
  
  // Add resize event listener
  window.addEventListener('resize', handleResize);
  
  console.log('Portfolio App initialized successfully');
}

/**
 * Get initial page from URL hash
 */
function getInitialPage() {
  const hash = window.location.hash.substring(1);
  return hash && App.pages[hash] ? hash : 'home';
}

/**
 * Initialize navigation functionality
 */
function initializeNavigation() {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on links
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }
}

/**
 * Load a specific page
 * @param {string} page - Page name to load
 */
async function loadPage(page) {
  if (App.isLoading || !App.pages[page]) {
    console.warn(`Page "${page}" not found or app is loading`);
    return;
  }
  
  try {
    App.isLoading = true;
    showLoadingScreen();
    
    // Update URL hash
    window.location.hash = page;
    
    // Update page title
    document.getElementById('page-title').textContent = App.pages[page].title;
    
    // Load page-specific CSS
    await loadPageCSS(page);
    
    // Load page content
    loadPageContent(page);
    
    // Load page-specific JavaScript
    await loadPageJS(page);
    
    // Update navigation active state
    updateNavigationState(page);
    
    // Update current page
    App.currentPage = page;
    
    // Hide loading screen
    hideLoadingScreen();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log(`Page "${page}" loaded successfully`);
  } catch (error) {
    console.error('Error loading page:', error);
    hideLoadingScreen();
  } finally {
    App.isLoading = false;
  }
}

/**
 * Load page-specific CSS
 * @param {string} page - Page name
 */
function loadPageCSS(page) {
  return new Promise((resolve, reject) => {
    const pageConfig = App.pages[page];
    if (!pageConfig.cssFile) {
      resolve();
      return;
    }
    
    const existingLink = document.getElementById('page-css');
    if (existingLink) {
      existingLink.href = pageConfig.cssFile;
      existingLink.onload = resolve;
      existingLink.onerror = reject;
    } else {
      const link = document.createElement('link');
      link.id = 'page-css';
      link.rel = 'stylesheet';
      link.href = pageConfig.cssFile;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    }
  });
}

/**
 * Load page content
 * @param {string} page - Page name
 */
function loadPageContent(page) {
  const mainContent = document.getElementById('main-content');
  const template = PageTemplates[page];
  
  if (mainContent && template) {
    mainContent.innerHTML = template;
    mainContent.classList.add('fade-in');
    
    // Remove fade-in class after animation
    setTimeout(() => {
      mainContent.classList.remove('fade-in');
    }, 500);
  }
}

/**
 * Load page-specific JavaScript
 * @param {string} page - Page name
 */
function loadPageJS(page) {
  return new Promise((resolve, reject) => {
    const pageConfig = App.pages[page];
    if (!pageConfig.jsFile) {
      resolve();
      return;
    }
    
    const existingScript = document.getElementById('page-js');
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.id = 'page-js';
    script.src = pageConfig.jsFile;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
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
 * Show loading screen
 */
function showLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.remove('hidden');
  }
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 300);
  }
}

/**
 * Handle scroll events for navbar styling
 */
function handleScroll() {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
}

/**
 * Handle resize events
 */
function handleResize() {
  // Close mobile menu on resize
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  if (navToggle && navMenu && window.innerWidth > 768) {
    navToggle.classList.remove('active');
    navMenu.classList.remove('active');
  }
}

/**
 * Load specific project detail
 * @param {string} projectId - Project ID to load
 */
function loadProjectDetail(projectId) {
  // This will be implemented when project detail functionality is added
  console.log(`Loading project detail for: ${projectId}`);
  // For now, redirect to projects page
  loadPage('projects');
}

/**
 * Smooth scroll to element
 * @param {string} targetId - Target element ID
 */
function scrollToElement(targetId) {
  const target = document.getElementById(targetId);
  if (target) {
    const offsetTop = target.offsetTop - 70; // Account for fixed navbar
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
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
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Export functions for global access
window.loadPage = loadPage;
window.loadProjectDetail = loadProjectDetail;
window.scrollToElement = scrollToElement;