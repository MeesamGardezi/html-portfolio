/**
 * HOME.JS - Home Page Specific Logic (FIXED VERSION)
 * Portfolio Website - Black & White Minimalistic Theme
 * FIXES: Contact form functionality and featured projects loading
 */

// Home page state and functionality
const HomePage = {
  isInitialized: false,
  animationObserver: null,
  typingAnimation: null,
  skillsAnimated: false,
  contactFormInitialized: false,
  featuredProjectsLoaded: false,
  initializationAttempts: 0,
  maxInitAttempts: 5,
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
  console.log('Home.js - DOM loaded, initializing...');
  waitForFirebaseAndInitialize();
});

/**
 * Wait for Firebase and initialize home page
 */
function waitForFirebaseAndInitialize() {
  HomePage.initializationAttempts++;
  
  // Check if already initialized
  if (HomePage.isInitialized) {
    console.log('Home page already initialized');
    return;
  }
  
  // Check if Firebase is ready
  if (window.FirebaseService && window.FirebaseService.isInitialized()) {
    console.log('Firebase ready, initializing home page...');
    initializeHomePage();
    return;
  }
  
  // Check if Firebase SDK is loaded
  if (typeof firebase === 'undefined') {
    if (HomePage.initializationAttempts < HomePage.maxInitAttempts) {
      console.log(`Firebase SDK not loaded, attempt ${HomePage.initializationAttempts}/${HomePage.maxInitAttempts}`);
      setTimeout(waitForFirebaseAndInitialize, 1000);
    } else {
      console.warn('Firebase SDK failed to load, initializing without Firebase');
      initializeHomePage();
    }
    return;
  }
  
  // Listen for Firebase ready events
  const events = ['firebaseReady', 'firebase-ready', 'firebase:ready'];
  events.forEach(eventName => {
    window.addEventListener(eventName, function handler() {
      console.log(`Firebase ready event received (${eventName})`);
      if (!HomePage.isInitialized) {
        initializeHomePage();
      }
      // Remove listener after use
      window.removeEventListener(eventName, handler);
    });
  });
  
  // Retry if needed
  if (HomePage.initializationAttempts < HomePage.maxInitAttempts) {
    setTimeout(waitForFirebaseAndInitialize, 1000);
  } else {
    console.warn('Max initialization attempts reached, initializing without Firebase');
    initializeHomePage();
  }
}

/**
 * Initialize all home page functionality
 */
function initializeHomePage() {
  if (HomePage.isInitialized) return;
  
  console.log('Initializing home page...');
  
  try {
    // Initialize contact form first
    initializeHomeContactForm();
    
    // Load featured projects
    loadFeaturedProjectsWithRetry();
    
    // Initialize scroll animations
    initializeScrollAnimations();
    
    // Initialize hero animation
    initializeHeroAnimation();
    
    // Initialize skills animation
    initializeSkillsAnimation();
    
    // Initialize counter animations
    initializeCounterAnimations();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Track page view
    trackPageView('home');
    
    HomePage.isInitialized = true;
    console.log('Home page initialized successfully');
    
  } catch (error) {
    console.error('Error initializing home page:', error);
  }
}

/**
 * Initialize home contact form (FIXED VERSION)
 */
function initializeHomeContactForm() {
  if (HomePage.contactFormInitialized) return;
  
  const form = document.getElementById('homeContactForm');
  if (!form) {
    console.warn('Home contact form not found');
    return;
  }
  
  console.log('Initializing home contact form...');
  
  // Remove existing listeners to prevent duplicates
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  
  // Add submit listener
  newForm.addEventListener('submit', handleHomeContactSubmit);
  
  // Initialize field validation
  initializeFormValidation(newForm);
  
  HomePage.contactFormInitialized = true;
  console.log('Home contact form initialized successfully');
}

/**
 * Handle home contact form submission
 */
