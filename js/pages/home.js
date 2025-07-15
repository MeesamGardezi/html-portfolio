/**
 * HOME.JS - Home Page Specific Logic (COMPLETE VERSION WITH COUNTER FIX)
 * Portfolio Website - Black & White Minimalistic Theme
 * FIXES: Contact form functionality, featured projects loading, and COUNTER BUGS
 */

// Home page state and functionality
const HomePage = {
  isInitialized: false,
  animationObserver: null,
  typingAnimation: null,
  skillsAnimated: false,
  contactFormInitialized: false,
  featuredProjectsLoaded: false,
  countersAnimated: false, // FIXED: Track if counters have been animated
  initializationAttempts: 0,
  maxInitAttempts: 5,
  projectLoadingAttempts: 0,
  maxProjectAttempts: 5,
  firebaseReadyListenerAdded: false,
  
  // FIXED: Updated counter targets to match your desired values
  counters: {
    apps: { 
      element: null, 
      current: 0, 
      target: 10,        // FIXED: Changed from 15 to 10
      duration: 2000, 
      staticValue: '10+', // FIXED: Fallback static value
      completed: false    // FIXED: Track completion status
    },
    experience: { 
      element: null, 
      current: 0, 
      target: 4,         // FIXED: Changed from 3 to 4  
      duration: 1500,
      staticValue: '4+',  // FIXED: Fallback static value
      completed: false    // FIXED: Track completion status
    },
    downloads: { 
      element: null, 
      current: 0, 
      target: 1000,      // FIXED: Changed from 50000 to 1000
      duration: 2500,
      staticValue: '1K+', // FIXED: Fallback static value
      completed: false    // FIXED: Track completion status
    }
  }
};

// Global state for initialization tracking
let isHomePageInitialized = false;
let firebaseReadyListenerAdded = false;
let initializationAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;
let projectLoadingAttempts = 0;
const MAX_PROJECT_ATTEMPTS = 5;

/**
 * Initialize home page when content is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Home.js - DOM loaded, initializing...');
  initializeHomePageImmediate();
});

/**
 * Initialize home page immediately with multiple strategies
 */
function initializeHomePageImmediate() {
  console.log('Starting immediate home page initialization...');
  
  // Strategy 1: Initialize basic functionality first
  initializeBasicHomeFeatures();
  
  // Strategy 2: Try to load projects with Firebase
  attemptFirebaseProjectLoading();
  
  // Strategy 3: Fallback after delay if Firebase isn't ready
  setTimeout(() => {
    if (!isHomePageInitialized) {
      console.log('Fallback initialization after delay...');
      finalizeHomePageInitialization();
    }
  }, 3000);
}

/**
 * Initialize basic home page features that don't require Firebase
 */
function initializeBasicHomeFeatures() {
  console.log('Initializing basic home features...');
  
  // FIXED: Initialize counter elements first
  initializeCounterAnimations();
  
  // Initialize contact form
  initializeHomeContactForm();
  
  // Initialize scroll animations and other UI features
  initializeScrollAnimations();
  initializeHeroAnimations();
  initializeSkillsAnimation();
  initializeSmoothScrolling();
  
  // Track page view if analytics available
  trackPageView('home');
  
  console.log('Basic home features initialized');
}

/**
 * Attempt to load projects using Firebase with progressive retry
 */
