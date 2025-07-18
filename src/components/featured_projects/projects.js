// components/projects/projects.js

/**
 * PROJECTS COMPONENT - JavaScript Functionality
 * Handles featured projects loading, rendering, and interactions
 */

class ProjectsComponent {
  constructor() {
    this.isInitialized = false;
    this.projectsElement = null;
    this.projectsGrid = null;
    this.loadingElement = null;
    this.errorElement = null;
    this.emptyElement = null;
    this.retryButton = null;
    this.eventListeners = [];
    this.projects = [];
    this.isLoading = false;
    this.maxRetries = 3;
    this.retryCount = 0;
    this.loadingTimeout = null;
  }

  /**
   * Initialize the projects component
   */
  init() {
    if (this.isInitialized) {
      console.warn('Projects component already initialized');
      return;
    }

    try {
      // Cache DOM elements
      this.cacheElements();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Load projects
      this.loadProjects();
      
      this.isInitialized = true;
      console.log('Projects component initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize projects component:', error);
      this.showError('Failed to initialize projects component');
    }
  }

  /**
   * Cache frequently used DOM elements
   */
  cacheElements() {
    this.projectsElement = document.querySelector('.featured-projects-section');
    this.projectsGrid = document.getElementById('featuredProjectsGrid');
    this.loadingElement = document.getElementById('projectsLoading');
    this.errorElement = document.getElementById('projectsError');
    this.emptyElement = document.getElementById('projectsEmpty');
    this.retryButton = document.getElementById('retryProjectsBtn');
    
    if (!this.projectsElement || !this.projectsGrid) {
      throw new Error('Required projects elements not found');
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Retry button
    if (this.retryButton) {
      const retryHandler = () => {
        this.retryCount = 0;
        this.loadProjects();
      };
      
      this.retryButton.addEventListener('click', retryHandler);
      this.eventListeners.push({
        element: this.retryButton,
        event: 'click',
        handler: retryHandler
      });
    }

    // Window resize handler
    const resizeHandler = this.debounce(() => {
      this.handleResize();
    }, 250);
    
    window.addEventListener('resize', resizeHandler);
    this.eventListeners.push({
      element: window,
      event: 'resize',
      handler: resizeHandler
    });

    // Intersection observer for animations
    this.setupIntersectionObserver();
  }

  /**
   * Setup intersection observer for scroll animations
   */
  setupIntersectionObserver() {
    if (!window.IntersectionObserver) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          this.animateElement(element);
          this.intersectionObserver.unobserve(element);
        }
      });
    }, observerOptions);

    // Initially observe the section
    this.intersectionObserver.observe(this.projectsElement);
  }

  /**
   * Animate element when it becomes visible
   */
  animateElement(element) {
    element.classList.add('animated');
    
    // Trigger card animations if projects are loaded
    if (this.projects.length > 0) {
      this.animateProjectCards();
    }
  }

  /**
   * Load projects from data source with retry mechanism
   */
  async loadProjects() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.showLoading();
    
    let attempt = 1;
    const maxAttempts = this.maxRetries;
    
    while (attempt <= maxAttempts) {
      try {
        console.log(`Loading featured projects, attempt ${attempt}/${maxAttempts}...`);
        
        // Update loading message for retry attempts
        if (attempt > 1) {
          this.updateLoadingMessage(`Connecting to database (attempt ${attempt}/${maxAttempts})`);
        }
        
        // Set loading timeout
        this.loadingTimeout = setTimeout(() => {
          if (this.isLoading) {
            console.warn('Project loading taking longer than expected');
            this.updateLoadingMessage('Loading is taking longer than expected...');
          }
        }, 5000);

        // Load projects data with Firebase integration
        const projects = await this.fetchProjects();
        
        // Filter featured projects
        const featuredProjects = projects.filter(project => project.featured);
        
        // Store projects
        this.projects = featuredProjects;
        
        // Clear loading timeout
        if (this.loadingTimeout) {
          clearTimeout(this.loadingTimeout);
          this.loadingTimeout = null;
        }
        
        // Render projects
        if (featuredProjects.length === 0) {
          this.showEmpty();
        } else {
          this.renderProjects(featuredProjects);
        }
        
        // Update apps count if callback exists
        if (typeof window.updateAppsCount === 'function') {
          window.updateAppsCount(featuredProjects.length);
        }
        
        this.isLoading = false;
        this.retryCount = 0; // Reset retry count on success
        return; // Success - exit retry loop
        
      } catch (error) {
        console.error(`Error loading projects (attempt ${attempt}):`, error);
        
        // Clear loading timeout
        if (this.loadingTimeout) {
          clearTimeout(this.loadingTimeout);
          this.loadingTimeout = null;
        }
        
        // If this is the last attempt, show error
        if (attempt >= maxAttempts) {
          this.isLoading = false;
          this.showError(`Unable to load projects: ${error.message}`);
          return;
        }
        
        // Prepare for retry
        attempt++;
        this.retryCount = attempt - 1;
        const retryDelay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff: 1s, 2s, 4s
        
        console.log(`Retrying in ${retryDelay}ms...`);
        this.updateLoadingMessage(`Retrying in ${Math.ceil(retryDelay / 1000)}s...`);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  /**
   * Update loading message
   */
  updateLoadingMessage(message) {
    if (this.loadingElement) {
      const loadingText = this.loadingElement.querySelector('p');
      if (loadingText) {
        loadingText.textContent = message;
      }
    }
  }

  /**
   * Fetch projects from data source with Firebase integration
   */
  async fetchProjects() {
    // Try Firebase first (priority)
    if (window.FirebaseService) {
      try {
        console.log('Attempting Firebase project loading...');
        
        // Check Firebase initialization
        if (!window.FirebaseService.isInitialized()) {
          console.warn('Firebase not initialized, attempting initialization...');
          // Try to initialize Firebase if not already done
          if (window.initializeFirebase) {
            await window.initializeFirebase();
          }
        }
        
        // Check if Firestore service is available
        if (window.FirebaseService.isServiceAvailable && 
            window.FirebaseService.isServiceAvailable('firestore')) {
          
          console.log('Firebase ready, fetching featured projects...');
          const featuredProjects = await window.FirebaseService.getFeaturedProjects();
          console.log(`Retrieved ${featuredProjects.length} featured projects from Firebase`);
          
          if (featuredProjects.length > 0) {
            return featuredProjects;
          }
        } else {
          console.warn('Firestore service not available');
        }
      } catch (error) {
        console.warn('Firebase project loading failed:', error.message);
        // Continue to fallback methods
      }
    }

    // Try to get projects from global data
    if (window.projectsData && Array.isArray(window.projectsData)) {
      console.log('Using global projects data');
      return window.projectsData;
    }

    // Try to load from API or external source
    if (window.API_BASE_URL) {
      try {
        console.log('Attempting API project loading...');
        const response = await fetch(`${window.API_BASE_URL}/projects`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const projects = await response.json();
        console.log(`Retrieved ${projects.length} projects from API`);
        return projects;
      } catch (error) {
        console.warn('API project loading failed:', error.message);
      }
    }

    // Final fallback: return sample data
    console.log('Using sample projects data as fallback');
    return this.getSampleProjects();
  }

  /**
   * Get sample projects for fallback with enhanced data
   */
  getSampleProjects() {
    return [
      {
        id: 'flutter-ecommerce-app',
        title: 'Flutter E-Commerce App',
        description: 'A complete e-commerce mobile application built with Flutter and Firebase, featuring user authentication, product catalog, shopping cart, payment integration with Stripe, and real-time order tracking.',
        technologies: ['Flutter', 'Dart', 'Firebase', 'Stripe', 'Google Maps'],
        images: [
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop'
        ],
        featured: true,
        status: 'published',
        category: 'mobile',
        createdAt: new Date('2024-01-15'),
        downloads: 1500,
        rating: 4.5,
        viewCount: 2340,
        developmentTime: '3 months',
        platform: 'iOS & Android',
        teamSize: 2
      },
      {
        id: 'task-management-app',
        title: 'Task Management App',
        description: 'A productivity app for managing tasks and projects with team collaboration features, real-time updates, file sharing, and advanced analytics built using Flutter and Node.js backend.',
        technologies: ['Flutter', 'Node.js', 'MongoDB', 'Socket.io', 'Express'],
        images: [
          'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop'
        ],
        featured: true,
        status: 'published',
        category: 'mobile',
        createdAt: new Date('2024-02-20'),
        downloads: 850,
        rating: 4.2,
        viewCount: 1567,
        developmentTime: '4 months',
        platform: 'Cross-platform',
        teamSize: 3
      },
      {
        id: 'fitness-tracker',
        title: 'Fitness Tracker',
        description: 'A comprehensive fitness tracking application with workout plans, progress tracking, nutrition logging, social features for motivation, and integration with popular fitness devices.',
        technologies: ['Flutter', 'Python', 'SQLite', 'REST API', 'Health Kit'],
        images: [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&h=400&fit=crop'
        ],
        featured: true,
        status: 'beta',
        category: 'mobile',
        createdAt: new Date('2024-03-10'),
        downloads: 520,
        rating: 4.0,
        viewCount: 987,
        developmentTime: '2.5 months',
        platform: 'iOS & Android',
        teamSize: 1
      }
    ];
  }
  
  /**
   * Attempt Firebase project loading (compatibility method)
   */
  attemptFirebaseProjectLoading() {
    console.log('Attempting Firebase project loading...');
    return this.loadProjects();
  }
  
  /**
   * Load featured projects with retry (compatibility method)
   */
  loadFeaturedProjectsWithRetry(attempt = 1, maxAttempts = 3) {
    this.retryCount = attempt - 1;
    this.maxRetries = maxAttempts;
    return this.loadProjects();
  }

  /**
   * Render projects in the grid
   */
  renderProjects(projects) {
    this.hideAllStates();
    
    // Clear existing content
    this.projectsGrid.innerHTML = '';
    
    // Create project cards
    projects.forEach((project, index) => {
      const card = this.createProjectCard(project, index);
      this.projectsGrid.appendChild(card);
    });
    
    // Show the grid
    this.projectsGrid.style.display = 'grid';
    
    // Animate cards
    this.animateProjectCards();
  }

  /**
   * Create individual project card
   */
  createProjectCard(project, index) {
    const card = document.createElement('article');
    card.className = `project-card ${project.featured ? 'featured' : ''}`;
    card.setAttribute('role', 'listitem');
    card.setAttribute('data-project-id', project.id);
    
    // Set animation delay
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Get image URL
    const imageUrl = project.images && project.images.length > 0 
      ? project.images[0] 
      : 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop';
    
    // Create tech tags
    const techTags = project.technologies 
      ? project.technologies.map(tech => `<span class="tech-tag">${this.escapeHtml(tech)}</span>`).join('')
      : '';
    
    // Format date
    const formattedDate = project.createdAt 
      ? this.formatDate(project.createdAt) 
      : 'Unknown date';
    
    // Format status
    const statusClass = project.status ? project.status.replace('-', '') : 'published';
    const statusText = project.status ? this.capitalizeFirst(project.status.replace('-', ' ')) : 'Published';
    
    // Create stats
    const stats = [];
    if (project.downloads) {
      stats.push(`<span class="project-downloads">📱 ${this.formatNumber(project.downloads)}</span>`);
    }
    if (project.rating) {
      stats.push(`<span class="project-rating">⭐ ${project.rating}</span>`);
    }
    
    card.innerHTML = `
      <div class="project-image">
        <img src="${imageUrl}" alt="${this.escapeHtml(project.title)}" loading="lazy" 
             onerror="this.src='https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop'">
        <div class="project-overlay">
          <a href="project-detail.html?id=${encodeURIComponent(project.id)}" class="project-link">View Details</a>
        </div>
      </div>
      <div class="project-content">
        <h3 class="project-title">${this.escapeHtml(project.title)}</h3>
        <p class="project-description">${this.escapeHtml(project.description)}</p>
        <div class="project-tech">${techTags}</div>
        <div class="project-meta">
          <span class="project-date">${formattedDate}</span>
          <span class="project-status ${statusClass}">${statusText}</span>
        </div>
        ${stats.length > 0 ? `<div class="project-stats">${stats.join('')}</div>` : ''}
      </div>
    `;
    
    return card;
  }

  /**
   * Animate project cards
   */
  animateProjectCards() {
    const cards = this.projectsGrid.querySelectorAll('.project-card');
    
    cards.forEach((card, index) => {
      // Reset animation
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      // Trigger animation
      setTimeout(() => {
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 150);
    });
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.hideAllStates();
    if (this.loadingElement) {
      this.loadingElement.style.display = 'flex';
    }
  }

  /**
   * Show error state with enhanced fallback
   */
  showError(message) {
    this.hideAllStates();
    
    // Enhanced error display with fallback options
    this.projectsGrid.innerHTML = `
      <div class="project-error">
        <div class="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3 class="error-title">Unable to Load Projects</h3>
        <p class="error-message">${message}</p>
        <div class="error-actions">
          <button class="btn btn-primary" onclick="window.projectsComponent?.refresh()">Retry Loading</button>
          <a href="projects.html" class="btn btn-outline">Browse All Projects</a>
          <a href="admin.html" class="btn btn-outline" style="margin-left: 1rem;">Admin Panel</a>
        </div>
        <details style="margin-top: 1rem; font-size: 0.875rem; color: #666;">
          <summary>Technical Details</summary>
          <p style="margin-top: 0.5rem;">
            <strong>Error:</strong> ${message}<br>
            <strong>Attempts:</strong> ${this.retryCount + 1}/${this.maxRetries}<br>
            <strong>Firebase Available:</strong> ${!!window.FirebaseService}<br>
            <strong>Firestore Available:</strong> ${this.checkFirestoreAvailability()}
          </p>
        </details>
      </div>
    `;
  }
  
  /**
   * Check Firestore availability
   */
  checkFirestoreAvailability() {
    try {
      return window.FirebaseService && 
             window.FirebaseService.isServiceAvailable && 
             window.FirebaseService.isServiceAvailable('firestore');
    } catch (error) {
      return false;
    }
  }

  /**
   * Show empty state with enhanced options
   */
  showEmpty() {
    this.hideAllStates();
    
    // Enhanced empty state with admin panel link
    this.projectsGrid.innerHTML = `
      <div class="project-empty">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="12" x2="15" y2="12"/>
            <line x1="12" y1="9" x2="12" y2="15"/>
          </svg>
        </div>
        <h3 class="empty-title">Featured Projects</h3>
        <p class="empty-message">Featured projects will appear here once added from the admin panel.</p>
        <div class="empty-actions">
          <a href="projects.html" class="btn btn-primary">View All Projects</a>
          <a href="admin.html" class="btn btn-outline">Admin Panel</a>
        </div>
      </div>
    `;
  }

  /**
   * Hide all states
   */
  hideAllStates() {
    if (this.loadingElement) this.loadingElement.style.display = 'none';
    if (this.errorElement) this.errorElement.style.display = 'none';
    if (this.emptyElement) this.emptyElement.style.display = 'none';
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Recalculate grid layout if needed
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      this.projectsElement.classList.add('mobile-view');
    } else {
      this.projectsElement.classList.remove('mobile-view');
    }
  }

  /**
   * Update projects data
   */
  updateProjects(projects) {
    this.projects = projects.filter(project => project.featured);
    this.renderProjects(this.projects);
  }

  /**
   * Refresh projects
   */
  refresh() {
    this.retryCount = 0;
    this.loadProjects();
  }

  /**
   * Utility function to escape HTML
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Format date
   */
  formatDate(date) {
    if (!date) return 'Unknown date';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Unknown date';
    
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format number
   */
  formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  /**
   * Capitalize first letter
   */
  capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Debounce function
   */
  debounce(func, wait) {
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
   * Cleanup component resources
   */
  destroy() {
    // Remove event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      if (element && typeof element.removeEventListener === 'function') {
        element.removeEventListener(event, handler);
      }
    });
    this.eventListeners = [];

    // Disconnect observers
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    // Clear timeouts
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }

    // Reset state
    this.isInitialized = false;
    this.projectsElement = null;
    this.projectsGrid = null;
    this.projects = [];
    this.isLoading = false;

    console.log('Projects component destroyed');
  }

  /**
   * Get component state for debugging
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      isLoading: this.isLoading,
      projectsCount: this.projects.length,
      retryCount: this.retryCount,
      hasProjectsElement: !!this.projectsElement,
      hasIntersectionObserver: !!this.intersectionObserver,
      eventListenerCount: this.eventListeners.length
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectsComponent;
} else {
  window.ProjectsComponent = ProjectsComponent;
}

// Global function compatibility for existing code
window.retryProjectLoading = function() {
  if (window.projectsComponent) {
    window.projectsComponent.refresh();
  }
};

window.loadFeaturedProjects = function() {
  if (window.projectsComponent) {
    return window.projectsComponent.loadProjects();
  }
};

window.loadFeaturedProjectsWithRetry = function(attempt = 1, maxAttempts = 3) {
  if (window.projectsComponent) {
    return window.projectsComponent.loadFeaturedProjectsWithRetry(attempt, maxAttempts);
  }
};

window.attemptFirebaseProjectLoading = function() {
  if (window.projectsComponent) {
    return window.projectsComponent.attemptFirebaseProjectLoading();
  }
};

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.featured-projects-section')) {
      const projects = new ProjectsComponent();
      projects.init();
      
      // Make available globally for debugging and compatibility
      window.projectsComponent = projects;
      
      // Initialize Firebase integration if available
      if (window.FirebaseService && window.FirebaseService.onReady) {
        window.FirebaseService.onReady(() => {
          console.log('Firebase ready, refreshing projects...');
          projects.refresh();
        });
      }
    }
  });
} else {
  // DOM already loaded
  if (document.querySelector('.featured-projects-section')) {
    const projects = new ProjectsComponent();
    projects.init();
    window.projectsComponent = projects;
    
    // Initialize Firebase integration if available
    if (window.FirebaseService && window.FirebaseService.onReady) {
      window.FirebaseService.onReady(() => {
        console.log('Firebase ready, refreshing projects...');
        projects.refresh();
      });
    }
  }
}