async function handleHomeContactSubmit(e) {
  e.preventDefault();
  
  console.log('Processing home contact form submission...');
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  
  // Validate form
  if (!validateContactForm(data)) {
    console.log('Form validation failed');
    return;
  }
  
  const submitBtn = document.getElementById('homeSubmitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');
  
  try {
    // Show loading state
    updateSubmitButton(submitBtn, btnText, btnSpinner, true);
    
    // Check Firebase availability
    if (!window.FirebaseService || !window.FirebaseService.isInitialized()) {
      throw new Error('Contact service is temporarily unavailable. Please try again later or email directly.');
    }
    
    if (!window.FirebaseService.isServiceAvailable('firestore')) {
      throw new Error('Contact service is temporarily unavailable. Please try again later.');
    }
    
    // Submit to Firebase
    await window.FirebaseService.addContact({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      source: 'home_page'
    });
    
    // Success
    showHomeNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
    e.target.reset();
    clearFormErrors();
    
    console.log('Contact form submitted successfully');
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    
    let errorMessage = 'Failed to send message. Please try again.';
    
    if (error.message.includes('Too many')) {
      errorMessage = error.message;
    } else if (error.message.includes('temporarily unavailable')) {
      errorMessage = error.message;
    } else if (error.message.includes('permission-denied')) {
      errorMessage = 'Contact service is temporarily unavailable. Please email directly.';
    }
    
    showHomeNotification(errorMessage, 'error');
    
  } finally {
    // Restore button state
    updateSubmitButton(submitBtn, btnText, btnSpinner, false);
  }
}

/**
 * Update submit button state
 */
function updateSubmitButton(submitBtn, btnText, btnSpinner, isLoading) {
  if (isLoading) {
    btnText.textContent = 'Sending...';
    btnSpinner.classList.remove('hidden');
    submitBtn.disabled = true;
  } else {
    btnText.textContent = 'Send Message';
    btnSpinner.classList.add('hidden');
    submitBtn.disabled = false;
  }
}

/**
 * Load featured projects with retry mechanism
 */
async function loadFeaturedProjectsWithRetry(attempt = 1, maxAttempts = 3) {
  if (HomePage.featuredProjectsLoaded) return;
  
  const grid = document.getElementById('featuredProjectsGrid');
  const loading = document.getElementById('projectsLoading');
  
  if (!grid) {
    console.warn('Featured projects grid not found');
    return;
  }
  
  try {
    console.log(`Loading featured projects, attempt ${attempt}/${maxAttempts}`);
    
    // Check Firebase availability
    if (!window.FirebaseService || !window.FirebaseService.isInitialized()) {
      throw new Error('Firebase not available');
    }
    
    if (!window.FirebaseService.isServiceAvailable('firestore')) {
      throw new Error('Firestore not available');
    }
    
    // Get featured projects
    const featuredProjects = await window.FirebaseService.getFeaturedProjects();
    
    console.log(`Retrieved ${featuredProjects.length} featured projects`);
    
    // Hide loading
    if (loading) {
      loading.style.display = 'none';
    }
    
    // Render projects
    renderFeaturedProjects(grid, featuredProjects);
    
    // Update apps count
    updateAppsCount(featuredProjects.length);
    
    HomePage.featuredProjectsLoaded = true;
    console.log('Featured projects loaded successfully');
    
  } catch (error) {
    console.error(`Error loading featured projects (attempt ${attempt}):`, error);
    
    if (loading) {
      loading.style.display = 'none';
    }
    
    if (attempt < maxAttempts) {
      // Show retry state
      showRetryState(grid, attempt, maxAttempts);
      
      // Retry with exponential backoff
      const retryDelay = Math.min(attempt * 2000, 10000);
      setTimeout(() => {
        loadFeaturedProjectsWithRetry(attempt + 1, maxAttempts);
      }, retryDelay);
    } else {
      // Show final error state
      showErrorState(grid);
    }
  }
}

/**
 * Render featured projects
 */
function renderFeaturedProjects(grid, projects) {
  if (projects.length === 0) {
    grid.innerHTML = `
      <div class="no-featured-projects">
        <h3>Featured Projects</h3>
        <p>Featured projects will appear here once added.</p>
        <a href="projects.html" class="btn btn-outline">View All Projects</a>
      </div>
    `;
  } else {
    grid.innerHTML = projects.map(project => createFeaturedProjectCard(project)).join('');
    
    // Add stagger animation
    const cards = grid.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 150);
    });
  }
}

/**
 * Show retry state
 */
function showRetryState(grid, attempt, maxAttempts) {
  grid.innerHTML = `
    <div class="project-loading-retry">
      <div class="loading-spinner"></div>
      <h3>Loading Projects...</h3>
      <p>Connecting to database (attempt ${attempt}/${maxAttempts})</p>
    </div>
  `;
}

/**
 * Show error state
 */
function showErrorState(grid) {
  grid.innerHTML = `
    <div class="project-error">
      <h3>Unable to load projects</h3>
      <p>Please check your connection and try again.</p>
      <button onclick="window.HomePage.retryLoadProjects()" class="btn btn-outline">Retry</button>
    </div>
  `;
}