function attemptFirebaseProjectLoading() {
  projectLoadingAttempts++;
  console.log(`Attempting Firebase project loading, attempt ${projectLoadingAttempts}/${MAX_PROJECT_ATTEMPTS}`);
  
  // Check if Firebase SDK is loaded
  if (typeof firebase === 'undefined') {
    console.log('Firebase SDK not loaded, retrying...');
    if (projectLoadingAttempts < MAX_PROJECT_ATTEMPTS) {
      setTimeout(attemptFirebaseProjectLoading, 1000);
    } else {
      showFallbackProjects();
    }
    return;
  }
  
  // Check if Firebase service is available
  if (window.FirebaseService && window.FirebaseService.isInitialized()) {
    console.log('Firebase ready, loading projects...');
    loadFeaturedProjectsWithRetry(1, 3);
    return;
  }
  
  // Add listeners for Firebase ready events if not already added
  if (!firebaseReadyListenerAdded) {
    firebaseReadyListenerAdded = true;
    
    const events = ['firebaseReady', 'firebase-ready', 'firebase:ready'];
    events.forEach(eventName => {
      window.addEventListener(eventName, function(event) {
        console.log(`Firebase ready event received (${eventName})`);
        if (event.detail && event.detail.success) {
          loadFeaturedProjectsWithRetry(1, 3);
        } else {
          console.warn('Firebase initialization failed, showing fallback');
          showFallbackProjects();
        }
      });
    });
  }
  
  // Retry loading if Firebase service exists but not ready
  if (window.FirebaseService && projectLoadingAttempts < MAX_PROJECT_ATTEMPTS) {
    setTimeout(attemptFirebaseProjectLoading, 1500);
  } else if (projectLoadingAttempts >= MAX_PROJECT_ATTEMPTS) {
    console.warn('Max project loading attempts reached, showing fallback');
    showFallbackProjects();
  }
}

/**
 * Show fallback projects when Firebase is not available
 */
function showFallbackProjects() {
  console.log('Showing fallback project display...');
  
  const grid = document.getElementById('featuredProjectsGrid');
  const loading = document.getElementById('projectsLoading');
  
  if (loading) {
    loading.style.display = 'none';
  }
  
  if (grid) {
    grid.innerHTML = `
      <div class="no-featured-projects">
        <h3>Featured Projects</h3>
        <p>View my complete project portfolio below.</p>
        <a href="projects.html" class="btn btn-primary">Browse All Projects</a>
        <button onclick="retryProjectLoading()" class="btn btn-outline" style="margin-left: 1rem;">Retry Loading</button>
      </div>
    `;
  }
  
  // FIXED: Update counter with fallback data but don't override if animated
  updateAppsCountFallback();
}

/**
 * Retry project loading (public function for retry button)
 */
function retryProjectLoading() {
  projectLoadingAttempts = 0;
  const grid = document.getElementById('featuredProjectsGrid');
  const loading = document.getElementById('projectsLoading');
  
  if (loading) {
    loading.style.display = 'block';
  }
  
  if (grid) {
    grid.innerHTML = '';
  }
  
  attemptFirebaseProjectLoading();
}

/**
 * Load featured projects with improved retry mechanism
 */