/**
 * Create featured project card HTML
 */
function createFeaturedProjectCard(project) {
  const imageUrl = project.images && project.images.length > 0 
    ? project.images[0] 
    : 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop';
  
  const techTags = project.technologies 
    ? project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')
    : '';
  
  return `
    <article class="project-card featured" role="listitem">
      <div class="project-image">
        <img src="${imageUrl}" alt="${project.title || 'Project'}" loading="lazy" 
             onerror="this.src='https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop'">
        <div class="project-overlay">
          <a href="projects.html#${project.id}" class="project-link">View Details</a>
        </div>
      </div>
      <div class="project-content">
        <h3 class="project-title">${project.title || 'Untitled Project'}</h3>
        <p class="project-description">${project.description || 'No description available'}</p>
        <div class="project-tech">${techTags}</div>
      </div>
    </article>
  `;
}

/**
 * Update apps count in about section
 */
function updateAppsCount(featuredCount) {
  if (window.FirebaseService && window.FirebaseService.isInitialized()) {
    window.FirebaseService.getProjects()
      .then(allProjects => {
        const appsCount = document.getElementById('appsCount');
        if (appsCount && allProjects) {
          const totalPublished = allProjects.filter(p => 
            !p.status || ['published', 'completed'].includes(p.status)
          ).length;
          appsCount.textContent = `${totalPublished}+`;
        }
      })
      .catch(() => {
        // Fallback to featured count
        const appsCount = document.getElementById('appsCount');
        if (appsCount) {
          appsCount.textContent = `${featuredCount}+`;
        }
      });
  }
}

/**
 * Initialize form validation
 */
function initializeFormValidation(form) {
  const fields = form.querySelectorAll('input, textarea');
  
  fields.forEach(field => {
    field.addEventListener('input', () => clearFieldError(field));
    field.addEventListener('blur', () => validateField(field));
  });
}

/**
 * Validate contact form
 */
function validateContactForm(data) {
  let isValid = true;
  
  clearFormErrors();
  
  if (!data.name?.trim()) {
    showFieldError('homeName', 'Name is required');
    isValid = false;
  } else if (data.name.trim().length < 2) {
    showFieldError('homeName', 'Name must be at least 2 characters');
    isValid = false;
  }
  
  if (!data.email?.trim()) {
    showFieldError('homeEmail', 'Email is required');
    isValid = false;
  } else if (!isValidEmail(data.email)) {
    showFieldError('homeEmail', 'Please enter a valid email address');
    isValid = false;
  }
  
  if (!data.subject?.trim()) {
    showFieldError('homeSubject', 'Subject is required');
    isValid = false;
  } else if (data.subject.trim().length < 3) {
    showFieldError('homeSubject', 'Subject must be at least 3 characters');
    isValid = false;
  }
  
  if (!data.message?.trim()) {
    showFieldError('homeMessage', 'Message is required');
    isValid = false;
  } else if (data.message.trim().length < 10) {
    showFieldError('homeMessage', 'Message must be at least 10 characters');
    isValid = false;
  }
  
  return isValid;
}

/**
 * Validate individual field
 */
function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.name;
  
  clearFieldError(field);
  
  switch (fieldName) {
    case 'name':
      if (!value) {
        showFieldError(field.id, 'Name is required');
      } else if (value.length < 2) {
        showFieldError(field.id, 'Name must be at least 2 characters');
      }
      break;
    case 'email':
      if (!value) {
        showFieldError(field.id, 'Email is required');
      } else if (!isValidEmail(value)) {
        showFieldError(field.id, 'Please enter a valid email address');
      }
      break;
    case 'subject':
      if (!value) {
        showFieldError(field.id, 'Subject is required');
      } else if (value.length < 3) {
        showFieldError(field.id, 'Subject must be at least 3 characters');
      }
      break;
    case 'message':
      if (!value) {
        showFieldError(field.id, 'Message is required');
      } else if (value.length < 10) {
        showFieldError(field.id, 'Message must be at least 10 characters');
      }
      break;
  }
}

/**
 * Show field error
 */
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  
  const errorId = fieldId.replace('home', '').toLowerCase() + '-error';
  const errorElement = document.getElementById(errorId);
  
  field.style.borderColor = '#ef4444';
  field.setAttribute('aria-invalid', 'true');
  
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

/**
 * Clear field error
 */
function clearFieldError(field) {
  if (!field) return;
  
  field.style.borderColor = '';
  field.removeAttribute('aria-invalid');
  
  const fieldId = field.id;
  const errorId = fieldId.replace('home', '').toLowerCase() + '-error';
  const errorElement = document.getElementById(errorId);
  
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
}

/**
 * Clear all form errors
 */
function clearFormErrors() {
  const errorElements = document.querySelectorAll('.error-message');
  const inputElements = document.querySelectorAll('#homeContactForm input, #homeContactForm textarea');
  
  errorElements.forEach(element => {
    element.textContent = '';
    element.style.display = 'none';
  });
  
  inputElements.forEach(element => {
    element.style.borderColor = '';
    element.removeAttribute('aria-invalid');
  });
}

/**
 * Validate email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Show notification
 */
function showHomeNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.home-notification');
  existingNotifications.forEach(notification => notification.remove());
  
  const notification = document.createElement('div');
  notification.className = `home-notification home-notification-${type}`;
  notification.setAttribute('role', 'alert');
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
    </div>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 90px;
    right: 20px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#3b82f6'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    max-width: 350px;
    word-wrap: break-word;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.style.transform = 'translateX(0)', 100);
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 6000);
}

/**
 * Track page view
 */
async function trackPageView(page) {
  try {
    if (window.FirebaseService?.isInitialized()) {
      await window.FirebaseService.trackPageView(page);
    }
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
}

/**
 * Initialize scroll animations
 */
function initializeScrollAnimations() {
  if (!window.IntersectionObserver || HomePage.animationObserver) return;
  
  const animationOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  HomePage.animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, 100);
        
        // Handle section-specific animations
        handleSectionAnimation(element);
        
        HomePage.animationObserver.unobserve(element);
      }
    });
  }, animationOptions);
  
  // Observe elements
  const animatedElements = document.querySelectorAll([
    '.about-paragraph',
    '.about-highlights',
    '.skills-category',
    '.contact-item'
  ].join(','));
  
  animatedElements.forEach(element => {
    HomePage.animationObserver.observe(element);
  });
}

/**
 * Handle section-specific animations
 */
function handleSectionAnimation(element) {
  if (element.classList.contains('about-highlights')) {
    startCounterAnimations();
  }
  
  if (element.classList.contains('skills-category') && !HomePage.skillsAnimated) {
    animateSkillBars();
    HomePage.skillsAnimated = true;
  }
}

/**
 * Initialize hero animation
 */
function initializeHeroAnimation() {
  const heroText = document.querySelector('.hero-text');
  const heroImage = document.querySelector('.hero-image');
  
  if (!heroText || !heroImage) return;
  
  heroText.style.opacity = '0';
  heroText.style.transform = 'translateX(-30px)';
  heroImage.style.opacity = '0';
  heroImage.style.transform = 'translateX(30px)';
  
  setTimeout(() => {
    heroText.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    heroImage.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    
    heroText.style.opacity = '1';
    heroText.style.transform = 'translateX(0)';
    heroImage.style.opacity = '1';
    heroImage.style.transform = 'translateX(0)';
  }, 300);
}

/**
 * Initialize skills animation
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
 * Animate skill bars
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
 * Initialize counter animations
 */
function initializeCounterAnimations() {
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
 */
function animateCounter(counter) {
  const startTime = Date.now();
  const startValue = counter.current;
  
  function updateCounter() {
    const now = Date.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / counter.duration, 1);
    
    const easeOut = 1 - Math.pow(1 - progress, 3);
    counter.current = Math.floor(startValue + (counter.target - startValue) * easeOut);
    
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
 * Initialize smooth scrolling
 */
function initializeSmoothScrolling() {
  const internalLinks = document.querySelectorAll('a[href^="#"]');
  
  internalLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
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
        
        setTimeout(() => {
          history.pushState(null, null, `#${targetId}`);
        }, 500);
      }
    });
  });
}

/**
 * Retry loading projects (public method)
 */
function retryLoadProjects() {
  HomePage.featuredProjectsLoaded = false;
  loadFeaturedProjectsWithRetry();
}

/**
 * Cleanup home page
 */
function cleanupHomePage() {
  if (HomePage.animationObserver) {
    HomePage.animationObserver.disconnect();
  }
  
  HomePage.isInitialized = false;
  HomePage.contactFormInitialized = false;
  HomePage.featuredProjectsLoaded = false;
  
  console.log('Home page cleaned up');
}

// Export functions for global access
window.HomePage = {
  initialize: initializeHomePage,
  cleanup: cleanupHomePage,
  retryLoadProjects: retryLoadProjects,
  loadFeaturedProjects: loadFeaturedProjectsWithRetry
};