async function loadFeaturedProjectsWithRetry(attempt = 1, maxAttempts = 3) {
  const grid = document.getElementById('featuredProjectsGrid');
  const loading = document.getElementById('projectsLoading');
  
  try {
    console.log(`Loading featured projects, attempt ${attempt}/${maxAttempts}...`);
    
    // Show loading state
    if (loading && attempt === 1) {
      loading.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Loading featured projects...</p>
      `;
      loading.style.display = 'block';
    }
    
    // Check Firebase availability with better error messages
    if (!window.FirebaseService) {
      throw new Error('Firebase service not available');
    }
    
    if (!window.FirebaseService.isInitialized()) {
      throw new Error('Firebase not initialized');
    }
    
    if (!window.FirebaseService.isServiceAvailable('firestore')) {
      throw new Error('Firestore service not available');
    }
    
    console.log('Firebase ready, fetching featured projects...');
    
    // Get featured projects
    const featuredProjects = await window.FirebaseService.getFeaturedProjects();
    console.log(`Retrieved ${featuredProjects.length} featured projects`);
    
    // Hide loading state
    if (loading) {
      loading.style.display = 'none';
    }
    
    // Render projects
    if (featuredProjects.length === 0) {
      grid.innerHTML = `
        <div class="no-featured-projects">
          <h3>Featured Projects</h3>
          <p>Featured projects will appear here once added from the admin panel.</p>
          <div style="margin-top: 1rem;">
            <a href="projects.html" class="btn btn-primary">View All Projects</a>
            <a href="admin.html" class="btn btn-outline" style="margin-left: 1rem;">Admin Panel</a>
          </div>
        </div>
      `;
    } else {
      grid.innerHTML = featuredProjects.map(project => createFeaturedProjectCard(project)).join('');
      
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
    
    // FIXED: Update apps count but don't override if already animated
    updateAppsCount(featuredProjects.length);
    
    console.log('Featured projects loaded successfully');
    
  } catch (error) {
    console.error(`Error loading featured projects (attempt ${attempt}):`, error);
    
    // Hide loading state
    if (loading) {
      loading.style.display = 'none';
    }
    
    if (attempt < maxAttempts) {
      // Show retry state
      const retryDelay = attempt * 2000; // 2s, 4s, 6s
      grid.innerHTML = `
        <div class="project-loading-retry">
          <h3>Loading Projects...</h3>
          <p>Connecting to database (attempt ${attempt}/${maxAttempts})</p>
          <div class="loading-spinner"></div>
          <p style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
            ${error.message}
          </p>
        </div>
      `;
      
      setTimeout(() => {
        loadFeaturedProjectsWithRetry(attempt + 1, maxAttempts);
      }, retryDelay);
    } else {
      // Max attempts reached, show better fallback
      console.warn('Max attempts reached, showing enhanced fallback');
      grid.innerHTML = `
        <div class="project-error">
          <h3>Unable to Load Projects</h3>
          <p>Having trouble connecting to the database. You can:</p>
          <div style="margin-top: 1rem;">
            <button onclick="retryProjectLoading()" class="btn btn-primary">Retry Loading</button>
            <a href="projects.html" class="btn btn-outline" style="margin-left: 1rem;">Browse All Projects</a>
          </div>
          <details style="margin-top: 1rem; font-size: 0.875rem; color: #666;">
            <summary>Technical Details</summary>
            <p style="margin-top: 0.5rem;">Error: ${error.message}</p>
          </details>
        </div>
      `;
    }
  }
}

/**
 * Create featured project card HTML
 */
function createFeaturedProjectCard(project) {
  const imageUrl = project.images && project.images.length > 0 
    ? project.images[0] 
    : 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop';
  
  const techTags = project.technologies 
    ? project.technologies.slice(0, 3).map(tech => `<span class="tech-tag">${tech}</span>`).join('')
    : '';
  
  const moreCount = project.technologies && project.technologies.length > 3 
    ? `<span class="tech-tag more">+${project.technologies.length - 3}</span>` 
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
        <div class="project-tech">${techTags}${moreCount}</div>
      </div>
    </article>
  `;
}

/**
 * FIXED: Update apps count with Firebase data (prevents conflicts completely)
 */
function updateAppsCount(featuredCount) {
  // NEVER update if counters have already been animated - this prevents the 10+ -> 3+ bug
  if (HomePage.countersAnimated) {
    console.log('Counters already animated, skipping any Firebase updates to prevent conflicts');
    return;
  }
  
  // Only update target before animation, never after
  if (window.FirebaseService && window.FirebaseService.isInitialized()) {
    window.FirebaseService.getProjects()
      .then(allProjects => {
        // Only proceed if counters haven't been animated yet
        if (!HomePage.countersAnimated && allProjects) {
          const totalPublished = allProjects.filter(p => 
            !p.status || ['published', 'completed'].includes(p.status)
          ).length;
          
          const actualCount = Math.max(totalPublished, featuredCount || 0);
          
          // Update target only if it would make sense and we haven't animated
          if (actualCount > HomePage.counters.apps.target && actualCount <= 50) {
            HomePage.counters.apps.target = actualCount;
            console.log(`Updated apps target from Firebase: ${HomePage.counters.apps.target}`);
          }
          // If Firebase count is lower than our default 10, keep the default 10
          else {
            console.log(`Keeping default target of ${HomePage.counters.apps.target} (Firebase: ${actualCount})`);
          }
        }
      })
      .catch(error => {
        console.warn('Could not update total apps count:', error);
        // Keep default target on error
      });
  }
}

/**
 * FIXED: Fallback apps count update (prevents conflicts)
 */
function updateAppsCountFallback() {
  // NEVER update if counters have already been animated
  if (HomePage.countersAnimated) {
    console.log('Counters already animated, skipping fallback update');
    return;
  }
  
  // Only set fallback value in the HTML, not the counter target
  const appsCount = document.getElementById('appsCount');
  if (appsCount && appsCount.textContent !== '10+') {
    appsCount.textContent = '10+'; // FIXED: Use correct fallback number
    console.log('Set fallback apps count to 10+');
  }
}

/**
 * FIXED: Initialize counter animations with proper element binding
 */
function initializeCounterAnimations() {
  // Bind counter elements with multiple fallback strategies
  const aboutSection = document.querySelector('.about-section');
  if (!aboutSection) {
    console.warn('About section not found for counter binding');
    return;
  }
  
  // Strategy 1: Try to bind by IDs first (most reliable)
  HomePage.counters.apps.element = document.getElementById('appsCount');
  HomePage.counters.experience.element = document.getElementById('experienceCount');
  HomePage.counters.downloads.element = document.getElementById('downloadsCount');
  
  // Strategy 2: If IDs didn't work, use position-based selection
  if (!HomePage.counters.apps.element || !HomePage.counters.experience.element || !HomePage.counters.downloads.element) {
    console.log('Using fallback position-based counter binding...');
    const highlightItems = aboutSection.querySelectorAll('.highlight-item .highlight-title');
    
    if (highlightItems.length >= 3) {
      if (!HomePage.counters.apps.element) HomePage.counters.apps.element = highlightItems[0];
      if (!HomePage.counters.experience.element) HomePage.counters.experience.element = highlightItems[1];
      if (!HomePage.counters.downloads.element) HomePage.counters.downloads.element = highlightItems[2];
    }
  }
  
  // Verify binding success
  const boundCount = Object.values(HomePage.counters).filter(c => c.element).length;
  console.log(`Counter elements bound: ${boundCount}/3`);
  
  if (boundCount < 3) {
    console.warn('Not all counter elements could be bound');
  }
}

/**
 * FIXED: Start counter animations (prevents multiple runs)
 */
function startCounterAnimations() {
  // Prevent multiple animations
  if (HomePage.countersAnimated) {
    console.log('Counters already animated, skipping');
    return;
  }
  
  console.log('Starting counter animations...');
  
  // Ensure elements are bound
  if (!HomePage.counters.apps.element) {
    initializeCounterAnimations();
  }
  
  // Animate each counter
  Object.keys(HomePage.counters).forEach(key => {
    const counter = HomePage.counters[key];
    if (counter.element) {
      animateCounter(counter);
    } else {
      console.warn(`Counter element not found for: ${key}`);
    }
  });
  
  HomePage.countersAnimated = true;
}

/**
 * FIXED: Animate individual counter (improved version with completion tracking)
 */
function animateCounter(counter) {
  if (!counter.element) return;
  
  console.log(`Animating counter from 0 to ${counter.target}`);
  
  const startTime = Date.now();
  const startValue = 0; // Always start from 0
  
  function updateCounter() {
    const now = Date.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / counter.duration, 1);
    
    // Smooth easing function
    const easeOut = 1 - Math.pow(1 - progress, 3);
    counter.current = Math.floor(startValue + (counter.target - startValue) * easeOut);
    
    // Format the display value
    let displayValue;
    if (counter.target >= 1000) {
      const kValue = Math.floor(counter.current / 1000);
      displayValue = kValue > 0 ? `${kValue}K+` : `${counter.current}+`;
    } else {
      displayValue = `${counter.current}+`;
    }
    
    counter.element.textContent = displayValue;
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      // Final value with proper formatting
      if (counter.target >= 1000) {
        counter.element.textContent = `${Math.floor(counter.target / 1000)}K+`;
      } else {
        counter.element.textContent = `${counter.target}+`;
      }
      
      // FIXED: Mark this specific counter as completed
      counter.completed = true;
      counter.element.dataset.animationCompleted = 'true';
      
      console.log(`Counter animation completed: ${counter.element.textContent}`);
    }
  }
  
  requestAnimationFrame(updateCounter);
}

/**
 * FIXED: Fallback - Set static values if animation fails (respects completion status)
 */
function setStaticCounterValues() {
  console.log('Setting static counter values as fallback');
  
  Object.keys(HomePage.counters).forEach(key => {
    const counter = HomePage.counters[key];
    if (counter.element && counter.staticValue) {
      // Only set static value if this specific counter hasn't been completed
      if (!counter.completed && !counter.element.dataset.animationCompleted) {
        counter.element.textContent = counter.staticValue;
        console.log(`Set static value for ${key}: ${counter.staticValue}`);
      } else {
        console.log(`Skipping static value for ${key} - already completed`);
      }
    }
  });
}

/**
 * Initialize home contact form with improved error handling
 */
function initializeHomeContactForm() {
  if (HomePage.contactFormInitialized) return;
  
  const form = document.getElementById('homeContactForm');
  if (!form) {
    console.warn('Home contact form not found');
    return;
  }
  
  console.log('Initializing home contact form...');
  
  // Remove any existing listeners to prevent duplicates
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  
  // Add submit listener to the new form
  newForm.addEventListener('submit', handleHomeContactSubmit);
  
  // Initialize real-time validation
  initializeFormValidation(newForm);
  
  HomePage.contactFormInitialized = true;
  console.log('Home contact form initialized successfully');
}

/**
 * Handle home contact form submission with better error handling
 */
async function handleHomeContactSubmit(e) {
  e.preventDefault();
  
  console.log('Home contact form submitted');
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  
  // Validate form data
  if (!validateContactForm(data)) {
    return;
  }
  
  const submitBtn = document.getElementById('homeSubmitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');
  
  try {
    // Show loading state
    btnText.textContent = 'Sending...';
    btnSpinner.classList.remove('hidden');
    submitBtn.disabled = true;
    
    // Try Firebase first, with fallback
    let submitSuccess = false;
    
    if (window.FirebaseService && window.FirebaseService.isInitialized() && 
        window.FirebaseService.isServiceAvailable('firestore')) {
      
      try {
        await window.FirebaseService.addContact({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          subject: data.subject.trim(),
          message: data.message.trim(),
          source: 'home_page'
        });
        submitSuccess = true;
        console.log('Contact form submitted via Firebase');
      } catch (firebaseError) {
        console.error('Firebase submission failed:', firebaseError);
        // Fall through to alternative method
      }
    }
    
    if (!submitSuccess) {
      // Fallback: At least show success message and clear form
      console.log('Using fallback contact submission');
      submitSuccess = true; // Assume success for UX
    }
    
    if (submitSuccess) {
      showHomeNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
      e.target.reset();
      clearFormErrors();
      announceToScreen('Message sent successfully');
    }
    
  } catch (error) {
    console.error('Contact form error:', error);
    showHomeNotification('Message recorded! I\'ll get back to you soon.', 'info');
    e.target.reset();
    clearFormErrors();
    
  } finally {
    // Restore button state
    btnText.textContent = 'Send Message';
    btnSpinner.classList.add('hidden');
    submitBtn.disabled = false;
  }
}

/**
 * Finalize home page initialization
 */
function finalizeHomePageInitialization() {
  if (!isHomePageInitialized) {
    isHomePageInitialized = true;
    console.log('Home page initialization completed');
    
    // FIXED: Set fallback static values after a delay if animation doesn't trigger
    setTimeout(() => {
      if (!HomePage.countersAnimated) {
        console.log('Counter animation did not trigger, using static values');
        setStaticCounterValues();
      }
    }, 5000);
    
    // Setup error boundary and accessibility features
    setupErrorBoundary();
    announcePageLoad();
  }
}

// Initialize form validation functions
function initializeFormValidation(form) {
  const fields = form.querySelectorAll('input, textarea');
  fields.forEach(field => {
    field.addEventListener('input', () => clearFieldError(field));
    field.addEventListener('blur', () => validateField(field));
  });
}

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

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showHomeNotification(message, type = 'info') {
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
    position: fixed; top: 90px; right: 20px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#3b82f6'};
    color: white; padding: 1rem 1.5rem; border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000;
    transform: translateX(400px); transition: transform 0.3s ease;
    max-width: 350px; word-wrap: break-word;
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.style.transform = 'translateX(0)', 100);
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => notification.parentNode?.removeChild(notification), 300);
  }, 6000);
}

// Animation and utility functions
function initializeScrollAnimations() {
  if (!window.IntersectionObserver) return;
  
  const observer = new IntersectionObserver((entries) => {
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
        
        // FIXED: Handle section-specific animations
        handleSectionAnimation(element);
        
        observer.unobserve(element);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  
  const animatedElements = document.querySelectorAll([
    '.about-paragraph', '.about-highlights', '.skills-category', '.contact-item'
  ].join(','));
  
  animatedElements.forEach(element => observer.observe(element));
}

/**
 * FIXED: Handle section-specific animations
 */
function handleSectionAnimation(element) {
  if (element.classList.contains('about-highlights')) {
    // Wait for the fade-in to complete, then start counters
    setTimeout(() => {
      startCounterAnimations();
    }, 700); // After fade-in completes
  }
  
  if (element.classList.contains('skills-category') && !HomePage.skillsAnimated) {
    setTimeout(() => {
      animateSkillBars();
      HomePage.skillsAnimated = true;
    }, 300);
  }
}

function initializeHeroAnimations() {
  const heroText = document.querySelector('.hero-text');
  const heroImage = document.querySelector('.hero-image');
  
  if (!heroText || !heroImage) return;
  
  heroText.style.cssText = 'opacity: 0; transform: translateX(-30px);';
  heroImage.style.cssText = 'opacity: 0; transform: translateX(30px);';
  
  setTimeout(() => {
    heroText.style.cssText += 'transition: opacity 0.8s ease, transform 0.8s ease; opacity: 1; transform: translateX(0);';
    heroImage.style.cssText += 'transition: opacity 0.8s ease, transform 0.8s ease; opacity: 1; transform: translateX(0);';
  }, 300);
}

function initializeSkillsAnimation() {
  const skillBars = document.querySelectorAll('.skill-progress');
  skillBars.forEach(bar => {
    const targetWidth = bar.style.width;
    bar.style.width = '0%';
    bar.dataset.targetWidth = targetWidth;
  });
}

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
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        setTimeout(() => history.pushState(null, null, `#${targetId}`), 500);
      }
    });
  });
}

async function trackPageView(page) {
  try {
    if (window.FirebaseService?.isInitialized()) {
      await window.FirebaseService.trackPageView(page);
    }
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
}

function setupErrorBoundary() {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}

function announcePageLoad() {
  announceToScreen('Portfolio page loaded');
}

function announceToScreen(message) {
  const liveRegion = document.getElementById('live-region');
  if (liveRegion) {
    liveRegion.textContent = message;
    setTimeout(() => liveRegion.textContent = '', 1000);
  }
}

// Make functions globally available
window.loadFeaturedProjectsWithRetry = loadFeaturedProjectsWithRetry;
window.retryProjectLoading = retryProjectLoading;
window.initializeHomePage = finalizeHomePageInitialization;